import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Search,
  FileText,
  MessageCircle,
  Calendar,
  CreditCard,
  CheckCircle,
  Star,
  DollarSign,
  ArrowRight,
  Clock,
  Shield,
  TrendingUp,
  Users,
  Award
} from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: any;
  status: 'completed' | 'active' | 'pending';
  details?: any;
}

export const DemoWorkflow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps: Step[] = [
    {
      id: 1,
      title: 'Cliente Busca Servicio',
      description: 'Ana necesita un electricista para instalar luces LED en su hogar',
      icon: Search,
      status: currentStep >= 0 ? 'completed' : 'pending',
      details: {
        client: 'Ana García',
        service: 'Instalación de Luces LED',
        location: 'Montevideo, Pocitos',
        budget: '$3,000 - $4,000'
      }
    },
    {
      id: 2,
      title: 'Publica Solicitud',
      description: 'Ana publica su solicitud con detalles del trabajo requerido',
      icon: FileText,
      status: currentStep >= 1 ? 'completed' : 'pending',
      details: {
        title: 'Instalación de Luces LED',
        description: 'Necesito instalar 8 luces LED empotradas en living y cocina',
        budget: '$3,500',
        urgency: 'Esta semana'
      }
    },
    {
      id: 3,
      title: 'Maestros Responden',
      description: '3 electricistas certificados envían sus presupuestos',
      icon: Users,
      status: currentStep >= 2 ? 'completed' : 'pending',
      details: {
        applications: [
          { master: 'Carlos Rodríguez', price: 3200, rating: 4.9, experience: '15 años' },
          { master: 'Luis Pérez', price: 3800, rating: 4.7, experience: '10 años' },
          { master: 'Diego López', price: 3500, rating: 4.8, experience: '12 años' }
        ]
      }
    },
    {
      id: 4,
      title: 'Cliente Acepta Presupuesto',
      description: 'Ana selecciona a Carlos por su experiencia y precio',
      icon: CheckCircle,
      status: currentStep >= 3 ? 'completed' : 'pending',
      details: {
        selected: 'Carlos Rodríguez',
        price: 3200,
        reason: 'Mejor calificación y precio competitivo'
      }
    },
    {
      id: 5,
      title: 'Coordinación por Chat',
      description: 'Ana y Carlos coordinan fecha y detalles del trabajo',
      icon: MessageCircle,
      status: currentStep >= 4 ? 'completed' : 'pending',
      details: {
        messages: [
          { from: 'Ana', text: '¿Podría ser el viernes?' },
          { from: 'Carlos', text: 'Perfecto, confirmo el viernes 14:00hs' },
          { from: 'Ana', text: 'Excelente, nos vemos entonces!' }
        ]
      }
    },
    {
      id: 6,
      title: 'Creación del Encargo',
      description: 'Se formaliza el encargo con fecha, precio y términos',
      icon: Calendar,
      status: currentStep >= 5 ? 'completed' : 'pending',
      details: {
        date: 'Viernes 15 de Noviembre, 14:00hs',
        price: 3200,
        address: 'Av. Brasil 2845, Apto 501',
        duration: '2-3 horas estimadas'
      }
    },
    {
      id: 7,
      title: 'Pago con Garantía',
      description: 'Ana paga $3,200 que quedan en garantía (escrow)',
      icon: CreditCard,
      status: currentStep >= 6 ? 'completed' : 'pending',
      details: {
        amount: 3200,
        method: 'Mercado Pago',
        escrow: true,
        message: 'El dinero está protegido y se liberará cuando confirmes el trabajo completado'
      }
    },
    {
      id: 8,
      title: 'Maestro Realiza el Trabajo',
      description: 'Carlos instala las 8 luces LED según lo acordado',
      icon: Clock,
      status: currentStep >= 7 ? 'completed' : 'pending',
      details: {
        started: '14:05hs',
        completed: '16:30hs',
        photos: true,
        notes: 'Trabajo completado exitosamente. Incluye garantía de 1 año.'
      }
    },
    {
      id: 9,
      title: 'Cliente Confirma',
      description: 'Ana verifica el trabajo y confirma la finalización',
      icon: CheckCircle,
      status: currentStep >= 8 ? 'completed' : 'pending',
      details: {
        verified: true,
        satisfaction: 'Muy satisfecha',
        photos_approved: true
      }
    },
    {
      id: 10,
      title: 'Liberación de Pago',
      description: 'El sistema libera $3,040 a Carlos (95% del total)',
      icon: DollarSign,
      status: currentStep >= 9 ? 'completed' : 'pending',
      details: {
        total: 3200,
        platform_fee: 160,
        master_amount: 3040,
        fee_percentage: '5%'
      }
    },
    {
      id: 11,
      title: 'Cliente Deja Reseña',
      description: 'Ana califica el servicio con 5 estrellas',
      icon: Star,
      status: currentStep >= 10 ? 'completed' : 'pending',
      details: {
        rating: 5,
        comment: 'Excelente trabajo, muy profesional y puntual. Las luces quedaron perfectas.',
        would_recommend: true
      }
    },
    {
      id: 12,
      title: 'Actualización de Ranking',
      description: 'Carlos sube en el ranking de mejores maestros',
      icon: Award,
      status: currentStep >= 11 ? 'completed' : 'pending',
      details: {
        ranking_before: 5,
        ranking_after: 3,
        total_jobs: 88,
        new_rating: 4.91,
        badges_earned: ['Top Electricista', '50+ Trabajos']
      }
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const autoPlay = () => {
    setIsPlaying(true);
    let step = 0;
    const interval = setInterval(() => {
      if (step < steps.length - 1) {
        step++;
        setCurrentStep(step);
      } else {
        setIsPlaying(false);
        clearInterval(interval);
      }
    }, 3000);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">Flujo Completo: De Búsqueda a Pago</CardTitle>
              <p className="text-muted-foreground">
                Experiencia completa de un cliente contratando un maestro con sistema de pago seguro
              </p>
            </div>
            <Button onClick={autoPlay} disabled={isPlaying} size="lg">
              <ArrowRight className="mr-2 h-5 w-5" />
              {isPlaying ? 'Reproduciendo...' : 'Ver Demo Automática'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">Paso {currentStep + 1} de {steps.length}</span>
              <span className="text-muted-foreground">{Math.round(progress)}% completado</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="grid md:grid-cols-12 gap-6">
        {/* Steps List */}
        <div className="md:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pasos del Proceso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(index)}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : isCompleted
                        ? 'bg-muted/50 hover:bg-muted'
                        : 'hover:bg-muted/30'
                    }`}
                  >
                    <div className={`mt-0.5 ${isActive ? 'text-primary-foreground' : ''}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">{step.title}</span>
                        {isCompleted && (
                          <CheckCircle className="h-4 w-4 flex-shrink-0 text-success" />
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 line-clamp-2 ${
                        isActive ? 'text-primary-foreground/90' : 'text-muted-foreground'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Current Step Details */}
        <div className="md:col-span-8">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  {(() => {
                    const Icon = currentStepData.icon;
                    return <Icon className="h-8 w-8 text-primary" />;
                  })()}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{currentStepData.title}</CardTitle>
                  <p className="text-muted-foreground">{currentStepData.description}</p>
                </div>
                <Badge variant={currentStepData.status === 'completed' ? 'default' : 'secondary'}>
                  Paso {currentStep + 1}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Step-specific content */}
              {currentStep === 0 && currentStepData.details && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Cliente</p>
                      <p className="font-semibold">{currentStepData.details.client}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Servicio Buscado</p>
                      <p className="font-semibold">{currentStepData.details.service}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Ubicación</p>
                      <p className="font-semibold">{currentStepData.details.location}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Presupuesto</p>
                      <p className="font-semibold">{currentStepData.details.budget}</p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && currentStepData.details && (
                <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                  <h4 className="font-semibold">{currentStepData.details.title}</h4>
                  <p className="text-sm">{currentStepData.details.description}</p>
                  <div className="flex gap-4 text-sm">
                    <Badge variant="secondary">{currentStepData.details.budget}</Badge>
                    <Badge variant="outline">{currentStepData.details.urgency}</Badge>
                  </div>
                </div>
              )}

              {currentStep === 2 && currentStepData.details && (
                <div className="space-y-3">
                  {currentStepData.details.applications.map((app: any, i: number) => (
                    <div key={i} className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={`/avatars/master-electrician-${i + 1}.jpg`} />
                            <AvatarFallback>{app.master[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{app.master}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span>{app.rating}</span>
                              <span>•</span>
                              <span>{app.experience}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{formatCurrency(app.price)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {currentStep === 3 && currentStepData.details && (
                <div className="p-6 bg-success/10 border border-success/20 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="h-8 w-8 text-success" />
                    <div>
                      <h4 className="font-semibold text-lg">Presupuesto Aceptado</h4>
                      <p className="text-sm text-muted-foreground">
                        Profesional: {currentStepData.details.selected}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Precio acordado</p>
                      <p className="font-bold text-xl">{formatCurrency(currentStepData.details.price)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Razón de selección</p>
                      <p className="text-sm">{currentStepData.details.reason}</p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && currentStepData.details && (
                <div className="space-y-3">
                  {currentStepData.details.messages.map((msg: any, i: number) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg max-w-[80%] ${
                        msg.from === 'Ana'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-xs font-semibold mb-1">{msg.from}</p>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {currentStep === 5 && currentStepData.details && (
                <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Detalles del Encargo</h4>
                  </div>
                  <div className="grid gap-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fecha y hora:</span>
                      <span className="font-semibold">{currentStepData.details.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Precio total:</span>
                      <span className="font-semibold">{formatCurrency(currentStepData.details.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dirección:</span>
                      <span className="font-semibold text-right">{currentStepData.details.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duración estimada:</span>
                      <span className="font-semibold">{currentStepData.details.duration}</span>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 6 && currentStepData.details && (
                <div className="space-y-4">
                  <div className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border-2 border-primary/20">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-primary rounded-lg">
                        <Shield className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg mb-1">Pago Seguro con Garantía</h4>
                        <p className="text-sm text-muted-foreground">{currentStepData.details.message}</p>
                      </div>
                    </div>
                    
                    <div className="bg-background/50 backdrop-blur-sm p-4 rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Monto a pagar:</span>
                        <span className="font-bold text-2xl">{formatCurrency(currentStepData.details.amount)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Método de pago:</span>
                        <Badge variant="secondary" className="text-base">
                          <CreditCard className="h-4 w-4 mr-1" />
                          {currentStepData.details.method}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Shield className="h-4 w-4 text-success" />
                        <span className="text-sm text-success font-semibold">
                          Dinero protegido en garantía (escrow)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
                    <h5 className="font-semibold mb-2 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-info" />
                      ¿Cómo funciona el sistema de garantía?
                    </h5>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>✓ Tu dinero queda retenido de forma segura</li>
                      <li>✓ El maestro NO recibe el pago hasta que confirmes</li>
                      <li>✓ Puedes abrir una disputa si hay problemas</li>
                      <li>✓ Sistema de protección para ambas partes</li>
                    </ul>
                  </div>
                </div>
              )}

              {currentStep === 7 && currentStepData.details && (
                <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Trabajo en Progreso</h4>
                  </div>
                  <div className="grid gap-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hora de inicio:</span>
                      <span className="font-semibold">{currentStepData.details.started}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hora de finalización:</span>
                      <span className="font-semibold">{currentStepData.details.completed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fotos del trabajo:</span>
                      <Badge variant="secondary">3 fotos subidas</Badge>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-background rounded-lg">
                    <p className="text-sm"><strong>Nota del maestro:</strong> {currentStepData.details.notes}</p>
                  </div>
                </div>
              )}

              {currentStep === 8 && currentStepData.details && (
                <div className="p-6 bg-success/10 border border-success/20 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="h-8 w-8 text-success" />
                    <div>
                      <h4 className="font-semibold text-lg">Trabajo Verificado</h4>
                      <p className="text-sm text-muted-foreground">Cliente confirmó la finalización exitosa</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-background rounded-lg">
                      <p className="text-2xl mb-1">✓</p>
                      <p className="text-xs text-muted-foreground">Verificado</p>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg">
                      <p className="text-2xl mb-1">😊</p>
                      <p className="text-xs text-muted-foreground">{currentStepData.details.satisfaction}</p>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg">
                      <p className="text-2xl mb-1">📸</p>
                      <p className="text-xs text-muted-foreground">Fotos aprobadas</p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 9 && currentStepData.details && (
                <div className="space-y-4">
                  <div className="p-6 bg-gradient-to-br from-success/20 to-primary/10 rounded-lg border-2 border-success/30">
                    <div className="flex items-center gap-3 mb-4">
                      <DollarSign className="h-8 w-8 text-success" />
                      <h4 className="font-bold text-lg">Pago Liberado</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-background/50 rounded-lg">
                        <span className="text-muted-foreground">Monto total:</span>
                        <span className="font-bold">{formatCurrency(currentStepData.details.total)}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-background/50 rounded-lg">
                        <span className="text-muted-foreground">Comisión plataforma ({currentStepData.details.fee_percentage}):</span>
                        <span className="font-semibold text-amber-600">-{formatCurrency(currentStepData.details.platform_fee)}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-success/20 rounded-lg border border-success/30">
                        <span className="font-semibold">Pago al maestro:</span>
                        <span className="font-bold text-xl text-success">{formatCurrency(currentStepData.details.master_amount)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      ✓ El dinero fue transferido a la cuenta de Carlos Rodríguez<br />
                      ✓ Disponible para retiro inmediato<br />
                      ✓ Transacción completada de forma segura
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 10 && currentStepData.details && (
                <div className="space-y-4">
                  <div className="p-6 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-lg border border-yellow-500/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex">
                        {[...Array(currentStepData.details.rating)].map((_, i) => (
                          <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="font-bold text-2xl">{currentStepData.details.rating}.0</span>
                    </div>
                    
                    <div className="bg-background/50 p-4 rounded-lg mb-3">
                      <p className="text-sm italic">"{currentStepData.details.comment}"</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {currentStepData.details.would_recommend ? '👍 Recomendaría' : ''}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 11 && currentStepData.details && (
                <div className="space-y-4">
                  <div className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border-2 border-primary/20">
                    <div className="flex items-center gap-3 mb-4">
                      <TrendingUp className="h-8 w-8 text-primary" />
                      <div>
                        <h4 className="font-bold text-lg">Ranking Actualizado</h4>
                        <p className="text-sm text-muted-foreground">Carlos subió en el ranking</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-4 bg-background/50 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground mb-1">Posición Anterior</p>
                        <p className="text-3xl font-bold">#{currentStepData.details.ranking_before}</p>
                      </div>
                      <div className="p-4 bg-primary/20 rounded-lg text-center border border-primary">
                        <p className="text-sm text-muted-foreground mb-1">Nueva Posición</p>
                        <p className="text-3xl font-bold text-primary">#{currentStepData.details.ranking_after}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Trabajos completados:</span>
                        <span className="font-semibold">{currentStepData.details.total_jobs}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Nueva calificación:</span>
                        <span className="font-semibold">{currentStepData.details.new_rating} ⭐</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Insignias ganadas:</p>
                    <div className="flex gap-2">
                      {currentStepData.details.badges_earned.map((badge: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex-1"
                >
                  Anterior
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={currentStep === steps.length - 1}
                  className="flex-1"
                >
                  Siguiente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Summary Stats */}
      <Card className="bg-gradient-to-r from-success/10 via-primary/10 to-secondary/10">
        <CardHeader>
          <CardTitle>Resumen de la Transacción</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">3 días</p>
              <p className="text-sm text-muted-foreground">Tiempo total del proceso</p>
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 mx-auto mb-2 text-success" />
              <p className="text-2xl font-bold">100%</p>
              <p className="text-sm text-muted-foreground">Pago protegido</p>
            </div>
            <div className="text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">5.0</p>
              <p className="text-sm text-muted-foreground">Calificación del servicio</p>
            </div>
            <div className="text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-amber-600" />
              <p className="text-2xl font-bold">$160</p>
              <p className="text-sm text-muted-foreground">Comisión plataforma (5%)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
