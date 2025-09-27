import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
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
  Bell
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  const createBooking = async (serviceId: string) => {
    try {
      // For demo purposes, we'll create a booking with default values
      const { error } = await supabase
        .from('bookings')
        .insert({
          service_id: serviceId,
          client_id: profile?.id,
          master_id: services.find(s => s.id === serviceId)?.master_id,
          scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          total_price: services.find(s => s.id === serviceId)?.price,
          client_address: profile?.address || 'Dirección por definir',
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "¡Éxito!",
        description: "Tu solicitud ha sido enviada al profesional",
      });
      
      fetchBookings(); // Refresh bookings
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el encargo",
        variant: "destructive",
      });
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.masters.business_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
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
      <Header userType="client" />
      
      <div className="container py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">
                ¡Hola, {profile?.full_name}! 👋
              </h1>
              <p className="text-muted-foreground mt-2">
                Encuentra y gestiona todos tus servicios domésticos
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {profile?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Total Encargos</p>
                  <p className="text-2xl font-bold">{bookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-secondary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Completados</p>
                  <p className="text-2xl font-bold">{completedBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Star className="h-6 w-6 text-accent" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Servicios Favoritos</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Total Gastado</p>
                  <p className="text-2xl font-bold">
                    ${bookings.reduce((sum, b) => sum + (b.total_price || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="services" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="services">Buscar Servicios</TabsTrigger>
            <TabsTrigger value="bookings">Mis Encargos</TabsTrigger>
            <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            {/* Search and Filters */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Encuentra el servicio perfecto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Buscar servicios, profesionales..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button variant="outline" className="lg:w-auto">
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
                <Card key={service.id} className="shadow-card hover:shadow-elegant transition-smooth">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{service.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {service.masters.business_name}
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {service.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm ml-1">{service.masters.rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ({service.masters.total_reviews} reseñas)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-primary">
                          ${service.price.toLocaleString()}
                        </span>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {service.duration_minutes} min
                        </div>
                      </div>
                      <Button 
                        onClick={() => createBooking(service.id)}
                        className="ml-4"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Solicitar
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

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Mis Encargos</CardTitle>
                <CardDescription>
                  Gestiona y revisa todos tus servicios solicitados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium">{booking.services.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {booking.masters.business_name}
                            </p>
                            <div className="flex items-center mt-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(booking.scheduled_date).toLocaleDateString('es-ES')}
                              <MapPin className="h-4 w-4 ml-4 mr-1" />
                              {booking.client_address}
                            </div>
                            {booking.notes && (
                              <p className="text-sm text-muted-foreground mt-2">
                                Notas: {booking.notes}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <Badge 
                              className={statusTranslations[booking.status as keyof typeof statusTranslations]?.color}
                            >
                              {statusTranslations[booking.status as keyof typeof statusTranslations]?.label}
                            </Badge>
                            <p className="text-lg font-bold mt-2">
                              ${booking.total_price.toLocaleString()}
                            </p>
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

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Mi Perfil</CardTitle>
                <CardDescription>
                  Gestiona tu información personal y preferencias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                        {profile?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">{profile?.full_name}</h3>
                      <p className="text-muted-foreground">{profile?.user_type === 'client' ? 'Cliente' : 'Usuario'}</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Cambiar Foto
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium">Teléfono</label>
                      <div className="flex items-center mt-1">
                        <Phone className="h-4 w-4 text-muted-foreground mr-2" />
                        <span className="text-sm">{profile?.phone || 'No especificado'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Ciudad</label>
                      <div className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                        <span className="text-sm">{profile?.city || 'No especificada'}</span>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium">Dirección</label>
                      <div className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                        <span className="text-sm">{profile?.address || 'No especificada'}</span>
                      </div>
                    </div>
                  </div>

                  <Button>
                    <User className="h-4 w-4 mr-2" />
                    Editar Perfil
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientDashboard;