import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Star,
  CheckCircle,
  Clock,
  Award,
  ArrowRight,
  BarChart3,
  Building2,
  FileText,
  Package,
  Megaphone,
  Eye,
  MousePointerClick,
  Play,
  Search,
  Filter,
  MapPin,
  Heart,
  MessageCircle,
  Share2,
  ShoppingCart,
  Truck,
  CreditCard
} from 'lucide-react';
import { 
  demoMasters, 
  demoBookings, 
  demoStats, 
  demoMessages, 
  demoPayments,
  demoBusinesses,
  demoBusinessSubscriptions,
  demoBusinessContracts,
  demoMarketplaceProducts,
  demoMarketplaceOrders,
  demoAdvertisements
} from '@/data/demoData';
import { FounderBadge } from '@/components/FounderBadge';
import { DemoTour } from '@/components/DemoTour';

interface DemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DemoModal = ({ open, onOpenChange }: DemoModalProps) => {
  const [activeView, setActiveView] = useState<'client' | 'master' | 'business' | 'admin'>('client');
  const [activeClientTab, setActiveClientTab] = useState('feed');
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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full overflow-hidden p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl font-bold">Demo Interactivo de Ofiz</DialogTitle>
                  <DialogDescription className="mt-1">
                    Explora las funcionalidades de la plataforma
                  </DialogDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={activeView === 'client' ? 'default' : 'outline'}
                    onClick={() => setActiveView('client')}
                  >
                    Cliente
                  </Button>
                  <Button
                    size="sm"
                    variant={activeView === 'master' ? 'default' : 'outline'}
                    onClick={() => setActiveView('master')}
                  >
                    Profesional
                  </Button>
                  <Button
                    size="sm"
                    variant={activeView === 'business' ? 'default' : 'outline'}
                    onClick={() => setActiveView('business')}
                  >
                    <Building2 className="h-4 w-4 mr-1" />
                    Empresa
                  </Button>
                  <Button
                    size="sm"
                    variant={activeView === 'admin' ? 'default' : 'outline'}
                    onClick={() => setActiveView('admin')}
                  >
                    Admin
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Client View - Simplified */}
              {activeView === 'client' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Reservas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{demoStats.total_bookings}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Invertido</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold">{formatCurrency(demoStats.total_spent)}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Rating</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{demoStats.average_rating}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Satisfacción</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{demoStats.satisfaction_rate}%</div>
                      </CardContent>
                    </Card>
                  </div>

                  <Tabs value={activeClientTab} onValueChange={setActiveClientTab}>
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="feed">Feed</TabsTrigger>
                      <TabsTrigger value="search">Buscar</TabsTrigger>
                      <TabsTrigger value="bookings">Reservas</TabsTrigger>
                      <TabsTrigger value="masters">Profesionales</TabsTrigger>
                      <TabsTrigger value="messages">Mensajes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="feed" className="space-y-3 mt-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="secondary">Feed Social</Badge>
                        <span className="text-xs text-muted-foreground">Contenido personalizado según tus preferencias</span>
                      </div>
                      {[
                        { type: 'request', title: 'Solicitud de Plomería Urgente', author: 'María González', category: 'Plomería', time: '15 min', likes: 23, comments: 5 },
                        { type: 'master', title: 'Carlos Rodríguez - Electricista', subtitle: 'Instalaciones eléctricas certificadas', rating: 4.9, reviews: 127, price: 'desde $1,500/hr' },
                        { type: 'sponsored', title: 'Oferta Especial - Pintura de Casas', company: 'PintaFácil', discount: '20% OFF', badge: 'Patrocinado' },
                        { type: 'request', title: 'Busco Jardinero para Mantenimiento', author: 'Pedro Martínez', category: 'Jardinería', time: '1 hora', likes: 8, comments: 3 },
                      ].map((item, i) => (
                        <Card key={i} className="hover:shadow-md transition-shadow">
                          <CardContent className="pt-4">
                            {item.type === 'request' && (
                              <>
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex gap-3 flex-1">
                                    <Avatar className="h-10 w-10">
                                      <AvatarFallback>{item.author![0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-sm">{item.author}</h4>
                                        <Badge variant="outline" className="text-xs">{item.category}</Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground">{item.time}</p>
                                    </div>
                                  </div>
                                </div>
                                <p className="text-sm mb-3">{item.title}</p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <button className="flex items-center gap-1 hover:text-primary">
                                    <Heart className="h-3 w-3" />
                                    {item.likes}
                                  </button>
                                  <button className="flex items-center gap-1 hover:text-primary">
                                    <MessageCircle className="h-3 w-3" />
                                    {item.comments}
                                  </button>
                                  <button className="flex items-center gap-1 hover:text-primary">
                                    <Share2 className="h-3 w-3" />
                                    Compartir
                                  </button>
                                </div>
                              </>
                            )}
                            {item.type === 'master' && (
                              <div className="flex items-start gap-3">
                                <Avatar className="h-12 w-12">
                                  <AvatarFallback>CR</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-sm">{item.title}</h4>
                                  <p className="text-xs text-muted-foreground mb-2">{item.subtitle}</p>
                                  <div className="flex items-center gap-3 text-xs">
                                    <div className="flex items-center gap-1">
                                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                      <span className="font-semibold">{item.rating}</span>
                                      <span className="text-muted-foreground">({item.reviews})</span>
                                    </div>
                                    <Badge variant="secondary">{item.price}</Badge>
                                  </div>
                                </div>
                              </div>
                            )}
                            {item.type === 'sponsored' && (
                              <>
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <Badge variant="default" className="mb-2">{item.badge}</Badge>
                                    <h4 className="font-semibold">{item.title}</h4>
                                    <p className="text-xs text-muted-foreground">{item.company}</p>
                                  </div>
                                  <Badge variant="secondary" className="text-success">{item.discount}</Badge>
                                </div>
                                <Button size="sm" className="w-full mt-2">Ver Oferta</Button>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>

                    <TabsContent value="search" className="space-y-4 mt-4">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="flex gap-2 mb-4">
                            <div className="relative flex-1">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <input 
                                type="text" 
                                placeholder="Buscar profesionales..."
                                className="w-full pl-10 pr-4 py-2 border rounded-md"
                                defaultValue="Electricista"
                              />
                            </div>
                            <Button variant="outline" size="icon">
                              <Filter className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="secondary">Montevideo</Badge>
                            <Badge variant="secondary">Verificados</Badge>
                            <Badge variant="secondary">4+ estrellas</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="space-y-3">
                        {demoMasters.slice(0, 3).map((master) => (
                          <Card key={master.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="pt-4">
                              <div className="flex items-start gap-3">
                                <Avatar className="h-14 w-14">
                                  <AvatarImage src={master.avatar_url} />
                                  <AvatarFallback>{master.full_name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold">{master.full_name}</h4>
                                    {master.is_verified && <CheckCircle className="h-4 w-4 text-primary" />}
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{master.business_name}</p>
                                  <div className="flex items-center gap-3 text-sm mb-2">
                                    <div className="flex items-center gap-1">
                                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                      <span className="font-semibold">{master.rating}</span>
                                      <span className="text-muted-foreground text-xs">({master.total_reviews || 0} reseñas)</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <MapPin className="h-3 w-3" />
                                      <span className="text-xs">{master.city}</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="default">Ver Perfil</Button>
                                    <Button size="sm" variant="outline">Contactar</Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="bookings" className="space-y-3 mt-4">
                      {demoBookings.slice(0, 3).map((booking) => (
                        <Card key={booking.id}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="flex gap-3">
                                <Avatar>
                                  <AvatarImage src={booking.master_avatar} />
                                  <AvatarFallback>{booking.master_name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-semibold text-sm">{booking.service_title}</h4>
                                  <p className="text-xs text-muted-foreground">{booking.master_name}</p>
                                </div>
                              </div>
                              <Badge variant={booking.status === 'completed' ? 'default' : 'secondary'}>
                                {booking.status === 'completed' ? 'Completado' : 'Confirmado'}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>

                    <TabsContent value="masters" className="space-y-3 mt-4">
                      {demoMasters.slice(0, 2).map((master) => (
                        <Card key={master.id}>
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={master.avatar_url} />
                                <AvatarFallback>{master.full_name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">{master.full_name}</h4>
                                  {master.is_verified && <CheckCircle className="h-4 w-4 text-primary" />}
                                </div>
                                <p className="text-sm text-muted-foreground">{master.business_name}</p>
                                <div className="flex items-center gap-2 mt-2 text-sm">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="font-semibold">{master.rating}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>

                    <TabsContent value="messages" className="space-y-3 mt-4">
                      {demoMessages.map((message) => (
                        <Card key={message.id}>
                          <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={message.master_avatar} />
                                <AvatarFallback>{message.master_name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm">{message.master_name}</h4>
                                <p className="text-xs text-muted-foreground">{message.last_message}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* Master View - Simplified */}
              {activeView === 'master' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-3">
                    <Card><CardContent className="pt-4"><div className="text-2xl font-bold">87</div><p className="text-xs text-muted-foreground">Trabajos</p></CardContent></Card>
                    <Card><CardContent className="pt-4"><div className="text-xl font-bold">{formatCurrency(152000)}</div><p className="text-xs text-muted-foreground">Ingresos</p></CardContent></Card>
                    <Card><CardContent className="pt-4"><div className="text-2xl font-bold">4.9</div><p className="text-xs text-muted-foreground">Rating</p></CardContent></Card>
                    <Card><CardContent className="pt-4"><div className="text-2xl font-bold">98.5%</div><p className="text-xs text-muted-foreground">Completados</p></CardContent></Card>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader><CardTitle className="text-sm">Próximas Reservas</CardTitle></CardHeader>
                      <CardContent className="space-y-2">
                        {demoBookings.filter(b => b.status !== 'completed').slice(0, 2).map((booking) => (
                          <div key={booking.id} className="text-xs">
                            <p className="font-semibold">{booking.service_title}</p>
                            <p className="text-muted-foreground">{formatCurrency(booking.total_price)}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle className="text-sm">Ingresos Recientes</CardTitle></CardHeader>
                      <CardContent className="space-y-2">
                        {demoPayments.slice(0, 2).map((payment) => (
                          <div key={payment.id} className="text-xs">
                            <p className="font-semibold">{payment.service}</p>
                            <p className="text-success">{formatCurrency(payment.master_amount)}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Business View - Enhanced */}
              {activeView === 'business' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-3">
                    <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{demoBusinesses.length}</div><p className="text-xs">Empresas</p></CardContent></Card>
                    <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{demoBusinessContracts.length}</div><p className="text-xs">Contratos</p></CardContent></Card>
                    <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{demoMarketplaceProducts.length}</div><p className="text-xs">Productos</p></CardContent></Card>
                    <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{demoAdvertisements.length}</div><p className="text-xs">Anuncios</p></CardContent></Card>
                  </div>

                  <Tabs value={activeBusinessTab} onValueChange={setActiveBusinessTab}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="subscriptions">Suscripciones</TabsTrigger>
                      <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                      <TabsTrigger value="contracts">Contratos</TabsTrigger>
                    </TabsList>

                    <TabsContent value="subscriptions" className="space-y-3 mt-4">
                      {demoBusinesses.slice(0, 2).map((business, index) => {
                        const subscription = demoBusinessSubscriptions[index];
                        return (
                          <Card key={business.id}>
                            <CardContent className="pt-4">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <h4 className="font-semibold">{business.company_name}</h4>
                                  <p className="text-xs text-muted-foreground">Plan {subscription.plan_type}</p>
                                </div>
                                <Badge variant="default">Activo</Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Precio mensual</span>
                                <span className="font-bold">{formatCurrency(subscription.price)}</span>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </TabsContent>

                    <TabsContent value="marketplace" className="space-y-3 mt-4">
                      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-lg">Mi Tienda</h4>
                              <p className="text-xs text-muted-foreground">Gestiona tus productos y pedidos</p>
                            </div>
                            <ShoppingCart className="h-8 w-8 text-primary" />
                          </div>
                          <div className="grid grid-cols-3 gap-4 mt-4">
                            <div>
                              <div className="text-2xl font-bold">{demoMarketplaceProducts.length}</div>
                              <p className="text-xs text-muted-foreground">Productos</p>
                            </div>
                            <div>
                              <div className="text-2xl font-bold">{demoMarketplaceOrders.length}</div>
                              <p className="text-xs text-muted-foreground">Ventas</p>
                            </div>
                            <div>
                              <div className="text-2xl font-bold">{formatCurrency(demoMarketplaceOrders.reduce((sum, order) => sum + (order.unit_price * order.quantity), 0))}</div>
                              <p className="text-xs text-muted-foreground">Ingresos</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Productos Activos</h4>
                        {demoMarketplaceProducts.slice(0, 3).map((product) => (
                          <Card key={product.id}>
                            <CardContent className="pt-4">
                              <div className="flex gap-3">
                                <div className="w-16 h-16 bg-secondary rounded-md flex items-center justify-center">
                                  <Package className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-semibold text-sm">{product.title}</h5>
                                  <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                                  <div className="flex items-center gap-3 mt-2">
                                    <Badge variant="secondary">{formatCurrency(product.price)}</Badge>
                                    <span className="text-xs text-muted-foreground">Stock: {product.stock_quantity}</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Pedidos Recientes</h4>
                        {demoMarketplaceOrders.slice(0, 2).map((order) => (
                          <Card key={order.id}>
                            <CardContent className="pt-4">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h5 className="font-semibold text-sm">Pedido #{order.order_number}</h5>
                                  <p className="text-xs text-muted-foreground">{order.quantity} unidades</p>
                                </div>
                                <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                                  {order.status === 'pending' ? 'Pendiente' : order.status === 'processing' ? 'Procesando' : 'Completado'}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Truck className="h-3 w-3" />
                                  <span className="text-xs">Envío estándar</span>
                                </div>
                                <span className="font-bold">{formatCurrency(order.unit_price * order.quantity)}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="contracts" className="space-y-3 mt-4">
                      {demoBusinessContracts.slice(0, 2).map((contract) => (
                        <Card key={contract.id}>
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-sm">{contract.title}</h4>
                                <p className="text-xs text-muted-foreground">{contract.description}</p>
                              </div>
                              <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
                                {contract.status === 'active' ? 'Activo' : contract.status}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm mt-2">
                              <span className="text-muted-foreground">Presupuesto</span>
                              <span className="font-bold">{formatCurrency(contract.budget_min)} - {formatCurrency(contract.budget_max)}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* Admin View - Simplified */}
              {activeView === 'admin' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-3">
                    <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{demoStats.total_masters.toLocaleString()}</div><p className="text-xs">Profesionales</p></CardContent></Card>
                    <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{demoStats.active_clients.toLocaleString()}</div><p className="text-xs">Clientes</p></CardContent></Card>
                    <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{demoStats.monthly_transactions.toLocaleString()}</div><p className="text-xs">Transacciones</p></CardContent></Card>
                    <Card><CardContent className="pt-4"><div className="text-xl font-bold">{formatCurrency(demoStats.commission_earned)}</div><p className="text-xs">Comisiones</p></CardContent></Card>
                  </div>

                  <Card>
                    <CardHeader><CardTitle>Métricas de Crecimiento</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Satisfacción</span>
                          <span className="font-bold">{demoStats.satisfaction_rate}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-success" style={{ width: `${demoStats.satisfaction_rate}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Crecimiento</span>
                          <span className="font-bold text-success">+{demoStats.growth_rate}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: '95%' }} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tour superpuesto al modal */}
      {open && (
        <DemoTour 
          onViewChange={setActiveView} 
          onTabChange={handleTabChange}
        />
      )}
    </>
  );
};
