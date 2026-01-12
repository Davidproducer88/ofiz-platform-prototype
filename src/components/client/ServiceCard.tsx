import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Heart } from 'lucide-react';

interface ServiceCardProps {
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

export function ServiceCard({ service, isFavorite, onBook, onToggleFavorite }: ServiceCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
              {service.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {service.description}
            </p>
          </div>
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className="ml-2"
            >
              <Heart 
                className={`h-5 w-5 transition-colors ${
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                }`} 
              />
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {service.masters?.business_name || 'Profesional'}
            </span>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">
                {(service.masters?.rating ?? 0).toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">
                ({service.masters?.total_reviews ?? 0})
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {service.category}
              </Badge>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {service.duration_minutes} min
              </div>
            </div>
            <span className="text-xl font-bold text-primary">
              $U {service.price.toLocaleString()}
            </span>
          </div>

          <Button 
            className="w-full" 
            onClick={onBook}
          >
            Reservar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
