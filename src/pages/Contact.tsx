import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().trim().email('Email inválido').max(255),
  phone: z.string().trim().max(20),
  subject: z.string().min(1, 'Selecciona un asunto'),
  message: z.string().trim().min(10, 'El mensaje debe tener al menos 10 caracteres').max(1000)
});

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const validation = contactSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as string] = error.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      // Simulate sending message
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Mensaje enviado",
        description: "Te responderemos pronto"
      });

      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: "Error al enviar",
        description: "Intenta nuevamente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email",
      info: "hola@ofiz.com.uy",
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
        {/* Breadcrumbs */}
        <div className="container pt-8">
          <Breadcrumbs items={[{ label: "Contacto" }]} />
        </div>

        {/* Hero Section */}
        <section className="relative py-12 md:py-20 overflow-hidden">
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
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            disabled={loading}
                            required
                          />
                          {errors.name && (
                            <p className="text-sm text-destructive">{errors.name}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="tu@email.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            disabled={loading}
                            required
                          />
                          {errors.email && (
                            <p className="text-sm text-destructive">{errors.email}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Teléfono (opcional)</Label>
                          <Input
                            id="phone"
                            placeholder="+598..."
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            disabled={loading}
                          />
                          {errors.phone && (
                            <p className="text-sm text-destructive">{errors.phone}</p>
                          )}
                        </div>
                          <div className="space-y-2">
                            <Label htmlFor="subject">Asunto</Label>
                            <Select
                              value={formData.subject}
                              onValueChange={(value) => handleInputChange('subject', value)}
                              disabled={loading}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un asunto" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="general">Soporte General</SelectItem>
                                <SelectItem value="technical">Problemas Técnicos</SelectItem>
                                <SelectItem value="billing">Facturación</SelectItem>
                                <SelectItem value="partnership">Alianzas</SelectItem>
                                <SelectItem value="press">Prensa</SelectItem>
                                <SelectItem value="other">Otro</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.subject && (
                              <p className="text-sm text-destructive">{errors.subject}</p>
                            )}
                          </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Mensaje</Label>
                        <Textarea
                          id="message"
                          placeholder="Contanos en qué podemos ayudarte..."
                          rows={6}
                          value={formData.message}
                          onChange={(e) => handleInputChange('message', e.target.value)}
                          disabled={loading}
                          required
                        />
                        {errors.message && (
                          <p className="text-sm text-destructive">{errors.message}</p>
                        )}
                      </div>

                      <Button type="submit" size="lg" className="w-full shadow-elegant" disabled={loading}>
                        <Send className="mr-2 h-4 w-4" />
                        {loading ? 'Enviando...' : 'Enviar Mensaje'}
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
                    <Button variant="outline" className="w-full" onClick={() => window.location.href = '/help-center'}>
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
