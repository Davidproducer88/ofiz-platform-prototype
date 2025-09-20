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
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
            Proceso Simplificado
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Cómo <span className="gradient-text">funciona</span> Ofiz?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Proceso simple y seguro para conectarte con los mejores profesionales
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8 mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isEven = index % 2 === 1;
            
            return (
              <div 
                key={step.title}
                className={`flex items-center gap-8 ${isEven ? 'flex-row-reverse' : ''}`}
              >
                {/* Content */}
                <div className={`flex-1 ${isEven ? 'text-right' : ''}`}>
                  <Card className="shadow-card hover:shadow-elegant transition-all duration-300 border-border/50">
                    <CardContent className="p-8">
                      <div className={`flex items-center gap-4 mb-4 ${isEven ? 'justify-end' : ''}`}>
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary ${isEven ? 'order-2' : ''}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-semibold">{step.title}</h3>
                      </div>
                      
                      <p className="text-muted-foreground mb-4 text-lg">
                        {step.description}
                      </p>
                      
                      <div className={`grid grid-cols-2 gap-2 ${isEven ? 'text-right' : ''}`}>
                        {step.details.map((detail, detailIndex) => (
                          <div key={detailIndex} className={`flex items-center gap-2 text-sm text-muted-foreground ${isEven ? 'justify-end' : ''}`}>
                            <CheckCircle2 className={`h-4 w-4 text-secondary flex-shrink-0 ${isEven ? 'order-2' : ''}`} />
                            <span>{detail}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Connector */}
                <div className="flex-shrink-0 w-16 flex justify-center">
                  {index < steps.length - 1 && (
                    <div className="w-0.5 h-20 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
                  )}
                </div>

                {/* Empty space for layout */}
                <div className="flex-1"></div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-hero rounded-xl p-8 md:p-12 text-center text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            ¿Listo para encontrar tu profesional ideal?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Únete a miles de clientes que ya confían en Ofiz
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" className="bg-white text-primary hover:bg-white/90">
              Publicar Encargo Gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="xl" variant="outline" className="border-white/30 text-white hover:bg-white/10">
              Ver Profesionales
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};