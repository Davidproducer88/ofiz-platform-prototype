import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  MessageSquare, 
  CreditCard, 
  BarChart3, 
  Star, 
  Shield, 
  Bell, 
  Users, 
  Briefcase,
  Clock,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Zap,
  Target,
  Award,
  Smartphone
} from "lucide-react";

const ToolsForProfessionals = () => {
  const navigate = useNavigate();

  const mainTools = [
    {
      icon: Calendar,
      title: "Agenda Inteligente",
      description: "Gestiona tu disponibilidad de forma profesional",
      features: [
        "Calendario sincronizado con tu agenda personal",
        "Bloqueo automático de horarios ocupados",
        "Recordatorios automáticos para ti y tus clientes",
        "Vista semanal y mensual de todos tus trabajos",
        "Reprogramación fácil con un clic"
      ],
      highlight: "Reduce un 80% las cancelaciones",
      tabLink: "calendar",
      isActive: true
    },
    {
      icon: MessageSquare,
      title: "Chat Profesional",
      description: "Comunícate de forma segura con tus clientes",
      features: [
        "Mensajería instantánea en tiempo real",
        "Envío de fotos y documentos",
        "Historial completo de conversaciones",
        "Negociación de presupuestos integrada",
        "Notificaciones push en tu celular"
      ],
      highlight: "Responde 3x más rápido",
      tabLink: "messages",
      isActive: true
    },
    {
      icon: CreditCard,
      title: "Pagos Seguros",
      description: "Cobra sin preocupaciones con Mercado Pago",
      features: [
        "Pagos con tarjeta, débito y transferencia",
        "Sistema de escrow que protege tu trabajo",
        "Cobro parcial o total según acuerdes",
        "Historial detallado de transacciones",
        "Retiros a tu cuenta en 24-48 horas"
      ],
      highlight: "0% riesgo de impago",
      tabLink: "finances",
      isActive: true
    },
    {
      icon: BarChart3,
      title: "Analytics y Métricas",
      description: "Entiende y haz crecer tu negocio",
      features: [
        "Dashboard con KPIs en tiempo real",
        "Ingresos mensuales y proyecciones",
        "Tasa de conversión de consultas",
        "Comparativa con otros profesionales",
        "Reportes descargables"
      ],
      highlight: "Toma decisiones con datos",
      tabLink: "analytics",
      isActive: true
    },
    {
      icon: Star,
      title: "Sistema de Reseñas",
      description: "Construye tu reputación profesional",
      features: [
        "Reseñas verificadas de clientes reales",
        "Puntuación visible en tu perfil",
        "Responde a comentarios de clientes",
        "Insignias por excelencia en servicio",
        "Ranking de mejores profesionales"
      ],
      highlight: "Más reseñas = Más clientes",
      tabLink: "reviews",
      isActive: true
    },
    {
      icon: Briefcase,
      title: "Portafolio Digital",
      description: "Muestra tu trabajo al mundo",
      features: [
        "Galería de fotos de trabajos realizados",
        "Categorización por tipo de servicio",
        "Descripciones detalladas de proyectos",
        "Antes y después de trabajos",
        "Compartir en redes sociales"
      ],
      highlight: "Tu trabajo habla por ti",
      tabLink: "portfolio",
      isActive: true
    }
  ];

  const additionalFeatures = [
    {
      icon: Bell,
      title: "Notificaciones Inteligentes",
      description: "Nunca pierdas una oportunidad de trabajo"
    },
    {
      icon: Users,
      title: "Red de Profesionales",
      description: "Conecta con otros maestros para trabajos grandes"
    },
    {
      icon: Shield,
      title: "Perfil Verificado",
      description: "Insignia de confianza que atrae más clientes"
    },
    {
      icon: Clock,
      title: "Gestión de Tiempos",
      description: "Controla cuánto tiempo dedicas a cada trabajo"
    },
    {
      icon: TrendingUp,
      title: "Posicionamiento SEO",
      description: "Aparece primero en las búsquedas de clientes"
    },
    {
      icon: Smartphone,
      title: "App Móvil Optimizada",
      description: "Gestiona todo desde tu celular"
    }
  ];

  const stats = [
    { value: "500+", label: "Profesionales activos" },
    { value: "$2M+", label: "Facturado en la plataforma" },
    { value: "98%", label: "Satisfacción de clientes" },
    { value: "24hs", label: "Tiempo promedio de pago" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        
        <div className="container relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-gradient-hero text-white border-0 px-4 py-2 text-sm">
              <Zap className="w-4 h-4 mr-2" />
              Herramientas Profesionales
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Todo lo que necesitás para{" "}
              <span className="gradient-text">hacer crecer tu negocio</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Ofiz te da las herramientas más potentes del mercado para gestionar clientes, 
              cobrar de forma segura y construir tu reputación profesional.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="xl" 
                variant="hero"
                onClick={() => navigate('/auth?type=master')}
                className="group"
              >
                Empezar Gratis
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="xl" 
                variant="outline"
                onClick={() => navigate('/dossier-maestros')}
              >
                Ver Planes y Precios
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border/50 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Tools Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <Target className="w-4 h-4 mr-2" />
              Funcionalidades Principales
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              6 herramientas que transformarán tu trabajo
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cada herramienta está diseñada para ahorrarte tiempo, 
              aumentar tus ingresos y profesionalizar tu servicio.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainTools.map((tool, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-elegant transition-all duration-300 border-border/50 hover:border-primary/30 overflow-hidden"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-hero flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <tool.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {tool.highlight}
                      </Badge>
                      {tool.isActive && (
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Activo
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{tool.title}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {tool.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full mt-4 group/btn"
                    onClick={() => navigate(`/master-dashboard?tab=${tool.tabLink}`)}
                  >
                    Usar {tool.title}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Y mucho más...</h2>
            <p className="text-muted-foreground">
              Funcionalidades adicionales que hacen la diferencia
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {additionalFeatures.map((feature, index) => (
              <Card 
                key={index} 
                className="text-center p-6 hover:shadow-soft transition-all border-border/50 hover:border-primary/30"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-2">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial/Social Proof */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <CardContent className="p-8 md:p-12">
                <div className="flex items-center gap-4 mb-6">
                  <Award className="w-12 h-12 text-primary" />
                  <div>
                    <h3 className="text-2xl font-bold">¿Por qué elegir Ofiz?</h3>
                    <p className="text-muted-foreground">La plataforma #1 para profesionales en Uruguay</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center p-4">
                    <div className="text-4xl font-bold text-primary mb-2">5%</div>
                    <p className="text-sm text-muted-foreground">Comisión más baja del mercado</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-4xl font-bold text-secondary mb-2">0</div>
                    <p className="text-sm text-muted-foreground">Costo mensual en plan gratuito</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-4xl font-bold text-accent mb-2">∞</div>
                    <p className="text-sm text-muted-foreground">Clientes potenciales esperándote</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              ¿Listo para llevar tu negocio al siguiente nivel?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Unite a cientos de profesionales que ya están creciendo con Ofiz. 
              Registro gratuito, sin compromisos.
            </p>
            <Button 
              size="xl" 
              variant="hero"
              onClick={() => navigate('/auth?type=master')}
              className="group"
            >
              Crear mi Cuenta Profesional
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contacto
              </Badge>
              <h2 className="text-3xl font-bold mb-4">
                ¿Tenés dudas? Hablemos
              </h2>
              <p className="text-muted-foreground">
                Nuestro equipo está disponible para ayudarte a comenzar
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center p-6 hover:shadow-soft transition-all">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Teléfono</h3>
                <a 
                  href="tel:+59898817806" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  +598 98 817 806
                </a>
                <p className="text-xs text-muted-foreground mt-2">
                  Lunes a Viernes, 9:00 - 18:00
                </p>
              </Card>

              <Card className="text-center p-6 hover:shadow-soft transition-all">
                <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="font-semibold mb-2">Email</h3>
                <a 
                  href="mailto:hola@ofiz.com.uy" 
                  className="text-muted-foreground hover:text-secondary transition-colors"
                >
                  hola@ofiz.com.uy
                </a>
                <p className="text-xs text-muted-foreground mt-2">
                  Respondemos en menos de 24 horas
                </p>
              </Card>

              <Card className="text-center p-6 hover:shadow-soft transition-all">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-7 h-7 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Ubicación</h3>
                <p className="text-muted-foreground">
                  Montevideo, Uruguay
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Orbital Estudio SAS
                </p>
              </Card>
            </div>

            <div className="text-center mt-12">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/contact')}
              >
                <Mail className="mr-2 h-5 w-5" />
                Enviar Mensaje
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ToolsForProfessionals;
