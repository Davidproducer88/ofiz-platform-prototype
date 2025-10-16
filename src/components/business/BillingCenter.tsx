import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Download, Receipt, CreditCard, Calendar, DollarSign, FileText, ExternalLink } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

            {subscription.mercadopago_subscription_id && (
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open('https://www.mercadopago.com.ar/subscriptions', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Gestionar en MercadoPago
                </Button>
              </div>
            )}
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
                        onClick={() => {
                          toast({
                            title: "Comprobante",
                            description: "La función de descarga de comprobantes estará disponible próximamente",
                          });
                        }}
                      >
                        <Download className="h-4 w-4" />
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
