import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  masterName: string;
  onSuccess?: () => void;
}

const TIP_PRESETS = [500, 1000, 2000, 5000];

export const TipDialog = ({ open, onOpenChange, bookingId, masterName, onSuccess }: TipDialogProps) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const tipAmount = selectedAmount || (customAmount ? parseInt(customAmount) : 0);

  const handleSubmit = async () => {
    if (tipAmount <= 0) {
      toast({
        title: "Monto inválido",
        description: "Por favor ingresa un monto válido",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Actualizar el pago con la propina
      const { error } = await supabase
        .from('payments')
        .update({ tip_amount: tipAmount })
        .eq('booking_id', bookingId);

      if (error) throw error;

      toast({
        title: "¡Gracias por tu generosidad! 💜",
        description: `Tu propina de $${tipAmount.toLocaleString()} UYU ha sido enviada a ${masterName}`,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error sending tip:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la propina. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            ¿Dejar una propina?
          </DialogTitle>
          <DialogDescription>
            Tu propina va directamente a {masterName} como agradecimiento por su excelente trabajo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Preset amounts */}
          <div className="grid grid-cols-4 gap-2">
            {TIP_PRESETS.map((amount) => (
              <Button
                key={amount}
                type="button"
                variant={selectedAmount === amount ? "default" : "outline"}
                onClick={() => {
                  setSelectedAmount(amount);
                  setCustomAmount('');
                }}
                className="h-12"
              >
                ${amount.toLocaleString()}
              </Button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="space-y-2">
            <Label htmlFor="custom-tip">O ingresa otro monto</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="custom-tip"
                type="number"
                placeholder="Monto personalizado"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                className="pl-9"
              />
            </div>
          </div>

          {tipAmount > 0 && (
            <div className="text-center p-3 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground">Propina seleccionada</p>
              <p className="text-2xl font-bold text-primary">${tipAmount.toLocaleString()} UYU</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={handleSkip} disabled={loading}>
            Omitir
          </Button>
          <Button onClick={handleSubmit} disabled={loading || tipAmount <= 0}>
            {loading ? "Enviando..." : `Enviar propina`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
