import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star,
  Clock,
  MapPin,
  Phone,
  Sparkles,
  ExternalLink,
  Briefcase,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface FeedCardProps {
  item: {
    id: string;
    type: 'service_request' | 'available_master' | 'service' | 'sponsored';
    data: any;
  };
  onInteraction: (targetId: string, targetType: string, interactionType: string, category?: string) => void;
}

export const FeedCard = ({ item, onInteraction }: FeedCardProps) => {
  const navigate = useNavigate();

  const handleAction = (action: string) => {
    onInteraction(item.id, item.type, action, item.data.category);
  };

  // Tarjeta de Solicitud de Servicio
  if (item.type === 'service_request') {
    const request = item.data;
    const profile = request.profiles;

    return (
      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="capitalize">
                  {request.category}
                </Badge>
                <Badge variant="secondary">Nueva solicitud</Badge>
              </div>
              <h3 className="text-xl font-bold mb-2">{request.title}</h3>
              <p className="text-muted-foreground mb-3 line-clamp-2">{request.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-muted-foreground">
            {profile?.city && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{profile.city}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Hace {Math.floor((Date.now() - new Date(request.created_at).getTime()) / (1000 * 60 * 60))}h</span>
            </div>
            {request.budget_range && (
              <div className="flex items-center gap-1 font-medium text-primary">
                <span>💰 {request.budget_range}</span>
              </div>
            )}
          </div>

          {request.photos && request.photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {request.photos.slice(0, 3).map((photo: string, idx: number) => (
                <img
                  key={idx}
                  src={photo}
                  alt={`Foto ${idx + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
              ))}
            </div>
          )}

          <Button 
            className="w-full" 
            onClick={() => {
              handleAction('apply');
              if (window.location.pathname === '/master-dashboard') {
                navigate('/master-dashboard?tab=applications');
              } else {
                navigate('/auth?redirect=/master-dashboard?tab=applications');
              }
              toast.success('Redirigiendo...');
            }}
          >
            <Briefcase className="mr-2 h-4 w-4" />
            Enviar Presupuesto
          </Button>
        </div>
      </Card>
    );
  }

  // Tarjeta de Maestro Disponible
  if (item.type === 'available_master') {
    const master = item.data;
    const profile = master.profiles;

    return (
      <Card className="hover:shadow-lg transition-all duration-300">
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <Avatar className="h-16 w-16 ring-2 ring-primary/20">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/50 text-primary-foreground text-xl">
                {master.business_name?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold">{master.business_name}</h3>
                {master.is_verified && (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verificado
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-3 text-sm mb-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span className="font-medium">{master.rating?.toFixed(1)}</span>
                  <span className="text-muted-foreground">({master.total_reviews} reseñas)</span>
                </div>
                {master.experience_years > 0 && (
                  <span className="text-muted-foreground">{master.experience_years} años exp.</span>
                )}
              </div>

              {master.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {master.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm">
                {profile?.city && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.city}</span>
                  </div>
                )}
                {master.hourly_rate && (
                  <div className="font-medium text-primary">
                    ${master.hourly_rate}/hora
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              className="flex-1"
              onClick={() => {
                handleAction('contact');
                navigate('/search-masters');
              }}
            >
              <Phone className="mr-2 h-4 w-4" />
              Contactar
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                handleAction('view_profile');
                navigate('/search-masters');
              }}
            >
              Ver Perfil
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Tarjeta de Servicio
  if (item.type === 'service') {
    const service = item.data;
    const master = service.masters;
    const profile = master?.profiles;

    return (
      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-secondary">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  {master?.business_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold">{master?.business_name}</h4>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  <span>{master?.rating?.toFixed(1)}</span>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="capitalize">
              {service.category}
            </Badge>
          </div>

          <h3 className="text-lg font-bold mb-2">{service.title}</h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{service.description}</p>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {service.duration_minutes && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{service.duration_minutes} min</span>
                </div>
              )}
            </div>
            <span className="text-2xl font-bold text-primary">
              ${service.price}
            </span>
          </div>

          <Button 
            className="w-full" 
            onClick={() => {
              handleAction('book');
              navigate('/search-masters');
            }}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Solicitar Servicio
          </Button>
        </div>
      </Card>
    );
  }

  // Tarjeta de Contenido Patrocinado
  if (item.type === 'sponsored') {
    const sponsored = item.data;

    return (
      <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden border-accent/50 bg-gradient-to-br from-accent/10 to-card">
        <div className="px-4 py-2 bg-accent/20 border-b border-accent/30">
          <span className="text-xs font-medium flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Destacado
          </span>
        </div>

        {sponsored.media_url && (
          <img
            src={sponsored.media_url}
            alt={sponsored.title}
            className="w-full h-48 object-cover"
          />
        )}

        <div className="p-6">
          <h3 className="text-xl font-bold mb-2">{sponsored.title}</h3>
          <p className="text-muted-foreground text-sm mb-4">{sponsored.description}</p>

          {sponsored.category && (
            <Badge variant="secondary" className="mb-4 capitalize">
              {sponsored.category}
            </Badge>
          )}

          {sponsored.cta_url && (
            <Button 
              className="w-full"
              onClick={() => {
                handleAction('click');
                window.open(sponsored.cta_url, '_blank');
              }}
            >
              {sponsored.cta_text || 'Más información'}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return null;
};
