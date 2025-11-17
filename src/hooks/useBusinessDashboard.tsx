import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useBusinessDashboard = (userId: string | undefined) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [businessProfile, setBusinessProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [stats, setStats] = useState({
    activeAds: 0,
    totalImpressions: 0,
    totalClicks: 0,
    openContracts: 0,
    contactsUsed: 0,
    contactsLimit: 50,
    products: 0,
    pendingOrders: 0,
    totalRevenue: 0
  });

  const fetchBusinessData = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);

      // Fetch all data in parallel for better performance
      const [
        { data: businessData, error: profileError },
        { data: subData, error: subError },
        { data: adsData },
        { data: contractsData },
        { data: productsData },
        { data: ordersData }
      ] = await Promise.all([
        supabase
          .from('business_profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle(),
        supabase
          .from('business_subscriptions')
          .select('*')
          .eq('business_id', userId)
          .eq('status', 'active')
          .maybeSingle(),
        supabase
          .from('advertisements')
          .select('impressions_count, clicks_count, is_active')
          .eq('business_id', userId),
        supabase
          .from('business_contracts')
          .select('status')
          .eq('business_id', userId),
        supabase
          .from('marketplace_products')
          .select('id, status')
          .eq('business_id', userId),
        supabase
          .from('marketplace_orders')
          .select('status, seller_amount')
          .eq('seller_id', userId)
      ]);

      if (profileError) {
        console.error('Error fetching business profile:', profileError);
        throw profileError;
      }

      if (subError && subError.code !== 'PGRST116') {
        console.error('Error fetching subscription:', subError);
      }

      setBusinessProfile(businessData);
      setSubscription(subData);

      // Calculate stats
      const activeAds = adsData?.filter(ad => ad.is_active).length || 0;
      const totalImpressions = adsData?.reduce((sum, ad) => sum + (ad.impressions_count || 0), 0) || 0;
      const totalClicks = adsData?.reduce((sum, ad) => sum + (ad.clicks_count || 0), 0) || 0;
      const openContracts = contractsData?.filter(c => c.status === 'open').length || 0;
      const products = productsData?.filter(p => p.status === 'active').length || 0;
      const pendingOrders = ordersData?.filter(o => ['pending', 'confirmed', 'shipped'].includes(o.status || '')).length || 0;
      const totalRevenue = ordersData?.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.seller_amount || 0), 0) || 0;

      setStats({
        activeAds,
        totalImpressions,
        totalClicks,
        openContracts,
        contactsUsed: subData?.contacts_used || 0,
        contactsLimit: subData?.monthly_contacts_limit || 50,
        products,
        pendingOrders,
        totalRevenue
      });
    } catch (error: any) {
      console.error('Error loading business data:', error);
      toast({
        title: "Error al cargar datos",
        description: "No se pudieron cargar los datos del dashboard. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  const handleSubscriptionSuccess = useCallback(() => {
    toast({
      title: "¡Suscripción activada!",
      description: "Tu suscripción ha sido procesada correctamente. Puede tomar unos minutos en aparecer.",
    });
    
    // Refresh data after a short delay
    setTimeout(() => fetchBusinessData(), 2000);
  }, [fetchBusinessData, toast]);

  useEffect(() => {
    fetchBusinessData();
  }, [fetchBusinessData]);

  return {
    loading,
    businessProfile,
    subscription,
    stats,
    refetch: fetchBusinessData,
    handleSubscriptionSuccess
  };
};
