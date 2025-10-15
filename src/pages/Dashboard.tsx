import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar,
  CheckCircle,
  Star,
  User,
  CreditCard,
  Bell,
  MessageSquare,
  Plus,
  BarChart3
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { BookingDialog } from '@/components/BookingDialog';
import { ReviewDialog } from '@/components/ReviewDialog';
import { ClientProfile } from '@/components/ClientProfile';
import { ClientNotifications } from '@/components/ClientNotifications';
import { ServiceRequestForm } from '@/components/ServiceRequestForm';
import { MyServiceRequests } from '@/components/MyServiceRequests';
import { ChatTab } from '@/components/ChatTab';
import { ServiceRequestsList } from '@/components/ServiceRequestsList';
import { MasterPortfolio } from '@/components/MasterPortfolio';
import { SubscriptionPlans } from '@/components/SubscriptionPlans';
import { FinancialDashboard } from '@/components/FinancialDashboard';

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  duration_minutes: number;
  master_id: string;
  status: string;
  masters?: {
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
  masters?: {
    business_name: string;
    rating: number;
  };
  profiles?: {
    full_name: string;
    phone?: string;
  };
}

const Dashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [requestFormOpen, setRequestFormOpen] = useState(false);

  const isClient = profile?.user_type === 'client';
  const isMaster = profile?.user_type === 'master';

  useEffect(() => {
    if (profile?.id) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchServices(),
        fetchBookings()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      if (isClient) {
        // Clients see all available services
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
      } else if (isMaster) {
        // Masters see their own services
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('master_id', profile?.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setServices(data || []);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      if (isClient) {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            services (title, category),
            masters (business_name, rating)
          `)
          .eq('client_id', profile?.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBookings(data || []);
      } else if (isMaster) {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            services (title, category),
            profiles (full_name, phone)
          `)
          .eq('master_id', profile?.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBookings(data || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
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

  const completedBookings = bookings.filter(b => b.status === 'completed').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header 
        userType={profile?.user_type || null}
        onNotificationsClick={() => setActiveTab('notifications')}
        onProfileClick={() => setActiveTab('profile')}
      />
      
      <div className="container px-4 md:px-6 py-4 md:py-8">
        {/* Welcome Section */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">
            ¡Hola, {profile?.full_name}! 👋
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            {isClient ? 'Gestiona tus servicios y encargos' : 'Gestiona tu negocio y tus clientes'}
          </p>
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
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {isMaster ? 'Servicios' : 'Favoritos'}
                  </p>
                  <p className="text-xl md:text-2xl font-bold">
                    {isMaster ? services.length : 0}
                  </p>
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
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {isClient ? 'Total Gastado' : 'Total Ganado'}
                  </p>
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
            <TabsList className="inline-flex md:grid w-auto md:w-full min-w-max md:min-w-0"
              style={{ gridTemplateColumns: `repeat(${isClient ? 5 : 7}, minmax(0, 1fr))` }}>
              <TabsTrigger value="overview" className="text-xs md:text-sm whitespace-nowrap">
                Resumen
              </TabsTrigger>
              {isClient && (
                <TabsTrigger value="requests" className="text-xs md:text-sm whitespace-nowrap">
                  Solicitudes
                </TabsTrigger>
              )}
              {isMaster && (
                <>
                  <TabsTrigger value="service-requests" className="text-xs md:text-sm whitespace-nowrap">
                    Solicitudes
                  </TabsTrigger>
                  <TabsTrigger value="portfolio" className="text-xs md:text-sm whitespace-nowrap">
                    Portfolio
                  </TabsTrigger>
                  <TabsTrigger value="subscriptions" className="text-xs md:text-sm whitespace-nowrap">
                    Planes
                  </TabsTrigger>
                  <TabsTrigger value="finances" className="text-xs md:text-sm whitespace-nowrap">
                    Finanzas
                  </TabsTrigger>
                </>
              )}
              <TabsTrigger value="chat" className="text-xs md:text-sm whitespace-nowrap">
                Mensajes
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs md:text-sm whitespace-nowrap">
                Notificaciones
              </TabsTrigger>
              <TabsTrigger value="profile" className="text-xs md:text-sm whitespace-nowrap">
                Perfil
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mis Encargos Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No tienes encargos aún
                  </p>
                ) : (
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{booking.services.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.scheduled_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge>{booking.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Client Requests Tab */}
          {isClient && (
            <TabsContent value="requests" className="space-y-6">
              <MyServiceRequests />
            </TabsContent>
          )}

          {/* Master Service Requests Tab */}
          {isMaster && (
            <TabsContent value="service-requests" className="space-y-6">
              <ServiceRequestsList />
            </TabsContent>
          )}

          {/* Master Portfolio Tab */}
          {isMaster && profile?.id && (
            <TabsContent value="portfolio" className="space-y-6">
              <MasterPortfolio masterId={profile.id} />
            </TabsContent>
          )}

          {/* Master Subscriptions Tab */}
          {isMaster && (
            <TabsContent value="subscriptions" className="space-y-6">
              <SubscriptionPlans />
            </TabsContent>
          )}

          {/* Master Finances Tab */}
          {isMaster && (
            <TabsContent value="finances" className="space-y-6">
              <FinancialDashboard />
            </TabsContent>
          )}

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <ChatTab />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <ClientNotifications />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {profile && (
              <ClientProfile 
                profile={{
                  id: profile.id,
                  full_name: profile.full_name,
                  phone: profile.phone || null,
                  address: profile.address || null,
                  city: profile.city || null,
                  avatar_url: profile.avatar_url || null
                }}
                onProfileUpdate={fetchData}
              />
            )}
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        {selectedService && (
          <BookingDialog
            open={bookingDialogOpen}
            onOpenChange={setBookingDialogOpen}
            service={{
              ...selectedService,
              masters: selectedService.masters || {
                business_name: '',
                rating: 0,
                total_reviews: 0
              }
            }}
            onConfirm={handleBookingConfirm}
          />
        )}

        {selectedBooking && (
          <ReviewDialog
            open={reviewDialogOpen}
            onOpenChange={setReviewDialogOpen}
            booking={{
              ...selectedBooking,
              masters: selectedBooking.masters || {
                business_name: '',
                rating: 0
              }
            }}
            onSubmit={(rating, comment) => {
              // Handle review submission
            }}
          />
        )}

        <ServiceRequestForm
          open={requestFormOpen}
          onOpenChange={setRequestFormOpen}
        />
      </div>
    </div>
  );
};

export default Dashboard;
