import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar,
  BarChart3,
  Megaphone,
  FileText,
  Settings,
  Package,
  AlertTriangle
} from "lucide-react";
import { BusinessProfile } from "@/components/business/BusinessProfile";
import { BusinessSubscriptionPlans } from "@/components/business/BusinessSubscriptionPlans";
import { AdvertisementManager } from "@/components/business/AdvertisementManager";
import { ContractsManager } from "@/components/business/ContractsManager";
import { AnalyticsDashboard } from "@/components/business/AnalyticsDashboard";
import { BillingCenter } from "@/components/business/BillingCenter";
import { BusinessNotifications } from "@/components/business/BusinessNotifications";
import { MasterSearch } from "@/components/business/MasterSearch";
import { Feed } from "@/components/Feed";
import { MarketplaceFeed } from "@/components/MarketplaceFeed";

export default function BusinessDashboard() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [businessProfile, setBusinessProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [stats, setStats] = useState({
    activeAds: 0,
    totalImpressions: 0,
    totalClicks: 0,
    openContracts: 0,
    contactsUsed: 0,
    contactsLimit: 50
  });

  useEffect(() => {
    if (user) {
      fetchBusinessData();
    }
    
    // Check for subscription payment status in URL
    const urlParams = new URLSearchParams(window.location.search);
    const subscriptionStatus = urlParams.get('subscription');
    
    if (subscriptionStatus === 'success') {
      toast({
        title: "¡Suscripción activada!",
        description: "Tu suscripción ha sido procesada correctamente. Puede tomar unos minutos en aparecer.",
      });
      
      // Clean URL
      window.history.replaceState({}, '', '/business-dashboard');
      
      // Refresh data after a short delay to allow webhook to process
      setTimeout(() => {
        if (user) fetchBusinessData();
      }, 2000);
    }
  }, [user]);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);

      // Fetch business profile
      const { data: businessData, error: profileError } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('id', user!.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching business profile:', profileError);
      }

      setBusinessProfile(businessData);

      // Fetch subscription
      const { data: subData, error: subError } = await supabase
        .from('business_subscriptions')
        .select('*')
        .eq('business_id', user!.id)
        .eq('status', 'active')
        .maybeSingle();

      if (subError && subError.code !== 'PGRST116') {
        console.error('Error fetching subscription:', subError);
      }

      setSubscription(subData);

      // Fetch statistics
      const [adsData, contractsData] = await Promise.all([
        supabase
          .from('advertisements')
          .select('impressions_count, clicks_count')
          .eq('business_id', user!.id),
        supabase
          .from('business_contracts')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', user!.id)
          .eq('status', 'open')
      ]);

      const totalImpressions = adsData.data?.reduce((sum, ad) => sum + (ad.impressions_count || 0), 0) || 0;
      const totalClicks = adsData.data?.reduce((sum, ad) => sum + (ad.clicks_count || 0), 0) || 0;

      setStats({
        activeAds: adsData.data?.length || 0,
        totalImpressions,
        totalClicks,
        openContracts: contractsData.count || 0,
        contactsUsed: subData?.contacts_used || 0,
        contactsLimit: subData?.monthly_contacts_limit || 50
      });

    } catch (error: any) {
      console.error('Error fetching business data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos empresariales",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Show profile setup if no business profile exists
  const showProfileSetup = !loading && !businessProfile;

  return (
    <div className="min-h-screen bg-background">
      <Header userType="business" />
      
      <main className="container mx-auto px-4 py-8">
        {/* First-time setup prompt */}
        {showProfileSetup && (
          <Card className="mb-8 border-primary bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Building2 className="h-5 w-5" />
                Configura tu Perfil Empresarial
              </CardTitle>
              <CardDescription>
                Completa tu información empresarial para comenzar a usar todas las funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Para comenzar, ve a la pestaña "Perfil" y completa tus datos empresariales.
              </p>
            </CardContent>
          </Card>
        )}
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Panel Empresarial</h1>
          </div>
          <p className="text-muted-foreground">
            Gestiona tus campañas publicitarias y contrataciones de profesionales
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Anuncios Activos</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeAds}</div>
              <p className="text-xs text-muted-foreground">
                Campañas en ejecución
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impresiones</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalImpressions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total de visualizaciones
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clics</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                CTR: {stats.totalImpressions > 0 ? ((stats.totalClicks / stats.totalImpressions) * 100).toFixed(2) : 0}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contratos Abiertos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.openContracts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.contactsUsed}/{stats.contactsLimit} contactos usados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Alert */}
        {!subscription && (
          <Card className="mb-8 border-primary bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <DollarSign className="h-5 w-5" />
                Activa tu plan empresarial
              </CardTitle>
              <CardDescription>
                Para comenzar a publicar anuncios y contratar profesionales, necesitas activar un plan empresarial.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✓ Acceso a publicidad dirigida</p>
                <p>✓ Gestión de contratos múltiples</p>
                <p>✓ Analíticas en tiempo real</p>
                <p>✓ Facturación centralizada</p>
              </div>
              <Button onClick={() => document.getElementById('subscription-tab')?.click()} size="lg">
                Ver planes disponibles
              </Button>
            </CardContent>
          </Card>
        )}
        
        {subscription && subscription.status !== 'active' && (
          <Card className="mb-8 border-yellow-500 bg-yellow-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
                <Calendar className="h-5 w-5" />
                Suscripción pendiente
              </CardTitle>
              <CardDescription>
                Tu suscripción está siendo procesada. Esto puede tomar algunos minutos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={fetchBusinessData}>
                Actualizar estado
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10 gap-1 h-auto p-1">
            <TabsTrigger value="feed" className="text-xs sm:text-sm">Feed</TabsTrigger>
            <TabsTrigger value="marketplace" className="text-xs sm:text-sm">Marketplace</TabsTrigger>
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Resumen</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm">Analíticas</TabsTrigger>
            <TabsTrigger value="ads" className="text-xs sm:text-sm">Publicidad</TabsTrigger>
            <TabsTrigger value="contracts" className="text-xs sm:text-sm">Contratos</TabsTrigger>
            <TabsTrigger value="search" className="text-xs sm:text-sm">Buscar</TabsTrigger>
            <TabsTrigger value="billing" className="text-xs sm:text-sm">Facturación</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs sm:text-sm">Alertas</TabsTrigger>
            <TabsTrigger value="subscription" id="subscription-tab" className="text-xs sm:text-sm">Plan</TabsTrigger>
            <TabsTrigger value="profile" className="text-xs sm:text-sm">Perfil</TabsTrigger>
          </TabsList>

          <TabsContent value="feed">
            <Feed />
          </TabsContent>

          <TabsContent value="marketplace">
            {subscription?.status === 'active' ? (
              <MarketplaceFeed />
            ) : (
              <Card className="border-amber-500/20 bg-amber-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                    <AlertTriangle className="h-5 w-5" />
                    Suscripción Requerida
                  </CardTitle>
                  <CardDescription>
                    Necesitas una suscripción empresarial activa para vender en el marketplace
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    El marketplace de Ofiz te permite vender productos y servicios directamente a clientes y profesionales de la plataforma.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p>✓ Alcanza miles de compradores potenciales</p>
                    <p>✓ Sistema de pagos seguro integrado</p>
                    <p>✓ Gestión completa de inventario y órdenes</p>
                    <p>✓ Comisión competitiva del 7%</p>
                  </div>
                  <Button onClick={() => document.getElementById('subscription-tab')?.click()}>
                    Ver planes disponibles
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="overview">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Bienvenido a Ofiz Business</CardTitle>
                  <CardDescription>
                    Tu plataforma integral para contratar profesionales y promocionar tu empresa
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">¿Qué puedes hacer aquí?</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Megaphone className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                        <span><strong>Publicidad Contextual:</strong> Crea anuncios dirigidos a maestros profesionales o clientes potenciales</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Users className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                        <span><strong>Contratos Múltiples:</strong> Publica proyectos y recibe propuestas de múltiples profesionales</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <DollarSign className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                        <span><strong>Gestión Centralizada:</strong> Administra todos tus proyectos y pagos desde un solo lugar</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <BarChart3 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                        <span><strong>Analíticas en Tiempo Real:</strong> Monitorea el rendimiento de tus campañas publicitarias</span>
                      </li>
                    </ul>
                  </div>

                  {subscription && (
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Plan Actual</p>
                          <p className="text-2xl font-bold capitalize">{subscription.plan_type}</p>
                        </div>
                        <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                          {subscription.status === 'active' ? 'Activo' : subscription.status}
                        </Badge>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Contactos disponibles</p>
                          <p className="font-medium">{subscription.monthly_contacts_limit - subscription.contacts_used}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Publicidad</p>
                          <p className="font-medium">{subscription.can_post_ads ? 'Habilitada' : 'No disponible'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard
              businessId={user!.id}
              subscription={subscription}
            />
          </TabsContent>

          <TabsContent value="ads">
            <AdvertisementManager 
              businessId={user!.id}
              subscription={subscription}
              onUpdate={fetchBusinessData}
            />
          </TabsContent>

          <TabsContent value="contracts">
            <ContractsManager 
              businessId={user!.id}
              subscription={subscription}
              onUpdate={fetchBusinessData}
            />
          </TabsContent>

          <TabsContent value="search">
            <MasterSearch
              businessId={user!.id}
            />
          </TabsContent>

          <TabsContent value="billing">
            <BillingCenter
              businessId={user!.id}
              subscription={subscription}
            />
          </TabsContent>

          <TabsContent value="notifications">
            <BusinessNotifications
              businessId={user!.id}
            />
          </TabsContent>

          <TabsContent value="subscription">
            <BusinessSubscriptionPlans
              businessId={user!.id}
              currentSubscription={subscription}
              onUpdate={fetchBusinessData}
            />
          </TabsContent>

          <TabsContent value="profile">
            {showProfileSetup && (
              <Card className="mb-4 border-primary bg-primary/5">
                <CardContent className="pt-6">
                  <p className="text-sm">
                    👋 <strong>¡Bienvenido!</strong> Completa tu perfil empresarial para comenzar.
                  </p>
                </CardContent>
              </Card>
            )}
            <BusinessProfile
              businessId={user!.id}
              businessProfile={businessProfile}
              onUpdate={fetchBusinessData}
            />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}