# SANTUARIO ANCESTRAL · Sistema visual de la Landing

Dirección de arte: **lujo espiritual, naturaleza y sabiduría atemporal**.
La landing deja atrás el carbón como superficie dominante: el contenido vive
sobre papiro oxidado y madera clara, y la noche queda reservada para la
portada (Hero), las cartas rituales de runas y el cierre de marca (Footer).

Todo el sistema está centralizado en `app/globals.css` (Tailwind CSS v4
mediante `@theme`), sin una segunda configuración de Tailwind.

## 1. Paleta

| Token | Hex | Uso |
| --- | --- | --- |
| `sanctuary-parchment` | `#D7C4A3` | Fondo general del contenido |
| `sanctuary-parchment-light` | `#E9DDC7` | Secciones alternas |
| `sanctuary-parchment-deep` | `#C9B38F` | Bandas de énfasis (Pilares, Reserva) |
| `sanctuary-parchment-warm` | `#E6D7C3` | Shell y header translúcido |
| `sanctuary-wood` | `#E8DCC6` | Tarjetas secundarias, banda lunar |
| `sanctuary-wood-light` | `#F2EBDD` | Tarjetas principales (marfil cálido) |
| `sanctuary-ink` | `#2C241B` | Títulos y párrafos |
| `sanctuary-ink-soft` | `#514333` | Textos secundarios |
| `sanctuary-ink-muted` | `#796A57` | Microcopy auxiliar |
| `sanctuary-gold` | `#C5A059` | Acentos, iconografía, botones primarios |
| `sanctuary-gold-light` | `#D9BC7C` | Hover de botones dorados |
| `sanctuary-gold-deep` | `#A98343` | Superficies y filetes dorados |
| `sanctuary-gold-ink` | `#6B4E1E` | Oro legible sobre papiro (AA) |
| `sanctuary-gold-leaf` | `#5F4518` | Palabra destacada de titulares (AA) |
| `sanctuary-night` | `#11110F` | Hero, cartas de runas |

### Regla de legibilidad

`#C5A059` **no** se usa para texto corrido sobre papiro (1.44:1). Sobre
superficies claras, los textos dorados usan `gold-ink` (4.5:1 en papiro) o
`gold-leaf` (5.24:1 en papiro, 4.39:1 en papiro profundo). El dorado brillante
se reserva para el Hero, las tarjetas oscuras y la iconografía.

El blanco solo aparece sobre imágenes o superficies oscuras.

### Contrastes verificados (WCAG AA)

| Combinación | Ratio |
| --- | --- |
| `ink` sobre `parchment` | 8.95 |
| `ink-soft` sobre `parchment` | 5.60 |
| `gold-ink` sobre `parchment` | 4.50 |
| `gold-leaf` sobre `parchment` | 5.24 |
| `ink` sobre `gold` (botón primario) | 6.21 |
| `gold` sobre `night` | 7.69 |
| `parchment` sobre `night` | 11.08 |

## 2. Textura y superficies

- `.sanctuary-texture` · papiro + grano fractal SVG en `multiply` (opacidad 0.12).
- `.sanctuary-atmosphere` · luces radiales blancas y cálidas sobre papiro.
- `.sanctuary-leaf` · superficie base de la landing: color, dos luces radiales
  y grano en un `::before` con `z-index:-1` (el contenido respira encima).
  Variantes: `.sanctuary-leaf-light`, `.sanctuary-leaf-deep`, `.sanctuary-leaf-wood`.
- `.sanctuary-card` · objeto físico de marfil: borde de oro al 16 %, radio 18 px,
  sombra marrón difusa (`rgba(80,57,31,.07)` + `.04`) y elevación de 4 px al hover.
  Variantes: `.sanctuary-card-wood` y `.sanctuary-card-quiet`.
- `.sanctuary-hairline` · filete de oro antiguo entre secciones editoriales.
- `.sanctuary-eyebrow` · microcopy en mayúsculas, tracking amplio, oro de tinta.

Nunca se usan sombras negras intensas: la profundidad viene de marrones cálidos
de baja opacidad.

## 3. Transiciones

- `.hero-sanctuary` · la portada oscura se funde con el papiro mediante un
  degradado inferior de `clamp(140px, 22vh, 220px)`; los controles del hero
  viven en `z-10`, por encima de la luz que entra por la base.
- `.sanctuary-dusk` · el papiro se asienta en la noche del Footer sin cortes.

## 4. Elementos flow

`components/landing/sanctuary-flow.tsx`

- `FlowStone` recorta fotografías de piedras/cristales ya presentes en
  `public/images` en marcos orgánicos (`pebble`, `blob`, `arch`, `leaf`),
  con opacidad 0.12–0.18, `blur(2px)`, máscara radial y velo cálido.
- `FlowCrystal` dibuja cuarzos de detalle con CSS y filo de oro.
- Flotación con `@keyframes sanctuary-float` (8 s y 12 s desfasados).
- Se ocultan en móvil (`hidden sm:block`): sin saturación ni desbordes.
- `prefers-reduced-motion` detiene la flotación y la elevación de tarjetas.

## 5. Mapa de la Landing

| Sección | Superficie |
| --- | --- |
| Hero | `sanctuary-night` + transición a papiro |
| Banda lunar | tarjeta de madera tostada sobre papiro |
| Manifiesto | `sanctuary-leaf` (papiro + atmósfera) |
| Paola Hernández | `sanctuary-leaf-light` (madera clara) |
| Próximos rituales | `sanctuary-leaf-wood` con tarjetas marfil |
| Servicios | papiro + tarjetas marfil, precios en `gold-ink` |
| Comunidad | papiro + tarjetas marfil con retratos orgánicos |
| Información general | `sanctuary-leaf-deep` + tarjetas marfil |
| Beneficios | papiro con filetes finos |
| Prueba gratis | tarjeta marfil con sombra cálida |
| Footer | `sanctuary-dusk` (cierre de marca) |

Las mismas reglas se aplicaron a las páginas íntimamente ligadas a la Landing:
`/registros-akashicos` y `/servicios/runas` (portadas nocturnas que se funden
con el papiro, contenido en papiro/madera y tarjetas marfil), los diálogos de
reserva (`appearance="papyrus"`), el drawer de runas y el widget Cozy.
