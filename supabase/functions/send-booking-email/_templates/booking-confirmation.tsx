import React from 'npm:react@18.3.1';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Img,
  Hr,
  Preview,
} from 'npm:@react-email/components@0.0.22';

interface BookingConfirmationProps {
  recipientName: string;
  recipientRole: 'client' | 'master';
  serviceName: string;
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  totalPrice: number;
  otherPartyName: string;
  bookingId: string;
}

export const BookingConfirmationEmail = ({
  recipientName,
  recipientRole,
  serviceName,
  scheduledDate,
  scheduledTime,
  address,
  totalPrice,
  otherPartyName,
  bookingId,
}: BookingConfirmationProps) => {
  const isClient = recipientRole === 'client';
  const previewText = isClient
    ? `Tu reserva de ${serviceName} ha sido confirmada`
    : `Nueva reserva de ${serviceName} recibida`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>OFIZ</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={heading}>
              {isClient ? '¡Reserva Confirmada!' : '¡Nueva Reserva!'}
            </Text>

            <Text style={paragraph}>
              Hola {recipientName},
            </Text>

            <Text style={paragraph}>
              {isClient
                ? `Tu reserva de servicio ha sido confirmada exitosamente. ${otherPartyName} te atenderá según los detalles a continuación.`
                : `Has recibido una nueva reserva de ${otherPartyName}. Revisa los detalles a continuación.`}
            </Text>

            {/* Booking Details Card */}
            <Section style={detailsCard}>
              <Text style={detailsTitle}>📋 Detalles de la Reserva</Text>
              <Hr style={divider} />
              
              <Text style={detailRow}>
                <strong>Servicio:</strong> {serviceName}
              </Text>
              <Text style={detailRow}>
                <strong>📅 Fecha:</strong> {scheduledDate}
              </Text>
              <Text style={detailRow}>
                <strong>🕐 Hora:</strong> {scheduledTime}
              </Text>
              <Text style={detailRow}>
                <strong>📍 Dirección:</strong> {address}
              </Text>
              <Text style={detailRow}>
                <strong>💰 Total:</strong> ${totalPrice.toLocaleString('es-CL')}
              </Text>
              <Text style={detailRow}>
                <strong>{isClient ? '👷 Profesional:' : '👤 Cliente:'}</strong> {otherPartyName}
              </Text>
            </Section>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button
                style={button}
                href={`https://ofiz-platform.lovable.app/${isClient ? 'client-dashboard' : 'master-dashboard'}`}
              >
                Ver en mi Dashboard
              </Button>
            </Section>

            {/* Tips Section */}
            <Section style={tipsSection}>
              <Text style={tipsTitle}>
                {isClient ? '💡 Consejos para tu cita:' : '💡 Recordatorio:'}
              </Text>
              <Text style={tipItem}>
                {isClient
                  ? '• Asegúrate de estar disponible en el horario acordado'
                  : '• Confirma la dirección antes de salir'}
              </Text>
              <Text style={tipItem}>
                {isClient
                  ? '• Ten el área de trabajo accesible'
                  : '• Lleva todas las herramientas necesarias'}
              </Text>
              <Text style={tipItem}>
                {isClient
                  ? '• Puedes comunicarte con el profesional por el chat'
                  : '• Comunícate con el cliente si tienes dudas'}
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

const detailsCard = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
  border: '1px solid #e5e7eb',
};

const detailsTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1f2937',
  marginBottom: '8px',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '12px 0',
};

const detailRow = {
  fontSize: '14px',
  color: '#4b5563',
  marginBottom: '8px',
  lineHeight: '20px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const button = {
  backgroundColor: '#10b981',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  padding: '12px 32px',
  display: 'inline-block',
};

const tipsSection = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '16px',
};

const tipsTitle = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#92400e',
  marginBottom: '8px',
};

const tipItem = {
  fontSize: '13px',
  color: '#92400e',
  marginBottom: '4px',
  lineHeight: '18px',
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

export default BookingConfirmationEmail;
