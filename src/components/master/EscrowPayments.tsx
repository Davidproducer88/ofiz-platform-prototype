import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EscrowPayment {
  id: string;
  booking_id: string;
  amount: number;
  master_amount: number;
  status: string;
  payment_percentage: number;
  remaining_amount: number;
  is_partial_payment: boolean;
  created_at: string;
  escrow_released_at: string | null;
  bookings: {
    id: string;
    status: string;
    scheduled_date: string;
    client_confirmed_at: string | null;
    services: {
      title: string;
    };
    profiles: {
      full_name: string;
    };
  };
}

interface EscrowPaymentsProps {
  masterId: string;
}

export const EscrowPayments = ({ masterId }: EscrowPaymentsProps) => {
  const [payments, setPayments] = useState<EscrowPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    released: 0,
    total: 0
  });

  useEffect(() => {
    fetchEscrowPayments();
    
    // Real-time subscription
    const channel = supabase
      .channel('escrow-payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `master_id=eq.${masterId}`
        },
        () => {
          fetchEscrowPayments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [masterId]);

  const fetchEscrowPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          bookings (
            id,
            status,
            scheduled_date,
            client_confirmed_at,
            services (title),
            profiles:client_id (full_name)
          )
        `)
        .eq('master_id', masterId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPayments(data || []);

      // Calculate stats
      const pending = data?.filter(p => !p.escrow_released_at).reduce((sum, p) => sum + p.master_amount, 0) || 0;
      const released = data?.filter(p => p.escrow_released_at).reduce((sum, p) => sum + p.master_amount, 0) || 0;
      const total = data?.reduce((sum, p) => sum + p.master_amount, 0) || 0;

      setStats({ pending, released, total });
    } catch (error: any) {
      console.error('Error fetching escrow payments:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los pagos en escrow',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (payment: EscrowPayment) => {
    if (payment.escrow_released_at) {
      return <Badge className="bg-secondary"><CheckCircle className="h-3 w-3 mr-1" />Liberado</Badge>;
    }
    
    if (payment.bookings.client_confirmed_at) {
      return <Badge className="bg-primary"><AlertCircle className="h-3 w-3 mr-1" />Listo para Liberar</Badge>;
    }
    
    if (payment.bookings.status === 'completed') {
      return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Esperando Confirmación</Badge>;
    }
    
    return <Badge variant="secondary"><Shield className="h-3 w-3 mr-1" />En Escrow</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Pagos en Escrow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Cargando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pendiente de Liberación</CardDescription>
            <CardTitle className="text-2xl text-orange-600">
              ${stats.pending.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Fondos retenidos en escrow</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Liberado</CardDescription>
            <CardTitle className="text-2xl text-secondary">
              ${stats.released.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Disponible para retiro</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total en Escrow</CardDescription>
            <CardTitle className="text-2xl">
              ${stats.total.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Suma de todos los pagos</p>
          </CardContent>
        </Card>
      </div>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Detalle de Pagos
          </CardTitle>
          <CardDescription>
            Historial de pagos recibidos y su estado en el sistema de escrow
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay pagos registrados aún
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">
                        {payment.bookings.services.title}
                      </h4>
                      {getStatusBadge(payment)}
                      {payment.is_partial_payment && (
                        <Badge variant="outline" className="text-xs">
                          Pago Parcial {payment.payment_percentage}%
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Cliente: {payment.bookings.profiles.full_name} • 
                      {new Date(payment.bookings.scheduled_date).toLocaleDateString('es-UY')}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Total: ${payment.amount.toLocaleString()}</span>
                      <span>•</span>
                      <span>Tu parte: ${payment.master_amount.toLocaleString()}</span>
                      {payment.remaining_amount > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-orange-600">
                            Pendiente: ${payment.remaining_amount.toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="text-lg font-bold text-primary">
                      ${payment.master_amount.toLocaleString()}
                    </div>
                    {payment.escrow_released_at ? (
                      <p className="text-xs text-muted-foreground">
                        Liberado {new Date(payment.escrow_released_at).toLocaleDateString('es-UY')}
                      </p>
                    ) : (
                      <p className="text-xs text-orange-600">
                        En escrow
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-semibold text-sm">¿Qué es el escrow?</h4>
              <p className="text-xs text-muted-foreground">
                El escrow es un sistema de protección donde los fondos se retienen hasta que:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 ml-4 mt-2">
                <li>✓ El servicio se complete exitosamente</li>
                <li>✓ El cliente confirme que está satisfecho con el trabajo</li>
                <li>✓ El cliente libere los fondos manualmente</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2">
                Esto protege tanto al cliente como al profesional durante toda la transacción.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
