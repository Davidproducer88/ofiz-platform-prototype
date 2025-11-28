import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Star, TrendingUp, Shield, Calendar, DollarSign, Users, Award, Zap, Target, MessageSquare, BarChart, ArrowRight, CheckCircle2 } from "lucide-react";
import logoOfiz from "@/assets/logo-ofiz-new.png";
import { useNavigate } from "react-router-dom";

export const DossierMaestros = () => {
  const navigate = useNavigate();
  
  const handlePrint = () => {
    window.print();
  };

  const handleRegister = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Fixed Actions - Mobile Optimized */}
      <div className="print:hidden fixed top-4 right-4 z-50 flex flex-col gap-2">
        <Button onClick={handleRegister} size="lg" className="shadow-lg">
          🚀 Registrarme Gratis
        </Button>
        <Button onClick={handlePrint} size="lg" variant="outline" className="shadow-lg bg-background">
          📄 Descargar PDF
        </Button>
      </div>

      {/* Page 1: Hero Cover */}
      <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 page-break">
        <div className="max-w-4xl w-full text-center space-y-6 md:space-y-8">
          <div className="space-y-4">
            <div className="flex justify-center mb-4 md:mb-6">
              <img 
                src={logoOfiz} 
                alt="Ofiz" 
                className="h-20 md:h-32"
              />
            </div>
            <p className="text-xl md:text-3xl font-semibold text-muted-foreground">
              Plataforma #1 para Profesionales
            </p>
          </div>
          
          <div className="space-y-4 md:space-y-6 mt-8 md:mt-12">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Multiplica tus Ingresos <br />
              <span className="text-primary">Hasta 300%</span>
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto px-4">
              Miles de clientes buscan profesionales como tú todos los días. Conecta, trabaja y cobra de forma 100% segura.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-12 md:mt-16 px-4">
            <Card className="p-4 md:p-6 bg-primary/5 border-primary/20">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">+10,000</div>
              <div className="text-xs md:text-sm text-muted-foreground">Clientes Activos</div>
            </Card>
            <Card className="p-4 md:p-6 bg-primary/5 border-primary/20">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">$2.5M</div>
              <div className="text-xs md:text-sm text-muted-foreground">Pagados a Profesionales</div>
            </Card>
            <Card className="p-4 md:p-6 bg-primary/5 border-primary/20">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">4.8★</div>
              <div className="text-xs md:text-sm text-muted-foreground">Satisfacción</div>
            </Card>
          </div>

          <div className="mt-12 md:mt-16 text-xs md:text-sm text-muted-foreground">
            Dossier Profesional 2025 | Uruguay
          </div>
        </div>
      </div>

      {/* Page 2: Problem → Solution */}
      <div className="min-h-screen p-4 md:p-8 page-break flex items-center">
        <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 w-full">
          <div className="text-center space-y-3 md:space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">¿Te suenan estos problemas?</h2>
            <p className="text-base md:text-xl text-muted-foreground">Sabemos lo difícil que es ser profesional independiente</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <Card className="p-6 md:p-8 bg-destructive/5 border-destructive/20">
              <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-destructive">❌ Realidad Actual</h3>
              <ul className="space-y-4 md:space-y-5">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-sm md:text-base">Pocos Clientes</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Dependes de boca en boca y redes sociales que no convierten</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-sm md:text-base">Cobros Riesgosos</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Clientes que no pagan, cheques rechazados, disputas sin resolver</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-sm md:text-base">Tiempo Perdido</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Horas en WhatsApp, presupuestos que no cierran, seguimientos eternos</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-sm md:text-base">Sin Protección</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Trabajas sin contratos, seguros ni respaldo legal ante problemas</p>
                  </div>
                </li>
              </ul>
            </Card>

            <Card className="p-6 md:p-8 bg-primary/5 border-primary/20">
              <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-primary">✅ Con Ofiz</h3>
              <ul className="space-y-4 md:space-y-5">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm md:text-base">Flujo Constante de Clientes</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Miles de usuarios buscan tu servicio cada día. Aparecer en búsquedas = más trabajos</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm md:text-base">Cobro 100% Garantizado</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Cliente paga ANTES del trabajo. Sistema escrow libera tu dinero al completar. Cero riesgo.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm md:text-base">Todo Automatizado</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Agenda, comunicación, pagos, facturación. Enfócate en trabajar, no en administrar.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm md:text-base">Respaldo Total</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Contratos digitales, seguros incluidos, mediación ante disputas. Trabajas tranquilo.</p>
                  </div>
                </li>
              </ul>
            </Card>
          </div>

          <Card className="p-6 md:p-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl md:text-2xl font-bold mb-2">¿Listo para transformar tu negocio?</h3>
                <p className="text-sm md:text-base text-muted-foreground">Registrate gratis y empieza a recibir solicitudes hoy mismo</p>
              </div>
              <Button size="lg" className="w-full md:w-auto" onClick={handleRegister}>
                Crear Mi Perfil Gratis <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Page 3: Features Deep Dive */}
      <div className="min-h-screen p-4 md:p-8 page-break">
        <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">
          <div className="text-center space-y-3 md:space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Cómo Funciona en Detalle</h2>
            <p className="text-base md:text-xl text-muted-foreground">Cada función pensada para hacerte ganar más</p>
          </div>

          <div className="space-y-6 md:space-y-8">
            {/* Feature 1 */}
            <Card className="p-6 md:p-8 hover:shadow-xl transition-all border-l-4 border-l-primary">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Target className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold mb-3">Perfil Profesional Completo</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-4">
                    Tu carta de presentación digital que trabaja 24/7 para conseguir clientes.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        Portfolio Visual
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground pl-6">
                        Sube fotos antes/después de tus trabajos. Los clientes ven tu calidad al instante y confían más.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        Badge Verificado
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground pl-6">
                        Validamos tu identidad y experiencia. Aparecer como "verificado" aumenta tus conversiones un 65%.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        Sistema de Reseñas
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground pl-6">
                        Cada trabajo completado genera una reseña verificada. Más reviews = más confianza = más trabajos.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        Certificaciones
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground pl-6">
                        Muestra tus cursos, títulos y certificaciones. Destácate de la competencia con tu preparación.
                      </p>
                    </div>
                  </div>
                  <div className="bg-primary/5 p-3 md:p-4 rounded-lg border border-primary/20">
                    <p className="text-xs md:text-sm font-semibold text-primary mb-1">💡 Impacto Real:</p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Profesionales con perfil completo reciben <strong>3.5x más solicitudes</strong> que perfiles básicos.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Feature 2 */}
            <Card className="p-6 md:p-8 hover:shadow-xl transition-all border-l-4 border-l-primary">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold mb-3">Búsqueda Inteligente con IA</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-4">
                    Nuestro algoritmo conecta automáticamente tu perfil con clientes que necesitan exactamente tu servicio.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        Geolocalización Precisa
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground pl-6">
                        Aparecer cuando buscan en tu zona. Define tu radio de acción y recibe solo trabajos cercanos.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        Ranking Dinámico
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground pl-6">
                        Mejor calificación + más trabajos completados = mejores posiciones. Sistema justo basado en mérito.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        Notificaciones Instant
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground pl-6">
                        Push al celular cuando hay un trabajo nuevo en tu área. Responde rápido y cierra más ventas.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        Filtros Avanzados
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground pl-6">
                        Clientes filtran por rating, precio, disponibilidad. Ajusta tu perfil para aparecer más.
                      </p>
                    </div>
                  </div>
                  <div className="bg-primary/5 p-3 md:p-4 rounded-lg border border-primary/20">
                    <p className="text-xs md:text-sm font-semibold text-primary mb-1">💡 Impacto Real:</p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Nuestra IA genera un promedio de <strong>15-25 oportunidades/mes</strong> por profesional activo.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Feature 3 */}
            <Card className="p-6 md:p-8 hover:shadow-xl transition-all border-l-4 border-l-primary">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold mb-3">Sistema de Pagos Escrow</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-4">
                    La mayor innovación: cobras SIEMPRE. Sin excusas, sin demoras, sin riesgos.
                  </p>
                  <div className="space-y-3 mb-4">
                    <div className="bg-background p-4 rounded-lg border">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">1</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm md:text-base mb-1">Cliente Reserva y Paga</h4>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            El cliente paga el monto total o adelanto (tú eliges %) al confirmar la reserva. Dinero queda en escrow (cuenta segura).
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-background p-4 rounded-lg border">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">2</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm md:text-base mb-1">Realizas el Trabajo</h4>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            Sabes que el pago está asegurado. Trabajas tranquilo sabiendo que cobrarás al terminar.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-background p-4 rounded-lg border">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">3</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm md:text-base mb-1">Cliente Confirma Finalizado</h4>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            Cuando el cliente marca el trabajo como completado, el dinero se libera automáticamente a tu cuenta.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-background p-4 rounded-lg border">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">4</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm md:text-base mb-1">Retiras tu Dinero</h4>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            Transferencia directa a tu cuenta bancaria en 24-48hs. Sin trámites, sin esperas.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                      <p className="text-xs md:text-sm font-semibold text-green-700 dark:text-green-400 mb-1">✅ Si hay problemas</p>
                      <p className="text-xs text-muted-foreground">
                        Sistema de mediación con pruebas. Árbitro independiente decide. Tu dinero está protegido.
                      </p>
                    </div>
                    <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                      <p className="text-xs md:text-sm font-semibold text-blue-700 dark:text-blue-400 mb-1">💰 Comisión Justa</p>
                      <p className="text-xs text-muted-foreground">
                        Solo 5% + IVA del monto total. Sin costos ocultos, sin mensualidades obligatorias.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Feature 4 */}
            <Card className="p-6 md:p-8 hover:shadow-xl transition-all border-l-4 border-l-primary">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold mb-3">Gestión Inteligente de Agenda</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-4">
                    Olvídate del Excel y los papeles. Tu calendario digital sincronizado en todos tus dispositivos.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        Vista Diaria/Semanal
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground pl-6">
                        Ve tus trabajos programados, horarios libres, rutas optimizadas para el día.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        Recordatorios Automáticos
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground pl-6">
                        Push 24hs antes del trabajo. Nunca más olvides una cita o llegues tarde.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        Sincronización Multi-Dispositivo
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground pl-6">
                        Actualiza desde el celular o PC. Todo se sincroniza en tiempo real.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        Bloques de Disponibilidad
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground pl-6">
                        Define tus horarios. El sistema solo muestra huecos disponibles a clientes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Feature 5 */}
            <Card className="p-6 md:p-8 hover:shadow-xl transition-all border-l-4 border-l-primary">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BarChart className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold mb-3">Analytics & Business Intelligence</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-4">
                    Dashboards profesionales para tomar decisiones basadas en datos reales de tu negocio.
                  </p>
                  <div className="grid md:grid-cols-3 gap-3 mb-4">
                    <div className="bg-background p-4 rounded-lg border text-center">
                      <BarChart className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="text-xs font-semibold mb-1">Ingresos</p>
                      <p className="text-xs text-muted-foreground">Mensuales, semanales, proyecciones</p>
                    </div>
                    <div className="bg-background p-4 rounded-lg border text-center">
                      <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="text-xs font-semibold mb-1">Tasa Conversión</p>
                      <p className="text-xs text-muted-foreground">% de propuestas que cierras</p>
                    </div>
                    <div className="bg-background p-4 rounded-lg border text-center">
                      <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="text-xs font-semibold mb-1">Clientes</p>
                      <p className="text-xs text-muted-foreground">Nuevos vs recurrentes</p>
                    </div>
                  </div>
                  <div className="bg-primary/5 p-3 md:p-4 rounded-lg border border-primary/20">
                    <p className="text-xs md:text-sm font-semibold text-primary mb-1">📊 Reportes Exportables:</p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Descarga PDFs o Excel para contabilidad, declaraciones o análisis. Todo documentado automáticamente.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Page 4: Plans & Pricing */}
      <div className="min-h-screen p-4 md:p-8 page-break flex items-center">
        <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 w-full">
          <div className="text-center space-y-3 md:space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Planes Para Cada Etapa</h2>
            <p className="text-base md:text-xl text-muted-foreground">Empieza gratis, escala cuando veas resultados</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Free Plan */}
            <Card className="p-6 md:p-8 relative hover:shadow-xl transition-all">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2">Gratuito</h3>
                  <div className="text-3xl md:text-4xl font-bold mb-2">
                    $0<span className="text-base md:text-lg text-muted-foreground">/mes</span>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground">Perfecto para probar</p>
                </div>
                
                <ul className="space-y-3 pt-4">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm md:text-base font-medium">5 propuestas/mes</span>
                      <p className="text-xs text-muted-foreground">Suficiente para arrancar</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Perfil básico público</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Chat ilimitado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Sistema escrow incluido</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Comisión 5% + IVA</span>
                  </li>
                </ul>

                <Button variant="outline" className="w-full mt-6" onClick={handleRegister}>
                  Empezar Gratis
                </Button>
              </div>
            </Card>

            {/* Basic Plus Plan */}
            <Card className="p-6 md:p-8 relative border-2 border-primary shadow-xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs md:text-sm font-semibold shadow-lg">
                  ⚡ Recomendado
                </span>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2">Basic Plus</h3>
                  <div className="text-3xl md:text-4xl font-bold mb-2">
                    $2,990<span className="text-base md:text-lg text-muted-foreground">/mes</span>
                  </div>
                  <p className="text-xs md:text-sm text-primary font-semibold">ROI garantizado en 3 trabajos</p>
                </div>
                
                <ul className="space-y-3 pt-4">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm md:text-base font-semibold">20 propuestas/mes</span>
                      <p className="text-xs text-muted-foreground">4x más oportunidades</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base font-semibold">Perfil mejorado destacado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Visibilidad +50%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Notificaciones prioritarias</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Analytics completo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Soporte email prioritario</span>
                  </li>
                </ul>

                <Button className="w-full mt-6" onClick={handleRegister}>
                  Activar Basic Plus
                </Button>
              </div>
            </Card>

            {/* Premium Plan */}
            <Card className="p-6 md:p-8 relative bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-xl transition-all">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2 flex items-center gap-2">
                    Premium <Star className="w-5 h-5 md:w-6 md:h-6 text-primary fill-primary" />
                  </h3>
                  <div className="text-3xl md:text-4xl font-bold mb-2">
                    $5,990<span className="text-base md:text-lg text-muted-foreground">/mes</span>
                  </div>
                  <p className="text-xs md:text-sm text-primary font-semibold">Máxima exposición y conversión</p>
                </div>
                
                <ul className="space-y-3 pt-4">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm md:text-base font-semibold">50 propuestas/mes</span>
                      <p className="text-xs text-muted-foreground">10x vs plan gratis</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="w-5 h-5 text-primary fill-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base font-semibold">Aparece PRIMERO siempre</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Badge verificado premium</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Destacado en categoría</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Analytics BI avanzado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Soporte WhatsApp directo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Acceso API para integraciones</span>
                  </li>
                </ul>

                <Button variant="default" className="w-full mt-6" onClick={handleRegister}>
                  Activar Premium
                </Button>
              </div>
            </Card>
          </div>

          <Card className="p-6 md:p-8 bg-gradient-to-r from-green-500/10 to-green-500/5 border-green-500/20">
            <div className="text-center space-y-3">
              <h3 className="text-xl md:text-2xl font-bold">🎉 Oferta de Lanzamiento: FUNDADORES</h3>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                Los primeros <strong>100 profesionales</strong> obtienen <strong>30% de descuento de por vida</strong> + badge especial "Miembro Fundador"
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-semibold">Sin compromiso</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-semibold">Cancela cuando quieras</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-semibold">Sin costos ocultos</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Page 5: Success Cases */}
      <div className="min-h-screen p-4 md:p-8 page-break flex items-center">
        <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 w-full">
          <div className="text-center space-y-3 md:space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Historias de Éxito Reales</h2>
            <p className="text-base md:text-xl text-muted-foreground">Profesionales que transformaron su negocio con Ofiz</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <Card className="p-6 md:p-8 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl md:text-2xl">👨‍🔧</span>
                </div>
                <div>
                  <h3 className="font-bold text-base md:text-lg">Carlos Rodríguez</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">Electricista, Montevideo</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className="w-3 h-3 md:w-4 md:h-4 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm md:text-base text-muted-foreground mb-4 italic">
                "Antes trabajaba por recomendaciones y ganaba $40-50K al mes. En 6 meses con Ofiz llegué a $180K mensuales. El sistema escrow me cambió la vida: cobro TODO, siempre."
              </p>
              <div className="grid grid-cols-2 gap-3 bg-primary/5 p-3 md:p-4 rounded-lg">
                <div>
                  <p className="text-xl md:text-2xl font-bold text-primary">+300%</p>
                  <p className="text-xs text-muted-foreground">Aumento ingresos</p>
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-bold text-primary">45</p>
                  <p className="text-xs text-muted-foreground">Trabajos/mes</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl md:text-2xl">👩‍🎨</span>
                </div>
                <div>
                  <h3 className="font-bold text-base md:text-lg">María Fernández</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">Pintora, Maldonado</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className="w-3 h-3 md:w-4 md:h-4 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm md:text-base text-muted-foreground mb-4 italic">
                "Soy madre soltera y necesitaba estabilidad. Ofiz me dio un flujo constante de clientes. Mi perfil verificado con fotos de mis trabajos genera confianza. Ya no persigo pagos."
              </p>
              <div className="grid grid-cols-2 gap-3 bg-primary/5 p-3 md:p-4 rounded-lg">
                <div>
                  <p className="text-xl md:text-2xl font-bold text-primary">$95K</p>
                  <p className="text-xs text-muted-foreground">Ingreso mensual</p>
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-bold text-primary">4.9★</p>
                  <p className="text-xs text-muted-foreground">Rating promedio</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl md:text-2xl">🔧</span>
                </div>
                <div>
                  <h3 className="font-bold text-base md:text-lg">Diego Martínez</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">Plomero, Canelones</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className="w-3 h-3 md:w-4 md:h-4 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm md:text-base text-muted-foreground mb-4 italic">
                "Contraté a mi hijo gracias a los trabajos que me llegan. El plan Premium me pone primero en búsquedas. Vale cada peso: cierro 80% de las propuestas que envío."
              </p>
              <div className="grid grid-cols-2 gap-3 bg-primary/5 p-3 md:p-4 rounded-lg">
                <div>
                  <p className="text-xl md:text-2xl font-bold text-primary">80%</p>
                  <p className="text-xs text-muted-foreground">Tasa conversión</p>
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-bold text-primary">2</p>
                  <p className="text-xs text-muted-foreground">Empleados</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl md:text-2xl">🪴</span>
                </div>
                <div>
                  <h3 className="font-bold text-base md:text-lg">Laura Pérez</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">Jardinera, Montevideo</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className="w-3 h-3 md:w-4 md:h-4 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm md:text-base text-muted-foreground mb-4 italic">
                "Arranqué gratis para probar. En 2 meses ya estaba pagando Premium. Las notificaciones push me avisan al instante de trabajos nuevos. Respondo rápido y cierro más."
              </p>
              <div className="grid grid-cols-2 gap-3 bg-primary/5 p-3 md:p-4 rounded-lg">
                <div>
                  <p className="text-xl md:text-2xl font-bold text-primary">30min</p>
                  <p className="text-xs text-muted-foreground">Tiempo respuesta</p>
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-bold text-primary">65%</p>
                  <p className="text-xs text-muted-foreground">Clientes recurrentes</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6 md:p-8 bg-primary/10 border-primary/30">
            <div className="text-center space-y-4">
              <h3 className="text-2xl md:text-3xl font-bold">¿Quieres ser el próximo caso de éxito?</h3>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                Únete a los cientos de profesionales que ya están transformando su negocio con Ofiz
              </p>
              <Button size="lg" onClick={handleRegister} className="gap-2">
                Crear Mi Perfil Ahora <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Page 6: FAQ & CTA Final */}
      <div className="min-h-screen p-4 md:p-8 page-break flex items-center">
        <div className="max-w-4xl mx-auto space-y-8 md:space-y-12 w-full">
          <div className="text-center space-y-3 md:space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Preguntas Frecuentes</h2>
            <p className="text-base md:text-xl text-muted-foreground">Todo lo que necesitas saber antes de empezar</p>
          </div>

          <div className="space-y-4">
            <Card className="p-6 hover:shadow-lg transition-all">
              <h3 className="font-bold text-base md:text-lg mb-2">¿Realmente es gratis empezar?</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Sí, 100% gratis. Creá tu perfil, subí tu portfolio y empezá a recibir solicitudes sin pagar un peso. Solo cobramos 5% + IVA cuando completás un trabajo. Sin costos fijos, sin mensualidades obligatorias.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all">
              <h3 className="font-bold text-base md:text-lg mb-2">¿Cómo funciona el sistema escrow?</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                El cliente paga al reservar y el dinero queda en una cuenta segura. Cuando completás el trabajo, el sistema libera el pago automáticamente a tu cuenta. Si hay algún problema, un mediador independiente revisa las pruebas y decide. Tu dinero SIEMPRE está protegido.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all">
              <h3 className="font-bold text-base md:text-lg mb-2">¿Cuánto tardo en recibir mi primer trabajo?</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Profesionales con perfil completo (fotos, descripción, servicios) reciben su primera solicitud en promedio en 3-7 días. Con plan Premium, muchos reciben contactos en las primeras 24-48 horas.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all">
              <h3 className="font-bold text-base md:text-lg mb-2">¿Qué pasa si un cliente no está conforme?</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Sistema de mediación con pruebas de ambas partes (fotos, chat, contrato). Un árbitro neutral decide. Si realmente hubo un problema de tu lado, se hace un acuerdo justo. Si el cliente está abusando, tu dinero se libera completo. Todo documentado y transparente.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all">
              <h3 className="font-bold text-base md:text-lg mb-2">¿Puedo usar Ofiz desde el celular?</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Absolutamente. La plataforma está optimizada mobile-first. Gestioná tu agenda, respondé chat, actualizá trabajos, todo desde tu teléfono. Notificaciones push en tiempo real para no perder ninguna oportunidad.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all">
              <h3 className="font-bold text-base md:text-lg mb-2">¿Vale la pena pagar por un plan?</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                El plan Basic Plus ($2,990) se paga con 1-2 trabajos extra al mes. Con 20 propuestas vs 5 del gratis, tenés 4x más oportunidades. Si tu ticket promedio es $15-20K, recuperás la inversión fácil y ganás mucho más.
              </p>
            </Card>
          </div>

          <div className="space-y-6 md:space-y-8 pt-8 md:pt-12">
            <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/20 via-primary/10 to-background border-primary/30 text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
                Empezá Hoy. Gratis.
              </h2>
              <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
                Únete a los miles de profesionales que ya están multiplicando sus ingresos con Ofiz
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button size="lg" className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6" onClick={handleRegister}>
                  🚀 Crear Mi Perfil Gratis
                </Button>
                <Button size="lg" variant="outline" className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6" onClick={handlePrint}>
                  📄 Descargar PDF
                </Button>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  <span>Registro en 2 minutos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  <span>Sin tarjeta requerida</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  <span>Cancela cuando quieras</span>
                </div>
              </div>
            </Card>

            <div className="text-center space-y-3 text-sm text-muted-foreground">
              <p>¿Preguntas? Contactanos:</p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
                <span>📧 profesionales@ofiz.uy</span>
                <span className="hidden md:inline">|</span>
                <span>📱 WhatsApp: +598 99 123 456</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
