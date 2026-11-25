/**
 * Plantillas HTML de correos transaccionales (Resend).
 *
 * Identidad Premium Orgánico: fondo papiro (#F4EFE6), dorado (#C5A059),
 * café (#2C241B). Todo con estilos inline (los clientes de correo no
 * ejecutan CSS externo).
 */

const FONT = "Georgia, 'Times New Roman', serif";
const SANS = "Arial, Helvetica, sans-serif";

function shell(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="es">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background-color:#F4EFE6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4EFE6;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#FCFAF5;border:1px solid #E6DFD1;border-radius:16px;overflow:hidden;">
        <tr><td style="padding:28px 32px 0 32px;">
          <p style="margin:0;font-family:${SANS};font-size:11px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;color:#8B6914;">Dharma Kadabra</p>
          <h1 style="margin:10px 0 0 0;font-family:${FONT};font-size:26px;line-height:1.2;color:#2C241B;">${title}</h1>
        </td></tr>
        <tr><td style="padding:18px 32px 28px 32px;font-family:${SANS};font-size:15px;line-height:1.65;color:#3D352B;">
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:0 32px 28px 32px;">
          <p style="margin:0;font-family:${FONT};font-style:italic;font-size:14px;color:#6B4E1E;">Un camino hacia ti.</p>
          <p style="margin:14px 0 0 0;font-family:${SANS};font-size:12px;color:#8A7F6E;">Dharma Kadabra · hola@dharmakadabra.mx</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function button(url: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 6px 0;"><tr><td style="background-color:#C5A059;border-radius:999px;">
    <a href="${url}" style="display:inline-block;padding:13px 28px;font-family:${SANS};font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#2C241B;text-decoration:none;">${label}</a>
  </td></tr></table>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Enlace de restablecimiento de contraseña (válido 1 hora, un solo uso). */
export function passwordResetEmail(resetUrl: string): { subject: string; html: string } {
  const subject = "Restablece tu contraseña · Dharma Kadabra";
  const html = shell(
    "Restablece tu contraseña",
    `<p>Recibimos tu solicitud para restablecer la contraseña de tu cuenta en Dharma Kadabra.</p>
     <p>Pulsa el botón para elegir una contraseña nueva. El enlace es válido por <strong>1 hora</strong> y solo puede usarse una vez.</p>
     ${button(resetUrl, "Elegir contraseña nueva")}
     <p style="font-size:13px;color:#8A7F6E;">Si no solicitaste este cambio, puedes ignorar este correo: tu contraseña no se modificará.</p>`,
  );
  return { subject, html };
}

export interface AppointmentConfirmationData {
  clientName: string;
  service: string;
  /** Fecha legible en español (p. ej. "lunes 1 de diciembre de 2026, 10:00"). */
  dateLabel: string;
  modality: "IN_PERSON" | "VIDEO_CALL";
  /** Anticipo del 20% en MXN (solo reservas de clientes). */
  depositAmount?: number | null;
  accountUrl: string;
}

/** Confirmación de reserva enviada al cliente tras crear la cita. */
export function appointmentConfirmationEmail(data: AppointmentConfirmationData): {
  subject: string;
  html: string;
} {
  const subject = "Tu reserva está registrada · Dharma Kadabra";
  const modalityLabel = data.modality === "VIDEO_CALL" ? "Videollamada (Zoom / Meet)" : "Presencial en el estudio";
  const depositHtml =
    data.depositAmount && data.depositAmount > 0
      ? `<p>Para confirmar tu lugar, coordina tu <strong>anticipo de $${data.depositAmount.toLocaleString("es-MX")} MXN</strong> (20%) con nuestro equipo por WhatsApp. Tu horario queda apartado mientras tanto.</p>`
      : `<p>Nuestro equipo confirmará tu sesión por WhatsApp en breve.</p>`;

  const html = shell(
    "Tu reserva está registrada",
    `<p>Hola ${escapeHtml(data.clientName)}, gracias por reservar con Dharma Kadabra. Tu sesión quedó apartada:</p>
     <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;border:1px solid #E6DFD1;border-radius:12px;">
       <tr><td style="padding:14px 18px;font-size:14px;">
         <p style="margin:0 0 6px 0;"><strong>Servicio:</strong> ${escapeHtml(data.service)}</p>
         <p style="margin:0 0 6px 0;"><strong>Fecha y hora:</strong> ${escapeHtml(data.dateLabel)}</p>
         <p style="margin:0;"><strong>Modalidad:</strong> ${modalityLabel}</p>
       </td></tr>
     </table>
     ${depositHtml}
     ${button(data.accountUrl, "Ver mi cuenta")}
     <p style="font-size:13px;color:#8A7F6E;">Si necesitas cambiar o cancelar, escríbenos por WhatsApp y te acompañamos.</p>`,
  );
  return { subject, html };
}
