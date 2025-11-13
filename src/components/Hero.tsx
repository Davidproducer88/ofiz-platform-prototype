import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle, Users, Star, Wrench, Shield, Sparkles, TrendingUp, Search, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useParallax } from "@/hooks/useParallax";
import heroClient from "@/assets/hero-client.jpg";
import heroProfessionals from "@/assets/hero-professionals.jpg";

export const Hero = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { stats, loading } = usePlatformStats();
  const { ref: heroRef, isVisible: heroVisible } = useScrollReveal({ threshold: 0.2 });
  const { ref: statsRef, isVisible: statsVisible } = useScrollReveal({ threshold: 0.3 });
  const parallaxOffset = useParallax({ speed: 0.3 });
  
  const handleServiceClick = () => {
    navigate('/auth?type=client');
  };
  
  const handleProfessionalClick = () => {
    navigate('/auth?type=master');
  };

  const handleBusinessClick = () => {
    navigate('/auth?type=business');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search-masters?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <section className="relative overflow-hidden" ref={heroRef as any}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 animate-pulse" style={{ animationDuration: '8s' }} />
      
      {/* Decorative elements with subtle parallax */}
      <div 
        className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float pointer-events-none" 
        style={{ transform: `translateY(${parallaxOffset * 0.3}px)` }}
      />
      <div 
        className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float pointer-events-none" 
        style={{ animationDelay: '2s', transform: `translateY(${parallaxOffset * 0.2}px)` }}
      />
      
      <div className="container relative z-10 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className={`space-y-6 transition-all duration-1000 ${
            heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="space-y-6">
              <Badge className="bg-gradient-hero text-white border-0 px-4 py-1.5 text-sm font-medium shadow-elegant animate-scale-in">
                <Sparkles className="h-3.5 w-3.5 mr-1.5 inline" />
                La plataforma #1 de servicios profesionales
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                ¿Necesitás un <span className="gradient-text">profesional de confianza</span>?
                <br className="hidden sm:block" />
                Encontralo en minutos con Ofiz
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-xl">
                <span className="text-foreground font-semibold">Electricistas, plomeros, pintores y más.</span> Miles de profesionales verificados listos para ayudarte. <span className="text-primary font-semibold">Comparás, elegís y contratás. Pagos seguros garantizados.</span>
              </p>
            </div>

            {/* Quick Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-2xl">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar electricista, plomero, pintor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-base shadow-soft border-border/50 focus:border-primary"
                  />
                </div>
                <Button 
                  type="submit"
                  size="lg"
                  className="h-12 px-6 shadow-soft"
                >
                  Buscar
                </Button>
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                size="lg" 
                className="group shadow-elegant hover:shadow-soft transform hover:scale-105 text-sm sm:text-base w-full sm:w-auto"
                onClick={handleServiceClick}
              >
                🔍 Buscar Profesional Ahora
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="group border-2 hover:bg-primary/10 text-sm sm:text-base w-full sm:w-auto"
                onClick={handleProfessionalClick}
              >
                Soy Profesional
                <Wrench className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:rotate-12" />
              </Button>
              <Button 
                size="lg" 
                variant="secondary" 
                className="group hover:bg-secondary/80 text-sm sm:text-base w-full sm:w-auto"
                onClick={handleBusinessClick}
              >
                Para Empresas
                <Building2 className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-110" />
              </Button>
            </div>
          </div>

          {/* Right Content - Enhanced Images - Now visible on tablets too */}
          <div className={`relative hidden md:block transition-all duration-1000 delay-500 ${
            heroVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}>
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

        {/* Features & Stats Section - Centered Below */}
        <div className="flex flex-col items-center justify-center text-center mt-16 md:mt-24 max-w-4xl mx-auto space-y-8">
          {/* Enhanced Features */}
          <div 
            className={`grid sm:grid-cols-3 gap-4 w-full transition-all duration-1000 delay-300 ${
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {[
              { icon: Users, text: "Miles de profesionales verificados disponibles", color: "text-primary" },
              { icon: CheckCircle, text: "Pagos seguros con protección de garantía", color: "text-secondary" },
              { icon: Shield, text: "Trabajos garantizados - tu dinero está protegido", color: "text-accent" }
            ].map((feature, i) => (
              <div 
                key={i}
                className="flex flex-col items-center gap-3 p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:bg-card transition-all hover:scale-105"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <span className="text-sm font-medium">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div 
            ref={statsRef as any}
            className={`flex flex-wrap items-center justify-center gap-6 md:gap-10 pt-8 border-t border-border/50 w-full transition-all duration-1000 delay-500 ${
              statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-soft">
                <Users className="h-7 w-7 text-white" />
              </div>
              <div className="text-2xl font-bold gradient-text">
                {loading ? "..." : `${stats.total_masters.toLocaleString()}+`}
              </div>
              <div className="text-sm text-muted-foreground">Profesionales</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary to-secondary-hover flex items-center justify-center shadow-soft">
                <Star className="h-7 w-7 text-white fill-white" />
              </div>
              <div className="text-2xl font-bold gradient-text">
                {loading ? "..." : `${stats.average_rating.toFixed(1)}/5`}
              </div>
              <div className="text-sm text-muted-foreground">Valoración</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center shadow-soft">
                <CheckCircle className="h-7 w-7 text-white" />
              </div>
              <div className="text-2xl font-bold gradient-text">
                {loading ? "..." : `${stats.satisfaction_rate.toFixed(0)}%`}
              </div>
              <div className="text-sm text-muted-foreground">Satisfacción</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};