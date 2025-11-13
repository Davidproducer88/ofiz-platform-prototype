import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, Check, Users, TrendingUp } from "lucide-react";
import { FounderBadge } from "@/components/FounderBadge";
import { toast } from "@/hooks/use-toast";

interface DiscountCode {
  code: string;
  discount_percentage: number;
  times_used: number;
  is_active: boolean;
  description: string;
  created_at: string;
}

interface CodeUsage {
  id: string;
  discount_amount: number;
  created_at: string;
  booking_id: string;
}

export const FounderDiscountCode = () => {
  const [code, setCode] = useState<DiscountCode | null>(null);
  const [usageHistory, setUsageHistory] = useState<CodeUsage[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFounderCode();
  }, []);

  const loadFounderCode = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Obtener código de descuento
      const { data: codeData, error: codeError } = await supabase
        .from("founder_discount_codes" as any)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle() as any;

      if (codeError) throw codeError;
      setCode(codeData as any);

      // Obtener historial de uso
      if (codeData?.id) {
        const { data: usageData, error: usageError } = await supabase
          .from("founder_code_usage" as any)
          .select("*")
          .eq("code_id", codeData.id)
          .order("created_at", { ascending: false })
          .limit(10) as any;

        if (usageError) throw usageError;
        setUsageHistory(usageData || []);
      }
    } catch (error) {
      console.error("Error loading founder code:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code.code);
      setCopied(true);
      toast({
        title: "¡Código copiado!",
        description: "El código se copió al portapapeles",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo copiar el código",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Cargando...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!code) {
    return null;
  }

  const totalSavings = usageHistory.reduce((sum, usage) => sum + Number(usage.discount_amount), 0);

  return (
    <div className="space-y-4">
      {/* Tarjeta principal del código */}
      <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-background">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500" />
              Tu Código de Fundador
              <FounderBadge showTooltip={false} />
            </CardTitle>
            <Badge variant={code.is_active ? "default" : "secondary"} className="bg-green-500/10 text-green-700 border-green-500/30">
              {code.is_active ? "Activo" : "Inactivo"}
            </Badge>
          </div>
          <CardDescription>
            {code.description || "Beneficio lifetime - Sin límite de usos"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Código de descuento */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 p-4 bg-background rounded-lg border-2 border-amber-500/30">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Tu código personal</p>
                <code className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 tracking-wider">
                  {code.code}
                </code>
              </div>
              <Button
                onClick={handleCopyCode}
                variant="outline"
                size="icon"
                className="shrink-0 border-amber-500/30 hover:bg-amber-500/10"
              >
                {copied ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-foreground">
                  {code.discount_percentage}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">Descuento</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-foreground flex items-center justify-center gap-1">
                  <Users className="h-5 w-5" />
                  {code.times_used}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Veces usado</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center col-span-2 sm:col-span-1">
                <p className="text-2xl sm:text-3xl font-bold text-foreground">
                  ${totalSavings.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Ahorrado total</p>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-4 space-y-2">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  ¡Comparte tu código!
                </p>
                <p className="text-xs text-muted-foreground">
                  Cuando otros usen tu código, también recibirán un descuento especial. 
                  Es tu forma de invitar a amigos y familiares a la plataforma.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historial de uso */}
      {usageHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Historial de Uso
            </CardTitle>
            <CardDescription>
              Últimos {usageHistory.length} usos de tu código
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {usageHistory.map((usage) => (
                <div
                  key={usage.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      Ahorraste ${Number(usage.discount_amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(usage.created_at).toLocaleDateString("es-UY", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    Reserva
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
