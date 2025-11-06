import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Sparkles, Zap, Crown, Building2, User, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Pricing() {
  const navigate = useNavigate();

  const clientPricing = [
    {
      title: "Publicación de encargos",
      price: "Gratis",
      description: "Publicá todos los encargos que necesites sin costo"
    },
    {
      title: "Comisión por servicio",
      price: "5%",
      description: "Solo cobramos una pequeña comisión cuando el servicio se completa exitosamente"
    },
    {
      title: "Protección de pago",
      price: "Incluido",
      description: "Tu dinero está protegido hasta que confirmes que el trabajo está completo"
    }
  ];

  const masterPlans = [
    {
      name: "Plan Gratis",
      price: "0",
      period: "siempre",
      description: "Ideal para comenzar",
      icon: User,
      features: [
        { text: "8 postulaciones por mes", included: true },
        { text: "Portfolio hasta 6 trabajos", included: true },
        { text: "Chat con clientes", included: true },
        { text: "Comisión del 12%", included: true },
        { text: "Verificación premium", included: false },
        { text: "Destacado en búsquedas", included: false },
        { text: "Estadísticas avanzadas", included: false }
      ],
      cta: "Comenzar Gratis",
      highlighted: false
    },
    {
      name: "Profesional",
      price: "590",
      period: "mes",
      description: "Para profesionales activos",
      badge: "Más Popular",
      icon: Wrench,
      features: [
        { text: "30 postulaciones mensuales", included: true },
        { text: "Portfolio hasta 20 trabajos", included: true },
        { text: "Comisión reducida al 8%", included: true },
        { text: "Perfil destacado - Top 5", included: true },
        { text: "Estadísticas básicas", included: true },
        { text: "Calendario integrado", included: true },
        { text: "Soporte prioritario", included: true }
      ],
      cta: "Elegir Profesional",
      highlighted: true,
      roi: "ROI 1,180% con 5 servicios/mes"
    },
    {
      name: "Elite",
      price: "990",
      period: "mes",
      description: "Para profesionales de alto nivel",
      icon: Crown,
      features: [
        { text: "Postulaciones ILIMITADAS", included: true },
        { text: "Portfolio ilimitado", included: true },
        { text: "Comisión mínima del 5%", included: true },
        { text: "Top 3 garantizado", included: true },
        { text: "Badge Elite Verificado", included: true },
        { text: "Estadísticas avanzadas + IA", included: true },
        { text: "Facturación automática DGI", included: true },
        { text: "Soporte 24/7 + Account Manager", included: true },
        { text: "Contratos empresariales", included: true }
      ],
      cta: "Elegir Elite",
      highlighted: false,
      roi: "ROI 2,376% con 8 servicios/mes"
    }
  ];

  const businessPlans = [
    {
      name: "Básico",
      price: "4,500",
      period: "mes",
      description: "Para pequeñas empresas",
      icon: Building2,
      features: [
        { text: "50 contactos mensuales", included: true },
        { text: "5 contratos simultáneos", included: true },
        { text: "2 campañas publicitarias", included: true },
        { text: "5,000 impresiones incluidas", included: true },
        { text: "Analytics básico", included: true },
        { text: "Soporte email", included: true },
        { text: "Account Manager", included: false },
        { text: "API Access", included: false }
      ],
      cta: "Comenzar",
      highlighted: false
    },
    {
      name: "Profesional",
      price: "8,500",
      period: "mes",
      description: "Para empresas en crecimiento",
      badge: "Recomendado",
      icon: Zap,
      features: [
        { text: "150 contactos mensuales", included: true },
        { text: "15 contratos simultáneos", included: true },
        { text: "5 campañas publicitarias", included: true },
        { text: "20,000 impresiones incluidas", included: true },
        { text: "Analytics avanzado + ROI", included: true },
        { text: "CRM integrado", included: true },
        { text: "Account Manager dedicado", included: true },
        { text: "API Access", included: true },
        { text: "Hasta 5 usuarios", included: true }
      ],
      cta: "Elegir Profesional",
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "15,000",
      period: "mes",
      description: "Para grandes corporaciones",
      icon: Sparkles,
      features: [
        { text: "Contactos ILIMITADOS", included: true },
        { text: "Contratos ILIMITADOS", included: true },
        { text: "10 campañas publicitarias", included: true },
        { text: "100,000 impresiones incluidas", included: true },
        { text: "Dashboard personalizado", included: true },
        { text: "Whitelabel incluido", included: true },
        { text: "Soporte 24/7 dedicado", included: true },
        { text: "SLA 99.9% uptime", included: true },
        { text: "Usuarios ilimitados", included: true },
        { text: "Custom integrations", included: true }
      ],
      cta: "Contactar",
      highlighted: false
    }
  ];

  const guarantees = [
    {
      title: "Pago Seguro",
      description: "El dinero se retiene hasta que confirmes que el trabajo está completo"
    },
    {
      title: "Profesionales Verificados",
      description: "Todos los profesionales pasan por un proceso de verificación"
    },
    {
      title: "Sin Sorpresas",
      description: "El precio final es el que acordaste. Sin costos ocultos"
    },
    {
      title: "Soporte 24/7",
      description: "Nuestro equipo está disponible para ayudarte cuando lo necesites"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-background" />
          <div className="container relative z-10">
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold gradient-text">
                Precios Transparentes
              </h1>
              <p className="text-xl text-muted-foreground">
                Sin costos ocultos. Sin sorpresas. Solo tarifas justas y claras.
              </p>
            </div>
          </div>
        </section>

        {/* Para Clientes */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Para Clientes</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Publicá encargos gratis y pagá solo cuando el trabajo esté completo
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {clientPricing.map((item, index) => (
                <Card key={index} className="border-border/50 hover:shadow-elegant transition-all">
                  <CardContent className="p-6 text-center space-y-4">
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <div className="text-4xl font-bold gradient-text">{item.price}</div>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button size="lg" onClick={() => navigate('/auth')} className="shadow-elegant">
                Publicar mi encargo gratis
              </Button>
            </div>
          </div>
        </section>

        {/* Planes por Rol con Tabs */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Planes de Suscripción</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Elegí el plan perfecto según tu rol y necesidades
              </p>
            </div>

            <Tabs defaultValue="professionals" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
                <TabsTrigger value="professionals" className="text-base">
                  <Wrench className="h-4 w-4 mr-2" />
                  Profesionales
                </TabsTrigger>
                <TabsTrigger value="business" className="text-base">
                  <Building2 className="h-4 w-4 mr-2" />
                  Empresas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="professionals" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {masterPlans.map((plan, index) => {
                    const Icon = plan.icon;
                    return (
                      <Card 
                        key={index} 
                        className={`border-border/50 hover:shadow-elegant transition-all relative ${
                          plan.highlighted ? 'ring-2 ring-primary shadow-primary/20 scale-105' : ''
                        }`}
                      >
                        {plan.badge && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                            <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                              {plan.badge}
                            </span>
                          </div>
                        )}
                        <CardHeader className="text-center space-y-4 pb-8">
                          <div className="flex justify-center">
                            <div className="p-3 rounded-full bg-primary/10">
                              <Icon className="h-8 w-8 text-primary" />
                            </div>
                          </div>
                          <CardTitle className="text-2xl">{plan.name}</CardTitle>
                          <div className="flex items-baseline justify-center gap-2">
                            <span className="text-4xl font-bold gradient-text">${plan.price}</span>
                            <span className="text-muted-foreground">/ {plan.period}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                          {plan.roi && (
                            <div className="text-xs font-semibold text-primary bg-primary/10 py-1 px-3 rounded-full inline-block">
                              {plan.roi}
                            </div>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <ul className="space-y-3">
                            {plan.features.map((feature, fIndex) => (
                              <li key={fIndex} className="flex items-start gap-3">
                                {feature.included ? (
                                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                ) : (
                                  <X className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                                )}
                                <span className={`text-sm ${feature.included ? '' : 'text-muted-foreground'}`}>
                                  {feature.text}
                                </span>
                              </li>
                            ))}
                          </ul>
                          <Button 
                            className="w-full shadow-elegant" 
                            variant={plan.highlighted ? 'default' : 'outline'}
                            onClick={() => navigate('/auth?type=master')}
                          >
                            {plan.cta}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="business" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {businessPlans.map((plan, index) => {
                    const Icon = plan.icon;
                    return (
                      <Card 
                        key={index} 
                        className={`border-border/50 hover:shadow-elegant transition-all relative ${
                          plan.highlighted ? 'ring-2 ring-primary shadow-primary/20 scale-105' : ''
                        }`}
                      >
                        {plan.badge && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                            <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                              {plan.badge}
                            </span>
                          </div>
                        )}
                        <CardHeader className="text-center space-y-4 pb-8">
                          <div className="flex justify-center">
                            <div className="p-3 rounded-full bg-primary/10">
                              <Icon className="h-8 w-8 text-primary" />
                            </div>
                          </div>
                          <CardTitle className="text-2xl">{plan.name}</CardTitle>
                          <div className="flex items-baseline justify-center gap-2">
                            <span className="text-4xl font-bold gradient-text">${plan.price}</span>
                            <span className="text-muted-foreground">/ {plan.period}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <ul className="space-y-3">
                            {plan.features.map((feature, fIndex) => (
                              <li key={fIndex} className="flex items-start gap-3">
                                {feature.included ? (
                                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                ) : (
                                  <X className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                                )}
                                <span className={`text-sm ${feature.included ? '' : 'text-muted-foreground'}`}>
                                  {feature.text}
                                </span>
                              </li>
                            ))}
                          </ul>
                          <Button 
                            className="w-full shadow-elegant" 
                            variant={plan.highlighted ? 'default' : 'outline'}
                            onClick={() => navigate('/auth?type=business')}
                          >
                            {plan.cta}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Garantías */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Nuestras Garantías</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Tu tranquilidad es nuestra prioridad
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {guarantees.map((guarantee, index) => (
                <Card key={index} className="border-border/50">
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto">
                      <Check className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">{guarantee.title}</h3>
                    <p className="text-sm text-muted-foreground">{guarantee.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container max-w-3xl">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Preguntas Frecuentes</h2>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">¿Cuándo se cobra la comisión?</h3>
                  <p className="text-muted-foreground">
                    La comisión se cobra únicamente cuando el servicio se completa exitosamente y el cliente confirma el trabajo. Si el servicio no se realiza, no hay ningún cargo.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">¿Puedo cancelar mi Plan Premium?</h3>
                  <p className="text-muted-foreground">
                    Sí, podés cancelar tu suscripción en cualquier momento. Si cancelás, seguirás teniendo acceso a las funciones Premium hasta el final del período pagado.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">¿Cómo funciona la protección de pago?</h3>
                  <p className="text-muted-foreground">
                    El dinero se retiene de forma segura hasta que confirmes que el trabajo está completo. Si hay algún problema, nuestro equipo de soporte te ayudará a resolverlo.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
