import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface FeedItem {
  id: string;
  type: 'post' | 'service' | 'sponsored' | 'master_recommendation';
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
    const recencyWeight = 0.7; // Dar más peso a interacciones recientes

    interactions?.forEach((interaction, index) => {
      const category = interaction.category || 'other';
      const recencyFactor = Math.pow(recencyWeight, index / 10); // Decay exponencial
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

    // Factor de engagement (30% del score)
    if (itemType === 'post') {
      const engagementScore = 
        (item.views_count || 0) * 0.01 +
        (item.likes_count || 0) * 0.5 +
        (item.engagement_score || 0);
      score += Math.min(engagementScore, 50) * 0.3;
    }

    // Factor de calidad del master (20% del score)
    if (item.master || item.masters) {
      const master = item.master || item.masters;
      const qualityScore = 
        (master.rating || 0) * 5 +
        (master.total_reviews || 0) * 0.1 +
        (master.is_verified ? 10 : 0);
      score += Math.min(qualityScore, 30) * 0.2;
    }

    // Factor de recencia (10% del score)
    const hoursSinceCreation = 
      (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60);
    const recencyScore = Math.max(0, 24 - hoursSinceCreation);
    score += recencyScore * 0.1;

    return score;
  };

  const loadFeed = async (pageNum: number = 0) => {
    try {
      setLoading(true);
      const pageSize = 10;
      const offset = pageNum * pageSize;

      // Obtener preferencias del usuario si está autenticado
      const preferences = user?.id 
        ? await getUserPreferences(user.id)
        : {};

      // Cargar posts del feed
      const { data: posts } = await supabase
        .from('feed_posts')
        .select(`
          *,
          master:masters(
            id,
            business_name,
            rating,
            total_reviews,
            is_verified,
            profiles(avatar_url, full_name)
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      // Cargar servicios destacados (cada 5 items)
      const { data: services } = await supabase
        .from('services')
        .select(`
          *,
          masters(
            id,
            business_name,
            rating,
            total_reviews,
            is_verified,
            profiles(avatar_url, full_name)
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(3);

      // Cargar contenido patrocinado
      const { data: sponsored } = await supabase
        .from('sponsored_content')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(2);

      // Cargar masters recomendados
      const { data: masters } = await supabase
        .from('masters')
        .select(`
          *,
          profiles(avatar_url, full_name)
        `)
        .eq('is_verified', true)
        .order('rating', { ascending: false })
        .limit(2);

      // Convertir a FeedItems con scoring
      const postItems: FeedItem[] = (posts || []).map(post => ({
        id: post.id,
        type: 'post' as const,
        score: calculateRelevanceScore(post, preferences, 'post'),
        created_at: post.created_at,
        data: post
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

      const masterItems: FeedItem[] = (masters || []).map(master => ({
        id: master.id,
        type: 'master_recommendation' as const,
        score: calculateRelevanceScore(master, preferences, 'master'),
        created_at: master.created_at,
        data: master
      }));

      // Combinar y ordenar por score
      const allItems = [...postItems, ...serviceItems, ...sponsoredItems, ...masterItems];
      const sortedItems = allItems.sort((a, b) => b.score - a.score);

      // Insertar contenido patrocinado estratégicamente (cada 5 items)
      const finalFeed: FeedItem[] = [];
      sortedItems.forEach((item, index) => {
        if (item.type !== 'sponsored') {
          finalFeed.push(item);
          // Insertar patrocinado cada 5 items orgánicos
          if ((index + 1) % 5 === 0 && sponsoredItems.length > 0) {
            const sponsoredItem = sponsoredItems.shift();
            if (sponsoredItem) finalFeed.push(sponsoredItem);
          }
        }
      });

      if (pageNum === 0) {
        setFeedItems(finalFeed);
      } else {
        setFeedItems(prev => [...prev, ...finalFeed]);
      }

      setHasMore(finalFeed.length === pageSize);
    } catch (error) {
      console.error('Error loading feed:', error);
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
      like: 1.0,
      save: 2.0,
      share: 3.0,
      click: 0.5,
      booking: 5.0,
      message: 2.5
    };

    await supabase.from('user_interactions').insert([{
      user_id: user.id,
      target_id: targetId,
      target_type: targetType,
      interaction_type: interactionType,
      category: category as any,
      weight: weights[interactionType] || 1.0
    }]);

    // Actualizar contadores manualmente
    if (targetType === 'post') {
      if (interactionType === 'view') {
        const { data: post } = await supabase
          .from('feed_posts')
          .select('views_count')
          .eq('id', targetId)
          .single();
        
        if (post) {
          await supabase
            .from('feed_posts')
            .update({ views_count: (post.views_count || 0) + 1 })
            .eq('id', targetId);
        }
      } else if (interactionType === 'like') {
        const { data: post } = await supabase
          .from('feed_posts')
          .select('likes_count')
          .eq('id', targetId)
          .single();
        
        if (post) {
          await supabase
            .from('feed_posts')
            .update({ likes_count: (post.likes_count || 0) + 1 })
            .eq('id', targetId);
        }
      }
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
