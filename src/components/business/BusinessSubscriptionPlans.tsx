import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface BusinessSubscriptionPlansProps {
  businessId: string;
  currentSubscription: any;
  onUpdate: () => void;
}

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 2500,
    icon: Building,
    description: 'Ideal para pequeñas empresas',
    features: [
      'Hasta 50 contactos con profesionales/mes',
      '5 anuncios activos simultáneos',
      '10,000 impresiones publicitarias/mes',
      'Gestión de contratos básica',
      'Soporte por email',
      'Panel de analíticas básico'
    ],
    contacts: 50,
    canPostAds: true,
    adImpressions: 10000
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 5000,
    icon: Zap,
    popular: true,
    description: 'Para empresas en crecimiento',
    features: [
      'Hasta 150 contactos con profesionales/mes',
      '15 anuncios activos simultáneos',
      '50,000 impresiones publicitarias/mes',
      'Gestión avanzada de contratos',
      'Facturación automatizada',
      'Soporte prioritario',
      'Analíticas avanzadas con reportes',
      'API para integraciones'
    ],
    contacts: 150,
    canPostAds: true,
    adImpressions: 50000
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 12000,
    icon: Crown,
    description: 'Para grandes organizaciones',
    features: [
      'Contactos ilimitados',
      'Anuncios ilimitados',
      'Impresiones publicitarias ilimitadas',
      'Gestor de cuenta dedicado',
      'Facturación centralizada',
      'Soporte 24/7',
      'Analíticas empresariales completas',
      'API completa y webhooks',
      'Posicionamiento prioritario',
      'Personalización de marca'
    ],
    contacts: 999999,
    canPostAds: true,
    adImpressions: 999999
  }
];

export const BusinessSubscriptionPlans = ({ 
  businessId, 
  currentSubscription, 
  onUpdate 
}: BusinessSubscriptionPlansProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    setLoading(planId);
    const plan = plans.find(p => p.id === planId);
    
    if (!plan) {
      toast({
        title: "Error",
        description: "Plan no encontrado",
        variant: "destructive",
      });
      setLoading(null);
      return;
    }
    
    try {
      toast({
        title: "Procesando...",
        description: "Preparando tu suscripción...",
      });

      // Call edge function to create MercadoPago subscription
      const { data, error } = await supabase.functions.invoke('create-business-subscription', {
        body: {
          planId: plan.id,
          planName: plan.name,
          price: plan.price,
          contacts: plan.contacts,
          canPostAds: plan.canPostAds,
          adImpressions: plan.adImpressions,
        }
      });

      if (error) {
        console.error('Subscription error:', error);
        throw new Error(error.message || 'Error al crear la suscripción');
      }

      if (!data) {
        throw new Error('No se recibió respuesta del servidor');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.initPoint) {
        toast({
          title: "Redirigiendo a pago",
          description: "Serás redirigido a MercadoPago para completar el pago...",
        });
        
        // Small delay to show the toast
        setTimeout(() => {
          window.location.href = data.initPoint;
        }, 500);
      } else {
        throw new Error('No se recibió URL de pago de MercadoPago');
      }

    } catch (error: any) {
      const errorMessage = error?.message || "No se pudo procesar la suscripción. Por favor, intenta nuevamente.";
      console.error('Error creating subscription:', error);
      toast({
        title: "Error al crear suscripción",
        description: errorMessage,
        variant: "destructive",
      });
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Planes Empresariales</h2>
        <p className="text-muted-foreground">
          Elige el plan que mejor se adapte a las necesidades de tu empresa
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentSubscription?.plan_type === plan.id;

          return (
            <Card
              key={plan.id}
              className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary">Más Popular</Badge>
                </div>
              )}

              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-8 w-8" />
                  {isCurrentPlan && <Badge variant="secondary">Plan Actual</Badge>}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price.toLocaleString()}</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={isCurrentPlan ? 'outline' : plan.popular ? 'default' : 'secondary'}
                  disabled={loading !== null || isCurrentPlan}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {loading === plan.id
                    ? "Procesando..."
                    : isCurrentPlan
                    ? "Plan Actual"
                    : "Seleccionar Plan"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {currentSubscription && (
        <Card className="border-muted">
          <CardHeader>
            <CardTitle>Información de tu Suscripción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estado:</span>
              <Badge variant={currentSubscription.status === 'active' ? 'default' : 'secondary'}>
                {currentSubscription.status === 'active' ? 'Activa' : currentSubscription.status}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Contactos usados:</span>
              <span className="font-medium">
                {currentSubscription.contacts_used} / {currentSubscription.monthly_contacts_limit}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Próxima renovación:</span>
              <span className="font-medium">
                {new Date(currentSubscription.current_period_end).toLocaleDateString()}
              </span>
            </div>
            {currentSubscription.mercadopago_subscription_id && (
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">
                  Para gestionar o cancelar tu suscripción, visita tu cuenta de MercadoPago
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://www.mercadopago.com.ar/subscriptions', '_blank')}
                >
                  Ir a MercadoPago
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};