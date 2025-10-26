import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PlatformStats {
  total_masters: number;
  total_clients: number;
  total_bookings: number;
  completed_bookings: number;
  average_rating: number;
  total_reviews: number;
  satisfaction_rate: number;
}

export const usePlatformStats = () => {
  const [stats, setStats] = useState<PlatformStats>({
    total_masters: 0,
    total_clients: 0,
    total_bookings: 0,
    completed_bookings: 0,
    average_rating: 0,
    total_reviews: 0,
    satisfaction_rate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
    
    // Set up real-time subscriptions for stats updates
    const channel = supabase
      .channel('platform-stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'masters'
        },
        () => fetchStats()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => fetchStats()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews'
        },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStats = async () => {
    try {
      setError(null);
      const { data, error: rpcError } = await supabase.rpc('get_platform_stats');
      
      if (rpcError) {
        console.error('Error fetching platform stats:', rpcError);
        setError('Error al cargar estadísticas');
        
        // Fallback: fetch data directly if RPC fails
        const [mastersResult, clientsResult, bookingsResult, reviewsResult] = await Promise.all([
          supabase.from('masters').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_type', 'client'),
          supabase.from('bookings').select('*', { count: 'exact', head: true }),
          supabase.from('reviews').select('rating'),
        ]);

        const completedBookings = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed');

        const avgRating = reviewsResult.data?.length 
          ? reviewsResult.data.reduce((sum, r) => sum + r.rating, 0) / reviewsResult.data.length 
          : 0;

        const satisfiedReviews = reviewsResult.data?.filter(r => r.rating >= 4).length || 0;
        const satisfactionRate = reviewsResult.data?.length 
          ? (satisfiedReviews / reviewsResult.data.length) * 100 
          : 0;

        setStats({
          total_masters: mastersResult.count || 0,
          total_clients: clientsResult.count || 0,
          total_bookings: bookingsResult.count || 0,
          completed_bookings: completedBookings.count || 0,
          average_rating: Math.round(avgRating * 10) / 10,
          total_reviews: reviewsResult.data?.length || 0,
          satisfaction_rate: Math.round(satisfactionRate),
        });
        return;
      }

      if (data) {
        const statsData = data as any;
        setStats({
          total_masters: Number(statsData.total_masters) || 0,
          total_clients: Number(statsData.total_clients) || 0,
          total_bookings: Number(statsData.total_bookings) || 0,
          completed_bookings: Number(statsData.completed_bookings) || 0,
          average_rating: Number(statsData.average_rating) || 0,
          total_reviews: Number(statsData.total_reviews) || 0,
          satisfaction_rate: Number(statsData.satisfaction_rate) || 0,
        });
      }
    } catch (error) {
      console.error('Error in fetchStats:', error);
      setError('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, refetch: fetchStats };
};
