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

interface PaymentReceiptProps {
  clientName: string;
  masterName: string;
  serviceName: string;
  paymentDate: string;
  subtotal: number;
  platformFee: number;
  totalPaid: number;
  paymentMethod: string;
  transactionId: string;
  bookingId: string;
}

export const PaymentReceiptEmail = ({
  clientName,
  masterName,
  serviceName,
  paymentDate,
  subtotal,
  platformFee,
  totalPaid,
  paymentMethod,
  transactionId,
  bookingId,
}: PaymentReceiptProps) => {
  const previewText = `Recibo de pago - ${serviceName} - $${totalPaid.toLocaleString('es-CL')}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>OFIZ</Text>
            <Text style={headerSubtitle}>💳 Recibo de Pago</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={heading}>
              Pago Procesado Exitosamente
            </Text>

            <Text style={paragraph}>
              Hola {clientName},
            </Text>

            <Text style={paragraph}>
              Tu pago ha sido procesado correctamente. A continuación encontrarás 
              el detalle de tu transacción.
            </Text>

            {/* Receipt Card */}
            <Section style={receiptCard}>
              <Section style={receiptHeader}>
                <Text style={receiptTitle}>RECIBO DE PAGO</Text>
                <Text style={receiptNumber}>N° {transactionId.slice(0, 8).toUpperCase()}</Text>
              </Section>
              
              <Hr style={divider} />

              {/* Service Details */}
              <Section style={receiptSection}>
                <Text style={sectionTitle}>Detalle del Servicio</Text>
                <Text style={receiptRow}>
                  <span style={receiptLabel}>Servicio:</span>
                  <span style={receiptValue}>{serviceName}</span>
                </Text>
                <Text style={receiptRow}>
                  <span style={receiptLabel}>Profesional:</span>
                  <span style={receiptValue}>{masterName}</span>
                </Text>
                <Text style={receiptRow}>
                  <span style={receiptLabel}>Fecha de pago:</span>
                  <span style={receiptValue}>{paymentDate}</span>
                </Text>
              </Section>

              <Hr style={dividerLight} />

              {/* Payment Breakdown */}
              <Section style={receiptSection}>
                <Text style={sectionTitle}>Desglose de Pago</Text>
                <Text style={receiptRow}>
                  <span style={receiptLabel}>Subtotal:</span>
                  <span style={receiptValue}>${subtotal.toLocaleString('es-CL')}</span>
                </Text>
                <Text style={receiptRow}>
                  <span style={receiptLabel}>Tarifa de servicio:</span>
                  <span style={receiptValue}>${platformFee.toLocaleString('es-CL')}</span>
                </Text>
              </Section>

              <Hr style={divider} />

              {/* Total */}
              <Section style={totalSection}>
                <Text style={totalRow}>
                  <span style={totalLabel}>TOTAL PAGADO:</span>
                  <span style={totalValue}>${totalPaid.toLocaleString('es-CL')}</span>
                </Text>
              </Section>

              <Hr style={dividerLight} />

              {/* Payment Method */}
              <Section style={receiptSection}>
                <Text style={receiptRow}>
                  <span style={receiptLabel}>Método de pago:</span>
                  <span style={receiptValue}>{paymentMethod}</span>
                </Text>
                <Text style={receiptRow}>
                  <span style={receiptLabel}>ID Transacción:</span>
                  <span style={receiptValue}>{transactionId}</span>
                </Text>
              </Section>
            </Section>

            {/* Escrow Info */}
            <Section style={escrowInfo}>
              <Text style={escrowIcon}>🔒</Text>
              <Text style={escrowTitle}>Pago Protegido por Escrow</Text>
              <Text style={escrowText}>
                Tu pago está seguro. Los fondos serán liberados al profesional 
                una vez confirmes que el trabajo fue completado satisfactoriamente.
              </Text>
            </Section>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button
                style={button}
                href="https://ofiz-platform.lovable.app/client-dashboard"
              >
                Ver mi Historial de Pagos
              </Button>
            </Section>

            {/* Legal Notice */}
            <Section style={legalSection}>
              <Text style={legalText}>
                Este documento es un comprobante electrónico de pago. 
                Guárdalo para tus registros. Para cualquier consulta sobre 
                este cobro, contáctanos dentro de los 30 días siguientes a la transacción.
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © 2025 Ofiz. Todos los derechos reservados.
            </Text>
            <Text style={footerText}>
              Soporte: soporte@ofiz.cl | Tel: +56 9 1234 5678
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
  backgroundColor: '#6366f1',
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
  textAlign: 'center' as const,
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#4b5563',
  marginBottom: '16px',
};

const receiptCard = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '24px',
  marginBottom: '24px',
  border: '2px solid #e5e7eb',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
};

const receiptHeader = {
  textAlign: 'center' as const,
  marginBottom: '16px',
};

const receiptTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0',
  letterSpacing: '2px',
};

const receiptNumber = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '4px 0 0 0',
};

const divider = {
  borderColor: '#e5e7eb',
  borderWidth: '2px',
  margin: '16px 0',
};

const dividerLight = {
  borderColor: '#f3f4f6',
  margin: '12px 0',
};

const receiptSection = {
  marginBottom: '8px',
};

const sectionTitle = {
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#9ca3af',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  marginBottom: '8px',
};

const receiptRow = {
  fontSize: '14px',
  color: '#4b5563',
  marginBottom: '6px',
  display: 'flex',
  justifyContent: 'space-between',
};

const receiptLabel = {
  color: '#6b7280',
};

const receiptValue = {
  fontWeight: '500',
  color: '#1f2937',
};

const totalSection = {
  padding: '12px 0',
};

const totalRow = {
  fontSize: '18px',
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '0',
};

const totalLabel = {
  fontWeight: 'bold',
  color: '#1f2937',
};

const totalValue = {
  fontWeight: 'bold',
  color: '#10b981',
  fontSize: '20px',
};

const escrowInfo = {
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
  textAlign: 'center' as const,
  border: '1px solid #bfdbfe',
};

const escrowIcon = {
  fontSize: '32px',
  margin: '0 0 8px 0',
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
  lineHeight: '20px',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const button = {
  backgroundColor: '#6366f1',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  padding: '12px 32px',
  display: 'inline-block',
};

const legalSection = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '16px',
};

const legalText = {
  fontSize: '11px',
  color: '#9ca3af',
  lineHeight: '16px',
  margin: '0',
  textAlign: 'center' as const,
};

const footer = {
  backgroundColor: '#1f2937',
  padding: '24px',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '12px',
  color: '#9ca3af',
  marginBottom: '4px',
};

export default PaymentReceiptEmail;
