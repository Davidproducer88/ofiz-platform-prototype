import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MasterSubscription {
  id: string;
  plan: string;
  monthly_applications_limit: number;
  applications_used: number;
  is_featured: boolean;
  current_period_end: string;
}

interface BusinessSubscription {
  id: string;
  plan_type: string;
  monthly_contacts_limit: number;
  contacts_used: number;
  can_post_ads: boolean;
  ad_impressions_limit: number | null;
  status: string;
}

interface SubscriptionLimits {
  canApplyToJob: boolean;
  canContactMaster: boolean;
  canPostAd: boolean;
  canReviewClient: boolean;
  applicationsRemaining: number;
  contactsRemaining: number;
  isFeatured: boolean;
  planType: string;
}

export const useSubscriptionLimits = (userType: 'master' | 'client' | 'business') => {
  const [limits, setLimits] = useState<SubscriptionLimits>({
    canApplyToJob: false,
    canContactMaster: true,
    canPostAd: false,
    canReviewClient: false,
    applicationsRemaining: 0,
    contactsRemaining: 0,
    isFeatured: false,
    planType: 'free',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLimits();
  }, [userType]);

  const fetchLimits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      if (userType === 'master') {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('master_id', user.id)
          .maybeSingle();

        if (subscription) {
          const remaining = subscription.monthly_applications_limit - subscription.applications_used;
          setLimits({
            canApplyToJob: remaining > 0,
            canContactMaster: true,
            canPostAd: false,
            canReviewClient: subscription.plan === 'premium',
            applicationsRemaining: Math.max(0, remaining),
            contactsRemaining: 0,
            isFeatured: subscription.is_featured,
            planType: subscription.plan,
          });
        } else {
          // Sin suscripción - plan gratuito por defecto (5 aplicaciones)
          setLimits({
            canApplyToJob: true,
            canContactMaster: true,
            canPostAd: false,
            canReviewClient: false,
            applicationsRemaining: 5,
            contactsRemaining: 0,
            isFeatured: false,
            planType: 'free',
          });
        }
      } else if (userType === 'business') {
        const { data: subscription } = await supabase
          .from('business_subscriptions')
          .select('*')
          .eq('business_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (subscription) {
          const remaining = subscription.monthly_contacts_limit - subscription.contacts_used;
          setLimits({
            canApplyToJob: false,
            canContactMaster: remaining > 0,
            canPostAd: subscription.can_post_ads,
            canReviewClient: true,
            applicationsRemaining: 0,
            contactsRemaining: Math.max(0, remaining),
            isFeatured: false,
            planType: subscription.plan_type,
          });
        } else {
          // Sin suscripción
          setLimits({
            canApplyToJob: false,
            canContactMaster: false,
            canPostAd: false,
            canReviewClient: false,
            applicationsRemaining: 0,
            contactsRemaining: 0,
            isFeatured: false,
            planType: 'none',
          });
        }
      } else if (userType === 'client') {
        // Clientes tienen acceso completo sin restricciones
        setLimits({
          canApplyToJob: false,
          canContactMaster: true,
          canPostAd: false,
          canReviewClient: false,
          applicationsRemaining: 0,
          contactsRemaining: Infinity,
          isFeatured: false,
          planType: 'client',
        });
      }
    } catch (error) {
      console.error("Error fetching subscription limits:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkAndConsumeApplication = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      if (userType === 'master') {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('master_id', user.id)
          .maybeSingle();

        if (!subscription) {
          toast.error("Necesitas una suscripción activa para aplicar a trabajos");
          return false;
        }

        const remaining = subscription.monthly_applications_limit - subscription.applications_used;
        if (remaining <= 0) {
          toast.error("Has alcanzado el límite de aplicaciones de tu plan. Actualiza para aplicar a más trabajos.");
          return false;
        }

        // Incrementar aplicaciones usadas
        const { error } = await supabase
          .from('subscriptions')
          .update({ applications_used: subscription.applications_used + 1 })
          .eq('id', subscription.id);

        if (error) throw error;

        // Actualizar límites localmente
        await fetchLimits();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error consuming application:", error);
      toast.error("Error al procesar la aplicación");
      return false;
    }
  };

  const checkAndConsumeContact = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      if (userType === 'business') {
        const { data: subscription } = await supabase
          .from('business_subscriptions')
          .select('*')
          .eq('business_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (!subscription) {
          toast.error("Necesitas una suscripción activa para contactar maestros");
          return false;
        }

        const remaining = subscription.monthly_contacts_limit - subscription.contacts_used;
        if (remaining <= 0) {
          toast.error("Has alcanzado el límite de contactos de tu plan. Actualiza para contactar más maestros.");
          return false;
        }

        // Incrementar contactos usados
        const { error } = await supabase
          .from('business_subscriptions')
          .update({ contacts_used: subscription.contacts_used + 1 })
          .eq('id', subscription.id);

        if (error) throw error;

        // Actualizar límites localmente
        await fetchLimits();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error consuming contact:", error);
      toast.error("Error al procesar el contacto");
      return false;
    }
  };

  return {
    limits,
    loading,
    checkAndConsumeApplication,
    checkAndConsumeContact,
    refreshLimits: fetchLimits,
  };
};
