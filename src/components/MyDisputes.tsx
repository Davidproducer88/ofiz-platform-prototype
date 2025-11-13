import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Clock, CheckCircle, XCircle, Eye, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Dispute {
  id: string;
  booking_id: string;
  reason: string;
  description: string;
  evidence_urls: string[];
  status: string;
  resolution: string | null;
  resolution_type: string | null;
  created_at: string;
  resolved_at: string | null;
  bookings: {
    services: { title: string };
  };
}

interface MyDisputesProps {
  userId: string;
}

export const MyDisputes = ({ userId }: MyDisputesProps) => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchDisputes();

    // Real-time subscription
    const channel = supabase
      .channel('my-disputes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'disputes',
          filter: `opened_by=eq.${userId}`
        },
        () => {
          fetchDisputes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchDisputes = async () => {
    try {
      const { data, error } = await supabase
        .from('disputes')
        .select(`
          *,
          bookings!inner (
            services!inner (title)
          )
        `)
        .eq('opened_by', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedData = (data || []).map(d => ({
        ...d,
        evidence_urls: (d.evidence_urls as any) || []
      })) as Dispute[];

      setDisputes(typedData);
    } catch (error: any) {
      console.error('Error fetching disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { variant: any; icon: any; label: string }> = {
      open: { variant: 'destructive', icon: AlertTriangle, label: 'Abierta' },
      under_review: { variant: 'default', icon: Clock, label: 'En Revisión' },
      resolved: { variant: 'secondary', icon: CheckCircle, label: 'Resuelta' },
      closed: { variant: 'outline', icon: XCircle, label: 'Cerrada' }
    };

    const config = configs[status] || configs.open;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Cargando disputas...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Mis Disputas</CardTitle>
          <CardDescription>
            Disputas que has abierto sobre servicios
          </CardDescription>
        </CardHeader>
        <CardContent>
          {disputes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tienes disputas abiertas
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
                      </div>
                      
                      <p className="text-sm line-clamp-2 text-muted-foreground">
                        {dispute.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          {formatDistanceToNow(new Date(dispute.created_at), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </span>
                        {dispute.evidence_urls.length > 0 && (
                          <span className="flex items-center gap-1">
                            <ImageIcon className="h-3 w-3" />
                            {dispute.evidence_urls.length} archivo(s)
                          </span>
                        )}
                      </div>

                      {dispute.status === 'resolved' && dispute.resolution && (
                        <Alert className="mt-3">
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            <strong>Resolución:</strong> {dispute.resolution}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedDispute(dispute);
                        setDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Disputa</DialogTitle>
            <DialogDescription>
              {selectedDispute && selectedDispute.bookings.services.title}
            </DialogDescription>
          </DialogHeader>

          {selectedDispute && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Estado:</span>
                {getStatusBadge(selectedDispute.status)}
              </div>

              <div>
                <span className="text-sm font-semibold">Motivo:</span>
                <p className="text-sm text-muted-foreground mt-1">{selectedDispute.reason}</p>
              </div>

              <div>
                <span className="text-sm font-semibold">Descripción:</span>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                  {selectedDispute.description}
                </p>
              </div>

              {selectedDispute.evidence_urls.length > 0 && (
                <div>
                  <span className="text-sm font-semibold">Evidencia:</span>
                  <div className="grid grid-cols-3 gap-2 mt-2">
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

              {selectedDispute.status === 'resolved' && selectedDispute.resolution && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Resolución del Administrador:</strong>
                    <p className="mt-2 whitespace-pre-wrap">{selectedDispute.resolution}</p>
                    {selectedDispute.resolved_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Resuelta {formatDistanceToNow(new Date(selectedDispute.resolved_at), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </p>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {selectedDispute.status === 'open' && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Tu disputa está siendo revisada por nuestro equipo. 
                    Recibirás una notificación cuando sea resuelta.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
