"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  {
    src: "/brand/hero-1.jpg",
    alt: "Talismán artesanal dorado con piedra granate sobre terciopelo color vino.",
    category: "TALISMANES DE INTENCIÓN",
    title: "Una pieza que reconoce tu luz",
  },
  {
    src: "/brand/hero-2.jpg",
    alt: "Pulsera artesanal de cuentas cálidas y pequeños detalles en oro antiguo.",
    category: "AMULETOS HECHOS A MANO",
    title: "Lleva contigo lo que te inspira",
  },
  {
    src: "/brand/hero-3.jpg",
    alt: "Dije dorado con piedra de luna sobre lino natural y follaje seco.",
    category: "ARTE PARA ACOMPAÑARTE",
    title: "La magia que ya vive en ti",
  },
] as const;

export function HeroCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = slides[activeSlide];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 6200);

    return () => window.clearInterval(interval);
  }, []);

  function showPrevious() {
    setActiveSlide((current) => (current - 1 + slides.length) % slides.length);
  }

  function showNext() {
    setActiveSlide((current) => (current + 1) % slides.length);
  }

  return (
    <div id="coleccion" className="hero-carousel" role="region" aria-roledescription="carrusel" aria-label="Colección Dharma Kadabra">
      <div className="carousel-aura" aria-hidden="true" />
      <div className="hero-image-frame">
        <Image
          key={slide.src}
          className="hero-image"
          src={slide.src}
          alt={slide.alt}
          fill
          priority={activeSlide === 0}
          sizes="(max-width: 760px) 92vw, (max-width: 1100px) 48vw, 540px"
        />
        <div className="hero-image-shade" aria-hidden="true" />
        <div className="hero-image-caption" aria-live="polite" aria-atomic="true">
          <span>{slide.category}</span>
          <p>{slide.title}</p>
        </div>
        <span className="carousel-seal" aria-hidden="true">✧</span>
      </div>
      <div className="carousel-control-row">
        <div className="carousel-dots" role="group" aria-label="Elegir imagen de la colección">
          {slides.map((item, index) => (
            <button
              className={`carousel-dot${index === activeSlide ? " is-active" : ""}`}
              key={item.src}
              type="button"
              aria-label={`Mostrar imagen ${index + 1}: ${item.category.toLowerCase()}`}
              aria-pressed={index === activeSlide}
              onClick={() => setActiveSlide(index)}
            />
          ))}
        </div>
        <div className="carousel-arrows">
          <button type="button" onClick={showPrevious} aria-label="Imagen anterior">←</button>
          <button type="button" onClick={showNext} aria-label="Imagen siguiente">→</button>
        </div>
      </div>
    </div>
  );
}
