import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";

interface FinancialStats {
  totalCommissions: number;
  inEscrow: number;
  released: number;
  pending: number;
}

interface Payment {
  id: string;
  amount: number;
  commission_amount: number;
  master_amount: number;
  status: string;
  created_at: string;
  escrow_released_at?: string;
  booking_id: string;
}

export const FinancialDashboardTab = () => {
  const [stats, setStats] = useState<FinancialStats>({
    totalCommissions: 0,
    inEscrow: 0,
    released: 0,
    pending: 0,
  });
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      // Cargar todos los pagos
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (paymentsError) throw paymentsError;

      setPayments(paymentsData || []);

      // Calcular estadísticas
      const totalCommissions = paymentsData?.reduce((sum, p) => sum + (p.commission_amount || 0), 0) || 0;
      const inEscrow = paymentsData?.filter(p => p.status === 'in_escrow').reduce((sum, p) => sum + p.amount, 0) || 0;
      const released = paymentsData?.filter(p => p.status === 'released').reduce((sum, p) => sum + p.amount, 0) || 0;
      const pending = paymentsData?.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0) || 0;

      setStats({
        totalCommissions,
        inEscrow,
        released,
        pending,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los datos financieros",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary" as const,
      in_escrow: "default" as const,
      released: "default" as const,
      failed: "destructive" as const,
    };

    const labels = {
      pending: "Pendiente",
      in_escrow: "En Escrow",
      released: "Liberado",
      failed: "Fallido",
    };

    return <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
      {labels[status as keyof typeof labels] || status}
    </Badge>;
  };

  if (loading) {
    return <div>Cargando datos financieros...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comisiones Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalCommissions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              5% de transacciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Escrow</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.inEscrow.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Fondos retenidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Liberado</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.released.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pagos completados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendiente</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.pending.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Por procesar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transacciones Recientes</CardTitle>
          <CardDescription>
            Últimas 50 transacciones del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">Fecha</TableHead>
                  <TableHead className="min-w-[120px]">Monto Total</TableHead>
                  <TableHead className="min-w-[100px]">Comisión</TableHead>
                  <TableHead className="min-w-[130px]">Monto Maestro</TableHead>
                  <TableHead className="min-w-[120px]">Estado</TableHead>
                  <TableHead className="min-w-[130px]">Fecha Liberación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No hay transacciones
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {new Date(payment.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${payment.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        ${payment.commission_amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        ${payment.master_amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell>
                        {payment.escrow_released_at
                          ? new Date(payment.escrow_released_at).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};