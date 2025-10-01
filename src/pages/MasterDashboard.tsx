import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Star, 
  Clock, 
  MapPin, 
  Calendar,
  Phone,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Users,
  TrendingUp,
  Bell,
  Settings,
  Award,
  BarChart3
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  duration_minutes: number;
  status: string;
  created_at: string;
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
  profiles: {
    full_name: string;
    phone?: string;
  };
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
  services: {
    title: string;
  };
}

interface MasterProfile {
  id: string;
  business_name?: string;
  description?: string;
  experience_years?: number;
  hourly_rate?: number;
  rating?: number;
  total_reviews?: number;
  is_verified?: boolean;
}

const MasterDashboard = () => {
  const { profile, refreshProfile } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [masterProfile, setMasterProfile] = useState<MasterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    duration_value: '',
    duration_unit: 'hours'
  });

  const categories = [
    { id: 'plumbing', name: 'Plomería', icon: '🔧' },
    { id: 'electricity', name: 'Electricidad', icon: '⚡' },
    { id: 'cleaning', name: 'Limpieza', icon: '🧽' },
    { id: 'computer_repair', name: 'Reparación PC', icon: '🛠️' },
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
    if (profile?.id) {
      fetchMasterData();
    } else {
      // If there's no profile yet, avoid infinite loading and show onboarding UI below
      setLoading(false);
    }
  }, [profile]);

  const fetchMasterData = async () => {
    try {
      await Promise.all([
        fetchMasterProfile(),
        fetchServices(),
        fetchBookings(),
        fetchReviews()
      ]);
    } catch (error) {
      console.error('Error fetching master data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('masters')
        .select('*')
        .eq('id', profile?.id)
        .maybeSingle();

      if (error) throw error;
      
      // If no master profile exists, create one
      if (!data && profile?.id) {
        const { data: newMasterData, error: createError } = await supabase
          .from('masters')
          .insert({
            id: profile.id,
            business_name: `${profile.full_name} - Servicios`
          })
          .select()
          .maybeSingle();
        
        if (createError) {
          console.error('Error creating master profile:', createError);
        } else {
          setMasterProfile(newMasterData);
        }
      } else {
        setMasterProfile(data);
      }
    } catch (error) {
      console.error('Error fetching master profile:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('master_id', profile?.id)
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
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las reservas",
        variant: "destructive",
      });
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles (full_name)
        `)
        .eq('master_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Get service titles separately
      const reviewsWithServices = await Promise.all((data || []).map(async (review) => {
        const { data: serviceData } = await supabase
          .from('services')
          .select('title')
          .eq('id', review.booking_id)
          .maybeSingle();
        
        return {
          ...review,
          services: { title: serviceData?.title || 'Servicio no encontrado' }
        };
      }));
      
      setReviews(reviewsWithServices);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const convertToMinutes = (value: string, unit: string): number => {
    const numValue = parseInt(value);
    switch (unit) {
      case 'hours':
        return numValue * 60;
      case 'days':
        return numValue * 60 * 24;
      case 'weeks':
        return numValue * 60 * 24 * 7;
      case 'months':
        return numValue * 60 * 24 * 30;
      default:
        return numValue * 60;
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const serviceData = {
        title: serviceForm.title,
        description: serviceForm.description,
        price: parseFloat(serviceForm.price),
        category: serviceForm.category as 'appliance_repair' | 'carpentry' | 'cleaning' | 'computer_repair' | 'electricity' | 'gardening' | 'painting' | 'plumbing',
        duration_minutes: convertToMinutes(serviceForm.duration_value, serviceForm.duration_unit),
        master_id: profile?.id,
        status: 'active' as const
      };

      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);
        
        if (error) throw error;
        toast({
          title: "¡Éxito!",
          description: "Servicio actualizado correctamente",
        });
      } else {
        const { error } = await supabase
          .from('services')
          .insert(serviceData);
        
        if (error) throw error;
        toast({
          title: "¡Éxito!",
          description: "Servicio creado correctamente",
        });
      }

      setShowServiceDialog(false);
      setEditingService(null);
      setServiceForm({
        title: '',
        description: '',
        price: '',
        category: '',
        duration_value: '',
        duration_unit: 'hours'
      });
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el servicio",
        variant: "destructive",
      });
    }
  };

  const convertFromMinutes = (minutes: number): { value: string; unit: string } => {
    if (minutes >= 60 * 24 * 30 && minutes % (60 * 24 * 30) === 0) {
      return { value: (minutes / (60 * 24 * 30)).toString(), unit: 'months' };
    } else if (minutes >= 60 * 24 * 7 && minutes % (60 * 24 * 7) === 0) {
      return { value: (minutes / (60 * 24 * 7)).toString(), unit: 'weeks' };
    } else if (minutes >= 60 * 24 && minutes % (60 * 24) === 0) {
      return { value: (minutes / (60 * 24)).toString(), unit: 'days' };
    } else {
      return { value: (minutes / 60).toString(), unit: 'hours' };
    }
  };

  const formatDuration = (minutes: number): string => {
    const duration = convertFromMinutes(minutes);
    const unitLabels = {
      'hours': parseInt(duration.value) === 1 ? 'hora' : 'horas',
      'days': parseInt(duration.value) === 1 ? 'día' : 'días',
      'weeks': parseInt(duration.value) === 1 ? 'semana' : 'semanas',
      'months': parseInt(duration.value) === 1 ? 'mes' : 'meses'
    };
    return `${duration.value} ${unitLabels[duration.unit as keyof typeof unitLabels]}`;
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    const duration = convertFromMinutes(service.duration_minutes);
    setServiceForm({
      title: service.title,
      description: service.description,
      price: service.price.toString(),
      category: service.category,
      duration_value: duration.value,
      duration_unit: duration.unit
    });
    setShowServiceDialog(true);
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ status: 'paused' })
        .eq('id', serviceId);

      if (error) throw error;
      
      toast({
        title: "Servicio eliminado",
        description: "El servicio ha sido desactivado",
      });
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el servicio",
        variant: "destructive",
      });
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;
      
      toast({
        title: "Estado actualizado",
        description: "El estado de la reserva ha sido actualizado",
      });
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      });
    }
  };

  // Calculate stats
  const activeServices = services.filter(s => s.status === 'active').length;
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const totalEarnings = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + (b.total_price || 0), 0);
  const averageRating = masterProfile?.rating || 0;

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

  if (!profile?.id) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header userType="master" />
        <div className="container py-16 text-center space-y-4">
          <h1 className="text-2xl font-semibold">Preparando tu perfil de Maestro</h1>
          <p>Estamos creando tu perfil. Si tarda demasiado, pulsa Reintentar.</p>
          <Button onClick={refreshProfile}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header userType="master" />
      
      <div className="container py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">
                ¡Hola, {profile?.full_name}! 💼
              </h1>
              <p className="text-muted-foreground mt-2">
                Gestiona tus servicios y conecta con clientes
              </p>
              {masterProfile?.is_verified && (
                <div className="flex items-center mt-2">
                  <Award className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm text-blue-600 font-medium">Profesional Verificado</span>
                </div>
              )}
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {profile?.full_name?.charAt(0) || 'M'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Servicios Activos</p>
                  <p className="text-2xl font-bold">{activeServices}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-secondary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Total Reservas</p>
                  <p className="text-2xl font-bold">{totalBookings}</p>
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
                  <p className="text-sm text-muted-foreground">Calificación</p>
                  <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                  <p className="text-2xl font-bold">${totalEarnings.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="services" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="services">Mis Servicios</TabsTrigger>
            <TabsTrigger value="bookings">Reservas</TabsTrigger>
            <TabsTrigger value="reviews">Reseñas</TabsTrigger>
            <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Mis Servicios</CardTitle>
                    <CardDescription>
                      Gestiona los servicios que ofreces a tus clientes
                    </CardDescription>
                  </div>
                  <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Servicio
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>
                          {editingService ? 'Editar Servicio' : 'Crear Nuevo Servicio'}
                        </DialogTitle>
                        <DialogDescription>
                          {editingService ? 'Actualiza la información de tu servicio' : 'Agrega un nuevo servicio a tu catálogo'}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleServiceSubmit}>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="title">Título del Servicio</Label>
                            <Input
                              id="title"
                              value={serviceForm.title}
                              onChange={(e) => setServiceForm({...serviceForm, title: e.target.value})}
                              placeholder="Ej: Reparación de grifos"
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="category">Categoría</Label>
                            <Select 
                              value={serviceForm.category} 
                              onValueChange={(value) => setServiceForm({...serviceForm, category: value})}
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona una categoría" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    <span className="mr-2">{category.icon}</span>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                              id="description"
                              value={serviceForm.description}
                              onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                              placeholder="Describe detalladamente tu servicio..."
                              required
                            />
                          </div>
                          <div className="grid gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="price">Precio ($U)</Label>
                              <Input
                                id="price"
                                type="number"
                                value={serviceForm.price}
                                onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
                                placeholder="1500"
                                required
                              />
                              <p className="text-xs text-muted-foreground">Pesos uruguayos</p>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="duration">Duración del Servicio</Label>
                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  id="duration"
                                  type="number"
                                  min="1"
                                  value={serviceForm.duration_value}
                                  onChange={(e) => setServiceForm({...serviceForm, duration_value: e.target.value})}
                                  placeholder="2"
                                  required
                                />
                                <Select 
                                  value={serviceForm.duration_unit} 
                                  onValueChange={(value) => setServiceForm({...serviceForm, duration_unit: value})}
                                  required
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="hours">Horas</SelectItem>
                                    <SelectItem value="days">Días</SelectItem>
                                    <SelectItem value="weeks">Semanas</SelectItem>
                                    <SelectItem value="months">Meses</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">
                            {editingService ? 'Actualizar' : 'Crear'} Servicio
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {services.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((service) => (
                      <Card key={service.id} className="shadow-sm border">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{service.title}</CardTitle>
                              <div className="flex items-center mt-1">
                                <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                                  {service.status === 'active' ? 'Activo' : 'Inactivo'}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditService(service)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteService(service.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {service.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xl font-bold text-primary">
                                ${service.price.toLocaleString()}
                              </span>
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDuration(service.duration_minutes)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No tienes servicios aún</h3>
                    <p className="text-muted-foreground mb-4">
                      Crea tu primer servicio para empezar a recibir clientes
                    </p>
                    <Button onClick={() => setShowServiceDialog(true)}>
                      Crear Mi Primer Servicio
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-8 w-8 text-yellow-500" />
                    <div className="ml-3">
                      <p className="text-sm text-muted-foreground">Pendientes</p>
                      <p className="text-2xl font-bold">{pendingBookings}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div className="ml-3">
                      <p className="text-sm text-muted-foreground">Completados</p>
                      <p className="text-2xl font-bold">{completedBookings}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-blue-500" />
                    <div className="ml-3">
                      <p className="text-sm text-muted-foreground">Tasa Éxito</p>
                      <p className="text-2xl font-bold">
                        {totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Reservas Recibidas</CardTitle>
                <CardDescription>
                  Gestiona las solicitudes de servicio de tus clientes
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
                              Cliente: {booking.profiles.full_name}
                            </p>
                            <div className="flex items-center mt-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(booking.scheduled_date).toLocaleDateString('es-ES')}
                              <MapPin className="h-4 w-4 ml-4 mr-1" />
                              {booking.client_address}
                            </div>
                            {booking.profiles.phone && (
                              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4 mr-1" />
                                {booking.profiles.phone}
                              </div>
                            )}
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
                            <div className="mt-3 space-x-2">
                              {booking.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                  >
                                    Confirmar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                  >
                                    Rechazar
                                  </Button>
                                </>
                              )}
                              {booking.status === 'confirmed' && (
                                <Button
                                  size="sm"
                                  onClick={() => updateBookingStatus(booking.id, 'in_progress')}
                                >
                                  Iniciar
                                </Button>
                              )}
                              {booking.status === 'in_progress' && (
                                <Button
                                  size="sm"
                                  onClick={() => updateBookingStatus(booking.id, 'completed')}
                                >
                                  Completar
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No tienes reservas aún</h3>
                    <p className="text-muted-foreground">
                      Las solicitudes de servicio aparecerán aquí cuando los clientes te contacten
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Reseñas de Clientes</CardTitle>
                <CardDescription>
                  Ve lo que dicen tus clientes sobre tu trabajo
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? 'text-yellow-500 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="ml-2 text-sm text-muted-foreground">
                                {review.rating}/5
                              </span>
                            </div>
                            <h3 className="font-medium">{review.services.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              Por: {review.profiles.full_name}
                            </p>
                            {review.comment && (
                              <p className="text-sm">{review.comment}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(review.created_at).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No tienes reseñas aún</h3>
                    <p className="text-muted-foreground">
                      Las reseñas de tus clientes aparecerán aquí después de completar servicios
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Mi Perfil Profesional</CardTitle>
                <CardDescription>
                  Administra tu información profesional y preferencias
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {profile?.full_name?.charAt(0) || 'M'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{profile?.full_name}</h3>
                    <p className="text-muted-foreground">
                      {masterProfile?.business_name || 'Nombre comercial no configurado'}
                    </p>
                    <div className="flex items-center mt-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                      <span className="text-sm">
                        {averageRating.toFixed(1)} ({masterProfile?.total_reviews || 0} reseñas)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Información Personal</Label>
                    <div className="space-y-2 mt-2">
                      <p><strong>Email:</strong> {profile?.id}</p>
                      <p><strong>Teléfono:</strong> {profile?.phone || 'No configurado'}</p>
                      <p><strong>Ciudad:</strong> {profile?.city || 'No configurada'}</p>
                      <p><strong>Dirección:</strong> {profile?.address || 'No configurada'}</p>
                    </div>
                  </div>

                  <div>
                    <Label>Información Profesional</Label>
                    <div className="space-y-2 mt-2">
                      <p><strong>Años de experiencia:</strong> {masterProfile?.experience_years || 'No especificado'}</p>
                      <p><strong>Tarifa por hora:</strong> ${masterProfile?.hourly_rate?.toLocaleString() || 'No configurada'}</p>
                      <p><strong>Estado:</strong> {masterProfile?.is_verified ? 'Verificado' : 'No verificado'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Descripción Profesional</Label>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {masterProfile?.description || 'Agrega una descripción para atraer más clientes...'}
                  </p>
                </div>

                <Button className="w-full md:w-auto">
                  <Settings className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MasterDashboard;