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
    <section className="py-20">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-secondary/10 text-secondary border-secondary/20 mb-4">
            Categorías Populares
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Encuentra el <span className="gradient-text">profesional</span> que necesitás
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Más de 5,000 profesionales verificados listos para ayudarte en múltiples categorías
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card 
                key={category.title} 
                className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 cursor-pointer border-border/50 hover:border-primary/20"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-background shadow-soft mb-4 group-hover:scale-110 transition-transform ${category.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {category.description}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Banner Image */}
        <div className="relative rounded-xl overflow-hidden shadow-elegant">
          <img 
            src={servicesGrid} 
            alt="Servicios disponibles en Ofiz" 
            className="w-full h-48 md:h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/80 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-2xl md:text-3xl font-bold mb-2">
                ¿No encontrás tu categoría?
              </h3>
              <p className="mb-4 opacity-90">
                Publicá tu encargo y los profesionales se contactarán contigo
              </p>
              <Badge className="bg-white/20 text-white border-white/30">
                +50 especialidades disponibles
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};