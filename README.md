# dharma-kadabra-app

Plataforma digital diseñada para acercar la sabiduría espiritual ancestral al mundo moderno.

## Integración del sistema

Esta versión reúne los cambios de ambas ramas, conservando sus commits en el historial:

- `arena/09a74da0-dharma-kadabra-app` (`9db4ca0`): navegación por roles, módulo de redes sociales y animación Cozy Fire.
- `arena/edb80ff0-dharma-kadabra-app` (`5c464ee`): reservas, calendario de eventos y Mi Cuenta.

Los contratos de Prisma se regeneran desde el esquema combinado con `npx prisma contract emit`. `npm run generate:client` genera el cliente real de Prisma 6 en `node_modules`, compatible con el import de `@prisma/client`; no se versionan clientes simulados ni archivos de compilación.

> El selector de roles del dashboard es una demostración: admite roles desde parámetros, cabeceras y cookies, y usa ADMIN por defecto. No sustituye una sesión administrativa autenticada. Antes de exponer la administración en producción, hay que vincular los roles a sesiones verificadas y autorizar también las API administrativas, que todavía no aplican estas restricciones.

## Reservas, eventos y cuentas de cliente

- Las reservas guardan cita, correo, servicio y anticipo en Prisma. La pasarela del anticipo se encuentra en modo de demostración: **no procesa cargos reales**.
- El calendario mensual de `/dashboard/eventos` administra los rituales especiales y los productos asociados.
- Las cuentas de clientes se sirven en `/mi-cuenta`; las contraseñas se derivan con scrypt y la cookie de sesión está firmada, es `HttpOnly` y `SameSite=Lax`.
- Los productos y audios comprados se consultan desde `Purchase` y `AudioPurchase`. La integración de checkout deberá crear esos registros cuando se habilite la compra en línea.

### Configuración de producción

Configura `DATABASE_URL` y un secreto aleatorio largo en `AUTH_SECRET` (por ejemplo, genera uno con `openssl rand -base64 32`). Aplica el esquema con:

```bash
npm ci
npx --yes prisma@6.19.3 --config prisma.client.config.ts migrate deploy --schema prisma/schema.prisma
npm run build
```

La migración amplía una base existente que ya contiene la tabla `Appointment`; para una base vacía se necesita primero una migración inicial o establecer la línea base correspondiente. El despliegue necesita acceso al servidor oficial de motores de Prisma para generar el cliente.

La migración de reservas, clientes, productos y eventos está en `prisma/migrations/20261119000000_booking_customers_rituals/`. Sin `DATABASE_URL`, el proyecto usa un almacén en memoria para la previsualización local; esos registros no son persistentes entre reinicios.
