# Dharma Kadabra

Landing page en Next.js App Router para Dharma Kadabra, con el chat Cozy, estilos Tailwind CSS 4 y un esquema Prisma listo para PostgreSQL.

## Requisitos

- Node.js 20.9 o superior
- PostgreSQL para utilizar Prisma
- Una clave de DeepSeek para habilitar respuestas de Cozy

## Desarrollo

```bash
npm install
cp .env.example .env
npm run dev
```

Completa `DATABASE_URL` y `DEEPSEEK_API_KEY` en `.env`. La interfaz del chat funciona sin la clave, pero la API responde con un mensaje de configuración hasta que exista una clave válida.

## Prisma

```bash
npm run db:generate
npm run db:migrate -- --name init
```

## Verificación

```bash
npm run typecheck
npm run test
npm run build
```

## Imágenes de marca

Los tres recursos `hero-*.jpg` son imágenes editoriales provisionales creadas para la maqueta. En este repositorio no se recibieron los adjuntos originales; `logo.png` es un monograma temporal y `creator.jpg` marca explícitamente el espacio reservado para el retrato real de Paola. Sustituye esos dos recursos por los originales conservando los nombres de archivo para integrarlos sin cambiar el código.
