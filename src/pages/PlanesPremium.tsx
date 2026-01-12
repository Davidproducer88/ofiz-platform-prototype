import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Star, 
  Zap, 
  TrendingUp, 
  Shield, 
  Clock, 
  Users, 
  BarChart3, 
  MessageSquare, 
  Award, 
  CheckCircle2, 
  Phone, 
  Mail, 
  MapPin,
  Sparkles,
  Target,
  Rocket,
  Gift,
  Calendar,
  HeadphonesIcon,
  BadgePercent,
  Eye,
  Search,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const PlanesPremium = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Básico",
      price: "Gratis",
      period: "",
      description: "Ideal para comenzar y probar la plataforma",
      icon: Star,
      highlight: false,
      features: [
        { text: "Perfil profesional básico", included: true },
        { text: "Hasta 3 servicios activos", included: true },
        { text: "5 postulaciones mensuales", included: true },
        { text: "Chat con clientes", included: true },
        { text: "Visibilidad estándar", included: true },
        { text: "Soporte por email", included: true },
        { text: "Badge verificado", included: false },
        { text: "Prioridad en búsquedas", included: false },
        { text: "Análisis avanzado", included: false },
        { text: "Destacado en feed", included: false },
      ],
      cta: "Empezar Gratis",
      ctaVariant: "outline" as const
    },
    {
      name: "Profesional",
      price: "$990",
      period: "/mes",
      description: "Para profesionales que buscan crecer",
      icon: Crown,
      highlight: true,
      popular: true,
      features: [
        { text: "Todo del plan Básico", included: true },
        { text: "Servicios ilimitados", included: true },
        { text: "20 postulaciones mensuales", included: true },
        { text: "Badge verificado PRO", included: true },
        { text: "Prioridad en búsquedas", included: true },
        { text: "Análisis de rendimiento", included: true },
        { text: "Destacado en categoría", included: true },
        { text: "Soporte prioritario", included: true },
        { text: "Promociones exclusivas", included: true },
        { text: "Acceso beta features", included: false },
      ],
      cta: "Elegir Profesional",
      ctaVariant: "hero" as const,
      savings: "Ahorrá 20% con plan anual"
    },
    {
      name: "Elite",
      price: "$1,990",
      period: "/mes",
      description: "Máxima visibilidad y herramientas premium",
      icon: Zap,
      highlight: false,
      features: [
        { text: "Todo del plan Profesional", included: true },
        { text: "Postulaciones ilimitadas", included: true },
        { text: "Badge Elite exclusivo", included: true },
        { text: "Top 1 en búsquedas", included: true },
        { text: "Destacado en home", included: true },
        { text: "Analytics avanzados + IA", included: true },
        { text: "Gestor de cuenta dedicado", included: true },
        { text: "Acceso beta features", included: true },
        { text: "Publicidad incluida", included: true },
        { text: "Comisión reducida 5%", included: true },
      ],
      cta: "Elegir Elite",
      ctaVariant: "secondary" as const,
      savings: "Ahorrá 25% con plan anual"
    }
  ];

  const benefits = [
    {
      icon: Eye,
      title: "Mayor Visibilidad",
      description: "Aparecé primero en las búsquedas de clientes. Los profesionales Premium reciben hasta 5x más solicitudes de trabajo."
    },
    {
      icon: TrendingUp,
      title: "Más Ingresos",
      description: "Nuestros profesionales Premium ganan en promedio un 60% más que los usuarios del plan gratuito."
    },
    {
      icon: Award,
      title: "Badge Verificado",
      description: "Destacá tu perfil con un badge que genera confianza inmediata en los clientes potenciales."
    },
    {
      icon: BarChart3,
      title: "Analytics Avanzados",
      description: "Entendé cómo te encuentran los clientes y optimizá tu perfil para maximizar conversiones."
    },
    {
      icon: Search,
      title: "Prioridad en Búsquedas",
      description: "Tu perfil aparece antes que los demás cuando los clientes buscan en tu categoría."
    },
    {
      icon: HeadphonesIcon,
      title: "Soporte Prioritario",
      description: "Accedé a soporte dedicado con tiempos de respuesta garantizados de menos de 2 horas."
    }
  ];

  const testimonials = [
    {
      name: "Carlos Méndez",
      role: "Electricista - Plan Profesional",
      content: "Desde que activé el plan Profesional, mis solicitudes de trabajo se triplicaron. La inversión se paga sola en la primera semana.",
      rating: 5,
      earnings: "+180% ingresos"
    },
    {
      name: "María González",
      role: "Pintora - Plan Elite",
      content: "El badge Elite y aparecer primero en búsquedas cambió todo. Ahora puedo elegir los trabajos que quiero hacer.",
      rating: 5,
      earnings: "+250% ingresos"
    },
    {
      name: "Roberto Silva",
      role: "Plomero - Plan Profesional",
      content: "Las analytics me ayudaron a entender qué servicios promocionar. Duplicé mis clientes en 2 meses.",
      rating: 5,
      earnings: "+120% ingresos"
    }
  ];

  const faqs = [
    {
      question: "¿Puedo cambiar de plan en cualquier momento?",
      answer: "Sí, podés actualizar o cambiar tu plan cuando quieras. Los cambios se aplican inmediatamente y se prorratea el cobro."
    },
    {
      question: "¿Hay compromiso de permanencia?",
      answer: "No hay contratos de permanencia. Podés cancelar tu suscripción cuando quieras sin penalidades."
    },
    {
      question: "¿Cómo funciona el período de prueba?",
      answer: "Ofrecemos 7 días de prueba gratuita en todos los planes Premium para que experimentes todos los beneficios."
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer: "Aceptamos todas las tarjetas de crédito/débito a través de Mercado Pago, además de transferencias bancarias."
    },
    {
      question: "¿Cuánto tarda en activarse el plan?",
      answer: "Tu plan se activa inmediatamente después del pago. Los beneficios empiezan a funcionar al instante."
    }
  ];

  const stats = [
    { value: "5x", label: "Más solicitudes de trabajo" },
    { value: "60%", label: "Más ingresos promedio" },
    { value: "2hrs", label: "Tiempo de respuesta soporte" },
    { value: "98%", label: "Satisfacción de usuarios" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        
        <div className="container relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <Badge className="bg-gradient-hero text-white border-0 px-4 py-2 text-sm">
              <Sparkles className="h-4 w-4 mr-2" />
              Planes Premium para Profesionales
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Multiplicá tus <span className="gradient-text">oportunidades</span> y hacé crecer tu negocio
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Unite a los profesionales que ya están ganando más con Ofiz Premium. 
              Mayor visibilidad, más clientes, mejores ingresos.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button size="xl" variant="hero" onClick={() => navigate('/auth?type=master')}>
                <Rocket className="h-5 w-5 mr-2" />
                Comenzar Ahora
              </Button>
              <Button size="xl" variant="outline">
                <Calendar className="h-5 w-5 mr-2" />
                Agendar Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Elegí el plan perfecto para vos
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Cada plan está diseñado para diferentes etapas de tu carrera profesional
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-elegant hover:-translate-y-2 ${
                  plan.highlight ? 'border-primary shadow-elegant scale-105 z-10' : 'border-border/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-hero text-white px-4 py-1 text-xs font-semibold rounded-bl-lg">
                    MÁS POPULAR
                  </div>
                )}
                
                <CardHeader className="text-center pb-2">
                  <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                    plan.highlight ? 'bg-gradient-hero' : 'bg-muted'
                  }`}>
                    <plan.icon className={`h-8 w-8 ${plan.highlight ? 'text-white' : 'text-primary'}`} />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                  <div className="pt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  {plan.savings && (
                    <Badge variant="secondary" className="mt-2">
                      <Gift className="h-3 w-3 mr-1" />
                      {plan.savings}
                    </Badge>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <CheckCircle2 className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                          feature.included ? 'text-secondary' : 'text-muted-foreground/30'
                        }`} />
                        <span className={feature.included ? '' : 'text-muted-foreground/50 line-through'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    variant={plan.ctaVariant} 
                    className="w-full" 
                    size="lg"
                    onClick={() => navigate('/auth?type=master')}
                  >
                    {plan.cta}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-muted-foreground mt-8">
            Todos los precios están en pesos uruguayos (UYU). IVA incluido.
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="px-4 py-2">
              <Target className="h-4 w-4 mr-2" />
              Beneficios Premium
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              ¿Por qué elegir un plan Premium?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Invertí en tu crecimiento profesional y obtené resultados reales
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-border/50 hover:shadow-elegant transition-all group">
                <CardContent className="p-6 space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-hero/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <benefit.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="px-4 py-2">
              <Users className="h-4 w-4 mr-2" />
              Casos de Éxito
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              Profesionales que ya crecieron con Premium
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border/50 hover:shadow-elegant transition-all">
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                  <div className="pt-4 border-t border-border/50">
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    <Badge className="mt-2 bg-secondary/10 text-secondary border-0">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {testimonial.earnings}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-4xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Preguntas Frecuentes
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-border/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-hero text-white">
        <div className="container text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            ¿Listo para dar el siguiente paso?
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Unite a los cientos de profesionales que ya están creciendo con Ofiz Premium
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="xl" 
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => navigate('/auth?type=master')}
            >
              <Rocket className="h-5 w-5 mr-2" />
              Empezar Prueba Gratis
            </Button>
          </div>
          <p className="text-sm opacity-75">
            7 días de prueba gratis • Sin compromiso • Cancelá cuando quieras
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              ¿Tenés dudas? Hablemos
            </h2>
            <p className="text-lg text-muted-foreground">
              Nuestro equipo está listo para ayudarte a elegir el mejor plan
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="border-border/50 hover:shadow-elegant transition-all text-center">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Phone className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Llamanos</h3>
                <p className="text-muted-foreground">Lunes a Viernes 9-18hs</p>
                <a href="tel:+59898817806" className="text-primary font-semibold text-lg hover:underline block">
                  +598 98 817 806
                </a>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:shadow-elegant transition-all text-center">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
                  <Mail className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="font-semibold text-lg">Escribinos</h3>
                <p className="text-muted-foreground">Respondemos en menos de 24hs</p>
                <a href="mailto:premium@ofiz.com.uy" className="text-primary font-semibold text-lg hover:underline block">
                  premium@ofiz.com.uy
                </a>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:shadow-elegant transition-all text-center">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                  <MessageSquare className="h-8 w-8 text-accent-foreground" />
                </div>
                <h3 className="font-semibold text-lg">Chat en Vivo</h3>
                <p className="text-muted-foreground">Disponible de 9 a 21hs</p>
                <Button variant="outline" onClick={() => navigate('/contact')}>
                  Iniciar Chat
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <MapPin className="h-5 w-5" />
              <span>Montevideo, Uruguay</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PlanesPremium;
