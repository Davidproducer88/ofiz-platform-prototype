import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Download, CreditCard, TrendingUp, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

interface Payment {
  id: string;
  amount: number;
  commission_amount: number;
  master_amount: number;
  status: string;
  payment_method: string | null;
  created_at: string;
  bookings: {
    scheduled_date: string;
    services: {
      title: string;
      category: string;
    };
    masters: {
      business_name: string;
    };
  };
}

export const PaymentHistory = () => {
  const { profile } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'all' | 'month' | 'year'>('all');

  useEffect(() => {
    fetchPayments();
  }, [profile?.id]);

  const fetchPayments = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          bookings (
            scheduled_date,
            services (title, category),
            masters (business_name)
          )
        `)
        .eq('client_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los pagos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Completado', className: 'bg-green-100 text-green-800' },
      failed: { label: 'Fallido', className: 'bg-red-100 text-red-800' },
      refunded: { label: 'Reembolsado', className: 'bg-blue-100 text-blue-800' },
      in_escrow: { label: 'En Custodia', className: 'bg-purple-100 text-purple-800' },
    };

    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>;
  };

  const filteredPayments = payments.filter(payment => {
    const paymentDate = new Date(payment.created_at);
    const now = new Date();
    
    if (period === 'month') {
      return paymentDate.getMonth() === now.getMonth() && 
             paymentDate.getFullYear() === now.getFullYear();
    }
    if (period === 'year') {
      return paymentDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const totalSpent = filteredPayments
    .filter(p => p.status === 'completed' || p.status === 'in_escrow')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const completedPayments = filteredPayments.filter(p => p.status === 'completed').length;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando historial de pagos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Historial de Pagos</h2>
        <p className="text-muted-foreground">Gestiona todos tus pagos y transacciones</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Gastado</p>
                <p className="text-2xl font-bold">${totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <CreditCard className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pagos Completados</p>
                <p className="text-2xl font-bold">{completedPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Transacciones</p>
                <p className="text-2xl font-bold">{filteredPayments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transacciones</CardTitle>
              <CardDescription>Historial completo de pagos</CardDescription>
            </div>
            <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="month">Este Mes</TabsTrigger>
                <TabsTrigger value="year">Este Año</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay pagos</h3>
              <p className="text-muted-foreground">
                Aún no has realizado ningún pago
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{payment.bookings?.services?.title}</h4>
                      {getStatusBadge(payment.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {payment.bookings?.masters?.business_name}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(payment.created_at), "d 'de' MMM, yyyy", { locale: es })}
                      </div>
                      {payment.payment_method && (
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          {payment.payment_method}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      ${Number(payment.amount).toLocaleString()}
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        // Generar factura básica
                        const invoiceData = `
FACTURA DE PAGO
=====================================
Fecha: ${format(new Date(payment.created_at), "d 'de' MMM, yyyy", { locale: es })}
Servicio: ${payment.bookings?.services?.title || 'N/A'}
Profesional: ${payment.bookings?.masters?.business_name || 'N/A'}
Monto: $${Number(payment.amount).toLocaleString()}
Estado: ${payment.status}
Método de pago: ${payment.payment_method || 'N/A'}
=====================================
                        `.trim();

                        // Crear blob y descargar
                        const blob = new Blob([invoiceData], { type: 'text/plain' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `factura-${payment.id.slice(0, 8)}.txt`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);

                        toast({
                          title: "Factura descargada",
                          description: "Se descargó el comprobante de pago",
                        });
                      }}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Descargar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
