import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Users, Star, Wrench, Shield, Sparkles, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroClient from "@/assets/hero-client.jpg";
import heroProfessionals from "@/assets/hero-professionals.jpg";

export const Hero = () => {
  const navigate = useNavigate();
  
  const handleServiceClick = () => {
    navigate('/auth?type=client');
  };
  
  const handleProfessionalClick = () => {
    navigate('/auth?type=master');
  };

  return (
    <section className="relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 animate-pulse" style={{ animationDuration: '8s' }} />
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="container relative z-10 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-6">
              <Badge className="bg-gradient-hero text-white border-0 px-4 py-1.5 text-sm font-medium shadow-elegant animate-scale-in">
                <Sparkles className="h-3.5 w-3.5 mr-1.5 inline" />
                La plataforma #1 de servicios profesionales
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                Descubrí el{" "}
                <span className="gradient-text animate-float">oficio</span>
                <br />
                que necesitás
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-xl">
                Conectamos clientes con <span className="text-primary font-semibold">profesionales verificados</span> de oficios manuales y técnicos. Confianza, calidad y pagos seguros.
              </p>
            </div>

            {/* Enhanced Features */}
            <div className="grid gap-4">
              {[
                { icon: Shield, text: "Profesionales verificados con antecedentes", color: "text-primary" },
                { icon: CheckCircle, text: "Pagos seguros con garantía de satisfacción", color: "text-secondary" },
                { icon: Star, text: "Sistema de valoraciones 100% confiable", color: "text-accent" }
              ].map((feature, i) => (
                <div 
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:bg-card transition-all hover:translate-x-2"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <span className="font-medium">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="xl" 
                variant="hero" 
                className="group shadow-elegant hover:shadow-soft transform hover:scale-105"
                onClick={handleServiceClick}
              >
                Necesito un Servicio
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                size="xl" 
                variant="outline" 
                className="group border-2 hover:bg-accent/10"
                onClick={handleProfessionalClick}
              >
                Soy Profesional
                <Wrench className="ml-2 h-5 w-5 transition-transform group-hover:rotate-12" />
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 pt-8 border-t border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-soft">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold gradient-text">5,000+</div>
                  <div className="text-sm text-muted-foreground">Profesionales</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-secondary-hover flex items-center justify-center shadow-soft">
                  <Star className="h-6 w-6 text-white fill-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold gradient-text">4.8/5</div>
                  <div className="text-sm text-muted-foreground">Valoración</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center shadow-soft">
                  <TrendingUp className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <div className="text-2xl font-bold gradient-text">98%</div>
                  <div className="text-sm text-muted-foreground">Satisfacción</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Enhanced Images - Now visible on tablets too */}
          <div className="relative hidden md:block">
            <div className="grid grid-cols-2 gap-6 -mt-16">
              <Card className="overflow-hidden shadow-elegant hover:shadow-soft transition-all duration-500 hover:-translate-y-2 animate-fade-in border-border/50">
                <div className="relative group">
                  <img 
                    src={heroProfessionals} 
                    alt="Profesionales verificados" 
                    className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-5 bg-gradient-to-br from-card to-card/50">
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    Maestros Verificados
                    <Shield className="h-5 w-5 text-primary" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Profesionales con experiencia comprobada y verificación completa
                  </p>
                </div>
              </Card>
              
              <Card className="overflow-hidden shadow-elegant hover:shadow-soft transition-all duration-500 hover:-translate-y-2 animate-fade-in mt-12 border-border/50" style={{ animationDelay: '200ms' }}>
                <div className="relative group">
                  <img 
                    src={heroClient} 
                    alt="Clientes satisfechos" 
                    className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-5 bg-gradient-to-br from-card to-card/50">
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    Clientes Satisfechos
                    <Star className="h-5 w-5 text-accent fill-accent" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Miles de trabajos completados con éxito y garantía
                  </p>
                </div>
              </Card>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-6 -right-6 animate-float">
              <Badge className="bg-gradient-hero text-white border-0 px-6 py-3 text-base font-semibold shadow-elegant">
                <Sparkles className="h-4 w-4 mr-2 inline" />
                Nuevo
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};