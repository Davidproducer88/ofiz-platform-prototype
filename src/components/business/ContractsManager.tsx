import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Users, Calendar, DollarSign, MapPin, FileText, MessageCircle } from "lucide-react";
import { ContractPaymentCheckoutBrick } from "./ContractPaymentCheckoutBrick";
import { useNavigate } from "react-router-dom";

interface ContractsManagerProps {
  businessId: string;
  subscription: any;
  onUpdate: () => void;
}

export const ContractsManager = ({ businessId, subscription, onUpdate }: ContractsManagerProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<string | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    budget_min: '',
    budget_max: '',
    required_masters: '1',
    deadline: ''
  });

  useEffect(() => {
    fetchContracts();
  }, [businessId]);

  const fetchContracts = async () => {
    try {
      const { data, error } = await supabase
        .from('business_contracts')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error: any) {
      console.error('Error fetching contracts:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los contratos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (contractId: string) => {
    try {
      const { data, error } = await supabase
        .from('business_contract_applications')
        .select(`
          *,
          master:masters (
            id,
            business_name,
            rating,
            total_reviews
          )
        `)
        .eq('contract_id', contractId);

      if (error) throw error;
      setApplications(data || []);
      setSelectedContract(contractId);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las aplicaciones",
        variant: "destructive",
      });
    }
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subscription || subscription.status !== 'active') {
      toast({
        title: "Función no disponible",
        description: "Necesitas una suscripción activa para crear contratos",
        variant: "destructive",
      });
      return;
    }

    if (subscription.contacts_used >= subscription.monthly_contacts_limit) {
      toast({
        title: "Límite alcanzado",
        description: `Has usado ${subscription.contacts_used} de ${subscription.monthly_contacts_limit} contactos. Actualiza tu plan para continuar.`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Crear el contrato
      const { error: contractError } = await supabase
        .from('business_contracts')
        .insert([{
          business_id: businessId,
          title: formData.title,
          description: formData.description,
          location: formData.location,
          category: formData.category as any,
          budget_min: parseFloat(formData.budget_min) || null,
          budget_max: parseFloat(formData.budget_max) || null,
          required_masters: parseInt(formData.required_masters),
          deadline: formData.deadline || null
        }]);

      if (contractError) throw contractError;

      // Incrementar el contador de contactos usados
      const { error: updateError } = await supabase
        .from('business_subscriptions')
        .update({ 
          contacts_used: subscription.contacts_used + 1 
        })
        .eq('id', subscription.id);

      if (updateError) throw updateError;

      toast({
        title: "Contrato creado",
        description: "Tu proyecto ha sido publicado correctamente",
      });

      setDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        category: '',
        location: '',
        budget_min: '',
        budget_max: '',
        required_masters: '1',
        deadline: ''
      });
      fetchContracts();
      onUpdate();
    } catch (error: any) {
      const errorMessage = error?.message || "No se pudo crear el contrato";
      console.error('Error creating contract:', errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleAcceptApplication = (application: any) => {
    setSelectedApplication(application);
    setShowPaymentDialog(true);
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    
    
    // Create or find conversation with the master
    if (selectedApplication) {
      try {
        // Check if conversation exists
        const { data: existingConvo } = await supabase
          .from('conversations')
          .select('id')
          .eq('client_id', businessId)
          .eq('master_id', selectedApplication.master_id)
          .maybeSingle();

        if (!existingConvo) {
          // Create new conversation
          const { data: newConvo, error: convoError } = await supabase
            .from('conversations')
            .insert({
              client_id: businessId,
              master_id: selectedApplication.master_id
            })
            .select('id')
            .single();

          if (convoError) throw convoError;

          // Send initial message
          if (newConvo) {
            await supabase.from('messages').insert({
              conversation_id: newConvo.id,
              sender_id: businessId,
              content: `¡Hola! Te he seleccionado para el contrato. Estoy emocionado de trabajar contigo. ¿Podemos coordinar los detalles?`
            });
          }
        }

        toast({
          title: "¡Contrato asignado!",
          description: "Se ha creado un chat con el profesional. Puedes contactarlo desde tu dashboard.",
        });
      } catch (error) {
        console.error('Error creating conversation:', error);
      }
    }

    setShowPaymentDialog(false);
    setSelectedApplication(null);
    if (selectedContract) {
      fetchApplications(selectedContract);
    }
    fetchContracts();
    onUpdate();
  };

  const startChatWithMaster = async (masterId: string) => {
    try {
      // Check if conversation exists
      const { data: existingConvo } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_id', businessId)
        .eq('master_id', masterId)
        .maybeSingle();

      if (existingConvo) {
        navigate(`/business-dashboard?tab=chat&conversation=${existingConvo.id}`);
      } else {
        // Create new conversation
        const { data: newConvo, error } = await supabase
          .from('conversations')
          .insert({
            client_id: businessId,
            master_id: masterId
          })
          .select('id')
          .single();

        if (error) throw error;
        if (newConvo) {
          navigate(`/business-dashboard?tab=chat&conversation=${newConvo.id}`);
        }
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast({
        title: "Error",
        description: "No se pudo iniciar el chat",
        variant: "destructive",
      });
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    toast({
      variant: "destructive",
      title: "Error en el pago",
      description: "No se pudo procesar el pago. Intenta nuevamente.",
    });
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('business_contract_applications')
        .update({ status: 'rejected' })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: "Aplicación rechazada",
        description: "La aplicación ha sido rechazada correctamente",
      });

      if (selectedContract) {
        fetchApplications(selectedContract);
      }
      onUpdate();
    } catch (error: any) {
      console.error('Error updating application:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la aplicación",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contratos y Proyectos</h2>
          <p className="text-muted-foreground">
            Publica proyectos y recibe propuestas de profesionales
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!subscription || subscription.status !== 'active'}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Contrato
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreateContract}>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Contrato</DialogTitle>
                <DialogDescription>
                  Publica un proyecto y recibe propuestas de múltiples profesionales
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título del Proyecto *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plumbing">Plomería</SelectItem>
                        <SelectItem value="electricity">Electricidad</SelectItem>
                        <SelectItem value="carpentry">Carpintería</SelectItem>
                        <SelectItem value="painting">Pintura</SelectItem>
                        <SelectItem value="cleaning">Limpieza</SelectItem>
                        <SelectItem value="gardening">Jardinería</SelectItem>
                        <SelectItem value="appliance">Electrodomésticos</SelectItem>
                        <SelectItem value="computer">Informática</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Ubicación *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Ciudad o dirección"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget_min">Presupuesto Mínimo ($)</Label>
                    <Input
                      id="budget_min"
                      type="number"
                      min="0"
                      value={formData.budget_min}
                      onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget_max">Presupuesto Máximo ($)</Label>
                    <Input
                      id="budget_max"
                      type="number"
                      min="0"
                      value={formData.budget_max}
                      onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="required_masters">Profesionales Requeridos *</Label>
                    <Input
                      id="required_masters"
                      type="number"
                      min="1"
                      value={formData.required_masters}
                      onChange={(e) => setFormData({ ...formData, required_masters: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Fecha Límite</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Publicar Contrato
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando contratos...</p>
        </div>
      ) : contracts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No tienes contratos creados aún</p>
            {subscription ? (
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear tu primer contrato
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Activa una suscripción para comenzar a crear contratos
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {contracts.map((contract) => (
            <Card key={contract.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{contract.title}</CardTitle>
                      <Badge variant={
                        contract.status === 'open' ? 'default' :
                        contract.status === 'in_progress' ? 'secondary' :
                        contract.status === 'completed' ? 'default' : 'outline'
                      }>
                        {contract.status}
                      </Badge>
                    </div>
                    <CardDescription>{contract.description}</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => fetchApplications(contract.id)}
                  >
                    Ver Aplicaciones
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{contract.location}</p>
                      <p className="text-muted-foreground">Ubicación</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{contract.required_masters}</p>
                      <p className="text-muted-foreground">Profesionales</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {contract.budget_min && contract.budget_max
                          ? `$${contract.budget_min.toLocaleString()} - $${contract.budget_max.toLocaleString()}`
                          : 'A convenir'}
                      </p>
                      <p className="text-muted-foreground">Presupuesto</p>
                    </div>
                  </div>
                  {contract.deadline && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{new Date(contract.deadline).toLocaleDateString()}</p>
                        <p className="text-muted-foreground">Fecha límite</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Applications Dialog */}
      <Dialog open={selectedContract !== null} onOpenChange={() => setSelectedContract(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Aplicaciones Recibidas</DialogTitle>
            <DialogDescription>
              Revisa y gestiona las propuestas de los profesionales
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {applications.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No has recibido aplicaciones aún
              </p>
            ) : (
              applications.map((app) => (
                <Card key={app.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{app.master?.business_name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">
                            ⭐ {app.master?.rating?.toFixed(1)} ({app.master?.total_reviews} reseñas)
                          </span>
                          <Badge variant={
                            app.status === 'pending' ? 'secondary' :
                            app.status === 'accepted' ? 'default' : 'destructive'
                          }>
                            {app.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">${app.proposed_price.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Precio propuesto</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {app.message && (
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-1">Mensaje:</p>
                        <p className="text-sm">{app.message}</p>
                      </div>
                    )}
                    {app.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptApplication(app)}
                        >
                          Aceptar y Pagar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectApplication(app.id)}
                        >
                          Rechazar
                        </Button>
                      </div>
                    )}
                    {app.status === 'accepted' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => startChatWithMaster(app.master_id)}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Chatear con Profesional
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Confirmar Pago del Contrato</DialogTitle>
            <DialogDescription>
              Completa el pago para asignar el contrato al profesional
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Profesional:</span>
                  <span className="font-semibold">{selectedApplication.master?.business_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Monto total:</span>
                  <span className="text-2xl font-bold">${(selectedApplication.proposed_price / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Comisión plataforma (5%):</span>
                  <span className="font-medium">${(selectedApplication.proposed_price * 0.05 / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">El profesional recibirá:</span>
                  <span className="font-medium text-green-600">${(selectedApplication.proposed_price * 0.95 / 100).toLocaleString()}</span>
                </div>
              </div>

              <ContractPaymentCheckoutBrick
                amount={selectedApplication.proposed_price}
                applicationId={selectedApplication.id}
                contractTitle={contracts.find(c => c.id === selectedApplication.contract_id)?.title || ''}
                masterName={selectedApplication.master?.business_name || ''}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};