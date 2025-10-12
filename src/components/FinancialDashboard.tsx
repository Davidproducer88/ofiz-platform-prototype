import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Payment {
  id: string;
  amount: number;
  commission_amount: number;
  master_amount: number;
  status: string;
  created_at: string;
  escrow_released_at: string | null;
  bookings: {
    service_id: string;
    services: {
      title: string;
    };
  };
}

interface Commission {
  id: string;
  amount: number;
  percentage: number;
  status: string;
  processed_at: string | null;
  created_at: string;
}

export const FinancialDashboard = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingAmount: 0,
    releasedAmount: 0,
    totalCommissions: 0,
  });

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          bookings!inner(
            service_id,
            services(title)
          )
        `)
        .eq('master_id', user.id)
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Fetch commissions
      const { data: commissionsData, error: commissionsError } = await supabase
        .from('commissions')
        .select('*')
        .eq('master_id', user.id)
        .order('created_at', { ascending: false });

      if (commissionsError) throw commissionsError;

      setPayments(paymentsData || []);
      setCommissions(commissionsData || []);

      // Calculate stats
      const totalEarnings = paymentsData?.reduce((sum, p) => 
        p.status === 'released' ? sum + Number(p.master_amount) : sum, 0) || 0;
      
      const pendingAmount = paymentsData?.reduce((sum, p) => 
        p.status === 'in_escrow' ? sum + Number(p.master_amount) : sum, 0) || 0;
      
      const releasedAmount = paymentsData?.reduce((sum, p) => 
        p.status === 'released' ? sum + Number(p.master_amount) : sum, 0) || 0;
      
      const totalCommissions = commissionsData?.reduce((sum, c) => 
        sum + Number(c.amount), 0) || 0;

      setStats({
        totalEarnings,
        pendingAmount,
        releasedAmount,
        totalCommissions,
      });

    } catch (error: any) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "Pendiente", variant: "secondary" },
      approved: { label: "Aprobado", variant: "default" },
      in_escrow: { label: "En custodia", variant: "outline" },
      released: { label: "Liberado", variant: "default" },
      rejected: { label: "Rechazado", variant: "destructive" },
    };

    const config = statusConfig[status] || { label: status, variant: "secondary" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return <div>Cargando datos financieros...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancias Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Fondos liberados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Custodia</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.pendingAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Esperando liberación
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Liberados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.releasedAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Disponibles para retiro
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comisiones</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalCommissions.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Comisiones de plataforma (5%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Pagos</CardTitle>
          <CardDescription>Todos tus pagos y su estado actual</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Monto Total</TableHead>
                <TableHead>Tu Ganancia</TableHead>
                <TableHead>Comisión</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Liberado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No hay pagos registrados
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {format(new Date(payment.created_at), 'dd MMM yyyy', { locale: es })}
                    </TableCell>
                    <TableCell>{payment.bookings?.services?.title || 'N/A'}</TableCell>
                    <TableCell>${Number(payment.amount).toFixed(2)}</TableCell>
                    <TableCell className="font-medium">
                      ${Number(payment.master_amount).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      -${Number(payment.commission_amount).toFixed(2)}
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      {payment.escrow_released_at 
                        ? format(new Date(payment.escrow_released_at), 'dd MMM yyyy', { locale: es })
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
