import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Rocket, Users, Shield, TrendingUp, X } from "lucide-react";

export const BetaAnnouncementDialog = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check if user has already seen the announcement
    const hasSeenAnnouncement = localStorage.getItem("beta-announcement-seen-v3");
    
    if (!hasSeenAnnouncement) {
      // Show dialog after a short delay for better UX
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("beta-announcement-seen-v3", "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl border-2 border-primary/20 bg-gradient-to-br from-background via-background to-primary/5">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Cerrar</span>
        </button>

        <DialogHeader className="space-y-4 pt-2">
          <div className="flex items-center justify-center gap-2">
            <Badge className="bg-gradient-hero text-white border-0 px-4 py-2 text-base font-semibold shadow-elegant animate-pulse">
              <Sparkles className="h-4 w-4 mr-2" />
              BETA EXCLUSIVA
            </Badge>
          </div>
          
          <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
            🎉 ¡Únete como Usuario Fundador! 🚀
          </DialogTitle>
          
          <DialogDescription className="text-center text-base space-y-4">
            <p className="text-lg font-semibold text-foreground">
              Ofiz Beta: Tu oportunidad de ser pionero en la revolución de servicios profesionales
            </p>
            <p className="text-muted-foreground">
              Regístrate ahora y obtén beneficios exclusivos de usuario fundador que mantendrás de por vida.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 hover:border-primary/30 transition-all">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Rocket className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Funcionalidad Completa</h4>
                  <p className="text-sm text-muted-foreground">
                    Todas las funciones principales están operativas y listas para usar
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/10 hover:border-secondary/30 transition-all">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-secondary/10">
                  <Users className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Registro Abierto</h4>
                  <p className="text-sm text-muted-foreground">
                    Únete ahora y obtén beneficios exclusivos como usuario fundador
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-accent/5 border border-accent/10 hover:border-accent/30 transition-all">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-accent/10">
                  <Shield className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">100% Seguro</h4>
                  <p className="text-sm text-muted-foreground">
                    Pagos protegidos y verificación completa de todos los profesionales
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/10 hover:border-purple-500/30 transition-all">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-purple-500/10">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Lanzamiento Oficial</h4>
                  <p className="text-sm text-muted-foreground">
                    Próximamente con más funciones y mejoras basadas en tu feedback
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-6 rounded-lg bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border-2 border-primary/30">
            <h4 className="font-bold text-center mb-4 text-xl flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Beneficios de Usuario Fundador
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 bg-background/50 p-3 rounded-lg">
                <span className="text-primary text-lg">🎁</span>
                <div>
                  <span className="font-bold text-base">1 MES GRATIS</span>
                  <p className="text-muted-foreground mt-1">Prueba cualquier plan Premium sin costo durante 30 días desde el lanzamiento oficial</p>
                </div>
              </li>
              <li className="flex items-start gap-3 bg-background/50 p-3 rounded-lg">
                <span className="text-primary text-lg">💰</span>
                <div>
                  <span className="font-bold text-base">10% DE DESCUENTO PERMANENTE</span>
                  <p className="text-muted-foreground mt-1">Después del mes gratis, obtén 10% de descuento de por vida en todos los planes</p>
                </div>
              </li>
              <li className="flex items-start gap-3 bg-background/50 p-3 rounded-lg">
                <span className="text-primary text-lg">⭐</span>
                <div>
                  <span className="font-bold text-base">BADGE DE FUNDADOR</span>
                  <p className="text-muted-foreground mt-1">Distintivo especial en tu perfil que te identifica como usuario pionero</p>
                </div>
              </li>
              <li className="flex items-start gap-3 bg-background/50 p-3 rounded-lg">
                <span className="text-primary text-lg">🚀</span>
                <div>
                  <span className="font-bold text-base">ACCESO ANTICIPADO</span>
                  <p className="text-muted-foreground mt-1">Sé el primero en probar nuevas funcionalidades antes del lanzamiento público</p>
                </div>
              </li>
              <li className="flex items-start gap-3 bg-background/50 p-3 rounded-lg">
                <span className="text-primary text-lg">🎯</span>
                <div>
                  <span className="font-bold text-base">COMISIÓN REDUCIDA</span>
                  <p className="text-muted-foreground mt-1">Solo 5% de comisión vs 12% estándar (¡ahorra $700 por cada $10,000!)</p>
                </div>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/30">
              <p className="text-center text-sm font-semibold">
                ⏰ <span className="text-primary">Oferta limitada:</span> Solo para los primeros 1,000 usuarios registrados
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            variant="hero"
            className="w-full text-base font-semibold"
            onClick={handleClose}
          >
            <Sparkles className="h-5 w-5 mr-2" />
            ¡Comenzar Ahora!
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="w-full text-sm"
            onClick={handleClose}
          >
            Recordarme más tarde
          </Button>
        </div>

        <div className="mt-4 text-center space-y-2">
          <p className="text-sm font-semibold text-primary">
            💎 Los beneficios de fundador son permanentes y transferibles de por vida
          </p>
          <p className="text-xs text-muted-foreground">
            Al registrarte ahora, estos beneficios quedan garantizados en tu cuenta para siempre
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};