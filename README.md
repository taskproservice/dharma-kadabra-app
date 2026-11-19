# dharma-kadabra-app

Plataforma digital diseñada para acercar la sabiduría espiritual ancestral al mundo moderno.

## Reservas, eventos y cuentas de cliente

- Las reservas guardan cita, correo, servicio y anticipo en Prisma. La pasarela del anticipo se encuentra en modo de demostración: **no procesa cargos reales**.
- El calendario mensual de `/dashboard/eventos` administra los rituales especiales y los productos asociados.
- Las cuentas de clientes se sirven en `/mi-cuenta`; las contraseñas se derivan con scrypt y la cookie de sesión está firmada, es `HttpOnly` y `SameSite=Lax`.
- Los productos y audios comprados se consultan desde `Purchase` y `AudioPurchase`. La integración de checkout deberá crear esos registros cuando se habilite la compra en línea.

### Configuración de producción

Configura `DATABASE_URL` y un secreto aleatorio largo en `AUTH_SECRET` (por ejemplo, genera uno con `openssl rand -base64 32`). Aplica el esquema con:

```bash
npx prisma migrate deploy
npm run build
```

La migración de reservas, clientes, productos y eventos está en `prisma/migrations/20261119000000_booking_customers_rituals/`. Sin `DATABASE_URL`, el proyecto usa un almacén en memoria para la previsualización local; esos registros no son persistentes entre reinicios.
