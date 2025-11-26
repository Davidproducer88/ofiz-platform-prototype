import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { Upload, X, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { SERVICE_CATEGORIES } from '@/lib/categories';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  title: string;
  description: string;
  category: string;
  payment_method: string;
}

interface MobileServiceRequestWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function MobileServiceRequestWizard({
  open,
  onOpenChange,
  onSuccess,
}: MobileServiceRequestWizardProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photosPreviews, setPhotosPreviews] = useState<string[]>([]);
  const { toast } = useToast();
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormData>();
  
  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;
  const category = watch('category');
  const payment_method = watch('payment_method');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photos.length > 10) {
      toast({
        title: 'Límite de archivos',
        description: 'Máximo 10 archivos',
        variant: 'destructive',
      });
      return;
    }

    setPhotos([...photos, ...files]);
    
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotosPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotosPreviews(photosPreviews.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const photoUrls: string[] = [];
      for (const photo of photos) {
        const fileName = `${user.id}/${Date.now()}-${photo.name}`;
        const { error: uploadError } = await supabase.storage
          .from('service-requests')
          .upload(fileName, photo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('service-requests')
          .getPublicUrl(fileName);

        photoUrls.push(publicUrl);
      }

      const { error } = await supabase
        .from('service_requests')
        .insert({
          client_id: user.id,
          title: data.title,
          description: `${data.description}\n\nMétodo de pago: ${data.payment_method}`,
          category: data.category as any,
          budget_range: null,
          photos: photoUrls,
          status: 'open',
        } as any);

      if (error) throw error;

      toast({
        title: '¡Solicitud publicada! ✓',
        description: 'Los profesionales empezarán a enviarte presupuestos',
      });

      reset();
      setPhotos([]);
      setPhotosPreviews([]);
      setStep(1);
      onOpenChange(false);
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear la solicitud',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleClose = () => {
    reset();
    setPhotos([]);
    setPhotosPreviews([]);
    setStep(1);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[90vh] p-0">
        <div className="flex flex-col h-full">
          {/* Header fijo */}
          <SheetHeader className="p-4 border-b">
            <div className="flex items-center gap-3 mb-2">
              {step > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevStep}
                  className="h-9 w-9"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <div className="flex-1">
                <SheetTitle className="text-lg">
                  Nueva solicitud
                </SheetTitle>
                <SheetDescription className="text-xs">
                  Paso {step} de {totalSteps}
                </SheetDescription>
              </div>
            </div>
            <Progress value={progress} className="h-1.5" />
          </SheetHeader>

          {/* Contenido scrolleable */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              {/* Paso 1: Título */}
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <Label htmlFor="title" className="text-base font-semibold">
                      ¿Qué servicio necesitas?
                    </Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Describe brevemente el trabajo
                    </p>
                    <Input
                      id="title"
                      placeholder="Ej: Reparar cañería del baño"
                      className="h-12 text-base"
                      {...register('title', { required: 'El título es requerido' })}
                      autoFocus
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive mt-2">{errors.title.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Paso 2: Categoría */}
              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <Label className="text-base font-semibold">
                      Selecciona la categoría
                    </Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Esto ayuda a encontrar el profesional correcto
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {SERVICE_CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = category === cat.value;
                        return (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() => setValue('category', cat.value)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <Icon className={`h-8 w-8 mx-auto mb-2 ${cat.color}`} />
                            <div className="text-sm font-medium text-center">
                              {cat.label}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {errors.category && (
                      <p className="text-sm text-destructive mt-2">{errors.category.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Paso 3: Descripción y fotos */}
              {step === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <Label htmlFor="description" className="text-base font-semibold">
                      Describe los detalles
                    </Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Explica qué necesitas específicamente
                    </p>
                    <Textarea
                      id="description"
                      placeholder="Describe el trabajo, materiales necesarios, urgencia..."
                      rows={6}
                      className="text-base resize-none"
                      {...register('description', { required: 'La descripción es requerida' })}
                      autoFocus
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive mt-2">{errors.description.message}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-base font-semibold">
                      Agrega fotos (opcional)
                    </Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Ayuda al profesional a entender mejor
                    </p>
                    <label className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <span className="text-sm">Subir fotos</span>
                        <span className="block text-xs text-muted-foreground mt-1">
                          Máximo 10 archivos
                        </span>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>

                    {photosPreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {photosPreviews.map((preview, index) => (
                          <div key={index} className="relative aspect-square">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(index)}
                              className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Paso 4: Método de pago */}
              {step === 4 && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <Label className="text-base font-semibold">
                      Método de pago preferido
                    </Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Pagos seguros con Mercado Pago
                    </p>
                    
                    <div className="space-y-3">
                      {[
                        { value: 'mp_cuenta_debito_prepaga_redes', label: 'Dinero en cuenta, Débito o Prepaga' },
                        { value: 'mp_credito_1_cuota', label: 'Tarjeta de crédito (1 cuota)' },
                        { value: 'mp_credito_en_cuotas', label: 'Tarjeta de crédito (en cuotas)' },
                      ].map((method) => (
                        <button
                          key={method.value}
                          type="button"
                          onClick={() => setValue('payment_method', method.value)}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                            payment_method === method.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{method.label}</span>
                            {payment_method === method.value && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    {errors.payment_method && (
                      <p className="text-sm text-destructive mt-2">{errors.payment_method.message}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer fijo con botón */}
            <div className="p-4 border-t bg-background">
              {step < totalSteps ? (
                <Button
                  type="button"
                  size="lg"
                  className="w-full h-12 text-base font-semibold"
                  onClick={nextStep}
                  disabled={
                    (step === 1 && !watch('title')) ||
                    (step === 2 && !watch('category')) ||
                    (step === 3 && !watch('description'))
                  }
                >
                  Continuar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 text-base font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Publicando...' : 'Publicar solicitud'}
                </Button>
              )}
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
