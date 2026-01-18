import { Shield, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VerifiedBadgeProps {
  isVerified: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const VerifiedBadge = ({ 
  isVerified, 
  size = 'md',
  showLabel = false 
}: VerifiedBadgeProps) => {
  if (!isVerified) return null;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const BadgeContent = (
    <div className="inline-flex items-center gap-1">
      <div className="relative">
        <Shield className={`${sizeClasses[size]} text-primary fill-primary/20`} />
        <CheckCircle className={`absolute -bottom-0.5 -right-0.5 ${size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} text-green-500 bg-white rounded-full`} />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-primary">Verificado</span>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {BadgeContent}
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">Profesional verificado por Ofiz</p>
          <p className="text-xs text-muted-foreground">Identidad y documentos confirmados</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Badge variant for use in cards/lists
export const VerifiedBadgeCompact = ({ isVerified }: { isVerified: boolean }) => {
  if (!isVerified) return null;

  return (
    <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
      <Shield className="w-3 h-3" />
      Verificado
    </Badge>
  );
};
