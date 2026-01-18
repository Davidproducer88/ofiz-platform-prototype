import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface InvoiceData {
  invoiceNumber: string;
  date: Date;
  clientName: string;
  clientAddress?: string;
  clientPhone?: string;
  masterName: string;
  masterRUT?: string;
  serviceName: string;
  serviceDescription?: string;
  amount: number;
  platformFee: number;
  totalAmount: number;
  paymentMethod?: string;
  paymentStatus: string;
}

export const generateInvoicePDF = (data: InvoiceData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors
  const primaryColor = [16, 185, 129] as const;
  const textColor = [31, 41, 55] as const;
  const mutedColor = [107, 114, 128] as const;

  // Header with logo
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('OFIZ', 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Comprobante de Servicio', 20, 33);
  
  // Invoice number and date (right side of header)
  doc.setFontSize(12);
  doc.text(`N° ${data.invoiceNumber}`, pageWidth - 20, 20, { align: 'right' });
  doc.setFontSize(10);
  doc.text(format(data.date, "d 'de' MMMM, yyyy", { locale: es }), pageWidth - 20, 28, { align: 'right' });

  // Status badge
  const statusColor = data.paymentStatus === 'completed' ? [34, 197, 94] as const : [234, 179, 8] as const;
  const statusText = data.paymentStatus === 'completed' ? 'PAGADO' : 'PENDIENTE';
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(pageWidth - 50, 32, 35, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(statusText, pageWidth - 32.5, 37.5, { align: 'center' });

  // Client and Professional info
  let yPos = 55;
  
  // Client section
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.setFontSize(9);
  doc.text('CLIENTE', 20, yPos);
  
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(data.clientName, 20, yPos + 7);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  if (data.clientAddress) {
    doc.text(data.clientAddress, 20, yPos + 14);
  }
  if (data.clientPhone) {
    doc.text(data.clientPhone, 20, yPos + 21);
  }

  // Professional section
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.setFontSize(9);
  doc.text('PROFESIONAL', pageWidth / 2 + 10, yPos);
  
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(data.masterName, pageWidth / 2 + 10, yPos + 7);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  if (data.masterRUT) {
    doc.text(`RUT: ${data.masterRUT}`, pageWidth / 2 + 10, yPos + 14);
  }

  // Divider
  yPos += 35;
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, pageWidth - 20, yPos);

  // Service details table
  yPos += 15;
  doc.setFillColor(249, 250, 251);
  doc.rect(20, yPos, pageWidth - 40, 10, 'F');
  
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('SERVICIO', 25, yPos + 7);
  doc.text('DESCRIPCIÓN', 80, yPos + 7);
  doc.text('MONTO', pageWidth - 40, yPos + 7, { align: 'right' });

  yPos += 15;
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(data.serviceName.substring(0, 20), 25, yPos + 5);
  
  const description = data.serviceDescription || 'Servicio profesional';
  const descLines = doc.splitTextToSize(description, 70);
  doc.text(descLines, 80, yPos + 5);
  
  doc.setFont('helvetica', 'bold');
  doc.text(`$${data.amount.toLocaleString('es-CL')}`, pageWidth - 40, yPos + 5, { align: 'right' });

  // Totals section
  yPos += 30 + (descLines.length - 1) * 5;
  doc.setDrawColor(229, 231, 235);
  doc.line(pageWidth - 100, yPos, pageWidth - 20, yPos);
  
  yPos += 10;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text('Subtotal:', pageWidth - 100, yPos);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`$${data.amount.toLocaleString('es-CL')}`, pageWidth - 25, yPos, { align: 'right' });
  
  yPos += 8;
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text('Comisión plataforma:', pageWidth - 100, yPos);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`$${data.platformFee.toLocaleString('es-CL')}`, pageWidth - 25, yPos, { align: 'right' });

  yPos += 10;
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(pageWidth - 100, yPos - 5, 80, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', pageWidth - 95, yPos + 3);
  doc.text(`$${data.totalAmount.toLocaleString('es-CL')}`, pageWidth - 25, yPos + 3, { align: 'right' });

  // Payment info
  yPos += 25;
  if (data.paymentMethod) {
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Método de pago: ${data.paymentMethod}`, 20, yPos);
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 30;
  doc.setDrawColor(229, 231, 235);
  doc.line(20, footerY - 10, pageWidth - 20, footerY - 10);
  
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.setFontSize(8);
  doc.text('Este documento es un comprobante de servicio generado por Ofiz.', pageWidth / 2, footerY, { align: 'center' });
  doc.text('Para consultas: soporte@ofiz.cl | www.ofiz.com.uy', pageWidth / 2, footerY + 6, { align: 'center' });
  doc.text(`Generado el ${format(new Date(), "d/MM/yyyy 'a las' HH:mm", { locale: es })}`, pageWidth / 2, footerY + 12, { align: 'center' });

  return doc;
};

export const downloadInvoice = (data: InvoiceData) => {
  const doc = generateInvoicePDF(data);
  doc.save(`factura-ofiz-${data.invoiceNumber}.pdf`);
};

export const generateServiceHistoryPDF = (
  clientName: string,
  bookings: Array<{
    id: string;
    service_name: string;
    master_name: string;
    scheduled_date: string;
    total_price: number;
    status: string;
  }>
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('OFIZ', 20, 22);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Historial de Servicios', 20, 30);
  
  doc.setFontSize(10);
  doc.text(format(new Date(), "d 'de' MMMM, yyyy", { locale: es }), pageWidth - 20, 25, { align: 'right' });

  // Client info
  let yPos = 50;
  doc.setTextColor(107, 114, 128);
  doc.setFontSize(9);
  doc.text('CLIENTE', 20, yPos);
  
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(clientName, 20, yPos + 8);

  // Stats summary
  const completed = bookings.filter(b => b.status === 'completed').length;
  const totalSpent = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.total_price, 0);

  yPos += 20;
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(20, yPos, pageWidth - 40, 25, 3, 3, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text('Total servicios:', 30, yPos + 10);
  doc.text('Completados:', 90, yPos + 10);
  doc.text('Total invertido:', 150, yPos + 10);
  
  doc.setTextColor(31, 41, 55);
  doc.setFont('helvetica', 'bold');
  doc.text(String(bookings.length), 30, yPos + 18);
  doc.text(String(completed), 90, yPos + 18);
  doc.text(`$${totalSpent.toLocaleString('es-CL')}`, 150, yPos + 18);

  // Table header
  yPos += 35;
  doc.setFillColor(16, 185, 129);
  doc.rect(20, yPos, pageWidth - 40, 10, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('FECHA', 25, yPos + 7);
  doc.text('SERVICIO', 55, yPos + 7);
  doc.text('PROFESIONAL', 110, yPos + 7);
  doc.text('ESTADO', 150, yPos + 7);
  doc.text('MONTO', pageWidth - 30, yPos + 7, { align: 'right' });

  // Table rows
  yPos += 12;
  doc.setFont('helvetica', 'normal');
  
  const statusColors: Record<string, readonly [number, number, number]> = {
    completed: [34, 197, 94] as const,
    pending: [234, 179, 8] as const,
    cancelled: [239, 68, 68] as const,
    confirmed: [59, 130, 246] as const
  };
  
  const statusLabels: Record<string, string> = {
    completed: 'Completado',
    pending: 'Pendiente',
    cancelled: 'Cancelado',
    confirmed: 'Confirmado'
  };

  bookings.forEach((booking, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    if (index % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(20, yPos - 4, pageWidth - 40, 10, 'F');
    }

    doc.setTextColor(31, 41, 55);
    doc.setFontSize(9);
    doc.text(format(new Date(booking.scheduled_date), 'dd/MM/yy'), 25, yPos + 2);
    doc.text(booking.service_name.substring(0, 20), 55, yPos + 2);
    doc.text(booking.master_name.substring(0, 15), 110, yPos + 2);
    
    const statusClr = statusColors[booking.status] || ([107, 114, 128] as const);
    doc.setTextColor(statusClr[0], statusClr[1], statusClr[2]);
    doc.text(statusLabels[booking.status] || booking.status, 150, yPos + 2);
    
    doc.setTextColor(31, 41, 55);
    doc.text(`$${booking.total_price.toLocaleString('es-CL')}`, pageWidth - 30, yPos + 2, { align: 'right' });
    
    yPos += 10;
  });

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setTextColor(107, 114, 128);
  doc.setFontSize(8);
  doc.text('Historial generado por Ofiz | www.ofiz.com.uy', pageWidth / 2, footerY, { align: 'center' });

  return doc;
};

export const downloadServiceHistory = (
  clientName: string,
  bookings: Array<{
    id: string;
    service_name: string;
    master_name: string;
    scheduled_date: string;
    total_price: number;
    status: string;
  }>
) => {
  const doc = generateServiceHistoryPDF(clientName, bookings);
  doc.save(`historial-servicios-${clientName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
};
