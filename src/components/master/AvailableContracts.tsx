import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Calendar, DollarSign, Users, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Contract {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  budget_min: number | null;
  budget_max: number | null;
  required_masters: number;
  deadline: string | null;
  created_at: string;
  status: string;
}

export const AvailableContracts = () => {
  const { toast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [applicationData, setApplicationData] = useState({
    proposed_price: '',
    message: ''
  });

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's profile to check category
      const { data: profile } = await supabase
        .from('masters')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data, error } = await supabase
        .from('business_contracts')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter out contracts user has already applied to
      const contractsWithApplicationStatus = await Promise.all(
        (data || []).map(async (contract) => {
          const { data: applications } = await supabase
            .from('business_contract_applications')
            .select('id')
            .eq('contract_id', contract.id)
            .eq('master_id', user.id)
            .maybeSingle();

          return {
            ...contract,
            hasApplied: !!applications
          };
        })
      );

      setContracts(contractsWithApplicationStatus as any);
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

  const handleApply = (contract: Contract) => {
    setSelectedContract(contract);
    setDialogOpen(true);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedContract) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const proposedPrice = parseFloat(applicationData.proposed_price);
      if (isNaN(proposedPrice) || proposedPrice <= 0) {
        throw new Error('El precio propuesto debe ser válido');
      }

      // Convert price to cents for storage
      const priceInCents = Math.round(proposedPrice * 100);

      const { error } = await supabase
        .from('business_contract_applications')
        .insert({
          contract_id: selectedContract.id,
          master_id: user.id,
          proposed_price: priceInCents,
          message: applicationData.message,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Propuesta enviada",
        description: "Tu propuesta ha sido enviada correctamente",
      });

      setDialogOpen(false);
      setApplicationData({ proposed_price: '', message: '' });
      setSelectedContract(null);
      fetchContracts();
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar la propuesta",
        variant: "destructive",
      });
    }
  };

  const categoryLabels: Record<string, string> = {
    plumbing: 'Plomería',
    electricity: 'Electricidad',
    cleaning: 'Limpieza',
    computer: 'Informática',
    gardening: 'Jardinería',
    painting: 'Pintura',
    carpentry: 'Carpintería',
    appliance: 'Electrodomésticos'
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Cargando contratos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Contratos Disponibles</h2>
        <p className="text-muted-foreground">
          Encuentra proyectos empresariales y envía tu propuesta
        </p>
      </div>

      {contracts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay contratos disponibles en este momento</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {contracts.map((contract: any) => (
            <Card key={contract.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{contract.title}</CardTitle>
                      <Badge variant="outline">
                        {categoryLabels[contract.category] || contract.category}
                      </Badge>
                      {contract.hasApplied && (
                        <Badge variant="secondary">Ya aplicaste</Badge>
                      )}
                    </div>
                    <CardDescription>{contract.description}</CardDescription>
                  </div>
                  {!contract.hasApplied && (
                    <Button onClick={() => handleApply(contract)}>
                      Enviar Propuesta
                    </Button>
                  )}
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
                        <p className="font-medium">
                          {format(new Date(contract.deadline), 'd MMM yyyy', { locale: es })}
                        </p>
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

      {/* Application Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <form onSubmit={handleSubmitApplication}>
            <DialogHeader>
              <DialogTitle>Enviar Propuesta</DialogTitle>
              <DialogDescription>
                {selectedContract?.title}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="proposed_price">Precio Propuesto ($) *</Label>
                <Input
                  id="proposed_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={applicationData.proposed_price}
                  onChange={(e) => setApplicationData({ ...applicationData, proposed_price: e.target.value })}
                  placeholder="Ej: 5000"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Nota: Se aplicará una comisión del 5% sobre el monto total
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Tu Propuesta *</Label>
                <Textarea
                  id="message"
                  value={applicationData.message}
                  onChange={(e) => setApplicationData({ ...applicationData, message: e.target.value })}
                  rows={6}
                  placeholder="Describe tu experiencia, enfoque y por qué eres el mejor para este proyecto..."
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Enviar Propuesta
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
