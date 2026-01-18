import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  MessageSquarePlus, 
  Plus, 
  X, 
  Zap,
  Clock,
  CheckCircle,
  HelpCircle,
  DollarSign
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface QuickMessagesProps {
  onSelect: (message: string) => void;
  userType: 'master' | 'client';
}

// Default quick messages by category
const DEFAULT_MESSAGES = {
  master: {
    greeting: [
      '¡Hola! Gracias por contactarme. ¿En qué puedo ayudarte?',
      '¡Buenos días! Estoy disponible para revisar tu solicitud.',
    ],
    availability: [
      'Puedo ir a revisar el trabajo mañana, ¿te parece bien?',
      'Tengo disponibilidad esta semana. ¿Qué día te conviene?',
      'Estoy ocupado hoy, pero puedo atenderte mañana.',
    ],
    pricing: [
      'Para darte un precio exacto necesito ver el trabajo primero.',
      'El precio incluye mano de obra y materiales básicos.',
      'Puedo enviarte una cotización detallada si lo deseas.',
    ],
    confirmation: [
      'Perfecto, queda confirmado el trabajo.',
      'Ya estoy en camino.',
      'He terminado el trabajo. ¿Podrías revisarlo?',
    ],
  },
  client: {
    greeting: [
      '¡Hola! Necesito un presupuesto para un trabajo.',
      'Buenos días, me interesa contratar sus servicios.',
    ],
    details: [
      '¿Podrías darme más detalles sobre el servicio?',
      '¿Qué materiales están incluidos en el precio?',
      '¿Cuánto tiempo tomará el trabajo?',
    ],
    scheduling: [
      '¿Cuándo podrías venir a hacer el trabajo?',
      'Estoy disponible por las mañanas.',
      'Prefiero en horario de tarde.',
    ],
    confirmation: [
      'De acuerdo, acepto el presupuesto.',
      'Perfecto, te espero.',
      'El trabajo quedó excelente, muchas gracias.',
    ],
  },
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  greeting: <MessageSquarePlus className="h-3 w-3" />,
  availability: <Clock className="h-3 w-3" />,
  scheduling: <Clock className="h-3 w-3" />,
  pricing: <DollarSign className="h-3 w-3" />,
  details: <HelpCircle className="h-3 w-3" />,
  confirmation: <CheckCircle className="h-3 w-3" />,
};

const CATEGORY_LABELS: Record<string, string> = {
  greeting: 'Saludos',
  availability: 'Disponibilidad',
  scheduling: 'Horarios',
  pricing: 'Precios',
  details: 'Detalles',
  confirmation: 'Confirmación',
};

export const QuickMessages = ({ onSelect, userType }: QuickMessagesProps) => {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [customMessages, setCustomMessages] = useState<Array<{ id: string; message: string; category: string }>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('greeting');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      loadCustomMessages();
    }
  }, [profile?.id]);

  const loadCustomMessages = async () => {
    if (!profile?.id) return;
    
    const { data, error } = await supabase
      .from('quick_messages')
      .select('*')
      .eq('user_id', profile.id)
      .order('sort_order');

    if (!error && data) {
      setCustomMessages(data);
    }
  };

  const handleSelect = (message: string) => {
    onSelect(message);
    setIsOpen(false);
  };

  const handleAddCustom = async () => {
    if (!newMessage.trim() || !profile?.id) return;

    setIsAdding(true);
    try {
      const { error } = await supabase
        .from('quick_messages')
        .insert({
          user_id: profile.id,
          message: newMessage.trim(),
          category: 'custom',
        });

      if (error) throw error;

      await loadCustomMessages();
      setNewMessage('');
      toast({
        title: 'Mensaje guardado',
        description: 'Tu mensaje rápido ha sido guardado.',
      });
    } catch (error) {
      console.error('Error adding quick message:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el mensaje',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await supabase
        .from('quick_messages')
        .delete()
        .eq('id', id);

      await loadCustomMessages();
    } catch (error) {
      console.error('Error deleting quick message:', error);
    }
  };

  const defaultMessages = DEFAULT_MESSAGES[userType] || DEFAULT_MESSAGES.client;
  const categories = Object.keys(defaultMessages);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          title="Mensajes rápidos"
          className="shrink-0"
        >
          <Zap className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b bg-muted/30">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Mensajes Rápidos
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            Selecciona un mensaje predefinido
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 p-2 border-b overflow-x-auto">
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              className="cursor-pointer shrink-0 gap-1"
              onClick={() => setSelectedCategory(cat)}
            >
              {CATEGORY_ICONS[cat]}
              {CATEGORY_LABELS[cat]}
            </Badge>
          ))}
        </div>

        <ScrollArea className="h-48">
          <div className="p-2 space-y-1">
            {/* Default messages for category */}
            {(defaultMessages as any)[selectedCategory]?.map((msg: string, idx: number) => (
              <Button
                key={idx}
                variant="ghost"
                className="w-full justify-start text-left h-auto py-2 px-3 text-sm font-normal whitespace-normal"
                onClick={() => handleSelect(msg)}
              >
                {msg}
              </Button>
            ))}

            {/* Custom messages */}
            {customMessages.length > 0 && (
              <>
                <div className="text-xs text-muted-foreground px-3 py-2 font-medium">
                  Tus mensajes personalizados
                </div>
                {customMessages.map((msg) => (
                  <div key={msg.id} className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      className="flex-1 justify-start text-left h-auto py-2 px-3 text-sm font-normal whitespace-normal"
                      onClick={() => handleSelect(msg.message)}
                    >
                      {msg.message}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => handleDelete(msg.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Add custom message */}
        <div className="p-2 border-t bg-muted/30">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Añadir mensaje personalizado..."
              className="text-sm h-8"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustom();
                }
              }}
            />
            <Button
              size="sm"
              className="h-8 shrink-0"
              onClick={handleAddCustom}
              disabled={!newMessage.trim() || isAdding}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
