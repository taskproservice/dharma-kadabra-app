import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export interface PasswordResetProps {
  resetUrl: string;
  userName?: string | null;
  expiresInLabel?: string;
}

const SERIF = "Georgia, 'Playfair Display', 'Times New Roman', serif";
const SANS = "'Helvetica Neue', Arial, Helvetica, sans-serif";

export function PasswordReset({
  resetUrl = "https://dharmakadabra.mx/mi-cuenta/restablecer?token=ejemplo",
  userName = null,
  expiresInLabel = "1 hora",
}: PasswordResetProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Restablece tu contraseña en Dharma Kadabra (enlace válido por 1 hora)</Preview>
      <Body style={styles.body}>
        <Container style={styles.card}>
          {/* Filete superior dorado institucional */}
          <Section style={styles.goldTopBar} />

          <Section style={styles.headerSection}>
            <Text style={styles.eyebrow}>DHARMA KADABRA · SEGURIDAD DE TU CUENTA</Text>
            <Heading as="h1" style={styles.heading}>
              Restablece tu contraseña
            </Heading>
          </Section>

          <Section style={styles.contentSection}>
            <Text style={styles.paragraph}>
              {userName ? (
                <>
                  Hola <strong style={styles.strong}>{userName}</strong>, recibimos
                </>
              ) : (
                "Recibimos"
              )}{" "}
              una solicitud para crear una nueva contraseña para tu cuenta en{" "}
              <strong style={styles.strong}>Dharma Kadabra</strong>.
            </Text>

            <Text style={styles.paragraph}>
              Haz clic en el botón dorado para elegir tu nueva contraseña. Por tu seguridad, este
              enlace es de un solo uso y estará activo durante{" "}
              <strong style={styles.strong}>{expiresInLabel}</strong>.
            </Text>

            <Section style={styles.ctaWrapper}>
              <Button href={resetUrl} style={styles.goldButton}>
                Restablecer contraseña
              </Button>
            </Section>

            <Section style={styles.fallbackBox}>
              <Text style={styles.fallbackLabel}>
                Si el botón no abre directamente, copia y pega este enlace en tu navegador:
              </Text>
              <Link href={resetUrl} style={styles.fallbackLink}>
                {resetUrl}
              </Link>
            </Section>

            <Text style={styles.securityNote}>
              Si no solicitaste este cambio, puedes ignorar este correo con total tranquilidad: tu
              contraseña actual permanecerá intacta y nadie podrá acceder a tu cuenta.
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
    maxWidth: "560px",
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
    padding: "34px 36px 8px 36px",
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
    margin: 0,
    fontFamily: SERIF,
    fontSize: "30px",
    fontWeight: 400,
    lineHeight: "1.2",
    color: "#2C241B",
  },
  contentSection: {
    padding: "12px 36px 28px 36px",
  },
  paragraph: {
    margin: "0 0 16px 0",
    fontFamily: SANS,
    fontSize: "15px",
    lineHeight: "1.7",
    color: "#3D352B",
  },
  strong: {
    color: "#2C241B",
    fontWeight: 700,
  },
  ctaWrapper: {
    textAlign: "center",
    margin: "28px 0 26px 0",
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
    padding: "15px 34px",
  },
  fallbackBox: {
    backgroundColor: "#F4EFE6",
    border: "1px solid #E2D8C5",
    borderLeft: "3px solid #C5A059",
    borderRadius: "12px",
    padding: "14px 16px",
    margin: "0 0 20px 0",
  },
  fallbackLabel: {
    margin: "0 0 6px 0",
    fontFamily: SANS,
    fontSize: "12px",
    lineHeight: "1.5",
    color: "#6B5D4A",
  },
  fallbackLink: {
    fontFamily: SANS,
    fontSize: "12px",
    lineHeight: "1.5",
    color: "#8B6914",
    wordBreak: "break-all",
    textDecoration: "underline",
  },
  securityNote: {
    margin: 0,
    fontFamily: SANS,
    fontSize: "12.5px",
    lineHeight: "1.65",
    color: "#6B5D4A",
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

export default PasswordReset;
