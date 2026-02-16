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

// Helper para formatear precios en formato uruguayo (con punto como separador de miles)
const formatPriceUY = (price: number): string => {
  return price.toLocaleString('es-UY').replace(/,/g, '.');
};

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 4990, // UYU por mes - $4.990
    icon: Building,
    description: 'Ideal para pequeñas empresas',
    features: [
      'Hasta 30 contactos con profesionales/mes',
      '3 anuncios activos simultáneos',
      '5.000 impresiones publicitarias/mes',
      'Gestión de contratos básica',
      'Soporte por email',
      'Panel de analíticas básico',
      'Búsqueda avanzada de profesionales'
    ],
    contacts: 30,
    canPostAds: true,
    adImpressions: 5000
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 9990, // UYU por mes - $9.990
    icon: Zap,
    popular: true,
    description: 'Para empresas en crecimiento',
    features: [
      'Hasta 100 contactos con profesionales/mes',
      '10 anuncios activos simultáneos',
      '25.000 impresiones publicitarias/mes',
      'Gestión avanzada de contratos',
      'Facturación automatizada',
      'Soporte prioritario',
      'Analíticas avanzadas con reportes',
      'API para integraciones',
      'Filtros de búsqueda premium'
    ],
    contacts: 100,
    canPostAds: true,
    adImpressions: 25000
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 24990, // UYU por mes - $24.990
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
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);

  const handleSubscribe = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    const adjustedPlan = adjustedPlans.find(p => p.id === planId);
    
    if (!plan || !adjustedPlan) {
      toast({
        title: "Error",
        description: "Plan no encontrado",
        variant: "destructive",
      });
      return;
    }
    
    // Guardar tanto el plan original como el ajustado
    setSelectedPlan({
      ...plan,
      displayPrice: adjustedPlan.displayPrice,
      actualPrice: adjustedPlan.actualPrice,
      period: adjustedPlan.period,
      savings: adjustedPlan.savings
    } as any);
    setShowPaymentDialog(true);
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    
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

  const isAnnual = billingPeriod === 'annual';
  const adjustedPlans = plans.map(plan => {
    // Precio anual = 10 meses (equivalente a 2 meses gratis = ~17% descuento)
    const annualPrice = plan.price * 10;
    const monthlySavings = plan.price * 2;
    
    return {
      ...plan,
      displayPrice: isAnnual ? annualPrice : plan.price,
      actualPrice: isAnnual ? annualPrice : plan.price,
      period: isAnnual ? ' UYU/año' : ' UYU/mes',
      savings: isAnnual ? `Ahorrás $${formatPriceUY(monthlySavings)} UYU` : null
    };
  });

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Planes Empresariales</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Elige el plan que mejor se adapte a las necesidades de tu empresa
        </p>
      </div>

      {/* Billing Period Toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center gap-2 p-1 rounded-lg bg-muted">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all ${
              billingPeriod === 'monthly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setBillingPeriod('annual')}
            className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all ${
              billingPeriod === 'annual'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Anual
            <Badge variant="secondary" className="ml-2 text-xs">2 meses gratis</Badge>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {adjustedPlans.map((plan, idx) => {
          const originalPlan = plans[idx];
          const Icon = originalPlan.icon;
          const isCurrentPlan = currentSubscription?.plan_type === originalPlan.id;

          return (
            <Card
              key={originalPlan.id}
              className={`relative flex flex-col ${originalPlan.popular ? 'border-primary shadow-lg md:scale-105' : ''}`}
            >
              {originalPlan.popular && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-xs sm:text-sm">Más Popular</Badge>
                </div>
              )}

              <CardHeader className="flex-grow">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
                  {isCurrentPlan && <Badge variant="secondary" className="text-xs">Plan Actual</Badge>}
                </div>
                <CardTitle className="text-xl sm:text-2xl">{originalPlan.name}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">{originalPlan.description}</CardDescription>
                <div className="mt-4">
                  <div>
                    <span className="text-3xl sm:text-4xl font-bold">${formatPriceUY(plan.displayPrice)}</span>
                    <span className="text-sm sm:text-base text-muted-foreground">{plan.period}</span>
                  </div>
                  {plan.savings && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {plan.savings}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4 flex flex-col">
                <ul className="space-y-2 sm:space-y-3 flex-grow">
                  {originalPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full text-sm sm:text-base"
                  variant={isCurrentPlan ? 'outline' : originalPlan.popular ? 'default' : 'secondary'}
                  disabled={loading !== null || isCurrentPlan}
                  onClick={() => handleSubscribe(originalPlan.id)}
                >
                  {loading === originalPlan.id
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
                  <span className="font-semibold">{selectedPlan.name} {billingPeriod === 'annual' ? '(Anual)' : '(Mensual)'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Monto:</span>
                  <span className="text-2xl font-bold">
                    ${formatPriceUY((selectedPlan as any).actualPrice || selectedPlan.price)} UYU
                  </span>
                </div>
                {(selectedPlan as any).savings && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-600 dark:text-green-400">💰 {(selectedPlan as any).savings}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Contactos mensuales:</span>
                  <span className="font-medium">{selectedPlan.contacts === 999999 ? 'Ilimitados' : selectedPlan.contacts}</span>
                </div>
              </div>

              <BusinessSubscriptionCheckoutBrick
                amount={(selectedPlan as any).actualPrice || selectedPlan.price}
                planId={selectedPlan.id}
                planName={`${selectedPlan.name} - ${billingPeriod === 'annual' ? 'Anual' : 'Mensual'}`}
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