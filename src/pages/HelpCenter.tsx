import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare, Book, Video, FileText, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HelpCenter() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      icon: <Book className="h-8 w-8 text-primary" />,
      title: "Primeros Pasos",
      description: "Guías para comenzar a usar Ofiz",
      articles: [
        "Cómo crear una cuenta",
        "Completar tu perfil",
        "Publicar tu primer encargo",
        "Postularte a un trabajo"
      ]
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      title: "Comunicación",
      description: "Todo sobre chat y mensajes",
      articles: [
        "Usar el chat integrado",
        "Notificaciones y alertas",
        "Compartir archivos y fotos",
        "Etiqueta de comunicación"
      ]
    },
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "Pagos y Facturación",
      description: "Información sobre pagos",
      articles: [
        "Pagos seguros con Mercado Pago",
        "Cómo funciona el pago protegido",
        "Retiros y transferencias",
        "Facturación y comprobantes"
      ]
    },
    {
      icon: <Video className="h-8 w-8 text-primary" />,
      title: "Cuenta y Perfil",
      description: "Gestión de tu cuenta",
      articles: [
        "Editar información personal",
        "Verificación de identidad",
        "Configuración de privacidad",
        "Cambiar contraseña"
      ]
    }
  ];

  const faqs = [
    {
      question: "¿Cómo publico un encargo?",
      answer: "Iniciá sesión, hacé clic en 'Publicar Encargo', completá los detalles del trabajo que necesitás y enviá. Los profesionales interesados te enviarán sus presupuestos."
    },
    {
      question: "¿Cuánto tiempo tarda en recibir presupuestos?",
      answer: "Generalmente comenzarás a recibir presupuestos en las primeras 24 horas. Los profesionales tienen 72 horas para enviar sus propuestas."
    },
    {
      question: "¿Cómo elijo al mejor profesional?",
      answer: "Revisá sus calificaciones, comentarios de otros clientes, trabajos anteriores y compará presupuestos. Podés chatear con ellos antes de decidir."
    },
    {
      question: "¿Es seguro realizar pagos en Ofiz?",
      answer: "Sí, totalmente seguro. El dinero se retiene en Ofiz hasta que confirmes que el trabajo está completo. Ambas partes están protegidas."
    },
    {
      question: "¿Qué pasa si no estoy satisfecho con el trabajo?",
      answer: "Contactá a nuestro equipo de soporte. Mediamos entre ambas partes para encontrar una solución justa. Tu satisfacción es importante para nosotros."
    },
    {
      question: "¿Cómo me verifico como profesional?",
      answer: "Desde tu perfil, en la sección 'Verificación', cargá una foto de tu documento de identidad. El proceso toma 24-48 horas."
    }
  ];

  const resources = [
    {
      title: "Guía Completa para Clientes",
      type: "PDF",
      description: "Todo lo que necesitás saber como cliente en un solo documento"
    },
    {
      title: "Manual del Profesional",
      type: "PDF",
      description: "Cómo maximizar tus oportunidades en Ofiz"
    },
    {
      title: "Videos Tutoriales",
      type: "Video",
      description: "Aprende visualmente con nuestros tutoriales paso a paso"
    },
    {
      title: "Mejores Prácticas",
      type: "Artículo",
      description: "Tips y consejos de nuestra comunidad"
    }
  ];

  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email",
      info: "soporte@ofiz.com",
      description: "Respuesta en 24 horas"
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Teléfono",
      info: "+598 98 817 806",
      description: "Lunes a Viernes 9-18hs"
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Chat en Vivo",
      info: "Disponible ahora",
      description: "Respuesta inmediata"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Breadcrumbs */}
        <div className="container pt-8">
          <Breadcrumbs items={[{ label: "Centro de Ayuda" }]} />
        </div>
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-background" />
          <div className="container relative z-10">
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold gradient-text">
                ¿En qué podemos ayudarte?
              </h1>
              <p className="text-xl text-muted-foreground">
                Encontrá respuestas a tus preguntas o contactá a nuestro equipo de soporte
              </p>
              
              {/* Search Bar */}
              <div className="flex gap-2 max-w-2xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar en la ayuda..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button>Buscar</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Categorías */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Categorías de Ayuda</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <Card key={index} className="border-border/50 hover:shadow-elegant transition-all cursor-pointer">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-semibold">{category.title}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                    <ul className="space-y-2 pt-2">
                      {category.articles.map((article, aIndex) => (
                        <li key={aIndex} className="text-sm text-primary hover:underline cursor-pointer">
                          {article}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container max-w-4xl">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Preguntas Frecuentes</h2>
              <p className="text-lg text-muted-foreground">
                Las respuestas a las preguntas más comunes
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-border/50">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-3">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Recursos */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Recursos Descargables</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {resources.map((resource, index) => (
                <Card key={index} className="border-border/50 hover:shadow-elegant transition-all cursor-pointer">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{resource.title}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {resource.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                    <Button variant="outline" size="sm" className="w-full">
                      Descargar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contacto */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">¿No encontraste lo que buscabas?</h2>
              <p className="text-lg text-muted-foreground">
                Nuestro equipo está listo para ayudarte
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {contactMethods.map((method, index) => (
                <Card key={index} className="border-border/50 hover:shadow-elegant transition-all cursor-pointer">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto text-primary">
                      {method.icon}
                    </div>
                    <h3 className="font-semibold">{method.title}</h3>
                    <p className="text-lg font-medium text-primary">{method.info}</p>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button size="lg" onClick={() => navigate('/contact')} className="shadow-elegant">
                Contactar Soporte
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
