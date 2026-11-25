import type { Metadata } from "next";
import { LegalList, LegalPage, LegalSection } from "../../components/landing/legal-page";

export const metadata: Metadata = {
  title: "Términos y Condiciones · Dharma Kadabra",
  description:
    "Condiciones de uso del sitio, reservas de sesiones y compras en la tienda Dharma Kadabra.",
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Documento legal"
      title={
        <>
          Términos y <em className="italic text-[#8B6914]">Condiciones</em>
        </>
      }
      intro="Al navegar o comprar en Dharma Kadabra aceptas estos términos. Te invitamos a leerlos con calma: describen cómo funcionan las reservas, los pagos, las cancelaciones y el uso del sitio."
      updated="noviembre de 2026"
    >
      <LegalSection title="1. Objeto del sitio">
        <p>
          Dharma Kadabra es una plataforma digital de bienestar que ofrece sesiones y rituales
          (lecturas de runas, registros akáshicos, acompañamiento) y una tienda de piezas
          artesanales (pulseras, cadenas, runas y piedras). El contenido es de carácter
          espiritual y de bienestar; no sustituye consejo médico, psicológico o financiero.
        </p>
      </LegalSection>

      <LegalSection title="2. Reservas y anticipos">
        <LegalList
          items={[
            "Al reservar una sesión apartas el horario con estado pendiente.",
            "Para confirmar tu lugar se requiere un anticipo del 20% del precio de la sesión, coordinado con nuestro equipo.",
            "La modalidad puede ser presencial en el estudio o videollamada (Zoom / Meet).",
            "Te pedimos llegar o conectarte 5 minutos antes de tu sesión.",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Cancelaciones y reprogramaciones">
        <LegalList
          items={[
            "Puedes reprogramar o cancelar tu cita desde Mi Cuenta o por WhatsApp.",
            "Cancelaciones con al menos 24 horas de anticipación: reembolso o crédito del anticipo.",
            "Cancelaciones con menos de 24 horas: el anticipo no es reembolsable, pero puedes reprogramar una vez sin costo.",
            "Si no te presentas a tu sesión sin aviso, el anticipo no es reembolsable.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Compras en la tienda">
        <LegalList
          items={[
            "Los precios se muestran en pesos mexicanos (MXN) e incluyen IVA cuando aplica.",
            "Las piezas son artesanales: puede haber pequeñas variaciones en color, veta o tamaño respecto a la fotografía.",
            "El pedido se confirma por WhatsApp con nuestro equipo antes del pago.",
            "Consulta la Política de Envíos para tiempos, costos y devoluciones.",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Uso del sitio">
        <LegalList
          items={[
            "No uses el sitio para fines ilícitos ni para intentar acceder a cuentas o paneles ajenos.",
            "El contenido (textos, imágenes, audios y videos) es propiedad de Dharma Kadabra; no puede reproducirse sin autorización.",
            "Podemos suspender el acceso de cuentas que incumplan estos términos.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Responsabilidad">
        <p>
          Trabajamos para que el sitio opere sin interrupciones, pero no garantizamos
          disponibilidad ininterrumpida. Nuestra responsabilidad se limita al valor de la
          sesión o producto adquirido. Las experiencias espirituales son personales y subjetivas.
        </p>
      </LegalSection>

      <LegalSection title="7. Contacto">
        <p>
          Para dudas sobre estos términos escríbenos a{" "}
          <strong>hola@dharmakadabra.mx</strong> o por WhatsApp desde el sitio.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
