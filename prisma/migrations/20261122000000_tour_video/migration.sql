-- Tour de marca · video inmersivo de la landing ("Quiénes somos") con
-- capítulos sincronizados por tiempo (Json) y CTA final configurable.
CREATE TABLE "TourVideo" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "chapters" JSONB NOT NULL DEFAULT '[]',
    "ctaText" TEXT NOT NULL DEFAULT 'Explorar la Colección',
    "ctaLink" TEXT NOT NULL DEFAULT '#coleccion',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TourVideo_pkey" PRIMARY KEY ("id")
);
