import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Clock, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Mensaje enviado. Te responderemos pronto.");
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email",
      info: "hola@ofiz.com",
      description: "Respuesta en 24 horas"
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Teléfono",
      info: "+598 98 817 806",
      description: "Lunes a Viernes 9-18hs"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Dirección",
      info: "Montevideo, Uruguay",
      description: "América del Sur"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Horario",
      info: "9:00 - 18:00",
      description: "Lunes a Viernes"
    }
  ];

  const reasons = [
    {
      title: "Soporte General",
      description: "Preguntas sobre cómo usar la plataforma"
    },
    {
      title: "Problemas Técnicos",
      description: "Reportar errores o fallas en el sistema"
    },
    {
      title: "Facturación",
      description: "Consultas sobre pagos y facturas"
    },
    {
      title: "Alianzas",
      description: "Propuestas de colaboración o partnerships"
    },
    {
      title: "Prensa",
      description: "Consultas de medios de comunicación"
    },
    {
      title: "Otro",
      description: "Cualquier otra consulta o comentario"
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
                Contactanos
              </h1>
              <p className="text-xl text-muted-foreground">
                Estamos aquí para ayudarte. Envianos tu consulta y te responderemos lo antes posible.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {contactInfo.map((item, index) => (
                <Card key={index} className="border-border/50 hover:shadow-elegant transition-all text-center">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto text-primary">
                      {item.icon}
                    </div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-lg font-medium text-primary">{item.info}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Contact Form and Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Form */}
              <Card className="lg:col-span-2 border-border/50">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Envianos un mensaje</h2>
                      <p className="text-muted-foreground">
                        Completá el formulario y nos pondremos en contacto a la brevedad
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nombre Completo</Label>
                          <Input
                            id="name"
                            placeholder="Tu nombre"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="tu@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Teléfono (opcional)</Label>
                          <Input
                            id="phone"
                            placeholder="+598..."
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subject">Asunto</Label>
                          <Input
                            id="subject"
                            placeholder="¿Sobre qué querés consultar?"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Mensaje</Label>
                        <Textarea
                          id="message"
                          placeholder="Contanos en qué podemos ayudarte..."
                          rows={6}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          required
                        />
                      </div>

                      <Button type="submit" size="lg" className="w-full shadow-elegant">
                        <Send className="mr-2 h-4 w-4" />
                        Enviar Mensaje
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>

              {/* Reasons to Contact */}
              <div className="space-y-6">
                <Card className="border-border/50">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-6 w-6 text-primary" />
                      <h3 className="text-xl font-bold">¿Sobre qué consultar?</h3>
                    </div>
                    <div className="space-y-3">
                      {reasons.map((reason, index) => (
                        <div key={index} className="pb-3 border-b border-border/50 last:border-0 last:pb-0">
                          <h4 className="font-semibold text-sm">{reason.title}</h4>
                          <p className="text-xs text-muted-foreground">{reason.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-secondary/5">
                  <CardContent className="p-6 text-center space-y-4">
                    <h3 className="text-xl font-bold">¿Necesitás ayuda inmediata?</h3>
                    <p className="text-sm text-muted-foreground">
                      Visitá nuestro Centro de Ayuda para encontrar respuestas rápidas
                    </p>
                    <Button variant="outline" className="w-full">
                      Ir al Centro de Ayuda
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Preview */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container max-w-4xl">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Preguntas Frecuentes</h2>
              <p className="text-lg text-muted-foreground">
                Quizás tu respuesta ya esté aquí
              </p>
            </div>

            <div className="space-y-4">
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">¿Cuánto tiempo toma recibir una respuesta?</h3>
                  <p className="text-muted-foreground">
                    Generalmente respondemos dentro de las 24 horas hábiles. Para urgencias, llamanos directamente.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">¿Tienen oficinas físicas?</h3>
                  <p className="text-muted-foreground">
                    Actualmente operamos de forma digital, pero nuestro equipo está en Montevideo, Uruguay.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">¿Atienden consultas en otros idiomas?</h3>
                  <p className="text-muted-foreground">
                    Por el momento brindamos soporte en español. Próximamente agregaremos más idiomas.
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
