import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FounderBadgeProps {
  className?: string;
  showTooltip?: boolean;
}

export const FounderBadge = ({ className = "", showTooltip = true }: FounderBadgeProps) => {
  const badge = (
    <Badge 
      variant="outline" 
      className={`bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400 ${className}`}
    >
      <Sparkles className="h-3 w-3 mr-1" />
      Fundador
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">Usuario Fundador</p>
          <p className="text-xs text-muted-foreground">Beneficios lifetime garantizados</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
