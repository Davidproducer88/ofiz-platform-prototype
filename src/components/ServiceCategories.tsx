import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Wrench, 
  Paintbrush, 
  Hammer, 
  Sparkles,
  Leaf,
  Car,
  Monitor,
  Home,
  Camera
} from "lucide-react";
import servicesGrid from "@/assets/services-grid.jpg";

const categories = [
  {
    icon: Zap,
    title: "Electricidad",
    description: "Instalaciones, reparaciones, cableado",
    count: "850+ maestros",
    color: "text-yellow-500"
  },
  {
    icon: Wrench,
    title: "Plomería", 
    description: "Reparaciones, instalaciones, destapes",
    count: "720+ maestros",
    color: "text-blue-500"
  },
  {
    icon: Paintbrush,
    title: "Pintura",
    description: "Interiores, exteriores, decorativa",
    count: "650+ maestros", 
    color: "text-purple-500"
  },
  {
    icon: Hammer,
    title: "Construcción",
    description: "Reformas, albañilería, mampostería",
    count: "900+ maestros",
    color: "text-orange-500"
  },
  {
    icon: Sparkles,
    title: "Limpieza",
    description: "Doméstica, comercial, especializada",
    count: "580+ maestros",
    color: "text-green-500"
  },
  {
    icon: Leaf,
    title: "Jardinería",
    description: "Paisajismo, mantenimiento, diseño",
    count: "420+ maestros",
    color: "text-emerald-500"
  },
  {
    icon: Car,
    title: "Automotor",
    description: "Mecánica, electricidad, chapa y pintura",
    count: "380+ maestros",
    color: "text-red-500"
  },
  {
    icon: Monitor,
    title: "Tecnología",
    description: "Reparación, instalación, soporte",
    count: "290+ maestros",
    color: "text-indigo-500"
  }
];

export const ServiceCategories = () => {
  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
      
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <Badge className="bg-secondary/10 text-secondary border-secondary/20 mb-2 shadow-soft">
            Categorías Populares
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold">
            Encuentra el <span className="gradient-text">profesional</span> perfecto
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Más de <span className="text-primary font-semibold">5,000 profesionales verificados</span> listos para ayudarte en múltiples categorías
          </p>
        </div>

        {/* Categories Grid - Enhanced - Better responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-16">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card 
                key={category.title} 
                className="group relative overflow-hidden hover:shadow-elegant transition-all duration-500 hover:-translate-y-2 cursor-pointer border-border/50 hover:border-primary/30 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardContent className="relative p-3 sm:p-4 md:p-6 text-center">
                  <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-background to-muted shadow-soft mb-3 md:mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ${category.color}`}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 group-hover:text-primary transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2 hidden sm:block">
                    {category.description}
                  </p>
                  <Badge variant="secondary" className="text-xs font-medium shadow-soft">
                    {category.count}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Banner Image - Enhanced */}
        <div className="relative rounded-2xl overflow-hidden shadow-elegant hover:shadow-soft transition-shadow duration-500 group">
          <img 
            src={servicesGrid} 
            alt="Servicios disponibles en Ofiz" 
            className="w-full h-64 md:h-80 object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/80 to-secondary/90 flex items-center justify-center">
            <div className="text-center text-white space-y-6 p-8">
              <div className="inline-block">
                <Sparkles className="h-12 w-12 mb-4 animate-float" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold drop-shadow-lg">
                ¿No encontrás tu categoría?
              </h3>
              <p className="text-lg md:text-xl opacity-90 max-w-xl mx-auto">
                Publicá tu encargo y los profesionales ideales se contactarán contigo
              </p>
              <div className="flex flex-wrap gap-3 justify-center pt-2">
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2 text-sm">
                  +50 especialidades
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2 text-sm">
                  Respuesta en 24hs
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2 text-sm">
                  100% Gratis
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};