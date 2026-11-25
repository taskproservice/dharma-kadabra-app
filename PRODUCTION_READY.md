# Production Ready — Dharma Kadabra

**Fecha:** 25 de noviembre de 2026 · **Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v4 · Prisma 6 (PostgreSQL) · NextAuth v4 · Zustand 5

Este documento resume el estado del proyecto tras la auditoría de producción (limpieza de UI, verificación RBAC y compilación). No se añadieron funcionalidades de negocio.

---

## 1. Lo que ya funciona (real, conectado a base de datos)

### Sitio público
- **Landing editorial** (`/`): Hero fotográfico, manifiesto, sección de Paola, equipo, pilares, beneficios, prueba gratis y footer. Todo con contenido real e imágenes propias (`public/images/`). Sin Lorem Ipsum ni imágenes de prueba.
- **Tienda Holística** (`/tienda`): catálogo SSR desde Prisma (`Product` con `published: true` + `isVisible: true`), filtros por categoría, carrito persistente en `localStorage`, cierre de pedido asistido por WhatsApp/Cozy. Si la DB falla, sirve catálogo de respaldo sin romperse. Modo mantenimiento retira la tienda (Panel Ingeniería).
- **Agenda Digital** (`/agenda`): calendario con disponibilidad real (slots bloqueados desde `Appointment` vía `/api/availability`), selección de terapeuta, reserva que crea citas `PENDING` reales en Prisma con bloqueo de horario (anti-doble-reserva).
- **Servicios** (`/servicios/runas`, `/registros-akashicos`): páginas editoriales + tirada interactiva de runas (Elder Futhark) + CTA de reserva.
- **Mi Cuenta** (`/mi-cuenta`): registro/login de clientes con sesión firmada (`dk_customer_session`), historial de citas/compras, reprogramación y cancelación reales.
- **Cozy (chatbot público)**: con `OPENAI_API_KEY` usa LLM con System Prompt de ventas; sin key usa respondedor local con contexto real del producto. Detección de transferencia a humano (WhatsApp).
- **Calendario lunar**: cálculo real (`lib/lunar-utils.ts`, con tests).

### Los 4 paneles (ocultos y protegidos)
- **Acceso único:** el sitio público **no enlaza** `/dashboard` ni subrutas. El único acceso interno es `/login` (enlace "Acceso equipo" del footer). Verificado por grep en `app/`, `components/` y `modules/`.
- **Middleware** (`middleware.ts`): exige JWT de NextAuth con rol válido; sin sesión → `/login?callbackUrl=…`; rol sin permiso → redirige a su propio panel (`DASHBOARD_HOME_BY_ROLE`). Sin sesión no hay acceso por URL directa.
- **API**: todo endpoint sensible llama `authorize()` (401 sin sesión, 403 sin permiso). Endpoints públicos intencionales y sin PII: `/api/availability` (slots ocupados), `/api/collaborators` (equipo público), `/api/cozy`, `/api/store/products` (catálogo), `/api/store/track` (vista de producto), `/api/customer-auth`, `GET /api/tour`.
- **Panel Admin/Owner** (`/dashboard/admin`, solo ADMIN): KPIs reales desde Prisma (ingresos del mes desde `Purchase`, citas de la semana, bajo stock) + gestión de usuarios y roles (`/api/users`). Doble verificación (middleware + página).
- **Panel Ingeniería** (`/dashboard/ingenieria`, ENGINEER + ADMIN): health check (`/api/system/settings`: latencia DB, uptime, variables presentes como booleanos), modo mantenimiento (oculta la tienda), enlaces Vercel/Supabase y gestión de usuarios.
- **Panel Colaboradores** (`/dashboard/agenda`, COLLABORATOR + ADMIN/ENGINEER): la colaboradora ve **solo sus citas** (`assigneeId = su usuario`), parrilla semanal de disponibilidad propia (`/api/availability/me`), y modalidad visible por cita (**Presencial** / **Videollamada**). Guard de rol en página (defensa en profundidad).
- **Panel Marketing** (`/dashboard/marketing`, MARKETING + ADMIN): inventario con **SKU obligatorio y único** (`Product.sku`, identificador de sincronización con Meta), alta/edición de piezas con descripción, precio unitario en MXN, stock, imagen por arrastrar y soltar (`/api/products/upload` → Vercel Blob) con vista previa, visibilidad On/Off (`published`/`isVisible`), KPIs de visitas/productos más vistos (`/api/analytics`, datos reales de `StoreVisit`/`ProductView`) y **exportación del catálogo para Meta Commerce Manager** en CSV (`/api/products/export/meta`: `id, title, description, availability, condition, price, link, image_link, brand`; solo piezas publicadas, visibles y con imagen).

### Otros módulos operativos
- **POS** (`/dashboard/pos`, ADMIN/ENGINEER): cobro transaccional real (`/api/pos/checkout`: registra `Purchase` y descuenta stock). Guard de rol en página.
- **Inventario** (`/dashboard/inventario`, solo ADMIN): CRUD de productos, plantillas por categoría, venta rápida.
- **Eventos** (`/dashboard/eventos`): alta de eventos reales (`/api/events` POST protegido).
- **Tour de marca** (`/dashboard/tour`): video y capítulos editables (`/api/tour`), servidos en la landing.
- **Cron de notificaciones**: Vercel Cron diario (`vercel.json`) con secreto (`CRON_SECRET`).

---

## 2. Lo que está simulado (Mock) — no opera al 100%

| Área | Estado actual | Dónde |
|---|---|---|
| **Pagos en línea con tarjeta** | Botón deshabilitado "Pago con tarjeta · Próximamente". El anticipo del 20% de las reservas se calcula pero **nunca se cobra** (`depositPaid` queda en `false`; las citas quedan `PENDING`). | `CartDrawer.tsx`, `booking-dialog.tsx`, `appointments/handler.ts` |
| **Pasarela de Pagos** (`/dashboard/pagos`) | Datos de demostración + conciliación manual. Botones "Configurar · Próximamente". | `app/dashboard/pagos/view.tsx` |
| **Finanzas/Ventas** (`/dashboard/ventas`) | Transacciones de demostración (exporta CSV real de esos datos mock). | `app/dashboard/ventas/view.tsx` |
| **Recordatorios WhatsApp** | El motor evalúa citas (7 días / 1 día / 1 hora) y **simula el envío con `console.log`**; marca `notificationsSent` en DB pero ningún mensaje sale. | `lib/notifications.ts`, `agenda-client.tsx` ("Motor de Notificaciones WhatsApp (Simulado)") |
| **Newsletter (footer)** | Validación en cliente + mensaje de éxito; **no persiste** suscriptores ni envía correo. | `premium-footer.tsx` |
| **Cozy en dashboard** (`/dashboard/cozy`) | Conversación de demostración con estado local; el panel público sí usa `/api/cozy`. | `app/dashboard/cozy/view.tsx` |
| **Biblioteca multimedia** (Audio/Video) | Datos demo, archivos solo en la sesión del navegador. | `media-library.tsx` |
| **Redes Sociales** | "Conexión simulada", estado local. | `app/dashboard/redes/view.tsx` |
| **Colaboradores** (CRUD) | Estado local desde semilla; no persiste en DB (la agenda sí usa usuarios reales). | `app/dashboard/colaboradores/view.tsx` |
| **Diseño / Info / Perfil** | Estado local ("guardada en esta sesión"). | `app/dashboard/diseno|info|perfil/view.tsx` |
| **Agentes IA** (Ventas/Marketing) | Leads y campañas de demostración. | `ai-agent-dashboard.tsx` |
| **Video IA comercial** (Inventario) | UI + demo; "la API externa de video se conecta después". | `inventario-client.tsx` |
| **Subida de imágenes y video** | Usa **Vercel Blob** (`put()`) cuando `BLOB_READ_WRITE_TOKEN` está configurado; en local sin token cae a `public/uploads/`. | `lib/storage.ts`, `app/api/products/upload/handler.ts`, `app/api/tour/upload/handler.ts` |

---

## 3. Backlog Crítico (P0) — para operar al 100%

1. **Pasarela de pagos (Stripe o equivalente) + webhook.** Cobrar el anticipo del 20% y el pago en línea de la tienda; el webhook marca `depositPaid: true` y confirma la cita. Sin esto no hay cobro automático ni confirmación de reservas.
2. **Newsletter real (opcional).** Confirmaciones de reserva y recuperación de contraseña ya usan **Resend** (`lib/resend.ts`); falta persistir suscriptores del newsletter del footer.
3. **WhatsApp Business API (Twilio / Meta).** Reemplazar el `console.log` de `lib/notifications.ts` por envíos reales de recordatorios (7 días / 1 día / 1 hora).
4. **Conectar variables de entorno en Vercel** (ver `VERCEL_ENV_VARS.md`): `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `AUTH_SECRET`, `CRON_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `BLOB_READ_WRITE_TOKEN`, `NEXT_PUBLIC_STORE_WHATSAPP`, `OPENAI_API_KEY` (opcional), `NEXT_PUBLIC_INSTAGRAM_URL` / `NEXT_PUBLIC_FACEBOOK_URL`.
5. **Datos y cuentas de producción.** Migraciones aplicadas (`npm run db:push`), seed de productos, y cuentas staff (Paola ADMIN, Ingeniería, CM, colaboradoras) vía `scripts/create-staff-user.mjs`.
6. **Personalizar textos legales.** Aviso de privacidad (`/aviso-de-privacidad`), Términos (`/terminos-y-condiciones`) y Política de envíos (`/politica-de-envios`) ya publicados; revisar los datos entre corchetes (razón social, dirección, monto de envío gratis).
7. **Conectar datos reales en Finanzas/Pagos** (reemplazar mocks por `Purchase`/`Appointment` reales) y decidir si se mantiene el módulo o se oculta hasta tener pasarela.
8. **(P1) Video IA comercial** y **(P1) persistencia** de Colaboradores/Redes/Diseño/Info/Perfil si se quieren operar desde el dashboard.

---

## 4. Limpieza aplicada en esta auditoría

- **Botón muerto eliminado:** el botón "Buscar" del header público no tenía acción (sin `onClick`); se retiró junto con su import.
- **Código muerto eliminado (tienda):** componentes nunca importados `FeaturedProductsGrid`, `FeaturedProductCard`, `StoreBanner`, `StoreExplorer`, `CategoryTabs`; funciones huérfanas `getStorefrontData`, `getFeaturedStoreProducts` (+ tipos) en `data.ts`; constantes huérfanas `STORE_BANNERS`, `StoreBannerSlide`, `STORE_PALETTE` en `constants.ts`; exports del barril `index.ts`.
- **Config muerta eliminada:** campo `allowedHrefs` de `ROLE_PERMISSIONS` (nunca leído; la autorización usa `isAllowed`), incluidas rutas legacy (`resumen`, `diseno-base`, `panel-administrativo`, `informacion-general`).
- **RBAC reforzado:** guards de rol en `/dashboard/agenda` (ADMIN/ENGINEER/COLLABORATOR) y `/dashboard/pos` (ADMIN/ENGINEER), además del middleware.
- **Verificado sin cambios:** sin Lorem Ipsum ni imágenes de prueba en secciones públicas; estados "Próximamente" elegantes (deshabilitado + `title`); sin enlaces públicos a `/dashboard`; CTAs de sección (header/banner/eventos) revisados — son navegación por contexto, no duplicados adyacentes.
- **Compilación:** `npm run build` sin errores de TypeScript ni de build.
