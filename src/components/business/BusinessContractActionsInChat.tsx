import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Check, 
  DollarSign, 
  MapPin, 
  Calendar,
  PlayCircle,
  FileSearch,
  ChevronDown,
  ChevronUp,
  Building2
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface BusinessContractActionsInChatProps {
  contract: any;
  application: any;
  isBusiness: boolean;
  isMaster: boolean;
  conversationId: string;
  onUpdate: () => void;
}

export function BusinessContractActionsInChat({
  contract,
  application,
  isBusiness,
  isMaster,
  conversationId,
  onUpdate
}: BusinessContractActionsInChatProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!contract || !application) return null;

  const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending: { label: 'Pendiente', variant: 'secondary' },
    accepted: { label: 'Aceptado', variant: 'default' },
    in_progress: { label: 'En progreso', variant: 'default' },
    completed: { label: 'Completado', variant: 'default' },
    rejected: { label: 'Rechazado', variant: 'destructive' }
  };

  const status = statusLabels[application.status] || { label: application.status, variant: 'secondary' };

  const handleStartWork = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('business_contract_applications')
        .update({ status: 'in_progress' })
        .eq('id', application.id);

      if (error) throw error;

      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: application.master_id,
        content: '🔨 He comenzado a trabajar en el proyecto.',
      });

      toast({ title: '¡Trabajo iniciado!', description: 'La empresa ha sido notificada' });
      onUpdate();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompleteWork = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('business_contract_applications')
        .update({ status: 'completed' })
        .eq('id', application.id);

      if (error) throw error;

      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: application.master_id,
        content: '✅ He completado el trabajo. Por favor, revisa y confirma.',
      });

      toast({ title: 'Trabajo completado', description: 'La empresa revisará el trabajo' });
      onUpdate();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApproveWork = async () => {
    setIsUpdating(true);
    try {
      // Update application status
      await supabase
        .from('business_contract_applications')
        .update({ status: 'completed' })
        .eq('id', application.id);

      // Check if all applications are completed
      const { data: allApps } = await supabase
        .from('business_contract_applications')
        .select('status')
        .eq('contract_id', contract.id)
        .eq('status', 'accepted');

      const allCompleted = allApps?.every(app => app.status === 'completed');

      if (allCompleted) {
        await supabase
          .from('business_contracts')
          .update({ status: 'completed' })
          .eq('id', contract.id);
      }

      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: contract.business_id,
        content: '🎉 Trabajo aprobado. ¡Gracias por tu excelente trabajo!',
      });

      toast({ title: '¡Trabajo aprobado!', description: 'El contrato ha sido completado' });
      onUpdate();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="p-4 bg-accent/50 border-primary/20">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Contrato Empresarial
          </h4>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>

        <div className="text-sm font-medium">{contract.title}</div>

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            ${application.proposed_price?.toLocaleString('es-CL')}
          </div>
          {contract.deadline && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(contract.deadline), 'dd/MM/yyyy', { locale: es })}
            </div>
          )}
          <div className="flex items-center gap-1 col-span-2">
            <MapPin className="h-3 w-3" />
            {contract.location || 'Sin ubicación'}
          </div>
        </div>

        {/* Actions for Master */}
        {isMaster && application.status === 'accepted' && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={handleStartWork}
              disabled={isUpdating}
              className="flex-1 gap-1"
            >
              <PlayCircle className="h-3 w-3" />
              {isUpdating ? 'Iniciando...' : 'Iniciar Trabajo'}
            </Button>
          </div>
        )}

        {isMaster && application.status === 'in_progress' && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={handleCompleteWork}
              disabled={isUpdating}
              className="flex-1 gap-1"
            >
              <FileSearch className="h-3 w-3" />
              {isUpdating ? 'Completando...' : 'Marcar Completado'}
            </Button>
          </div>
        )}

        {/* Actions for Business */}
        {isBusiness && application.status === 'in_progress' && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={handleApproveWork}
              disabled={isUpdating}
              className="flex-1 gap-1"
            >
              <Check className="h-3 w-3" />
              {isUpdating ? 'Aprobando...' : 'Aprobar Trabajo'}
            </Button>
          </div>
        )}

        {/* Details Collapsible */}
        <Collapsible open={showDetails} onOpenChange={setShowDetails}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full mt-2 text-xs text-muted-foreground">
              {showDetails ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Ocultar detalles
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Ver detalles del contrato
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <div className="text-xs text-muted-foreground space-y-2 bg-muted/30 p-3 rounded-lg">
              <p><strong>Descripción:</strong> {contract.description}</p>
              {contract.budget_min && contract.budget_max && (
                <p><strong>Presupuesto:</strong> ${contract.budget_min.toLocaleString('es-CL')} - ${contract.budget_max.toLocaleString('es-CL')}</p>
              )}
              <p><strong>Profesionales requeridos:</strong> {contract.required_masters}</p>
              {application.message && (
                <p><strong>Mensaje del profesional:</strong> {application.message}</p>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Card>
  );
}
