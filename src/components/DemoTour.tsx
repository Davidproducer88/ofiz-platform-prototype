import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  SkipForward, 
  X, 
  ChevronRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface TourStep {
  view: 'client' | 'master' | 'business' | 'admin';
  tab?: string;
  title: string;
  description: string;
  duration: number; // seconds
  highlight?: string;
}

const tourSteps: TourStep[] = [
  {
    view: 'client',
    tab: 'bookings',
    title: 'Vista Cliente',
    description: 'Los clientes pueden gestionar sus reservas, ver el historial de servicios contratados y calificaciones otorgadas.',
    duration: 5,
  },
  {
    view: 'client',
    tab: 'masters',
    title: 'Profesionales Verificados',
    description: 'Catálogo de profesionales certificados con calificaciones reales, años de experiencia y tarifas transparentes.',
    duration: 5,
  },
  {
    view: 'master',
    title: 'Dashboard Profesional',
    description: 'Los profesionales monitorean sus trabajos completados, ingresos totales y mantienen una calificación promedio excelente.',
    duration: 5,
  },
  {
    view: 'business',
    tab: 'subscriptions',
    title: 'Suscripciones Empresariales',
    description: 'Sistema de planes para empresas con diferentes niveles: Basic, Professional y Premium, incluyendo descuentos para fundadores.',
    duration: 6,
  },
  {
    view: 'business',
    tab: 'contracts',
    title: 'Contratos Empresariales',
    description: 'Las empresas publican proyectos grandes y reciben múltiples propuestas de profesionales calificados.',
    duration: 5,
  },
  {
    view: 'business',
    tab: 'products',
    title: 'Marketplace B2B',
    description: 'Marketplace integrado donde empresas pueden vender productos y servicios relacionados con la construcción y mantenimiento.',
    duration: 5,
  },
  {
    view: 'business',
    tab: 'orders',
    title: 'Gestión de Órdenes',
    description: 'Sistema completo de seguimiento de órdenes con comisiones del 5% para la plataforma y tracking de envíos.',
    duration: 5,
  },
  {
    view: 'business',
    tab: 'ads',
    title: 'Sistema Publicitario',
    description: 'Las empresas pueden crear campañas publicitarias segmentadas con métricas detalladas de impresiones, clicks y CTR.',
    duration: 6,
  },
  {
    view: 'admin',
    title: 'Panel Administrativo',
    description: 'Vista global de la plataforma: 5,234 profesionales activos, 12,847 clientes, y crecimiento del 145% mensual.',
    duration: 6,
  },
];

interface DemoTourProps {
  onViewChange: (view: 'client' | 'master' | 'business' | 'admin') => void;
  onTabChange?: (tab: string) => void;
}

export const DemoTour = ({ onViewChange, onTabChange }: DemoTourProps) => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentStepData = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  const startTour = useCallback(() => {
    setIsActive(true);
    setIsPaused(false);
    setCurrentStep(0);
    setIsCompleted(false);
    setTimeLeft(tourSteps[0].duration);
    onViewChange(tourSteps[0].view);
    if (tourSteps[0].tab && onTabChange) {
      onTabChange(tourSteps[0].tab);
    }
  }, [onViewChange, onTabChange]);

  const pauseTour = () => setIsPaused(!isPaused);

  const skipStep = useCallback(() => {
    if (currentStep < tourSteps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setTimeLeft(tourSteps[nextStep].duration);
      onViewChange(tourSteps[nextStep].view);
      if (tourSteps[nextStep].tab && onTabChange) {
        onTabChange(tourSteps[nextStep].tab);
      }
    } else {
      setIsCompleted(true);
      setTimeout(() => {
        setIsActive(false);
        setIsCompleted(false);
      }, 3000);
    }
  }, [currentStep, onViewChange, onTabChange]);

  const stopTour = () => {
    setIsActive(false);
    setIsPaused(false);
    setCurrentStep(0);
    setIsCompleted(false);
  };

  useEffect(() => {
    if (!isActive || isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          skipStep();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, isPaused, skipStep]);

  useEffect(() => {
    if (isActive && currentStepData) {
      onViewChange(currentStepData.view);
      if (currentStepData.tab && onTabChange) {
        setTimeout(() => onTabChange(currentStepData.tab!), 300);
      }
    }
  }, [currentStep, isActive]);

  if (!isActive) {
    return (
      <Card className="fixed bottom-6 right-6 w-80 shadow-2xl border-2 border-primary/20 animate-scale-in z-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-gradient-hero rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Tour Guiado Interactivo</h3>
              <p className="text-sm text-muted-foreground">
                Explora automáticamente todas las funcionalidades de la plataforma
              </p>
            </div>
          </div>
          <Button 
            onClick={startTour} 
            className="w-full bg-gradient-hero hover:opacity-90"
            size="lg"
          >
            <Play className="mr-2 h-5 w-5" />
            Iniciar Tour ({tourSteps.length} pasos)
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isCompleted) {
    return (
      <Card className="fixed bottom-6 right-6 w-80 shadow-2xl border-2 border-success/50 animate-scale-in z-50">
        <CardContent className="pt-6 text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-3">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h3 className="font-semibold text-lg mb-2">¡Tour Completado!</h3>
            <p className="text-sm text-muted-foreground">
              Has explorado todas las funcionalidades de Ofiz
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 shadow-2xl border-2 border-primary animate-scale-in z-50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="default" className="bg-gradient-hero">
                Paso {currentStep + 1} de {tourSteps.length}
              </Badge>
              <Badge variant="outline">
                {timeLeft.toFixed(0)}s
              </Badge>
            </div>
            <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={stopTour}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Progress value={(timeLeft / currentStepData.duration) * 100} className="h-1 mt-2" />
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {currentStepData.description}
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={pauseTour}
            className="flex-1"
          >
            {isPaused ? (
              <>
                <Play className="mr-2 h-4 w-4" />
                Continuar
              </>
            ) : (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pausar
              </>
            )}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={skipStep}
            className="flex-1 bg-gradient-hero hover:opacity-90"
          >
            {currentStep === tourSteps.length - 1 ? (
              <>Finalizar</>
            ) : (
              <>
                Siguiente
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        <div className="pt-3 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Progreso del tour</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};
