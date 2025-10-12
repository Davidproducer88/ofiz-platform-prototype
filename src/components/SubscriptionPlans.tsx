import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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

  const createSubscription = async (plan: 'free' | 'premium') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const subscriptionData = {
        master_id: user.id,
        plan: plan,
        monthly_applications_limit: plan === 'free' ? 5 : 50,
        applications_used: 0,
        is_featured: plan === 'premium',
        price: plan === 'free' ? 0 : 9900,
      };

      if (currentPlan) {
        // Update existing subscription
        const { error } = await supabase
          .from('subscriptions')
          .update(subscriptionData)
          .eq('id', currentPlan.id);

        if (error) throw error;
      } else {
        // Create new subscription
        const { error } = await supabase
          .from('subscriptions')
          .insert(subscriptionData);

        if (error) throw error;
      }

      toast({
        title: "Plan actualizado",
        description: `Ahora estás en el plan ${plan === 'free' ? 'Gratuito' : 'Premium'}`,
      });

      fetchSubscription();
    } catch (error: any) {
      console.error('Error updating subscription:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

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
      name: "Premium",
      value: "premium" as const,
      price: "$99",
      period: "/mes",
      features: [
        "50 propuestas por mes",
        "Perfil destacado",
        "Aparece primero en búsquedas",
        "Notificaciones prioritarias",
        "Soporte prioritario",
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

      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentPlan?.plan === plan.value;

          return (
            <Card key={plan.value} className={plan.popular ? "border-primary shadow-lg" : ""}>
              <CardHeader>
                {plan.popular && (
                  <Badge className="w-fit mb-2" variant="default">
                    Más Popular
                  </Badge>
                )}
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {plan.name}
                </CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-sm">{plan.period}</span>}
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
                  onClick={() => createSubscription(plan.value)}
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? "Plan Actual" : `Cambiar a ${plan.name}`}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
