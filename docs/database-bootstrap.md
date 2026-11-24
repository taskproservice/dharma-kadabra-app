# Bootstrap de PostgreSQL y despliegue de migraciones

## Variables necesarias

- `DATABASE_URL`: conexión usada por la aplicación.
- `DATABASE_URL_UNPOOLED`: conexión directa usada por Prisma Migrate y tareas administrativas.

Guarda las URLs fuera del repositorio, en `.env.local` para desarrollo o en el gestor de variables del entorno correspondiente. Nunca pegues URLs con credenciales en issues o logs.

## Situación de las migraciones actuales

La primera migración (`20261119000000_booking_customers_rituals`) empieza alterando la tabla `Appointment`. Por ello, ejecutar `prisma migrate deploy` directamente sobre una base recién creada falla: no hay una migración inicial que cree el esquema previo. Las migraciones posteriores también asumen los objetos creados en las anteriores.

## Base de datos nueva y vacía

Este procedimiento es exclusivamente para una base recién creada y verificada como vacía. **No lo ejecutes en una base con datos.**

1. Configura ambas URLs para esa base y confirma desde el panel del proveedor que es la base vacía correcta.
2. Genera el esquema actual desde el `schema.prisma` versionado:

   ```bash
   npx prisma db push --schema prisma/schema.prisma
   ```

   No uses `--accept-data-loss`.
3. Como el esquema actual ya incluye el resultado de las migraciones históricas, registra esos cuatro pasos como baseline aplicado:

   ```bash
   npx prisma migrate resolve --applied 20261119000000_booking_customers_rituals --schema prisma/schema.prisma
   npx prisma migrate resolve --applied 20261120000000_staff_users_rbac --schema prisma/schema.prisma
   npx prisma migrate resolve --applied 20261122000000_tour_video --schema prisma/schema.prisma
   npx prisma migrate resolve --applied 20261123000000_multirrol_modalidad_tienda --schema prisma/schema.prisma
   ```
4. Verifica el estado y carga el catálogo inicial:

   ```bash
   npx prisma migrate status --schema prisma/schema.prisma
   npm run seed
   ```

Este es un bootstrap operativo de una sola vez: alinea la base vacía con el schema actual y registra el historial conocido para que las migraciones futuras se apliquen con `prisma migrate deploy`. No es una migración SQL inicial, no forma parte del build y no se debe repetir sobre una base existente. Como el historial actual no se puede reconstruir desde una base vacía, no uses `prisma migrate dev` para generar nuevas migraciones hasta completar una re-baseline verificable del historial.

## Base existente o con datos

No ejecutes `db push` ni marques todas las migraciones como aplicadas sin verificar el estado real de la base.

1. Haz y verifica un respaldo recuperable antes de cambiar el schema.
2. Revisa `_prisma_migrations` y determina cuáles de las migraciones listadas ya se aplicaron.
3. Compara el schema existente con `prisma/schema.prisma`. Si se usa `prisma migrate diff`, genera el SQL en un archivo temporal, revísalo y no lo ejecutes automáticamente:

   ```bash
   npx prisma migrate diff \
     --from-url "$DATABASE_URL_UNPOOLED" \
     --to-schema-datamodel prisma/schema.prisma \
     --script > /tmp/dharma-schema-review.sql
   ```
4. Si el schema ya coincide con el estado actual, registra el baseline solo después de comprobarlo. Si no coincide, prepara y revisa una migración hacia delante que conserve los datos antes de continuar.
5. Una vez reconciliado el historial, las nuevas migraciones se aplican con:

   ```bash
   npx prisma migrate deploy --schema prisma/schema.prisma
   ```

Si el historial o el schema no son claros, detén el proceso y solicita una revisión antes de modificar la base. `migrate resolve` actualiza el registro de migraciones, pero no aplica el SQL de una migración.

## Alta del usuario de equipo

Después de inicializar el schema, el script `scripts/create-staff-user.mjs` crea o actualiza usuarios de equipo con el hash scrypt que usa el login. La contraseña se recibe por `STAFF_PASSWORD`, no como argumento CLI. Consulta el README para ejemplos.
