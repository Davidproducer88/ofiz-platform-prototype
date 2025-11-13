import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
  Hr,
  Link,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface FounderWelcomeEmailProps {
  userName: string;
  discountCode: string;
  discountPercentage: number;
  registrationDate: string;
}

export const FounderWelcomeEmail = ({
  userName,
  discountCode,
  discountPercentage,
  registrationDate,
}: FounderWelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>🎉 ¡Bienvenido al Programa de Fundadores de Ofiz!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🎉 ¡Felicidades, {userName}!</Heading>
        
        <Text style={text}>
          Estás entre los <strong>primeros 1,000 usuarios fundadores</strong> de Ofiz.
          Este es un momento histórico y estamos emocionados de tenerte con nosotros.
        </Text>

        <Section style={benefitsContainer}>
          <Heading style={h2}>✨ Tus Beneficios Lifetime</Heading>
          
          <Text style={benefitItem}>
            🎯 <strong>Tu Código Exclusivo:</strong>
          </Text>
          <Section style={codeBox}>
            <Text style={codeText}>{discountCode}</Text>
          </Section>
          
          <Text style={text}>
            Este código te da <strong>{discountPercentage}% de descuento</strong> en todos los servicios,
            sin límite de usos y sin fecha de expiración.
          </Text>

          <Hr style={divider} />

          <Text style={benefitItem}>
            🌟 <strong>Beneficios Garantizados de por Vida:</strong>
          </Text>
          <ul style={list}>
            <li style={listItem}>
              <strong>{discountPercentage}% de descuento permanente</strong> en todos los servicios
            </li>
            <li style={listItem}>
              <strong>Prioridad en el soporte</strong> - Respuestas más rápidas
            </li>
            <li style={listItem}>
              <strong>Acceso anticipado</strong> a nuevas funcionalidades
            </li>
            <li style={listItem}>
              <strong>Badge exclusivo de Fundador</strong> en tu perfil
            </li>
            <li style={listItem}>
              <strong>Invitaciones VIP</strong> a eventos y promociones especiales
            </li>
            <li style={listItem}>
              <strong>Comisiones reducidas</strong> si ofreces servicios
            </li>
            <li style={listItem}>
              <strong>Voz en el desarrollo</strong> - Tu feedback es prioritario
            </li>
          </ul>

          <Hr style={divider} />

          <Text style={benefitItem}>
            📅 <strong>Fecha de Registro:</strong> {registrationDate}
          </Text>
          <Text style={text}>
            Este beneficio es <strong>tuyo para siempre</strong>, sin importar qué cambios
            hagamos en precios o planes en el futuro.
          </Text>
        </Section>

        <Section style={ctaContainer}>
          <Text style={text}>
            <strong>¿Listo para comenzar?</strong>
          </Text>
          <Link
            href="https://ofiz.uy"
            style={button}
          >
            Explorar Servicios
          </Link>
        </Section>

        <Hr style={divider} />

        <Section style={footerSection}>
          <Text style={footerText}>
            <strong>🙏 Gracias por creer en Ofiz</strong>
          </Text>
          <Text style={footerText}>
            Como fundador, eres parte fundamental de nuestra historia. Tu apoyo temprano
            nos ayuda a construir la mejor plataforma de servicios profesionales de Uruguay.
          </Text>
          <Text style={footerText}>
            Si tienes alguna pregunta o sugerencia, no dudes en contactarnos.
            Tu opinión es invaluable.
          </Text>
          <Text style={signature}>
            Con gratitud,<br />
            <strong>El equipo de Ofiz</strong>
          </Text>
        </Section>

        <Hr style={divider} />

        <Text style={footer}>
          <Link
            href="https://ofiz.uy"
            style={{ ...link, color: '#898989' }}
          >
            Ofiz.uy
          </Link>
          {' • '}
          <Link
            href="https://ofiz.uy/help-center"
            style={{ ...link, color: '#898989' }}
          >
            Centro de Ayuda
          </Link>
          {' • '}
          <Link
            href="https://ofiz.uy/terms"
            style={{ ...link, color: '#898989' }}
          >
            Términos
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
);

export default FounderWelcomeEmail;

// Estilos
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  marginTop: '40px',
  marginBottom: '40px',
  borderRadius: '8px',
  maxWidth: '600px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 20px',
  padding: '0',
  lineHeight: '1.2',
};

const h2 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '20px 0 15px',
  padding: '0',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
};

const benefitItem = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '12px 0 8px',
};

const benefitsContainer = {
  backgroundColor: '#fef3c7',
  borderLeft: '4px solid #f59e0b',
  padding: '20px',
  margin: '20px 0',
  borderRadius: '4px',
};

const codeBox = {
  backgroundColor: '#fff',
  border: '2px dashed #f59e0b',
  borderRadius: '8px',
  padding: '20px',
  margin: '15px 0',
  textAlign: 'center' as const,
};

const codeText = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#f59e0b',
  letterSpacing: '2px',
  margin: '0',
  fontFamily: 'monospace',
};

const list = {
  paddingLeft: '20px',
  margin: '12px 0',
};

const listItem = {
  color: '#333',
  fontSize: '15px',
  lineHeight: '1.8',
  marginBottom: '8px',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const ctaContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#f59e0b',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  margin: '10px 0',
};

const footerSection = {
  margin: '30px 0',
};

const footerText = {
  color: '#555',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '12px 0',
};

const signature = {
  color: '#333',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '20px 0 0',
  fontStyle: 'italic',
};

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '1.5',
  marginTop: '32px',
  textAlign: 'center' as const,
};

const link = {
  color: '#f59e0b',
  textDecoration: 'underline',
};
