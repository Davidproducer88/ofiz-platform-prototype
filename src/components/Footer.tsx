import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react";
export const Footer = () => {
  return <footer className="relative bg-gradient-to-b from-muted/30 to-muted/50 border-t border-border/50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="container relative z-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="text-3xl font-bold gradient-text hover:scale-105 transition-transform cursor-pointer inline-block">
              Ofiz
            </div>
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
                <span>hola@ofiz.com</span>
              </div>
            </div>
          </div>

          {/* Para Clientes */}
          <div className="space-y-4">
            <h4 className="font-semibold">Para Clientes</h4>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Publicar Encargo
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Buscar Profesionales
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cómo Funciona
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Precios y Tarifas
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Garantías
              </a>
            </div>
          </div>

          {/* Para Profesionales */}
          <div className="space-y-4">
            <h4 className="font-semibold">Para Profesionales</h4>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Registrarse como Maestro
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Planes Premium
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Centro de Ayuda
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Verificación de Perfil
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Herramientas
              </a>
            </div>
          </div>

          {/* Empresa */}
          <div className="space-y-4">
            <h4 className="font-semibold">Empresa</h4>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Sobre Ofiz
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Términos y Condiciones
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Política de Privacidad
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contacto
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </a>
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
            
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <input 
                type="email" 
                placeholder="Tu email" 
                className="px-4 py-2.5 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all min-w-[250px]" 
              />
              <Button className="shadow-soft">Suscribirse</Button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border/50 pt-8 mt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <Badge className="bg-gradient-hero text-white border-0 shadow-soft">
                Beta
              </Badge>
              <p className="text-sm text-muted-foreground text-center md:text-left">
                © 2025 Ofiz. Todos los derechos reservados. | <span className="gradient-text font-semibold">Orbital Studio</span>
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-secondary hover:text-secondary-hover hover:bg-secondary/10 hover:scale-110 transition-all rounded-full"
              >
                <Facebook className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-secondary hover:text-secondary-hover hover:bg-secondary/10 hover:scale-110 transition-all rounded-full"
              >
                <Instagram className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-secondary hover:text-secondary-hover hover:bg-secondary/10 hover:scale-110 transition-all rounded-full"
              >
                <Twitter className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-secondary hover:text-secondary-hover hover:bg-secondary/10 hover:scale-110 transition-all rounded-full"
              >
                <Linkedin className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>;
};