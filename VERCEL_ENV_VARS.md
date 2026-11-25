# Variables de entorno — Vercel

Guía para el Ingeniero: qué configurar en **Vercel → Project → Settings → Environment Variables** para que Dharma Kadabra opere en producción.

> Todas las variables se definen en los tres entornos (Production, Preview, Development) salvo indicación contraria. Después de cambiarlas, haz **Redeploy** para que el build las tome.

## Obligatorias (sin ellas la app no opera)

| Variable | Para qué | Cómo obtenerla |
|---|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL (pooler). Sin ella no hay datos persistentes. | Tu proveedor de Postgres (Supabase/Neon). Formato `postgresql://usuario:contraseña@host:5432/dharma_kadabra`. |
| `DATABASE_URL_UNPOOLED` | Conexión directa para migraciones (`db push`). Debe apuntar a la misma base. | La URL directa de tu proveedor (sin pooler). |
| `AUTH_SECRET` | Firma sesiones del equipo (NextAuth) y de clientes. **Obligatorio en producción.** | Genera uno con: `openssl rand -base64 32`. Nunca lo compartas ni lo subas al repo. |
| `CRON_SECRET` | Secreto que Vercel Cron envía como `Authorization: Bearer …` para el cron de notificaciones. | Genera uno con: `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | URL pública del sitio (NextAuth). | `https://tu-dominio.com` (o `https://tu-proyecto.vercel.app`). |

## Nuevas en esta integración

| Variable | Para qué | Cómo obtenerla |
|---|---|---|
| `RESEND_API_KEY` | Correos transaccionales (recuperación de contraseña, confirmación de cita). Sin ella los correos solo se registran en consola. | [resend.com](https://resend.com) → API Keys. |
| `RESEND_FROM_EMAIL` | Remitente de los correos. El dominio debe estar **verificado** en Resend (registros DNS). | `Dharma Kadabra <hola@dharmakadabra.mx>` (ajusta al dominio verificado). |
| `BLOB_READ_WRITE_TOKEN` | Almacenamiento durable de imágenes de producto y video del Tour. | Vercel → Storage → **Blob** → Create Store → conectar al proyecto. Vercel lo inyecta automáticamente; si lo defines a mano, pega el token del store. |
| `NEXT_PUBLIC_APP_URL` | URL pública para construir enlaces en los correos (recuperación, confirmación). | `https://tu-dominio.com`. |

## Recomendadas (experiencia completa)

| Variable | Para qué | Cómo obtenerla |
|---|---|---|
| `NEXT_PUBLIC_STORE_WHATSAPP` | Número comercial (solo dígitos con código de país) para el checkout por WhatsApp y la transferencia de Cozy. | El número real, p. ej. `5216641234567`. |
| `OPENAI_API_KEY` | Cozy con LLM (Asesora de Ventas). Sin ella usa el respondedor local. | [platform.openai.com](https://platform.openai.com) → API keys. |
| `OPENAI_MODEL` | Modelo de Cozy (opcional). | Por defecto `gpt-4o-mini`. |
| `NEXT_PUBLIC_INSTAGRAM_URL` | Enlace de Instagram en el footer (sin él se muestra "Próximamente"). | La URL oficial del perfil. |
| `NEXT_PUBLIC_FACEBOOK_URL` | Enlace de Facebook en el footer. | La URL oficial de la página. |

## Solo desarrollo local (no configurar en Vercel)

| Variable | Para qué |
|---|---|
| `DEV_ADMIN_EMAIL` / `DEV_ADMIN_PASSWORD` | Crea una administradora en memoria cuando no hay `DATABASE_URL`. Se ignoran en producción. |

## Checklist de despliegue

1. Conectar **Blob Store** (Storage → Blob) y verificar `BLOB_READ_WRITE_TOKEN`.
2. Verificar el **dominio remitente en Resend** (DNS) y definir `RESEND_FROM_EMAIL`.
3. Definir `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `AUTH_SECRET`, `CRON_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`.
4. Aplicar migraciones fuera del build: `npm run db:push` (incluye `20261124000000_customer_password_reset`).
5. Crear cuentas staff: `node scripts/create-staff-user.mjs` (Paola ADMIN, Ingeniería, CM, colaboradoras).
6. **Redeploy** y probar: subir una imagen en Marketing (debe devolver URL `https://…blob.vercel-storage.com`), solicitar recuperación de contraseña y reservar una cita (ambos deben llegar por correo).
