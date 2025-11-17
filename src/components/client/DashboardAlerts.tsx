import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X, 
  Calendar,
  MessageSquare,
  DollarSign
} from 'lucide-react';

interface DashboardAlert {
  id: string;
  type: 'warning' | 'success' | 'info';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const DashboardAlerts = ({ clientId }: { clientId: string }) => {
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  useEffect(() => {
    loadAlerts();
  }, [clientId]);

  const loadAlerts = async () => {
    const newAlerts: DashboardAlert[] = [];

    // Check for pending bookings
    const { data: pendingBookings } = await supabase
      .from('bookings')
      .select('id, scheduled_date, services(title)')
      .eq('client_id', clientId)
      .eq('status', 'pending')
      .limit(1);

    if (pendingBookings && pendingBookings.length > 0) {
      newAlerts.push({
        id: 'pending-bookings',
        type: 'info',
        title: 'Reservas pendientes',
        message: `Tienes ${pendingBookings.length} reserva(s) esperando confirmación del profesional`,
        action: {
          label: 'Ver reservas',
          onClick: () => {}
        }
      });
    }

    // Check for completed bookings without confirmation
    const { data: completedBookings } = await supabase
      .from('bookings')
      .select('id, services(title)')
      .eq('client_id', clientId)
      .eq('status', 'completed')
      .is('client_confirmed_at', null)
      .limit(1);

    if (completedBookings && completedBookings.length > 0) {
      newAlerts.push({
        id: 'confirm-completion',
        type: 'warning',
        title: 'Confirma trabajos completados',
        message: `Tienes ${completedBookings.length} trabajo(s) completado(s) esperando tu confirmación para liberar el pago`,
        action: {
          label: 'Revisar',
          onClick: () => {}
        }
      });
    }

    // Check for escrow payments ready to release
    const { data: escrowPayments } = await supabase
      .from('payments')
      .select(`
        id,
        bookings!inner(
          status,
          client_confirmed_at
        )
      `)
      .eq('client_id', clientId)
      .eq('status', 'approved')
      .is('escrow_released_at', null)
      .eq('bookings.status', 'completed')
      .not('bookings.client_confirmed_at', 'is', null);

    if (escrowPayments && escrowPayments.length > 0) {
      newAlerts.push({
        id: 'release-escrow',
        type: 'success',
        title: 'Pagos listos para liberar',
        message: `Tienes ${escrowPayments.length} pago(s) en custodia listo(s) para liberar al profesional`,
        action: {
          label: 'Liberar ahora',
          onClick: () => {}
        }
      });
    }

    // Check for unread messages
    const { data: unreadMessages } = await supabase
      .from('messages')
      .select(`
        id,
        conversations!inner(client_id)
      `)
      .eq('conversations.client_id', clientId)
      .eq('read', false)
      .limit(5);

    if (unreadMessages && unreadMessages.length > 0) {
      newAlerts.push({
        id: 'unread-messages',
        type: 'info',
        title: 'Mensajes sin leer',
        message: `Tienes ${unreadMessages.length} mensaje(s) nuevo(s) de profesionales`,
        action: {
          label: 'Ver mensajes',
          onClick: () => {}
        }
      });
    }

    setAlerts(newAlerts.filter(alert => !dismissedAlerts.includes(alert.id)));
  };

  const dismissAlert = (id: string) => {
    setDismissedAlerts([...dismissedAlerts, id]);
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getAlertClass = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-100';
      case 'success':
        return 'border-green-200 bg-green-50/50 dark:bg-green-950/20 text-green-900 dark:text-green-100';
      default:
        return 'border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-100';
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Alert key={alert.id} className={getAlertClass(alert.type)}>
          {getIcon(alert.type)}
          <div className="flex-1">
            <AlertTitle className="mb-1">{alert.title}</AlertTitle>
            <AlertDescription className="text-sm">
              {alert.message}
            </AlertDescription>
          </div>
          <div className="flex items-center gap-2">
            {alert.action && (
              <Button
                size="sm"
                variant="outline"
                onClick={alert.action.onClick}
                className="shrink-0"
              >
                {alert.action.label}
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => dismissAlert(alert.id)}
              className="h-6 w-6 shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      ))}
    </div>
  );
};
