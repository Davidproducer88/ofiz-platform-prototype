import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BusinessSubscription {
  id: string;
  plan_type: string;
  monthly_contacts_limit: number;
  contacts_used: number;
  can_post_ads: boolean;
  ad_impressions_limit: number | null;
  status: string;
  current_period_end: string;
}

interface AdStats {
  activeAdsCount: number;
  totalImpressionsUsed: number;
}

interface PlanLimits {
  maxActiveAds: number;
  maxMonthlyImpressions: number;
  hasPremiumFilters: boolean;
  hasApiAccess: boolean;
  hasCustomReports: boolean;
  hasDedicatedManager: boolean;
}

interface SubscriptionLimitsState {
  // Contactos
  canContactMaster: boolean;
  contactsRemaining: number;
  contactsLimit: number;
  contactsUsed: number;
  
  // Anuncios
  canCreateAd: boolean;
  canPostAds: boolean;
  activeAdsCount: number;
  maxActiveAds: number;
  adsRemaining: number;
  
  // Impresiones
  impressionsUsed: number;
  impressionsLimit: number;
  impressionsRemaining: number;
  hasReachedImpressionLimit: boolean;
  
  // Features por plan
  hasPremiumFilters: boolean;
  hasApiAccess: boolean;
  hasCustomReports: boolean;
  hasDedicatedManager: boolean;
  hasAutomatedInvoicing: boolean;
  
  // General
  planType: string;
  isActive: boolean;
}

// Límites según el plan
const PLAN_LIMITS: Record<string, PlanLimits> = {
  basic: {
    maxActiveAds: 5,
    maxMonthlyImpressions: 10000,
    hasPremiumFilters: false,
    hasApiAccess: false,
    hasCustomReports: false,
    hasDedicatedManager: false,
  },
  professional: {
    maxActiveAds: 15,
    maxMonthlyImpressions: 50000,
    hasPremiumFilters: true,
    hasApiAccess: true,
    hasCustomReports: false,
    hasDedicatedManager: false,
  },
  enterprise: {
    maxActiveAds: 999999, // Ilimitado
    maxMonthlyImpressions: 999999, // Ilimitado
    hasPremiumFilters: true,
    hasApiAccess: true,
    hasCustomReports: true,
    hasDedicatedManager: true,
  },
};

export const useBusinessSubscriptionLimits = (businessId?: string) => {
  const [subscription, setSubscription] = useState<BusinessSubscription | null>(null);
  const [adStats, setAdStats] = useState<AdStats>({ activeAdsCount: 0, totalImpressionsUsed: 0 });
  const [loading, setLoading] = useState(true);
  const [limits, setLimits] = useState<SubscriptionLimitsState>({
    canContactMaster: false,
    contactsRemaining: 0,
    contactsLimit: 0,
    contactsUsed: 0,
    canCreateAd: false,
    canPostAds: false,
    activeAdsCount: 0,
    maxActiveAds: 0,
    adsRemaining: 0,
    impressionsUsed: 0,
    impressionsLimit: 0,
    impressionsRemaining: 0,
    hasReachedImpressionLimit: false,
    hasPremiumFilters: false,
    hasApiAccess: false,
    hasCustomReports: false,
    hasDedicatedManager: false,
    hasAutomatedInvoicing: false,
    planType: 'none',
    isActive: false,
  });

  const fetchLimits = useCallback(async () => {
    if (!businessId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch subscription and ad stats in parallel
      const [subscriptionResult, adsResult] = await Promise.all([
        supabase
          .from('business_subscriptions')
          .select('*')
          .eq('business_id', businessId)
          .eq('status', 'active')
          .maybeSingle(),
        supabase
          .from('advertisements')
          .select('id, impressions_count, is_active')
          .eq('business_id', businessId)
      ]);

      const sub = subscriptionResult.data;
      const ads = adsResult.data || [];

      // Calculate ad stats
      const activeAdsCount = ads.filter(ad => ad.is_active).length;
      const totalImpressionsUsed = ads.reduce((sum, ad) => sum + (ad.impressions_count || 0), 0);
      
      setAdStats({ activeAdsCount, totalImpressionsUsed });
      setSubscription(sub);

      if (sub) {
        const planLimits = PLAN_LIMITS[sub.plan_type] || PLAN_LIMITS.basic;
        const contactsRemaining = sub.monthly_contacts_limit - sub.contacts_used;
        const impressionsLimit = sub.ad_impressions_limit || planLimits.maxMonthlyImpressions;
        const impressionsRemaining = Math.max(0, impressionsLimit - totalImpressionsUsed);
        const adsRemaining = Math.max(0, planLimits.maxActiveAds - activeAdsCount);

        setLimits({
          // Contactos
          canContactMaster: contactsRemaining > 0,
          contactsRemaining: Math.max(0, contactsRemaining),
          contactsLimit: sub.monthly_contacts_limit,
          contactsUsed: sub.contacts_used,
          
          // Anuncios
          canCreateAd: sub.can_post_ads && adsRemaining > 0,
          canPostAds: sub.can_post_ads,
          activeAdsCount,
          maxActiveAds: planLimits.maxActiveAds,
          adsRemaining,
          
          // Impresiones
          impressionsUsed: totalImpressionsUsed,
          impressionsLimit,
          impressionsRemaining,
          hasReachedImpressionLimit: totalImpressionsUsed >= impressionsLimit,
          
          // Features por plan
          hasPremiumFilters: planLimits.hasPremiumFilters,
          hasApiAccess: planLimits.hasApiAccess,
          hasCustomReports: planLimits.hasCustomReports,
          hasDedicatedManager: planLimits.hasDedicatedManager,
          hasAutomatedInvoicing: sub.plan_type !== 'basic',
          
          // General
          planType: sub.plan_type,
          isActive: true,
        });
      } else {
        // Sin suscripción
        setLimits({
          canContactMaster: false,
          contactsRemaining: 0,
          contactsLimit: 0,
          contactsUsed: 0,
          canCreateAd: false,
          canPostAds: false,
          activeAdsCount,
          maxActiveAds: 0,
          adsRemaining: 0,
          impressionsUsed: totalImpressionsUsed,
          impressionsLimit: 0,
          impressionsRemaining: 0,
          hasReachedImpressionLimit: true,
          hasPremiumFilters: false,
          hasApiAccess: false,
          hasCustomReports: false,
          hasDedicatedManager: false,
          hasAutomatedInvoicing: false,
          planType: 'none',
          isActive: false,
        });
      }
    } catch (error) {
      console.error("Error fetching business subscription limits:", error);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchLimits();
  }, [fetchLimits]);

  // Verificar y consumir un contacto
  const checkAndConsumeContact = async (): Promise<boolean> => {
    if (!subscription || !limits.canContactMaster) {
      toast.error("Has alcanzado el límite de contactos de tu plan. Actualiza para contactar más profesionales.");
      return false;
    }

    try {
      const { error } = await supabase
        .from('business_subscriptions')
        .update({ contacts_used: subscription.contacts_used + 1 })
        .eq('id', subscription.id);

      if (error) throw error;

      await fetchLimits();
      return true;
    } catch (error) {
      console.error("Error consuming contact:", error);
      toast.error("Error al procesar el contacto");
      return false;
    }
  };

  // Verificar si puede crear un anuncio
  const checkCanCreateAd = (): { canCreate: boolean; reason?: string } => {
    if (!subscription) {
      return { canCreate: false, reason: "Necesitas una suscripción activa para crear anuncios" };
    }
    if (!limits.canPostAds) {
      return { canCreate: false, reason: "Tu plan no incluye publicidad" };
    }
    if (limits.adsRemaining <= 0) {
      return { 
        canCreate: false, 
        reason: `Has alcanzado el límite de ${limits.maxActiveAds} anuncios activos de tu plan` 
      };
    }
    if (limits.hasReachedImpressionLimit) {
      return { 
        canCreate: false, 
        reason: `Has alcanzado el límite de ${limits.impressionsLimit.toLocaleString()} impresiones mensuales` 
      };
    }
    return { canCreate: true };
  };

  // Verificar antes de mostrar un anuncio (para controlar impresiones)
  const checkAdImpression = async (adId: string): Promise<boolean> => {
    if (limits.hasReachedImpressionLimit && limits.planType !== 'enterprise') {
      return false;
    }
    return true;
  };

  return {
    limits,
    loading,
    subscription,
    checkAndConsumeContact,
    checkCanCreateAd,
    checkAdImpression,
    refreshLimits: fetchLimits,
  };
};
