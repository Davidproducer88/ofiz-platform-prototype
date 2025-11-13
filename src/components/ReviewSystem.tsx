import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReviewSystemProps {
  bookingId: string;
  revieweeId: string; // ID del usuario que recibe la reseña
  revieweeType: 'master' | 'client' | 'business';
  reviewerType: 'master' | 'client' | 'business';
  onReviewSubmitted?: () => void;
}

export const ReviewSystem = ({
  bookingId,
  revieweeId,
  revieweeType,
  reviewerType,
  onReviewSubmitted
}: ReviewSystemProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Por favor, selecciona una calificación");
      return;
    }

    try {
      setIsSubmitting(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // Verificar plan y límites según el tipo de reviewer
      if (reviewerType === 'business') {
        const { data: subscription } = await supabase
          .from('business_subscriptions')
          .select('*')
          .eq('business_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (!subscription) {
          toast.error("Necesitas una suscripción activa para dejar reseñas");
          return;
        }
      } else if (reviewerType === 'master') {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('master_id', user.id)
          .maybeSingle();

        // Solo premium pueden dejar reseñas a clientes
        if (revieweeType === 'client' && subscription?.plan !== 'premium') {
          toast.error("La función de valorar clientes está disponible solo en el plan Premium");
          return;
        }
      }

      // Insertar reseña
      const reviewData: any = {
        booking_id: bookingId,
        rating,
        comment: comment.trim() || null,
      };

      // Asignar IDs según el tipo de reseña
      if (reviewerType === 'client' && revieweeType === 'master') {
        reviewData.client_id = user.id;
        reviewData.master_id = revieweeId;
      } else if (reviewerType === 'master' && revieweeType === 'client') {
        reviewData.master_id = user.id;
        reviewData.client_id = revieweeId;
      } else if (reviewerType === 'business' && revieweeType === 'master') {
        reviewData.business_id = user.id;
        reviewData.master_id = revieweeId;
      }

      const { error } = await supabase
        .from('reviews')
        .insert(reviewData);

      if (error) throw error;

      toast.success("¡Reseña enviada exitosamente!");
      setRating(0);
      setComment("");
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error(error.message || "Error al enviar la reseña");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRevieweeLabel = () => {
    switch (revieweeType) {
      case 'master':
        return 'profesional';
      case 'client':
        return 'cliente';
      case 'business':
        return 'empresa';
      default:
        return 'usuario';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calificar {getRevieweeLabel()}</CardTitle>
        <CardDescription>
          Tu opinión ayuda a mejorar la experiencia de todos en la plataforma
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rating Stars */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Calificación</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredRating || rating)
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-muted-foreground">
              {rating > 0 ? `${rating} ${rating === 1 ? 'estrella' : 'estrellas'}` : 'Selecciona una calificación'}
            </span>
          </div>
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Comentario (opcional)</label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={`Cuéntanos sobre tu experiencia con este ${getRevieweeLabel()}...`}
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">
            {comment.length}/500 caracteres
          </p>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0}
          className="w-full"
        >
          {isSubmitting ? "Enviando..." : "Enviar reseña"}
        </Button>
      </CardContent>
    </Card>
  );
};
