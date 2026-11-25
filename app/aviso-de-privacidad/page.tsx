import type { Metadata } from "next";
import { LegalList, LegalPage, LegalSection } from "../../components/landing/legal-page";

export const metadata: Metadata = {
  title: "Aviso de Privacidad · Dharma Kadabra",
  description:
    "Cómo Dharma Kadabra trata, protege y utiliza tu información personal conforme a la legislación mexicana.",
};

export default function PrivacyNoticePage() {
  return (
    <LegalPage
      eyebrow="Documento legal"
      title={
        <>
          Aviso de <em className="italic text-[#8B6914]">Privacidad</em>
        </>
      }
      intro="En Dharma Kadabra respetamos tu privacidad. Este aviso explica qué datos recopilamos, para qué los usamos y qué derechos tienes sobre ellos, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) de México."
      updated="noviembre de 2026"
    >
      <LegalSection title="1. Responsable del tratamiento">
        <p>
          El responsable del tratamiento de tus datos personales es{" "}
          <strong>[Nombre comercial / razón social]</strong>, con domicilio en{" "}
          <strong>[Dirección, ciudad, estado]</strong> y correo electrónico{" "}
          <strong>hola@dharmakadabra.mx</strong>. Para cualquier asunto relacionado con tu
          privacidad puedes escribirnos a ese correo.
        </p>
      </LegalSection>

      <LegalSection title="2. Datos que recopilamos">
        <p>Recopilamos únicamente los datos necesarios para operar el sitio y tus reservas:</p>
        <LegalList
          items={[
            "Datos de contacto: nombre, correo electrónico y teléfono / WhatsApp.",
            "Datos de reserva: servicio elegido, fecha, modalidad (presencial o videollamada) y terapeuta asignado.",
            "Datos de compra: productos adquiridos y comprobantes de pago (sin datos completos de tarjeta).",
            "Datos de cuenta: correo y contraseña cifrada (nunca en texto plano).",
            "Datos de navegación: visitas a la tienda y productos consultados (analítica agregada).",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Finalidades del tratamiento">
        <LegalList
          items={[
            "Gestionar tus reservas, citas y recordatorios.",
            "Procesar y entregar tus pedidos de la tienda holística.",
            "Operar tu cuenta (acceso, historial, recuperación de contraseña).",
            "Enviarte comunicaciones relacionadas con tus reservas y compras.",
            "Enviarte novedades y rituales solo si aceptaste recibirlas (puedes darte de baja en cualquier momento).",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Cómo protegemos tu información">
        <p>
          Tus contraseñas se almacenan cifradas, las sesiones viajan por conexiones seguras
          (HTTPS) y el acceso a los paneles internos está protegido por roles. No vendemos ni
          compartimos tus datos personales con terceros con fines publicitarios.
        </p>
      </LegalSection>

      <LegalSection title="5. Tus derechos (ARCO)">
        <p>
          Puedes ejercer tus derechos de Acceso, Rectificación, Cancelación y Oposición (ARCO)
          escribiendo a <strong>hola@dharmakadabra.mx</strong> con el asunto
          “Derechos ARCO”. Responderemos en un plazo máximo de 20 días hábiles.
        </p>
      </LegalSection>

      <LegalSection title="6. Cookies y tecnologías similares">
        <p>
          Utilizamos cookies esenciales para mantener tu sesión y tu carrito. No utilizamos
          cookies publicitarias de terceros. Puedes desactivarlas desde tu navegador; algunas
          funciones dejarán de operar.
        </p>
      </LegalSection>

      <LegalSection title="7. Cambios a este aviso">
        <p>
          Podemos actualizar este aviso para reflejar cambios en nuestras prácticas o en la
          legislación. La versión vigente siempre estará publicada en esta página.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
