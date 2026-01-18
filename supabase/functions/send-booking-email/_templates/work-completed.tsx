import React from 'npm:react@18.3.1';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Preview,
} from 'npm:@react-email/components@0.0.22';

interface WorkCompletedProps {
  clientName: string;
  masterName: string;
  serviceName: string;
  completedDate: string;
  totalPrice: number;
  bookingId: string;
}

export const WorkCompletedEmail = ({
  clientName,
  masterName,
  serviceName,
  completedDate,
  totalPrice,
  bookingId,
}: WorkCompletedProps) => {
  const previewText = `${masterName} ha completado tu servicio de ${serviceName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>OFIZ</Text>
            <Text style={headerSubtitle}>✅ Trabajo Completado</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={heading}>
              ¡Tu servicio ha sido completado!
            </Text>

            <Text style={paragraph}>
              Hola {clientName},
            </Text>

            <Text style={paragraph}>
              {masterName} ha marcado como completado el servicio de <strong>{serviceName}</strong>. 
              Esperamos que hayas quedado satisfecho/a con el trabajo realizado.
            </Text>

            {/* Service Summary */}
            <Section style={summaryCard}>
              <Text style={summaryTitle}>📋 Resumen del Servicio</Text>
              <Hr style={divider} />
              
              <Text style={summaryRow}>
                <strong>Servicio:</strong> {serviceName}
              </Text>
              <Text style={summaryRow}>
                <strong>Profesional:</strong> {masterName}
              </Text>
              <Text style={summaryRow}>
                <strong>Fecha de realización:</strong> {completedDate}
              </Text>
              <Text style={summaryRow}>
                <strong>Total:</strong> ${totalPrice.toLocaleString('es-CL')}
              </Text>
            </Section>

            {/* Review Request */}
            <Section style={reviewSection}>
              <Text style={reviewTitle}>⭐ ¿Cómo fue tu experiencia?</Text>
              <Text style={reviewText}>
                Tu opinión es muy importante. Ayuda a otros usuarios y al profesional 
                dejando una reseña sobre el servicio recibido.
              </Text>
              
              <Section style={starsContainer}>
                <Text style={stars}>⭐⭐⭐⭐⭐</Text>
              </Section>
              
              <Button
                style={reviewButton}
                href={`https://ofiz-platform.lovable.app/client-dashboard?review=${bookingId}`}
              >
                Dejar mi Reseña
              </Button>
            </Section>

            {/* Escrow Notice */}
            <Section style={escrowNotice}>
              <Text style={escrowTitle}>🔒 Sobre tu pago</Text>
              <Text style={escrowText}>
                El pago se encuentra en custodia (escrow) hasta que confirmes que el trabajo 
                fue realizado satisfactoriamente. Si todo está bien, puedes liberar el pago 
                desde tu dashboard.
              </Text>
              <Button
                style={escrowButton}
                href="https://ofiz-platform.lovable.app/client-dashboard"
              >
                Confirmar y Liberar Pago
              </Button>
            </Section>

            {/* Problem Section */}
            <Section style={problemSection}>
              <Text style={problemTitle}>¿Tuviste algún problema?</Text>
              <Text style={problemText}>
                Si el trabajo no cumplió tus expectativas, puedes abrir una disputa 
                antes de liberar el pago. Nuestro equipo te ayudará a resolver cualquier inconveniente.
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © 2025 Ofiz. Todos los derechos reservados.
            </Text>
            <Text style={footerText}>
              ¿Necesitas ayuda? Contáctanos en soporte@ofiz.cl
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

const header = {
  backgroundColor: '#10b981',
  padding: '24px',
  textAlign: 'center' as const,
};

const logo = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
};

const headerSubtitle = {
  color: '#ffffff',
  fontSize: '14px',
  margin: '8px 0 0 0',
};

const content = {
  padding: '32px 24px',
};

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1f2937',
  marginBottom: '16px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#4b5563',
  marginBottom: '16px',
};

const summaryCard = {
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
  border: '1px solid #bbf7d0',
};

const summaryTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#166534',
  marginBottom: '8px',
};

const divider = {
  borderColor: '#bbf7d0',
  margin: '12px 0',
};

const summaryRow = {
  fontSize: '14px',
  color: '#166534',
  marginBottom: '8px',
  lineHeight: '20px',
};

const reviewSection = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
  textAlign: 'center' as const,
  border: '1px solid #fcd34d',
};

const reviewTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#92400e',
  marginBottom: '8px',
};

const reviewText = {
  fontSize: '14px',
  color: '#92400e',
  marginBottom: '16px',
  lineHeight: '20px',
};

const starsContainer = {
  marginBottom: '16px',
};

const stars = {
  fontSize: '32px',
  margin: '0',
};

const reviewButton = {
  backgroundColor: '#f59e0b',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  padding: '10px 24px',
  display: 'inline-block',
};

const escrowNotice = {
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
  textAlign: 'center' as const,
  border: '1px solid #bfdbfe',
};

const escrowTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1e40af',
  marginBottom: '8px',
};

const escrowText = {
  fontSize: '14px',
  color: '#1e40af',
  marginBottom: '16px',
  lineHeight: '20px',
};

const escrowButton = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  padding: '10px 24px',
  display: 'inline-block',
};

const problemSection = {
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  padding: '16px',
  border: '1px solid #fecaca',
};

const problemTitle = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#dc2626',
  marginBottom: '8px',
};

const problemText = {
  fontSize: '13px',
  color: '#dc2626',
  lineHeight: '18px',
  margin: '0',
};

const footer = {
  backgroundColor: '#f9fafb',
  padding: '24px',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '12px',
  color: '#9ca3af',
  marginBottom: '4px',
};

export default WorkCompletedEmail;
