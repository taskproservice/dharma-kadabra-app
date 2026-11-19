/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Negocia AVIF primero y WebP como respaldo; el navegador recibe el
    // formato más ligero que soporte (JPEG original solo si no soporta ninguno).
    formats: ["image/avif", "image/webp"],
    // Anchos de srcset para fondos a pantalla completa, hasta 4K (3840px).
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Calidades permitidas para <Image quality={...}>.
    qualities: [75, 90],
    // Cachea las variantes optimizadas 30 días en el CDN/servidor.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

module.exports = nextConfig;
