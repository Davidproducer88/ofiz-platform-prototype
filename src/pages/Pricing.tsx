import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
      features: [
        { text: "Perfil profesional completo", included: true },
        { text: "5 postulaciones por mes", included: true },
        { text: "Chat con clientes", included: true },
        { text: "Comisión del 5% por servicio", included: true },
        { text: "Verificación de identidad", included: false },
        { text: "Destacado en búsquedas", included: false },
        { text: "Postulaciones ilimitadas", included: false },
        { text: "Estadísticas avanzadas", included: false }
      ],
      cta: "Comenzar Gratis",
      highlighted: false
    },
    {
      name: "Plan Premium",
      price: "990",
      period: "mes",
      description: "Para profesionales que quieren crecer",
      features: [
        { text: "Todo lo del Plan Gratis", included: true },
        { text: "Postulaciones ilimitadas", included: true },
        { text: "Verificación de identidad", included: true },
        { text: "Perfil destacado en búsquedas", included: true },
        { text: "Comisión reducida del 3%", included: true },
        { text: "Estadísticas avanzadas", included: true },
        { text: "Soporte prioritario", included: true },
        { text: "Insignia Premium en perfil", included: true }
      ],
      cta: "Elegir Premium",
      highlighted: true
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

        {/* Para Profesionales */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Para Profesionales</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Elegí el plan que mejor se adapte a tus necesidades
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {masterPlans.map((plan, index) => (
                <Card 
                  key={index} 
                  className={`border-border/50 hover:shadow-elegant transition-all ${
                    plan.highlighted ? 'ring-2 ring-primary shadow-primary/20' : ''
                  }`}
                >
                  <CardHeader className="text-center space-y-2 pb-8">
                    {plan.highlighted && (
                      <div className="text-sm font-semibold text-primary">Más Popular</div>
                    )}
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
                          <span className={feature.included ? '' : 'text-muted-foreground'}>
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
              ))}
            </div>
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
