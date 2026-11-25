import type { Metadata } from "next";
import { LegalList, LegalPage, LegalSection } from "../../components/landing/legal-page";

export const metadata: Metadata = {
  title: "Política de Envíos · Dharma Kadabra",
  description:
    "Tiempos, costos y condiciones de envío de pedidos de la tienda Dharma Kadabra en México.",
};

export default function ShippingPolicyPage() {
  return (
    <LegalPage
      eyebrow="Documento legal"
      title={
        <>
          Política de <em className="italic text-[#8B6914]">Envíos</em>
        </>
      }
      intro="Cada pieza de Dharma Kadabra se prepara y empaca a mano. Esta política describe cómo enviamos tu pedido, cuánto tarda y qué hacer si algo no llega como esperabas."
      updated="noviembre de 2026"
    >
      <LegalSection title="1. Cobertura">
        <p>
          Realizamos envíos a todo México. Por el momento no enviamos al extranjero; si vives
          fuera del país, escríbenos y evaluamos tu caso.
        </p>
      </LegalSection>

      <LegalSection title="2. Tiempos de preparación y entrega">
        <LegalList
          items={[
            "Preparación: 1 a 3 días hábiles después de confirmado tu pedido.",
            "Entrega estándar: 3 a 7 días hábiles según tu zona (Tijuana y Baja California: 1 a 3 días).",
            "Los tiempos pueden variar por temporada alta, clima o paquetería; te compartiremos tu número de guía en cuanto salga.",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Costos de envío">
        <LegalList
          items={[
            "Envío gratis en pedidos dentro de México a partir de [monto mínimo, p. ej. $999 MXN].",
            "Costo estándar según paquetería y destino; se confirma por WhatsApp antes del pago.",
            "Entregas locales en Tijuana pueden coordinarse para recoger en estudio.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Empaque y cuidado">
        <p>
          Empacamos cada pieza con protección reforzada (caja rígida, burbuja y tela) para que
          llegue en perfectas condiciones. Al recibir tu pedido, revísalo en las primeras 48
          horas.
        </p>
      </LegalSection>

      <LegalSection title="5. Devoluciones y cambios">
        <LegalList
          items={[
            "Tienes 7 días naturales desde la entrega para solicitar devolución o cambio.",
            "La pieza debe estar sin uso, en su empaque original y con sus accesorios.",
            "Por higiene y seguridad no aceptamos devoluciones de veladoras ni productos abiertos.",
            "Si tu pieza llega dañada, envíanos foto dentro de 48 horas y te la reponemos o reembolsamos sin costo de regreso.",
            "El reembolso se procesa por el mismo medio de pago en un plazo de 5 a 10 días hábiles.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Contacto de envíos">
        <p>
          Para rastrear tu pedido o iniciar una devolución escríbenos a{" "}
          <strong>hola@dharmakadabra.mx</strong> o por WhatsApp con tu número de pedido.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
