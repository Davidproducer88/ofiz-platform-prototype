import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, PlayCircle, TrendingUp, Users, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const DemoBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
      <div className="container mx-auto px-4">
        <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-background via-primary/5 to-accent/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          
          <div className="relative p-8 md:p-12">
            <div className="text-center space-y-6">
              {/* Badge */}
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-hero text-white rounded-full shadow-elegant">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-semibold text-sm">MODO INTERACTIVO</span>
                </div>
              </div>

              {/* Título */}
              <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Explora Ofiz en Acción
              </h2>

              {/* Descripción */}
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Descubre cómo funciona la plataforma con datos reales. Prueba todas las funcionalidades 
                sin necesidad de registrarte.
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4">
                <div className="flex items-center gap-3 text-left p-4 bg-background/50 rounded-lg border border-border/50">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">5,000+ Profesionales</p>
                    <p className="text-xs text-muted-foreground">Verificados</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-left p-4 bg-background/50 rounded-lg border border-border/50">
                  <div className="p-2 rounded-full bg-accent/10">
                    <CheckCircle className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">12,000+ Clientes</p>
                    <p className="text-xs text-muted-foreground">Satisfechos</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-left p-4 bg-background/50 rounded-lg border border-border/50">
                  <div className="p-2 rounded-full bg-secondary/10">
                    <TrendingUp className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">98.5% Satisfacción</p>
                    <p className="text-xs text-muted-foreground">Rating promedio</p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 shadow-elegant hover:shadow-elegant-hover transition-all"
                  onClick={() => navigate('/demo')}
                >
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Ver Demo Interactivo
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  No requiere registro • Acceso inmediato
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
