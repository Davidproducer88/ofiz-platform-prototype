import { 
  Clock, 
  CheckCircle, 
  PlayCircle, 
  FileSearch, 
  Star,
  XCircle,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TimelineStep {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'current' | 'pending' | 'cancelled';
  timestamp?: string;
}

interface BookingStatusTimelineProps {
  booking: {
    status: string;
    created_at: string;
    client_confirmed_at?: string;
    work_started_at?: string;
    review_requested_at?: string;
    work_completed_at?: string;
  };
}

export function BookingStatusTimeline({ booking }: BookingStatusTimelineProps) {
  const getSteps = (): TimelineStep[] => {
    const statusOrder = ['pending', 'confirmed', 'in_progress', 'pending_review', 'completed'];
    const currentIndex = statusOrder.indexOf(booking.status);
    const isCancelled = booking.status === 'cancelled';

    const steps: TimelineStep[] = [
      {
        id: 'pending',
        label: 'Solicitud enviada',
        description: 'Esperando confirmación del profesional',
        icon: <Clock className="h-4 w-4" />,
        status: currentIndex >= 0 ? 'completed' : 'pending',
        timestamp: booking.created_at,
      },
      {
        id: 'confirmed',
        label: 'Confirmado',
        description: 'El profesional aceptó el encargo',
        icon: <CheckCircle className="h-4 w-4" />,
        status: currentIndex >= 1 ? 'completed' : currentIndex === 0 ? 'current' : 'pending',
        timestamp: booking.client_confirmed_at,
      },
      {
        id: 'in_progress',
        label: 'En progreso',
        description: 'El trabajo está siendo realizado',
        icon: <PlayCircle className="h-4 w-4" />,
        status: currentIndex >= 2 ? 'completed' : currentIndex === 1 ? 'current' : 'pending',
        timestamp: booking.work_started_at,
      },
      {
        id: 'pending_review',
        label: 'Revisión',
        description: 'El profesional ha terminado, pendiente de aprobación',
        icon: <FileSearch className="h-4 w-4" />,
        status: currentIndex >= 3 ? 'completed' : currentIndex === 2 ? 'current' : 'pending',
        timestamp: booking.review_requested_at,
      },
      {
        id: 'completed',
        label: 'Completado',
        description: 'Trabajo finalizado y aprobado',
        icon: <Star className="h-4 w-4" />,
        status: currentIndex >= 4 ? 'completed' : currentIndex === 3 ? 'current' : 'pending',
        timestamp: booking.work_completed_at,
      },
    ];

    if (isCancelled) {
      return steps.map(step => ({
        ...step,
        status: step.timestamp ? 'completed' : 'cancelled',
      }));
    }

    // Mark current step
    if (currentIndex >= 0 && currentIndex < steps.length) {
      steps[currentIndex].status = 'current';
    }

    return steps;
  };

  const steps = getSteps();
  const isCancelled = booking.status === 'cancelled';

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return null;
    try {
      return format(new Date(timestamp), "d MMM, HH:mm", { locale: es });
    } catch {
      return null;
    }
  };

  return (
    <div className="py-2">
      {isCancelled && (
        <div className="flex items-center gap-2 text-destructive mb-4 p-2 bg-destructive/10 rounded-lg">
          <XCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Este encargo fue cancelado</span>
        </div>
      )}

      <div className="relative">
        {steps.map((step, index) => (
          <div key={step.id} className="flex gap-3 mb-4 last:mb-0">
            {/* Icon */}
            <div className="relative">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                  step.status === 'completed' && "bg-primary border-primary text-primary-foreground",
                  step.status === 'current' && "bg-primary/20 border-primary text-primary animate-pulse",
                  step.status === 'pending' && "bg-muted border-muted-foreground/30 text-muted-foreground",
                  step.status === 'cancelled' && "bg-destructive/10 border-destructive/30 text-destructive/50"
                )}
              >
                {step.icon}
              </div>
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute left-1/2 -translate-x-1/2 top-8 w-0.5 h-6",
                    step.status === 'completed' ? "bg-primary" : "bg-muted-foreground/20"
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-2">
              <div className="flex items-center justify-between">
                <h4
                  className={cn(
                    "font-medium text-sm",
                    step.status === 'completed' && "text-foreground",
                    step.status === 'current' && "text-primary",
                    step.status === 'pending' && "text-muted-foreground",
                    step.status === 'cancelled' && "text-muted-foreground line-through"
                  )}
                >
                  {step.label}
                </h4>
                {step.timestamp && step.status === 'completed' && (
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(step.timestamp)}
                  </span>
                )}
              </div>
              <p
                className={cn(
                  "text-xs mt-0.5",
                  step.status === 'current' ? "text-muted-foreground" : "text-muted-foreground/70"
                )}
              >
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
