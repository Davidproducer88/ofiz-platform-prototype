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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
  onSuccess?: () => void;
}

interface FormData {
  proposed_price: number;
  message: string;
}

export function ApplicationDialog({
  open,
  onOpenChange,
  requestId,
  onSuccess,
}: ApplicationDialogProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      // Check if user is a master
      const { data: masterData, error: masterError } = await supabase
        .from("masters")
        .select("id")
        .eq("id", user.id)
        .single();

      if (masterError || !masterData) {
        throw new Error("Debes ser un maestro para enviar presupuestos");
      }

      // Create application
      const { error } = await supabase
        .from("service_applications")
        .insert({
          request_id: requestId,
          master_id: user.id,
          proposed_price: data.proposed_price,
          message: data.message,
          status: "pending",
        });

      if (error) {
        if (error.code === "23505") {
          throw new Error("Ya has enviado un presupuesto para esta solicitud");
        }
        throw error;
      }

      toast({
        title: "¡Presupuesto enviado!",
        description: "El cliente recibirá tu propuesta y podrá contactarte",
      });

      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating application:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar el presupuesto",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar presupuesto</DialogTitle>
          <DialogDescription>
            Envía tu propuesta al cliente con el precio y detalles del servicio
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="proposed_price">Precio propuesto *</Label>
            <Input
              id="proposed_price"
              type="number"
              step="0.01"
              placeholder="Ej: 500.00"
              {...register("proposed_price", {
                required: "El precio es requerido",
                min: { value: 0, message: "El precio debe ser mayor a 0" },
              })}
            />
            {errors.proposed_price && (
              <p className="text-sm text-destructive mt-1">
                {errors.proposed_price.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="message">Mensaje para el cliente *</Label>
            <Textarea
              id="message"
              placeholder="Describe tu experiencia, tiempo estimado, materiales incluidos, etc."
              rows={5}
              {...register("message", {
                required: "El mensaje es requerido",
                minLength: {
                  value: 20,
                  message: "El mensaje debe tener al menos 20 caracteres",
                },
              })}
            />
            {errors.message && (
              <p className="text-sm text-destructive mt-1">{errors.message.message}</p>
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
              {isSubmitting ? "Enviando..." : "Enviar presupuesto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}