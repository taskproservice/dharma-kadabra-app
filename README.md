# dharma-kadabra-app

Plataforma digital diseñada para acercar la sabiduría espiritual ancestral al mundo moderno.

## Integración del sistema

Esta versión reúne los cambios de ambas ramas, conservando sus commits en el historial:

- `arena/09a74da0-dharma-kadabra-app` (`9db4ca0`): navegación por roles, módulo de redes sociales y animación Cozy Fire.
- `arena/edb80ff0-dharma-kadabra-app` (`5c464ee`): reservas, calendario de eventos y Mi Cuenta.

Los contratos de Prisma se regeneran desde el esquema combinado con `npx prisma contract emit`. El cliente de Prisma se genera desde `prisma/schema.prisma` en `src/generated/prisma`; `postinstall` y `npm run build` ejecutan la generación resiliente de `scripts/db-sync.mjs`. No se versionan clientes generados ni archivos de compilación.

## Seguridad y control de acceso (RBAC)

- **Equipo (dashboard):** inicia sesión en `/login` con NextAuth (Credentials + JWT cifrado, 8 h). El rol (`ADMIN`, `ENGINEER`, `MARKETING`, `COLLABORATOR`) se guarda en el modelo `User` y viaja dentro del token; ya no se acepta desde query params, cabeceras ni cookies.
- **Clientes:** usan su cuenta de `/mi-cuenta` (cookie firmada `HttpOnly`) y se tratan como rol `CLIENT`.
- **API:** cada handler de `app/api/` llama a `authorize(recurso, método)` de `lib/rbac.ts`. Sin sesión → `401`; rol sin permiso → `403`. La matriz de permisos está en `API_PERMISSIONS` (`lib/rbac-config.ts`) y deniega por defecto. En cada petición, el rol del equipo se vuelve a validar contra la base de datos, de modo que desactivar una cuenta tiene efecto inmediato.
- Excepciones deliberadas: `/api/auth/*` (NextAuth) y `/api/customer-auth`, porque son los endpoints que emiten la sesión. `GET /api/cron/notifications` acepta `Authorization: Bearer $CRON_SECRET` (Vercel Cron) o una sesión ADMIN.
- **Selector de roles:** solo aparece si la sesión es `ADMIN` y sirve únicamente para previsualizar la navegación de otro rol (cookie `dk_role_preview`). La API siempre autoriza con el rol real.

Crear o actualizar una cuenta del equipo (la contraseña se lee desde el entorno, no desde argumentos CLI):

```bash
read -r -s -p 'Contraseña temporal para la cuenta: ' STAFF_PASSWORD
printf '\n'
export STAFF_PASSWORD
node scripts/create-staff-user.mjs --email paola@dharmakadabra.com --name "Paola Hernández" --role ADMIN
unset STAFF_PASSWORD

# Desactivar una cuenta:
node scripts/create-staff-user.mjs --email persona@dominio.com --deactivate
```

`STAFF_PASSWORD` debe tener entre 12 y 128 caracteres. El script solo permite roles de equipo (`ADMIN`, `ENGINEER`, `COLLABORATOR`, `MARKETING`); las cuentas de clientes se guardan en `Customer`. Las funciones persistentes requieren PostgreSQL: no hay un administrador general en memoria cuando falta `DATABASE_URL`.

## Reservas, eventos y cuentas de cliente

- Reservar requiere sesión (cuenta de cliente o equipo autorizado). Para clientes, el correo y la cuenta de la cita salen de la sesión, no del formulario.
- Toda cita nueva se crea con `status: PENDING` y `depositPaid: false`. Solo el webhook del procesador de pagos (Stripe u otro, pendiente de integrar) debe marcar el anticipo como pagado y confirmar la cita. **Todavía no se procesan cargos reales.**
- La verificación de disponibilidad y la creación/reagenda de la cita se ejecutan en una transacción de Prisma con aislamiento `Serializable` (`lib/booking.ts`). Si dos personas reservan el mismo horario a la vez, una transacción se aborta y la segunda reserva recibe `409`.
- El calendario mensual de `/dashboard/eventos` administra los rituales especiales y los productos asociados.
- Las cuentas de clientes se sirven en `/mi-cuenta`; las contraseñas se derivan con scrypt y la cookie de sesión está firmada, es `HttpOnly` y `SameSite=Lax`.
- Los productos y audios comprados se consultan desde `Purchase` y `AudioPurchase`. La integración de checkout deberá crear esos registros cuando se habilite la compra en línea.

### Agenda Digital por terapeuta

- `GET /api/collaborators` es **público** y devuelve el equipo agendable: cuentas activas con rol `ADMIN` (Paola) o `COLLABORATOR` (terapeutas). Solo expone `{ id, name, role, avatarUrl }`; el correo y el hash nunca salen del servidor. El retrato se resuelve por nombre desde `lib/data/collaborators.ts` (`lib/therapists.ts`).
- `GET /api/availability?month=YYYY-MM&assigneeId=<id>` resta **solo** las citas (`PENDING`/`CONFIRMED`) de esa persona. Sin `assigneeId` (o con `assigneeId=all`) se usa la disponibilidad de toda la casa. Un `assigneeId` con formato inválido responde `400`.
- `POST /api/appointments` acepta `assigneeId` tanto para clientes como para el equipo; se valida que sea una cuenta activa con rol agendable. `PATCH /api/appointments/:id` reevalúa el choque de horario dentro de la agenda del terapeuta original.
- El conflicto de horario (`lib/booking.ts`) se evalúa por agenda: dos terapeutas pueden tener sesión a la misma hora, una misma persona no. La transacción `Serializable` toma además un advisory lock de PostgreSQL por `assigneeId`, de modo que dos reservas simultáneas del mismo terapeuta se serializan aunque la tabla todavía no tenga un índice único.
- En la UI (`components/landing/digital-agenda.tsx` + `components/agenda/therapist-selector.tsx`), el paso «¿Con quién deseas tu sesión?» muestra radios con avatar arriba del calendario; el panel de reserva y el `BookingDialog` propagan el terapeuta elegido.

### Configuración de producción

Configura `DATABASE_URL` para la aplicación y `DATABASE_URL_UNPOOLED` para tareas de migración, además de `AUTH_SECRET` y `CRON_SECRET`. Genera `AUTH_SECRET` como valor aleatorio largo (por ejemplo, `openssl rand -base64 32`). Define `NEXTAUTH_URL` fuera de Vercel o cuando necesites fijar el dominio canónico. Ejecuta los comandos con las variables exportadas en el entorno seguro correspondiente.

Una vez que la base tenga el baseline correcto, aplica migraciones y compila con:

```bash
npm ci
npx prisma migrate deploy --schema prisma/schema.prisma
npm run build
```

No ejecutes `migrate deploy` directamente sobre una base vacía: la primera migración actual presupone que ya existe `Appointment`. Para el bootstrap de una base vacía o la reconciliación segura de una base existente, sigue [`docs/database-bootstrap.md`](docs/database-bootstrap.md). No se aplica schema ni se ejecuta seed durante `npm run build`.

La migración de reservas, clientes, productos y eventos está en `prisma/migrations/20261119000000_booking_customers_rituals/`. El proyecto no tiene una base de datos general en memoria: algunas páginas públicas degradan con datos alternativos, pero reservas, cuentas, catálogo persistente y administración requieren PostgreSQL.

### Verificación local de configuración

Con Node.js y dependencias instaladas, ejecuta:

```bash
npm run config:verify
```

Por defecto verifica Production. Si no existe `.env.production.local`, el script la descarga desde Vercel con `vercel env pull`; requiere que Vercel CLI esté autenticado y el proyecto enlazado. Si el archivo ya existe, lo reutiliza y no lo sobrescribe. Para actualizarlo, respáldalo y elimínalo antes de volver a ejecutar. El archivo está excluido por `.gitignore`; el script verifica esa condición y nunca imprime los valores.

Después de crear la rama `staging` y configurar variables Preview:

```bash
npm run config:verify -- --environment=staging
```

Para imprimir también los nombres de columnas del schema (sin filas de datos):

```bash
npm run config:verify -- --schema-details
```

La verificación consulta presencia de variables, `prisma migrate status`, `SELECT 1`, tablas y el registro de migraciones. No ejecuta `db push`, `migrate deploy` ni `migrate resolve`.

### Página de Lectura de Runas

`app/servicios/runas` usa `Cormorant Garamond` de `next/font/google` únicamente en sus títulos; el cuerpo hereda `Inter` del layout. Para que el build funcione también sin acceso a `fonts.googleapis.com`, `next.config.js` activa un mock local con la misma fuente (SIL OFL 1.1) incluida en `config/fonts/`. Los glifos del Elder Futhark se sirven desde `public/fonts/` con Noto Sans Runic (SIL OFL 1.1).
