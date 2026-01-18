import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { format, isSameDay, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isBefore } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Clock, 
  MapPin, 
  User, 
  Calendar as CalendarIcon, 
  Settings2,
  Plus,
  Save,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Booking {
  id: string;
  scheduled_date: string;
  status: string;
  total_price: number;
  client_address: string;
  services: {
    title: string;
    duration_minutes: number;
    category: string;
  } | null;
  profiles: {
    full_name: string;
    phone: string;
  } | null;
}

interface AvailabilitySlot {
  day: number; // 0-6 (domingo-sábado)
  start: string; // "09:00"
  end: string; // "18:00"
  enabled: boolean;
}

const defaultAvailability: AvailabilitySlot[] = [
  { day: 1, start: "09:00", end: "18:00", enabled: true },
  { day: 2, start: "09:00", end: "18:00", enabled: true },
  { day: 3, start: "09:00", end: "18:00", enabled: true },
  { day: 4, start: "09:00", end: "18:00", enabled: true },
  { day: 5, start: "09:00", end: "18:00", enabled: true },
  { day: 6, start: "09:00", end: "14:00", enabled: false },
  { day: 0, start: "00:00", end: "00:00", enabled: false },
];

const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

export const EnhancedWorkCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(defaultAvailability);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [activeTab, setActiveTab] = useState("calendar");

  useEffect(() => {
    fetchBookings();
    fetchAvailability();

    const channel = supabase
      .channel('bookings-changes-calendar')
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
          services(title, duration_minutes, category),
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

  const fetchAvailability = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('masters')
        .select('availability_schedule')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data?.availability_schedule && Array.isArray(data.availability_schedule)) {
        setAvailability(data.availability_schedule as unknown as AvailabilitySlot[]);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const saveAvailability = async () => {
    setSavingAvailability(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('masters')
        .update({ availability_schedule: availability as unknown as any })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Disponibilidad guardada",
        description: "Tu horario ha sido actualizado correctamente",
      });
      setShowAvailabilityDialog(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingAvailability(false);
    }
  };

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => 
      isSameDay(new Date(booking.scheduled_date), date)
    );
  };

  const selectedDateBookings = date ? getBookingsForDate(date) : [];

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: any }> = {
      pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: AlertCircle },
      confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: CheckCircle },
      in_progress: { label: 'En Progreso', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: Clock },
      pending_review: { label: 'Revisión', color: 'bg-orange-100 text-orange-800 border-orange-300', icon: AlertCircle },
      completed: { label: 'Completado', color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle },
      cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle }
    };
    return configs[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: Clock };
  };

  const formatDuration = (minutes: number | undefined) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  // Weekly view data
  const weekStart = date ? startOfWeek(date, { locale: es }) : startOfWeek(new Date(), { locale: es });
  const weekEnd = endOfWeek(date || new Date(), { locale: es });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Stats
  const upcomingBookings = bookings.filter(b => 
    new Date(b.scheduled_date) >= new Date() && 
    !['cancelled', 'completed'].includes(b.status)
  );
  const thisWeekBookings = bookings.filter(b => {
    const bookingDate = new Date(b.scheduled_date);
    return bookingDate >= weekStart && bookingDate <= weekEnd && b.status !== 'cancelled';
  });
  const thisWeekEarnings = thisWeekBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" />
            Calendario de Trabajo
          </h2>
          <p className="text-muted-foreground">Gestiona tus reservas y disponibilidad</p>
        </div>
        <Button onClick={() => setShowAvailabilityDialog(true)} variant="outline">
          <Settings2 className="h-4 w-4 mr-2" />
          Configurar Horarios
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Próximos trabajos</p>
                <p className="text-2xl font-bold">{upcomingBookings.length}</p>
              </div>
              <CalendarIcon className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Esta semana</p>
                <p className="text-2xl font-bold">{thisWeekBookings.length}</p>
              </div>
              <Clock className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Ingresos semana</p>
                <p className="text-2xl font-bold">${thisWeekEarnings.toLocaleString()}</p>
              </div>
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-xs">
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
          <TabsTrigger value="week">Vista Semanal</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Calendar */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Selecciona una fecha</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={es}
                  className="rounded-md border"
                  modifiers={{
                    booked: bookings
                      .filter(b => b.status !== 'cancelled')
                      .map(b => new Date(b.scheduled_date)),
                    today: [new Date()],
                  }}
                  modifiersStyles={{
                    booked: { 
                      fontWeight: 'bold',
                      backgroundColor: 'hsl(var(--primary) / 0.1)',
                      color: 'hsl(var(--primary))',
                    },
                    today: {
                      border: '2px solid hsl(var(--primary))',
                    }
                  }}
                />
              </CardContent>
            </Card>

            {/* Selected Date Bookings */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  {date ? format(date, "EEEE, d 'de' MMMM", { locale: es }) : 'Selecciona una fecha'}
                </CardTitle>
                <CardDescription>
                  {selectedDateBookings.length === 0 
                    ? 'No hay reservas para este día' 
                    : `${selectedDateBookings.length} reserva${selectedDateBookings.length > 1 ? 's' : ''}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 max-h-80 overflow-y-auto">
                <AnimatePresence>
                  {selectedDateBookings.map((booking, index) => {
                    const statusConfig = getStatusConfig(booking.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card 
                          className="cursor-pointer hover:shadow-md transition-all border-l-4"
                          style={{ borderLeftColor: booking.status === 'confirmed' ? 'hsl(var(--primary))' : undefined }}
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold">{booking.services?.title || 'Servicio'}</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {format(new Date(booking.scheduled_date), 'HH:mm')}
                                  {booking.services?.duration_minutes && ` (${formatDuration(booking.services.duration_minutes)})`}
                                </p>
                              </div>
                              <Badge className={cn("gap-1", statusConfig.color)}>
                                <StatusIcon className="h-3 w-3" />
                                {statusConfig.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <User className="h-3 w-3" />
                              {booking.profiles?.full_name || 'Cliente'}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {booking.client_address?.substring(0, 30)}...
                              </span>
                              <span className="font-bold text-primary">${booking.total_price?.toLocaleString()}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="week" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Semana del {format(weekStart, "d 'de' MMMM", { locale: es })} al {format(weekEnd, "d 'de' MMMM", { locale: es })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => {
                  const dayBookings = getBookingsForDate(day);
                  const isPast = isBefore(day, new Date()) && !isToday(day);
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "border rounded-lg p-2 min-h-32 cursor-pointer transition-all hover:border-primary",
                        isToday(day) && "ring-2 ring-primary",
                        isPast && "opacity-60"
                      )}
                      onClick={() => setDate(day)}
                    >
                      <div className="text-center mb-2">
                        <p className="text-xs text-muted-foreground">{format(day, 'EEE', { locale: es })}</p>
                        <p className={cn(
                          "text-lg font-semibold",
                          isToday(day) && "text-primary"
                        )}>
                          {format(day, 'd')}
                        </p>
                      </div>
                      <div className="space-y-1">
                        {dayBookings.slice(0, 3).map((booking) => (
                          <div
                            key={booking.id}
                            className={cn(
                              "text-xs p-1 rounded truncate",
                              getStatusConfig(booking.status).color
                            )}
                          >
                            {format(new Date(booking.scheduled_date), 'HH:mm')}
                          </div>
                        ))}
                        {dayBookings.length > 3 && (
                          <Badge variant="secondary" className="text-xs w-full justify-center">
                            +{dayBookings.length - 3} más
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upcoming Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Próximos Trabajos
          </CardTitle>
          <CardDescription>Tus próximos 5 trabajos programados</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>No tienes trabajos programados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.slice(0, 5).map((booking) => {
                const statusConfig = getStatusConfig(booking.status);
                return (
                  <Card 
                    key={booking.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{booking.services?.title || 'Servicio'}</p>
                            <Badge className={statusConfig.color}>
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {format(new Date(booking.scheduled_date), "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es })}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {booking.profiles?.full_name || 'Cliente'} 
                            {booking.profiles?.phone && ` - ${booking.profiles.phone}`}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {booking.client_address}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">${booking.total_price?.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDuration(booking.services?.duration_minutes)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedBooking?.services?.title || 'Servicio'}</DialogTitle>
            <DialogDescription>Detalles de la reserva</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estado</span>
                <Badge className={getStatusConfig(selectedBooking.status).color}>
                  {getStatusConfig(selectedBooking.status).label}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Fecha y Hora</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedBooking.scheduled_date), "d MMM yyyy, HH:mm", { locale: es })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Duración</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDuration(selectedBooking.services?.duration_minutes)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Cliente</p>
                <p className="text-sm text-muted-foreground">{selectedBooking.profiles?.full_name}</p>
                {selectedBooking.profiles?.phone && (
                  <p className="text-sm text-muted-foreground">{selectedBooking.profiles.phone}</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium">Dirección</p>
                <p className="text-sm text-muted-foreground">{selectedBooking.client_address}</p>
              </div>
              <div className="bg-muted p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Precio total</p>
                <p className="text-3xl font-bold text-primary">${selectedBooking.total_price?.toLocaleString()}</p>
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

      {/* Availability Configuration Dialog */}
      <Dialog open={showAvailabilityDialog} onOpenChange={setShowAvailabilityDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Configurar Disponibilidad
            </DialogTitle>
            <DialogDescription>
              Define tu horario de trabajo semanal
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-96 overflow-y-auto py-2">
            {availability.map((slot, index) => (
              <div key={slot.day} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <Switch
                    checked={slot.enabled}
                    onCheckedChange={(checked) => {
                      const newAvailability = [...availability];
                      newAvailability[index].enabled = checked;
                      setAvailability(newAvailability);
                    }}
                  />
                  <Label className="w-24 font-medium">
                    {dayNames[slot.day]}
                  </Label>
                </div>
                
                {slot.enabled && (
                  <div className="flex items-center gap-2">
                    <Select
                      value={slot.start}
                      onValueChange={(value) => {
                        const newAvailability = [...availability];
                        newAvailability[index].start = value;
                        setAvailability(newAvailability);
                      }}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-muted-foreground">a</span>
                    <Select
                      value={slot.end}
                      onValueChange={(value) => {
                        const newAvailability = [...availability];
                        newAvailability[index].end = value;
                        setAvailability(newAvailability);
                      }}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {!slot.enabled && (
                  <span className="text-sm text-muted-foreground">No disponible</span>
                )}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAvailabilityDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={saveAvailability} disabled={savingAvailability}>
              {savingAvailability ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Horarios
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
