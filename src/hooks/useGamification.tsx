import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Json } from '@/integrations/supabase/types';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  requirements: Json;
}

interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

interface UserLevel {
  id: string;
  current_level: number;
  experience_points: number;
  total_badges: number;
}

interface PointsHistoryEntry {
  id: string;
  points: number;
  reason: string;
  created_at: string;
}

// XP required for each level
const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];

export const useGamification = () => {
  const { profile } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [pointsHistory, setPointsHistory] = useState<PointsHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchGamificationData();
    }
  }, [profile?.id]);

  const fetchGamificationData = async () => {
    if (!profile?.id) return;

    try {
      // Fetch all badges
      const { data: allBadges } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true);

      // Fetch user's earned badges
      const { data: earnedBadges } = await supabase
        .from('user_badges')
        .select('*, badges(*)')
        .eq('user_id', profile.id);

      // Fetch user level
      const { data: level } = await supabase
        .from('user_levels')
        .select('*')
        .eq('user_id', profile.id)
        .single();

      // Fetch points history
      const { data: history } = await supabase
        .from('points_history')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20);

      setBadges(allBadges || []);
      setUserBadges(earnedBadges?.map(ub => ({
        ...ub,
        badge: ub.badges as unknown as Badge
      })) || []);
      setUserLevel(level);
      setPointsHistory(history || []);
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressToNextLevel = () => {
    if (!userLevel) return { current: 0, required: 100, percentage: 0 };
    
    const currentLevelXP = LEVEL_THRESHOLDS[userLevel.current_level - 1] || 0;
    const nextLevelXP = LEVEL_THRESHOLDS[userLevel.current_level] || LEVEL_THRESHOLDS[9];
    const xpInCurrentLevel = userLevel.experience_points - currentLevelXP;
    const xpRequiredForLevel = nextLevelXP - currentLevelXP;
    
    return {
      current: xpInCurrentLevel,
      required: xpRequiredForLevel,
      percentage: Math.min((xpInCurrentLevel / xpRequiredForLevel) * 100, 100)
    };
  };

  const getEarnedBadgeIds = () => {
    return new Set(userBadges.map(ub => ub.badge_id));
  };

  const getLevelTitle = (level: number) => {
    const titles = [
      'Novato',
      'Aprendiz',
      'Conocedor',
      'Experto',
      'Profesional',
      'Maestro',
      'Artesano',
      'Virtuoso',
      'Leyenda',
      'Maestro Supremo'
    ];
    return titles[level - 1] || 'Novato';
  };

  return {
    badges,
    userBadges,
    userLevel,
    pointsHistory,
    loading,
    refetch: fetchGamificationData,
    getProgressToNextLevel,
    getEarnedBadgeIds,
    getLevelTitle
  };
};
