import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Star, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileBookingCardProps {
  booking: {
    id: string;
    service_id: string | null;
    scheduled_date: string;
    status: string;
    total_price: number;
    client_address: string;
    notes?: string;
    payment_type?: string | null;
    upfront_amount?: number | null;
    pending_amount?: number | null;
    services: {
      title: string;
      category: string;
    } | null;
    masters: {
      business_name: string;
      rating: number;
    };
  };
  onViewDetails?: () => void;
  onReview?: () => void;
  onReschedule?: () => void;
}

const statusConfig = {
  'pending': { 
    label: 'Pendiente', 
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    dotColor: 'bg-yellow-500'
  },
  'confirmed': { 
    label: 'Confirmado', 
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    dotColor: 'bg-blue-500'
  },
  'in_progress': { 
    label: 'En Progreso', 
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    dotColor: 'bg-purple-500'
  },
  'completed': { 
    label: 'Completado', 
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    dotColor: 'bg-green-500'
  },
  'cancelled': { 
    label: 'Cancelado', 
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    dotColor: 'bg-red-500'
  },
};

export function MobileBookingCard({ 
  booking, 
  onViewDetails,
  onReview,
  onReschedule 
}: MobileBookingCardProps) {
  const status = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending;
  const isPartialPayment = booking.payment_type === 'parcial';

  return (
    <Card className="overflow-hidden border-l-4" style={{ borderLeftColor: status.dotColor.replace('bg-', '') }}>
      <CardContent className="p-4">
        {/* Header: Título y estado */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-base leading-tight flex-1 line-clamp-2">
            {booking.services?.title || 'Servicio personalizado'}
          </h3>
          <Badge className={cn("text-xs px-2 py-0.5", status.className)}>
            {status.label}
          </Badge>
        </div>

        {/* Profesional */}
        <div className="flex items-center gap-2 text-sm mb-3">
          <span className="text-muted-foreground">Por:</span>
          <span className="font-medium">{booking.masters.business_name}</span>
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium">{booking.masters.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Fecha y hora */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span>
            {new Date(booking.scheduled_date).toLocaleDateString('es-UY', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* Dirección */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground mb-3">
          <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-1 flex-1">{booking.client_address}</span>
        </div>

        {/* Precio */}
        <div className="border-t border-border pt-3 mb-3">
          {isPartialPayment ? (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pagado:</span>
                <span className="font-semibold text-green-600">
                  ${booking.upfront_amount?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pendiente:</span>
                <span className="font-semibold text-orange-600">
                  ${booking.pending_amount?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-base border-t border-dashed border-border pt-1 mt-1">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-primary text-lg">
                  ${booking.total_price.toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Precio total:</span>
              <span className="text-xl font-bold text-primary">
                ${booking.total_price.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
          {onViewDetails && (
            <Button 
              variant="outline" 
              className="flex-1 h-10"
              onClick={onViewDetails}
            >
              Ver detalles
            </Button>
          )}
          {booking.status === 'completed' && onReview && (
            <Button 
              className="flex-1 h-10"
              onClick={onReview}
            >
              Dejar reseña
            </Button>
          )}
          {booking.status === 'confirmed' && onReschedule && (
            <Button 
              variant="secondary" 
              className="flex-1 h-10"
              onClick={onReschedule}
            >
              Reagendar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
