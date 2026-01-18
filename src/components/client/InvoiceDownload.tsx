import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { downloadInvoice, downloadServiceHistory } from '@/utils/invoiceGenerator';
import { toast } from '@/hooks/use-toast';

interface Booking {
  id: string;
  total_price: number;
  platform_fee?: number | null;
  scheduled_date: string;
  status: string;
  client_address: string;
  services?: {
    title: string;
    description?: string;
  } | null;
  masters?: {
    business_name: string;
  } | null;
  profiles?: {
    full_name: string;
    phone?: string | null;
    address?: string | null;
  } | null;
}

interface InvoiceDownloadProps {
  booking: Booking;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const InvoiceDownload = ({ booking, variant = 'outline', size = 'sm' }: InvoiceDownloadProps) => {
  const handleDownload = () => {
    try {
      const platformFee = booking.platform_fee || Math.round(booking.total_price * 0.05);
      
      downloadInvoice({
        invoiceNumber: booking.id.slice(0, 8).toUpperCase(),
        date: new Date(booking.scheduled_date),
        clientName: booking.profiles?.full_name || 'Cliente',
        clientAddress: booking.client_address,
        clientPhone: booking.profiles?.phone || undefined,
        masterName: booking.masters?.business_name || 'Profesional',
        serviceName: booking.services?.title || 'Servicio',
        serviceDescription: booking.services?.description,
        amount: booking.total_price - platformFee,
        platformFee: platformFee,
        totalAmount: booking.total_price,
        paymentStatus: booking.status === 'completed' ? 'completed' : 'pending'
      });

      toast({
        title: "Factura descargada",
        description: "El PDF se ha descargado correctamente",
      });
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast({
        title: "Error",
        description: "No se pudo generar la factura",
        variant: "destructive",
      });
    }
  };

  return (
    <Button variant={variant} size={size} onClick={handleDownload}>
      <FileText className="h-4 w-4 mr-1" />
      Factura
    </Button>
  );
};

interface ServiceHistoryDownloadProps {
  clientName: string;
  bookings: Array<{
    id: string;
    services?: { title: string } | null;
    masters?: { business_name: string } | null;
    scheduled_date: string;
    total_price: number;
    status: string;
  }>;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export const ServiceHistoryDownload = ({ 
  clientName, 
  bookings, 
  variant = 'default', 
  size = 'default' 
}: ServiceHistoryDownloadProps) => {
  const handleDownload = () => {
    try {
      const formattedBookings = bookings.map(b => ({
        id: b.id,
        service_name: b.services?.title || 'Servicio',
        master_name: b.masters?.business_name || 'Profesional',
        scheduled_date: b.scheduled_date,
        total_price: b.total_price,
        status: b.status
      }));

      downloadServiceHistory(clientName, formattedBookings);

      toast({
        title: "Historial descargado",
        description: "El PDF se ha descargado correctamente",
      });
    } catch (error) {
      console.error('Error downloading history:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el historial",
        variant: "destructive",
      });
    }
  };

  return (
    <Button variant={variant} size={size} onClick={handleDownload}>
      <Download className="h-4 w-4 mr-2" />
      Descargar Historial PDF
    </Button>
  );
};
