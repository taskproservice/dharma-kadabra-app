# dharma-kadabra-app

Plataforma digital diseñada para acercar la sabiduría espiritual ancestral al mundo moderno.

## Integración del sistema

Esta versión reúne los cambios de ambas ramas, conservando sus commits en el historial:

- `arena/09a74da0-dharma-kadabra-app` (`9db4ca0`): navegación por roles, módulo de redes sociales y animación Cozy Fire.
- `arena/edb80ff0-dharma-kadabra-app` (`5c464ee`): reservas, calendario de eventos y Mi Cuenta.

Los contratos de Prisma se regeneran desde el esquema combinado con `npx prisma contract emit`. `npm run generate:client` genera el cliente real de Prisma 6 en `node_modules`, compatible con el import de `@prisma/client`; no se versionan clientes simulados ni archivos de compilación.

## Seguridad y control de acceso (RBAC)

- **Equipo (dashboard):** inicia sesión en `/login` con NextAuth (Credentials + JWT cifrado, 8 h). El rol (`ADMIN`, `ENGINEER`, `SOCIAL_MEDIA`, `COLLABORATOR`) se guarda en el modelo `User` y viaja dentro del token; ya no se acepta desde query params, cabeceras ni cookies.
- **Clientes:** usan su cuenta de `/mi-cuenta` (cookie firmada `HttpOnly`) y se tratan como rol `CLIENT`.
- **API:** cada handler de `app/api/` llama a `authorize(recurso, método)` de `lib/rbac.ts`. Sin sesión → `401`; rol sin permiso → `403`. La matriz de permisos está en `API_PERMISSIONS` (`lib/rbac-config.ts`) y deniega por defecto. En cada petición, el rol del equipo se vuelve a validar contra la base de datos, de modo que desactivar una cuenta tiene efecto inmediato.
- Excepciones deliberadas: `/api/auth/*` (NextAuth) y `/api/customer-auth`, porque son los endpoints que emiten la sesión. `GET /api/cron/notifications` acepta `Authorization: Bearer $CRON_SECRET` (Vercel Cron) o una sesión ADMIN.
- **Selector de roles:** solo aparece si la sesión es `ADMIN` y sirve únicamente para previsualizar la navegación de otro rol (cookie `dk_role_preview`). La API siempre autoriza con el rol real.

Crear o actualizar una cuenta del equipo:

```bash
STAFF_PASSWORD='contraseña-larga-y-única' node scripts/create-staff-user.mjs --email paola@dharmakadabra.com --name "Paola Hernández" --role ADMIN
# Desactivar: node scripts/create-staff-user.mjs --email persona@dominio.com --deactivate
```

En desarrollo sin `DATABASE_URL` puedes definir `DEV_ADMIN_EMAIL` y `DEV_ADMIN_PASSWORD` para tener una administradora en memoria (se ignora en producción). Consulta `.env.example`.

## Reservas, eventos y cuentas de cliente

- Reservar requiere sesión (cuenta de cliente o equipo autorizado). Para clientes, el correo y la cuenta de la cita salen de la sesión, no del formulario.
- Toda cita nueva se crea con `status: PENDING` y `depositPaid: false`. Solo el webhook del procesador de pagos (Stripe u otro, pendiente de integrar) debe marcar el anticipo como pagado y confirmar la cita. **Todavía no se procesan cargos reales.**
- La verificación de disponibilidad y la creación/reagenda de la cita se ejecutan en una transacción de Prisma con aislamiento `Serializable` (`lib/booking.ts`). Si dos personas reservan el mismo horario a la vez, una transacción se aborta y la segunda reserva recibe `409`.
- El calendario mensual de `/dashboard/eventos` administra los rituales especiales y los productos asociados.
- Las cuentas de clientes se sirven en `/mi-cuenta`; las contraseñas se derivan con scrypt y la cookie de sesión está firmada, es `HttpOnly` y `SameSite=Lax`.
- Los productos y audios comprados se consultan desde `Purchase` y `AudioPurchase`. La integración de checkout deberá crear esos registros cuando se habilite la compra en línea.

### Configuración de producción

Configura `DATABASE_URL`, `NEXTAUTH_URL` (fuera de Vercel), `CRON_SECRET` y un secreto aleatorio largo en `AUTH_SECRET` (por ejemplo, genera uno con `openssl rand -base64 32`). Aplica el esquema con:

```bash
npm ci
npx --yes prisma@6.19.3 --config prisma.client.config.ts migrate deploy --schema prisma/schema.prisma
npm run build
```

La migración amplía una base existente que ya contiene la tabla `Appointment`; para una base vacía se necesita primero una migración inicial o establecer la línea base correspondiente. El despliegue necesita acceso al servidor oficial de motores de Prisma para generar el cliente.

La migración de reservas, clientes, productos y eventos está en `prisma/migrations/20261119000000_booking_customers_rituals/`. Sin `DATABASE_URL`, el proyecto usa un almacén en memoria para la previsualización local; esos registros no son persistentes entre reinicios.
