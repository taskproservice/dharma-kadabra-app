# Auditoría Técnica, de Usabilidad y Estado del Proyecto — Dharma Kadabra

**Fecha de corte:** Noviembre 2026  
**Stack auditado:** Next.js 15.5 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Prisma 6 (PostgreSQL) · NextAuth v4 · Zustand 5  
**Alcance:** Vistas públicas (`Landing`, `Tienda Holística`, `Agenda Digital`, `Lectura de Runas`, `Registros Akáshicos`, `Mi Cuenta`, `Acceso Staff`) y módulos del `Dashboard` interno.

---

## 1. Resumen Ejecutivo

Se realizó una auditoría integral de código, experiencia de usuario (UX/UI), sistema de diseño y arquitectura sin introducir nuevas funcionalidades de negocio ni alterar flujos operativos existentes. El objetivo principal fue **estabilizar la base actual**, eliminar fricciones de navegación, unificar la paleta institucional y documentar con precisión técnica en qué punto se encuentra la plataforma y cuál es la hoja de ruta lógica hacia operación comercial completa.

---

## 2. Intervenciones Aplicadas en esta Auditoría

### 2.1. Auditoría de Usabilidad (Botones, Enlaces y Acciones)

- **Corrección de rutas y acciones rotas o engañosas:**
  - **Landing (`app/page.tsx`):** El CTA público *"Comenzar Prueba Gratis"* apuntaba a `/dashboard/pos` (ruta protegida para personal interno); se redirigió a `/mi-cuenta` para el flujo real de clientes.
  - **Tienda Holística (`ProductCard.tsx`):** El botón *"Comprar"* redirigía forzosamente a `/login?callbackUrl=/tienda` (formulario exclusivo de staff). Ahora añade el artículo directamente al carrito persistente y abre el `CartDrawer`.
  - **Mi Cuenta (`app/mi-cuenta/page.tsx`, `customer-auth-form.tsx`, `customer-account.tsx`):** Se conectó y sanitizó el parámetro `callbackUrl` post-inicio de sesión y se actualizaron los enlaces vacíos de explorar servicios hacia `/agenda`.
  - **Dashboard (`dashboard-shell.tsx`, `cozy/page.tsx`, `ventas/page.tsx`):** El acceso flotante de Cozy sin `onClick` ahora enlaza a `/dashboard/cozy`; el botón *"Inspirarme"* inserta disparadores editoriales en la conversación; *"Exportar"* en Ventas genera y descarga un archivo CSV real filtrado; se eliminaron todos los `window.alert()` reemplazándolos por estados visuales integrados (`role="status"` / `role="alert"`).
  - **Rutas heredadas duplicadas (`resumen`, `diseno-base`, `informacion-general`, `panel-administrativo`, `pasarela-pagos`):** Sustituidas sus tarjetas blancas *"Módulo en construcción"* por redirecciones limpias (`redirect()`) hacia sus rutas canónicas activas (`/dashboard`, `/dashboard/diseno`, `/dashboard/info`, `/dashboard/admin`, `/dashboard/pagos`).
- **Funcionalidades futuras preservadas en estado «Próximamente» (sin eliminar controles):**
  - **Carrito de Tienda (`CartDrawer.tsx`):** Se incorporó el botón atenuado *"Pago con tarjeta · Próximamente"* junto al flujo activo de pedido asistido, y se añadió respaldo vía Cozy cuando `NEXT_PUBLIC_WHATSAPP_NUMBER` aún tiene valor de marcador de posición.
  - **Reserva de Sesiones (`BookingDialog.tsx`):** Se clarificó la acción activa como *"Apartar horario (sin cargo ahora)"* y se mantuvo visible en estado deshabilitado *"Pago en línea con tarjeta (20%) · Próximamente"*.
  - **Widget Cozy (`cozy-widget.tsx`):** Detección automática de teléfonos placeholder (`0000000` / `1234567`) para mostrar *"WhatsApp · Próximamente"* en lugar de abrir enlaces inválidos de `wa.me`.
  - **Controles pendientes de backend en Dashboard:** Marcados con `disabled`, estilo atenuado y `title` descriptivo en `DashboardTopbar` (*Centro de notificaciones*), `/dashboard/pagos` (*Configurar pasarela*), `/dashboard/perfil` (*Cambiar foto*), `/dashboard/cozy` (*Adjuntar archivo*) y `MediaLibrary` (*Más opciones*).
- **Eliminación de botones duplicados en la misma vista:**
  - En `/agenda`, `RitualEventsSection` oculta el enlace redundante *"Ver calendario"* hacia `/agenda`.
  - En `/registros-akashicos`, el encabezado fijo muestra *"Ver Agenda"* en el primer pliegue mientras el CTA principal *"Reservar sesión"* del Hero está en pantalla, alternando a *"Reservar sesión"* únicamente tras desplazarse (`scrollY > 420`).
  - En `/dashboard/cozy`, se oculta el acceso flotante redundante de Cozy.

### 2.2. Unificación del Design System (Paleta Institucional)

Se formalizaron las variables y clases de tema en `app/globals.css` (`@theme inline` de Tailwind CSS v4) y se estandarizaron todas las superficies públicas e internas:

| Token Tailwind | Hex Institucional | Uso en la Interfaz |
| :--- | :--- | :--- |
| `obsidian` (`bg-obsidian`, `text-obsidian`) | `#0F1115` | Fondo base oscuro profundo y texto de alto contraste sobre botones dorados |
| `papyrus` (`bg-papyrus`, `text-papyrus`) | `#F4EFE6` | Contenedores/tarjetas de papiro cálido y tipografía clara principal sobre fondo oscuro |
| `gold` (`bg-gold`, `text-gold`, `border-gold`) | `#C5A059` | Acento institucional dorado (CTAs primarios, filetes, iconografía ritual y estados activos) |
| `ink` (`text-ink`) | `#1A1A1A` | Texto oscuro editorial sobre superficies papiro (`#F4EFE6`) |

- Se erradicaron fondos fuera de marca (`#0b1020`, `#11182b`, `bg-black`, `bg-white`, `bg-emerald-50`) y se corrigieron problemas críticos de legibilidad (campo de fecha blanco en reprogramación de citas en `/mi-cuenta`, botón *"Cobrar"* con texto crema sobre fondo dorado en POS, placeholder PNG blanco en imágenes de Registros Akáshicos reemplazado por SVG `#0F1115`, y error tipográfico `hover:bg-red-500/150/10` en `/dashboard/redes`).

### 2.3. Arquitectura, Estado Global y Optimización de Recursos

- ** Separación y persistencia de carritos (`stores/cart.ts`):**
  - `useCartStore` (Tienda Holística pública) ahora persiste `items` en `localStorage` (`dk-holistic-cart-v1`) para evitar pérdida de carrito al navegar entre `/`, `/tienda`, `/agenda` y `/mi-cuenta`.
  - Se creó `usePosCartStore` exclusivo para el Punto de Venta (`/dashboard/pos`) y Venta Rápida (`/dashboard/inventario`), evitando colisiones de estado entre clientes y personal en un mismo navegador.
- **Higiene modular y compilación:**
  - Reubicación de los componentes interactivos de runas desde `components/landing/runes/` hacia su módulo dedicado `components/runes/`.
  - Extracción de cálculos de calendario y disponibilidad desde `components/landing/digital-agenda.tsx` hacia `lib/agenda-availability.ts`.
  - Eliminación del archivo residual `prisma.config.ts.bak` e incorporación de `scripts/db-sync.mjs` para generación resiliente del cliente Prisma incluso en entornos de compilación sin motor binario o sin `DATABASE_URL`.
- **Optimización de `next/image` y tipografías:**
  - Reemplazo de todas las etiquetas `<img>` nativas restantes (`CartDrawer`, `CustomerAccount`, `/dashboard/redes`) por `next/image` con `fill` y atributo `sizes` explícito.
  - Eliminación de cargas duplicadas de `Cormorant_Garamond` en páginas individuales (`/tienda`, `/servicios/runas`, `/registros-akashicos`), reutilizando la variable CSS global `--font-cormorant-garamond` definida en `app/layout.tsx`.

---

## 3. Fase Actual del Proyecto (`Fase Actual`)

El proyecto se encuentra en **Fase MVP Funcional de Experiencia + Backoffice Híbrido (Pre-Comercialización en Línea)**: la arquitectura visual, editorial, interactiva y el modelo relacional base están construidos y compilando limpiamente, con flujos transaccionales clave conectados a Prisma/PostgreSQL y módulos administrativos secundarios operando aún con estado local o datos semilla.

| Módulo / Dominio | Estado Actual | Detalle Técnico |
| :--- | :--- | :--- |
| **Landing Editorial, Tour y Fase Lunar** | **Operativo (Producción)** | Cálculo astronómico real (`lib/lunar-utils.ts` con tests), carrusel, eventos desde BD con fallback semilla y reproductor de Tour configurable (`/api/tour` y `/api/tour/upload`). |
| **Oráculo de Runas y Registros Akáshicos** | **Operativo (Producción)** | Tirada interactiva de 1 y 3 runas (Elder Futhark completo), páginas editoriales de alto acabado y conexión directa con reserva de sesiones. |
| **Tienda Holística (`/tienda`)** | **Operativo con pedido asistido** | Catálogo SSR desde Prisma (`Product` con `published: true`), filtros, búsqueda, carrito persistente en `localStorage` y cierre asistido por WhatsApp/Cozy. Sin cobro automático con tarjeta aún. |
| **Agenda Digital y Reservas (`/agenda`)** | **Parcialmente conectado a BD** | `POST /api/appointments` guarda citas reales en Prisma (`Appointment`), pero la grilla del calendario público (`lib/agenda-availability.ts`) todavía muestra horarios simulados en lugar de consultar cruces reales en BD. |
| **Portal de Clientes (`/mi-cuenta`)** | **Operativo (JWT propio + BD)** | Registro, login (`dk_customer_session` vía `/api/customer-auth`), historial de compras/citas por correo o `customerId`, reprogramación y cancelación reales sobre Prisma (`/api/appointments/[id]`). Recuperación de contraseña genera token en BD pero aún no envía email real. |
| **Acceso Staff, RBAC y POS / Inventario** | **Operativo (NextAuth + BD)** | Login de personal (`ADMIN`, `SPEC`, `MKT`, `SALES`), selector de vista por rol para Admin, CRUD real de productos (`/api/store/products`), plantillas (`/api/store/templates`) y cobro transaccional con descuento de stock (`/api/pos/checkout`). |
| **Módulos secundarios del Dashboard** | **Prototipo UI / Parcial** | `Eventos` ya consume `/api/events`, mientras que `Agenda Editorial` (usa estado inicial mock), `Colaboradores`, `Redes Sociales`, `Pagos`, `Ventas`, `Perfil`, `Info`, `Diseño`, `Biblioteca Multimedia` y `Agentes IA` mutan estado en memoria de sesión. |

---

## 4. Lo que Falta — Backlog Lógico Priorizado (`Lo que falta`)

### Prioridad P0 · Crítico para Operación Comercial Real

1. **Integración Real de Pasarela de Pagos (Stripe / Mercado Pago):**
   - Crear endpoints de *Checkout Session* / *Payment Intent* y webhook firmado (`/api/webhooks/payments`) para:
     - Cobrar el **anticipo del 20%** al confirmar una sesión en `BookingDialog` y actualizar `Appointment.depositPaid = true` + `status = CONFIRMED`.
     - Procesar el **checkout completo de la Tienda Holística** (`CartDrawer`), generando orden pagada, descontando `Product.stock` de forma atómica y vinculando `customerId`.
   - Habilitar entonces los botones hoy marcados como *"Pago con tarjeta · Próximamente"* y la configuración en `/dashboard/pagos`.

2. **Disponibilidad Real y Prevención de Doble Reserva en Agenda:**
   - Exponer `GET /api/appointments?month=YYYY-MM&serviceId=...` (o `/api/availability`) leyendo citas activas (`Appointment.status != CANCELLED`), horarios laborales por especialista y bloqueos administrativos.
   - Añadir validación transaccional en `POST /api/appointments` y `PATCH /api/appointments/[id]` para rechazar colisiones de horario concurrentes.

3. **Servicio de Correo Transaccional y Mensajería Real (Email + WhatsApp):**
   - Integrar proveedor de correo (`Resend` / `Postmark` / `SES`) para:
     - Envío real del enlace de restablecimiento en `/api/customer-auth` (`action: "forgot"`, eliminando la dependencia de consola/dev).
     - Confirmaciones y reprogramaciones de citas, y recibos de compra en tienda.
   - Configurar `NEXT_PUBLIC_WHATSAPP_NUMBER` definitivo de negocio y conectar `/api/cron/notifications` con WhatsApp Cloud API (o Twilio) mediante un cron programado para recordatorios reales (7 días, 24 h y 1 h antes).

### Prioridad P1 · Consolidación de Base de Datos de Usuarios y Backoffice

4. **Completitud y Unificación del Modelo de Datos (Prisma):**
   - **Usuarios y Clientes:** Añadir verificación de correo electrónico en `Customer`, vincular automáticamente citas/compras previas realizadas como invitado al registrarse con el mismo email, y permitir edición de perfil/teléfono desde `/mi-cuenta`.
   - **Persistencia de módulos del Dashboard:** Conectar a tablas Prisma y rutas API protegidas por RBAC los módulos que hoy operan en memoria:
     - `Appointment` -> conectar `components/dashboard/agenda-client.tsx` a las citas reales de Prisma (`/api/appointments`) en lugar de datos mock iniciales.
     - Nuevos modelos o configuración persistente para `Collaborator` (`Colaboradores`), `SiteSettings` (`Info`, `Diseño`, `Admin`) y conciliación real de `Sale` / pagos en `/dashboard/ventas` y `/dashboard/pagos`.

5. **Almacenamiento en Nube para Multimedia (Object Storage):**
   - Migrar `/api/tour/upload` (actualmente escribe en `public/uploads/tour`, no persistente en despliegues serverless) hacia `Cloudflare R2`, `AWS S3` o `Vercel Blob`, y reutilizar ese servicio para imágenes de productos en `Inventario`, retratos de `Colaboradores`, avatar de `Mi Perfil` (*Cambiar foto*) y `Biblioteca de Audio/Video`.

### Prioridad P2 · Inteligencia Conversacional, Seguridad y Calidad Continua

6. **Conexión de IA Real para Cozy y Agentes Internos:**
   - Evolucionar `/api/cozy` y `/dashboard/cozy` hacia integración con LLM acotado al contexto editorial de Dharma Kadabra (catálogo activo en BD, servicios y horarios reales) con control de cuota y moderación.
   - Conectar `Agente de Ventas` (CRM ligero de prospectos) y `Agente de Marketing` / `Redes Sociales` a persistencia en BD o integraciones con Meta Graph API.

7. **Endurecimiento Productivo, Legal y QA Automatizado:**
   - **Seguridad:** Rate limiting por IP/correo en `/api/customer-auth`, `/api/auth/*` y `/api/appointments`; cabeceras CSP/HSTS; validación estricta de variables de entorno al arranque (`NEXTAUTH_SECRET`, `CUSTOMER_AUTH_SECRET` separado, `CRON_SECRET`, `DATABASE_URL`).
   - **Páginas legales y SEO:** Publicar `/aviso-de-privacidad`, `/terminos` y políticas de cancelación/envíos, además de `sitemap.ts`, `robots.ts` y metadatos OpenGraph por ruta.
   - **Observabilidad y pruebas E2E:** Integrar monitoreo de errores (Sentry) y suite Playwright cubriendo los 4 flujos críticos: compra en `/tienda`, reserva en `/agenda`, portal `/mi-cuenta` y cobro en `/dashboard/pos`.
