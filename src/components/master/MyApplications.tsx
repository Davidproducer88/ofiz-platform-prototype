import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Clock, CheckCircle, XCircle, DollarSign, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

interface Application {
  id: string;
  proposed_price: number;
  message: string;
  status: string;
  created_at: string;
  service_requests: {
    title: string;
    description: string;
    category: string;
    budget_range: string;
    client_id: string;
  };
  client_profile?: {
    full_name: string;
    city: string;
  };
}

export const MyApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchApplications();
    
    // Real-time subscription
    const channel = supabase
      .channel('applications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_applications'
        },
        () => fetchApplications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchApplications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('service_applications')
        .select(`
          *,
          service_requests(
            title,
            description,
            category,
            budget_range,
            client_id
          )
        `)
        .eq('master_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch client profiles separately
      const applicationsWithProfiles = await Promise.all(
        (data || []).map(async (app) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, city')
            .eq('id', app.service_requests.client_id)
            .maybeSingle();

          return {
            ...app,
            client_profile: profileData || undefined
          };
        })
      );

      setApplications(applicationsWithProfiles);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las propuestas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      pending: { label: "Pendiente", variant: "secondary", icon: Clock },
      accepted: { label: "Aceptada", variant: "default", icon: CheckCircle },
      rejected: { label: "Rechazada", variant: "destructive", icon: XCircle }
    };
    return configs[status] || configs.pending;
  };

  const categoryLabels: Record<string, string> = {
    plumbing: 'Plomería',
    electricity: 'Electricidad',
    cleaning: 'Limpieza',
    computer_repair: 'Reparación PC',
    gardening: 'Jardinería',
    painting: 'Pintura',
    carpentry: 'Carpintería',
    appliance_repair: 'Reparaciones'
  };

  const filteredApplications = applications.filter(app => {
    if (filter === "all") return true;
    return app.status === filter;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  if (loading) {
    return <div>Cargando propuestas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Mis Propuestas</h2>
          <p className="text-muted-foreground">Seguimiento de todas tus propuestas enviadas</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aceptadas</p>
                <p className="text-2xl font-bold">{stats.accepted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rechazadas</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">Todas ({stats.total})</TabsTrigger>
          <TabsTrigger value="pending">Pendientes ({stats.pending})</TabsTrigger>
          <TabsTrigger value="accepted">Aceptadas ({stats.accepted})</TabsTrigger>
          <TabsTrigger value="rejected">Rechazadas ({stats.rejected})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No hay propuestas en esta categoría</p>
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((app) => {
              const statusConfig = getStatusConfig(app.status);
              const StatusIcon = statusConfig.icon;

              return (
                <Card key={app.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{app.service_requests.title}</CardTitle>
                          <Badge variant={statusConfig.variant}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(app.created_at), "d MMM yyyy", { locale: es })}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {app.client_profile?.city || 'Sin ubicación'}
                          </span>
                          <Badge variant="outline">
                            {categoryLabels[app.service_requests.category] || app.service_requests.category}
                          </Badge>
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">${app.proposed_price}</p>
                        <p className="text-xs text-muted-foreground">Tu propuesta</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Solicitud del cliente:</p>
                      <p className="text-sm text-muted-foreground">{app.service_requests.description}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Tu mensaje:</p>
                      <p className="text-sm text-muted-foreground">{app.message}</p>
                    </div>
                    {app.service_requests.budget_range && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Presupuesto del cliente:</span>
                        <span className="text-muted-foreground">{app.service_requests.budget_range}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
