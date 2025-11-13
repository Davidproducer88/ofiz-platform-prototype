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
    const hasSeenAnnouncement = localStorage.getItem("beta-announcement-seen-v2");
    
    if (!hasSeenAnnouncement) {
      // Show dialog after a short delay for better UX
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("beta-announcement-seen-v2", "true");
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
            ¡Bienvenido a Ofiz Beta! 🚀
          </DialogTitle>
          
          <DialogDescription className="text-center text-base space-y-4">
            <p className="text-lg font-semibold text-foreground">
              Estamos construyendo la plataforma líder de servicios profesionales en Uruguay
            </p>
            <p className="text-muted-foreground">
              Te invitamos a ser parte de nuestra etapa beta. Tu feedback es fundamental para crear la mejor experiencia.
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

          <div className="mt-4 p-6 rounded-lg bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border border-primary/20">
            <h4 className="font-bold text-center mb-3 text-lg">
              🎁 Beneficios Exclusivos Beta
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Comisiones reducidas</strong> para los primeros 1,000 usuarios</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Soporte prioritario</strong> durante todo el período beta</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Badge de usuario fundador</strong> en tu perfil</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Acceso anticipado</strong> a nuevas funcionalidades</span>
              </li>
            </ul>
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

        <p className="text-xs text-center text-muted-foreground mt-4">
          Al continuar, aceptas ser parte de nuestra comunidad beta y ayudarnos a mejorar la plataforma
        </p>
      </DialogContent>
    </Dialog>
  );
};