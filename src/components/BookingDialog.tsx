import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
  const { profile } = useAuth();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('09:00');
  const [address, setAddress] = useState(defaultAddress);
  const [notes, setNotes] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('manual');

  useEffect(() => {
    if (profile?.id && open) {
      fetchSavedAddresses();
    }
  }, [profile?.id, open]);

  const fetchSavedAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('client_addresses')
        .select('*')
        .eq('client_id', profile?.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setSavedAddresses(data || []);

      // Auto-select default address if exists
      const defaultAddr = data?.find(a => a.is_default);
      if (defaultAddr && !address) {
        setAddress(defaultAddr.address);
        setSelectedAddressId(defaultAddr.id);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    if (addressId === 'manual') {
      setAddress(defaultAddress);
    } else {
      const selectedAddr = savedAddresses.find(a => a.id === addressId);
      if (selectedAddr) {
        setAddress(selectedAddr.address);
      }
    }
  };

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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Confirmar Solicitud de Servicio</DialogTitle>
          <DialogDescription>
            Complete los detalles para solicitar este servicio
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-y-auto flex-1">
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
            <Label>Dirección del Servicio</Label>
            {savedAddresses.length > 0 ? (
              <>
                <Select value={selectedAddressId} onValueChange={handleAddressSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una dirección" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedAddresses.map((addr) => (
                      <SelectItem key={addr.id} value={addr.id}>
                        {addr.label} - {addr.address.substring(0, 50)}...
                      </SelectItem>
                    ))}
                    <SelectItem value="manual">Ingresar dirección manualmente</SelectItem>
                  </SelectContent>
                </Select>
                {selectedAddressId === 'manual' && (
                  <div className="relative mt-2">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Ingresa la dirección completa"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ingresa la dirección completa"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
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

        <DialogFooter className="flex-shrink-0 gap-2 sm:gap-0">
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
