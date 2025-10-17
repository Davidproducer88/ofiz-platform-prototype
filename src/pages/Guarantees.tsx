import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, CheckCircle2, Users, Clock, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Guarantees() {
  const navigate = useNavigate();

  const guarantees = [
    {
      icon: <Shield className="h-12 w-12 text-primary" />,
      title: "Pago Protegido",
      description: "Tu dinero está seguro. El pago se retiene hasta que confirmes que el trabajo está completado a tu satisfacción.",
      details: [
        "El profesional recibe el pago solo después de tu confirmación",
        "Sistema de escrow que protege a ambas partes",
        "Proceso de resolución de disputas imparcial",
        "Reembolso garantizado en caso de incumplimiento"
      ]
    },
    {
      icon: <Users className="h-12 w-12 text-primary" />,
      title: "Profesionales Verificados",
      description: "Todos los profesionales pasan por un riguroso proceso de verificación antes de unirse a Ofiz.",
      details: [
        "Verificación de identidad obligatoria",
        "Validación de experiencia y credenciales",
        "Sistema de calificaciones y reseñas verificadas",
        "Monitoreo continuo de calidad de servicio"
      ]
    },
    {
      icon: <CheckCircle2 className="h-12 w-12 text-primary" />,
      title: "Satisfacción Garantizada",
      description: "Si el trabajo no cumple con lo acordado, trabajamos para encontrar una solución justa para ambas partes.",
      details: [
        "Mediación profesional en caso de conflictos",
        "Posibilidad de revisión del trabajo",
        "Compensación en casos justificados",
        "Compromiso con la calidad del servicio"
      ]
    },
    {
      icon: <Lock className="h-12 w-12 text-primary" />,
      title: "Privacidad y Seguridad",
      description: "Tus datos personales y de pago están protegidos con la más alta tecnología de seguridad.",
      details: [
        "Encriptación de datos de extremo a extremo",
        "Cumplimiento con normativas de protección de datos",
        "Servidores seguros y certificados",
        "No compartimos tu información con terceros"
      ]
    },
    {
      icon: <Clock className="h-12 w-12 text-primary" />,
      title: "Soporte 24/7",
      description: "Nuestro equipo está disponible en todo momento para ayudarte con cualquier duda o problema.",
      details: [
        "Respuesta rápida a consultas",
        "Equipo especializado en resolución de problemas",
        "Chat en vivo y múltiples canales de contacto",
        "Seguimiento personalizado de tu caso"
      ]
    },
    {
      icon: <AlertCircle className="h-12 w-12 text-primary" />,
      title: "Transparencia Total",
      description: "Sin letra chica ni costos ocultos. Todo claro desde el principio.",
      details: [
        "Términos y condiciones claros y accesibles",
        "Estructura de precios transparente",
        "Todos los costos informados por adelantado",
        "Informes detallados de cada transacción"
      ]
    }
  ];

  const protectionProcess = [
    {
      step: "1",
      title: "Acuerdo Inicial",
      description: "Cliente y profesional acuerdan el alcance del trabajo y el precio antes de comenzar."
    },
    {
      step: "2",
      title: "Depósito Seguro",
      description: "El cliente deposita el pago en Ofiz, que lo mantiene en custodia de forma segura."
    },
    {
      step: "3",
      title: "Realización del Trabajo",
      description: "El profesional realiza el servicio según lo acordado, con seguimiento en tiempo real."
    },
    {
      step: "4",
      title: "Confirmación del Cliente",
      description: "El cliente revisa el trabajo y confirma que está completado satisfactoriamente."
    },
    {
      step: "5",
      title: "Liberación del Pago",
      description: "Una vez confirmado, el pago se libera automáticamente al profesional."
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
              <div className="flex justify-center">
                <Shield className="h-20 w-20 text-primary" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold gradient-text">
                Tu Seguridad es Nuestra Prioridad
              </h1>
              <p className="text-xl text-muted-foreground">
                Trabajamos todos los días para garantizar transacciones seguras y experiencias positivas para todos nuestros usuarios.
              </p>
            </div>
          </div>
        </section>

        {/* Garantías Principales */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {guarantees.map((guarantee, index) => (
                <Card key={index} className="border-border/50 hover:shadow-elegant transition-all">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mx-auto">
                      {guarantee.icon}
                    </div>
                    <h3 className="text-xl font-bold text-center">{guarantee.title}</h3>
                    <p className="text-muted-foreground text-center">{guarantee.description}</p>
                    <ul className="space-y-2 pt-4">
                      {guarantee.details.map((detail, dIndex) => (
                        <li key={dIndex} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Proceso de Protección */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">¿Cómo Funciona la Protección?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Nuestro sistema de pagos protegidos garantiza seguridad en cada transacción
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 max-w-6xl mx-auto">
              {protectionProcess.map((item, index) => (
                <div key={index} className="relative">
                  <Card className="border-border/50 h-full">
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary text-white text-2xl font-bold mx-auto">
                        {item.step}
                      </div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                  {index < protectionProcess.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-primary to-secondary" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Compromiso */}
        <section className="py-16 md:py-24">
          <div className="container">
            <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardContent className="p-8 md:p-12">
                <div className="max-w-3xl mx-auto text-center space-y-6">
                  <h2 className="text-3xl md:text-4xl font-bold">Nuestro Compromiso</h2>
                  <p className="text-lg text-muted-foreground">
                    En Ofiz estamos comprometidos a crear un ecosistema seguro, transparente y justo para todos. 
                    Trabajamos continuamente para mejorar nuestros procesos de seguridad y garantizar la mejor 
                    experiencia para clientes y profesionales.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                    <Button size="lg" onClick={() => navigate('/auth')} className="shadow-elegant">
                      Comenzar Ahora
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => navigate('/contact')}>
                      Contactar Soporte
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Estadísticas */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold gradient-text">99.9%</div>
                <p className="text-muted-foreground">Transacciones exitosas</p>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold gradient-text">10,000+</div>
                <p className="text-muted-foreground">Usuarios satisfechos</p>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold gradient-text">24/7</div>
                <p className="text-muted-foreground">Soporte disponible</p>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold gradient-text">100%</div>
                <p className="text-muted-foreground">Pagos protegidos</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
