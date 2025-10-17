import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Star, 
  Clock, 
  MapPin, 
  Calendar,
  Phone,
  CheckCircle,
  AlertCircle,
  Plus,
  Filter,
  Heart,
  User,
  CreditCard,
  Bell,
  Home,
  MessageSquare
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
import { BookingActions } from '@/components/BookingActions';
import { ReferralProgram } from '@/components/ReferralProgram';
import { FavoriteMasters } from '@/components/client/FavoriteMasters';
import { PaymentHistory } from '@/components/client/PaymentHistory';
import { ClientCalendar } from '@/components/client/ClientCalendar';
import { MyReviews } from '@/components/client/MyReviews';
import { AddressBook } from '@/components/client/AddressBook';
import { useFavorites } from '@/hooks/useFavorites';
import { Feed } from '@/components/Feed';

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  duration_minutes: number;
  master_id: string;
  masters: {
    business_name: string;
    rating: number;
    total_reviews: number;
  };
}

interface Booking {
  id: string;
  service_id: string;
  scheduled_date: string;
  status: string;
  total_price: number;
  client_address: string;
  notes?: string;
  services: {
    title: string;
    category: string;
  };
  masters: {
    business_name: string;
    rating: number;
  };
}

const ClientDashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { favorites, toggleFavorite, isFavorite } = useFavorites(profile?.id);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Dialogs and Sheets
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [requestFormOpen, setRequestFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('services');
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

  const statusTranslations = {
    'pending': { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
    'confirmed': { label: 'Confirmado', color: 'bg-blue-100 text-blue-800' },
    'in_progress': { label: 'En Progreso', color: 'bg-purple-100 text-purple-800' },
    'completed': { label: 'Completado', color: 'bg-green-100 text-green-800' },
    'cancelled': { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
  };

  useEffect(() => {
    fetchServices();
    fetchBookings();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          masters (
            business_name,
            rating,
            total_reviews
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los servicios",
        variant: "destructive",
      });
    }
  };

  const fetchBookings = async () => {
    try {
      if (!profile?.id) return;

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services (title, category),
          masters (business_name, rating)
        `)
        .eq('client_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar tus encargos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookingRequest = (service: Service) => {
    setSelectedService(service);
    setBookingDialogOpen(true);
  };

  const handleBookingConfirm = async (bookingData: {
    serviceId: string;
    scheduledDate: Date;
    address: string;
    notes: string;
  }) => {
    try {
      const service = services.find(s => s.id === bookingData.serviceId);
      if (!service) return;

      const { error } = await supabase
        .from('bookings')
        .insert({
          service_id: bookingData.serviceId,
          client_id: profile?.id,
          master_id: service.master_id,
          scheduled_date: bookingData.scheduledDate.toISOString(),
          total_price: service.price,
          client_address: bookingData.address,
          notes: bookingData.notes,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "¡Solicitud Enviada!",
        description: "El profesional recibirá tu solicitud pronto",
      });
      
      setBookingDialogOpen(false);
      fetchBookings();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el encargo",
        variant: "destructive",
      });
    }
  };

  const handleReviewSubmit = async (bookingId: string, rating: number, comment: string) => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return;

      const { error } = await supabase
        .from('reviews')
        .insert({
          booking_id: bookingId,
          client_id: profile?.id,
          master_id: booking.masters ? (booking as any).master_id : null,
          rating,
          comment,
        });

      if (error) throw error;

      toast({
        title: "¡Reseña Publicada!",
        description: "Gracias por compartir tu experiencia",
      });
      
      setReviewDialogOpen(false);
    } catch (error) {
      console.error('Error creating review:', error);
      toast({
        title: "Error",
        description: "No se pudo publicar la reseña",
        variant: "destructive",
      });
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.masters.business_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesPrice = service.price >= filters.priceRange[0] && service.price <= filters.priceRange[1];
    const matchesRating = filters.minRating === 0 || service.masters.rating >= filters.minRating;
    const matchesCity = filters.city === 'all' || filters.city === '';
    
    return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesCity;
  });

  const recentBookings = bookings.slice(0, 3);
  const completedBookings = bookings.filter(b => b.status === 'completed').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando tu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header 
        userType="client"
        onNotificationsClick={() => setActiveTab('notifications')}
        onProfileClick={() => setActiveTab('profile')}
      />
      
      <div className="container px-4 md:px-6 py-4 md:py-8">
        {/* Welcome Section */}
        <div className="mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">
              ¡Hola, {profile?.full_name}! 👋
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-2">
              Encuentra y gestiona todos tus servicios domésticos
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <Card className="shadow-card">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="p-2 bg-primary/10 rounded-lg mb-2 md:mb-0">
                  <Calendar className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div className="md:ml-4">
                  <p className="text-xs md:text-sm text-muted-foreground">Total Encargos</p>
                  <p className="text-xl md:text-2xl font-bold">{bookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="p-2 bg-secondary/10 rounded-lg mb-2 md:mb-0">
                  <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-secondary" />
                </div>
                <div className="md:ml-4">
                  <p className="text-xs md:text-sm text-muted-foreground">Completados</p>
                  <p className="text-xl md:text-2xl font-bold">{completedBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="p-2 bg-accent/10 rounded-lg mb-2 md:mb-0">
                  <Star className="h-5 w-5 md:h-6 md:w-6 text-accent" />
                </div>
                <div className="md:ml-4">
                  <p className="text-xs md:text-sm text-muted-foreground">Favoritos</p>
                  <p className="text-xl md:text-2xl font-bold">{favorites.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="p-2 bg-purple-100 rounded-lg mb-2 md:mb-0">
                  <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                </div>
                <div className="md:ml-4">
                  <p className="text-xs md:text-sm text-muted-foreground">Total Gastado</p>
                  <p className="text-xl md:text-2xl font-bold">
                    ${bookings.reduce((sum, b) => sum + (b.total_price || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="inline-flex md:grid w-auto md:w-full grid-cols-12 min-w-max md:min-w-0">
              <TabsTrigger value="feed" className="text-xs md:text-sm whitespace-nowrap">Feed</TabsTrigger>
              <TabsTrigger value="services" className="text-xs md:text-sm whitespace-nowrap">Servicios</TabsTrigger>
              <TabsTrigger value="requests" className="text-xs md:text-sm whitespace-nowrap">Solicitudes</TabsTrigger>
              <TabsTrigger value="bookings" className="text-xs md:text-sm whitespace-nowrap">Encargos</TabsTrigger>
              <TabsTrigger value="favorites" className="text-xs md:text-sm whitespace-nowrap">Favoritos</TabsTrigger>
              <TabsTrigger value="calendar" className="text-xs md:text-sm whitespace-nowrap">Calendario</TabsTrigger>
              <TabsTrigger value="payments" className="text-xs md:text-sm whitespace-nowrap">Pagos</TabsTrigger>
              <TabsTrigger value="reviews" className="text-xs md:text-sm whitespace-nowrap">Reseñas</TabsTrigger>
              <TabsTrigger value="addresses" className="text-xs md:text-sm whitespace-nowrap">Direcciones</TabsTrigger>
              <TabsTrigger value="referrals" className="text-xs md:text-sm whitespace-nowrap">Referidos</TabsTrigger>
              <TabsTrigger value="chat" className="text-xs md:text-sm whitespace-nowrap">Mensajes</TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs md:text-sm whitespace-nowrap">Notificaciones</TabsTrigger>
              <TabsTrigger value="profile" className="hidden">Mi Perfil</TabsTrigger>
            </TabsList>
          </div>

          {/* Feed Tab */}
          <TabsContent value="feed">
            <Feed />
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            {/* Search and Filters */}
            <Card className="shadow-card">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Search className="h-4 w-4 md:h-5 md:w-5" />
                  Encuentra el servicio perfecto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 md:p-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredServices.map((service) => (
                <Card key={service.id} className="shadow-card hover:shadow-elegant transition-smooth">
                  <CardHeader className="p-4 md:p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base md:text-lg truncate">{service.title}</CardTitle>
                        <CardDescription className="text-xs md:text-sm truncate">
                          {service.masters.business_name}
                        </CardDescription>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(service.master_id);
                        }}
                      >
                        <Heart className={`h-4 w-4 ${isFavorite(service.master_id) ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    <p className="text-xs md:text-sm text-muted-foreground mb-4 line-clamp-2">
                      {service.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-500 fill-current" />
                          <span className="text-xs md:text-sm ml-1">{service.masters.rating}</span>
                        </div>
                        <span className="text-xs md:text-sm text-muted-foreground">
                          ({service.masters.total_reviews})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-lg md:text-2xl font-bold text-primary">
                          ${service.price.toLocaleString()}
                        </span>
                        <div className="flex items-center text-xs md:text-sm text-muted-foreground mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {service.duration_minutes} min
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleBookingRequest(service)}
                        size="sm"
                        className="shrink-0"
                      >
                        <Plus className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Solicitar</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredServices.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No se encontraron servicios</h3>
                <p className="text-muted-foreground">
                  Intenta ajustar los filtros o términos de búsqueda
                </p>
              </div>
            )}
          </TabsContent>

          {/* Service Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base md:text-lg">Mis Solicitudes de Servicio</CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                      Publica proyectos y recibe presupuestos de maestros calificados
                    </CardDescription>
                  </div>
                  <Button onClick={() => setRequestFormOpen(true)} className="w-full sm:w-auto shrink-0" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Solicitud
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <MyServiceRequests />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-base md:text-lg">Mis Encargos</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Gestiona y revisa todos tus servicios solicitados
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                {bookings.length > 0 ? (
                  <div className="space-y-3 md:space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border border-border rounded-lg p-3 md:p-4">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                          <div className="flex-1 min-w-0 w-full sm:w-auto">
                            <h3 className="font-medium text-sm md:text-base">{booking.services.title}</h3>
                            <p className="text-xs md:text-sm text-muted-foreground">
                              {booking.masters.business_name}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-xs md:text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1 shrink-0" />
                                <span className="truncate">{new Date(booking.scheduled_date).toLocaleDateString('es-ES')}</span>
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-1 shrink-0" />
                                <span className="truncate">{booking.client_address}</span>
                              </div>
                            </div>
                            {booking.notes && (
                              <p className="text-xs md:text-sm text-muted-foreground mt-2 line-clamp-2">
                                Notas: {booking.notes}
                             </p>
                            )}
                          </div>
                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto gap-2 sm:space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge 
                                className={`${statusTranslations[booking.status as keyof typeof statusTranslations]?.color} text-xs whitespace-nowrap`}
                              >
                                {statusTranslations[booking.status as keyof typeof statusTranslations]?.label}
                              </Badge>
                              <p className="text-base md:text-lg font-bold whitespace-nowrap">
                                ${booking.total_price.toLocaleString()}
                              </p>
                            </div>
                            <BookingActions
                              booking={booking as any}
                              userType="client"
                              otherUserName={booking.masters?.business_name}
                              onReview={() => {
                                setSelectedBooking(booking);
                                setReviewDialogOpen(true);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No tienes encargos aún</h3>
                    <p className="text-muted-foreground mb-4">
                      ¡Solicita tu primer servicio y comienza a disfrutar de Ofiz!
                    </p>
                    <Button onClick={() => {
                      const servicesTab = document.querySelector('[value="services"]') as HTMLElement;
                      servicesTab?.click();
                    }}>
                      Buscar Servicios
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <FavoriteMasters />
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <ClientCalendar />
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <PaymentHistory />
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <MyReviews />
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <AddressBook />
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <ChatTab />
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals">
            <ReferralProgram userId={profile?.id || ''} />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <ClientProfile 
              profile={profile as any} 
              onProfileUpdate={fetchBookings}
            />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <ClientNotifications />
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <BookingDialog
          service={selectedService}
          open={bookingDialogOpen}
          onOpenChange={setBookingDialogOpen}
          onConfirm={handleBookingConfirm}
          defaultAddress={profile?.address || ''}
        />

        <ReviewDialog
          booking={selectedBooking as any}
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          onSubmit={handleReviewSubmit}
        />

        <FiltersSheet
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          filters={filters}
          onFiltersChange={setFilters}
          onReset={() => setFilters({ priceRange: [0, 500000], minRating: 0, verifiedOnly: false, city: 'all' })}
        />

        <ServiceRequestForm
          open={requestFormOpen}
          onOpenChange={setRequestFormOpen}
          onSuccess={fetchBookings}
        />
      </div>
    </div>
  );
};

export default ClientDashboard;