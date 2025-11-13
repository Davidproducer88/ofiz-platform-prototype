import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Sparkles, Users, Download } from "lucide-react";
import { FounderBadge } from "@/components/FounderBadge";
import { toast } from "@/hooks/use-toast";

const TOTAL_FOUNDER_SLOTS = 1000;

export const FounderCounter = () => {
  const [founderCount, setFounderCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const loadFounderCount = async () => {
    try {
      const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_founder", true);

      if (error) throw error;
      setFounderCount(count || 0);
    } catch (error) {
      console.error("Error loading founder count:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFounderCount();

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel("founder-counter-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: "is_founder=eq.true",
        },
        () => {
          loadFounderCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const remainingSlots = TOTAL_FOUNDER_SLOTS - founderCount;
  const percentageFilled = (founderCount / TOTAL_FOUNDER_SLOTS) * 100;
  const isAlmostFull = remainingSlots <= 100;
  const isCritical = remainingSlots <= 50;

  const handleExportFounders = async () => {
    try {
      toast({
        title: "Exportando datos",
        description: "Generando archivo CSV...",
      });

      // Obtener todos los usuarios fundadores con sus emails
      const { data: founders, error } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          phone,
          city,
          user_type,
          is_founder,
          founder_registered_at,
          founder_discount_percentage,
          created_at,
          login_provider
        `)
        .eq("is_founder", true)
        .order("founder_registered_at", { ascending: true });

      if (error) throw error;

      // Crear CSV (sin emails por seguridad - los admins pueden verlos en el dashboard)
      const headers = [
        "ID",
        "Nombre Completo",
        "Teléfono",
        "Ciudad",
        "Tipo Usuario",
        "Descuento (%)",
        "Fecha Registro Fundador",
        "Fecha Registro General",
        "Proveedor Login",
      ];

      const csvRows = [headers.join(",")];

      (founders || []).forEach((founder) => {
        const row = [
          `"${founder.id}"`,
          `"${founder.full_name || "N/A"}"`,
          `"${founder.phone || "N/A"}"`,
          `"${founder.city || "N/A"}"`,
          `"${founder.user_type}"`,
          `"${founder.founder_discount_percentage || 0}%"`,
          `"${founder.founder_registered_at ? new Date(founder.founder_registered_at).toLocaleDateString("es-UY") : "N/A"}"`,
          `"${new Date(founder.created_at).toLocaleDateString("es-UY")}"`,
          `"${founder.login_provider || "email"}"`,
        ];
        csvRows.push(row.join(","));
      });

      const csvContent = csvRows.join("\n");

      // Descargar archivo
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `usuarios_fundadores_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Exportación exitosa",
        description: `Se exportaron ${(founders || []).length} usuarios fundadores`,
      });
    } catch (error) {
      console.error("Error exporting founders:", error);
      toast({
        variant: "destructive",
        title: "Error al exportar",
        description: "No se pudo generar el archivo CSV",
      });
    }
  };

  return (
    <Card className="overflow-hidden border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-background">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500 animate-pulse" />
            Programa de Fundadores
            <FounderBadge showTooltip={false} className="hidden sm:inline-flex" />
          </CardTitle>
          <Button
            onClick={handleExportFounders}
            variant="outline"
            size="sm"
            className="border-amber-500/30 hover:bg-amber-500/10"
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Exportar CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contador principal */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600 dark:text-amber-400" />
            <div>
              <div className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                {loading ? "..." : founderCount}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                de {TOTAL_FOUNDER_SLOTS} usuarios fundadores
              </div>
            </div>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="space-y-2">
          <Progress 
            value={percentageFilled} 
            className="h-3 sm:h-4"
          />
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">
              {percentageFilled.toFixed(1)}% ocupado
            </span>
            <span className={`font-semibold ${
              isCritical 
                ? "text-red-600 dark:text-red-400 animate-pulse" 
                : isAlmostFull 
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-green-600 dark:text-green-400"
            }`}>
              {remainingSlots} disponibles
            </span>
          </div>
        </div>

        {/* Alertas */}
        {isCritical && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-center">
            <p className="text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400 flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 animate-pulse" />
              ¡Últimos {remainingSlots} lugares disponibles!
            </p>
          </div>
        )}
        {isAlmostFull && !isCritical && (
          <div className="rounded-lg bg-orange-500/10 border border-orange-500/30 p-3 text-center">
            <p className="text-xs sm:text-sm font-medium text-orange-600 dark:text-orange-400">
              Quedan menos de 100 lugares disponibles
            </p>
          </div>
        )}

        {/* Info adicional */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2 border-t border-amber-500/20">
          <div className="text-center space-y-1">
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {remainingSlots}
            </div>
            <div className="text-xs text-muted-foreground">
              Lugares restantes
            </div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              Lifetime
            </div>
            <div className="text-xs text-muted-foreground">
              Beneficios
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
