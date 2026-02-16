import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Check, Star, Zap, Crown, Gift, XCircle, AlertTriangle, Calendar, CreditCard, ArrowDownCircle, RefreshCw, DollarSign, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { MasterSubscriptionCheckoutBrick } from "./MasterSubscriptionCheckoutBrick";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Subscription {
  id: string;
  plan: string;
  monthly_applications_limit: number;
  applications_used: number;
  is_featured: boolean;
  current_period_start: string;
  current_period_end: string;
  has_founder_discount?: boolean;
  cancelled_at?: string;
  mercadopago_payment_id?: string;
  price?: number;
}

interface PotentialRefund {
  amount: number;
  days_remaining: number;
  total_days: number;
}

interface Profile {
  is_founder: boolean;
  founder_discount_percentage: number | null;
}

// Límite de maestros fundadores y descuento
const FOUNDER_LIMIT = 1000;
const FOUNDER_DISCOUNT_PERCENT = 20; // 20% de descuento permanente

// Helper para formatear precios en formato uruguayo (con punto como separador de miles)
const formatPriceUY = (price: number): string => {
  return price.toLocaleString('es-UY').replace(/,/g, '.');
};

type CancelOption = 'end_of_period' | 'with_refund' | 'immediate';

export const SubscriptionPlans = () => {
  const [currentPlan, setCurrentPlan] = useState<Subscription | null>(null);
  const [potentialRefund, setPotentialRefund] = useState<PotentialRefund | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelOption, setCancelOption] = useState<CancelOption>('end_of_period');
  const [cancelLoading, setCancelLoading] = useState(false);
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

      // Configuración de planes - precios en UYU (enteros, sin centavos)
      // Fundadores: 20% de descuento permanente
      const calculateFounderPrice = (originalPrice: number) => 
        Math.round(originalPrice * (1 - FOUNDER_DISCOUNT_PERCENT / 100));

      const planConfig = {
        free: {
          price: 0,
          originalPrice: 0,
          applicationsLimit: 5,
          isFeatured: false,
          name: 'Gratuito',
        },
        basic_plus: {
          price: isFounder ? calculateFounderPrice(999) : 999, // $999 UYU - Fundadores: 20% descuento
          originalPrice: 999,
          applicationsLimit: 20,
          isFeatured: false,
          name: 'Basic Plus',
        },
        premium: {
          price: isFounder ? calculateFounderPrice(1999) : 1999, // $1.999 UYU - Fundadores: 20% descuento
          originalPrice: 1999,
          applicationsLimit: 50,
          isFeatured: true,
          name: 'Premium',
        },
      };

      const config = planConfig[plan];

      // Para plan gratuito, activar directamente sin pago
      if (plan === 'free') {
        toast({
          title: "Procesando...",
          description: "Activando plan gratuito...",
        });

        const { data, error } = await supabase.functions.invoke('create-master-subscription', {
          body: {
            planId: plan,
            planName: config.name,
            price: 0,
            applicationsLimit: config.applicationsLimit,
            isFeatured: config.isFeatured,
            hasFounderDiscount: false,
          }
        });

        if (error) throw new Error(error.message);
        if (data?.error) throw new Error(data.error);

        toast({
          title: "Plan actualizado",
          description: `Ahora estás en el plan ${config.name}`,
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

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    try {
      let action: string;
      let successMessage: string;
      
      switch (cancelOption) {
        case 'with_refund':
          action = 'cancel_with_refund';
          successMessage = 'Tu suscripción ha sido cancelada y el reembolso está en proceso.';
          break;
        case 'immediate':
          action = 'downgrade';
          successMessage = 'Tu plan ha sido cambiado a gratuito inmediatamente.';
          break;
        case 'end_of_period':
        default:
          action = 'cancel';
          successMessage = 'Tu suscripción se cancelará al final del período actual.';
          break;
      }

      const { data, error } = await supabase.functions.invoke('manage-user-subscription', {
        body: { action }
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      // Show specific message based on result
      if (data?.refund) {
        toast({
          title: "💰 Reembolso procesado",
          description: `Se reembolsaron $${data.refund.amount?.toLocaleString('es-UY')} UYU por ${data.refund.days_remaining} días restantes.`,
        });
      } else {
        toast({
          title: "Suscripción actualizada",
          description: data?.message || successMessage,
        });
      }
      
      setShowCancelDialog(false);
      setCancelOption('end_of_period');
      await fetchData();

    } catch (error: any) {
      console.error('Error managing subscription:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "No se pudo procesar la solicitud",
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setCancelLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-user-subscription', {
        body: { action: 'reactivate' }
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      toast({
        title: "✅ Suscripción reactivada",
        description: data?.message || "Tu suscripción ha sido reactivada exitosamente.",
      });
      
      await fetchData();

    } catch (error: any) {
      console.error('Error reactivating subscription:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "No se pudo reactivar la suscripción",
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    
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
  
  // Calcular precios con descuento de fundador (precios en UYU)
  const founderBasicPrice = Math.round(999 * (1 - FOUNDER_DISCOUNT_PERCENT / 100));
  const founderPremiumPrice = Math.round(1999 * (1 - FOUNDER_DISCOUNT_PERCENT / 100));

  // Formatear precio en UYU
  const formatPrice = (price: number) => `$${price.toLocaleString('es-UY')} UYU`;

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
      price: isFounder ? `$${formatPriceUY(founderBasicPrice)}` : "$999",
      priceNote: "UYU/mes",
      originalPrice: isFounder ? "$999 UYU/mes" : null,
      features: [
        "20 propuestas por mes",
        "Perfil mejorado",
        "Visibilidad aumentada",
        "Notificaciones en tiempo real",
        "Soporte estándar",
      ],
      icon: Zap,
      popular: false,
      founderBenefit: `${FOUNDER_DISCOUNT_PERCENT}% descuento`,
    },
    {
      name: "Premium",
      value: "premium" as const,
      price: isFounder ? `$${formatPriceUY(founderPremiumPrice)}` : "$1.999",
      priceNote: "UYU/mes",
      originalPrice: isFounder ? "$1.999 UYU/mes" : null,
      features: [
        "50 propuestas por mes",
        "Perfil destacado con badge",
        "Aparece primero en búsquedas",
        "Notificaciones prioritarias",
        "Soporte prioritario",
        "Badge verificado",
        "Analíticas avanzadas",
      ],
      icon: Star,
      popular: true,
      founderBenefit: `${FOUNDER_DISCOUNT_PERCENT}% descuento permanente`,
    },
  ];

  const isPaidPlan = currentPlan && currentPlan.plan !== 'free';
  const isCancelled = currentPlan?.cancelled_at != null;

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
              Tienes <strong>{FOUNDER_DISCOUNT_PERCENT}% de descuento permanente</strong> en todos los planes como parte de los primeros {FOUNDER_LIMIT.toLocaleString()} maestros.
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Founder Slots Counter - Solo para no fundadores */}
      {!isFounder && remainingSlots !== null && remainingSlots > 0 && (
        <Alert className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30">
          <Gift className="h-5 w-5 text-primary" />
          <AlertDescription className="text-base">
            <span className="font-bold">¡Quedan {remainingSlots.toLocaleString()} lugares de fundador!</span>
            <span className="ml-2">
              Los primeros {FOUNDER_LIMIT.toLocaleString()} maestros obtienen <strong>{FOUNDER_DISCOUNT_PERCENT}% de descuento permanente</strong>.
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
              {isCancelled && (
                <Badge variant="destructive" className="ml-2">
                  Cancelado
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
                  {isFounder ? 'Válido' : isCancelled ? 'Activo hasta' : 'Renovación'}
                </p>
                <p className="text-sm font-medium">
                  {isFounder ? 'De por vida ✨' : new Date(currentPlan.current_period_end).toLocaleDateString('es-CL')}
                </p>
              </div>
            </div>

            {/* Botones de gestión de suscripción */}
            {isPaidPlan && !isCancelled && (
              <>
                <Separator className="my-4" />
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Gestionar suscripción</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCancelOption('end_of_period');
                      setShowCancelDialog(true);
                    }}
                    className="text-amber-600 border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelar suscripción
                  </Button>
                </div>
              </>
            )}

            {isCancelled && (
              <div className="space-y-3">
                <Alert className="bg-amber-500/10 border-amber-500/30">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-sm">
                    Tu suscripción está cancelada. Seguirás disfrutando de los beneficios hasta el{' '}
                    <strong>{new Date(currentPlan.current_period_end).toLocaleDateString('es-CL')}</strong>.
                    Después de esa fecha, cambiarás al plan gratuito.
                  </AlertDescription>
                </Alert>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReactivateSubscription}
                  disabled={cancelLoading}
                  className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                >
                  {cancelLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4 mr-2" />
                  )}
                  Reactivar suscripción
                </Button>
              </div>
            )}
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
                <div className="mt-2">
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
                </div>
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
                      ? `Suscribirse con ${FOUNDER_DISCOUNT_PERCENT}% dto.`
                      : plan.value === 'free' 
                        ? 'Usar plan gratuito'
                        : `Suscribirse a ${plan.name}`
                  }
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Dialog de pago */}
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
                  <span className="text-2xl font-bold">${formatPriceUY(selectedPlan.price)} UYU</span>
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
                hasFounderDiscount={isFounder}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog unificado de cancelación */}
      <Dialog open={showCancelDialog} onOpenChange={(open) => {
        setShowCancelDialog(open);
        if (!open) setCancelOption('end_of_period');
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-amber-500" />
              Cancelar suscripción
            </DialogTitle>
            <DialogDescription>
              Selecciona cómo deseas cancelar tu suscripción
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Plan actual info */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Plan actual:</span>
                <span className="font-semibold">{currentPlan?.plan === 'basic_plus' ? 'Basic Plus' : 'Premium'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Activo hasta:</span>
                <span className="font-medium">{currentPlan ? new Date(currentPlan.current_period_end).toLocaleDateString('es-CL') : ''}</span>
              </div>
            </div>

            {/* Opciones de cancelación */}
            <RadioGroup 
              value={cancelOption} 
              onValueChange={(value) => setCancelOption(value as CancelOption)}
              className="space-y-3"
            >
              {/* Opción 1: Cancelar al final del período */}
              <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors ${
                cancelOption === 'end_of_period' ? 'border-primary bg-primary/5' : 'border-border'
              }`}>
                <RadioGroupItem value="end_of_period" id="end_of_period" className="mt-1" />
                <Label htmlFor="end_of_period" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 font-medium">
                    <Calendar className="h-4 w-4 text-amber-600" />
                    Cancelar al final del período
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Mantén tus beneficios hasta el {currentPlan ? new Date(currentPlan.current_period_end).toLocaleDateString('es-CL') : ''}.
                    No se te cobrará el próximo mes.
                  </p>
                </Label>
              </div>

              {/* Opción 2: Cancelar con reembolso (solo si hay pago) */}
              {currentPlan?.mercadopago_payment_id && (
                <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors ${
                  cancelOption === 'with_refund' ? 'border-green-500 bg-green-500/5' : 'border-border'
                }`}>
                  <RadioGroupItem value="with_refund" id="with_refund" className="mt-1" />
                  <Label htmlFor="with_refund" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 font-medium">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      Cancelar con reembolso proporcional
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Recomendado
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cancela ahora y recibe un reembolso proporcional por los días no utilizados.
                      El reembolso se procesa automáticamente en MercadoPago.
                    </p>
                  </Label>
                </div>
              )}

              {/* Opción 3: Cancelar inmediatamente sin reembolso */}
              <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors ${
                cancelOption === 'immediate' ? 'border-destructive bg-destructive/5' : 'border-border'
              }`}>
                <RadioGroupItem value="immediate" id="immediate" className="mt-1" />
                <Label htmlFor="immediate" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 font-medium text-destructive">
                    <ArrowDownCircle className="h-4 w-4" />
                    Cambiar a gratuito inmediatamente
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pierdes acceso inmediato a todos los beneficios sin reembolso.
                  </p>
                </Label>
              </div>
            </RadioGroup>

            {/* Advertencia según opción seleccionada */}
            {cancelOption === 'immediate' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Atención:</strong> Perderás inmediatamente acceso a todos los beneficios de tu plan actual, incluyendo el tiempo restante de tu suscripción.
                </AlertDescription>
              </Alert>
            )}

            {cancelOption === 'with_refund' && (
              <Alert className="bg-green-500/10 border-green-500/30">
                <DollarSign className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  El reembolso será calculado proporcionalmente según los días restantes de tu suscripción y se acreditará en tu cuenta de MercadoPago.
                </AlertDescription>
              </Alert>
            )}

            {/* Beneficios que se pierden */}
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Al cancelar perderás acceso a:</p>
              <ul className="list-disc list-inside space-y-1">
                {currentPlan?.plan === 'premium' && (
                  <>
                    <li>50 propuestas mensuales</li>
                    <li>Perfil destacado</li>
                    <li>Prioridad en búsquedas</li>
                    <li>Soporte prioritario</li>
                  </>
                )}
                {currentPlan?.plan === 'basic_plus' && (
                  <>
                    <li>20 propuestas mensuales</li>
                    <li>Perfil mejorado</li>
                    <li>Visibilidad aumentada</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)} disabled={cancelLoading}>
              Mantener suscripción
            </Button>
            <Button 
              variant={cancelOption === 'with_refund' ? 'default' : 'destructive'}
              onClick={handleCancelSubscription}
              disabled={cancelLoading}
              className={cancelOption === 'with_refund' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {cancelLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                cancelOption === 'end_of_period' ? 'Cancelar al final del período' :
                cancelOption === 'with_refund' ? 'Cancelar y solicitar reembolso' :
                'Cambiar a gratuito ahora'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
