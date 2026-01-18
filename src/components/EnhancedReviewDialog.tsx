import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Star, Camera, X, Upload, CheckCircle, Award, Clock, ThumbsUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface EnhancedReviewDialogProps {
  booking: {
    id: string;
    master_id: string;
    client_id: string;
    total_price: number;
    services?: { title: string; category: string } | null;
    profiles?: { full_name: string } | null;
    masters?: { business_name: string } | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  reviewerType: 'client' | 'master';
}

const ratingLabels = [
  { value: 1, label: 'Muy malo', emoji: '😞', color: 'text-red-500' },
  { value: 2, label: 'Malo', emoji: '😕', color: 'text-orange-500' },
  { value: 3, label: 'Regular', emoji: '😐', color: 'text-yellow-500' },
  { value: 4, label: 'Bueno', emoji: '😊', color: 'text-green-500' },
  { value: 5, label: 'Excelente', emoji: '🤩', color: 'text-primary' },
];

const quickTags = [
  { id: 'punctual', label: 'Puntual', icon: Clock },
  { id: 'professional', label: 'Profesional', icon: Award },
  { id: 'quality', label: 'Calidad', icon: CheckCircle },
  { id: 'recommended', label: 'Lo recomiendo', icon: ThumbsUp },
];

export function EnhancedReviewDialog({
  booking,
  open,
  onOpenChange,
  onSuccess,
  reviewerType,
}: EnhancedReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'rating' | 'details' | 'success'>('rating');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentRating = ratingLabels.find(r => r.value === (hoveredRating || rating));

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photos.length > 4) {
      toast({
        title: 'Máximo 4 fotos',
        description: 'Solo puedes subir hasta 4 fotos por reseña',
        variant: 'destructive',
      });
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({ title: 'Solo imágenes', variant: 'destructive' });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'Imagen muy grande (máx. 5MB)', variant: 'destructive' });
        return false;
      }
      return true;
    });

    setPhotos([...photos, ...validFiles]);
    validFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setPhotoPreviewUrls(prev => [...prev, url]);
    });
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviewUrls[index]);
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreviewUrls(photoPreviewUrls.filter((_, i) => i !== index));
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  const uploadPhotos = async (): Promise<string[]> => {
    if (photos.length === 0) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const uploadedUrls: string[] = [];

    for (const photo of photos) {
      const fileName = `reviews/${booking?.id}/${Date.now()}-${photo.name}`;
      const { error } = await supabase.storage
        .from('review-photos')
        .upload(fileName, photo);

      if (!error) {
        const { data: { publicUrl } } = supabase.storage
          .from('review-photos')
          .getPublicUrl(fileName);
        uploadedUrls.push(publicUrl);
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async () => {
    if (!booking || rating === 0) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      // Upload photos
      const photoUrls = await uploadPhotos();

      // Build comment with tags
      const tagsText = selectedTags.length > 0
        ? `[Tags: ${selectedTags.map(t => quickTags.find(qt => qt.id === t)?.label).join(', ')}]`
        : '';
      const fullComment = comment.trim()
        ? `${comment.trim()}${tagsText ? `\n\n${tagsText}` : ''}`
        : tagsText || null;

      // Create review
      const reviewData: any = {
        booking_id: booking.id,
        rating,
        comment: fullComment,
      };

      if (reviewerType === 'client') {
        reviewData.client_id = user.id;
        reviewData.master_id = booking.master_id;
      } else {
        reviewData.master_id = user.id;
        reviewData.client_id = booking.client_id;
      }

      const { error } = await supabase.from('reviews').insert(reviewData);
      if (error) throw error;

      // Update master rating average
      if (reviewerType === 'client') {
        const { data: reviews } = await supabase
          .from('reviews')
          .select('rating')
          .eq('master_id', booking.master_id);

        if (reviews && reviews.length > 0) {
          const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
          await supabase
            .from('masters')
            .update({
              rating: Math.round(avgRating * 10) / 10,
              total_reviews: reviews.length,
            })
            .eq('id', booking.master_id);
        }
      }

      // Notify the reviewed user
      const targetUserId = reviewerType === 'client' ? booking.master_id : booking.client_id;
      await supabase.from('notifications').insert({
        user_id: targetUserId,
        type: 'new_review',
        title: '¡Nueva reseña recibida!',
        message: `Has recibido una reseña de ${rating} estrellas`,
        booking_id: booking.id,
        metadata: { rating, has_photos: photoUrls.length > 0 },
      });

      setStep('success');

      setTimeout(() => {
        onOpenChange(false);
        onSuccess?.();
        // Reset state
        setRating(0);
        setComment('');
        setSelectedTags([]);
        setPhotos([]);
        setPhotoPreviewUrls([]);
        setStep('rating');
      }, 2000);

    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error al enviar reseña',
        description: error.message || 'Intenta nuevamente',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!booking) return null;

  const revieweeName = reviewerType === 'client'
    ? booking.masters?.business_name || 'Profesional'
    : booking.profiles?.full_name || 'Cliente';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <AnimatePresence mode="wait">
          {step === 'rating' && (
            <motion.div
              key="rating"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  ¿Cómo fue tu experiencia?
                </DialogTitle>
                <DialogDescription>
                  Califica a {revieweeName}
                </DialogDescription>
              </DialogHeader>

              <div className="py-8">
                {/* Service Info */}
                <Card className="p-4 mb-6 bg-muted/50">
                  <p className="font-semibold">{booking.services?.title || 'Servicio'}</p>
                  <p className="text-sm text-muted-foreground">{revieweeName}</p>
                </Card>

                {/* Star Rating */}
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="transition-colors"
                      >
                        <Star
                          className={cn(
                            "h-10 w-10 transition-all",
                            (hoveredRating || rating) >= star
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground/40"
                          )}
                        />
                      </motion.button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {currentRating && (
                      <motion.div
                        key={currentRating.value}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={cn("text-center", currentRating.color)}
                      >
                        <span className="text-3xl">{currentRating.emoji}</span>
                        <p className="font-medium mt-1">{currentRating.label}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setStep('details')} disabled={rating === 0}>
                  Continuar
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <DialogHeader>
                <DialogTitle>Detalles de tu reseña</DialogTitle>
                <DialogDescription>
                  Añade más detalles para ayudar a otros usuarios
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Quick Tags */}
                <div className="space-y-2">
                  <Label>¿Qué destacarías?</Label>
                  <div className="flex flex-wrap gap-2">
                    {quickTags.map((tag) => {
                      const Icon = tag.icon;
                      const isSelected = selectedTags.includes(tag.id);
                      return (
                        <Badge
                          key={tag.id}
                          variant={isSelected ? "default" : "outline"}
                          className={cn(
                            "cursor-pointer transition-all",
                            isSelected && "bg-primary"
                          )}
                          onClick={() => toggleTag(tag.id)}
                        >
                          <Icon className="h-3 w-3 mr-1" />
                          {tag.label}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {/* Comment */}
                <div className="space-y-2">
                  <Label>Comentario (opcional)</Label>
                  <Textarea
                    placeholder="Cuéntanos sobre tu experiencia..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {comment.length}/500
                  </p>
                </div>

                {/* Photo Upload */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Fotos del trabajo (opcional)
                  </Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoSelect}
                  />
                  
                  {photoPreviewUrls.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      {photoPreviewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {photos.length < 4 && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Añadir fotos ({photos.length}/4)
                    </Button>
                  )}
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setStep('rating')}>
                  Atrás
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : 'Publicar reseña'}
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="mb-4"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">¡Gracias por tu reseña!</h3>
              <p className="text-muted-foreground">
                Tu opinión ayuda a mejorar la comunidad
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
