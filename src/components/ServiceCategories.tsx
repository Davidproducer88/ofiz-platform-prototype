import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Edit } from "lucide-react";
import servicesGrid from "@/assets/services-grid.jpg";
import { SERVICE_CATEGORIES } from "@/lib/categories";
import { useNavigate } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { use3DTilt } from "@/hooks/use3DTilt";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
const CategoryCard = ({
  category,
  index
}: {
  category: any;
  index: number;
}) => {
  const navigate = useNavigate();
  const {
    ref,
    tiltStyle,
    handlers
  } = use3DTilt({
    maxTilt: 8,
    perspective: 1000,
    scale: 1.08,
    speed: 400
  });
  const Icon = category.icon;
  const handleClick = () => {
    navigate(`/search?category=${category.value}`);
  };
  return <Card ref={ref} onClick={handleClick} className="group relative overflow-hidden hover:shadow-elegant transition-all duration-500 cursor-pointer border-border/50 hover:border-primary/30 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm animate-fade-in h-full" style={{
    animationDelay: `${index * 50}ms`,
    transformStyle: 'preserve-3d',
    ...tiltStyle
  }} {...handlers}>
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Click indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <ArrowRight className="h-4 w-4 text-primary" />
      </div>
      
      <CardContent className="relative p-3 sm:p-4 md:p-6 text-center" style={{
      transform: 'translateZ(20px)'
    }}>
        <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-background to-muted shadow-soft mb-3 md:mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ${category.color}`}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
        </div>
        <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 group-hover:text-primary transition-colors">
          {category.label}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2 hidden sm:block">
          {category.description}
        </p>
        <Badge variant="secondary" className="text-xs font-medium shadow-soft">
          {category.count}
        </Badge>
      </CardContent>
    </Card>;
};
export const ServiceCategories = () => {
  const navigate = useNavigate();
  const {
    ref: headerRef,
    isVisible: headerVisible
  } = useScrollReveal({
    threshold: 0.2
  });
  const {
    ref: bannerRef,
    isVisible: bannerVisible
  } = useScrollReveal({
    threshold: 0.3
  });
  const handleCategoryClick = (categoryValue: string) => {
    navigate(`/search?category=${categoryValue}`);
  };
  return <section className="py-24 bg-muted/30 relative overflow-hidden" id="categorias">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent pointer-events-none" />
      
      <div className="container py-[34px] px-[34px]">
        {/* Header */}
        <div ref={headerRef as any} className={`text-center mb-16 space-y-4 transition-all duration-1000 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Badge className="bg-secondary/10 text-secondary border-secondary/20 mb-2 shadow-soft">
            Categorías Populares
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold">
            Todos los oficios que <span className="gradient-text">necesitás</span> en un solo lugar
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            <span className="text-primary font-semibold">+5,000 profesionales certificados</span> esperando tu solicitud. Respuesta garantizada en <span className="text-accent font-semibold">menos de 24hs</span>.
          </p>
        </div>

        {/* Categories Carousel - 21+ categories with horizontal scroll */}
        <div className="mb-16 px-12">
          <Carousel opts={{
          align: "start",
          loop: true
        }} className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {SERVICE_CATEGORIES.map((category, index) => <CarouselItem key={category.value} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                  <CategoryCard category={category} index={index} />
                </CarouselItem>)}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4" />
            <CarouselNext className="hidden md:flex -right-4" />
          </Carousel>
        </div>

        {/* Banner Image - Enhanced */}
        <div ref={bannerRef as any} className={`relative rounded-2xl overflow-hidden shadow-elegant hover:shadow-soft transition-all duration-1000 group ${bannerVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <img src={servicesGrid} alt="Servicios disponibles en Ofiz" className="w-full h-64 md:h-80 object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/80 to-secondary/90 flex items-center justify-center">
            <div className="text-center text-white space-y-6 p-8 py-0 px-[29px] my-0 mx-0">
              <div className="inline-block">
                <Edit className="h-12 w-12 mb-4 animate-float" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold drop-shadow-lg">
                ¿Necesitás otro tipo de servicio?
              </h3>
              <p className="md:text-xl opacity-90 max-w-xl mx-auto text-base">
                Publicá tu solicitud GRATIS y recibí hasta <span className="font-bold">5 presupuestos</span> de profesionales especializados
              </p>
              <div className="flex-wrap pt-2 flex-row flex items-center justify-center gap-[23px] my-0 mx-[26px]">
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-sm px-[20px] py-[6px] my-0 rounded-md mx-0">
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
    </section>;
};