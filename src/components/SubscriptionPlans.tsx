import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Star, Zap, Crown, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { MasterSubscriptionCheckoutBrick } from "./MasterSubscriptionCheckoutBrick";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Subscription {
  id: string;
  plan: string;
  monthly_applications_limit: number;
  applications_used: number;
  is_featured: boolean;
  current_period_end: string;
  has_founder_discount?: boolean;
}

interface Profile {
  is_founder: boolean;
  founder_discount_percentage: number | null;
}

// Límite de maestros fundadores
const FOUNDER_LIMIT = 1000;

export const SubscriptionPlans = () => {
  const [currentPlan, setCurrentPlan] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    id: 'free' | 'basic_plus' | 'premium';
    name: string;
    price: number;
    originalPrice: number;
    applicationsLimit: number;
    isFeatured: boolean;
  } | null>(null);
  const [isFounder, setIsFounder] = useState(false);
  const [founderCount, setFounderCount] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch profile to check founder status
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_founder, founder_discount_percentage')
        .eq('id', user.id)
        .single();

      if (profile) {
        setIsFounder(profile.is_founder || false);
      }

      // Fetch current subscription
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('master_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setCurrentPlan(subscription);

      // Fetch founder count
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_founder', true)
        .eq('user_type', 'master');

      setFounderCount(count || 0);

    } catch (error: any) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelection = async (plan: 'free' | 'basic_plus' | 'premium') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      // Configuración de planes - precios en centavos
      // Fundadores: Premium GRATIS de por vida
      const planConfig = {
        free: {
          price: 0,
          originalPrice: 0,
          applicationsLimit: 5,
          isFeatured: false,
          name: 'Gratuito',
        },
        basic_plus: {
          price: isFounder ? 0 : 49900, // Fundadores: Gratis
          originalPrice: 49900,
          applicationsLimit: 20,
          isFeatured: false,
          name: 'Basic Plus',
        },
        premium: {
          price: isFounder ? 0 : 99900, // Fundadores: Gratis
          originalPrice: 99900,
          applicationsLimit: isFounder ? 999 : 50, // Fundadores: Ilimitado
          isFeatured: true,
          name: 'Premium',
        },
      };

      const config = planConfig[plan];

      // Para fundadores o plan gratuito, activar directamente
      if (plan === 'free' || (isFounder && config.price === 0)) {
        toast({
          title: "Procesando...",
          description: isFounder ? "Activando beneficios de fundador..." : "Activando plan gratuito...",
        });

        const { data, error } = await supabase.functions.invoke('create-master-subscription', {
          body: {
            planId: plan,
            planName: isFounder && plan !== 'free' ? `${config.name} (Fundador)` : config.name,
            price: config.price,
            applicationsLimit: config.applicationsLimit,
            isFeatured: config.isFeatured,
            hasFounderDiscount: isFounder,
          }
        });

        if (error) throw new Error(error.message);
        if (data?.error) throw new Error(data.error);

        toast({
          title: isFounder ? "🎉 ¡Beneficio de Fundador Activado!" : "Plan actualizado",
          description: isFounder 
            ? `Tu plan ${config.name} está activo de por vida` 
            : `Ahora estás en el plan ${config.name}`,
        });
        fetchData();
        return;
      }

      // Para planes pagos (usuarios no fundadores)
      setSelectedPlan({
        id: plan,
        name: config.name,
        price: config.price,
        originalPrice: config.originalPrice,
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
    await fetchData();
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    // Don't show error for non-critical errors
    if (error?.type !== 'non_critical') {
      toast({
        variant: "destructive",
        title: "Error en el pago",
        description: "No se pudo procesar el pago. Intenta nuevamente.",
      });
    }
  };

  const remainingSlots = founderCount !== null ? FOUNDER_LIMIT - founderCount : null;
  
  const plans = [
    {
      name: "Gratuito",
      value: "free" as const,
      price: "$0",
      priceNote: null,
      features: [
        "5 propuestas por mes",
        "Perfil básico",
        "Notificaciones por email",
      ],
      icon: Check,
      founderBenefit: null,
    },
    {
      name: "Basic Plus",
      value: "basic_plus" as const,
      price: isFounder ? "$0" : "$499",
      priceNote: isFounder ? "Gratis de por vida" : "/mes",
      originalPrice: isFounder ? "$499/mes" : null,
      features: [
        "20 propuestas por mes",
        "Perfil mejorado",
        "Visibilidad aumentada",
        "Notificaciones en tiempo real",
        "Soporte estándar",
      ],
      icon: Zap,
      popular: false,
      founderBenefit: "¡Gratis para Fundadores!",
    },
    {
      name: "Premium",
      value: "premium" as const,
      price: isFounder ? "$0" : "$999",
      priceNote: isFounder ? "Gratis de por vida" : "/mes",
      originalPrice: isFounder ? "$999/mes" : null,
      features: isFounder ? [
        "Propuestas ILIMITADAS",
        "Perfil destacado con badge",
        "Aparece primero en búsquedas",
        "Notificaciones prioritarias",
        "Soporte VIP prioritario",
        "Badge de Fundador exclusivo",
        "Analíticas avanzadas",
        "Acceso anticipado a nuevas funciones",
      ] : [
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
      founderBenefit: "¡GRATIS de por vida para Fundadores!",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Founder Banner */}
      {isFounder && (
        <Alert className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/50">
          <Crown className="h-5 w-5 text-amber-500" />
          <AlertDescription className="text-base">
            <span className="font-bold text-amber-600 dark:text-amber-400">
              🎉 ¡Eres un Maestro Fundador!
            </span>
            <span className="ml-2">
              Tienes acceso <strong>Premium GRATIS de por vida</strong> como parte de los primeros {FOUNDER_LIMIT.toLocaleString()} maestros.
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Founder Slots Counter - Solo para no fundadores */}
      {!isFounder && remainingSlots !== null && remainingSlots > 0 && (
        <Alert className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30">
          <Gift className="h-5 w-5 text-primary" />
          <AlertDescription className="text-base">
            <span className="font-bold">¡Quedan solo {remainingSlots.toLocaleString()} lugares!</span>
            <span className="ml-2">
              Los primeros {FOUNDER_LIMIT.toLocaleString()} maestros obtienen <strong>Premium GRATIS de por vida</strong>.
            </span>
          </AlertDescription>
        </Alert>
      )}

      {currentPlan && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isFounder ? (
                <Crown className="h-5 w-5 text-amber-500" />
              ) : (
                <Zap className="h-5 w-5 text-primary" />
              )}
              Tu Plan Actual
              {currentPlan.has_founder_discount && (
                <Badge variant="secondary" className="bg-amber-500/20 text-amber-600">
                  Fundador
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">
                Plan {currentPlan.plan === 'free' ? 'Gratuito' : currentPlan.plan === 'basic_plus' ? 'Basic Plus' : 'Premium'}
              </span>
              {currentPlan.is_featured && (
                <Badge variant="default">Destacado</Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Propuestas usadas</p>
                <p className="text-2xl font-bold">
                  {currentPlan.applications_used} / {currentPlan.monthly_applications_limit >= 999 ? '∞' : currentPlan.monthly_applications_limit}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isFounder ? 'Válido' : 'Renovación'}
                </p>
                <p className="text-sm font-medium">
                  {isFounder ? 'De por vida ✨' : new Date(currentPlan.current_period_end).toLocaleDateString('es-CL')}
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
          const showFounderHighlight = isFounder && plan.value !== 'free';

          return (
            <Card 
              key={plan.value} 
              className={`
                ${plan.popular ? "border-primary shadow-lg" : ""} 
                ${showFounderHighlight ? "border-amber-500 bg-gradient-to-b from-amber-500/5 to-transparent" : ""}
                flex flex-col relative
              `}
            >
              <CardHeader>
                {plan.popular && !isFounder && (
                  <Badge className="w-fit mb-2" variant="default">
                    Más Popular
                  </Badge>
                )}
                {showFounderHighlight && plan.founderBenefit && (
                  <Badge className="w-fit mb-2 bg-amber-500 hover:bg-amber-600">
                    <Crown className="h-3 w-3 mr-1" />
                    {plan.value === 'premium' ? 'Recomendado' : 'Disponible'}
                  </Badge>
                )}
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Icon className="h-5 w-5" />
                  {plan.name}
                </CardTitle>
                <CardDescription>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-baseline gap-2">
                      {plan.originalPrice && (
                        <span className="text-lg line-through text-muted-foreground">
                          {plan.originalPrice}
                        </span>
                      )}
                      <span className={`text-2xl sm:text-3xl font-bold ${showFounderHighlight ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                        {plan.price}
                      </span>
                      {plan.priceNote && (
                        <span className={`text-sm ${showFounderHighlight ? 'text-amber-600 dark:text-amber-400 font-medium' : ''}`}>
                          {plan.priceNote}
                        </span>
                      )}
                    </div>
                    {showFounderHighlight && plan.founderBenefit && (
                      <Badge variant="outline" className="w-fit text-xs border-amber-500 text-amber-600">
                        {plan.founderBenefit}
                      </Badge>
                    )}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className={`h-4 w-4 flex-shrink-0 ${showFounderHighlight ? 'text-amber-500' : 'text-primary'}`} />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className={`w-full ${showFounderHighlight && plan.value === 'premium' ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
                  variant={isCurrentPlan ? "outline" : plan.popular || showFounderHighlight ? "default" : "outline"}
                  onClick={() => handlePlanSelection(plan.value)}
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan 
                    ? "Plan Actual" 
                    : isFounder && plan.value !== 'free'
                      ? `Activar ${plan.name} Gratis`
                      : `Cambiar a ${plan.name}`
                  }
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
                  <span className="font-semibold">{selectedPlan.name} (Mensual)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Monto:</span>
                  <span className="text-2xl font-bold">${(selectedPlan.price / 100).toLocaleString('es-CL')} CLP</span>
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
