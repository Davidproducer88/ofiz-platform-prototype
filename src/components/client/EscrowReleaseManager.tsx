import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { DollarSign, Lock, CheckCircle, Clock, AlertTriangle, Info } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface EscrowPayment {
  id: string;
  amount: number;
  master_amount: number;
  commission_amount: number;
  status: string;
  created_at: string;
  escrow_released_at: string | null;
  booking_id: string;
  bookings: {
    id: string;
    status: string;
    scheduled_date: string;
    client_confirmed_at: string | null;
    services: {
      title: string;
      category: string;
    };
    masters: {
      business_name: string;
    };
  };
}

export const EscrowReleaseManager = ({ clientId }: { clientId: string }) => {
  const [payments, setPayments] = useState<EscrowPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [releasing, setReleasing] = useState<string | null>(null);
  const [stats, setStats] = useState({
    inEscrow: 0,
    readyToRelease: 0,
    total: 0
  });

  useEffect(() => {
    fetchEscrowPayments();
    
    // Suscripción en tiempo real
    const subscription = supabase
      .channel('escrow-payments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'payments',
        filter: `client_id=eq.${clientId}`
      }, () => {
        fetchEscrowPayments();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [clientId]);

  const fetchEscrowPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          bookings!inner(
            id,
            status,
            scheduled_date,
            client_confirmed_at,
            services(title, category),
            masters(business_name)
          )
        `)
        .eq('client_id', clientId)
        .eq('status', 'approved')
        .is('escrow_released_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPayments(data || []);

      // Calculate stats
      const inEscrow = data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const readyToRelease = data?.filter(p => 
        p.bookings.status === 'completed' && 
        p.bookings.client_confirmed_at
      ).length || 0;

      setStats({
        inEscrow,
        readyToRelease,
        total: data?.length || 0
      });
    } catch (error: any) {
      console.error('Error fetching escrow payments:', error);
      toast({
        title: "Error al cargar pagos",
        description: error.message || "No se pudieron cargar los pagos en custodia",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseEscrow = async (bookingId: string, paymentId: string) => {
    setReleasing(paymentId);
    try {
      const { error } = await supabase.functions.invoke('release-escrow', {
        body: { bookingId }
      });

      if (error) throw error;

      toast({
        title: "✅ Fondos liberados",
        description: "El pago ha sido liberado al profesional exitosamente"
      });

      fetchEscrowPayments();
    } catch (error: any) {
      console.error('Error releasing escrow:', error);
      toast({
        title: "Error al liberar fondos",
        description: error.message || "No se pudieron liberar los fondos",
        variant: "destructive"
      });
    } finally {
      setReleasing(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-12">
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-blue-700 dark:text-blue-400">
                En Custodia
              </CardDescription>
              <Lock className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              ${stats.inEscrow.toLocaleString()} UYU
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {stats.total} {stats.total === 1 ? 'pago' : 'pagos'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-green-700 dark:text-green-400">
                Listos para liberar
              </CardDescription>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {stats.readyToRelease}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Trabajos confirmados
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-amber-700 dark:text-amber-400">
                Pendientes
              </CardDescription>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              {stats.total - stats.readyToRelease}
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              Esperando confirmación
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900 dark:text-blue-100">
          <strong>Sistema de Custodia:</strong> Tus pagos están protegidos hasta que confirmes que el trabajo fue completado satisfactoriamente. Una vez confirmado, podrás liberar los fondos al profesional.
        </AlertDescription>
      </Alert>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pagos en Custodia
          </CardTitle>
          <CardDescription>
            Pagos pendientes de liberación al profesional
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Lock className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No tienes pagos en custodia</p>
              <p className="text-sm mt-2">Los pagos aparecerán aquí cuando se completen los servicios</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => {
                const canRelease = payment.bookings.status === 'completed' && 
                                  payment.bookings.client_confirmed_at;
                
                return (
                  <div 
                    key={payment.id} 
                    className="border rounded-lg p-4 space-y-3 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-semibold flex items-center gap-2">
                          {payment.bookings.services.title}
                          {canRelease ? (
                            <Badge className="bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Listo para liberar
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              Pendiente
                            </Badge>
                          )}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Profesional: {payment.bookings.masters.business_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Fecha: {format(new Date(payment.bookings.scheduled_date), 'PPP', { locale: es })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          ${payment.amount.toLocaleString()} UYU
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Profesional recibe: ${payment.master_amount.toLocaleString()} UYU
                        </p>
                      </div>
                    </div>

                    {!canRelease && (
                      <Alert className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-xs text-amber-900 dark:text-amber-100">
                          {payment.bookings.status !== 'completed' 
                            ? 'El profesional debe completar el servicio primero'
                            : 'Debes confirmar que el trabajo fue completado satisfactoriamente antes de liberar los fondos'
                          }
                        </AlertDescription>
                      </Alert>
                    )}

                    {canRelease && (
                      <Button
                        onClick={() => handleReleaseEscrow(payment.booking_id, payment.id)}
                        disabled={releasing === payment.id}
                        className="w-full"
                        variant="default"
                      >
                        {releasing === payment.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Liberando fondos...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Liberar pago al profesional
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
