import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  BarChart3,
  FileText,
  Download,
  Sparkles,
  Briefcase,
  MessageSquare,
  Package,
  CreditCard,
  TrendingDown,
  User,
  Home,
  ShoppingBag
} from 'lucide-react';
import { ServiceRequestsList } from '@/components/ServiceRequestsList';
import { ApplicationDialog } from '@/components/ApplicationDialog';
import { toast } from '@/hooks/use-toast';
import { MasterPortfolio } from '@/components/MasterPortfolio';
import { ChatTab } from '@/components/ChatTab';
import { SubscriptionPlans } from '@/components/SubscriptionPlans';
import { FinancialDashboard } from '@/components/FinancialDashboard';
import { MasterAnalytics } from '@/components/master/MasterAnalytics';
import { MyApplications } from '@/components/master/MyApplications';
import { AvailableContracts } from '@/components/master/AvailableContracts';
import { WorkCalendar } from '@/components/master/WorkCalendar';
import { MasterNotifications } from '@/components/master/MasterNotifications';
import { PaymentsWithdrawal } from '@/components/master/PaymentsWithdrawal';
import { EscrowPayments } from '@/components/master/EscrowPayments';
import { MyDisputes } from '@/components/MyDisputes';
import { Feed } from '@/components/Feed';
import { TransactionsList } from '@/components/TransactionsList';
import { MarketplaceFeed } from '@/components/MarketplaceFeed';
import { useMasterDashboard } from '@/hooks/useMasterDashboard';
import { DashboardStats } from '@/components/master/DashboardStats';

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
  } | null;
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
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
  const {
    services,
    bookings,
    reviews,
    masterProfile,
    loading,
    stats,
    refetch,
    setServices,
    setBookings,
    setMasterProfile
  } = useMasterDashboard(profile?.id);
  
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    duration_value: '',
    duration_unit: 'hours'
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    city: '',
    address: '',
    business_name: '',
    experience_years: '',
    hourly_rate: '',
    description: ''
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
    const fetchUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || '');
    };
    fetchUserEmail();
  }, []);

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
      refetch();
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
      refetch();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el servicio",
        variant: "destructive",
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Update profile table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.full_name,
          phone: profileForm.phone,
          city: profileForm.city,
          address: profileForm.address
        })
        .eq('id', profile?.id);

      if (profileError) throw profileError;

      // Update masters table
      const { error: masterError } = await supabase
        .from('masters')
        .update({
          business_name: profileForm.business_name,
          experience_years: parseInt(profileForm.experience_years) || 0,
          hourly_rate: parseFloat(profileForm.hourly_rate) || 0,
          description: profileForm.description
        })
        .eq('id', profile?.id);

      if (masterError) throw masterError;

      toast({
        title: "¡Éxito!",
        description: "Perfil actualizado correctamente",
      });
      setIsEditingProfile(false);
      await refreshProfile();
      await refetch();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el perfil",
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
      refetch();
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      });
    }
  };

  // Stats are now calculated by the useMasterDashboard hook

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
              <h1 className="text-4xl font-bold gradient-text animate-fade-in">
                ¡Hola, {profile?.full_name}! 💼
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Gestiona tus servicios y conecta con clientes
              </p>
              {masterProfile?.is_verified && (
                <div className="flex items-center mt-3">
                  <Award className="h-5 w-5 text-blue-500 mr-2" />
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
                    Profesional Verificado
                  </Badge>
                </div>
              )}
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-soft">
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xl font-bold">
                  {profile?.full_name?.charAt(0) || 'M'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Dossier Banner */}
        <Card className="mb-8 overflow-hidden border-2 border-primary/20 shadow-elegant bg-gradient-to-br from-primary/5 via-background to-primary-glow/5">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                  <h3 className="text-xl font-bold gradient-text">
                    ¡Descubre Todo lo que Ofiz Puede Hacer por Ti!
                  </h3>
                </div>
                <p className="text-muted-foreground">
                  Descarga nuestro dossier completo con toda la información sobre planes, beneficios, casos de éxito y cómo maximizar tus ingresos en la plataforma.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    <Award className="h-3 w-3 mr-1" />
                    Planes Premium desde $2,990 UYU
                  </Badge>
                  <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    ROI de +4,900%
                  </Badge>
                  <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                    <Star className="h-3 w-3 mr-1" />
                    Casos de Éxito Reales
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  size="lg"
                  className="bg-gradient-primary hover:opacity-90 shadow-glow"
                  onClick={() => window.open('/dossier-maestros', '_blank')}
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Ver Dossier Completo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.open('/dossier-maestros', '_blank');
                    setTimeout(() => window.print(), 1000);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards - Now using DashboardStats component */}
        <DashboardStats stats={stats} />

        <Tabs defaultValue="services" className="w-full mt-8">
          <TabsList className="inline-flex flex-wrap w-full justify-start h-auto p-2 gap-2 bg-muted/50 rounded-xl">
            <TabsTrigger value="feed" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Feed</span>
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Marketplace</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Servicios</span>
            </TabsTrigger>
            <TabsTrigger value="job-requests" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Trabajos</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Reservas</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Reseñas</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Portfolio</span>
            </TabsTrigger>
            <TabsTrigger value="disputes" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <AlertCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Disputas</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Mensajes</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Plan</span>
            </TabsTrigger>
            <TabsTrigger value="finances" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Finanzas</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Análisis</span>
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Propuestas</span>
            </TabsTrigger>
            <TabsTrigger value="contracts" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Contratos</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendario</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alertas</span>
            </TabsTrigger>
            <TabsTrigger value="escrow" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Escrow</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Transacciones</span>
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <TrendingDown className="h-4 w-4" />
              <span className="hidden sm:inline">Retiros</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
          </TabsList>

          {/* Feed Tab */}
          <TabsContent value="feed">
            <Feed />
          </TabsContent>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace">
            <MarketplaceFeed />
          </TabsContent>

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

          {/* Job Requests Tab */}
          <TabsContent value="job-requests" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Trabajos Disponibles</CardTitle>
                <CardDescription>
                  Explora solicitudes de clientes y envía tus presupuestos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ServiceRequestsList 
                  onApply={(requestId) => {
                    setSelectedRequestId(requestId);
                    setApplicationDialogOpen(true);
                  }}
                />
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
                      <p className="text-2xl font-bold">{stats.pendingBookings}</p>
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
                      <p className="text-2xl font-bold">{stats.completedBookings}</p>
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
                        {bookings.length > 0 ? Math.round((stats.completedBookings / bookings.length) * 100) : 0}%
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
                              Cliente: {booking.profiles?.full_name || 'No disponible'}
                            </p>
                            <div className="flex items-center mt-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(booking.scheduled_date).toLocaleDateString('es-ES')}
                              <MapPin className="h-4 w-4 ml-4 mr-1" />
                              {booking.client_address}
                            </div>
                            {booking.profiles?.phone && (
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
                              Por: {review.profiles?.full_name || 'Usuario anónimo'}
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

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Mi Portfolio</CardTitle>
                <CardDescription>
                  Muestra tus mejores trabajos a los clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MasterPortfolio masterId={profile?.id || ''} isOwner={true} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Disputes Tab */}
          <TabsContent value="disputes">
            <MyDisputes userId={profile?.id || ''} />
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <ChatTab />
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
                {!isEditingProfile ? (
                  <>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                            {profile?.full_name?.charAt(0) || 'M'}
                          </AvatarFallback>
                        </Avatar>
                        <input
                          type="file"
                          id="avatar-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            
                            const fileExt = file.name.split('.').pop();
                            const filePath = `${profile?.id}.${fileExt}`;
                            
                            const { error: uploadError } = await supabase.storage
                              .from('avatars')
                              .upload(filePath, file, { upsert: true });
                            
                            if (uploadError) {
                              toast({
                                title: "Error",
                                description: "No se pudo subir la imagen",
                                variant: "destructive"
                              });
                              return;
                            }
                            
                            const { data: { publicUrl } } = supabase.storage
                              .from('avatars')
                              .getPublicUrl(filePath);
                            
                            const { error: updateError } = await supabase
                              .from('profiles')
                              .update({ avatar_url: publicUrl })
                              .eq('id', profile?.id);
                            
                            if (updateError) {
                              toast({
                                title: "Error",
                                description: "No se pudo actualizar el perfil",
                                variant: "destructive"
                              });
                              return;
                            }
                            
                            toast({
                              title: "¡Éxito!",
                              description: "Avatar actualizado correctamente"
                            });
                            refreshProfile();
                          }}
                        />
                        <Button
                          size="icon"
                          variant="secondary"
                          className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                          onClick={() => document.getElementById('avatar-upload')?.click()}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{profile?.full_name}</h3>
                        <p className="text-muted-foreground">
                          {masterProfile?.business_name || 'Nombre comercial no configurado'}
                        </p>
                        <div className="flex items-center mt-2">
                          <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                          <span className="text-sm">
                            {stats.averageRating.toFixed(1)} ({stats.totalReviews} reseñas)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label>Información Personal</Label>
                        <div className="space-y-2 mt-2">
                          <p className="text-sm"><strong>Email:</strong> {userEmail || 'No disponible'}</p>
                          <p className="text-sm"><strong>Teléfono:</strong> {profile?.phone || 'No configurado'}</p>
                          <p className="text-sm"><strong>Ciudad:</strong> {profile?.city || 'No configurada'}</p>
                          <p className="text-sm"><strong>Dirección:</strong> {profile?.address || 'No configurada'}</p>
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

                    <Button className="w-full md:w-auto" onClick={() => setIsEditingProfile(true)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Editar Perfil
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="full_name">Nombre Completo</Label>
                          <Input
                            id="full_name"
                            value={profileForm.full_name}
                            onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                            placeholder="Tu nombre completo"
                          />
                        </div>

                        <div>
                          <Label htmlFor="business_name">Nombre Comercial</Label>
                          <Input
                            id="business_name"
                            value={profileForm.business_name}
                            onChange={(e) => setProfileForm({ ...profileForm, business_name: e.target.value })}
                            placeholder="Nombre de tu negocio"
                          />
                        </div>

                        <div>
                          <Label htmlFor="phone">Teléfono</Label>
                          <Input
                            id="phone"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            placeholder="Tu número de teléfono"
                          />
                        </div>

                        <div>
                          <Label htmlFor="city">Ciudad</Label>
                          <Input
                            id="city"
                            value={profileForm.city}
                            onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                            placeholder="Tu ciudad"
                          />
                        </div>

                        <div>
                          <Label htmlFor="address">Dirección</Label>
                          <Input
                            id="address"
                            value={profileForm.address}
                            onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                            placeholder="Tu dirección"
                          />
                        </div>

                        <div>
                          <Label htmlFor="experience_years">Años de Experiencia</Label>
                          <Input
                            id="experience_years"
                            type="number"
                            value={profileForm.experience_years}
                            onChange={(e) => setProfileForm({ ...profileForm, experience_years: e.target.value })}
                            placeholder="0"
                            min="0"
                          />
                        </div>

                        <div>
                          <Label htmlFor="hourly_rate">Tarifa por Hora ($)</Label>
                          <Input
                            id="hourly_rate"
                            type="number"
                            value={profileForm.hourly_rate}
                            onChange={(e) => setProfileForm({ ...profileForm, hourly_rate: e.target.value })}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">Descripción Profesional</Label>
                        <Textarea
                          id="description"
                          value={profileForm.description}
                          onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                          placeholder="Describe tus servicios, experiencia y especialidades..."
                          rows={4}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile}>
                        Guardar Cambios
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Gestión de Suscripción</CardTitle>
                <CardDescription>
                  Elige el plan que mejor se adapte a tus necesidades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SubscriptionPlans />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Dashboard Tab */}
          <TabsContent value="finances" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Dashboard Financiero</CardTitle>
                <CardDescription>
                  Gestiona tus ingresos, pagos y comisiones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FinancialDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <MasterAnalytics />
          </TabsContent>

          {/* My Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <MyApplications />
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts" className="space-y-6">
            <AvailableContracts />
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <WorkCalendar />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <MasterNotifications />
          </TabsContent>

          {/* Escrow Payments Tab */}
          <TabsContent value="escrow" className="space-y-6">
            <EscrowPayments masterId={profile?.id || ''} />
          </TabsContent>

          {/* Payments/Transactions Tab */}
          <TabsContent value="payments" className="space-y-6">
            <TransactionsList />
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals" className="space-y-6">
            <PaymentsWithdrawal />
          </TabsContent>
        </Tabs>

        <ApplicationDialog
          open={applicationDialogOpen}
          onOpenChange={setApplicationDialogOpen}
          requestId={selectedRequestId || ''}
          onSuccess={() => {
            setApplicationDialogOpen(false);
            setSelectedRequestId(null);
          }}
        />
      </div>
    </div>
  );
};

export default MasterDashboard;