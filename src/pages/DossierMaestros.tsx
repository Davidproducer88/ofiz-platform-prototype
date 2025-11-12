import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Star, TrendingUp, Shield, Calendar, DollarSign, Users, Award, Zap, Target, MessageSquare, BarChart } from "lucide-react";
import logoOfiz from "@/assets/logo-ofiz-new.png";

export const DossierMaestros = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Print Button - Hide on print */}
      <div className="print:hidden fixed top-4 right-4 z-50">
        <Button onClick={handlePrint} size="lg">
          📄 Descargar PDF
        </Button>
      </div>

      {/* Page 1: Cover */}
      <div className="min-h-screen flex flex-col items-center justify-center p-8 page-break">
        <div className="max-w-4xl w-full text-center space-y-8">
          <div className="space-y-4">
            <div className="flex justify-center mb-6">
              <img 
                src={logoOfiz} 
                alt="Ofiz" 
                className="h-24 md:h-32"
              />
            </div>
            <p className="text-3xl font-semibold text-muted-foreground">
              Plataforma para Profesionales
            </p>
          </div>
          
          <div className="space-y-6 mt-12">
            <h2 className="text-5xl font-bold">
              Impulsa tu Negocio de Servicios
            </h2>
            <p className="text-2xl text-muted-foreground max-w-2xl mx-auto">
              Conecta con clientes, gestiona trabajos y aumenta tus ingresos hasta un 300%
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-16">
            <Card className="p-6 bg-primary/5">
              <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-sm text-muted-foreground">Clientes Activos</div>
            </Card>
            <Card className="p-6 bg-primary/5">
              <div className="text-4xl font-bold text-primary mb-2">5,000+</div>
              <div className="text-sm text-muted-foreground">Trabajos Completados</div>
            </Card>
            <Card className="p-6 bg-primary/5">
              <div className="text-4xl font-bold text-primary mb-2">98%</div>
              <div className="text-sm text-muted-foreground">Satisfacción</div>
            </Card>
          </div>

          <div className="mt-16 text-sm text-muted-foreground">
            Dossier Profesional 2025 | Uruguay
          </div>
        </div>
      </div>

      {/* Page 2: Problem & Solution */}
      <div className="min-h-screen p-8 page-break">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-bold">¿Por qué Ofiz?</h2>
            <p className="text-xl text-muted-foreground">Tu socio para crecer profesionalmente</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 bg-destructive/5 border-destructive/20">
              <h3 className="text-2xl font-bold mb-6 text-destructive">❌ Problemas Actuales</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold">Falta de Visibilidad</p>
                    <p className="text-sm text-muted-foreground">Difícil conseguir clientes nuevos constantemente</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold">Pagos Irregulares</p>
                    <p className="text-sm text-muted-foreground">Cobros tardíos o incumplidos afectan tu flujo</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold">Gestión Manual</p>
                    <p className="text-sm text-muted-foreground">Tiempo perdido en administración y seguimiento</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold">Sin Respaldo</p>
                    <p className="text-sm text-muted-foreground">Trabajo sin garantías ni protección legal</p>
                  </div>
                </li>
              </ul>
            </Card>

            <Card className="p-8 bg-primary/5 border-primary/20">
              <h3 className="text-2xl font-bold mb-6 text-primary">✅ Solución Ofiz</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Marketing Automático</p>
                    <p className="text-sm text-muted-foreground">Aparecer en búsquedas de miles de clientes potenciales</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Pago Garantizado</p>
                    <p className="text-sm text-muted-foreground">Sistema escrow: cobras al completar el trabajo</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Todo Digital</p>
                    <p className="text-sm text-muted-foreground">Gestiona reservas, pagos y comunicación en un lugar</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Protección Legal</p>
                    <p className="text-sm text-muted-foreground">Seguros y contratos digitales incluidos</p>
                  </div>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>

      {/* Page 3: Key Features */}
      <div className="min-h-screen p-8 page-break">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-bold">Funcionalidades Principales</h2>
            <p className="text-xl text-muted-foreground">Todo lo que necesitas en una plataforma</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Target className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Perfil Profesional</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Portfolio digital con fotos de trabajos, certificaciones y reseñas de clientes
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Badge verificado
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Galería ilimitada
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Sistema de reviews
                </li>
              </ul>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Users className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Búsqueda Inteligente</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Aparece cuando clientes buscan tu especialidad en tu zona
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Geolocalización
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Ranking por calidad
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Filtros avanzados
                </li>
              </ul>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <MessageSquare className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Chat Directo</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comunicación instantánea con clientes potenciales
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Notificaciones push
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Envío de fotos
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Historial completo
                </li>
              </ul>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <DollarSign className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Pagos Seguros</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Sistema escrow: el cliente paga antes, tú cobras al finalizar
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  MercadoPago integrado
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Retiro automático
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Comisión solo 5%
                </li>
              </ul>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Calendar className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Gestión de Agenda</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Calendario inteligente para organizar tus trabajos
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Vista mensual/semanal
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Recordatorios
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Sincronización
                </li>
              </ul>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <BarChart className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Analíticas Pro</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Dashboards con métricas de tu negocio en tiempo real
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Ingresos mensuales
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Tasa de conversión
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Reportes PDF
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>

      {/* Page 4: Plans & Pricing */}
      <div className="min-h-screen p-8 page-break">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-bold">Planes Flexibles</h2>
            <p className="text-xl text-muted-foreground">Empieza gratis, escala cuando crezcas</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 relative">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Gratuito</h3>
                <div className="text-4xl font-bold">$0<span className="text-lg text-muted-foreground">/mes</span></div>
                <p className="text-sm text-muted-foreground">Ideal para empezar</p>
                
                <ul className="space-y-3 pt-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>5 propuestas/mes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Perfil básico</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Chat ilimitado</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Pagos seguros</span>
                  </li>
                </ul>
              </div>
            </Card>

            <Card className="p-8 relative border-2 border-primary">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  Recomendado
                </span>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Basic Plus</h3>
                <div className="text-4xl font-bold">$2,990<span className="text-lg text-muted-foreground">/mes</span></div>
                <p className="text-sm text-muted-foreground">Para profesionales activos</p>
                
                <ul className="space-y-3 pt-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="font-semibold">20 propuestas/mes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Perfil mejorado</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Visibilidad aumentada</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Notificaciones prioritarias</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Soporte estándar</span>
                  </li>
                </ul>
              </div>
            </Card>

            <Card className="p-8 relative bg-primary/5">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  Premium <Star className="w-6 h-6 text-primary" />
                </h3>
                <div className="text-4xl font-bold">$5,990<span className="text-lg text-muted-foreground">/mes</span></div>
                <p className="text-sm text-muted-foreground">Máxima exposición</p>
                
                <ul className="space-y-3 pt-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="font-semibold">50 propuestas/mes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Perfil destacado</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Aparece primero</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Badge verificado</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Analíticas avanzadas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Soporte VIP</span>
                  </li>
                </ul>
              </div>
            </Card>
          </div>

          <Card className="p-8 bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">ROI Garantizado</h3>
                <p className="text-muted-foreground">Con solo 1-2 trabajos extra al mes ya recuperaste la inversión</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-primary">+300%</div>
                <div className="text-sm text-muted-foreground">Aumento promedio en ingresos</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Page 5: Success Stories */}
      <div className="min-h-screen p-8 page-break">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-bold">Historias de Éxito</h2>
            <p className="text-xl text-muted-foreground">Profesionales que transformaron su negocio</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
                  👨‍🔧
                </div>
                <div>
                  <h3 className="font-bold text-xl">Carlos Rodríguez</h3>
                  <p className="text-sm text-muted-foreground">Plomero - Montevideo</p>
                  <div className="flex gap-1 mt-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-primary text-primary" />)}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground italic mb-4">
                "Antes tenía 3-4 trabajos por semana. Ahora tengo 12-15 y puedo elegir los mejores. 
                Mis ingresos se triplicaron en 6 meses."
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
                <div>
                  <div className="text-2xl font-bold text-primary">+280%</div>
                  <div className="text-sm text-muted-foreground">Aumento ingresos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">4.9★</div>
                  <div className="text-sm text-muted-foreground">Rating promedio</div>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
                  👨‍🎨
                </div>
                <div>
                  <h3 className="font-bold text-xl">Ana Martínez</h3>
                  <p className="text-sm text-muted-foreground">Pintora - Punta del Este</p>
                  <div className="flex gap-1 mt-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-primary text-primary" />)}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground italic mb-4">
                "La plataforma me dio la visibilidad que necesitaba. Ahora trabajo para casas de verano 
                y tengo agenda completa 3 meses adelante."
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
                <div>
                  <div className="text-2xl font-bold text-primary">+320%</div>
                  <div className="text-sm text-muted-foreground">Aumento ingresos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">5.0★</div>
                  <div className="text-sm text-muted-foreground">Rating promedio</div>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
                  👨‍💻
                </div>
                <div>
                  <h3 className="font-bold text-xl">Diego López</h3>
                  <p className="text-sm text-muted-foreground">Técnico IT - Maldonado</p>
                  <div className="flex gap-1 mt-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-primary text-primary" />)}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground italic mb-4">
                "Dejé mi trabajo fijo y ahora gano el doble trabajando freelance. 
                El sistema de pagos seguros me dio la confianza que necesitaba."
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
                <div>
                  <div className="text-2xl font-bold text-primary">+200%</div>
                  <div className="text-sm text-muted-foreground">Aumento ingresos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">4.8★</div>
                  <div className="text-sm text-muted-foreground">Rating promedio</div>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
                  👨‍🌾
                </div>
                <div>
                  <h3 className="font-bold text-xl">Roberto Silva</h3>
                  <p className="text-sm text-muted-foreground">Jardinero - Colonia</p>
                  <div className="flex gap-1 mt-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-primary text-primary" />)}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground italic mb-4">
                "Pasé de hacer jardines pequeños a mantener 15 propiedades mensualmente. 
                La plataforma me organizó todo el negocio."
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
                <div>
                  <div className="text-2xl font-bold text-primary">+250%</div>
                  <div className="text-sm text-muted-foreground">Aumento ingresos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">4.9★</div>
                  <div className="text-sm text-muted-foreground">Rating promedio</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Page 6: How it Works */}
      <div className="min-h-screen p-8 page-break">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-bold">Cómo Funciona</h2>
            <p className="text-xl text-muted-foreground">4 pasos simples para comenzar a crecer</p>
          </div>

          <div className="space-y-8">
            <Card className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">Crea tu Perfil Profesional</h3>
                  <p className="text-muted-foreground mb-4">
                    Completa tu información, sube fotos de trabajos anteriores y verifica tu identidad. 
                    Toma solo 10 minutos y es 100% gratis.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      Datos personales
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      Portfolio de trabajos
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      Certificaciones
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">Recibe Solicitudes de Clientes</h3>
                  <p className="text-muted-foreground mb-4">
                    Los clientes te encuentran en búsquedas o ven tu perfil destacado. 
                    Recibes notificaciones de cada solicitud al instante.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      Notificación push
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      Detalles completos
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      Ubicación exacta
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">Envía tu Presupuesto</h3>
                  <p className="text-muted-foreground mb-4">
                    Chatea con el cliente, aclara dudas y envía tu propuesta. 
                    El cliente acepta y paga en la plataforma.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      Chat en tiempo real
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      Envío de fotos
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      Pago asegurado
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">Realiza el Trabajo y Cobra</h3>
                  <p className="text-muted-foreground mb-4">
                    Completa el trabajo, el cliente confirma y el dinero se libera a tu cuenta. 
                    Simple, rápido y seguro.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      Sistema escrow
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      Retiro inmediato
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      Reseña automática
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Page 7: Call to Action */}
      <div className="min-h-screen flex flex-col items-center justify-center p-8 page-break">
        <div className="max-w-4xl w-full text-center space-y-12">
          <div className="space-y-6">
            <h2 className="text-6xl font-bold">
              ¿Listo para Transformar tu Negocio?
            </h2>
            <p className="text-2xl text-muted-foreground">
              Únete a los miles de profesionales que ya están creciendo con Ofiz
            </p>
          </div>

          <Card className="p-12 bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="space-y-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">Gratis</div>
                  <div className="text-muted-foreground">Plan inicial sin costo</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">10 min</div>
                  <div className="text-muted-foreground">Tiempo de configuración</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                  <div className="text-muted-foreground">Soporte disponible</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Comenzá Hoy</h3>
                <p className="text-muted-foreground">
                  Registrate en ofiz.com.uy y completa tu perfil en minutos
                </p>
                <div className="flex justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    Sin tarjeta de crédito
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    Cancela cuando quieras
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="pt-12 space-y-4">
            <h3 className="text-xl font-semibold">Contacto</h3>
            <div className="flex flex-col gap-2 text-muted-foreground">
              <p>📧 contacto@ofiz.com.uy</p>
              <p>📱 WhatsApp: +598 99 123 456</p>
              <p>🌐 www.ofiz.com.uy</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .page-break {
            page-break-after: always;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};
