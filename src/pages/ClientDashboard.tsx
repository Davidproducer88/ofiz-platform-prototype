import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Heart,
  User,
  CreditCard,
  Bell,
  Home,
  MessageSquare,
  Calendar,
  Star,
  ShoppingBag,
  ClipboardList,
  FileText,
  MapPin,
  Gift,
  Users,
  AlertCircle,
  Filter,
  DollarSign,
  CheckCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { BookingDialog } from '@/components/BookingDialog';
import { ReviewDialog } from '@/components/ReviewDialog';
import { FiltersSheet } from '@/components/FiltersSheet';
import { ClientProfile } from '@/components/ClientProfile';
import { ClientNotifications } from '@/components/ClientNotifications';
import { ServiceRequestForm } from '@/components/ServiceRequestForm';
import { MyServiceRequests } from '@/components/MyServiceRequests';
import { ChatTab } from '@/components/ChatTab';
import { ReferralProgram } from '@/components/ReferralProgram';
import { FavoriteMasters } from '@/components/client/FavoriteMasters';
import { PaymentHistory } from '@/components/client/PaymentHistory';
import { ClientCalendar } from '@/components/client/ClientCalendar';
import { MyReviews } from '@/components/client/MyReviews';
import { AddressBook } from '@/components/client/AddressBook';
import { MyDisputes } from '@/components/MyDisputes';
import { FounderDiscountCode } from '@/components/client/FounderDiscountCode';
import { EscrowReleaseManager } from '@/components/client/EscrowReleaseManager';
import { QuickActions } from '@/components/client/QuickActions';
import { DashboardAlerts } from '@/components/client/DashboardAlerts';
import { useFavorites } from '@/hooks/useFavorites';
import { useClientDashboard } from '@/hooks/useClientDashboard';
import { Feed } from '@/components/Feed';
import { TransactionsList } from '@/components/TransactionsList';
import { MarketplaceFeed } from '@/components/MarketplaceFeed';
import { ServiceCard } from '@/components/client/ServiceCard';
import { ClientBookingsList } from '@/components/client/ClientBookingsList';
import { DemoModeIndicator } from '@/components/DemoModeIndicator';
import { AlertTriangle, Award } from 'lucide-react';
import { BottomNav } from '@/components/mobile/BottomNav';
import { MobileClientHome } from '@/components/mobile/MobileClientHome';
import { MobileServiceCard } from '@/components/mobile/MobileServiceCard';
import { MobileBookingCard } from '@/components/mobile/MobileBookingCard';
import { MobileServiceRequestWizard } from '@/components/mobile/MobileServiceRequestWizard';

const ClientDashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { favorites, toggleFavorite, isFavorite } = useFavorites(profile?.id);
  
  // Get initial tab from URL query parameter and sync with state
  const searchParams = new URLSearchParams(location.search);
  const urlTab = searchParams.get('tab') || 'feed';
  const [activeTab, setActiveTab] = useState(urlTab);

  // Update tab when URL changes
  useEffect(() => {
    const newTab = new URLSearchParams(location.search).get('tab') || 'feed';
    setActiveTab(newTab);
  }, [location.search]);
  const { 
    services, 
    bookings, 
    loading, 
    createBooking, 
    rescheduleBooking, 
    cancelBooking,
    refetchBookings 
  } = useClientDashboard(profile?.id);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Dialogs
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [bookingToReschedule, setBookingToReschedule] = useState<any>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [serviceRequestDialogOpen, setServiceRequestDialogOpen] = useState(false);
  const [newDate, setNewDate] = useState<Date>(new Date());
  const [requestsRefreshTrigger, setRequestsRefreshTrigger] = useState(0);
  
  const [filters, setFilters] = useState({
    priceRange: [0, 500000] as [number, number],
    minRating: 0,
    verifiedOnly: false,
    city: 'all',
  });

  const categories = [
    { id: 'all', name: 'Todos', icon: '🏠' },
    { id: 'plumbing', name: 'Plomería', icon: '🔧' },
    { id: 'electrical', name: 'Electricidad', icon: '⚡' },
    { id: 'cleaning', name: 'Limpieza', icon: '🧽' },
    { id: 'maintenance', name: 'Mantenimiento', icon: '🛠️' },
    { id: 'gardening', name: 'Jardinería', icon: '🌱' },
    { id: 'painting', name: 'Pintura', icon: '🎨' },
    { id: 'carpentry', name: 'Carpintería', icon: '🪚' },
    { id: 'appliance_repair', name: 'Reparaciones', icon: '⚙️' },
  ];

  const filteredServices = services.filter(service => {
    const businessName = service.masters?.business_name || '';
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         businessName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesPrice = service.price >= filters.priceRange[0] && service.price <= filters.priceRange[1];
    const masterRating = service.masters?.rating ?? 0;
    const matchesRating = masterRating >= filters.minRating;
    
    return matchesSearch && matchesCategory && matchesPrice && matchesRating;
  });

  const handleBookingConfirm = async (bookingData: {
    serviceId: string;
    scheduledDate: Date;
    address: string;
    notes: string;
    photos: string[];
  }) => {
    const service = services.find(s => s.id === bookingData.serviceId);
    if (!service) return;

    const success = await createBooking({
      serviceId: bookingData.serviceId,
      masterId: service.master_id,
      scheduledDate: bookingData.scheduledDate,
      address: bookingData.address,
      notes: bookingData.notes,
      photos: bookingData.photos,
      totalPrice: service.price,
    });

    if (success) {
      setBookingDialogOpen(false);
      setSelectedService(null);
    }
  };

  const handleReviewSubmit = async (bookingId: string, rating: number, comment: string) => {
    if (!selectedBooking) return;

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { error } = await supabase
        .from('reviews')
        .insert({
          booking_id: selectedBooking.id,
          client_id: profile?.id,
          master_id: selectedBooking.masters?.id,
          rating,
          comment,
        });

      if (error) throw error;

      toast({
        title: "¡Reseña enviada!",
        description: "Tu valoración ha sido publicada",
      });

      setReviewDialogOpen(false);
      setSelectedBooking(null);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar la reseña",
        variant: "destructive",
      });
    }
  };

  const handleRescheduleConfirm = async () => {
    if (!bookingToReschedule) return;

    const success = await rescheduleBooking(bookingToReschedule.id, newDate);
    if (success) {
      setRescheduleDialogOpen(false);
      setBookingToReschedule(null);
    }
  };

  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const totalSpent = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.total_price, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">Cargando...</div>
        </div>
      </div>
    );
  }

  // Stats para mobile home
  const mobileStats = {
    activeRequests: 0,
    completedBookings: completedBookings,
    pendingBookings: bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length,
  };

  // MOBILE RENDERING
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header Mobile */}
        <header className="sticky top-0 z-40 bg-card border-b px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-primary">OFIZ</h1>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setActiveTab('profile')}
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {/* TODO: Badge de notificaciones no leídas */}
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 pb-20">
          {activeTab === 'home' && (
            <MobileClientHome
              stats={mobileStats}
              onNewRequest={() => setServiceRequestDialogOpen(true)}
              onSearchServices={() => setActiveTab('services')}
              onViewRequests={() => setActiveTab('bookings')}
            />
          )}

          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Buscar servicios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-11"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setFiltersOpen(true)}
                >
                  <Filter className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-3">
                {filteredServices.map((service) => (
                  <MobileServiceCard
                    key={service.id}
                    service={service}
                    isFavorite={isFavorite(service.master_id)}
                    onBook={() => {
                      setSelectedService(service);
                      setBookingDialogOpen(true);
                    }}
                    onToggleFavorite={() => toggleFavorite(service.master_id)}
                  />
                ))}
              </div>

              {filteredServices.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No se encontraron servicios</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Mis Reservas</h2>
                <Button size="sm" onClick={() => setServiceRequestDialogOpen(true)}>
                  Nueva
                </Button>
              </div>
              
              {bookings.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      No tienes reservas aún
                    </p>
                    <Button onClick={() => setActiveTab('services')}>
                      Buscar servicios
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {bookings.map((booking) => (
                    <MobileBookingCard
                      key={booking.id}
                      booking={booking}
                      onReview={() => {
                        setSelectedBooking(booking);
                        setReviewDialogOpen(true);
                      }}
                      onReschedule={() => {
                        setBookingToReschedule(booking);
                        setRescheduleDialogOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Mensajes</h2>
              <ChatTab />
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Mi Perfil</h2>
              {profile && (
                <ClientProfile 
                  profile={{
                    id: profile.id,
                    full_name: profile.full_name,
                    phone: profile.phone || '',
                    address: profile.address || '',
                    city: profile.city || '',
                    avatar_url: profile.avatar_url || '',
                    is_founder: profile.is_founder,
                  }}
                  onProfileUpdate={() => {}}
                />
              )}
            </div>
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav userType="client" />

        {/* Modales */}
        <MobileServiceRequestWizard
          open={serviceRequestDialogOpen}
          onOpenChange={setServiceRequestDialogOpen}
          onSuccess={() => {
            setServiceRequestDialogOpen(false);
            setRequestsRefreshTrigger(prev => prev + 1);
            refetchBookings();
          }}
        />

        <BookingDialog
          open={bookingDialogOpen}
          onOpenChange={setBookingDialogOpen}
          service={selectedService}
          onConfirm={handleBookingConfirm}
        />

        {selectedBooking && (
          <ReviewDialog
            open={reviewDialogOpen}
            onOpenChange={setReviewDialogOpen}
            booking={selectedBooking}
            onSubmit={handleReviewSubmit}
          />
        )}

        <FiltersSheet
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          filters={filters}
          onFiltersChange={setFilters}
          onReset={() => setFilters({
            priceRange: [0, 500000],
            minRating: 0,
            verifiedOnly: false,
            city: 'all',
          })}
        />

        <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reagendar Servicio</DialogTitle>
              <DialogDescription>
                Selecciona una nueva fecha para tu servicio
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Label>Nueva fecha</Label>
              <Input
                type="datetime-local"
                value={newDate.toISOString().slice(0, 16)}
                onChange={(e) => setNewDate(new Date(e.target.value))}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleRescheduleConfirm}>
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // DESKTOP RENDERING (existente)
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Hola, {profile?.full_name || 'Cliente'} 👋
          </h1>
          <p className="text-muted-foreground">
            Encuentra y gestiona tus servicios profesionales
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-card hover:shadow-elegant transition-smooth">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Total Reservas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{bookings.length}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-smooth">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Completadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedBookings}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-smooth">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Favoritos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{favorites.length}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-smooth">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Gastado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                $U {totalSpent.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-2">
            <TabsTrigger value="feed" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Feed</span>
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Mercado</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Servicios</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Solicitudes</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Reservas</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Favoritos</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
          </TabsList>

          {/* Feed Tab */}
          <TabsContent value="feed" className="space-y-4">
            <Feed />
          </TabsContent>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="space-y-4">
            <MarketplaceFeed />
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Servicios Disponibles
                  </CardTitle>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/search-masters')}
                  >
                    Ver Todos los Profesionales
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder="Buscar servicios, profesionales..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    onClick={() => setFiltersOpen(true)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="text-xs"
                    >
                      <span className="mr-1">{category.icon}</span>
                      {category.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  isFavorite={isFavorite(service.master_id)}
                  onBook={() => {
                    setSelectedService(service);
                    setBookingDialogOpen(true);
                  }}
                  onToggleFavorite={() => toggleFavorite(service.master_id)}
                />
              ))}
            </div>

            {filteredServices.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No se encontraron servicios</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Mis Solicitudes de Servicio
                    </CardTitle>
                    <CardDescription>
                      Publica lo que necesitas y recibe presupuestos de profesionales
                    </CardDescription>
                  </div>
                  <Button onClick={() => setServiceRequestDialogOpen(true)}>
                    Nueva Solicitud
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <MyServiceRequests 
                  refreshTrigger={requestsRefreshTrigger}
                  onNavigateToChat={() => setActiveTab('chat')}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Mis Reservas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ClientBookingsList
                  bookings={bookings}
                  onReview={(booking) => {
                    setSelectedBooking(booking);
                    setReviewDialogOpen(true);
                  }}
                  onReschedule={(booking) => {
                    setBookingToReschedule(booking);
                    setRescheduleDialogOpen(true);
                  }}
                  onCancel={async (id) => {
                    await cancelBooking(id);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-4">
            <FavoriteMasters />
          </TabsContent>

          {/* Additional Tabs */}
          <TabsContent value="calendar">
            <ClientCalendar />
          </TabsContent>

          <TabsContent value="payments">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Historial de Pagos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentHistory />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <MyReviews />
          </TabsContent>

          <TabsContent value="disputes">
            <MyDisputes userId={profile?.id || ''} />
          </TabsContent>

          <TabsContent value="addresses">
            <AddressBook />
          </TabsContent>

          <TabsContent value="chat">
            <ChatTab />
          </TabsContent>

          <TabsContent value="referrals">
            <ReferralProgram userId={profile?.id || ''} />
          </TabsContent>

          <TabsContent value="profile">
            {profile && (
              <ClientProfile
                profile={{
                  id: profile.id,
                  full_name: profile.full_name,
                  phone: profile.phone || '',
                  address: profile.address || '',
                  city: profile.city || '',
                  avatar_url: profile.avatar_url || '',
                  is_founder: profile.is_founder,
                }}
                onProfileUpdate={() => window.location.reload()}
              />
            )}
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ClientNotifications />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <BookingDialog
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
        service={selectedService}
        onConfirm={handleBookingConfirm}
      />

      <ReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        booking={selectedBooking}
        onSubmit={handleReviewSubmit}
      />

      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reprogramar Reserva</DialogTitle>
            <DialogDescription>
              Selecciona una nueva fecha y hora para tu servicio
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nueva Fecha y Hora</Label>
              <Input
                type="datetime-local"
                value={newDate.toISOString().slice(0, 16)}
                onChange={(e) => setNewDate(new Date(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRescheduleConfirm}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FiltersSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={filters}
        onFiltersChange={setFilters}
        onReset={() => setFilters({
          priceRange: [0, 500000],
          minRating: 0,
          verifiedOnly: false,
          city: 'all',
        })}
      />

      <ServiceRequestForm
        open={serviceRequestDialogOpen}
        onOpenChange={setServiceRequestDialogOpen}
        onSuccess={() => {
          setRequestsRefreshTrigger(prev => prev + 1);
          setActiveTab('requests');
        }}
      />
    </div>
  );
};

export default ClientDashboard;
