import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  CreditCard, 
  Building2, 
  Users, 
  XCircle, 
  RefreshCcw, 
  Pause, 
  Play,
  DollarSign,
  AlertTriangle
} from "lucide-react";

interface MasterSubscription {
  id: string;
  master_id: string;
  plan: string;
  price: number;
  monthly_applications_limit: number;
  applications_used: number;
  is_featured: boolean;
  mercadopago_subscription_id: string | null;
  current_period_start: string;
  current_period_end: string;
  cancelled_at: string | null;
  has_founder_discount: boolean;
  created_at: string;
  masterProfile?: {
    full_name: string | null;
  } | null;
}

interface BusinessSubscription {
  id: string;
  business_id: string;
  plan_type: string;
  status: string;
  price: number;
  monthly_contacts_limit: number;
  contacts_used: number;
  can_post_ads: boolean;
  ad_impressions_limit: number | null;
  mercadopago_subscription_id: string | null;
  current_period_start: string;
  current_period_end: string;
  cancelled_at: string | null;
  has_founder_discount: boolean;
  created_at: string;
  business_profiles?: {
    company_name: string;
  } | null;
}

interface ActionDialogState {
  open: boolean;
  action: 'cancel' | 'refund' | 'pause' | 'resume' | null;
  subscriptionType: 'master' | 'business';
  subscription: MasterSubscription | BusinessSubscription | null;
}

export const SubscriptionsManagement = () => {
  const [masterSubscriptions, setMasterSubscriptions] = useState<MasterSubscription[]>([]);
  const [businessSubscriptions, setBusinessSubscriptions] = useState<BusinessSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionDialog, setActionDialog] = useState<ActionDialogState>({
    open: false,
    action: null,
    subscriptionType: 'master',
    subscription: null
  });
  const [refundAmount, setRefundAmount] = useState("");
  const [actionReason, setActionReason] = useState("");
  const pageSize = 10;

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      // Cargar suscripciones de maestros
      const { data: masterData, error: masterError } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (masterError) throw masterError;
      
      // Cargar perfiles para cada suscripción
      const mastersWithProfiles: MasterSubscription[] = await Promise.all(
        (masterData || []).map(async (sub) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', sub.master_id)
            .single();
          return { ...sub, masterProfile: profile };
        })
      );
      
      setMasterSubscriptions(mastersWithProfiles);

      // Cargar suscripciones de empresas
      const { data: businessData, error: businessError } = await supabase
        .from('business_subscriptions')
        .select(`
          *,
          business_profiles (
            company_name
          )
        `)
        .order('created_at', { ascending: false });

      if (businessError) throw businessError;
      setBusinessSubscriptions((businessData || []) as BusinessSubscription[]);

    } catch (error) {
      console.error("Error loading subscriptions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las suscripciones"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!actionDialog.subscription || !actionDialog.action) return;

    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: {
          action: actionDialog.action,
          subscriptionType: actionDialog.subscriptionType,
          subscriptionId: actionDialog.subscription.id,
          refundAmount: actionDialog.action === 'refund' ? parseFloat(refundAmount) : undefined,
          reason: actionReason || undefined
        }
      });

      if (error) throw error;

      toast({
        title: "Acción completada",
        description: data.message || "La acción se completó exitosamente"
      });

      await loadSubscriptions();
      closeActionDialog();

    } catch (error: any) {
      console.error("Error executing action:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo completar la acción"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openActionDialog = (
    action: 'cancel' | 'refund' | 'pause' | 'resume',
    subscriptionType: 'master' | 'business',
    subscription: MasterSubscription | BusinessSubscription
  ) => {
    setActionDialog({
      open: true,
      action,
      subscriptionType,
      subscription
    });
    setRefundAmount(subscription.price?.toString() || "");
    setActionReason("");
  };

  const closeActionDialog = () => {
    setActionDialog({
      open: false,
      action: null,
      subscriptionType: 'master',
      subscription: null
    });
    setRefundAmount("");
    setActionReason("");
  };

  const getStatusBadge = (subscription: MasterSubscription | BusinessSubscription, type: 'master' | 'business') => {
    if (subscription.cancelled_at) {
      return <Badge variant="destructive">Cancelada</Badge>;
    }
    if (type === 'business' && (subscription as BusinessSubscription).status === 'paused') {
      return <Badge variant="secondary">Pausada</Badge>;
    }
    if (type === 'master' && (subscription as MasterSubscription).plan === 'free') {
      return <Badge variant="outline">Gratuito</Badge>;
    }
    return <Badge className="bg-green-500">Activa</Badge>;
  };

  const getPlanBadge = (plan: string) => {
    const variants: Record<string, string> = {
      'free': 'outline',
      'starter': 'secondary',
      'professional': 'default',
      'enterprise': 'default',
      'basic': 'secondary',
      'premium': 'default'
    };
    return <Badge variant={variants[plan] as any || 'default'}>{plan}</Badge>;
  };

  const filteredMasterSubs = masterSubscriptions.filter(sub => {
    const searchMatch = sub.masterProfile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      sub.master_id.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === 'all' ||
      (statusFilter === 'active' && !sub.cancelled_at) ||
      (statusFilter === 'cancelled' && sub.cancelled_at);
    return searchMatch && statusMatch;
  });

  const filteredBusinessSubs = businessSubscriptions.filter(sub => {
    const searchMatch = sub.business_profiles?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.business_id.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === 'all' ||
      (statusFilter === 'active' && !sub.cancelled_at) ||
      (statusFilter === 'cancelled' && sub.cancelled_at);
    return searchMatch && statusMatch;
  });

  // Stats
  const totalMasterRevenue = masterSubscriptions
    .filter(s => !s.cancelled_at && s.plan !== 'free')
    .reduce((sum, s) => sum + (s.price || 0), 0);
  
  const totalBusinessRevenue = businessSubscriptions
    .filter(s => !s.cancelled_at && s.status === 'active')
    .reduce((sum, s) => sum + (s.price || 0), 0);

  const activeMasterSubs = masterSubscriptions.filter(s => !s.cancelled_at && s.plan !== 'free').length;
  const activeBusinessSubs = businessSubscriptions.filter(s => !s.cancelled_at && s.status === 'active').length;

  const paginatedMasterSubs = filteredMasterSubs.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const paginatedBusinessSubs = filteredBusinessSubs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Suscripciones Maestros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMasterSubs}</div>
            <p className="text-xs text-muted-foreground">activas de {masterSubscriptions.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Suscripciones Empresas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBusinessSubs}</div>
            <p className="text-xs text-muted-foreground">activas de {businessSubscriptions.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Ingresos Maestros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalMasterRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">mensuales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Ingresos Empresas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBusinessRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">mensuales</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nombre o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activas</SelectItem>
            <SelectItem value="cancelled">Canceladas</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={loadSubscriptions}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="masters" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="masters" className="gap-2">
            <Users className="h-4 w-4" />
            Maestros ({filteredMasterSubs.length})
          </TabsTrigger>
          <TabsTrigger value="business" className="gap-2">
            <Building2 className="h-4 w-4" />
            Empresas ({filteredBusinessSubs.length})
          </TabsTrigger>
        </TabsList>

        {/* Master Subscriptions */}
        <TabsContent value="masters">
          <Card>
            <CardHeader>
              <CardTitle>Suscripciones de Profesionales</CardTitle>
              <CardDescription>Gestiona las suscripciones de los maestros</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profesional</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Fundador</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMasterSubs.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{sub.masterProfile?.full_name || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">{sub.master_id.slice(0, 8)}...</p>
                        </div>
                      </TableCell>
                      <TableCell>{getPlanBadge(sub.plan)}</TableCell>
                      <TableCell>${sub.price?.toLocaleString() || 0}</TableCell>
                      <TableCell>{getStatusBadge(sub, 'master')}</TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <p>Inicio: {format(new Date(sub.current_period_start), 'dd/MM/yy', { locale: es })}</p>
                          <p>Fin: {format(new Date(sub.current_period_end), 'dd/MM/yy', { locale: es })}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {sub.has_founder_discount && <Badge variant="outline" className="bg-amber-100">20%</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {!sub.cancelled_at && sub.plan !== 'free' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openActionDialog('pause', 'master', sub)}
                                title="Pausar"
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openActionDialog('cancel', 'master', sub)}
                                title="Cancelar"
                              >
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openActionDialog('refund', 'master', sub)}
                                title="Reembolsar"
                              >
                                <DollarSign className="h-4 w-4 text-amber-500" />
                              </Button>
                            </>
                          )}
                          {sub.cancelled_at && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openActionDialog('resume', 'master', sub)}
                              title="Reanudar"
                            >
                              <Play className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredMasterSubs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No se encontraron suscripciones
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between px-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando {paginatedMasterSubs.length} de {filteredMasterSubs.length} resultados
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm">Página {currentPage}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={currentPage * pageSize >= filteredMasterSubs.length}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Subscriptions */}
        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>Suscripciones Empresariales</CardTitle>
              <CardDescription>Gestiona las suscripciones de empresas</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Contactos</TableHead>
                    <TableHead>Anuncios</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBusinessSubs.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <p className="font-medium">{sub.business_profiles?.company_name || 'N/A'}</p>
                      </TableCell>
                      <TableCell>{getPlanBadge(sub.plan_type)}</TableCell>
                      <TableCell>${sub.price?.toLocaleString() || 0}</TableCell>
                      <TableCell>{getStatusBadge(sub, 'business')}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {sub.contacts_used}/{sub.monthly_contacts_limit}
                        </div>
                      </TableCell>
                      <TableCell>
                        {sub.can_post_ads ? (
                          <Badge variant="outline" className="bg-green-100">Sí</Badge>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {sub.status === 'active' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openActionDialog('pause', 'business', sub)}
                                title="Pausar"
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openActionDialog('cancel', 'business', sub)}
                                title="Cancelar"
                              >
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openActionDialog('refund', 'business', sub)}
                                title="Reembolsar"
                              >
                                <DollarSign className="h-4 w-4 text-amber-500" />
                              </Button>
                            </>
                          )}
                          {(sub.status === 'paused' || sub.cancelled_at) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openActionDialog('resume', 'business', sub)}
                              title="Reanudar"
                            >
                              <Play className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredBusinessSubs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No se encontraron suscripciones
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between px-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando {paginatedBusinessSubs.length} de {filteredBusinessSubs.length} resultados
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm">Página {currentPage}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={currentPage * pageSize >= filteredBusinessSubs.length}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => !open && closeActionDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionDialog.action === 'cancel' && <XCircle className="h-5 w-5 text-destructive" />}
              {actionDialog.action === 'refund' && <DollarSign className="h-5 w-5 text-amber-500" />}
              {actionDialog.action === 'pause' && <Pause className="h-5 w-5" />}
              {actionDialog.action === 'resume' && <Play className="h-5 w-5 text-green-500" />}
              {actionDialog.action === 'cancel' && 'Cancelar Suscripción'}
              {actionDialog.action === 'refund' && 'Procesar Reembolso'}
              {actionDialog.action === 'pause' && 'Pausar Suscripción'}
              {actionDialog.action === 'resume' && 'Reanudar Suscripción'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.action === 'cancel' && 'Esta acción cancelará la suscripción de forma permanente.'}
              {actionDialog.action === 'refund' && 'Se procesará un reembolso y la suscripción será cancelada.'}
              {actionDialog.action === 'pause' && 'La suscripción será pausada temporalmente.'}
              {actionDialog.action === 'resume' && 'La suscripción será reactivada.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {actionDialog.action === 'refund' && (
              <div className="space-y-2">
                <Label htmlFor="refundAmount">Monto a reembolsar</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="refundAmount"
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="pl-9"
                    placeholder="0"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Motivo (opcional)</Label>
              <Textarea
                id="reason"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Ingresa el motivo de esta acción..."
                rows={3}
              />
            </div>

            {actionDialog.action === 'cancel' && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <p className="text-sm text-amber-800">
                  Esta acción no se puede deshacer. El usuario será notificado.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeActionDialog}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAction} 
              disabled={actionLoading}
              variant={actionDialog.action === 'cancel' ? 'destructive' : 'default'}
            >
              {actionLoading ? 'Procesando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
