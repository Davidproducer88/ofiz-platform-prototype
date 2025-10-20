import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Download, Eye, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { TablePagination } from './TablePagination';

interface Payment {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  payment_method: string | null;
  escrow_released_at: string | null;
  commission_amount: number;
  master_amount: number;
  client_id: string;
  master_id: string;
  bookings: {
    services: {
      title: string;
    };
  } | null;
}

export function TransactionsTable() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const exportToCSV = () => {
    const csvContent = [
      ['Fecha', 'Servicio', 'Cliente', 'Master', 'Monto', 'Comisión', 'Método', 'Estado'],
      ...filteredPayments.map(payment => [
        format(new Date(payment.created_at), 'dd/MM/yyyy HH:mm', { locale: es }),
        payment.bookings?.services?.title || 'N/A',
        (payment as any).client_name || 'N/A',
        (payment as any).master_name || 'N/A',
        payment.amount,
        payment.commission_amount,
        payment.payment_method || 'N/A',
        payment.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transacciones_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Exportación exitosa",
      description: "Las transacciones se han exportado correctamente"
    });
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          bookings!inner(
            services(title)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch client and master profiles separately
      const paymentsWithProfiles = await Promise.all(
        (data || []).map(async (payment) => {
          const [clientProfile, masterProfile] = await Promise.all([
            supabase.from('profiles').select('full_name').eq('id', payment.client_id).maybeSingle(),
            supabase.from('profiles').select('full_name').eq('id', payment.master_id).maybeSingle()
          ]);

          return {
            ...payment,
            client_name: clientProfile.data?.full_name || 'N/A',
            master_name: masterProfile.data?.full_name || 'N/A'
          };
        })
      );

      setPayments(paymentsWithProfiles as any);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast({
        title: "Error al cargar transacciones",
        description: "No se pudieron cargar las transacciones",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, escrowReleased: string | null) => {
    if (status === 'approved' && escrowReleased) {
      return <Badge className="bg-green-500">Liberado</Badge>;
    }
    if (status === 'approved' && !escrowReleased) {
      return <Badge variant="secondary">En Retención</Badge>;
    }
    if (status === 'pending') {
      return <Badge variant="outline">Pendiente</Badge>;
    }
    if (status === 'rejected') {
      return <Badge variant="destructive">Rechazado</Badge>;
    }
    return <Badge>{status}</Badge>;
  };

  const filteredPayments = payments.filter(payment => {
    const search = searchTerm.toLowerCase();
    return (
      payment.bookings?.services?.title?.toLowerCase().includes(search) ||
      (payment as any).client_name?.toLowerCase().includes(search) ||
      (payment as any).master_name?.toLowerCase().includes(search) ||
      payment.id.toLowerCase().includes(search)
    );
  });

  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(filteredPayments.length / pageSize);
  const totalAmount = filteredPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalCommissions = filteredPayments.reduce((sum, p) => sum + Number(p.commission_amount), 0);

  if (loading) {
    return <div>Cargando transacciones...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Transacciones</CardTitle>
          <div className="flex gap-2">
            <div className="text-sm">
              <span className="text-muted-foreground">Total: </span>
              <span className="font-bold">${totalAmount.toFixed(2)}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Comisiones: </span>
              <span className="font-bold text-green-600">${totalCommissions.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por servicio, cliente, master o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={exportToCSV}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Master</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Comisión</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(payment.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate">
                        {payment.bookings?.services?.title || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>{(payment as any).client_name || 'N/A'}</TableCell>
                    <TableCell>{(payment as any).master_name || 'N/A'}</TableCell>
                    <TableCell className="font-semibold">
                      ${Number(payment.amount).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-green-600 font-medium">
                      ${Number(payment.commission_amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {payment.payment_method || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(payment.status, payment.escrow_released_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron transacciones
            </div>
          )}

          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            totalItems={filteredPayments.length}
          />
        </div>
      </CardContent>
    </Card>
  );
}
