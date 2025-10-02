import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";

interface ServiceRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface FormData {
  title: string;
  description: string;
  category: string;
  payment_method: string;
}

const categories = [
  { value: "plumbing", label: "Plomería" },
  { value: "electricity", label: "Electricidad" },
  { value: "cleaning", label: "Limpieza" },
  { value: "carpentry", label: "Carpintería" },
  { value: "painting", label: "Pintura" },
  { value: "gardening", label: "Jardinería" },
  { value: "other", label: "Otro" },
];

export function ServiceRequestForm({
  open,
  onOpenChange,
  onSuccess,
}: ServiceRequestFormProps) {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photosPreviews, setPhotosPreviews] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photos.length > 10) {
      toast({
        title: "Límite de archivos",
        description: "Puedes subir máximo 10 archivos (fotos y videos)",
        variant: "destructive",
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
      if (!user) throw new Error("Usuario no autenticado");

      // Upload photos to storage
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const fileName = `${user.id}/${Date.now()}-${photo.name}`;
        const { error: uploadError } = await supabase.storage
          .from("service-requests")
          .upload(fileName, photo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("service-requests")
          .getPublicUrl(fileName);

        photoUrls.push(publicUrl);
      }

      // Create service request with payment method
      const { error } = await supabase
        .from("service_requests")
        .insert({
          client_id: user.id,
          title: data.title,
          description: `${data.description}\n\nMétodo de pago preferido: ${data.payment_method}`,
          category: data.category as any,
          budget_range: null,
          photos: photoUrls,
          status: "open",
        } as any);

      if (error) throw error;

      toast({
        title: "¡Solicitud publicada!",
        description: "Los maestros podrán ver tu solicitud y enviarte presupuestos",
      });

      reset();
      setPhotos([]);
      setPhotosPreviews([]);
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating request:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la solicitud",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Publicar solicitud de servicio</DialogTitle>
          <DialogDescription>
            Describe el trabajo que necesitas y recibe presupuestos de maestros calificados
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Título del trabajo *</Label>
            <Input
              id="title"
              placeholder="Ej: Renovación de baño completo"
              {...register("title", { required: "El título es requerido" })}
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="category">Categoría *</Label>
            <Select onValueChange={(value) => setValue("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descripción detallada *</Label>
            <Textarea
              id="description"
              placeholder="Describe el trabajo que necesitas realizar, materiales, preferencias, etc."
              rows={5}
              {...register("description", { required: "La descripción es requerida" })}
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="payment_method">Método de Pago Preferido *</Label>
            <Select onValueChange={(value) => setValue("payment_method", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona método de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Efectivo">Efectivo</SelectItem>
                <SelectItem value="Transferencia Bancaria">Transferencia Bancaria</SelectItem>
                <SelectItem value="Tarjeta de Crédito/Débito">Tarjeta de Crédito/Débito</SelectItem>
                <SelectItem value="Cualquiera">Cualquiera</SelectItem>
              </SelectContent>
            </Select>
            {errors.payment_method && (
              <p className="text-sm text-destructive mt-1">{errors.payment_method.message}</p>
            )}
          </div>

          <div>
            <Label>Fotos y Videos (opcional - máx. 10 archivos)</Label>
            <div className="mt-2">
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                <div className="flex flex-col items-center">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Haz clic para subir fotos o videos
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Formatos: JPG, PNG, MP4, MOV
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
            </div>

            {photosPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {photosPreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Publicando..." : "Publicar solicitud"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}