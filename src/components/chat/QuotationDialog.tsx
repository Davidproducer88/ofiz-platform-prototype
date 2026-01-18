import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Trash2, 
  FileText,
  Calculator
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface QuotationItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface QuotationFormData {
  title: string;
  description: string;
  items: QuotationItem[];
  discount: number;
  validDays: number;
}

interface QuotationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  masterId: string;
  clientId: string;
  bookingId?: string;
  onSuccess?: () => void;
}

export function QuotationDialog({
  open,
  onOpenChange,
  conversationId,
  masterId,
  clientId,
  bookingId,
  onSuccess,
}: QuotationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<QuotationFormData>({
    defaultValues: {
      title: '',
      description: '',
      items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
      discount: 0,
      validDays: 7,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = watch('items');
  const watchDiscount = watch('discount') || 0;

  // Calculate totals
  const subtotal = watchItems.reduce((sum, item) => {
    return sum + (item.quantity || 0) * (item.unitPrice || 0);
  }, 0);
  
  const total = subtotal - watchDiscount;

  const updateItemTotal = (index: number) => {
    const items = watchItems;
    const item = items[index];
    if (item) {
      const itemTotal = (item.quantity || 0) * (item.unitPrice || 0);
      setValue(`items.${index}.total`, itemTotal);
    }
  };

  const onSubmit = async (data: QuotationFormData) => {
    if (data.items.length === 0 || data.items.every(i => !i.description)) {
      toast({
        title: 'Error',
        description: 'Agrega al menos un ítem a la cotización',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + data.validDays);

      // Format items for storage
      const formattedItems = data.items
        .filter(item => item.description)
        .map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total: item.quantity * item.unitPrice,
        }));

      // Create quotation
      const { data: quotation, error: quotationError } = await supabase
        .from('quotations')
        .insert({
          conversation_id: conversationId,
          booking_id: bookingId || null,
          master_id: masterId,
          client_id: clientId,
          title: data.title,
          description: data.description,
          items: formattedItems,
          subtotal: subtotal,
          discount: data.discount,
          total: total,
          valid_until: validUntil.toISOString(),
          status: 'pending',
        })
        .select()
        .single();

      if (quotationError) throw quotationError;

      // Send message with quotation
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: masterId,
        content: `📋 *COTIZACIÓN ENVIADA*\n\n` +
          `${data.title}\n` +
          `${data.description ? `${data.description}\n` : ''}` +
          `\n--- Detalle ---\n` +
          formattedItems.map(item => 
            `• ${item.description}: ${item.quantity} x $${item.unit_price.toLocaleString('es-CL')} = $${item.total.toLocaleString('es-CL')}`
          ).join('\n') +
          `\n\nSubtotal: $${subtotal.toLocaleString('es-CL')}` +
          (data.discount > 0 ? `\nDescuento: -$${data.discount.toLocaleString('es-CL')}` : '') +
          `\n*TOTAL: $${total.toLocaleString('es-CL')}*` +
          `\n\nVálida hasta: ${validUntil.toLocaleDateString('es-CL')}`,
      });

      // Notify client
      await supabase.from('notifications').insert({
        user_id: clientId,
        type: 'quotation_received',
        title: 'Nueva cotización recibida',
        message: `${data.title} - Total: $${total.toLocaleString('es-CL')}`,
        metadata: {
          quotation_id: quotation.id,
          total: total,
        },
      });

      toast({
        title: '¡Cotización enviada!',
        description: 'El cliente recibirá tu cotización.',
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error creating quotation:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo enviar la cotización',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Crear Cotización
          </DialogTitle>
          <DialogDescription>
            Envía una cotización formal con desglose de costos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 overflow-y-auto flex-1 px-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título de la cotización *</Label>
              <Input
                id="title"
                placeholder="Ej: Reparación de cañería"
                {...register('title', { required: 'El título es requerido' })}
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="validDays">Válida por (días)</Label>
              <Input
                id="validDays"
                type="number"
                min="1"
                max="30"
                {...register('validDays', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Describe el trabajo a realizar..."
              rows={2}
              {...register('description')}
            />
          </div>

          <Separator />

          {/* Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Ítems del presupuesto</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ description: '', quantity: 1, unitPrice: 0, total: 0 })}
              >
                <Plus className="h-3 w-3 mr-1" />
                Añadir ítem
              </Button>
            </div>

            {fields.map((field, index) => (
              <Card key={field.id} className="p-3">
                <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-12 md:col-span-5">
                    <Label className="text-xs">Descripción</Label>
                    <Input
                      placeholder="Ej: Mano de obra"
                      {...register(`items.${index}.description` as const)}
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <Label className="text-xs">Cantidad</Label>
                    <Input
                      type="number"
                      min="1"
                      {...register(`items.${index}.quantity` as const, { 
                        valueAsNumber: true,
                        onChange: () => updateItemTotal(index)
                      })}
                    />
                  </div>
                  <div className="col-span-5 md:col-span-3">
                    <Label className="text-xs">Precio unitario</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      {...register(`items.${index}.unitPrice` as const, { 
                        valueAsNumber: true,
                        onChange: () => updateItemTotal(index)
                      })}
                    />
                  </div>
                  <div className="col-span-3 md:col-span-2 flex items-end gap-2">
                    <div className="flex-1 text-right">
                      <span className="text-xs text-muted-foreground block">Total</span>
                      <span className="font-medium text-sm">
                        ${((watchItems[index]?.quantity || 0) * (watchItems[index]?.unitPrice || 0)).toLocaleString('es-CL')}
                      </span>
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Separator />

          {/* Totals */}
          <Card className="p-4 bg-muted/30">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between text-sm items-center gap-4">
                <span>Descuento</span>
                <div className="flex items-center gap-2">
                  <span>-$</span>
                  <Input
                    type="number"
                    min="0"
                    className="w-24 h-8 text-right"
                    {...register('discount', { valueAsNumber: true })}
                  />
                </div>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  TOTAL
                </span>
                <span className="text-primary">${total.toLocaleString('es-CL')}</span>
              </div>
            </div>
          </Card>
        </form>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit(onSubmit)} 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Cotización'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
