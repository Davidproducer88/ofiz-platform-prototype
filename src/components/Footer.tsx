import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logoFooter from "@/assets/logo-ofiz-new.png";
export const Footer = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [email, setEmail] = useState("");
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu email",
        variant: "destructive"
      });
      return;
    }
    try {
      const {
        error
      } = await supabase.from('newsletter_subscriptions').insert({
        email,
        user_id: (await supabase.auth.getUser()).data.user?.id
      });
      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Ya estás suscrito",
            description: "Este email ya está registrado en nuestra newsletter",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }
      toast({
        title: "¡Gracias por suscribirte!",
        description: "Pronto recibirás noticias y ofertas especiales"
      });
      setEmail("");
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: "Error",
        description: "No pudimos completar la suscripción. Intenta nuevamente.",
        variant: "destructive"
      });
    }
  };
  const handleSocialClick = (platform: string) => {
    toast({
      title: "Próximamente",
      description: `Síguenos en ${platform} - Enlaces disponibles pronto`
    });
  };
  return <footer className="relative bg-gradient-to-b from-muted/30 to-muted/50 border-t border-border/50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="container relative z-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <img src={logoFooter} alt="Ofiz" className="h-10 hover:scale-105 transition-transform cursor-pointer" />
            <p className="text-muted-foreground leading-relaxed">
              Servicios profesionales para tu hogar & oficina. 
              Descubrí el oficio que necesitás.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>Montevideo, Uruguay</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>+598 98 817 806</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>hola@ofiz.com.uy</span>
              </div>
            </div>
          </div>

          {/* Para Clientes */}
          <div className="space-y-4">
            <h4 className="font-semibold">Para Clientes</h4>
          <div className="space-y-2">
              <button onClick={() => navigate('/auth?type=client')} className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full">
                Publicar Encargo
              </button>
              <button onClick={() => navigate('/search-masters')} className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full">
                Buscar Profesionales
              </button>
              <button onClick={() => navigate('/how-it-works')} className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full">
                Cómo Funciona
              </button>
              <button onClick={() => navigate('/pricing')} className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full">
                Precios y Tarifas
              </button>
              <button onClick={() => navigate('/guarantees')} className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full">
                Garantías
              </button>
            </div>
          </div>

          {/* Para Profesionales */}
          <div className="space-y-4">
            <h4 className="font-semibold">Para Profesionales</h4>
            <div className="space-y-2">
              <button onClick={() => navigate('/auth?type=master')} className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full">
                Registrarse como Maestro
              </button>
              <button onClick={() => navigate('/auth?type=master')} className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full">
                Planes Premium
              </button>
              <button onClick={() => navigate('/help-center')} className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full">
                Centro de Ayuda
              </button>
              <button onClick={() => navigate('/auth?type=master')} className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full">
                Verificación de Perfil
              </button>
              <button onClick={() => navigate('/auth?type=master')} className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full">
                Herramientas
              </button>
            </div>
          </div>

          {/* Empresa */}
          <div className="space-y-4">
            <h4 className="font-semibold">Sobre nosotros</h4>
            <div className="space-y-2">
              <button onClick={() => navigate('/about')} className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full">
                Sobre Ofiz
              </button>
              <button onClick={() => navigate('/terms')} className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full">
                Términos y Condiciones
              </button>
              <button onClick={() => navigate('/privacy')} className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full">
                Política de Privacidad
              </button>
              <button onClick={() => navigate('/contact')} className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full">
                Contacto
              </button>
              <button onClick={() => navigate('/blog')} className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full">
                Blog
              </button>
              <button onClick={() => navigate('/sitemap')} className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full">
                Mapa del Sitio
              </button>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-border/50 pt-12 mt-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-border/50">
            <div className="text-center md:text-left space-y-2">
              <h4 className="font-semibold text-xl flex items-center gap-2 justify-center md:justify-start">
                <Mail className="h-5 w-5 text-primary" />
                Mantenete informado
              </h4>
              <p className="text-sm text-muted-foreground">
                Recibí las últimas noticias, ofertas especiales y consejos para tu hogar
              </p>
            </div>
            
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <input type="email" placeholder="Tu email" value={email} onChange={e => setEmail(e.target.value)} className="px-4 py-2.5 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all min-w-[250px]" />
              <Button type="submit" className="shadow-soft">Suscribirse</Button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border/50 pt-8 mt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <Badge className="bg-gradient-hero text-white border-0 shadow-soft">
                Beta
              </Badge>
              <p className="text-sm text-muted-foreground text-center md:text-left">© 2026 Ofiz. Todos los derechos reservados. | Orbital Estudio SAS<span className="gradient-text font-semibold">Orbital Estudio SAS </span>
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Mercado Pago Partner */}
              <a href="https://www.mercadopago.com.uy/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity" aria-label="Mercado Pago - Partner Tecnológico">
                <img src="/partners/mercadopago.png" alt="Mercado Pago" className="h-6 md:h-7 w-auto" />
                <span className="text-xs text-muted-foreground hidden sm:inline">Partner Tecnológico</span>
              </a>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleSocialClick("Facebook")} className="text-secondary hover:text-secondary-hover hover:bg-secondary/10 hover:scale-110 transition-all rounded-full">
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleSocialClick("Instagram")} className="text-secondary hover:text-secondary-hover hover:bg-secondary/10 hover:scale-110 transition-all rounded-full">
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleSocialClick("Twitter")} className="text-secondary hover:text-secondary-hover hover:bg-secondary/10 hover:scale-110 transition-all rounded-full">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleSocialClick("LinkedIn")} className="text-secondary hover:text-secondary-hover hover:bg-secondary/10 hover:scale-110 transition-all rounded-full">
                  <Linkedin className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>;
};