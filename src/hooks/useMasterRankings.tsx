import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MasterRanking {
  id: string;
  master_id: string;
  ranking_score: number;
  total_completed_jobs: number;
  average_rating: number;
  total_earnings: number;
  completion_rate: number;
  rank_position: number | null;
  last_updated: string;
  masters?: {
    business_name: string;
    rating: number;
    total_reviews: number;
  };
}

export const useMasterRankings = (limit?: number) => {
  const [rankings, setRankings] = useState<MasterRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('master-rankings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'master_rankings'
        },
        () => {
          fetchRankings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  const fetchRankings = async () => {
    try {
      let query = supabase
        .from('master_rankings')
        .select(`
          *,
          masters:master_id (
            business_name,
            rating,
            total_reviews
          )
        `)
        .order('rank_position', { ascending: true, nullsFirst: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRankings(data || []);
    } catch (error) {
      console.error('Error fetching rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  return { rankings, loading, refetch: fetchRankings };
};
