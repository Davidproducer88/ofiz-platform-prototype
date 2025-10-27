import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Zap, Crown, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { BusinessSubscriptionCheckoutBrick } from "../BusinessSubscriptionCheckoutBrick";

interface BusinessSubscriptionPlansProps {
  businessId: string;
  currentSubscription: any;
  onUpdate: () => void;
}

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 450000,
    icon: Building,
    description: 'Ideal para pequeñas empresas',
    features: [
      'Hasta 50 contactos con profesionales/mes',
      '5 anuncios activos simultáneos',
      '10,000 impresiones publicitarias/mes',
      'Gestión de contratos básica',
      'Soporte por email',
      'Panel de analíticas básico',
      'Búsqueda avanzada de profesionales'
    ],
    contacts: 50,
    canPostAds: true,
    adImpressions: 10000
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 850000,
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
      'API para integraciones',
      'Filtros de búsqueda premium'
    ],
    contacts: 150,
    canPostAds: true,
    adImpressions: 50000
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 1500000,
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
      'Personalización de marca',
      'Reportes personalizados'
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
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);

  const handleSubscribe = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    
    if (!plan) {
      toast({
        title: "Error",
        description: "Plan no encontrado",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedPlan(plan);
    setShowPaymentDialog(true);
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    console.log('Payment successful:', paymentData);
    toast({
      title: "¡Pago exitoso!",
      description: "Tu suscripción empresarial ha sido activada",
    });
    setShowPaymentDialog(false);
    setSelectedPlan(null);
    setLoading(null);
    onUpdate();
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    toast({
      variant: "destructive",
      title: "Error en el pago",
      description: "No se pudo procesar el pago. Intenta nuevamente.",
    });
    setLoading(null);
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

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Suscripción {selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              Completa el pago para activar tu suscripción empresarial
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Plan:</span>
                  <span className="font-semibold">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Monto:</span>
                  <span className="text-2xl font-bold">${(selectedPlan.price / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Contactos mensuales:</span>
                  <span className="font-medium">{selectedPlan.contacts === 999999 ? 'Ilimitados' : selectedPlan.contacts}</span>
                </div>
              </div>

              <BusinessSubscriptionCheckoutBrick
                amount={selectedPlan.price}
                planId={selectedPlan.id}
                planName={selectedPlan.name}
                contacts={selectedPlan.contacts}
                canPostAds={selectedPlan.canPostAds}
                adImpressions={selectedPlan.adImpressions}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};