import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Search,
  Filter,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface VerificationRequest {
  master_id: string;
  master_name: string;
  verification_status: string;
  documents: {
    id: string;
    document_type: string;
    document_url: string;
    file_name: string;
    status: string;
    rejection_reason?: string;
    created_at: string;
  }[];
  pending_count: number;
  approved_count: number;
  rejected_count: number;
}

const DOCUMENT_LABELS: Record<string, string> = {
  cedula_frente: 'Cédula (Frente)',
  cedula_dorso: 'Cédula (Dorso)',
  certificacion: 'Certificación',
  antecedentes: 'Antecedentes',
  seguro: 'Seguro',
  otro: 'Otro'
};

export const VerificationManagement = () => {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [reviewingDoc, setReviewingDoc] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchVerificationRequests();
  }, []);

  const fetchVerificationRequests = async () => {
    try {
      // Get all masters with their documents
      const { data: masters, error: mastersError } = await supabase
        .from('masters')
        .select(`
          id,
          verification_status,
          profiles!masters_id_fkey(full_name)
        `)
        .in('verification_status', ['pending', 'unverified', 'verified', 'rejected']);

      if (mastersError) throw mastersError;

      // Get all verification documents
      const { data: docs, error: docsError } = await supabase
        .from('master_verification_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (docsError) throw docsError;

      // Group documents by master
      const requestsMap = new Map<string, VerificationRequest>();
      
      masters?.forEach(master => {
        const masterDocs = docs?.filter(d => d.master_id === master.id) || [];
        const pendingCount = masterDocs.filter(d => d.status === 'pending').length;
        const approvedCount = masterDocs.filter(d => d.status === 'approved').length;
        const rejectedCount = masterDocs.filter(d => d.status === 'rejected').length;

        if (masterDocs.length > 0 || master.verification_status === 'pending') {
          requestsMap.set(master.id, {
            master_id: master.id,
            master_name: (master.profiles as any)?.full_name || 'Sin nombre',
            verification_status: master.verification_status || 'unverified',
            documents: masterDocs,
            pending_count: pendingCount,
            approved_count: approvedCount,
            rejected_count: rejectedCount
          });
        }
      });

      setRequests(Array.from(requestsMap.values()));
    } catch (error) {
      console.error('Error fetching verification requests:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las solicitudes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDocument = async (docId: string) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('master_verification_documents')
        .update({
          status: 'approved',
          reviewed_by: profile?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', docId);

      if (error) throw error;

      toast({ title: "Documento aprobado" });
      setReviewingDoc(null);
      fetchVerificationRequests();
      
      // Check if we need to update master status
      if (selectedRequest) {
        checkAndUpdateMasterStatus(selectedRequest.master_id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectDocument = async (docId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Motivo requerido",
        description: "Debes indicar el motivo del rechazo",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('master_verification_documents')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          reviewed_by: profile?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', docId);

      if (error) throw error;

      // Update master status to rejected
      if (selectedRequest) {
        await supabase
          .from('masters')
          .update({ verification_status: 'rejected' })
          .eq('id', selectedRequest.master_id);
      }

      toast({ title: "Documento rechazado" });
      setReviewingDoc(null);
      setRejectionReason('');
      fetchVerificationRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const checkAndUpdateMasterStatus = async (masterId: string) => {
    const { data: docs } = await supabase
      .from('master_verification_documents')
      .select('status, document_type')
      .eq('master_id', masterId);

    if (!docs) return;

    // Check if required documents are approved
    const requiredTypes = ['cedula_frente', 'cedula_dorso'];
    const approvedRequired = requiredTypes.every(type =>
      docs.some(d => d.document_type === type && d.status === 'approved')
    );

    if (approvedRequired) {
      await supabase
        .from('masters')
        .update({
          verification_status: 'verified',
          verified_at: new Date().toISOString(),
          verified_by: profile?.id
        })
        .eq('id', masterId);

      // Create notification for master
      await supabase.from('notifications').insert({
        user_id: masterId,
        type: 'verification_approved',
        title: '🎉 ¡Perfil Verificado!',
        message: 'Tu perfil ha sido verificado. Ahora tienes el badge de profesional verificado.'
      });

      toast({ title: "Maestro verificado exitosamente" });
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.master_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.verification_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Verificado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rechazado</Badge>;
      default:
        return <Badge variant="outline">Sin verificar</Badge>;
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Gestión de Verificaciones
          </CardTitle>
          <CardDescription>
            Revisa y aprueba documentos de verificación de profesionales
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="verified">Verificados</SelectItem>
                <SelectItem value="rejected">Rechazados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{requests.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {requests.filter(r => r.verification_status === 'pending').length}
              </div>
              <div className="text-sm text-yellow-600">Pendientes</div>
            </div>
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {requests.filter(r => r.verification_status === 'verified').length}
              </div>
              <div className="text-sm text-green-600">Verificados</div>
            </div>
            <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {requests.filter(r => r.verification_status === 'rejected').length}
              </div>
              <div className="text-sm text-red-600">Rechazados</div>
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profesional</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Documentos</TableHead>
                <TableHead>Pendientes</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((req) => (
                <TableRow key={req.master_id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {req.master_name}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(req.verification_status)}</TableCell>
                  <TableCell>{req.documents.length}</TableCell>
                  <TableCell>
                    {req.pending_count > 0 && (
                      <Badge variant="secondary">{req.pending_count} por revisar</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedRequest(req)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Revisar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No se encontraron solicitudes
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Documentos de {selectedRequest?.master_name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedRequest?.documents.map((doc) => (
              <Card key={doc.id} className={doc.status === 'pending' ? 'border-yellow-200' : ''}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{DOCUMENT_LABELS[doc.document_type] || doc.document_type}</h4>
                      <p className="text-sm text-muted-foreground">{doc.file_name}</p>
                      {doc.status === 'rejected' && doc.rejection_reason && (
                        <p className="text-sm text-red-600 mt-1">Rechazado: {doc.rejection_reason}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(doc.status)}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setReviewingDoc(doc)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Review Dialog */}
      <Dialog open={!!reviewingDoc} onOpenChange={() => { setReviewingDoc(null); setRejectionReason(''); }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {reviewingDoc && DOCUMENT_LABELS[reviewingDoc.document_type]}
            </DialogTitle>
          </DialogHeader>

          {reviewingDoc && (
            <div className="space-y-4">
              {reviewingDoc.document_url.endsWith('.pdf') ? (
                <iframe src={reviewingDoc.document_url} className="w-full h-[500px]" />
              ) : (
                <img 
                  src={reviewingDoc.document_url} 
                  alt="Documento" 
                  className="max-w-full max-h-[500px] object-contain mx-auto"
                />
              )}

              {reviewingDoc.status === 'pending' && (
                <>
                  <Textarea
                    placeholder="Motivo del rechazo (solo si rechazas)"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />

                  <DialogFooter className="gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => handleRejectDocument(reviewingDoc.id)}
                      disabled={processing}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Rechazar
                    </Button>
                    <Button
                      onClick={() => handleApproveDocument(reviewingDoc.id)}
                      disabled={processing}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Aprobar
                    </Button>
                  </DialogFooter>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
