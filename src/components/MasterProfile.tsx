import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookingDialog } from '@/components/BookingDialog';
import { toast } from '@/hooks/use-toast';
import {
  Star,
  MapPin,
  Clock,
  CheckCircle,
  Phone,
  Mail,
  Calendar,
  Award,
  Heart,
  MessageSquare,
  DollarSign
} from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  duration_minutes: number;
}

interface MasterProfileData {
  id: string;
  business_name: string;
  description: string;
  experience_years: number;
  hourly_rate: number;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  profiles: {
    full_name: string;
    phone: string;
    city: string;
    avatar_url: string;
  };
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
}

interface MasterProfileProps {
  masterId: string;
  onClose: () => void;
}

export const MasterProfile = ({ masterId, onClose }: MasterProfileProps) => {
  const { profile } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites(profile?.id);
  const [masterData, setMasterData] = useState<MasterProfileData | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    fetchMasterData();
  }, [masterId]);

  const fetchMasterData = async () => {
    try {
      setLoading(true);
      
      // Fetch master profile
      const { data: masterInfo, error: masterError } = await supabase
        .from('masters')
        .select(`
          *,
          profiles (
            full_name,
            phone,
            city,
            avatar_url
          )
        `)
        .eq('id', masterId)
        .single();

      if (masterError) throw masterError;
      setMasterData(masterInfo);

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('master_id', masterId)
        .eq('status', 'active')
        .order('price', { ascending: true });

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          profiles (full_name)
        `)
        .eq('master_id', masterId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (reviewsError) throw reviewsError;
      setReviews(reviewsData || []);

      // Fetch portfolio
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('master_portfolio')
        .select('*')
        .eq('master_id', masterId)
        .order('display_order', { ascending: true });

      if (portfolioError) throw portfolioError;
      setPortfolio(portfolioData || []);

    } catch (error) {
      console.error('Error fetching master data:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil del profesional",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = (service: Service) => {
    if (!profile) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para reservar un servicio",
        variant: "destructive",
      });
      return;
    }
    setSelectedService(service);
    setBookingDialogOpen(true);
  };

  const handleBookingConfirm = async (bookingData: {
    serviceId: string;
    scheduledDate: Date;
    address: string;
    notes: string;
    photos: string[];
  }) => {
    try {
      const service = services.find(s => s.id === bookingData.serviceId);
      if (!service) return;

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          service_id: bookingData.serviceId,
          client_id: profile?.id,
          master_id: masterId,
          scheduled_date: bookingData.scheduledDate.toISOString(),
          total_price: service.price,
          client_address: bookingData.address,
          notes: bookingData.notes,
          client_photos: bookingData.photos,
          status: 'pending'
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create or get conversation
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_id', profile?.id)
        .eq('master_id', masterId)
        .eq('booking_id', booking.id)
        .maybeSingle();

      if (!existingConversation) {
        const { error: conversationError } = await supabase
          .from('conversations')
          .insert({
            client_id: profile?.id,
            master_id: masterId,
            booking_id: booking.id
          });

        if (conversationError) {
          console.error('Error creating conversation:', conversationError);
        }
      }

      // Create notifications
      await supabase.from('notifications').insert([
        {
          user_id: masterId,
          type: 'new_booking',
          title: 'Nueva reserva',
          message: `${profile?.full_name} ha solicitado el servicio "${service.title}"`,
          booking_id: booking.id
        },
        {
          user_id: profile?.id,
          type: 'booking_created',
          title: 'Reserva creada',
          message: `Tu reserva de "${service.title}" ha sido enviada`,
          booking_id: booking.id
        }
      ]);

      toast({
        title: "¡Reserva creada!",
        description: "El profesional recibirá tu solicitud pronto",
      });

      setBookingDialogOpen(false);
      onClose();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la reserva",
        variant: "destructive",
      });
    }
  };

  const handleToggleFavorite = async () => {
    if (!profile) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para guardar favoritos",
        variant: "destructive",
      });
      return;
    }
    await toggleFavorite(masterId);
  };

  const handleStartChat = async () => {
    if (!profile) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para enviar mensajes",
        variant: "destructive",
      });
      return;
    }
    
    // Navigate to client dashboard chat tab
    window.location.href = '/client-dashboard?tab=chat&masterId=' + masterId;
  };

  const formatDuration = (minutes: number): string => {
    if (minutes >= 60 * 24) {
      const days = minutes / (60 * 24);
      return `${days} ${days === 1 ? 'día' : 'días'}`;
    } else if (minutes >= 60) {
      const hours = minutes / 60;
      return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    }
    return `${minutes} min`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!masterData) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No se pudo cargar el perfil</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={masterData.profiles.avatar_url} />
              <AvatarFallback>{masterData.profiles.full_name[0]}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{masterData.profiles.full_name}</h2>
                    {masterData.is_verified && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <p className="text-lg text-muted-foreground">{masterData.business_name}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleToggleFavorite}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite(masterId) ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleStartChat}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Mensaje
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{masterData.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({masterData.total_reviews} reseñas)</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span>{masterData.profiles.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-muted-foreground" />
                  <span>{masterData.experience_years} años de experiencia</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold">${masterData.hourly_rate}/hora</span>
                </div>
              </div>

              {masterData.profiles.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{masterData.profiles.phone}</span>
                </div>
              )}

              <p className="mt-4 text-muted-foreground">{masterData.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="services">Servicios</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="reviews">Reseñas</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          {services.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No hay servicios disponibles
              </CardContent>
            </Card>
          ) : (
            services.map((service) => (
              <Card key={service.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                      <p className="text-muted-foreground mb-4">{service.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDuration(service.duration_minutes)}</span>
                        </div>
                        <Badge variant="secondary">{service.category}</Badge>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-3xl font-bold text-primary mb-2">
                        ${service.price.toLocaleString()}
                      </p>
                      <Button onClick={() => handleBookService(service)}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Reservar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          {portfolio.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No hay trabajos en el portfolio
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolio.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <img 
                    src={item.image_url} 
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <Badge variant="secondary" className="mt-2">{item.category}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No hay reseñas todavía
              </CardContent>
            </Card>
          ) : (
            reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarFallback>{review.profiles.full_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{review.profiles.full_name}</h4>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Booking Dialog */}
      {selectedService && (
        <BookingDialog
          open={bookingDialogOpen}
          onOpenChange={setBookingDialogOpen}
          service={{
            id: selectedService.id,
            title: selectedService.title,
            description: selectedService.description,
            price: selectedService.price,
            category: selectedService.category,
            duration_minutes: selectedService.duration_minutes,
            masters: {
              business_name: masterData.business_name
            }
          } as any}
          onConfirm={handleBookingConfirm}
        />
      )}
    </div>
  );
};
