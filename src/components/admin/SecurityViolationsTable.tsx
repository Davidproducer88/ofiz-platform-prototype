import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { AlertTriangle, Eye, CheckCircle, Ban } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Violation {
  id: string;
  conversation_id: string;
  sender_id: string;
  original_content: string;
  violation_type: string;
  detected_info: any;
  severity: string;
  action_taken: string;
  created_at: string;
  admin_reviewed: boolean;
  admin_notes: string | null;
  sender_name?: string;
}

export const SecurityViolationsTable = () => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  useEffect(() => {
    loadViolations();
    
    // Suscribirse a nuevas violaciones
    const channel = supabase
      .channel('violations-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'message_violations'
      }, () => {
        loadViolations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filterSeverity]);

  const loadViolations = async () => {
    try {
      let query = supabase
        .from('message_violations')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterSeverity !== 'all') {
        query = query.eq('severity', filterSeverity);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;

      // Enriquecer con nombres de usuarios
      const enriched = await Promise.all(
        (data || []).map(async (violation) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', violation.sender_id)
            .single();

          return {
            ...violation,
            sender_name: profileData?.full_name || 'Usuario desconocido'
          };
        })
      );

      setViolations(enriched);
    } catch (error) {
      console.error('Error loading violations:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las violaciones',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (violationId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('message_violations')
        .update({
          admin_reviewed: true,
          admin_notes: notes
        })
        .eq('id', violationId);

      if (error) throw error;

      toast({
        title: 'Revisión guardada',
        description: 'La violación ha sido marcada como revisada'
      });

      setSelectedViolation(null);
      setAdminNotes('');
      loadViolations();
    } catch (error) {
      console.error('Error reviewing violation:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la revisión',
        variant: 'destructive'
      });
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      low: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
      medium: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
      high: 'bg-orange-500/20 text-orange-700 border-orange-500/30',
      critical: 'bg-red-500/20 text-red-700 border-red-500/30'
    };
    return (
      <Badge className={colors[severity as keyof typeof colors] || colors.medium}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      phone: '📞 Teléfono',
      email: '📧 Email',
      social_media: '💬 Redes Sociales',
      external_contact: '🔗 Contacto Externo',
      suspicious: '⚠️ Sospechoso'
    };
    return labels[type] || type;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Violaciones de Seguridad del Chat
          </CardTitle>
          <div className="flex gap-2 mt-4">
            <Button
              variant={filterSeverity === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterSeverity('all')}
            >
              Todas
            </Button>
            <Button
              variant={filterSeverity === 'critical' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterSeverity('critical')}
            >
              Críticas
            </Button>
            <Button
              variant={filterSeverity === 'high' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterSeverity('high')}
            >
              Altas
            </Button>
            <Button
              variant={filterSeverity === 'medium' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterSeverity('medium')}
            >
              Medias
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Severidad</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : violations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No hay violaciones registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  violations.map((violation) => (
                    <TableRow key={violation.id}>
                      <TableCell className="text-xs">
                        {formatDistanceToNow(new Date(violation.created_at), {
                          addSuffix: true,
                          locale: es
                        })}
                      </TableCell>
                      <TableCell>{violation.sender_name}</TableCell>
                      <TableCell>{getTypeLabel(violation.violation_type)}</TableCell>
                      <TableCell>{getSeverityBadge(violation.severity)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {violation.action_taken === 'blocked' && <Ban className="h-3 w-3 mr-1" />}
                          {violation.action_taken}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {violation.admin_reviewed ? (
                          <Badge className="bg-green-500/20 text-green-700 border-green-500/30">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Revisado
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pendiente</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedViolation(violation)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={!!selectedViolation} onOpenChange={() => setSelectedViolation(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle de Violación</DialogTitle>
          </DialogHeader>
          {selectedViolation && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Información</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Usuario:</span>{' '}
                    {selectedViolation.sender_name}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tipo:</span>{' '}
                    {getTypeLabel(selectedViolation.violation_type)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Severidad:</span>{' '}
                    {getSeverityBadge(selectedViolation.severity)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Acción:</span>{' '}
                    {selectedViolation.action_taken}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Contenido Original</h4>
                <div className="bg-muted p-3 rounded-lg text-sm">
                  {selectedViolation.original_content}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Información Detectada</h4>
                <pre className="bg-muted p-3 rounded-lg text-xs overflow-auto max-h-40">
                  {JSON.stringify(selectedViolation.detected_info, null, 2)}
                </pre>
              </div>

              {!selectedViolation.admin_reviewed && (
                <div>
                  <h4 className="font-semibold mb-2">Notas de Administrador</h4>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Añadir notas sobre esta violación..."
                    className="mb-2"
                  />
                  <Button
                    onClick={() => handleReview(selectedViolation.id, adminNotes)}
                    className="w-full"
                  >
                    Marcar como Revisado
                  </Button>
                </div>
              )}

              {selectedViolation.admin_reviewed && selectedViolation.admin_notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notas del Administrador</h4>
                  <div className="bg-muted p-3 rounded-lg text-sm">
                    {selectedViolation.admin_notes}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};