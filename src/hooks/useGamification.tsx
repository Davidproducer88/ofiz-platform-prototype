import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Create a simple fetch helper for tables not in types
const SUPABASE_URL = "https://dexrrbbpeidcxoynkyrt.supabase.co";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  requirements: Record<string, unknown> | null;
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

// Helper function to make direct REST API calls
async function fetchFromSupabase<T>(table: string, query: string = ''): Promise<T[]> {
  const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRleHJyYmJwZWlkY3hveW5reXJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg3NTUxNDMsImV4cCI6MjA0NDMzMTE0M30.oKI9M9wrRJAWHU-M72u9BJCX-GPkCNBb2sLLw4OvuDQ";
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch from ${table}`);
  }
  
  return response.json();
}

export const useGamification = () => {
  const { profile } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [pointsHistory, setPointsHistory] = useState<PointsHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGamificationData = useCallback(async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch all active badges
      const allBadges = await fetchFromSupabase<Badge>('badges', '?is_active=eq.true');
      
      // Fetch user's earned badges with badge details
      const earnedBadges = await fetchFromSupabase<any>(
        'user_badges', 
        `?user_id=eq.${profile.id}&select=*,badges(*)`
      );
      
      // Fetch user level
      const levels = await fetchFromSupabase<UserLevel>(
        'user_levels', 
        `?user_id=eq.${profile.id}`
      );
      
      // Fetch points history
      const history = await fetchFromSupabase<PointsHistoryEntry>(
        'points_history', 
        `?user_id=eq.${profile.id}&order=created_at.desc&limit=20`
      );

      setBadges(allBadges || []);
      setUserBadges(earnedBadges?.map((ub: any) => ({
        ...ub,
        badge: ub.badges as Badge
      })) || []);
      setUserLevel(levels?.[0] || null);
      setPointsHistory(history || []);
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    if (profile?.id) {
      fetchGamificationData();
    } else {
      setLoading(false);
    }
  }, [profile?.id, fetchGamificationData]);

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
