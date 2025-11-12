import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Users, 
  MessageCircle, 
  CreditCard,
  Star,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useParallax } from "@/hooks/useParallax";

const steps = [
  {
    icon: FileText,
    title: "1. Publicá tu Encargo",
    description: "Describí el trabajo que necesitás, agregá fotos y establecé tu presupuesto",
    details: ["Descripción detallada", "Fotos del trabajo", "Ubicación y fechas", "Presupuesto estimado"]
  },
  {
    icon: Users,
    title: "2. Recibí Propuestas",
    description: "Profesionales verificados de tu zona se contactan contigo con presupuestos",
    details: ["Maestros verificados", "Propuestas personalizadas", "Perfiles completos", "Valoraciones reales"]
  },
  {
    icon: MessageCircle,
    title: "3. Elegí y Acordá",
    description: "Chateá con los profesionales, compará propuestas y elegí el mejor",
    details: ["Chat seguro interno", "Comparación fácil", "Horarios flexibles", "Términos claros"]
  },
  {
    icon: CreditCard,
    title: "4. Pago Seguro",
    description: "Realizá el pago a través de la plataforma. Se libera cuando confirmes el trabajo",
    details: ["Pago protegido", "Liberación segura", "Múltiples métodos", "Garantía incluida"]
  },
  {
    icon: Star,
    title: "5. Valorá la Experiencia",
    description: "Una vez terminado el trabajo, valorá al profesional y recibí tu valoración",
    details: ["Sistema de reputación", "Comentarios detallados", "Fotos del resultado", "Historial completo"]
  }
];

export const HowItWorks = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal({ threshold: 0.2 });
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollReveal({ threshold: 0.3 });
  const parallaxOffset = useParallax({ speed: 0.15 });

  const handlePublishClick = () => {
    if (profile) {
      navigate('/client-dashboard');
    } else {
      navigate('/auth?type=client');
    }
  };

  const handleViewProfessionalsClick = () => {
    navigate('/search-masters');
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
      <div className="container relative z-10">
        {/* Header */}
        <div 
          ref={headerRef as any}
          className={`text-center mb-20 space-y-4 transition-all duration-1000 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-2 shadow-soft">
            Proceso Simplificado
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold">
            Conseguí tu <span className="gradient-text">maestro ideal</span> en 5 pasos simples
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            <span className="text-primary font-semibold">Miles de clientes satisfechos</span> ya confiaron en Ofiz. Sistema 100% seguro, rápido y transparente.
          </p>
        </div>

        {/* Timeline Steps */}
        <div className="max-w-5xl mx-auto space-y-12 mb-20">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isEven = index % 2 === 1;
            
            return (
              <div 
                key={step.title}
                className={`flex flex-col md:flex-row items-center gap-8 ${isEven ? 'md:flex-row-reverse' : ''} transition-all duration-1000`}
                style={{ 
                  opacity: headerVisible ? 1 : 0,
                  transform: `translateY(${headerVisible ? 0 : 50}px)`,
                  transitionDelay: `${index * 150}ms`
                }}
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-elegant hover:scale-110 transition-transform duration-500">
                      <Icon className="h-10 w-10 text-white" />
                    </div>
                    {/* Step number */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent text-accent-foreground font-bold flex items-center justify-center text-sm shadow-soft">
                      {index + 1}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className={`flex-1 ${isEven ? 'md:text-right' : ''}`}>
                  <Card className="shadow-card hover:shadow-elegant transition-all duration-500 border-border/50 hover:border-primary/30 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                    <CardContent className="p-8">
                      <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                      
                      <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                        {step.description}
                      </p>
                      
                      <div className={`grid md:grid-cols-2 gap-3 ${isEven ? 'md:text-right' : ''}`}>
                        {step.details.map((detail, detailIndex) => (
                          <div 
                            key={detailIndex} 
                            className={`flex items-center gap-2 text-sm text-muted-foreground ${isEven ? 'md:justify-end' : ''}`}
                          >
                            <CheckCircle2 className={`h-4 w-4 text-secondary flex-shrink-0 ${isEven ? 'md:order-2' : ''}`} />
                            <span>{detail}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-0.5 h-24 bg-gradient-to-b from-primary via-accent to-secondary opacity-30" 
                       style={{ top: `${(index + 1) * 280}px` }} />
                )}
              </div>
            );
          })}
        </div>

        {/* CTA Section - Enhanced */}
        <div 
          ref={ctaRef as any}
          className={`relative rounded-2xl overflow-hidden shadow-elegant transition-all duration-1000 ${
            ctaVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          style={{ transform: `translateY(${parallaxOffset * 0.3}px)` }}
        >
          <div className="absolute inset-0 bg-gradient-hero" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTI0IDQ4YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-20" />
          
          <div className="relative z-10 p-12 md:p-16 text-center text-white space-y-8">
          <div className="inline-block p-3 sm:p-4 rounded-full bg-white/10 backdrop-blur-sm mb-4">
              <Star className="h-8 w-8 sm:h-12 sm:w-12 fill-white animate-float" />
            </div>
            
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold drop-shadow-lg px-4">
              🚀 Comenzá tu proyecto HOY mismo
            </h3>
            
            <p className="text-lg sm:text-xl md:text-2xl opacity-90 max-w-2xl mx-auto px-4">
              Más de <span className="font-bold">10,000 clientes satisfechos</span> encontraron a su maestro ideal en Ofiz. <span className="font-bold">¡Es tu turno!</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="xl" 
                onClick={handlePublishClick}
                className="bg-white text-primary hover:bg-white/90 shadow-elegant font-semibold group text-base px-8"
              >
                📝 Publicar Encargo GRATIS
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                size="xl" 
                variant="outline" 
                onClick={handleViewProfessionalsClick}
                className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm font-semibold"
              >
                Ver Profesionales
              </Button>
            </div>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6 justify-center pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="text-3xl font-bold">5,000+</div>
                <div className="text-sm opacity-80">Profesionales</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">50,000+</div>
                <div className="text-sm opacity-80">Trabajos Completados</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">4.8/5</div>
                <div className="text-sm opacity-80">Valoración Promedio</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};