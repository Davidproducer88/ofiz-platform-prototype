import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Search, MessageSquare, Calendar, CreditCard, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/seo/SEOHead";
import { HOW_IT_WORKS_SEO } from "@/lib/seoData";
import { generateFAQJsonLd } from "@/components/seo/JsonLd";
export default function HowItWorks() {
  const navigate = useNavigate();

  const clientSteps = [
    {
      icon: <Search className="h-8 w-8 text-primary" />,
      title: "1. Publicá tu encargo",
      description: "Describí el trabajo que necesitás y recibí presupuestos de profesionales verificados en minutos."
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      title: "2. Compará y elegí",
      description: "Revisá perfiles, calificaciones y opiniones. Elegí el profesional que mejor se adapte a tus necesidades."
    },
    {
      icon: <Calendar className="h-8 w-8 text-primary" />,
      title: "3. Coordiná el servicio",
      description: "Chateá directamente con el profesional, coordiná fecha y hora que mejor te convengan."
    },
    {
      icon: <CheckCircle2 className="h-8 w-8 text-primary" />,
      title: "4. Recibí el servicio",
      description: "El profesional realiza el trabajo acordado con la máxima calidad y profesionalismo."
    },
    {
      icon: <CreditCard className="h-8 w-8 text-primary" />,
      title: "5. Pagá con seguridad",
      description: "Realizá el pago de forma segura a través de nuestra plataforma. Tu dinero está protegido."
    },
    {
      icon: <Star className="h-8 w-8 text-primary" />,
      title: "6. Dejá tu opinión",
      description: "Calificá el servicio recibido y ayudá a otros usuarios a tomar mejores decisiones."
    }
  ];

  const masterSteps = [
    {
      icon: <CheckCircle2 className="h-8 w-8 text-secondary" />,
      title: "1. Registrate gratis",
      description: "Creá tu perfil profesional en minutos. Es gratis y sin compromisos."
    },
    {
      icon: <Star className="h-8 w-8 text-secondary" />,
      title: "2. Completá tu perfil",
      description: "Agregá tu experiencia, fotos de trabajos realizados y obtené la verificación de identidad."
    },
    {
      icon: <Search className="h-8 w-8 text-secondary" />,
      title: "3. Recibí solicitudes",
      description: "Los clientes te encontrarán y recibirás notificaciones de trabajos que coincidan con tu perfil."
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-secondary" />,
      title: "4. Enviá tu presupuesto",
      description: "Revisá los detalles del trabajo, chateá con el cliente y enviá tu mejor propuesta."
    },
    {
      icon: <Calendar className="h-8 w-8 text-secondary" />,
      title: "5. Realizá el trabajo",
      description: "Una vez aceptado, coordiná con el cliente y realizá el servicio con profesionalismo."
    },
    {
      icon: <CreditCard className="h-8 w-8 text-secondary" />,
      title: "6. Recibí tu pago",
      description: "El pago se libera automáticamente al completar el trabajo. Cobrá de forma rápida y segura."
    }
  ];

  // FAQ Schema for SEO
  const faqJsonLd = generateFAQJsonLd({
    questions: [
      { question: '¿Cómo funciona Ofiz para clientes?', answer: 'Publicás tu encargo gratis, recibís presupuestos de profesionales verificados, elegís el mejor, coordinás el servicio, pagás de forma segura y dejás tu opinión.' },
      { question: '¿Cuánto cuesta usar Ofiz?', answer: 'Para clientes es gratis publicar encargos. Solo se cobra una comisión del 5% cuando el trabajo se completa exitosamente.' },
      { question: '¿Los profesionales están verificados?', answer: 'Sí, todos los profesionales pasan por un proceso de verificación de identidad y credenciales antes de poder ofrecer sus servicios.' },
      { question: '¿El pago es seguro?', answer: 'Sí, utilizamos un sistema de escrow donde el dinero se retiene hasta que confirmes que el trabajo está completo.' },
    ],
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title={HOW_IT_WORKS_SEO.title}
        description={HOW_IT_WORKS_SEO.description}
        canonical={HOW_IT_WORKS_SEO.canonical}
        keywords={HOW_IT_WORKS_SEO.keywords}
        breadcrumbs={[{ label: 'Cómo Funciona' }]}
        jsonLd={faqJsonLd}
      />
      <Header />
      <main className="flex-1">
        {/* Breadcrumbs */}
        <div className="container pt-8">
          <Breadcrumbs items={[{ label: "Cómo Funciona" }]} />
        </div>

        {/* Hero Section */}
        <section className="relative py-12 md:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-background" />
          <div className="container relative z-10">
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold gradient-text">
                ¿Cómo funciona Ofiz?
              </h1>
              <p className="text-xl text-muted-foreground">
                Conectamos clientes con profesionales verificados de forma simple, rápida y segura.
              </p>
            </div>
          </div>
        </section>

        {/* Para Clientes */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Para Clientes</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Encontrá el profesional perfecto para tu proyecto en 6 simples pasos
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {clientSteps.map((step, index) => (
                <Card key={index} className="border-border/50 hover:shadow-elegant transition-all hover:scale-105">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
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
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Para Profesionales</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Conseguí más clientes y hacé crecer tu negocio con Ofiz
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {masterSteps.map((step, index) => (
                <Card key={index} className="border-border/50 hover:shadow-elegant transition-all hover:scale-105">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button size="lg" onClick={() => navigate('/auth?type=master')} className="shadow-elegant">
                Registrarme como profesional
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-secondary/10 to-background">
          <div className="container">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 md:p-12 text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">¿Listo para comenzar?</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Unite a miles de personas que ya confían en Ofiz para sus proyectos y servicios
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" onClick={() => navigate('/auth')} className="shadow-elegant">
                    Soy Cliente
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate('/auth?type=master')}>
                    Soy Profesional
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
