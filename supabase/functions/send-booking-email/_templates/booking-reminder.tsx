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

interface BookingReminderProps {
  recipientName: string;
  recipientRole: 'client' | 'master';
  serviceName: string;
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  otherPartyName: string;
  hoursUntil: number;
}

export const BookingReminderEmail = ({
  recipientName,
  recipientRole,
  serviceName,
  scheduledDate,
  scheduledTime,
  address,
  otherPartyName,
  hoursUntil,
}: BookingReminderProps) => {
  const isClient = recipientRole === 'client';
  const previewText = `Recordatorio: Tu cita de ${serviceName} es en ${hoursUntil} horas`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>OFIZ</Text>
            <Text style={headerSubtitle}>⏰ Recordatorio de Cita</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={heading}>
              ¡Tu cita es en {hoursUntil} horas!
            </Text>

            <Text style={paragraph}>
              Hola {recipientName},
            </Text>

            <Text style={paragraph}>
              Te recordamos que tienes una cita programada para mañana. 
              {isClient
                ? ` ${otherPartyName} te visitará para realizar el servicio.`
                : ` Tienes un servicio agendado con ${otherPartyName}.`}
            </Text>

            {/* Booking Details Card */}
            <Section style={detailsCard}>
              <Text style={detailsTitle}>📋 Detalles de la Cita</Text>
              <Hr style={divider} />
              
              <Text style={detailRow}>
                <strong>🔧 Servicio:</strong> {serviceName}
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
                <strong>{isClient ? '👷 Profesional:' : '👤 Cliente:'}</strong> {otherPartyName}
              </Text>
            </Section>

            {/* Urgency Banner */}
            <Section style={urgencyBanner}>
              <Text style={urgencyText}>
                ⚡ Si necesitas reagendar o cancelar, hazlo con la mayor anticipación posible
              </Text>
            </Section>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button
                style={button}
                href={`https://ofiz-platform.lovable.app/${isClient ? 'client-dashboard' : 'master-dashboard'}`}
              >
                Ver Detalles Completos
              </Button>
            </Section>

            {/* Checklist Section */}
            <Section style={checklistSection}>
              <Text style={checklistTitle}>
                ✅ Lista de verificación:
              </Text>
              {isClient ? (
                <>
                  <Text style={checklistItem}>□ Área de trabajo despejada y accesible</Text>
                  <Text style={checklistItem}>□ Mascotas aseguradas si es necesario</Text>
                  <Text style={checklistItem}>□ Acceso disponible (portería, llaves)</Text>
                  <Text style={checklistItem}>□ Teléfono cargado para comunicación</Text>
                </>
              ) : (
                <>
                  <Text style={checklistItem}>□ Herramientas y materiales listos</Text>
                  <Text style={checklistItem}>□ Ruta al domicilio planificada</Text>
                  <Text style={checklistItem}>□ Documentos de identificación</Text>
                  <Text style={checklistItem}>□ Batería del celular cargada</Text>
                </>
              )}
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © 2025 Ofiz. Todos los derechos reservados.
            </Text>
            <Text style={footerText}>
              ¿Problemas con tu cita? Contáctanos en soporte@ofiz.cl
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
  backgroundColor: '#f59e0b',
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

const detailsCard = {
  backgroundColor: '#fffbeb',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
  border: '1px solid #fcd34d',
};

const detailsTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1f2937',
  marginBottom: '8px',
};

const divider = {
  borderColor: '#fcd34d',
  margin: '12px 0',
};

const detailRow = {
  fontSize: '14px',
  color: '#4b5563',
  marginBottom: '8px',
  lineHeight: '20px',
};

const urgencyBanner = {
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  padding: '12px 16px',
  marginBottom: '24px',
  border: '1px solid #fecaca',
};

const urgencyText = {
  fontSize: '13px',
  color: '#dc2626',
  margin: '0',
  textAlign: 'center' as const,
};

const buttonContainer = {
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const button = {
  backgroundColor: '#f59e0b',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  padding: '12px 32px',
  display: 'inline-block',
};

const checklistSection = {
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  padding: '16px',
  border: '1px solid #bbf7d0',
};

const checklistTitle = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#166534',
  marginBottom: '12px',
};

const checklistItem = {
  fontSize: '13px',
  color: '#166534',
  marginBottom: '6px',
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

export default BookingReminderEmail;
