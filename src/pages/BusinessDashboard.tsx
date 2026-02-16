import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "react-router-dom";
import { useBusinessDashboard } from "@/hooks/useBusinessDashboard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  TrendingUp, 
  Users,
  DollarSign,
  Calendar,
  BarChart3,
  Megaphone,
  FileText,
  AlertTriangle,
  Sparkles,
  Target,
  Zap,
  Bell,
  MessageSquare
} from "lucide-react";
import { BusinessProfile } from "@/components/business/BusinessProfile";
import { BusinessSubscriptionPlans } from "@/components/business/BusinessSubscriptionPlans";
import { AdvertisementManager } from "@/components/business/AdvertisementManager";
import { ContractsManager } from "@/components/business/ContractsManager";
import { AnalyticsDashboard } from "@/components/business/AnalyticsDashboard";
import { BillingCenter } from "@/components/business/BillingCenter";
import { BusinessNotifications } from "@/components/business/BusinessNotifications";
import { MasterSearch } from "@/components/business/MasterSearch";
import { BusinessChatTab } from "@/components/business/BusinessChatTab";
import { Feed } from "@/components/Feed";
import { MarketplaceFeed } from "@/components/MarketplaceFeed";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileBusinessHome } from "@/components/mobile/MobileBusinessHome";
import { BottomNav } from "@/components/mobile/BottomNav";
import { cn } from "@/lib/utils";
import { BusinessDashboardSidebar } from "@/components/business/BusinessDashboardSidebar";

export default function BusinessDashboard() {
  const { user, profile } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Get initial tab from URL query parameter and sync with state
  const searchParams = new URLSearchParams(location.search);
  const urlTab = searchParams.get('tab') || (isMobile ? 'home' : 'overview');
  const [activeTab, setActiveTab] = useState(urlTab);

  // Update tab when URL changes
  useEffect(() => {
    const newTab = new URLSearchParams(location.search).get('tab') || 'overview';
    setActiveTab(newTab);
  }, [location.search]);
  
  const {
    loading,
    businessProfile,
    subscription,
    stats,
    refetch,
    handleSubscriptionSuccess
  } = useBusinessDashboard(user?.id);

  useEffect(() => {
    // Check for subscription payment status in URL
    const urlParams = new URLSearchParams(window.location.search);
    const subscriptionStatus = urlParams.get('subscription');
    
    if (subscriptionStatus === 'success') {
      handleSubscriptionSuccess();
      window.history.replaceState({}, '', '/business-dashboard');
    }
  }, [handleSubscriptionSuccess]);

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

  // Mobile-optimized view
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 bg-card border-b px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-bold">OFIZ Business</h1>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setActiveTab('notifications')}
            >
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </header>
        
        <main className="p-4">
          {activeTab === 'home' && (
            <MobileBusinessHome 
              stats={{
                ...stats,
                activeProducts: stats.products || 0,
                totalOrders: stats.pendingOrders || 0
              }}
              subscription={subscription}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}
          
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Resumen</h2>
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Megaphone className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{stats.activeAds}</p>
                    <p className="text-xs text-muted-foreground">Anuncios</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{stats.totalImpressions.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Impresiones</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Clics</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <FileText className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{stats.openContracts}</p>
                    <p className="text-xs text-muted-foreground">Contratos</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          {activeTab === 'ads' && <AdvertisementManager businessId={user?.id || ''} subscription={subscription} onUpdate={refetch} />}
          
          {activeTab === 'contracts' && <ContractsManager businessId={user?.id || ''} subscription={subscription} onUpdate={refetch} />}
          
          {activeTab === 'analytics' && <AnalyticsDashboard businessId={user?.id || ''} subscription={subscription} />}
          
          {activeTab === 'search' && <MasterSearch businessId={user?.id || ''} />}
          
          {activeTab === 'chat' && <BusinessChatTab businessId={user?.id || ''} />}
          
          {activeTab === 'notifications' && <BusinessNotifications businessId={user?.id || ''} />}
          
          {activeTab === 'subscription' && (
            <BusinessSubscriptionPlans 
              businessId={user?.id || ''}
              currentSubscription={subscription}
              onUpdate={refetch}
            />
          )}
          
          {activeTab === 'profile' && <BusinessProfile businessId={user?.id || ''} businessProfile={businessProfile} onUpdate={refetch} />}
          
          {activeTab === 'marketplace' && (
            subscription?.status === 'active' ? (
              <MarketplaceFeed />
            ) : (
              <Card className="border-amber-500/20 bg-amber-500/5">
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
                  <h3 className="font-semibold mb-2">Suscripción Requerida</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Necesitas una suscripción activa para acceder al marketplace
                  </p>
                  <Button onClick={() => setActiveTab('subscription')}>
                    Ver planes
                  </Button>
                </CardContent>
              </Card>
            )
          )}
        </main>
        
        <BottomNav userType="business" />
      </div>
    );
  }

  // Desktop view
  return (
    <div className="min-h-screen bg-background">
      <Header userType="business" />
      
      {/* Sidebar */}
      <BusinessDashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Main content with sidebar offset */}
      <main className="lg:pl-56 transition-all duration-300">
        <div className="container mx-auto px-4 py-8">
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

        {/* Dossier Banner */}
        <Card className="mb-8 overflow-hidden border-2 border-primary/20 shadow-lg bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                  <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Potencia tu Empresa con Ofiz Business
                  </h3>
                </div>
                <p className="text-muted-foreground">
                  Descarga nuestro dossier empresarial con información detallada sobre planes, ROI, gestión de contratos múltiples y casos de éxito de empresas que ya confían en nosotros.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    <Building2 className="h-3 w-3 mr-1" />
                    Planes desde $4,500/mes
                  </Badge>
                  <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">
                    <Target className="h-3 w-3 mr-1" />
                    Publicidad Dirigida
                  </Badge>
                  <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                    <Zap className="h-3 w-3 mr-1" />
                    Gestión Centralizada
                  </Badge>
                </div>
              </div>
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg"
                onClick={() => window.open('/dossier-empresas', '_blank')}
              >
                <FileText className="h-5 w-5 mr-2" />
                Conoce Ofiz Business
              </Button>
            </div>
          </CardContent>
        </Card>

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
              <Button variant="outline" onClick={refetch}>
                Actualizar estado
              </Button>
            </CardContent>
          </Card>
        )}

        {/* BottomNav is rendered in the mobile path above */}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="hidden">
            <TabsTrigger value="home" className="text-xs sm:text-sm md:hidden">Inicio</TabsTrigger>
            <TabsTrigger value="feed" className="text-xs sm:text-sm">Feed</TabsTrigger>
            <TabsTrigger value="marketplace" className="text-xs sm:text-sm">Marketplace</TabsTrigger>
            <TabsTrigger value="chat" className="text-xs sm:text-sm gap-1">
              <MessageSquare className="h-3 w-3" />
              Chat
            </TabsTrigger>
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

          {isMobile && (
            <TabsContent value="home">
              <MobileBusinessHome 
                stats={{
                  ...stats,
                  activeProducts: stats.products || 0,
                  totalOrders: stats.pendingOrders || 0
                }}
                subscription={subscription}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            </TabsContent>
          )}

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
                    <p>✓ Comisión competitiva del 5%</p>
                  </div>
                  <Button onClick={() => document.getElementById('subscription-tab')?.click()}>
                    Ver planes disponibles
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="chat">
            <BusinessChatTab businessId={user?.id || ''} />
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
              onUpdate={refetch}
            />
          </TabsContent>

          <TabsContent value="contracts">
            <ContractsManager 
              businessId={user!.id}
              subscription={subscription}
              onUpdate={refetch}
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
              onUpdate={refetch}
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
              onUpdate={refetch}
            />
          </TabsContent>
        </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}