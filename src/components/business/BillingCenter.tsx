import { useState, useEffect, useCallback } from "react";
import { generateBusinessSubscriptionInvoice, generateInvoiceNumber } from "@/utils/businessInvoiceGenerator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Download, Receipt, CreditCard, Calendar, DollarSign, FileText, ExternalLink, Printer } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface BillingCenterProps {
  businessId: string;
  subscription: any;
}

export const BillingCenter = ({ businessId, subscription }: BillingCenterProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetchTransactions();
  }, [businessId]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      // Fetch ads spending
      const { data: adsData } = await supabase
        .from('advertisements')
        .select('id, title, created_at, impressions_count, cost_per_impression, budget, status')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      // Process transactions
      const processedTransactions: any[] = adsData?.map(ad => ({
        id: ad.id,
        type: 'advertisement',
        description: `Anuncio: ${ad.title}`,
        amount: (ad.impressions_count || 0) * (ad.cost_per_impression || 0),
        date: ad.created_at,
        status: ad.status,
        budget: ad.budget,
        impressions: ad.impressions_count,
        recurring: false
      })) || [];

      // Add subscription transaction if exists
      if (subscription) {
        processedTransactions.unshift({
          id: subscription.id,
          type: 'subscription',
          description: `Suscripción ${subscription.plan_type}`,
          amount: subscription.price,
          date: subscription.created_at,
          status: subscription.status,
          recurring: true
        });
      }

      setTransactions(processedTransactions);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las transacciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalSpent = () => {
    return transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  };

  const calculateMonthlySpent = () => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return transactions
      .filter(t => new Date(t.date) >= firstDayOfMonth)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: any } = {
      active: 'default',
      completed: 'default',
      pending: 'secondary',
      cancelled: 'destructive',
      rejected: 'destructive'
    };

    const labels: { [key: string]: string } = {
      active: 'Activo',
      completed: 'Completado',
      pending: 'Pendiente',
      cancelled: 'Cancelado',
      rejected: 'Rechazado'
    };

    return <Badge variant={variants[status] || 'outline'}>{labels[status] || status}</Badge>;
  };

  const generatePDFInvoice = (transaction: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('OFIZ', 20, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Factura Empresarial', 20, 33);
    
    // Invoice number and date
    doc.setFontSize(12);
    doc.text(`N° ${transaction.id.slice(0, 8).toUpperCase()}`, pageWidth - 20, 20, { align: 'right' });
    doc.setFontSize(10);
    doc.text(format(new Date(transaction.date), "d 'de' MMMM, yyyy", { locale: es }), pageWidth - 20, 28, { align: 'right' });

    // Status badge
    const statusColor = transaction.status === 'active' ? [34, 197, 94] as const : [234, 179, 8] as const;
    const statusText = transaction.status === 'active' ? 'PAGADO' : 'PENDIENTE';
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.roundedRect(pageWidth - 50, 32, 35, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(statusText, pageWidth - 32.5, 37.5, { align: 'center' });

    // Business info section
    let yPos = 55;
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(9);
    doc.text('EMPRESA', 20, yPos);
    
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Tu Empresa', 20, yPos + 7);

    // Divider
    yPos += 30;
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, pageWidth - 20, yPos);

    // Transaction details table
    yPos += 15;
    doc.setFillColor(249, 250, 251);
    doc.rect(20, yPos, pageWidth - 40, 10, 'F');
    
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('CONCEPTO', 25, yPos + 7);
    doc.text('TIPO', 100, yPos + 7);
    doc.text('MONTO', pageWidth - 40, yPos + 7, { align: 'right' });

    yPos += 15;
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(transaction.description, 25, yPos + 5);
    doc.text(transaction.type === 'subscription' ? 'Suscripción' : 'Publicidad', 100, yPos + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${transaction.amount.toLocaleString('es-CL')}`, pageWidth - 40, yPos + 5, { align: 'right' });

    // Totals
    yPos += 30;
    doc.setDrawColor(229, 231, 235);
    doc.line(pageWidth - 100, yPos, pageWidth - 20, yPos);
    
    yPos += 10;
    doc.setFillColor(16, 185, 129);
    doc.rect(pageWidth - 100, yPos - 5, 80, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', pageWidth - 95, yPos + 3);
    doc.text(`$${transaction.amount.toLocaleString('es-CL')}`, pageWidth - 25, yPos + 3, { align: 'right' });

    // Additional info
    yPos += 25;
    if (transaction.type === 'advertisement' && transaction.impressions > 0) {
      doc.setTextColor(107, 114, 128);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Impresiones: ${transaction.impressions.toLocaleString()}`, 20, yPos);
    }
    if (transaction.recurring) {
      doc.setTextColor(107, 114, 128);
      doc.setFontSize(9);
      doc.text('Tipo: Pago recurrente', 20, yPos + 10);
    }

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 30;
    doc.setDrawColor(229, 231, 235);
    doc.line(20, footerY - 10, pageWidth - 20, footerY - 10);
    
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(8);
    doc.text('Este documento es una factura generada por Ofiz Business.', pageWidth / 2, footerY, { align: 'center' });
    doc.text('Para consultas: soporte@ofiz.cl | www.ofiz.com.uy', pageWidth / 2, footerY + 6, { align: 'center' });
    doc.text(`Generado el ${format(new Date(), "d/MM/yyyy 'a las' HH:mm", { locale: es })}`, pageWidth / 2, footerY + 12, { align: 'center' });

    doc.save(`factura-ofiz-${transaction.id.slice(0, 8)}.pdf`);
    
    toast({
      title: "Factura descargada",
      description: "La factura PDF ha sido generada correctamente",
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Cargando facturación...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Centro de Facturación</h2>
        <p className="text-muted-foreground">
          Gestiona tus pagos y consulta tu historial de transacciones
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gasto Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${calculateTotalSpent().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Desde el inicio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gasto Mensual</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${calculateMonthlySpent().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo Pago</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {subscription ? (
              <>
                <div className="text-2xl font-bold">${subscription.price.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Sin suscripción activa</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subscription Info */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Suscripción Actual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-lg capitalize">{subscription.plan_type}</p>
                <p className="text-sm text-muted-foreground">Plan empresarial</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-2xl">${subscription.price.toLocaleString()}/mes</p>
                {getStatusBadge(subscription.status)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Fecha de inicio</p>
                <p className="font-medium">{new Date(subscription.current_period_start).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Próxima renovación</p>
                <p className="font-medium">{new Date(subscription.current_period_end).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="pt-4 border-t flex flex-col sm:flex-row gap-2">
              <Button
                variant="default"
                className="flex-1"
                onClick={() => {
                  generateBusinessSubscriptionInvoice({
                    invoiceNumber: generateInvoiceNumber(businessId),
                    businessName: 'Mi Empresa', // TODO: Get from business profile
                    planName: subscription.plan_type,
                    planPrice: subscription.price,
                    billingPeriod: 'monthly',
                    periodStart: new Date(subscription.current_period_start),
                    periodEnd: new Date(subscription.current_period_end),
                    paymentDate: new Date(subscription.current_period_start),
                    mercadopagoId: subscription.mercadopago_payment_id,
                  });
                  toast({
                    title: "Factura generada",
                    description: "La factura PDF de tu suscripción ha sido descargada",
                  });
                }}
              >
                <Printer className="h-4 w-4 mr-2" />
                Descargar Factura
              </Button>
              {subscription.mercadopago_subscription_id && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open('https://www.mercadopago.com.ar/subscriptions', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Gestionar en MercadoPago
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Historial de Transacciones
          </CardTitle>
          <CardDescription>
            Todas tus transacciones y movimientos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay transacciones registradas
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        {transaction.type === 'advertisement' && transaction.impressions > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {transaction.impressions.toLocaleString()} impresiones
                          </p>
                        )}
                        {transaction.recurring && (
                          <p className="text-xs text-muted-foreground">Pago recurrente</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {transaction.type === 'subscription' ? 'Suscripción' : 'Publicidad'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(transaction.status)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${transaction.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => generatePDFInvoice(transaction)}
                        title="Descargar factura PDF"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
