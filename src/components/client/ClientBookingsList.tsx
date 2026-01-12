import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Star } from 'lucide-react';
import { BookingActions } from '@/components/BookingActions';

interface Booking {
  id: string;
  service_id: string | null;
  scheduled_date: string;
  status: string;
  total_price: number;
  client_address: string;
  client_id: string;
  master_id: string;
  client_confirmed_at?: string | null;
  notes?: string;
  services: {
    title: string;
    category: string;
  } | null;
  masters: {
    id: string;
    business_name: string;
    rating: number;
  };
}

interface ClientBookingsListProps {
  bookings: Booking[];
  onReview: (booking: Booking) => void;
  onReschedule: (booking: Booking) => void;
  onCancel: (bookingId: string) => Promise<void>;
}

const statusConfig = {
  'pending': { label: 'Pendiente', variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  'confirmed': { label: 'Confirmado', variant: 'default' as const, className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  'in_progress': { label: 'En Progreso', variant: 'default' as const, className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  'completed': { label: 'Completado', variant: 'default' as const, className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  'cancelled': { label: 'Cancelado', variant: 'destructive' as const, className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
};

export function ClientBookingsList({ bookings, onReview, onReschedule, onCancel }: ClientBookingsListProps) {
  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">No tienes reservas aún</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const status = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending;
        
        return (
          <Card key={booking.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{booking.services?.title || 'Encargo sin servicio específico'}</h3>
                    <Badge className={status.className}>
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {booking.masters?.business_name || 'Profesional'}
                    <span className="inline-flex items-center ml-2">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                      {(booking.masters?.rating ?? 0).toFixed(1)}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    $U {booking.total_price.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 mb-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(booking.scheduled_date).toLocaleDateString('es-UY', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                <div className="flex items-start text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-1">{booking.client_address}</span>
                </div>
              </div>

              <BookingActions
                booking={{
                  id: booking.id,
                  status: booking.status,
                  client_id: booking.client_id,
                  master_id: booking.master_id,
                  service_id: booking.service_id || '',
                  scheduled_date: booking.scheduled_date,
                  total_price: booking.total_price,
                  client_confirmed_at: booking.client_confirmed_at,
                  services: booking.services ? {
                    title: booking.services.title,
                  } : undefined,
                }}
                userType="client"
                otherUserName={booking.masters?.business_name || 'Profesional'}
                onReview={() => onReview(booking)}
                onReschedule={() => onReschedule(booking)}
                onUpdate={async () => {}}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
