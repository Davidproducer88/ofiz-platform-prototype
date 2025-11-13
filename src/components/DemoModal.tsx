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
  Play
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
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="bookings">Reservas</TabsTrigger>
                      <TabsTrigger value="masters">Profesionales</TabsTrigger>
                      <TabsTrigger value="messages">Mensajes</TabsTrigger>
                    </TabsList>

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

              {/* Business View - Simplified */}
              {activeView === 'business' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-3">
                    <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{demoBusinesses.length}</div><p className="text-xs">Empresas</p></CardContent></Card>
                    <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{demoBusinessContracts.length}</div><p className="text-xs">Contratos</p></CardContent></Card>
                    <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{demoMarketplaceProducts.length}</div><p className="text-xs">Productos</p></CardContent></Card>
                    <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{demoAdvertisements.length}</div><p className="text-xs">Anuncios</p></CardContent></Card>
                  </div>

                  <Card>
                    <CardHeader><CardTitle className="text-sm">Suscripciones Activas</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {demoBusinesses.slice(0, 2).map((business, index) => {
                        const subscription = demoBusinessSubscriptions[index];
                        return (
                          <div key={business.id} className="flex items-center justify-between text-sm">
                            <div>
                              <p className="font-semibold">{business.company_name}</p>
                              <p className="text-xs text-muted-foreground">Plan {subscription.plan_type}</p>
                            </div>
                            <Badge>{formatCurrency(subscription.price)}/mes</Badge>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
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
