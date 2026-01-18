import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, ThumbsUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface QuickRatingWidgetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  masterId: string;
  clientId: string;
  masterName: string;
  serviceName: string;
  onSuccess?: () => void;
  onShowTip?: () => void;
}

export const QuickRatingWidget = ({
  open,
  onOpenChange,
  bookingId,
  masterId,
  clientId,
  masterName,
  serviceName,
  onSuccess,
  onShowTip,
}: QuickRatingWidgetProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'rating' | 'comment'>('rating');

  const handleRatingSelect = (selectedRating: number) => {
    setRating(selectedRating);
    // Si es 4 o 5 estrellas, pasar directo al comentario opcional
    if (selectedRating >= 4) {
      setStep('comment');
    } else {
      // Para ratings bajos, pedir comentario obligatorio
      setStep('comment');
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Selecciona una calificación",
        description: "Por favor selecciona al menos una estrella",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Verificar si ya existe una reseña
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('booking_id', bookingId)
        .maybeSingle();

      if (existingReview) {
        toast({
          title: "Ya calificaste este servicio",
          description: "Solo puedes dejar una reseña por servicio",
        });
        onOpenChange(false);
        return;
      }

      // Crear la reseña
      const { error } = await supabase
        .from('reviews')
        .insert({
          booking_id: bookingId,
          master_id: masterId,
          client_id: clientId,
          rating,
          comment: comment.trim() || null,
        });

      if (error) throw error;

      // Marcar que se mostró el rating
      await supabase
        .from('bookings')
        .update({ quick_rating_shown: true })
        .eq('id', bookingId);

      toast({
        title: "¡Gracias por tu valoración! ⭐",
        description: rating >= 4 
          ? "Tu feedback ayuda a otros clientes a elegir" 
          : "Lamentamos que tu experiencia no haya sido perfecta",
      });

      onOpenChange(false);
      onSuccess?.();

      // Si fue una buena calificación, ofrecer propina
      if (rating >= 4 && onShowTip) {
        setTimeout(() => onShowTip(), 500);
      }
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la valoración. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    // Marcar como mostrado para no volver a preguntar
    await supabase
      .from('bookings')
      .update({ quick_rating_shown: true })
      .eq('id', bookingId);

    onOpenChange(false);
  };

  const displayRating = hoveredRating || rating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-primary" />
            ¿Cómo fue tu experiencia?
          </DialogTitle>
          <DialogDescription>
            Califica el servicio de <strong>{masterName}</strong> en <strong>{serviceName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Stars */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingSelect(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded-full p-1"
              >
                <Star
                  className={cn(
                    "h-10 w-10 transition-colors",
                    star <= displayRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground/30"
                  )}
                />
              </button>
            ))}
          </div>

          {/* Rating label */}
          {displayRating > 0 && (
            <p className="text-center text-sm font-medium">
              {displayRating === 1 && "😞 Muy malo"}
              {displayRating === 2 && "😕 Malo"}
              {displayRating === 3 && "😐 Regular"}
              {displayRating === 4 && "😊 Bueno"}
              {displayRating === 5 && "🤩 Excelente"}
            </p>
          )}

          {/* Comment (shows after rating selection) */}
          {step === 'comment' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
              <Textarea
                placeholder={
                  rating >= 4 
                    ? "Cuéntanos qué te gustó (opcional)" 
                    : "Cuéntanos qué podría mejorar"
                }
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={handleSkip} disabled={loading}>
            Omitir
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || rating === 0}
          >
            {loading ? "Enviando..." : "Enviar valoración"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
