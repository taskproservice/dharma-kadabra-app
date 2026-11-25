import * as React from "react";
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

export type AppointmentEmailModality = "IN_PERSON" | "VIDEO_CALL";

export interface AppointmentConfirmationProps {
  clientName: string;
  service: string;
  date: string;
  time: string;
  modality: AppointmentEmailModality;
  therapistName?: string | null;
  depositAmount?: number | null;
  folio?: string | null;
  accountUrl?: string;
}

const SERIF = "Georgia, 'Playfair Display', 'Times New Roman', serif";
const SANS = "'Helvetica Neue', Arial, Helvetica, sans-serif";

export function AppointmentConfirmation({
  clientName = "Viajera de Luz",
  service = "Lectura de Registros Akáshicos",
  date = "lunes, 1 de diciembre de 2026",
  time = "10:00 hrs",
  modality = "IN_PERSON",
  therapistName = null,
  depositAmount = null,
  folio = null,
  accountUrl = "https://dharmakadabra.mx/mi-cuenta",
}: AppointmentConfirmationProps) {
  const isVideoCall = modality === "VIDEO_CALL";
  const modalityLabel = isVideoCall
    ? "Videollamada (Zoom / Google Meet)"
    : "Presencial en el estudio · Tijuana";

  const preparationCopy = isVideoCall
    ? "Recibirás el enlace de la videollamada antes de tu sesión. Te recomendamos buscar un espacio silencioso, usar audífonos y tener cerca agua o tu cuaderno de intenciones."
    : "Te esperamos en nuestro santuario en Tijuana. Te sugerimos llegar entre 5 y 10 minutos antes para recibir tu sesión en calma y armonía.";

  return (
    <Html lang="es">
      <Head />
      <Preview>
        {`Tu cita de ${service} para el ${date} a las ${time} ha sido registrada · Dharma Kadabra`}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.card}>
          {/* Filete superior dorado institucional */}
          <Section style={styles.goldTopBar} />

          <Section style={styles.headerSection}>
            <Text style={styles.eyebrow}>DHARMA KADABRA · RESERVA REGISTRADA</Text>
            <Heading as="h1" style={styles.heading}>
              Tu espacio está apartado
            </Heading>
            <Text style={styles.lead}>
              Hola <strong style={styles.strong}>{clientName}</strong>, gracias por confiar tu
              camino a Dharma Kadabra. Hemos registrado los detalles de tu encuentro:
            </Text>
          </Section>

          {/* Ficha de la cita en Papiro cálido con acento dorado */}
          <Section style={styles.detailsSection}>
            <Section style={styles.detailsCard}>
              <Row style={styles.detailRow}>
                <Column style={styles.detailLabelCol}>
                  <Text style={styles.detailLabel}>SERVICIO</Text>
                </Column>
                <Column style={styles.detailValueCol}>
                  <Text style={styles.detailValue}>{service}</Text>
                </Column>
              </Row>

              <Hr style={styles.detailDivider} />

              <Row style={styles.detailRow}>
                <Column style={styles.detailLabelCol}>
                  <Text style={styles.detailLabel}>FECHA</Text>
                </Column>
                <Column style={styles.detailValueCol}>
                  <Text style={styles.detailValue}>{date}</Text>
                </Column>
              </Row>

              <Hr style={styles.detailDivider} />

              <Row style={styles.detailRow}>
                <Column style={styles.detailLabelCol}>
                  <Text style={styles.detailLabel}>HORA</Text>
                </Column>
                <Column style={styles.detailValueCol}>
                  <Text style={styles.detailValue}>{time}</Text>
                </Column>
              </Row>

              <Hr style={styles.detailDivider} />

              <Row style={styles.detailRow}>
                <Column style={styles.detailLabelCol}>
                  <Text style={styles.detailLabel}>MODALIDAD</Text>
                </Column>
                <Column style={styles.detailValueCol}>
                  <Text style={styles.modalityBadge}>{modalityLabel}</Text>
                </Column>
              </Row>

              {therapistName ? (
                <>
                  <Hr style={styles.detailDivider} />
                  <Row style={styles.detailRow}>
                    <Column style={styles.detailLabelCol}>
                      <Text style={styles.detailLabel}>GUÍA / TERAPEUTA</Text>
                    </Column>
                    <Column style={styles.detailValueCol}>
                      <Text style={styles.detailValue}>{therapistName}</Text>
                    </Column>
                  </Row>
                </>
              ) : null}

              {folio ? (
                <>
                  <Hr style={styles.detailDivider} />
                  <Row style={styles.detailRow}>
                    <Column style={styles.detailLabelCol}>
                      <Text style={styles.detailLabel}>FOLIO</Text>
                    </Column>
                    <Column style={styles.detailValueCol}>
                      <Text style={styles.folioValue}>{folio}</Text>
                    </Column>
                  </Row>
                </>
              ) : null}
            </Section>
          </Section>

          <Section style={styles.contentSection}>
            <Text style={styles.subheading}>Preparación para tu encuentro</Text>
            <Text style={styles.paragraph}>{preparationCopy}</Text>

            {depositAmount && depositAmount > 0 ? (
              <Section style={styles.depositNotice}>
                <Text style={styles.depositText}>
                  <strong style={styles.strong}>Confirmación de anticipo (20%):</strong> Para
                  confirmar definitivamente tu lugar, coordina tu anticipo de{" "}
                  <strong style={styles.strong}>
                    ${depositAmount.toLocaleString("es-MX")} MXN
                  </strong>{" "}
                  con nuestro equipo por WhatsApp. Tu horario ya se encuentra apartado.
                </Text>
              </Section>
            ) : (
              <Text style={styles.paragraph}>
                Nuestro equipo se pondrá en contacto contigo en breve para acompañarte en cualquier
                detalle previo a tu sesión.
              </Text>
            )}

            {accountUrl ? (
              <Section style={styles.ctaWrapper}>
                <Button href={accountUrl} style={styles.goldButton}>
                  Ver mi cita en Mi Cuenta
                </Button>
              </Section>
            ) : null}

            <Text style={styles.mutedNote}>
              ¿Necesitas reprogramar o tienes alguna pregunta? Puedes gestionar tu sesión desde{" "}
              {accountUrl ? (
                <Link href={accountUrl} style={styles.goldLink}>
                  Mi Cuenta
                </Link>
              ) : (
                "Mi Cuenta"
              )}{" "}
              o escribirnos directamente a{" "}
              <Link href="mailto:hola@dharmakadabra.mx" style={styles.goldLink}>
                hola@dharmakadabra.mx
              </Link>
              .
            </Text>
          </Section>

          <Hr style={styles.footerDivider} />

          <Section style={styles.footerSection}>
            <Text style={styles.motto}>Un camino hacia ti.</Text>
            <Text style={styles.pillars}>CONECTA · TRANSFORMA · ARMONIZA</Text>
            <Text style={styles.footerMeta}>
              Dharma Kadabra · Tijuana, B.C., México · hola@dharmakadabra.mx
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    margin: 0,
    padding: "36px 16px",
    backgroundColor: "#F4EFE6",
    fontFamily: SANS,
    color: "#2C241B",
  },
  card: {
    maxWidth: "580px",
    margin: "0 auto",
    backgroundColor: "#FCFAF5",
    border: "1px solid #E2D9C8",
    borderRadius: "20px",
    overflow: "hidden",
  },
  goldTopBar: {
    height: "4px",
    width: "100%",
    backgroundColor: "#C5A059",
  },
  headerSection: {
    padding: "34px 36px 12px 36px",
  },
  eyebrow: {
    margin: "0 0 10px 0",
    fontFamily: SANS,
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "2.8px",
    textTransform: "uppercase",
    color: "#8B6914",
  },
  heading: {
    margin: "0 0 16px 0",
    fontFamily: SERIF,
    fontSize: "30px",
    fontWeight: 400,
    lineHeight: "1.2",
    color: "#2C241B",
  },
  lead: {
    margin: 0,
    fontFamily: SANS,
    fontSize: "15px",
    lineHeight: "1.7",
    color: "#3D352B",
  },
  strong: {
    color: "#2C241B",
    fontWeight: 700,
  },
  detailsSection: {
    padding: "14px 36px 8px 36px",
  },
  detailsCard: {
    backgroundColor: "#F4EFE6",
    border: "1px solid #DFD4BE",
    borderLeft: "4px solid #C5A059",
    borderRadius: "14px",
    padding: "18px 22px",
  },
  detailRow: {
    width: "100%",
  },
  detailLabelCol: {
    width: "38%",
    verticalAlign: "top",
    paddingRight: "12px",
  },
  detailValueCol: {
    width: "62%",
    verticalAlign: "top",
  },
  detailLabel: {
    margin: "4px 0",
    fontFamily: SANS,
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "1.6px",
    textTransform: "uppercase",
    color: "#805F2B",
  },
  detailValue: {
    margin: "3px 0",
    fontFamily: SANS,
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: "1.5",
    color: "#2C241B",
  },
  modalityBadge: {
    margin: "3px 0",
    fontFamily: SANS,
    fontSize: "14px",
    fontWeight: 700,
    lineHeight: "1.5",
    color: "#6B4E1E",
  },
  folioValue: {
    margin: "3px 0",
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "1.5px",
    color: "#2C241B",
  },
  detailDivider: {
    borderColor: "#E4DAC7",
    borderTopWidth: "1px",
    margin: "10px 0",
  },
  contentSection: {
    padding: "14px 36px 28px 36px",
  },
  subheading: {
    margin: "8px 0 6px 0",
    fontFamily: SERIF,
    fontSize: "19px",
    fontWeight: 400,
    color: "#2C241B",
  },
  paragraph: {
    margin: "0 0 16px 0",
    fontFamily: SANS,
    fontSize: "14px",
    lineHeight: "1.7",
    color: "#514333",
  },
  depositNotice: {
    backgroundColor: "#FAF6EC",
    border: "1px solid #DFC99B",
    borderRadius: "12px",
    padding: "14px 18px",
    margin: "0 0 20px 0",
  },
  depositText: {
    margin: 0,
    fontFamily: SANS,
    fontSize: "13px",
    lineHeight: "1.65",
    color: "#3D352B",
  },
  ctaWrapper: {
    textAlign: "center",
    margin: "24px 0 22px 0",
  },
  goldButton: {
    backgroundColor: "#C5A059",
    borderRadius: "999px",
    color: "#2C241B",
    display: "inline-block",
    fontFamily: SANS,
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "2px",
    textTransform: "uppercase",
    textDecoration: "none",
    padding: "14px 30px",
  },
  mutedNote: {
    margin: 0,
    fontFamily: SANS,
    fontSize: "12.5px",
    lineHeight: "1.65",
    color: "#6B5D4A",
  },
  goldLink: {
    color: "#8B6914",
    fontWeight: 600,
    textDecoration: "underline",
  },
  footerDivider: {
    borderColor: "#E6DFD1",
    margin: "0 36px",
  },
  footerSection: {
    padding: "22px 36px 30px 36px",
    textAlign: "center",
  },
  motto: {
    margin: "0 0 6px 0",
    fontFamily: SERIF,
    fontStyle: "italic",
    fontSize: "16px",
    color: "#6B4E1E",
  },
  pillars: {
    margin: "0 0 10px 0",
    fontFamily: SANS,
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "2.4px",
    color: "#8B6914",
  },
  footerMeta: {
    margin: 0,
    fontFamily: SANS,
    fontSize: "12px",
    color: "#8A7F6E",
  },
};

export default AppointmentConfirmation;
