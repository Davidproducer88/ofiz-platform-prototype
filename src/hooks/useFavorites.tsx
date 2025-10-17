import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface FavoriteMaster {
  id: string;
  master_id: string;
  created_at: string;
  masters: {
    id: string;
    business_name: string;
    rating: number;
    total_reviews: number;
    hourly_rate: number | null;
  };
}

export const useFavorites = (clientId?: string) => {
  const [favorites, setFavorites] = useState<FavoriteMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (clientId) {
      fetchFavorites();
    }
  }, [clientId]);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorite_masters')
        .select(`
          id,
          master_id,
          created_at,
          masters (
            id,
            business_name,
            rating,
            total_reviews,
            hourly_rate
          )
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFavorites(data || []);
      setFavoriteIds(new Set((data || []).map(f => f.master_id)));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (masterId: string) => {
    if (!clientId) return;

    const isFavorite = favoriteIds.has(masterId);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorite_masters')
          .delete()
          .eq('client_id', clientId)
          .eq('master_id', masterId);

        if (error) throw error;

        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(masterId);
          return newSet;
        });

        toast({
          title: "Eliminado de favoritos",
          description: "El profesional ha sido eliminado de tus favoritos",
        });
      } else {
        const { error } = await supabase
          .from('favorite_masters')
          .insert({
            client_id: clientId,
            master_id: masterId,
          });

        if (error) throw error;

        setFavoriteIds(prev => new Set([...prev, masterId]));

        toast({
          title: "Agregado a favoritos",
          description: "El profesional ha sido agregado a tus favoritos",
        });
      }

      fetchFavorites();
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar favoritos",
        variant: "destructive",
      });
    }
  };

  const isFavorite = (masterId: string) => favoriteIds.has(masterId);

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite,
    refetch: fetchFavorites,
  };
};
