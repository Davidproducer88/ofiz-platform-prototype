import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface FeedItem {
  id: string;
  type: 'service_request' | 'available_master' | 'service' | 'sponsored';
  score: number;
  created_at: string;
  data: any;
}

export const useFeed = () => {
  const { user } = useAuth();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  // Calcular preferencias del usuario basadas en sus interacciones
  const getUserPreferences = async (userId: string) => {
    const { data: interactions } = await supabase
      .from('user_interactions')
      .select('category, interaction_type, weight, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    const categoryScores: Record<string, number> = {};
    const recencyWeight = 0.7;

    interactions?.forEach((interaction, index) => {
      const category = interaction.category || 'other';
      const recencyFactor = Math.pow(recencyWeight, index / 10);
      const score = (interaction.weight || 1) * recencyFactor;
      
      categoryScores[category] = (categoryScores[category] || 0) + score;
    });

    return categoryScores;
  };

  // Algoritmo de scoring personalizado
  const calculateRelevanceScore = (
    item: any,
    preferences: Record<string, number>,
    itemType: string
  ): number => {
    let score = 0;

    // Factor de categoría (40% del score)
    const categoryScore = preferences[item.category || 'other'] || 0;
    score += categoryScore * 0.4;

    // Factor de recencia (30% del score)
    const hoursSinceCreation = 
      (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60);
    const recencyScore = Math.max(0, 48 - hoursSinceCreation); // Priorizar últimas 48h
    score += recencyScore * 0.3;

    // Factor de calidad del master (30% del score)
    if (itemType === 'master' || itemType === 'service') {
      const master = item.masters || item;
      const qualityScore = 
        (master.rating || 0) * 5 +
        (master.total_reviews || 0) * 0.1 +
        (master.is_verified ? 10 : 0) +
        (master.experience_years || 0) * 0.5;
      score += Math.min(qualityScore, 30) * 0.3;
    }

    return score;
  };

  const loadFeed = async (pageNum: number = 0) => {
    try {
      console.log('🔄 Loading feed, page:', pageNum);
      setLoading(true);
      const pageSize = 10;
      const offset = pageNum * pageSize;

      // Obtener preferencias del usuario si está autenticado
      const preferences = user?.id 
        ? await getUserPreferences(user.id)
        : {};

      // Cargar solicitudes de servicio abiertas
      const { data: serviceRequests, error: requestsError } = await supabase
        .from('service_requests')
        .select(`
          *,
          profiles(
            full_name,
            avatar_url,
            city,
            address
          )
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .range(offset, offset + Math.floor(pageSize / 2) - 1);
      
      console.log('📋 Service requests loaded:', serviceRequests?.length || 0, requestsError);

      // Cargar servicios destacados
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select(`
          *,
          masters(
            id,
            business_name,
            rating,
            total_reviews,
            is_verified,
            hourly_rate,
            experience_years,
            profiles(avatar_url, full_name, city)
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(2);
      
      console.log('🛠️ Services loaded:', services?.length || 0, servicesError);

      // Cargar contenido patrocinado
      const { data: sponsored } = await supabase
        .from('sponsored_content')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      // Cargar maestros disponibles y verificados
      const { data: availableMasters, error: mastersError } = await supabase
        .from('masters')
        .select(`
          *,
          profiles(avatar_url, full_name, city, phone)
        `)
        .eq('is_verified', true)
        .order('rating', { ascending: false })
        .limit(3);
      
      console.log('👨‍🔧 Available masters loaded:', availableMasters?.length || 0, mastersError);

      // Convertir a FeedItems con scoring
      const requestItems: FeedItem[] = (serviceRequests || []).map(request => ({
        id: request.id,
        type: 'service_request' as const,
        score: calculateRelevanceScore(request, preferences, 'request') + 10, // Prioridad alta
        created_at: request.created_at,
        data: request
      }));

      const serviceItems: FeedItem[] = (services || []).map(service => ({
        id: service.id,
        type: 'service' as const,
        score: calculateRelevanceScore(service, preferences, 'service'),
        created_at: service.created_at,
        data: service
      }));

      const sponsoredItems: FeedItem[] = (sponsored || []).map(sp => ({
        id: sp.id,
        type: 'sponsored' as const,
        score: 1000, // Contenido patrocinado siempre tiene alta prioridad
        created_at: sp.created_at,
        data: sp
      }));

      const masterItems: FeedItem[] = (availableMasters || []).map(master => ({
        id: master.id,
        type: 'available_master' as const,
        score: calculateRelevanceScore(master, preferences, 'master'),
        created_at: master.created_at,
        data: master
      }));

      // Combinar y ordenar por score
      const allItems = [...requestItems, ...serviceItems, ...sponsoredItems, ...masterItems];
      const sortedItems = allItems.sort((a, b) => b.score - a.score);

      // Insertar contenido patrocinado estratégicamente (cada 5 items)
      const finalFeed: FeedItem[] = [];
      let organicCount = 0;
      
      sortedItems.forEach((item) => {
        if (item.type !== 'sponsored') {
          finalFeed.push(item);
          organicCount++;
          // Insertar patrocinado cada 5 items orgánicos
          if (organicCount % 5 === 0 && sponsoredItems.length > 0) {
            const sponsoredItem = sponsoredItems.shift();
            if (sponsoredItem) finalFeed.push(sponsoredItem);
          }
        }
      });

      // Agregar patrocinados restantes al final
      finalFeed.push(...sponsoredItems);

      console.log('✅ Final feed items:', finalFeed.length);
      
      if (pageNum === 0) {
        setFeedItems(finalFeed);
      } else {
        setFeedItems(prev => [...prev, ...finalFeed]);
      }

      setHasMore(finalFeed.length >= pageSize);
    } catch (error) {
      console.error('❌ Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackInteraction = async (
    targetId: string,
    targetType: string,
    interactionType: string,
    category?: string
  ) => {
    if (!user?.id) return;

    const weights: Record<string, number> = {
      view: 0.1,
      apply: 5.0,
      contact: 4.0,
      book: 5.0,
      view_profile: 1.0,
      click: 0.5
    };

    try {
      // Insertar interacción
      await supabase.from('user_interactions').insert([{
        user_id: user.id,
        target_id: targetId,
        target_type: targetType,
        interaction_type: interactionType,
        category: category as any,
        weight: weights[interactionType] || 1.0
      }]);

      // Actualizar contadores según el tipo de contenido
      if (targetType === 'sponsored') {
        if (interactionType === 'view') {
          const { data: content } = await supabase
            .from('sponsored_content')
            .select('impressions_count')
            .eq('id', targetId)
            .single();
          
          if (content) {
            await supabase
              .from('sponsored_content')
              .update({ impressions_count: (content.impressions_count || 0) + 1 })
              .eq('id', targetId);
          }
        } else if (interactionType === 'click') {
          const { data: content } = await supabase
            .from('sponsored_content')
            .select('clicks_count')
            .eq('id', targetId)
            .single();
          
          if (content) {
            await supabase
              .from('sponsored_content')
              .update({ clicks_count: (content.clicks_count || 0) + 1 })
              .eq('id', targetId);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error tracking interaction:', error);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadFeed(nextPage);
    }
  };

  const refresh = () => {
    setPage(0);
    setFeedItems([]);
    loadFeed(0);
  };

  useEffect(() => {
    loadFeed(0);
  }, [user?.id]);

  return {
    feedItems,
    loading,
    hasMore,
    loadMore,
    refresh,
    trackInteraction
  };
};
