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
  CheckCircle2,
  Heart,
  MessageCircle,
  Share2,
  ThumbsUp,
  ShoppingCart,
  Tag,
  TrendingUp,
  Eye
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface FeedCardProps {
  item: {
    id: string;
    type: 'service_request' | 'available_master' | 'service' | 'sponsored' | 'master_post' | 'completed_work' | 'marketplace_product' | 'advertisement';
    data: any;
  };
  onInteraction: (targetId: string, targetType: string, interactionType: string, category?: string) => void;
}

export const FeedCard = ({ item, onInteraction }: FeedCardProps) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 50) + 5);

  const handleAction = (action: string) => {
    onInteraction(item.id, item.type, action, item.data.category);
  };

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
    handleAction('like');
  };

  // Tarjeta de Producto del Marketplace
  if (item.type === 'marketplace_product') {
    const product = item.data;
    const images = product.images as string[] || [];
    const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
    const discountPercent = hasDiscount 
      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
      : 0;

    return (
      <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="px-4 py-2 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-b flex items-center justify-between">
          <span className="text-xs font-medium flex items-center gap-1">
            <ShoppingCart className="h-3 w-3" />
            Marketplace Pro
          </span>
          {product.featured && (
            <Badge variant="default" className="text-xs">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Destacado
            </Badge>
          )}
        </div>

        {images[0] && (
          <div className="relative">
            <img
              src={images[0]}
              alt={product.title}
              className="w-full h-64 object-cover"
            />
            {hasDiscount && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                -{discountPercent}%
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {product.views_count || 0} vistas
            </div>
          </div>
        )}

        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            {product.marketplace_categories && (
              <Badge variant="outline" className="capitalize">
                {product.marketplace_categories.icon} {product.marketplace_categories.name}
              </Badge>
            )}
            <div className="flex items-center gap-1 text-sm text-yellow-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-medium">{product.rating?.toFixed(1) || '0.0'}</span>
              <span className="text-muted-foreground">({product.reviews_count || 0})</span>
            </div>
          </div>
          
          <h3 className="text-xl font-bold mb-2">{product.title}</h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{product.description}</p>

          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  ${product.compare_at_price?.toLocaleString()}
                </span>
              )}
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">
                  ${product.price.toLocaleString()}
                </span>
                {hasDiscount && (
                  <Badge variant="destructive" className="text-xs">
                    Oferta
                  </Badge>
                )}
              </div>
            </div>
            {product.stock_quantity !== undefined && (
              <div className="text-sm">
                <span className={product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                  {product.stock_quantity > 0 ? `${product.stock_quantity} disponibles` : 'Agotado'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>{product.sales_count || 0} vendidos</span>
            <Heart className="h-3 w-3 ml-2" />
            <span>{product.favorites_count || 0} favoritos</span>
          </div>

          <div className="flex gap-2">
            <Button 
              className="flex-1"
              onClick={() => {
                handleAction('view_product');
                navigate('/client-dashboard');
                toast.success('Abriendo producto en Marketplace');
              }}
            >
              Ver Producto
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                handleAction('favorite');
                toast.success('Agregado a favoritos');
              }}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Tarjeta de Publicidad de Empresas
  if (item.type === 'advertisement') {
    const ad = item.data;
    const company = ad.business_profiles?.company_name || 'Empresa Verificada';

    return (
      <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-card">
        <div className="px-4 py-2 bg-primary/10 border-b border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" />
              Publicidad
            </span>
            <span className="text-xs text-muted-foreground">{company}</span>
          </div>
        </div>

        {ad.media_url && (
          <div className="relative">
            <img
              src={ad.media_url}
              alt={ad.title}
              className="w-full h-56 object-cover"
            />
            {ad.category && (
              <div className="absolute top-2 left-2">
                <Badge variant="default" className="capitalize">
                  {ad.category}
                </Badge>
              </div>
            )}
          </div>
        )}

        <div className="p-6">
          <h3 className="text-xl font-bold mb-2">{ad.title}</h3>
          <p className="text-muted-foreground text-sm mb-4">{ad.description}</p>

          <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{ad.impressions_count || 0} impresiones</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              <span>{ad.clicks_count || 0} clics</span>
            </div>
          </div>

          <Button 
            className="w-full"
            size="lg"
            onClick={() => {
              handleAction('click');
              if (ad.cta_url) {
                if (ad.cta_url.startsWith('http')) {
                  window.open(ad.cta_url, '_blank');
                } else {
                  navigate(ad.cta_url);
                }
              }
            }}
          >
            {ad.cta_text || 'Más información'}
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  // Tarjeta de Solicitud de Servicio (Mejorada visualmente)
  if (item.type === 'service_request') {
    const request = item.data;
    const profile = request.profiles;

    return (
      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary overflow-hidden">
        {/* Header con avatar del cliente */}
        <div className="p-4 bg-gradient-to-r from-primary/5 to-transparent border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {profile?.full_name?.[0] || 'C'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-semibold">{profile?.full_name || 'Cliente'}</h4>
              <p className="text-xs text-muted-foreground">
                busca un profesional • Hace {Math.floor((Date.now() - new Date(request.created_at).getTime()) / (1000 * 60 * 60))}h
              </p>
            </div>
            <Badge variant="secondary">Nueva solicitud</Badge>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="capitalize">
              {request.category}
            </Badge>
            {request.budget_range && (
              <Badge variant="default" className="gap-1">
                💰 {request.budget_range}
              </Badge>
            )}
          </div>
          
          <h3 className="text-xl font-bold mb-2">{request.title}</h3>
          <p className="text-muted-foreground mb-4">{request.description}</p>

          <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-muted-foreground">
            {profile?.city && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{profile.city}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-primary" />
              <span>{new Date(request.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Acciones sociales */}
          <div className="flex items-center gap-4 pt-4 mb-4 border-t">
            <button
              onClick={handleLike}
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <Heart className={`h-5 w-5 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{likes}</span>
            </button>
            <button
              onClick={() => handleAction('comment')}
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Comentar</span>
            </button>
            <button
              onClick={() => {
                handleAction('share');
                toast.success('Enlace copiado');
              }}
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors ml-auto"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          <Button 
            className="w-full" 
            size="lg"
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

  // Tarjeta de Maestro Disponible (Mejorada visualmente)
  if (item.type === 'available_master') {
    const master = item.data;
    const profile = master.profiles;

    return (
      <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* Banner superior */}
        <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20" />
        
        <div className="p-6 -mt-12">
          <div className="flex items-start gap-4 mb-4">
            <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/50 text-primary-foreground text-2xl">
                {master.business_name?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 pt-8">
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
            </div>
          </div>

          {master.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
              {master.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm mb-4">
            {profile?.city && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{profile.city}</span>
              </div>
            )}
            {master.hourly_rate && (
              <div className="font-medium text-primary text-lg">
                ${master.hourly_rate}/hora
              </div>
            )}
          </div>

          {/* Acciones sociales */}
          <div className="flex items-center gap-4 pt-4 mb-4 border-t">
            <button
              onClick={handleLike}
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <Heart className={`h-5 w-5 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{likes}</span>
            </button>
            <button
              onClick={() => handleAction('comment')}
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Comentar</span>
            </button>
            <button
              onClick={() => {
                handleAction('share');
                toast.success('Enlace copiado');
              }}
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors ml-auto"
            >
              <Share2 className="h-5 w-5" />
            </button>
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

  // Tarjeta de Servicio (Mejorada visualmente)
  if (item.type === 'service') {
    const service = item.data;
    const master = service.masters;
    const profile = master?.profiles;

    return (
      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-secondary overflow-hidden">
        {/* Header con info del maestro */}
        <div className="p-4 bg-gradient-to-r from-secondary/5 to-transparent border-b">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 ring-2 ring-secondary/30">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  {master?.business_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold">{master?.business_name}</h4>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    <span>{master?.rating?.toFixed(1)}</span>
                  </div>
                  {master?.is_verified && (
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                  )}
                </div>
              </div>
            </div>
            <Badge variant="outline" className="capitalize">
              {service.category}
            </Badge>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-bold mb-2">{service.title}</h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{service.description}</p>

          <div className="flex items-center justify-between mb-4 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {service.duration_minutes && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{service.duration_minutes} min</span>
                </div>
              )}
              {profile?.city && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{profile.city}</span>
                </div>
              )}
            </div>
            <span className="text-2xl font-bold text-primary">
              ${service.price}
            </span>
          </div>

          {/* Acciones sociales */}
          <div className="flex items-center gap-4 pt-4 mb-4 border-t">
            <button
              onClick={handleLike}
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <Heart className={`h-5 w-5 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{likes}</span>
            </button>
            <button
              onClick={() => handleAction('comment')}
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Comentar</span>
            </button>
            <button
              onClick={() => {
                handleAction('share');
                toast.success('Enlace copiado');
              }}
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors ml-auto"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          <Button 
            className="w-full" 
            size="lg"
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

  // Tarjeta de Trabajo Completado (Post Social de Maestro)
  if (item.type === 'completed_work') {
    const work = item.data;
    const master = work.masters;
    const profile = master?.profiles;
    const clientProfile = work.profiles;

    return (
      <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* Header con info del maestro */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/50 text-primary-foreground">
                {master?.business_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{master?.business_name}</h4>
                {master?.is_verified && (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>completó un trabajo</span>
                {profile?.city && (
                  <>
                    <span>•</span>
                    <MapPin className="h-3 w-3" />
                    <span>{profile.city}</span>
                  </>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                Hace {Math.floor((Date.now() - new Date(work.created_at).getTime()) / (1000 * 60 * 60))}h
              </span>
            </div>
          </div>
        </div>

        {/* Galería de fotos - Placeholder si no hay fotos reales */}
        <div className="grid grid-cols-2 gap-1">
          <div className="h-64 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
            <span className="text-muted-foreground">Antes</span>
          </div>
          <div className="h-64 bg-gradient-to-br from-secondary/10 to-primary/10 flex items-center justify-center">
            <span className="text-muted-foreground">Después</span>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="capitalize">
              {master?.category || 'Servicio'}
            </Badge>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span className="font-medium">{master?.rating?.toFixed(1)}</span>
            </div>
          </div>

          {work.notes && (
            <p className="text-sm mb-4">{work.notes}</p>
          )}

          {/* Acciones sociales */}
          <div className="flex items-center gap-6 pt-3 border-t">
            <button
              onClick={handleLike}
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <Heart className={`h-5 w-5 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{likes}</span>
            </button>
            <button
              onClick={() => handleAction('comment')}
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              <span>{Math.floor(Math.random() * 20) + 1}</span>
            </button>
            <button
              onClick={() => {
                handleAction('share');
                toast.success('Enlace copiado');
              }}
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <Share2 className="h-5 w-5" />
              <span>Compartir</span>
            </button>
          </div>
        </div>

        {/* Footer - Cliente satisfecho */}
        {clientProfile && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <ThumbsUp className="h-4 w-4 text-primary" />
              <span className="text-sm">
                <span className="font-medium">{clientProfile.full_name}</span>
                {' '}está satisfecho con este trabajo
              </span>
            </div>
          </div>
        )}
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
