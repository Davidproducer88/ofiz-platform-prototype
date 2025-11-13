import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export const DemoModeIndicator = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4">
      <Badge 
        className="bg-gradient-hero text-white border-0 px-4 py-2 shadow-elegant animate-pulse"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Modo Demo
      </Badge>
    </div>
  );
};
