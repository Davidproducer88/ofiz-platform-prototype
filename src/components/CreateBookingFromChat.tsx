import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateBookingFromChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  masterId: string;
  clientId: string;
  onSuccess?: () => void;
}

interface FormData {
  title: string;
  description: string;
  price: number;
  address: string;
}

export function CreateBookingFromChat({
  open,
  onOpenChange,
  conversationId,
  masterId,
  clientId,
  onSuccess,
}: CreateBookingFromChatProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const { toast } = useToast();

  const onSubmit = async (data: FormData) => {
    if (!scheduledDate) {
      toast({
        title: "Error",
        description: "Debes seleccionar una fecha para el servicio",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Primero crear un servicio temporal para este encargo
      const { data: serviceData, error: serviceError } = await supabase
        .from("service_from_chat")
        .insert({
          title: data.title,
          description: data.description,
          master_id: masterId,
          price: data.price,
        })
        .select()
        .single();

      if (serviceError) throw serviceError;

      // Crear el booking con el servicio temporal
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          client_id: clientId,
          master_id: masterId,
          service_id: serviceData.id,
          total_price: data.price,
          scheduled_date: scheduledDate.toISOString(),
          client_address: data.address,
          notes: data.description,
          status: "confirmed",
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Actualizar conversación con el booking_id
      const { error: convError } = await supabase
        .from("conversations")
        .update({ booking_id: bookingData.id })
        .eq("id", conversationId);

      if (convError) throw convError;

      // Crear notificación para el maestro
      await supabase.from("notifications").insert({
        user_id: masterId,
        type: "booking_new",
        title: "Nuevo encargo confirmado",
        message: `Se ha creado un encargo: ${data.title}`,
        booking_id: bookingData.id,
        metadata: {
          booking_id: bookingData.id,
          price: data.price,
        },
      });

      toast({
        title: "¡Encargo creado!",
        description: "El encargo ha sido creado exitosamente",
      });

      reset();
      setScheduledDate(undefined);
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating booking:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el encargo",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Crear Encargo</DialogTitle>
          <DialogDescription>
            Formaliza el acuerdo creando un encargo oficial
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 overflow-y-auto flex-1 px-1">
          <div>
            <Label htmlFor="title">Título del encargo *</Label>
            <Input
              id="title"
              placeholder="Ej: Instalación de lavamanos"
              {...register("title", { required: "El título es requerido" })}
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descripción del trabajo *</Label>
            <Textarea
              id="description"
              placeholder="Describe los detalles acordados..."
              rows={4}
              {...register("description", { required: "La descripción es requerida" })}
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="price">Precio acordado *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("price", {
                required: "El precio es requerido",
                min: { value: 0, message: "El precio debe ser mayor a 0" },
              })}
            />
            {errors.price && (
              <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
            )}
          </div>

          <div>
            <Label>Fecha programada *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !scheduledDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {scheduledDate ? (
                    format(scheduledDate, "PPP", { locale: es })
                  ) : (
                    <span>Selecciona una fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={scheduledDate}
                  onSelect={setScheduledDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="address">Dirección del servicio *</Label>
            <Input
              id="address"
              placeholder="Dirección completa"
              {...register("address", { required: "La dirección es requerida" })}
            />
            {errors.address && (
              <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
            )}
          </div>

          <DialogFooter className="flex-shrink-0 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear Encargo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
