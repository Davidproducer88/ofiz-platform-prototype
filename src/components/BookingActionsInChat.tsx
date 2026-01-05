import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Check, 
  X, 
  Edit2, 
  Clock, 
  DollarSign, 
  MapPin, 
  Calendar,
  MessageSquare
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface BookingActionsInChatProps {
  booking: any;
  isMaster: boolean;
  isClient: boolean;
  conversationId: string;
  onUpdate: () => void;
}

export function BookingActionsInChat({
  booking,
  isMaster,
  isClient,
  conversationId,
  onUpdate
}: BookingActionsInChatProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showNegotiateDialog, setShowNegotiateDialog] = useState(false);
  const [negotiatePrice, setNegotiatePrice] = useState(booking?.total_price?.toString() || '');
  const [negotiateMessage, setNegotiateMessage] = useState('');
  const [isNegotiating, setIsNegotiating] = useState(false);

  if (!booking) return null;

  const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending: { label: 'Pendiente de aceptación', variant: 'secondary' },
    confirmed: { label: 'Confirmado', variant: 'default' },
    in_progress: { label: 'En progreso', variant: 'default' },
    completed: { label: 'Completado', variant: 'default' },
    cancelled: { label: 'Cancelado', variant: 'destructive' },
    negotiating: { label: 'En negociación', variant: 'outline' }
  };

  const status = statusLabels[booking.status] || { label: booking.status, variant: 'secondary' };

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', booking.id);

      if (error) throw error;

      // Send system message
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: booking.master_id,
        content: '✅ Encargo aceptado. El profesional ha confirmado el trabajo.',
      });

      // Notify client
      await supabase.from('notifications').insert({
        user_id: booking.client_id,
        type: 'booking_confirmed',
        title: 'Encargo confirmado',
        message: 'El profesional ha aceptado tu encargo',
        booking_id: booking.id
      });

      toast({
        title: '¡Encargo aceptado!',
        description: 'Has confirmado el encargo exitosamente'
      });

      onUpdate();
    } catch (error: any) {
      console.error('Error accepting booking:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo aceptar el encargo',
        variant: 'destructive'
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', booking.id);

      if (error) throw error;

      // Send system message
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: booking.master_id,
        content: '❌ Encargo rechazado. El profesional no puede realizar este trabajo.',
      });

      // Notify client
      await supabase.from('notifications').insert({
        user_id: booking.client_id,
        type: 'booking_cancelled',
        title: 'Encargo rechazado',
        message: 'El profesional ha rechazado tu encargo',
        booking_id: booking.id
      });

      toast({
        title: 'Encargo rechazado',
        description: 'Has rechazado el encargo'
      });

      onUpdate();
    } catch (error: any) {
      console.error('Error rejecting booking:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo rechazar el encargo',
        variant: 'destructive'
      });
    } finally {
      setIsRejecting(false);
    }
  };

  const handleNegotiate = async () => {
    if (!negotiatePrice) {
      toast({
        title: 'Error',
        description: 'Ingresa un precio propuesto',
        variant: 'destructive'
      });
      return;
    }

    setIsNegotiating(true);
    try {
      const newPrice = parseFloat(negotiatePrice);

      const { error } = await supabase
        .from('bookings')
        .update({ 
          total_price: newPrice,
          status: 'pending',
          notes: booking.notes + `\n\n--- Propuesta del profesional ---\nNuevo precio: $${newPrice}\n${negotiateMessage || ''}`
        })
        .eq('id', booking.id);

      if (error) throw error;

      // Send system message
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: booking.master_id,
        content: `💬 Nueva propuesta: El profesional propone un precio de $${newPrice.toLocaleString('es-CL')}. ${negotiateMessage ? `Mensaje: "${negotiateMessage}"` : ''}`,
      });

      // Notify client
      await supabase.from('notifications').insert({
        user_id: booking.client_id,
        type: 'booking_updated',
        title: 'Nueva propuesta recibida',
        message: `El profesional ha propuesto un nuevo precio: $${newPrice.toLocaleString('es-CL')}`,
        booking_id: booking.id
      });

      toast({
        title: 'Propuesta enviada',
        description: 'Tu contrapropuesta ha sido enviada al cliente'
      });

      setShowNegotiateDialog(false);
      setNegotiateMessage('');
      onUpdate();
    } catch (error: any) {
      console.error('Error negotiating:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo enviar la propuesta',
        variant: 'destructive'
      });
    } finally {
      setIsNegotiating(false);
    }
  };

  const handleClientAccept = async () => {
    setIsAccepting(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'confirmed',
          client_confirmed_at: new Date().toISOString()
        })
        .eq('id', booking.id);

      if (error) throw error;

      // Send system message
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: booking.client_id,
        content: '✅ Propuesta aceptada. El cliente ha confirmado el acuerdo.',
      });

      // Notify master
      await supabase.from('notifications').insert({
        user_id: booking.master_id,
        type: 'booking_confirmed',
        title: 'Cliente aceptó tu propuesta',
        message: 'El cliente ha aceptado tu propuesta de encargo',
        booking_id: booking.id
      });

      toast({
        title: '¡Propuesta aceptada!',
        description: 'Has aceptado la propuesta del profesional'
      });

      onUpdate();
    } catch (error: any) {
      console.error('Error accepting proposal:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo aceptar la propuesta',
        variant: 'destructive'
      });
    } finally {
      setIsAccepting(false);
    }
  };

  // Extract title from notes (first line)
  const bookingTitle = booking.notes?.split('\n')[0] || 'Encargo';

  return (
    <>
      <Card className="p-4 bg-accent/50 border-primary/20">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Encargo
            </h4>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>

          <div className="text-sm font-medium">{bookingTitle}</div>

          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              ${booking.total_price?.toLocaleString('es-CL')}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {booking.scheduled_date ? format(new Date(booking.scheduled_date), 'dd/MM/yyyy', { locale: es }) : 'Sin fecha'}
            </div>
            <div className="flex items-center gap-1 col-span-2">
              <MapPin className="h-3 w-3" />
              {booking.client_address || 'Sin dirección'}
            </div>
          </div>

          {/* Actions for Master */}
          {isMaster && booking.status === 'pending' && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={handleAccept}
                disabled={isAccepting}
                className="flex-1 gap-1"
              >
                <Check className="h-3 w-3" />
                {isAccepting ? 'Aceptando...' : 'Aceptar'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowNegotiateDialog(true)}
                className="flex-1 gap-1"
              >
                <Edit2 className="h-3 w-3" />
                Negociar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleReject}
                disabled={isRejecting}
                className="gap-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Actions for Client when master made a counter-proposal */}
          {isClient && booking.status === 'pending' && booking.notes?.includes('Propuesta del profesional') && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={handleClientAccept}
                disabled={isAccepting}
                className="flex-1 gap-1"
              >
                <Check className="h-3 w-3" />
                {isAccepting ? 'Aceptando...' : 'Aceptar propuesta'}
              </Button>
            </div>
          )}

          {/* Status indicators */}
          {booking.status === 'confirmed' && (
            <div className="flex items-center gap-2 text-xs text-green-600 pt-2">
              <Check className="h-3 w-3" />
              Encargo confirmado - Listo para comenzar
            </div>
          )}
        </div>
      </Card>

      {/* Negotiate Dialog */}
      <Dialog open={showNegotiateDialog} onOpenChange={setShowNegotiateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Proponer cambios</DialogTitle>
            <DialogDescription>
              Envía una contrapropuesta al cliente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="new-price">Nuevo precio propuesto</Label>
              <Input
                id="new-price"
                type="number"
                value={negotiatePrice}
                onChange={(e) => setNegotiatePrice(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="negotiate-message">Mensaje (opcional)</Label>
              <Textarea
                id="negotiate-message"
                value={negotiateMessage}
                onChange={(e) => setNegotiateMessage(e.target.value)}
                placeholder="Explica el motivo del cambio..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNegotiateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleNegotiate} disabled={isNegotiating}>
              {isNegotiating ? 'Enviando...' : 'Enviar propuesta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}