import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, MapPin, User, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  scheduled_date: string;
  status: string;
  total_price: number;
  client_address: string;
  services: {
    title: string;
    duration_minutes: number;
  };
  profiles: {
    full_name: string;
    phone: string;
  } | null;
}

export const WorkCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();

    // Real-time subscription
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => fetchBookings()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services(title, duration_minutes),
          profiles(full_name, phone)
        `)
        .eq('master_id', user.id)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => 
      isSameDay(new Date(booking.scheduled_date), date)
    );
  };

  const selectedDateBookings = date ? getBookingsForDate(date) : [];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      in_progress: 'En Progreso',
      completed: 'Completado',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  if (loading) {
    return <div>Cargando calendario...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Calendario de Trabajo</h2>
        <p className="text-muted-foreground">Gestiona tus reservas y disponibilidad</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Calendario</CardTitle>
            <CardDescription>Selecciona una fecha para ver tus reservas</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={es}
              className="rounded-md border"
              modifiers={{
                booked: bookings.map(b => new Date(b.scheduled_date))
              }}
              modifiersStyles={{
                booked: { 
                  fontWeight: 'bold',
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'white'
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Bookings for Selected Date */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {date ? format(date, "d 'de' MMMM, yyyy", { locale: es }) : 'Selecciona una fecha'}
            </CardTitle>
            <CardDescription>
              {selectedDateBookings.length === 0 
                ? 'No hay reservas para este día' 
                : `${selectedDateBookings.length} reserva${selectedDateBookings.length > 1 ? 's' : ''}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedDateBookings.map((booking) => (
              <Card 
                key={booking.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedBooking(booking)}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{booking.services.title}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(booking.scheduled_date), 'HH:mm')} ({formatDuration(booking.services.duration_minutes)})
                      </p>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {getStatusLabel(booking.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <User className="h-3 w-3" />
                    {booking.profiles?.full_name || 'Cliente no disponible'}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {booking.client_address}
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Próximas Reservas</CardTitle>
          <CardDescription>Tus próximos trabajos programados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bookings
              .filter(b => new Date(b.scheduled_date) >= new Date() && b.status !== 'cancelled' && b.status !== 'completed')
              .slice(0, 5)
              .map((booking) => (
                <Card 
                  key={booking.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedBooking(booking)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{booking.services.title}</p>
                          <Badge className={getStatusColor(booking.status)}>
                            {getStatusLabel(booking.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {format(new Date(booking.scheduled_date), "d MMM yyyy 'a las' HH:mm", { locale: es })}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {booking.profiles?.full_name || 'Cliente no disponible'} {booking.profiles?.phone ? `- ${booking.profiles.phone}` : ''}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {booking.client_address}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">${booking.total_price}</p>
                        <p className="text-xs text-muted-foreground">{formatDuration(booking.services.duration_minutes)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedBooking?.services.title}</DialogTitle>
            <DialogDescription>
              Detalles de la reserva
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Estado</p>
                <Badge className={getStatusColor(selectedBooking.status)}>
                  {getStatusLabel(selectedBooking.status)}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Fecha y Hora</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(selectedBooking.scheduled_date), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Duración</p>
                <p className="text-sm text-muted-foreground">
                  {formatDuration(selectedBooking.services.duration_minutes)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Cliente</p>
                <p className="text-sm text-muted-foreground">{selectedBooking.profiles?.full_name || 'Cliente no disponible'}</p>
                {selectedBooking.profiles?.phone && (
                  <p className="text-sm text-muted-foreground">{selectedBooking.profiles.phone}</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium">Dirección</p>
                <p className="text-sm text-muted-foreground">{selectedBooking.client_address}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Precio</p>
                <p className="text-2xl font-bold text-primary">${selectedBooking.total_price}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedBooking(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
