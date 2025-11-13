import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Upload, X, FileImage } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface DisputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  bookingTitle?: string;
  userRole: 'client' | 'master';
  onSuccess?: () => void;
}

const DISPUTE_REASONS = {
  client: [
    { value: 'work_incomplete', label: 'Trabajo incompleto o no realizado' },
    { value: 'work_quality', label: 'Calidad del trabajo no satisfactoria' },
    { value: 'damage', label: 'Daños causados durante el servicio' },
    { value: 'different_service', label: 'Servicio diferente al acordado' },
    { value: 'no_show', label: 'Profesional no se presentó' },
    { value: 'other', label: 'Otro motivo' },
  ],
  master: [
    { value: 'payment_issue', label: 'Problema con el pago' },
    { value: 'client_no_show', label: 'Cliente no disponible' },
    { value: 'wrong_expectations', label: 'Expectativas incorrectas del cliente' },
    { value: 'additional_work', label: 'Trabajo adicional no compensado' },
    { value: 'unsafe_conditions', label: 'Condiciones de trabajo inseguras' },
    { value: 'other', label: 'Otro motivo' },
  ],
};

export const DisputeDialog = ({
  open,
  onOpenChange,
  bookingId,
  bookingTitle,
  userRole,
  onSuccess,
}: DisputeDialogProps) => {
  const { profile } = useAuth();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [evidencePreview, setEvidencePreview] = useState<string[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isUnder5MB = file.size <= 5 * 1024 * 1024;
      
      if (!isImage) {
        toast.error(`${file.name} no es una imagen válida`);
        return false;
      }
      if (!isUnder5MB) {
        toast.error(`${file.name} debe ser menor a 5MB`);
        return false;
      }
      return true;
    });

    if (evidenceFiles.length + validFiles.length > 5) {
      toast.error('Máximo 5 archivos de evidencia');
      return;
    }

    setEvidenceFiles(prev => [...prev, ...validFiles]);
    
    // Create previews
    validFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setEvidencePreview(prev => [...prev, url]);
    });
  };

  const removeFile = (index: number) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
    setEvidencePreview(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadEvidence = async (): Promise<string[]> => {
    if (evidenceFiles.length === 0) return [];

    const uploadedUrls: string[] = [];

    try {
      for (const file of evidenceFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `disputes/${bookingId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('booking-photos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('booking-photos')
          .getPublicUrl(data.path);

        uploadedUrls.push(publicUrl);
      }

      return uploadedUrls;
    } catch (error) {
      console.error('Error uploading evidence:', error);
      toast.error('Error al subir archivos de evidencia');
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!reason || !description.trim()) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    if (!profile?.id) {
      toast.error('Debes iniciar sesión');
      return;
    }

    setSubmitting(true);

    try {
      // Upload evidence
      const evidenceUrls = await uploadEvidence();

      // Get payment_id if exists
      const { data: payment } = await supabase
        .from('payments')
        .select('id')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Create dispute
      const { error } = await supabase
        .from('disputes')
        .insert({
          booking_id: bookingId,
          payment_id: payment?.id || null,
          opened_by: profile.id,
          opened_by_role: userRole,
          reason,
          description,
          evidence_urls: evidenceUrls,
          status: 'open'
        });

      if (error) throw error;

      toast.success('Disputa abierta exitosamente', {
        description: 'Un administrador la revisará pronto'
      });

      // Cleanup
      evidencePreview.forEach(url => URL.revokeObjectURL(url));
      
      onOpenChange(false);
      if (onSuccess) onSuccess();

      // Reset form
      setReason("");
      setDescription("");
      setEvidenceFiles([]);
      setEvidencePreview([]);

    } catch (error: any) {
      console.error('Error creating dispute:', error);
      toast.error('Error al abrir disputa', {
        description: error.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Abrir Disputa
          </DialogTitle>
          <DialogDescription>
            {bookingTitle && `Reserva: ${bookingTitle}`}
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertDescription className="text-xs">
            Las disputas son revisadas por administradores. Proporciona toda la información 
            y evidencia relevante para una resolución justa y rápida.
          </AlertDescription>
        </Alert>

        <div className="space-y-4 py-4">
          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Motivo de la Disputa <span className="text-destructive">*</span>
            </Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un motivo" />
              </SelectTrigger>
              <SelectContent>
                {DISPUTE_REASONS[userRole].map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Descripción Detallada <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Explica en detalle qué sucedió y por qué estás abriendo esta disputa..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Mínimo 50 caracteres ({description.length}/50)
            </p>
          </div>

          {/* Evidence Upload */}
          <div className="space-y-2">
            <Label>Evidencia (Opcional)</Label>
            <p className="text-xs text-muted-foreground">
              Sube fotos o capturas que respalden tu disputa (máx. 5 archivos, 5MB cada uno)
            </p>

            {/* Preview Grid */}
            {evidencePreview.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {evidencePreview.map((url, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img
                      src={url}
                      alt={`Evidence ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {evidenceFiles.length < 5 && (
              <div className="flex items-center justify-center">
                <label htmlFor="evidence-upload" className="cursor-pointer w-full">
                  <div className="flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg hover:bg-muted/50 transition-colors justify-center">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {evidenceFiles.length === 0 ? 'Agregar evidencia' : `Agregar más (${evidenceFiles.length}/5)`}
                    </span>
                  </div>
                  <input
                    id="evidence-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !reason || description.length < 50}
          >
            {submitting ? 'Enviando...' : 'Abrir Disputa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
