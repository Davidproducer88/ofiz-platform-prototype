import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  duration_minutes: number;
  masters: {
    business_name: string;
  };
}

interface BookingDialogProps {
  service: Service | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (bookingData: {
    serviceId: string;
    scheduledDate: Date;
    address: string;
    notes: string;
  }) => void;
  defaultAddress?: string;
}

export function BookingDialog({ 
  service, 
  open, 
  onOpenChange, 
  onConfirm,
  defaultAddress = ''
}: BookingDialogProps) {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('09:00');
  const [address, setAddress] = useState(defaultAddress);
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    if (!service || !date) return;

    const [hours, minutes] = time.split(':').map(Number);
    const scheduledDateTime = new Date(date);
    scheduledDateTime.setHours(hours, minutes, 0, 0);

    onConfirm({
      serviceId: service.id,
      scheduledDate: scheduledDateTime,
      address,
      notes
    });

    // Reset form
    setDate(undefined);
    setTime('09:00');
    setAddress(defaultAddress);
    setNotes('');
  };

  if (!service) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Confirmar Solicitud de Servicio</DialogTitle>
          <DialogDescription>
            Complete los detalles para solicitar este servicio
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Service Info */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-semibold">{service.title}</h4>
            <p className="text-sm text-muted-foreground">{service.masters.business_name}</p>
            <div className="flex justify-between items-center pt-2">
              <span className="text-2xl font-bold text-primary">
                ${service.price.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {service.duration_minutes} min
              </span>
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Fecha del Servicio</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: es }) : "Selecciona una fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label htmlFor="time">Hora del Servicio</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              min="07:00"
              max="20:00"
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Dirección del Servicio</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="address"
                placeholder="Ingresa la dirección completa"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas Adicionales (Opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Instrucciones especiales, detalles adicionales..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!date || !address}
          >
            Confirmar Solicitud
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
