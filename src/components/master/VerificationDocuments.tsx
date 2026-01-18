import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Shield, 
  Camera,
  Trash2,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface VerificationDocument {
  id: string;
  document_type: string;
  document_url: string;
  file_name: string | null;
  status: string;
  rejection_reason?: string | null;
  created_at: string;
}

const DOCUMENT_TYPES = [
  { 
    id: 'cedula_frente', 
    label: 'Cédula de Identidad (Frente)', 
    description: 'Foto clara del frente de tu cédula',
    required: true,
    icon: FileText
  },
  { 
    id: 'cedula_dorso', 
    label: 'Cédula de Identidad (Dorso)', 
    description: 'Foto clara del dorso de tu cédula',
    required: true,
    icon: FileText
  },
  { 
    id: 'certificacion', 
    label: 'Certificación Profesional', 
    description: 'Diploma o certificado de tu oficio',
    required: false,
    icon: Shield
  },
  { 
    id: 'antecedentes', 
    label: 'Certificado de Antecedentes', 
    description: 'Certificado policial de antecedentes',
    required: false,
    icon: FileText
  },
  { 
    id: 'seguro', 
    label: 'Póliza de Seguro', 
    description: 'Seguro de responsabilidad civil (si aplica)',
    required: false,
    icon: Shield
  },
];

export const VerificationDocuments = () => {
  const { profile } = useAuth();
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<string>('unverified');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.id) {
      fetchDocuments();
      fetchVerificationStatus();
    }
  }, [profile?.id]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('master_verification_documents')
        .select('*')
        .eq('master_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVerificationStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('masters')
        .select('verification_status')
        .eq('id', profile?.id)
        .single();

      if (error) throw error;
      setVerificationStatus(data?.verification_status || 'unverified');
    } catch (error) {
      console.error('Error fetching verification status:', error);
    }
  };

  const handleFileUpload = async (documentType: string, file: File) => {
    if (!profile?.id) return;

    setUploading(documentType);
    try {
      // Validate file
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('El archivo no puede superar los 10MB');
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Solo se permiten imágenes (JPG, PNG, WebP) o PDF');
      }

      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/${documentType}-${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('verification-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('verification-documents')
        .getPublicUrl(fileName);

      // Delete existing document of same type if exists
      const existingDoc = documents.find(d => d.document_type === documentType);
      if (existingDoc) {
        await supabase
          .from('master_verification_documents')
          .delete()
          .eq('id', existingDoc.id);
      }

      // Insert document record
      const { error: insertError } = await supabase
        .from('master_verification_documents')
        .insert({
          master_id: profile.id,
          document_type: documentType,
          document_url: urlData.publicUrl,
          file_name: file.name,
          file_size: file.size,
          status: 'pending'
        });

      if (insertError) throw insertError;

      // Update verification status to pending if not already verified
      if (verificationStatus !== 'verified') {
        await supabase
          .from('masters')
          .update({ verification_status: 'pending' })
          .eq('id', profile.id);
        setVerificationStatus('pending');
      }

      toast({
        title: "Documento subido",
        description: "Tu documento ha sido enviado para revisión"
      });

      fetchDocuments();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Error al subir",
        description: error.message || "No se pudo subir el documento",
        variant: "destructive"
      });
    } finally {
      setUploading(null);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      const { error } = await supabase
        .from('master_verification_documents')
        .delete()
        .eq('id', docId);

      if (error) throw error;

      toast({
        title: "Documento eliminado",
        description: "El documento ha sido eliminado"
      });

      fetchDocuments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getDocumentForType = (type: string) => {
    return documents.find(d => d.document_type === type);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Aprobado</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rechazado</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />En revisión</Badge>;
    }
  };

  const getVerificationProgress = () => {
    const requiredDocs = DOCUMENT_TYPES.filter(d => d.required);
    const uploadedRequired = requiredDocs.filter(d => getDocumentForType(d.id));
    return (uploadedRequired.length / requiredDocs.length) * 100;
  };

  const getOverallStatusBadge = () => {
    switch (verificationStatus) {
      case 'verified':
        return <Badge className="bg-green-600 text-white gap-1"><Shield className="w-4 h-4" />Verificado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white gap-1"><Clock className="w-4 h-4" />En revisión</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-4 h-4" />Rechazado</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><AlertTriangle className="w-4 h-4" />Sin verificar</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Verificación de Identidad
              </CardTitle>
              <CardDescription>
                Sube tus documentos para obtener el badge de profesional verificado
              </CardDescription>
            </div>
            {getOverallStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progreso de documentos requeridos</span>
                <span>{Math.round(getVerificationProgress())}%</span>
              </div>
              <Progress value={getVerificationProgress()} className="h-2" />
            </div>

            {verificationStatus === 'verified' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  ¡Felicitaciones! Tu perfil está verificado. Los clientes verán un badge de confianza en tu perfil.
                </AlertDescription>
              </Alert>
            )}

            {verificationStatus === 'rejected' && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Tu verificación fue rechazada. Revisa los documentos marcados y vuelve a subirlos.
                </AlertDescription>
              </Alert>
            )}

            {verificationStatus === 'pending' && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <Clock className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Tus documentos están siendo revisados. Este proceso puede tomar 24-48 horas.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document Upload Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {DOCUMENT_TYPES.map((docType) => {
          const doc = getDocumentForType(docType.id);
          const Icon = docType.icon;

          return (
            <Card key={docType.id} className={doc?.status === 'rejected' ? 'border-red-200' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${doc ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Icon className={`h-6 w-6 ${doc ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{docType.label}</h4>
                      {docType.required && (
                        <Badge variant="outline" className="text-xs">Requerido</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {docType.description}
                    </p>

                    {doc ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(doc.status)}
                          <span className="text-xs text-muted-foreground truncate">
                            {doc.file_name}
                          </span>
                        </div>

                        {doc.status === 'rejected' && doc.rejection_reason && (
                          <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            Motivo: {doc.rejection_reason}
                          </p>
                        )}

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPreviewUrl(doc.document_url)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          {doc.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteDocument(doc.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Eliminar
                            </Button>
                          )}
                          {(doc.status === 'rejected' || doc.status === 'pending') && (
                            <label className="cursor-pointer">
                              <Button size="sm" variant="default" asChild>
                                <span>
                                  <Upload className="h-4 w-4 mr-1" />
                                  Resubir
                                </span>
                              </Button>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*,application/pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(docType.id, file);
                                }}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <Button
                          variant="outline"
                          className="w-full"
                          disabled={uploading === docType.id}
                          asChild
                        >
                          <span>
                            {uploading === docType.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                                Subiendo...
                              </>
                            ) : (
                              <>
                                <Camera className="h-4 w-4 mr-2" />
                                Subir documento
                              </>
                            )}
                          </span>
                        </Button>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,application/pdf"
                          disabled={uploading === docType.id}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(docType.id, file);
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Vista previa del documento</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            previewUrl.endsWith('.pdf') ? (
              <iframe src={previewUrl} className="w-full h-[600px]" />
            ) : (
              <img src={previewUrl} alt="Documento" className="max-w-full max-h-[600px] object-contain mx-auto" />
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
