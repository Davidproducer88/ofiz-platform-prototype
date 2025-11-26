import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileServiceCardProps {
  service: {
    id: string;
    title: string;
    description: string;
    price: number;
    duration_minutes: number;
    category: string;
    masters: {
      business_name: string;
      rating: number;
      total_reviews: number;
    };
  };
  isFavorite?: boolean;
  onBook: () => void;
  onToggleFavorite?: () => void;
}

export function MobileServiceCard({ 
  service, 
  isFavorite, 
  onBook, 
  onToggleFavorite 
}: MobileServiceCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        {/* Header con título y favorito */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight mb-1 line-clamp-2">
              {service.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {service.description}
            </p>
          </div>
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className="flex-shrink-0 p-1.5 -mr-1.5 -mt-1.5"
              aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
            >
              <Heart 
                className={cn(
                  "h-5 w-5 transition-colors",
                  isFavorite 
                    ? "fill-red-500 text-red-500" 
                    : "text-muted-foreground"
                )} 
              />
            </button>
          )}
        </div>

        {/* Info del profesional */}
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="text-muted-foreground truncate flex-1 mr-2">
            {service.masters.business_name}
          </span>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{service.masters.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({service.masters.total_reviews})</span>
          </div>
        </div>

        {/* Categoría, duración y precio */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs py-0.5">
              {service.category}
            </Badge>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {service.duration_minutes}min
            </div>
          </div>
          <span className="text-lg font-bold text-primary">
            ${service.price.toLocaleString()}
          </span>
        </div>

        {/* Botón de acción */}
        <Button 
          className="w-full h-11 text-base font-semibold" 
          onClick={onBook}
        >
          Reservar servicio
        </Button>
      </CardContent>
    </Card>
  );
}
