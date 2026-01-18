import { useGamification } from '@/hooks/useGamification';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface LevelBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  className?: string;
}

export const LevelBadge = ({ size = 'md', showProgress = false, className }: LevelBadgeProps) => {
  const { userLevel, getProgressToNextLevel, getLevelTitle, loading } = useGamification();

  if (loading || !userLevel) return null;

  const level = userLevel.current_level;
  const progress = getProgressToNextLevel();

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-lg'
  };

  const levelColors = [
    'from-gray-400 to-gray-500',       // 1
    'from-green-400 to-green-600',     // 2
    'from-blue-400 to-blue-600',       // 3
    'from-purple-400 to-purple-600',   // 4
    'from-pink-400 to-pink-600',       // 5
    'from-orange-400 to-orange-600',   // 6
    'from-red-400 to-red-600',         // 7
    'from-indigo-400 to-indigo-600',   // 8
    'from-yellow-400 to-yellow-600',   // 9
    'from-primary to-primary/70'       // 10
  ];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-2", className)}>
            <div 
              className={cn(
                "rounded-full flex items-center justify-center font-bold text-white shadow-md bg-gradient-to-br",
                sizeClasses[size],
                levelColors[level - 1] || levelColors[0]
              )}
            >
              {level}
            </div>
            {showProgress && (
              <div className="flex-1 min-w-[60px]">
                <Progress value={progress.percentage} className="h-1.5" />
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-semibold">{getLevelTitle(level)}</p>
            <p className="text-xs text-muted-foreground">
              Nivel {level} • {userLevel.experience_points} XP
            </p>
            {level < 10 && (
              <p className="text-xs text-primary mt-1">
                {progress.required - progress.current} XP para subir
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
