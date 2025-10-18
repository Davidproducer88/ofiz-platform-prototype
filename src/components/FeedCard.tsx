import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  Eye,
  Star,
  Clock,
  TrendingUp,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface FeedCardProps {
  item: {
    id: string;
    type: 'post' | 'service' | 'sponsored' | 'master_recommendation';
    data: any;
  };
  onInteraction: (targetId: string, targetType: string, interactionType: string, category?: string) => void;
  compact?: boolean;
}

export const FeedCard = ({ item, onInteraction, compact = false }: FeedCardProps) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);
    onInteraction(item.id, item.type, 'like', item.data.category);
    toast.success(liked ? 'Me gusta eliminado' : '¡Te gusta esta publicación!');
  };

  const handleSave = () => {
    setSaved(!saved);
    onInteraction(item.id, item.type, 'save', item.data.category);
    toast.success(saved ? 'Guardado eliminado' : 'Guardado en tus favoritos');
  };

  const handleShare = () => {
    onInteraction(item.id, item.type, 'share', item.data.category);
    navigator.clipboard.writeText(window.location.href);
    toast.success('Enlace copiado al portapapeles');
  };

  const handleClick = () => {
    onInteraction(item.id, item.type, 'click', item.data.category);
  };

  // Tarjeta de Post
  if (item.type === 'post') {
    const post = item.data;
    const master = post.master;

    return (
      <Card className={`group hover:shadow-xl transition-all duration-300 overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm ${compact ? 'text-sm' : ''}`}>
        {/* Header con info del master */}
        <div className={`${compact ? 'p-2' : 'p-3 sm:p-4'} flex items-center gap-${compact ? '2' : '3'}`}>
          <Avatar className={`${compact ? 'h-8 w-8' : 'h-12 w-12'} ring-2 ring-primary/20`}>
            <AvatarImage src={master?.profiles?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/50 text-primary-foreground">
              {master?.profiles?.full_name?.[0] || master?.business_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold text-foreground truncate ${compact ? 'text-sm' : ''}`}>{master?.business_name}</h3>
              {master?.is_verified && !compact && (
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  Verificado
                </Badge>
              )}
            </div>
            <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-xs'} text-muted-foreground`}>
              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
              {master?.rating?.toFixed(1)} ({master?.total_reviews})
            </div>
          </div>
          {!compact && (
            <Badge variant="outline" className="capitalize">
              {post.type}
            </Badge>
          )}
        </div>

        {/* Contenido del post */}
        <div className={`${compact ? 'px-2 pb-2' : 'px-3 sm:px-4 pb-3'}`}>
          <h4 className={`font-bold ${compact ? 'text-sm mb-1' : 'text-base sm:text-lg mb-2'} text-foreground truncate`}>{post.title}</h4>
          <p className={`${compact ? 'text-xs line-clamp-2' : 'text-sm sm:text-base line-clamp-3'} text-muted-foreground`}>{post.content}</p>
          {post.category && (
            <Badge variant="secondary" className="mt-3 capitalize">
              {post.category}
            </Badge>
          )}
        </div>

        {/* Media (si existe) */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div className={compact ? 'px-2 pb-2' : 'px-3 sm:px-4 pb-4'}>
            <div className={`grid ${compact ? 'grid-cols-2 gap-1' : 'grid-cols-2 gap-2'}`}>
              {post.media_urls.slice(0, compact ? 2 : 4).map((url: string, idx: number) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Post media ${idx + 1}`}
                  className={`w-full ${compact ? 'h-24' : 'h-32 sm:h-48'} object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer`}
                  onClick={handleClick}
                />
              ))}
            </div>
          </div>
        )}

        {/* Stats y acciones */}
        <div className={`${compact ? 'px-2 py-2' : 'px-3 sm:px-4 py-3'} border-t border-border/50 bg-muted/20`}>
          <div className={`flex items-center gap-${compact ? '2' : '4'} ${compact ? 'text-xs' : 'text-sm'} text-muted-foreground ${compact ? 'mb-2' : 'mb-3'}`}>
            <span className="flex items-center gap-1">
              <Eye className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
              {post.views_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Heart className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
              {post.likes_count || 0}
            </span>
            {!compact && (
              <span className="flex items-center gap-1 ml-auto">
                <TrendingUp className="h-4 w-4" />
                {post.engagement_score?.toFixed(1) || 0}
              </span>
            )}
          </div>
          <div className={`flex items-center ${compact ? 'gap-1' : 'gap-2'}`}>
            <Button
              variant={liked ? "default" : "ghost"}
              size={compact ? "icon" : "sm"}
              onClick={handleLike}
              className={compact ? 'h-7 w-7' : 'flex-1'}
            >
              <Heart className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} ${liked ? 'fill-current' : ''} ${isAnimating ? 'animate-heart' : ''}`} />
              {!compact && 'Me gusta'}
            </Button>
            <Button variant="ghost" size={compact ? "icon" : "sm"} onClick={() => navigate(`/search-masters`)} className={compact ? 'h-7 w-7' : ''}>
              <MessageCircle className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
            </Button>
            <Button variant="ghost" size={compact ? "icon" : "sm"} onClick={handleShare} className={compact ? 'h-7 w-7' : ''}>
              <Share2 className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
            </Button>
            <Button
              variant={saved ? "default" : "ghost"}
              size={compact ? "icon" : "sm"}
              onClick={handleSave}
              className={compact ? 'h-7 w-7' : ''}
            >
              <Bookmark className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} ${saved ? 'fill-current' : ''}`} />
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

    return (
      <Card className={`group hover:shadow-xl transition-all duration-300 overflow-hidden border-primary/20 bg-gradient-to-br from-card to-primary/5 ${compact ? 'text-sm' : ''}`}>
        <div className={compact ? 'p-2' : 'p-4'}>
          <div className={`flex items-center ${compact ? 'gap-2 mb-2' : 'gap-3 mb-4'}`}>
            <Avatar className={`${compact ? 'h-8 w-8' : 'h-10 w-10'} ring-2 ring-primary/30`}>
              <AvatarImage src={master?.profiles?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {master?.business_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold ${compact ? 'text-xs' : 'text-sm'} text-foreground truncate`}>{master?.business_name}</h4>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                {master?.rating?.toFixed(1)}
              </div>
            </div>
            {!compact && (
              <Badge className="bg-primary/20 text-primary border-primary/30">
                Servicio
              </Badge>
            )}
          </div>

          <h3 className={`font-bold ${compact ? 'text-sm mb-1' : 'text-xl mb-2'} text-foreground line-clamp-1`}>{service.title}</h3>
          <p className={`text-muted-foreground ${compact ? 'text-xs mb-2 line-clamp-1' : 'text-sm mb-4 line-clamp-2'}`}>{service.description}</p>

          <div className={`flex items-center justify-between ${compact ? 'mb-2' : 'mb-4'}`}>
            <div className={`flex items-center ${compact ? 'gap-2' : 'gap-4'} ${compact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
              {service.duration_minutes && (
                <span className="flex items-center gap-1">
                  <Clock className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
                  {service.duration_minutes} min
                </span>
              )}
              {!compact && (
                <Badge variant="secondary" className="capitalize">
                  {service.category}
                </Badge>
              )}
            </div>
            <span className={`${compact ? 'text-lg' : 'text-2xl'} font-bold text-primary`}>
              ${service.price}
            </span>
          </div>

          <Button 
            className="w-full" 
            size={compact ? 'sm' : 'default'}
            onClick={() => {
              handleClick();
              navigate('/search-masters');
            }}
          >
            {compact ? 'Ver' : 'Ver servicio'}
            <ExternalLink className={`ml-2 ${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </Button>
        </div>
      </Card>
    );
  }

  // Tarjeta de Contenido Patrocinado
  if (item.type === 'sponsored') {
    const sponsored = item.data;

    return (
      <Card className={`group hover:shadow-xl transition-all duration-300 overflow-hidden border-accent/50 bg-gradient-to-br from-accent/10 to-accent/5 ${compact ? 'text-sm' : ''}`}>
        <div className={`${compact ? 'px-2 py-1' : 'px-4 py-2'} bg-accent/20 border-b border-accent/30`}>
          <span className={`${compact ? 'text-xs' : 'text-xs'} font-medium text-accent-foreground flex items-center gap-1`}>
            <Sparkles className="h-3 w-3" />
            {compact ? 'Patrocinado' : 'Contenido patrocinado'}
          </span>
        </div>

        {sponsored.media_url && (
          <img
            src={sponsored.media_url}
            alt={sponsored.title}
            className={`w-full ${compact ? 'h-32' : 'h-48'} object-cover cursor-pointer hover:opacity-90 transition-opacity`}
            onClick={handleClick}
          />
        )}

        <div className={compact ? 'p-2' : 'p-4'}>
          <h3 className={`font-bold ${compact ? 'text-sm mb-1' : 'text-lg mb-2'} text-foreground line-clamp-1`}>{sponsored.title}</h3>
          {sponsored.description && (
            <p className={`text-muted-foreground ${compact ? 'text-xs mb-2 line-clamp-2' : 'text-sm mb-3 line-clamp-2'}`}>{sponsored.description}</p>
          )}

          <Button 
            className="w-full" 
            variant="secondary"
            size={compact ? 'sm' : 'default'}
            onClick={() => {
              handleClick();
              if (sponsored.cta_url) {
                window.open(sponsored.cta_url, '_blank');
              }
            }}
          >
            {sponsored.cta_text || (compact ? 'Ver más' : 'Más información')}
            <ExternalLink className={`ml-2 ${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </Button>
        </div>
      </Card>
    );
  }

  // Tarjeta de Recomendación de Master
  if (item.type === 'master_recommendation') {
    const master = item.data;

    return (
      <Card className={`group hover:shadow-xl transition-all duration-300 overflow-hidden border-secondary/30 bg-gradient-to-br from-card to-secondary/10 ${compact ? 'text-sm' : ''}`}>
        <div className={compact ? 'p-2' : 'p-4'}>
          <div className={`flex items-center ${compact ? 'gap-1 mb-2' : 'gap-2 mb-4'}`}>
            <Sparkles className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} text-secondary`} />
            <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-secondary`}>
              {compact ? 'Recomendado' : 'Recomendado para ti'}
            </span>
          </div>

          <div className={`flex items-start ${compact ? 'gap-2' : 'gap-4'}`}>
            <Avatar className={`${compact ? 'h-12 w-12 ring-2' : 'h-16 w-16 ring-4'} ring-secondary/30`}>
              <AvatarImage src={master?.profiles?.avatar_url} />
              <AvatarFallback className={`bg-secondary text-secondary-foreground ${compact ? 'text-base' : 'text-xl'}`}>
                {master?.business_name?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className={`flex items-center gap-2 ${compact ? 'mb-1' : 'mb-1'}`}>
                <h3 className={`font-bold ${compact ? 'text-sm' : 'text-lg'} text-foreground truncate`}>{master.business_name}</h3>
                {master.is_verified && !compact && (
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                  </Badge>
                )}
              </div>

              <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'} ${compact ? 'text-xs' : 'text-sm'} text-muted-foreground ${compact ? 'mb-1' : 'mb-2'}`}>
                <span className="flex items-center gap-1">
                  <Star className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} fill-yellow-500 text-yellow-500`} />
                  {master.rating?.toFixed(1)} ({master.total_reviews})
                </span>
                {master.experience_years > 0 && !compact && (
                  <span>{master.experience_years} años exp.</span>
                )}
              </div>

              {master.description && !compact && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {master.description}
                </p>
              )}

              <Button 
                variant="secondary"
                className="w-full"
                size={compact ? 'sm' : 'default'}
                onClick={() => {
                  handleClick();
                  navigate('/search-masters');
                }}
              >
                Ver perfil
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return null;
};
