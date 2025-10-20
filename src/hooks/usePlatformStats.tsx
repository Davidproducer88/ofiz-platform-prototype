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
    total_masters: 5000,
    total_clients: 0,
    total_bookings: 50000,
    completed_bookings: 0,
    average_rating: 4.8,
    total_reviews: 0,
    satisfaction_rate: 98,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_platform_stats');
      
      if (error) {
        console.error('Error fetching platform stats:', error);
        return;
      }

      if (data) {
        const statsData = data as any;
        setStats({
          total_masters: statsData.total_masters || 5000,
          total_clients: statsData.total_clients || 0,
          total_bookings: statsData.total_bookings || 0,
          completed_bookings: statsData.completed_bookings || 50000,
          average_rating: statsData.average_rating || 4.8,
          total_reviews: statsData.total_reviews || 0,
          satisfaction_rate: statsData.satisfaction_rate || 98,
        });
      }
    } catch (error) {
      console.error('Error in fetchStats:', error);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, refetch: fetchStats };
};
