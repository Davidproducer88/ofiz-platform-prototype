import jsPDF from "jspdf";

interface InvoiceData {
  invoiceNumber: string;
  businessName: string;
  businessTaxId?: string;
  businessAddress?: string;
  businessEmail?: string;
  planName: string;
  planPrice: number;
  billingPeriod: 'monthly' | 'annual';
  periodStart: Date;
  periodEnd: Date;
  paymentDate: Date;
  paymentMethod?: string;
  mercadopagoId?: string;
}

export const generateBusinessSubscriptionInvoice = (data: InvoiceData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors
  const primaryColor: [number, number, number] = [34, 197, 94]; // Green
  const textColor: [number, number, number] = [51, 51, 51];
  const mutedColor: [number, number, number] = [107, 114, 128];

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('OFIZ', 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Plataforma de Servicios Profesionales', 20, 33);
  
  // Invoice Info - Right Side
  doc.setFontSize(12);
  doc.text('FACTURA', pageWidth - 20, 18, { align: 'right' });
  doc.setFontSize(10);
  doc.text(`Nº ${data.invoiceNumber}`, pageWidth - 20, 26, { align: 'right' });
  doc.text(`Fecha: ${data.paymentDate.toLocaleDateString('es-UY')}`, pageWidth - 20, 33, { align: 'right' });

  // Business Info
  let yPos = 55;
  doc.setTextColor(...textColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Facturado a:', 20, yPos);
  
  yPos += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(data.businessName, 20, yPos);
  
  if (data.businessTaxId) {
    yPos += 6;
    doc.setTextColor(...mutedColor);
    doc.setFontSize(10);
    doc.text(`RUT: ${data.businessTaxId}`, 20, yPos);
  }
  
  if (data.businessAddress) {
    yPos += 6;
    doc.text(data.businessAddress, 20, yPos);
  }
  
  if (data.businessEmail) {
    yPos += 6;
    doc.text(data.businessEmail, 20, yPos);
  }

  // Subscription Details Table
  yPos += 20;
  doc.setFillColor(249, 250, 251);
  doc.rect(20, yPos, pageWidth - 40, 10, 'F');
  
  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Descripción', 25, yPos + 7);
  doc.text('Período', 100, yPos + 7);
  doc.text('Monto', pageWidth - 25, yPos + 7, { align: 'right' });

  // Line Item
  yPos += 15;
  doc.setFont('helvetica', 'normal');
  doc.text(`Suscripción Empresarial - Plan ${data.planName}`, 25, yPos);
  
  const periodText = `${data.periodStart.toLocaleDateString('es-UY')} - ${data.periodEnd.toLocaleDateString('es-UY')}`;
  doc.text(periodText, 100, yPos);
  doc.text(`$${data.planPrice.toLocaleString('es-UY')} UYU`, pageWidth - 25, yPos, { align: 'right' });

  // Billing Type
  yPos += 8;
  doc.setTextColor(...mutedColor);
  doc.setFontSize(9);
  doc.text(`Facturación ${data.billingPeriod === 'annual' ? 'anual' : 'mensual'}`, 25, yPos);

  // Separator
  yPos += 15;
  doc.setDrawColor(229, 231, 235);
  doc.line(20, yPos, pageWidth - 20, yPos);

  // Totals
  yPos += 10;
  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.text('Subtotal:', pageWidth - 70, yPos);
  doc.text(`$${data.planPrice.toLocaleString('es-UY')} UYU`, pageWidth - 25, yPos, { align: 'right' });

  yPos += 8;
  doc.text('IVA (22%):', pageWidth - 70, yPos);
  const iva = Math.round(data.planPrice * 0.22);
  doc.text(`$${iva.toLocaleString('es-UY')} UYU`, pageWidth - 25, yPos, { align: 'right' });

  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total:', pageWidth - 70, yPos);
  const total = data.planPrice + iva;
  doc.text(`$${total.toLocaleString('es-UY')} UYU`, pageWidth - 25, yPos, { align: 'right' });

  // Payment Info Box
  yPos += 20;
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(20, yPos, pageWidth - 40, 35, 3, 3, 'F');
  
  yPos += 10;
  doc.setTextColor(...primaryColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('✓ PAGO CONFIRMADO', 30, yPos);

  yPos += 8;
  doc.setTextColor(...mutedColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  if (data.paymentMethod) {
    doc.text(`Método de pago: ${data.paymentMethod}`, 30, yPos);
  }
  
  if (data.mercadopagoId) {
    yPos += 6;
    doc.text(`ID de transacción: ${data.mercadopagoId}`, 30, yPos);
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 30;
  doc.setDrawColor(229, 231, 235);
  doc.line(20, footerY, pageWidth - 20, footerY);
  
  doc.setTextColor(...mutedColor);
  doc.setFontSize(8);
  doc.text('OFIZ - Plataforma de Servicios Profesionales', pageWidth / 2, footerY + 8, { align: 'center' });
  doc.text('www.ofiz.com | soporte@ofiz.com', pageWidth / 2, footerY + 14, { align: 'center' });
  doc.text('Este documento es un comprobante de pago electrónico.', pageWidth / 2, footerY + 20, { align: 'center' });

  // Save PDF
  const fileName = `factura_ofiz_${data.invoiceNumber}_${data.paymentDate.toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

// Helper to generate invoice number
export const generateInvoiceNumber = (businessId: string): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `OFIZ-${year}${month}-${random}`;
};
