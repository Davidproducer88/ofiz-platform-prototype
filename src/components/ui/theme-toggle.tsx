import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center space-x-2">
        <Sun className="h-4 w-4 text-muted-foreground" />
        <Switch disabled checked={false} className="data-[state=unchecked]:bg-muted" />
        <Moon className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  // Use resolvedTheme to get the actual theme (handles "system" theme)
  const isDark = resolvedTheme === "dark";

  const handleToggle = (checked: boolean) => {
    // Set explicit theme (light or dark), not system
    setTheme(checked ? "dark" : "light");
  };

  return (
    <div className="flex items-center space-x-2">
      <Sun className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <Switch
        checked={isDark}
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
        aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      />
      <Moon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
    </div>
  );
}