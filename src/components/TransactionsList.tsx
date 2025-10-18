import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Transaction {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  escrow_released_at: string | null;
  commission_amount: number;
  master_amount: number;
  bookings: {
    services: {
      title: string;
    };
  };
}

export function TransactionsList() {
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    inEscrow: 0
  });

  useEffect(() => {
    if (profile?.id) {
      fetchTransactions();
    }
  }, [profile?.id]);

  const fetchTransactions = async () => {
    try {
      const isMaster = profile?.user_type === 'master';
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          bookings!inner(
            services(title)
          )
        `)
        .eq(isMaster ? 'master_id' : 'client_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTransactions(data || []);

      // Calculate stats
      const total = data?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const pending = data?.filter(t => t.status === 'pending').length || 0;
      const approved = data?.filter(t => t.status === 'approved').length || 0;
      const inEscrow = data?.filter(t => t.status === 'approved' && !t.escrow_released_at).length || 0;

      setStats({ total, pending, approved, inEscrow });
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, escrowReleased: string | null) => {
    if (status === 'approved' && escrowReleased) {
      return <Badge className="bg-green-500">Liberado</Badge>;
    }
    if (status === 'approved' && !escrowReleased) {
      return <Badge variant="secondary">En retención</Badge>;
    }
    if (status === 'pending') {
      return <Badge variant="outline">Pendiente</Badge>;
    }
    if (status === 'rejected') {
      return <Badge variant="destructive">Rechazado</Badge>;
    }
    return <Badge>{status}</Badge>;
  };

  if (loading) {
    return <div>Cargando transacciones...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Transacciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              ${stats.total.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              {stats.pending}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              {stats.approved}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En Retención</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-500" />
              {stats.inEscrow}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Transacciones</CardTitle>
          <CardDescription>
            Todas tus transacciones y su estado actual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Monto</TableHead>
                {profile?.user_type === 'master' && (
                  <>
                    <TableHead>Comisión</TableHead>
                    <TableHead>Tu Pago</TableHead>
                  </>
                )}
                <TableHead>Estado</TableHead>
                <TableHead>Liberado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {format(new Date(transaction.created_at), 'dd MMM yyyy', { locale: es })}
                  </TableCell>
                  <TableCell>{transaction.bookings.services.title}</TableCell>
                  <TableCell className="font-semibold">
                    ${Number(transaction.amount).toFixed(2)}
                  </TableCell>
                  {profile?.user_type === 'master' && (
                    <>
                      <TableCell className="text-red-500">
                        -${Number(transaction.commission_amount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-green-500 font-semibold">
                        ${Number(transaction.master_amount).toFixed(2)}
                      </TableCell>
                    </>
                  )}
                  <TableCell>
                    {getStatusBadge(transaction.status, transaction.escrow_released_at)}
                  </TableCell>
                  <TableCell>
                    {transaction.escrow_released_at 
                      ? format(new Date(transaction.escrow_released_at), 'dd MMM yyyy', { locale: es })
                      : '-'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {transactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay transacciones aún
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
