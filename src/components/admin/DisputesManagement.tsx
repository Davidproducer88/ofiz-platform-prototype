import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Eye, CheckCircle, XCircle, Clock, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Dispute {
  id: string;
  booking_id: string;
  opened_by: string;
  opened_by_role: string;
  reason: string;
  description: string;
  evidence_urls: string[];
  status: string;
  resolution: string | null;
  resolution_type: string | null;
  created_at: string;
  bookings: {
    services: { title: string };
    total_price: number;
  };
  opener: {
    full_name: string;
  };
}

export const DisputesManagement = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resolution, setResolution] = useState('');
  const [resolutionType, setResolutionType] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [resolving, setResolving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchDisputes();

    // Real-time subscription
    const channel = supabase
      .channel('disputes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'disputes'
        },
        () => {
          fetchDisputes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [statusFilter]);

  const fetchDisputes = async () => {
    try {
      let query = supabase
        .from('disputes')
        .select(`
          *,
          bookings!inner (
            services!inner (title),
            total_price
          )
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Fetch profiles for openers
      const disputesWithProfiles = await Promise.all(
        (data || []).map(async (d) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', d.opened_by)
            .single();
          
          return {
            ...d,
            evidence_urls: (d.evidence_urls as any) || [],
            opener: profile || { full_name: 'Usuario Desconocido' }
          };
        })
      );
      
      setDisputes(disputesWithProfiles as Dispute[]);
    } catch (error: any) {
      console.error('Error fetching disputes:', error);
      toast.error('Error al cargar disputas');
    } finally {
      setLoading(false);
    }
  };

  const openDisputeDialog = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setResolution(dispute.resolution || '');
    setResolutionType(dispute.resolution_type || '');
    setAdminNotes('');
    setDialogOpen(true);
  };

  const handleResolve = async () => {
    if (!selectedDispute || !resolution.trim() || !resolutionType) {
      toast.error('Completa todos los campos');
      return;
    }

    setResolving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('disputes')
        .update({
          status: 'resolved',
          resolution,
          resolution_type: resolutionType,
          admin_notes: adminNotes,
          resolved_by: user?.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', selectedDispute.id);

      if (error) throw error;

      // Notify parties
      const { data: booking } = await supabase
        .from('bookings')
        .select('client_id, master_id')
        .eq('id', selectedDispute.booking_id)
        .single();

      if (booking) {
        await supabase
          .from('notifications')
          .insert([
            {
              user_id: booking.client_id,
              type: 'dispute_resolved',
              title: '✅ Disputa Resuelta',
              message: `La disputa ha sido resuelta: ${resolution.substring(0, 100)}`,
              metadata: { dispute_id: selectedDispute.id }
            },
            {
              user_id: booking.master_id,
              type: 'dispute_resolved',
              title: '✅ Disputa Resuelta',
              message: `La disputa ha sido resuelta: ${resolution.substring(0, 100)}`,
              metadata: { dispute_id: selectedDispute.id }
            }
          ]);
      }

      toast.success('Disputa resuelta exitosamente');
      setDialogOpen(false);
      fetchDisputes();
    } catch (error: any) {
      console.error('Error resolving dispute:', error);
      toast.error('Error al resolver disputa');
    } finally {
      setResolving(false);
    }
  };

  const updateStatus = async (disputeId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('disputes')
        .update({ status: newStatus })
        .eq('id', disputeId);

      if (error) throw error;
      
      toast.success(`Estado actualizado a: ${newStatus}`);
      fetchDisputes();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error('Error al actualizar estado');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      open: { variant: 'destructive', icon: AlertTriangle, label: 'Abierta' },
      under_review: { variant: 'default', icon: Clock, label: 'En Revisión' },
      resolved: { variant: 'secondary', icon: CheckCircle, label: 'Resuelta' },
      closed: { variant: 'outline', icon: XCircle, label: 'Cerrada' }
    };

    const config = variants[status] || variants.open;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const stats = {
    open: disputes.filter(d => d.status === 'open').length,
    under_review: disputes.filter(d => d.status === 'under_review').length,
    resolved: disputes.filter(d => d.status === 'resolved').length,
    total: disputes.length
  };

  if (loading) {
    return <div className="text-center py-8">Cargando disputas...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setStatusFilter('all')}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Disputas</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setStatusFilter('open')}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">{stats.open}</div>
            <p className="text-xs text-muted-foreground">Abiertas</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setStatusFilter('under_review')}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{stats.under_review}</div>
            <p className="text-xs text-muted-foreground">En Revisión</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setStatusFilter('resolved')}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-secondary">{stats.resolved}</div>
            <p className="text-xs text-muted-foreground">Resueltas</p>
          </CardContent>
        </Card>
      </div>

      {/* Disputes List */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Disputas</CardTitle>
          <CardDescription>
            Revisa y resuelve disputas entre clientes y profesionales
          </CardDescription>
        </CardHeader>
        <CardContent>
          {disputes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay disputas {statusFilter !== 'all' && `con estado: ${statusFilter}`}
            </div>
          ) : (
            <div className="space-y-3">
              {disputes.map((dispute) => (
                <div
                  key={dispute.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold">
                          {dispute.bookings.services.title}
                        </h4>
                        {getStatusBadge(dispute.status)}
                        <Badge variant="outline" className="text-xs">
                          {dispute.opened_by_role === 'client' ? 'Cliente' : 'Maestro'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        Abierta por: {dispute.opener.full_name}
                      </p>
                      
                      <p className="text-sm line-clamp-2">
                        {dispute.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatDistanceToNow(new Date(dispute.created_at), { addSuffix: true, locale: es })}</span>
                        {dispute.evidence_urls.length > 0 && (
                          <span className="flex items-center gap-1">
                            <ImageIcon className="h-3 w-3" />
                            {dispute.evidence_urls.length} archivo(s)
                          </span>
                        )}
                        <span>Reserva: ${dispute.bookings.total_price.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDisputeDialog(dispute)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </Button>
                      
                      {dispute.status === 'open' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => updateStatus(dispute.id, 'under_review')}
                        >
                          Marcar En Revisión
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolution Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resolver Disputa</DialogTitle>
            <DialogDescription>
              {selectedDispute && `${selectedDispute.bookings.services.title} - ${selectedDispute.opener.full_name}`}
            </DialogDescription>
          </DialogHeader>

          {selectedDispute && (
            <div className="space-y-4 py-4">
              {/* Dispute Info */}
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div><strong>Motivo:</strong> {selectedDispute.reason}</div>
                <div><strong>Descripción:</strong></div>
                <p className="text-sm whitespace-pre-wrap">{selectedDispute.description}</p>
              </div>

              {/* Evidence */}
              {selectedDispute.evidence_urls.length > 0 && (
                <div className="space-y-2">
                  <Label>Evidencia Adjunta:</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedDispute.evidence_urls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="aspect-square rounded-lg overflow-hidden border hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={url}
                          alt={`Evidence ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Resolution Type */}
              <div className="space-y-2">
                <Label htmlFor="resolution-type">
                  Tipo de Resolución <span className="text-destructive">*</span>
                </Label>
                <Select value={resolutionType} onValueChange={setResolutionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo de resolución" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="refund_full">Reembolso Completo al Cliente</SelectItem>
                    <SelectItem value="refund_partial">Reembolso Parcial al Cliente</SelectItem>
                    <SelectItem value="release_full">Liberar Pago Completo al Maestro</SelectItem>
                    <SelectItem value="release_partial">Liberar Pago Parcial al Maestro</SelectItem>
                    <SelectItem value="other">Otra Resolución</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Resolution */}
              <div className="space-y-2">
                <Label htmlFor="resolution">
                  Resolución para las Partes <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="resolution"
                  placeholder="Explica la decisión y las acciones a tomar..."
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label htmlFor="admin-notes">Notas Internas (Opcional)</Label>
                <Textarea
                  id="admin-notes"
                  placeholder="Notas solo para administradores..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={resolving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleResolve}
              disabled={resolving || !resolution.trim() || !resolutionType}
            >
              {resolving ? 'Resolviendo...' : 'Resolver Disputa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
