import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Star,
  MessageSquare,
  CheckCircle,
  Clock,
  Award,
  Sparkles,
  ArrowRight,
  BarChart3,
  Home,
  Building2,
  FileText,
  ShoppingCart,
  Megaphone,
  Package,
  Eye,
  MousePointerClick,
  CreditCard,
  TrendingDown,
  Play
} from 'lucide-react';
import { 
  demoMasters, 
  demoBookings, 
  demoStats, 
  demoMessages, 
  demoReviews, 
  demoPayments,
  demoBusinesses,
  demoBusinessSubscriptions,
  demoBusinessContracts,
  demoMarketplaceProducts,
  demoMarketplaceOrders,
  demoAdvertisements
} from '@/data/demoData';
import { useNavigate } from 'react-router-dom';
import { FounderBadge } from '@/components/FounderBadge';
import { DemoModeIndicator } from '@/components/DemoModeIndicator';
import { DemoTour } from '@/components/DemoTour';
import { DemoWorkflow } from '@/components/DemoWorkflow';

const Demo = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'client' | 'master' | 'business' | 'admin'>('client');
  const [activeClientTab, setActiveClientTab] = useState('bookings');
  const [activeBusinessTab, setActiveBusinessTab] = useState('subscriptions');

  const handleTabChange = (tab: string) => {
    if (activeView === 'client') {
      setActiveClientTab(tab);
    } else if (activeView === 'business') {
      setActiveBusinessTab(tab);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-UY', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <DemoModeIndicator />
      
      {/* Demo Banner */}
      <div className="bg-gradient-hero text-white py-3 px-4 text-center">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Sparkles className="h-5 w-5" />
          <span className="font-semibold">MODO DEMO</span>
          <span className="hidden sm:inline">|</span>
          <span className="text-sm">Plataforma funcionando con datos de ejemplo para presentación</span>
          <Button 
            size="sm" 
            variant="secondary" 
            className="ml-4"
            onClick={() => navigate('/')}
          >
            <Home className="h-4 w-4 mr-2" />
            Volver al sitio
          </Button>
        </div>
      </div>

      <div className="container mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard de Ofiz</h1>
          <p className="text-muted-foreground mb-6">Explora las diferentes vistas de la plataforma</p>
          
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={activeView === 'client' ? 'default' : 'outline'}
              onClick={() => setActiveView('client')}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              Demo Completa (Flujo)
            </Button>
            <Button
              variant={activeView === 'master' ? 'default' : 'outline'}
              onClick={() => setActiveView('master')}
            >
              Vista Profesional
            </Button>
            <Button
              variant={activeView === 'business' ? 'default' : 'outline'}
              onClick={() => setActiveView('business')}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Vista Empresas
            </Button>
            <Button
              variant={activeView === 'admin' ? 'default' : 'outline'}
              onClick={() => setActiveView('admin')}
            >
              Vista Admin
            </Button>
          </div>
        </div>

        {/* Workflow Demo - Complete Flow */}
        {activeView === 'client' && (
          <DemoWorkflow />
        )}

        {/* Master View - Keep existing */}
        {activeView === 'master' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Reservas Totales</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{demoStats.total_bookings}</div>
                  <p className="text-xs text-muted-foreground">
                    {demoStats.completed_bookings} completadas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Invertido</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(demoStats.total_spent)}</div>
                  <p className="text-xs text-success">
                    Ahorro: {formatCurrency(demoStats.total_saved)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Calificación Promedio</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{demoStats.average_rating}</div>
                  <p className="text-xs text-muted-foreground">
                    De {demoStats.total_reviews} reseñas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Satisfacción</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{demoStats.satisfaction_rate}%</div>
                  <p className="text-xs text-success">Excelente</p>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeClientTab} onValueChange={setActiveClientTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="bookings">Mis Reservas</TabsTrigger>
                <TabsTrigger value="masters">Profesionales</TabsTrigger>
                <TabsTrigger value="messages">Mensajes</TabsTrigger>
              </TabsList>

              <TabsContent value="bookings" className="space-y-4">
                {demoBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4 flex-1">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={booking.master_avatar} />
                            <AvatarFallback>{booking.master_name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold">{booking.service_title}</h3>
                            <p className="text-sm text-muted-foreground">{booking.master_name}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{formatDate(booking.scheduled_date)}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{booking.client_address}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              booking.status === 'completed' ? 'default' :
                              booking.status === 'confirmed' ? 'secondary' : 'outline'
                            }
                          >
                            {booking.status === 'completed' ? 'Completado' :
                             booking.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                          </Badge>
                          <p className="text-lg font-bold mt-2">{formatCurrency(booking.total_price)}</p>
                        </div>
                      </div>
                      {booking.review_comment && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-1 mb-1">
                            {[...Array(booking.review_rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <p className="text-sm">{booking.review_comment}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="masters" className="space-y-4">
                {demoMasters.map((master) => (
                  <Card key={master.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={master.avatar_url} />
                          <AvatarFallback>{master.full_name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{master.full_name}</h3>
                            {master.is_verified && <CheckCircle className="h-5 w-5 text-primary" />}
                            {master.is_founder && <FounderBadge />}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{master.business_name}</p>
                          <p className="text-sm mb-3">{master.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">{master.rating}</span>
                              <span className="text-muted-foreground">({master.total_reviews} reviews)</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{master.experience_years} años exp.</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold">{formatCurrency(master.hourly_rate)}/hora</span>
                            </div>
                          </div>
                        </div>
                        <Button>
                          Contactar
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="messages" className="space-y-4">
                {demoMessages.map((message) => (
                  <Card key={message.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={message.master_avatar} />
                          <AvatarFallback>{message.master_name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold">{message.master_name}</h3>
                            <span className="text-xs text-muted-foreground">
                              {message.timestamp.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{message.last_message}</p>
                        </div>
                        {message.unread && (
                          <Badge variant="default" className="rounded-full h-6 w-6 p-0 flex items-center justify-center">
                            1
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Master View */}
        {activeView === 'master' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Trabajos Completados</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87</div>
                  <p className="text-xs text-success">+12 este mes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(152000)}</div>
                  <p className="text-xs text-success">+15% vs mes anterior</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Calificación</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.9</div>
                  <p className="text-xs text-muted-foreground">87 reseñas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Tasa Finalización</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">98.5%</div>
                  <p className="text-xs text-success">Excelente</p>
                </CardContent>
              </Card>
            </div>

            {/* Bookings and Earnings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Próximas Reservas</CardTitle>
                  <CardDescription>Trabajos programados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {demoBookings.filter(b => b.status !== 'completed').map((booking) => (
                    <div key={booking.id} className="flex items-start justify-between pb-3 border-b last:border-0">
                      <div>
                        <h4 className="font-semibold text-sm">{booking.service_title}</h4>
                        <p className="text-xs text-muted-foreground">{formatDate(booking.scheduled_date)}</p>
                        <p className="text-xs text-muted-foreground mt-1">{booking.client_address}</p>
                      </div>
                      <Badge variant="secondary">{formatCurrency(booking.total_price)}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ingresos Recientes</CardTitle>
                  <CardDescription>Últimos pagos recibidos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {demoPayments.map((payment) => (
                    <div key={payment.id} className="flex items-start justify-between pb-3 border-b last:border-0">
                      <div>
                        <h4 className="font-semibold text-sm">{payment.service}</h4>
                        <p className="text-xs text-muted-foreground">{formatDate(payment.date)}</p>
                        <p className="text-xs text-success mt-1">Comisión: {formatCurrency(payment.commission)}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="default">{formatCurrency(payment.master_amount)}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Business View */}
        {activeView === 'business' && (
          <div className="space-y-6">
            {/* Business Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Empresas Activas</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{demoBusinesses.length}</div>
                  <p className="text-xs text-success">Con suscripciones activas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Contratos Abiertos</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{demoBusinessContracts.filter(c => c.status === 'open').length}</div>
                  <p className="text-xs text-muted-foreground">
                    {demoBusinessContracts.reduce((sum, c) => sum + c.applications_count, 0)} postulaciones
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{demoMarketplaceProducts.length}</div>
                  <p className="text-xs text-success">
                    {demoMarketplaceOrders.length} órdenes totales
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Anuncios Activos</CardTitle>
                  <Megaphone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{demoAdvertisements.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {demoAdvertisements.reduce((sum, ad) => sum + ad.impressions_count, 0).toLocaleString()} impresiones
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeBusinessTab} onValueChange={setActiveBusinessTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="subscriptions">Suscripciones</TabsTrigger>
                <TabsTrigger value="contracts">Contratos</TabsTrigger>
                <TabsTrigger value="products">Productos</TabsTrigger>
                <TabsTrigger value="orders">Órdenes</TabsTrigger>
                <TabsTrigger value="ads">Anuncios</TabsTrigger>
              </TabsList>

              {/* Subscriptions Tab */}
              <TabsContent value="subscriptions" className="space-y-4">
                {demoBusinesses.map((business, index) => {
                  const subscription = demoBusinessSubscriptions[index];
                  return (
                    <Card key={business.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4 flex-1">
                            <Avatar className="h-14 w-14">
                              <AvatarImage src={business.avatar_url} />
                              <AvatarFallback><Building2 className="h-6 w-6" /></AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">{business.company_name}</h3>
                                {business.is_founder && <FounderBadge />}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{business.company_type} • {business.industry}</p>
                              <div className="flex flex-wrap gap-3 text-sm">
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span>{business.company_size} empleados</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">•</span>
                                  <span>{business.city}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="default" className="mb-2">
                              Plan {subscription.plan_type.charAt(0).toUpperCase() + subscription.plan_type.slice(1)}
                            </Badge>
                            <p className="text-2xl font-bold">{formatCurrency(subscription.price)}/mes</p>
                            {subscription.has_founder_discount && (
                              <p className="text-xs text-success mt-1">Con descuento fundador</p>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Contactos</p>
                            <p className="text-sm font-semibold">
                              {subscription.contacts_used} / {subscription.monthly_contacts_limit}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Anuncios</p>
                            <p className="text-sm font-semibold">
                              {subscription.can_post_ads ? 'Habilitado' : 'No disponible'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Vence</p>
                            <p className="text-sm font-semibold">
                              {formatDate(subscription.current_period_end)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>

              {/* Contracts Tab */}
              <TabsContent value="contracts" className="space-y-4">
                {demoBusinessContracts.map((contract) => {
                  const business = demoBusinesses.find(b => b.id === contract.business_id);
                  return (
                    <Card key={contract.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{contract.title}</h3>
                              <Badge variant={contract.status === 'open' ? 'default' : 'secondary'}>
                                {contract.status === 'open' ? 'Abierto' : 'En Progreso'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              Por: {business?.company_name}
                            </p>
                            <p className="text-sm mb-3">{contract.description}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                          <div>
                            <p className="text-xs text-muted-foreground">Presupuesto</p>
                            <p className="text-sm font-semibold">
                              {formatCurrency(contract.budget_min)} - {formatCurrency(contract.budget_max)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Profesionales</p>
                            <p className="text-sm font-semibold">{contract.required_masters} requeridos</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Postulaciones</p>
                            <p className="text-sm font-semibold text-success">{contract.applications_count}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Fecha límite</p>
                            <p className="text-sm font-semibold">{formatDate(contract.deadline)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>

              {/* Products Tab */}
              <TabsContent value="products" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {demoMarketplaceProducts.map((product) => (
                    <Card key={product.id}>
                      <CardContent className="pt-6">
                        <div className="flex gap-4">
                          <div className="h-20 w-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="h-10 w-10 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{product.title}</h3>
                            <p className="text-xs text-muted-foreground mb-2">
                              Por: {product.seller_name}
                            </p>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs font-semibold">{product.rating}</span>
                                <span className="text-xs text-muted-foreground">({product.reviews_count})</span>
                              </div>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">{product.sales_count} vendidos</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <p className="text-lg font-bold">{formatCurrency(product.price)}</p>
                              {product.compare_at_price && (
                                <p className="text-sm text-muted-foreground line-through">
                                  {formatCurrency(product.compare_at_price)}
                                </p>
                              )}
                            </div>
                            <Badge variant="secondary" className="mt-2">
                              Stock: {product.stock_quantity}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders" className="space-y-4">
                {demoMarketplaceOrders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{order.product_title}</h3>
                            <Badge variant={
                              order.status === 'delivered' ? 'default' :
                              order.status === 'shipped' ? 'secondary' : 'outline'
                            }>
                              {order.status === 'delivered' ? 'Entregado' :
                               order.status === 'shipped' ? 'Enviado' : 'Confirmado'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Vendedor: {order.seller_name}
                          </p>
                          <p className="text-sm text-muted-foreground mb-2">
                            Comprador: {order.buyer_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Orden #{order.order_number}
                          </p>
                          {order.tracking_number && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Tracking: {order.tracking_number}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{formatCurrency(order.total_amount)}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {order.quantity} × {formatCurrency(order.unit_price)}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 pt-4 border-t text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Subtotal</p>
                          <p className="font-semibold">{formatCurrency(order.subtotal)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Envío</p>
                          <p className="font-semibold">{formatCurrency(order.shipping_cost)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Comisión (5%)</p>
                          <p className="font-semibold text-primary">{formatCurrency(order.platform_fee)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Vendedor recibe</p>
                          <p className="font-semibold text-success">{formatCurrency(order.seller_amount)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Ads Tab */}
              <TabsContent value="ads" className="space-y-4">
                {demoAdvertisements.map((ad) => {
                  const ctr = ((ad.clicks_count / ad.impressions_count) * 100).toFixed(2);
                  return (
                    <Card key={ad.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{ad.title}</h3>
                              <Badge variant="default">Activo</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              Por: {ad.business_name}
                            </p>
                            <p className="text-sm mb-3">{ad.description}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{ad.ad_type}</Badge>
                              <Badge variant="outline">{ad.target_audience}</Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground mb-1">Presupuesto</p>
                            <p className="text-2xl font-bold">{formatCurrency(ad.budget)}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t">
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <Eye className="h-3 w-3 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">Impresiones</p>
                            </div>
                            <p className="text-sm font-semibold">{ad.impressions_count.toLocaleString()}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <MousePointerClick className="h-3 w-3 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">Clicks</p>
                            </div>
                            <p className="text-sm font-semibold text-primary">{ad.clicks_count.toLocaleString()}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <TrendingUp className="h-3 w-3 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">CTR</p>
                            </div>
                            <p className="text-sm font-semibold text-success">{ctr}%</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <DollarSign className="h-3 w-3 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">CPI</p>
                            </div>
                            <p className="text-sm font-semibold">${ad.cost_per_impression.toFixed(2)}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">Vence</p>
                            </div>
                            <p className="text-sm font-semibold">{formatDate(ad.end_date)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Admin View */}
        {activeView === 'admin' && (
          <div className="space-y-6">
            {/* Platform Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Profesionales Activos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{demoStats.total_masters.toLocaleString()}</div>
                  <p className="text-xs text-success">+245 este mes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{demoStats.active_clients.toLocaleString()}</div>
                  <p className="text-xs text-success">+1,847 este mes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Transacciones Mes</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{demoStats.monthly_transactions.toLocaleString()}</div>
                  <p className="text-xs text-success">+28% vs mes anterior</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Comisiones Mes</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(demoStats.commission_earned)}</div>
                  <p className="text-xs text-success">+35% vs mes anterior</p>
                </CardContent>
              </Card>
            </div>

            {/* Growth Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Crecimiento</CardTitle>
                <CardDescription>Indicadores clave de la plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Volumen de Transacciones</span>
                      <span className="text-sm font-bold">{formatCurrency(demoStats.total_revenue)}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-hero" style={{ width: '85%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Tasa de Conversión</span>
                      <span className="text-sm font-bold">78.5%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '78.5%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Satisfacción del Cliente</span>
                      <span className="text-sm font-bold">{demoStats.satisfaction_rate}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-success" style={{ width: `${demoStats.satisfaction_rate}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Crecimiento Mensual</span>
                      <span className="text-sm font-bold text-success">+{demoStats.growth_rate}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: '95%' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Tour Guiado Interactivo */}
      <DemoTour 
        onViewChange={setActiveView} 
        onTabChange={handleTabChange}
      />
    </div>
  );
};

export default Demo;
