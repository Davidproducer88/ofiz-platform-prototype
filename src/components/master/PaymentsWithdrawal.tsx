import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, CreditCard, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PaymentData {
  availableBalance: number;
  pendingBalance: number;
  totalEarnings: number;
}

export const PaymentsWithdrawal = () => {
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    availableBalance: 0,
    pendingBalance: 0,
    totalEarnings: 0
  });
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: payments, error } = await supabase
        .from('payments')
        .select('amount, master_amount, status')
        .eq('master_id', user.id);

      if (error) throw error;

      const availableBalance = payments
        ?.filter(p => p.status === 'released')
        .reduce((sum, p) => sum + Number(p.master_amount), 0) || 0;

      const pendingBalance = payments
        ?.filter(p => p.status === 'in_escrow')
        .reduce((sum, p) => sum + Number(p.master_amount), 0) || 0;

      const totalEarnings = payments
        ?.reduce((sum, p) => sum + Number(p.master_amount), 0) || 0;

      setPaymentData({
        availableBalance,
        pendingBalance,
        totalEarnings
      });
    } catch (error) {
      console.error('Error fetching payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = async () => {
    const amount = parseFloat(withdrawAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Ingresa un monto válido",
        variant: "destructive"
      });
      return;
    }

    if (amount > paymentData.availableBalance) {
      toast({
        title: "Error",
        description: "No tienes fondos suficientes",
        variant: "destructive"
      });
      return;
    }

    setWithdrawing(true);
    try {
      // Here you would call an edge function to process the withdrawal
      // For now, we'll just show a success message
      toast({
        title: "Solicitud enviada",
        description: `Se ha solicitado el retiro de $${amount}. Procesaremos tu solicitud en 24-48 horas.`,
      });
      
      setShowDialog(false);
      setWithdrawAmount("");
      // In a real implementation, you would refresh the data here
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar el retiro",
        variant: "destructive"
      });
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return <div>Cargando información de pagos...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Pagos y Retiros</h2>
        <p className="text-muted-foreground">Gestiona tus fondos y solicita retiros</p>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponible para Retiro</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${paymentData.availableBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Fondos liberados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Custodia</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ${paymentData.pendingBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Esperando liberación
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancias Totales</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${paymentData.totalEarnings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Histórico total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Section */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitar Retiro</CardTitle>
          <CardDescription>
            Retira tus fondos disponibles a tu cuenta de MercadoPago
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentData.availableBalance > 0 ? (
            <>
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Información importante
                    </p>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Los retiros se procesan en 24-48 horas hábiles</li>
                      <li>• Monto mínimo de retiro: $100</li>
                      <li>• Los fondos se transfieren a tu cuenta de MercadoPago</li>
                      <li>• Sin comisiones adicionales por retiro</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full" size="lg" disabled={paymentData.availableBalance < 100}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Solicitar Retiro
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Solicitar Retiro de Fondos</DialogTitle>
                    <DialogDescription>
                      Ingresa el monto que deseas retirar
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Monto a retirar</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="pl-7"
                          min="100"
                          max={paymentData.availableBalance}
                          step="0.01"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Disponible: ${paymentData.availableBalance.toFixed(2)}
                      </p>
                    </div>

                    <div className="bg-muted p-3 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Monto solicitado:</span>
                        <span className="font-medium">${parseFloat(withdrawAmount || "0").toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Comisión:</span>
                        <span className="font-medium">$0.00</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Recibirás:</span>
                        <span className="text-primary">${parseFloat(withdrawAmount || "0").toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleWithdrawal} disabled={withdrawing}>
                      {withdrawing ? "Procesando..." : "Confirmar Retiro"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {paymentData.availableBalance < 100 && (
                <p className="text-sm text-muted-foreground text-center">
                  Necesitas al menos $100 para solicitar un retiro
                </p>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No tienes fondos disponibles para retirar
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Completa trabajos y espera a que los fondos sean liberados
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Withdrawals (Placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Retiros</CardTitle>
          <CardDescription>Tus últimas solicitudes de retiro</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No hay retiros registrados aún
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
