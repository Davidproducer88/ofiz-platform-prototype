import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useGamification } from '@/hooks/useGamification';
import { 
  Trophy, Star, Crown, Calendar, MessageSquare, Users, Compass,
  Hammer, Award, Zap, Sparkles, Medal, Heart, ShieldCheck, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<any>> = {
  Calendar, Star, Crown, MessageSquare, Users, Compass,
  Hammer, Award, Trophy, Zap, Sparkles, Medal, Heart, ShieldCheck, Clock
};

export const BadgesDisplay = () => {
  const { 
    badges, 
    userBadges, 
    userLevel, 
    loading, 
    getProgressToNextLevel, 
    getEarnedBadgeIds,
    getLevelTitle 
  } = useGamification();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="grid grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progress = getProgressToNextLevel();
  const earnedIds = getEarnedBadgeIds();
  const level = userLevel?.current_level || 1;
  const xp = userLevel?.experience_points || 0;

  // Group badges by category
  const badgesByCategory = badges.reduce((acc, badge) => {
    if (!acc[badge.category]) acc[badge.category] = [];
    acc[badge.category].push(badge);
    return acc;
  }, {} as Record<string, typeof badges>);

  const categoryLabels: Record<string, string> = {
    milestone: '🎯 Hitos',
    achievement: '⭐ Logros',
    special: '💎 Especiales'
  };

  return (
    <div className="space-y-6">
      {/* Level Card */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-lg">
                  {level}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                  <Star className="h-3 w-3 text-accent-foreground" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold">{getLevelTitle(level)}</h3>
                <p className="text-sm text-muted-foreground">
                  Nivel {level} • {xp.toLocaleString()} XP
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="text-xs">
                {userBadges.length} / {badges.length} badges
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso al nivel {Math.min(level + 1, 10)}</span>
              <span className="text-muted-foreground">
                {progress.current} / {progress.required} XP
              </span>
            </div>
            <Progress value={progress.percentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Badges by Category */}
      {Object.entries(badgesByCategory).map(([category, categoryBadges]) => (
        <Card key={category}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {categoryLabels[category] || category}
            </CardTitle>
            <CardDescription>
              {earnedIds.size > 0 
                ? `${categoryBadges.filter(b => earnedIds.has(b.id)).length} de ${categoryBadges.length} desbloqueados`
                : 'Completa acciones para desbloquear'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              <TooltipProvider>
                {categoryBadges.map((badge) => {
                  const IconComponent = iconMap[badge.icon] || Award;
                  const isEarned = earnedIds.has(badge.id);
                  const earnedBadge = userBadges.find(ub => ub.badge_id === badge.id);

                  return (
                    <Tooltip key={badge.id}>
                      <TooltipTrigger asChild>
                        <div 
                          className={cn(
                            "relative flex flex-col items-center p-3 rounded-xl transition-all cursor-pointer",
                            isEarned 
                              ? "bg-primary/10 border-2 border-primary/30 hover:border-primary/50" 
                              : "bg-muted/50 border-2 border-transparent opacity-50 grayscale hover:opacity-70"
                          )}
                        >
                          <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center mb-2",
                            isEarned 
                              ? "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md" 
                              : "bg-muted text-muted-foreground"
                          )}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <span className="text-xs font-medium text-center line-clamp-2">
                            {badge.name}
                          </span>
                          {isEarned && (
                            <Badge variant="secondary" className="mt-1 text-[10px] px-1.5">
                              +{badge.points} XP
                            </Badge>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <div className="space-y-1">
                          <p className="font-semibold">{badge.name}</p>
                          <p className="text-sm text-muted-foreground">{badge.description}</p>
                          <p className="text-xs text-primary">+{badge.points} puntos de experiencia</p>
                          {earnedBadge && (
                            <p className="text-xs text-muted-foreground">
                              Obtenido: {new Date(earnedBadge.earned_at).toLocaleDateString('es-CL')}
                            </p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
