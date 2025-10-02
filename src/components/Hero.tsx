import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Users, Star, Wrench } from "lucide-react";
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
  return <section className="relative bg-gradient-subtle">
      <div className="container md:py-32 py-[20px]">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
                Servicios profesionales para tu hogar & oficina
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Descubrí el{" "}
                <span className="gradient-text">oficio</span>{" "}
                que necesitás
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Conectamos clientes con profesionales verificados de oficios manuales y técnicos. 
                Confianza, calidad y pagos seguros en una sola plataforma.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-secondary" />
                <span className="text-foreground">Profesionales verificados con antecedentes</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-secondary" />
                <span className="text-foreground">Pagos seguros con garantía</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-secondary" />
                <span className="text-foreground">Sistema de valoraciones confiable</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="xl" variant="hero" className="group" onClick={handleServiceClick}>
                Necesito un Servicio
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="xl" variant="outline" className="group" onClick={handleProfessionalClick}>
                Soy Profesional
                <Wrench className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-8 pt-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-semibold">5,000+</div>
                  <div className="text-sm text-muted-foreground">Profesionales</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-accent" />
                <div>
                  <div className="font-semibold">4.8/5</div>
                  <div className="text-sm text-muted-foreground">Valoración</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Images */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <Card className="overflow-hidden shadow-elegant animate-float">
                <img src={heroProfessionals} alt="Profesionales verificados" className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold mb-2">Maestros Verificados</h3>
                  <p className="text-sm text-muted-foreground">
                    Profesionales con experiencia comprobada
                  </p>
                </div>
              </Card>
              
              <Card className="overflow-hidden shadow-elegant animate-float mt-8">
                <img src={heroClient} alt="Clientes satisfechos" className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold mb-2">Clientes Satisfechos</h3>
                  <p className="text-sm text-muted-foreground">
                    Miles de trabajos completados exitosamente
                  </p>
                </div>
              </Card>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 bg-accent text-accent-foreground px-4 py-2 rounded-full shadow-elegant animate-pulse">
              ¡Nuevo!
            </div>
          </div>
        </div>
      </div>
    </section>;
};