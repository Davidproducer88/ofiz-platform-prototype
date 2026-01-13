import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Star, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { MasterSubscriptionCheckoutBrick } from "./MasterSubscriptionCheckoutBrick";

interface Subscription {
  id: string;
  plan: string;
  monthly_applications_limit: number;
  applications_used: number;
  is_featured: boolean;
  current_period_end: string;
}

export const SubscriptionPlans = () => {
  const [currentPlan, setCurrentPlan] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<{
    id: 'free' | 'basic_plus' | 'premium';
    name: string;
    price: number;
    applicationsLimit: number;
    isFeatured: boolean;
  } | null>(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('master_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      setCurrentPlan(data);
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelection = async (plan: 'free' | 'basic_plus' | 'premium') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const isAnnual = billingPeriod === 'annual';
      // Precios en centavos: mensual vs anual (10 meses = 2 meses gratis)
      const planConfig = {
        free: {
          price: 0,
          applicationsLimit: 5,
          isFeatured: false,
          name: 'Gratuito',
        },
        basic_plus: {
          price: isAnnual ? 49900 * 10 : 49900, // $499/mes o $4,990/año (2 meses gratis)
          applicationsLimit: 20,
          isFeatured: false,
          name: 'Basic Plus',
        },
        premium: {
          price: isAnnual ? 99900 * 10 : 99900, // $999/mes o $9,990/año (2 meses gratis)
          applicationsLimit: 50,
          isFeatured: true,
          name: 'Premium',
        },
      };

      const config = planConfig[plan];

      // For free plan, create directly
      if (plan === 'free') {
        toast({
          title: "Procesando...",
          description: "Activando plan gratuito...",
        });

        const { data, error } = await supabase.functions.invoke('create-master-subscription', {
          body: {
            planId: plan,
            planName: config.name,
            price: config.price,
            applicationsLimit: config.applicationsLimit,
            isFeatured: config.isFeatured,
          }
        });

        if (error) throw new Error(error.message);
        if (data?.error) throw new Error(data.error);

        toast({
          title: "Plan actualizado",
          description: "Ahora estás en el plan Gratuito",
        });
        fetchSubscription();
        return;
      }

      // For paid plans, show payment dialog
      setSelectedPlan({
        id: plan,
        name: config.name,
        price: config.price,
        applicationsLimit: config.applicationsLimit,
        isFeatured: config.isFeatured,
      });
      setShowPaymentDialog(true);

    } catch (error: any) {
      console.error('Error selecting plan:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "No se pudo procesar la suscripción",
      });
    }
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    console.log('Payment successful:', paymentData);
    toast({
      title: "¡Pago exitoso!",
      description: "Tu suscripción ha sido activada",
    });
    setShowPaymentDialog(false);
    setSelectedPlan(null);
    await fetchSubscription();
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    toast({
      variant: "destructive",
      title: "Error en el pago",
      description: "No se pudo procesar el pago. Intenta nuevamente.",
    });
  };

  const isAnnual = billingPeriod === 'annual';
  
  const plans = [
    {
      name: "Gratuito",
      value: "free" as const,
      price: "$0",
      features: [
        "5 propuestas por mes",
        "Perfil básico",
        "Notificaciones por email",
      ],
      icon: Check,
    },
    {
      name: "Basic Plus",
      value: "basic_plus" as const,
      price: isAnnual ? "$4,990" : "$499",
      period: isAnnual ? "/año" : "/mes",
      savings: isAnnual ? "Ahorrás $998" : null,
      features: [
        "20 propuestas por mes",
        "Perfil mejorado",
        "Visibilidad aumentada",
        "Notificaciones en tiempo real",
        "Soporte estándar",
      ],
      icon: Zap,
      popular: false,
    },
    {
      name: "Premium",
      value: "premium" as const,
      price: isAnnual ? "$9,990" : "$999",
      period: isAnnual ? "/año" : "/mes",
      savings: isAnnual ? "Ahorrás $1,998" : null,
      features: [
        "50 propuestas por mes",
        "Perfil destacado",
        "Aparece primero en búsquedas",
        "Notificaciones prioritarias",
        "Soporte prioritario",
        "Badge verificado",
        "Analíticas avanzadas",
      ],
      icon: Star,
      popular: true,
    },
  ];

  if (loading) {
    return <div>Cargando planes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Billing Period Toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center gap-2 p-1 rounded-lg bg-muted">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              billingPeriod === 'monthly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setBillingPeriod('annual')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              billingPeriod === 'annual'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Anual
            <Badge variant="secondary" className="ml-2 text-xs">-17%</Badge>
          </button>
        </div>
      </div>

      {currentPlan && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Tu Plan Actual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">
                Plan {currentPlan.plan === 'free' ? 'Gratuito' : 'Premium'}
              </span>
              {currentPlan.is_featured && (
                <Badge variant="default">Destacado</Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Propuestas usadas</p>
                <p className="text-2xl font-bold">
                  {currentPlan.applications_used} / {currentPlan.monthly_applications_limit}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Renovación</p>
                <p className="text-sm font-medium">
                  {new Date(currentPlan.current_period_end).toLocaleDateString('es-AR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentPlan?.plan === plan.value;

          return (
            <Card key={plan.value} className={`${plan.popular ? "border-primary shadow-lg" : ""} flex flex-col`}>
              <CardHeader>
                {plan.popular && (
                  <Badge className="w-fit mb-2" variant="default">
                    Más Popular
                  </Badge>
                )}
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Icon className="h-5 w-5" />
                  {plan.name}
                </CardTitle>
                <CardDescription>
                  <div className="flex flex-col gap-1">
                    <div>
                      <span className="text-2xl sm:text-3xl font-bold">{plan.price}</span>
                      {plan.period && <span className="text-sm">{plan.period}</span>}
                    </div>
                    {plan.savings && (
                      <Badge variant="secondary" className="w-fit text-xs">
                        {plan.savings}
                      </Badge>
                    )}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={isCurrentPlan ? "outline" : plan.popular ? "default" : "outline"}
                  onClick={() => handlePlanSelection(plan.value)}
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? "Plan Actual" : `Cambiar a ${plan.name}`}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Suscripción {selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              Completa el pago para activar tu suscripción
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
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Propuestas mensuales:</span>
                  <span className="font-medium">{selectedPlan.applicationsLimit}</span>
                </div>
              </div>

              <MasterSubscriptionCheckoutBrick
                amount={selectedPlan.price}
                planId={selectedPlan.id}
                planName={selectedPlan.name}
                applicationsLimit={selectedPlan.applicationsLimit}
                isFeatured={selectedPlan.isFeatured}
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
