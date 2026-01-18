import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Star, TrendingUp, Shield, Users, DollarSign, Award, Zap, Target, BarChart, Clock, Building, ArrowRight, CheckCircle2, Briefcase } from "lucide-react";
import logoOfiz from "@/assets/logo-ofiz-new.png";
import { useNavigate } from "react-router-dom";

export const DossierEmpresas = () => {
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
      <div className="print:hidden fixed top-4 right-4 z-50">
        <Button onClick={handleRegister} size="lg" className="shadow-lg">
          🏢 Pedir una Demo
        </Button>
      </div>

      {/* Page 1: Hero Cover */}
      <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 page-break">
        <div className="max-w-4xl w-full text-center space-y-6 md:space-y-8">
          <div className="space-y-4">
            <div className="flex justify-center mb-4 md:mb-6">
              <img 
                src={logoOfiz} 
                alt="Ofiz Business" 
                className="h-20 md:h-32"
              />
            </div>
            <p className="text-xl md:text-3xl font-semibold text-muted-foreground">
              Solución Empresarial
            </p>
          </div>
          
          <div className="space-y-4 md:space-y-6 mt-8 md:mt-12">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Contrata Profesionales <br />
              <span className="text-primary">40% Más Económico</span>
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto px-4">
              Acceso directo a 5,000+ profesionales verificados. Gestiona proyectos, pagos y contratos en una sola plataforma.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-12 md:mt-16 px-4">
            <Card className="p-4 md:p-6 bg-primary/5 border-primary/20">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">5,000+</div>
              <div className="text-xs md:text-sm text-muted-foreground">Profesionales Verificados</div>
            </Card>
            <Card className="p-4 md:p-6 bg-primary/5 border-primary/20">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">-40%</div>
              <div className="text-xs md:text-sm text-muted-foreground">Reducción de Costos</div>
            </Card>
            <Card className="p-4 md:p-6 bg-primary/5 border-primary/20">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">48h</div>
              <div className="text-xs md:text-sm text-muted-foreground">Tiempo Contratación</div>
            </Card>
          </div>

          <div className="mt-12 md:mt-16 text-xs md:text-sm text-muted-foreground">
            Dossier Empresarial 2025 | Uruguay
          </div>
        </div>
      </div>

      {/* Page 2: Problem → Solution */}
      <div className="min-h-screen p-4 md:p-8 page-break flex items-center">
        <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 w-full">
          <div className="text-center space-y-3 md:space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">El Problema de Contratar Servicios</h2>
            <p className="text-base md:text-xl text-muted-foreground">Cada empresa gasta tiempo y dinero en estos desafíos</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <Card className="p-6 md:p-8 bg-destructive/5 border-destructive/20">
              <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-destructive">❌ Modelo Tradicional</h3>
              <ul className="space-y-4 md:space-y-5">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-sm md:text-base">Búsqueda Desorganizada</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Horas buscando en Google, redes sociales, preguntando conocidos. Sin garantía de calidad.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-sm md:text-base">Múltiples Intermediarios</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Contratistas que subcontratan, comisiones sobre comisiones, precios inflados hasta 60%.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-sm md:text-base">Sin Trazabilidad</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Cotizaciones por WhatsApp, pagos en efectivo, sin contratos formales. Riesgo legal alto.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-sm md:text-base">Gestión Manual</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Excel para seguimiento, llamadas para coordinar, emails para facturar. Tiempo = dinero perdido.</p>
                  </div>
                </li>
              </ul>
            </Card>

            <Card className="p-6 md:p-8 bg-primary/5 border-primary/20">
              <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-primary">✅ Ofiz Business</h3>
              <ul className="space-y-4 md:space-y-5">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm md:text-base">Marketplace Centralizado</p>
                    <p className="text-xs md:text-sm text-muted-foreground">5,000+ profesionales verificados con ratings reales. Buscar, comparar y contratar en minutos.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm md:text-base">Contacto Directo</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Sin intermediarios. Negociás precio directamente con el profesional. Ahorro promedio 40%.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm md:text-base">Todo Digital y Auditable</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Contratos digitales, pagos trazables, facturas automáticas. 100% compliance y respaldo legal.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm md:text-base">Plataforma Todo-en-Uno</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Gestión de proyectos, pagos escrow, chat, reportes. Todo en un solo dashboard.</p>
                  </div>
                </li>
              </ul>
            </Card>
          </div>

          <Card className="p-6 md:p-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl md:text-2xl font-bold mb-2">¿Listo para optimizar tus contrataciones?</h3>
                <p className="text-sm md:text-base text-muted-foreground">Agenda una demo personalizada y descubre el potencial de ahorro</p>
              </div>
              <Button size="lg" className="w-full md:w-auto" onClick={handleRegister}>
                Solicitar Demo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Page 3: Features Deep Dive */}
      <div className="min-h-screen p-4 md:p-8 page-break">
        <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">
          <div className="text-center space-y-3 md:space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Lo que puedes hacer con Ofiz</h2>
            <p className="text-base md:text-xl text-muted-foreground">Herramientas simples para ahorrar tiempo y dinero</p>
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
                  <h3 className="text-xl md:text-2xl font-bold mb-3">Sistema de Gestión de Proyectos</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-4">
                    Publica un proyecto y recibe múltiples propuestas de profesionales calificados. Compara precios, tiempos y experiencia antes de decidir.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        Descripción Detallada
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground pl-6">
                        Adjunta planos, fotos, especificaciones técnicas. Cuanto más claro, mejores propuestas recibes.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        Múltiples Presupuestos
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground pl-6">
                        Profesionales envían sus cotizaciones. Comparas en una tabla ordenada por precio, rating y tiempo.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        Seguimiento en Tiempo Real
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground pl-6">
                        Dashboard con status de cada proyecto: en cotización, en progreso, completado. Visibilidad total.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        Hitos y Pagos Parciales
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground pl-6">
                        Divide proyectos grandes en fases. Paga por hito completado. Controla mejor el flujo de caja.
                      </p>
                    </div>
                  </div>
                  <div className="bg-primary/5 p-3 md:p-4 rounded-lg border border-primary/20">
                    <p className="text-xs md:text-sm font-semibold text-primary mb-1">💡 Caso de Uso Real:</p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Una cadena de retail necesitaba mantenimiento en 8 locales. Publicó 1 proyecto, recibió 15 propuestas en 24hs. Eligió por precio y rating. Ahorró <strong>$180,000 vs cotización tradicional</strong>.
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
                  <h3 className="text-xl md:text-2xl font-bold mb-3">Base de Datos de Profesionales Verificados</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-4">
                    Acceso ilimitado a 5,000+ profesionales en todas las categorías: construcción, IT, mantenimiento, diseño, y más.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        Verificación Rigurosa
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground pl-6">
                        Validamos identidad, certificaciones, referencias. Solo profesionales con trayectoria comprobada.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        Portfolios Completos
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground pl-6">
                        Fotos de trabajos anteriores, certificaciones, especialidades. Ve la calidad antes de contratar.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        Ratings y Reviews
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground pl-6">
                        Sistema de reseñas verificadas. Solo clientes que realmente contrataron pueden opinar. Cero fake reviews.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        Filtros Avanzados
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground pl-6">
                        Busca por categoría, ubicación, rating mínimo, precio, disponibilidad. Encuentra el match perfecto.
                      </p>
                    </div>
                  </div>
                  <div className="bg-primary/5 p-3 md:p-4 rounded-lg border border-primary/20">
                    <p className="text-xs md:text-sm font-semibold text-primary mb-1">💡 Ventaja Competitiva:</p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      En lugar de llamar a 10 profesionales y esperar respuestas, buscas, comparas y contratas en <strong>menos de 30 minutos</strong>.
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
                    <Shield className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold mb-3">Sistema de Pagos Escrow Empresarial</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-4">
                    Protección total para tu empresa. Paga solo cuando el trabajo está completado y aprobado.
                  </p>
                  <div className="space-y-3 mb-4">
                    <div className="bg-background p-4 rounded-lg border">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">1</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm md:text-base mb-1">Apruebas el Presupuesto</h4>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            Seleccionas al profesional, confirmas precio y alcance. Se genera contrato digital automático con términos claros.
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
                          <h4 className="font-semibold text-sm md:text-base mb-1">Pagas a la Plataforma</h4>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            El monto queda en cuenta escrow (segura). El profesional ve que el pago está garantizado y empieza el trabajo.
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
                          <h4 className="font-semibold text-sm md:text-base mb-1">Seguimiento en Plataforma</h4>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            Chat directo, fotos de avance, notificaciones. Visibilidad total del progreso sin llamadas ni WhatsApp.
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
                          <h4 className="font-semibold text-sm md:text-base mb-1">Apruebas y Liberas Pago</h4>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            Validas que el trabajo cumple con lo acordado. Presionas "Aprobar" y el sistema libera el pago automáticamente.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                      <p className="text-xs md:text-sm font-semibold text-green-700 dark:text-green-400 mb-1">✅ Protección Legal</p>
                      <p className="text-xs text-muted-foreground">
                        Si hay disputas, sistema de mediación con pruebas documentadas. Contratos digitales válidos ante ley.
                      </p>
                    </div>
                    <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                      <p className="text-xs md:text-sm font-semibold text-blue-700 dark:text-blue-400 mb-1">💰 Facturación Automática</p>
                      <p className="text-xs text-muted-foreground">
                        Facturas con IVA generadas automáticamente. Integración con sistemas contables. Auditorías sin dolor.
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
                    <BarChart className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold mb-3">Analytics y Business Intelligence</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-4">
                    Dashboards ejecutivos con métricas de gasto, eficiencia y ROI de tus contrataciones.
                  </p>
                  <div className="grid md:grid-cols-3 gap-3 mb-4">
                    <div className="bg-background p-4 rounded-lg border text-center">
                      <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="text-xs font-semibold mb-1">Gastos por Categoría</p>
                      <p className="text-xs text-muted-foreground">Cuánto gastas en cada tipo de servicio</p>
                    </div>
                    <div className="bg-background p-4 rounded-lg border text-center">
                      <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="text-xs font-semibold mb-1">Proveedores Top</p>
                      <p className="text-xs text-muted-foreground">Quiénes te dan mejor calidad/precio</p>
                    </div>
                    <div className="bg-background p-4 rounded-lg border text-center">
                      <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="text-xs font-semibold mb-1">Tiempos Promedio</p>
                      <p className="text-xs text-muted-foreground">Desde solicitud hasta finalización</p>
                    </div>
                  </div>
                  <div className="bg-primary/5 p-3 md:p-4 rounded-lg border border-primary/20">
                    <p className="text-xs md:text-sm font-semibold text-primary mb-1">📊 Reportes Exportables:</p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Descarga Excel o PDF para finanzas, gerencia o auditorías. Filtros por fecha, categoría, proveedor, presupuesto vs real.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Feature 5 */}
            <Card className="p-6 md:p-8 hover:shadow-xl transition-all border-l-4 border-l-primary">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold mb-3">Contratos Digitales con Validez Legal</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-4">
                    Genera contratos profesionales en minutos con templates legales preaprobados.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        Templates Legales
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground pl-6">
                        Contratos revisados por abogados. Adaptados a ley uruguaya. Cláusulas de protección incluidas.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        Firma Electrónica
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground pl-6">
                        Ambas partes firman digitalmente. Válido legalmente. Sin imprimir, escanear ni papeles.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        Archivo Centralizado
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground pl-6">
                        Todos tus contratos en un solo lugar. Búsqueda rápida. Descarga cuando necesites.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        Versionado Automático
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground pl-6">
                        Cambios y adendas quedan registrados. Historial completo para auditorías o disputas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Feature 6 */}
            <Card className="p-6 md:p-8 hover:shadow-xl transition-all border-l-4 border-l-primary">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold mb-3">Soporte Dedicado y Account Manager</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-4">
                    Un gestor de cuenta exclusivo que te ayuda a sacar máximo provecho de la plataforma.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        Account Manager Personal
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground pl-6">
                        Una persona asignada que conoce tu empresa, ayuda con onboarding y optimización de procesos.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        WhatsApp Directo
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground pl-6">
                        Línea directa para resolver urgencias. Respuesta en minutos, no horas.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        Capacitación de Equipo
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground pl-6">
                        Sesiones para tu equipo de compras, finanzas u operaciones. Maximiza adopción.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        Consultoría Estratégica
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground pl-6">
                        Revisión trimestral de gastos. Identificamos áreas de optimización y ahorro.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Page 4: Plans & ROI */}
      <div className="min-h-screen p-4 md:p-8 page-break flex items-center">
        <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 w-full">
          <div className="text-center space-y-3 md:space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Planes Empresariales con ROI Claro</h2>
            <p className="text-base md:text-xl text-muted-foreground">Inversión que se paga sola con el primer proyecto</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Basic Plan */}
            <Card className="p-6 md:p-8 relative hover:shadow-xl transition-all">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2">Basic</h3>
                  <div className="text-3xl md:text-4xl font-bold mb-2">
                    $4,500<span className="text-base md:text-lg text-muted-foreground">/mes</span>
                  </div>
                  <p className="text-xs md:text-sm text-primary font-semibold">Para pequeñas empresas</p>
                </div>
                
                <ul className="space-y-3 pt-4">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm md:text-base font-medium">50 contactos/mes</span>
                      <p className="text-xs text-muted-foreground">Búsquedas y cotizaciones ilimitadas</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">5 anuncios de proyectos activos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">10K impresiones mensuales</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Gestión de contratos digitales</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Pagos escrow incluidos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Soporte email</span>
                  </li>
                </ul>

                <div className="pt-4 border-t">
                  <p className="text-xs font-semibold mb-2">💰 ROI Estimado:</p>
                  <p className="text-xs text-muted-foreground">Ahorro promedio de $15K en primer proyecto. Recuperas inversión en menos de 1 mes.</p>
                </div>

                <Button variant="outline" className="w-full mt-4" onClick={handleRegister}>
                  Solicitar Demo
                </Button>
              </div>
            </Card>

            {/* Professional Plan */}
            <Card className="p-6 md:p-8 relative border-2 border-primary shadow-xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs md:text-sm font-semibold shadow-lg">
                  ⚡ Más Popular
                </span>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2">Professional</h3>
                  <div className="text-3xl md:text-4xl font-bold mb-2">
                    $8,500<span className="text-base md:text-lg text-muted-foreground">/mes</span>
                  </div>
                  <p className="text-xs md:text-sm text-primary font-semibold">Para empresas en crecimiento</p>
                </div>
                
                <ul className="space-y-3 pt-4">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm md:text-base font-semibold">150 contactos/mes</span>
                      <p className="text-xs text-muted-foreground">3x más alcance</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">15 anuncios activos simultáneos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">50K impresiones</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Contratos avanzados con hitos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Facturación automatizada</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Analytics avanzado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">API para integraciones</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Soporte prioritario</span>
                  </li>
                </ul>

                <div className="pt-4 border-t">
                  <p className="text-xs font-semibold mb-2">💰 ROI Estimado:</p>
                  <p className="text-xs text-muted-foreground">Ahorro promedio de $35-50K mensuales. ROI de 400-600% en primer trimestre.</p>
                </div>

                <Button className="w-full mt-4" onClick={handleRegister}>
                  Solicitar Demo
                </Button>
              </div>
            </Card>

            {/* Enterprise Plan */}
            <Card className="p-6 md:p-8 relative bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-xl transition-all">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2 flex items-center gap-2">
                    Enterprise <Star className="w-5 h-5 md:w-6 md:h-6 text-primary fill-primary" />
                  </h3>
                  <div className="text-3xl md:text-4xl font-bold mb-2">
                    Custom<span className="text-base md:text-lg text-muted-foreground"></span>
                  </div>
                  <p className="text-xs md:text-sm text-primary font-semibold">Para grandes corporaciones</p>
                </div>
                
                <ul className="space-y-3 pt-4">
                  <li className="flex items-start gap-2">
                    <Star className="w-5 h-5 text-primary fill-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm md:text-base font-semibold">Contactos ilimitados</span>
                      <p className="text-xs text-muted-foreground">Sin límites en tu operación</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Anuncios ilimitados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Impresiones ilimitadas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Account Manager dedicado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">WhatsApp directo prioritario</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Integración con ERP/CRM</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">SLA garantizado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Capacitación de equipos</span>
                  </li>
                </ul>

                <div className="pt-4 border-t">
                  <p className="text-xs font-semibold mb-2">💰 ROI Estimado:</p>
                  <p className="text-xs text-muted-foreground">Ahorro de $100K+ mensuales. Optimización de 30-40% en costos operativos.</p>
                </div>

                <Button variant="default" className="w-full mt-4" onClick={handleRegister}>
                  Contactar Ventas
                </Button>
              </div>
            </Card>
          </div>

          <Card className="p-6 md:p-8 bg-gradient-to-r from-green-500/10 to-green-500/5 border-green-500/20">
            <div className="text-center space-y-3">
              <h3 className="text-xl md:text-2xl font-bold">🎉 Oferta de Lanzamiento Empresarial</h3>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                Primeras <strong>50 empresas</strong> obtienen <strong>20% de descuento por 12 meses</strong> + onboarding gratuito ($1,500 de valor)
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-semibold">Sin permanencia mínima</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-semibold">Facturación mensual</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-semibold">Garantía 30 días</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Page 5: Use Cases & Success Stories */}
      <div className="min-h-screen p-4 md:p-8 page-break flex items-center">
        <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 w-full">
          <div className="text-center space-y-3 md:space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Casos de Éxito Empresariales</h2>
            <p className="text-base md:text-xl text-muted-foreground">Empresas reales ahorrando miles cada mes</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <Card className="p-6 md:p-8 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-base md:text-lg">Cadena de Retail</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">12 locales en Montevideo</p>
                </div>
              </div>
              <p className="text-sm md:text-base text-muted-foreground mb-4 italic">
                "Antes gastábamos $250K mensuales en mantenimiento con proveedores fijos. Con Ofiz, comparamos precios y negociamos directo. Ahora gastamos $140K y la calidad es mejor. Son $110K de ahorro mensual."
              </p>
              <div className="grid grid-cols-2 gap-3 bg-primary/5 p-3 md:p-4 rounded-lg">
                <div>
                  <p className="text-xl md:text-2xl font-bold text-primary">$1.3M</p>
                  <p className="text-xs text-muted-foreground">Ahorro anual</p>
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-bold text-primary">-44%</p>
                  <p className="text-xs text-muted-foreground">Reducción costos</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-base md:text-lg">Hotel Boutique</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">Punta del Este</p>
                </div>
              </div>
              <p className="text-sm md:text-base text-muted-foreground mb-4 italic">
                "Necesitábamos renovar 15 habitaciones en temporada baja. Publicamos el proyecto, recibimos 8 propuestas. Elegimos por portfolio y precio. Ahorramos $85K vs la cotización original y terminaron antes."
              </p>
              <div className="grid grid-cols-2 gap-3 bg-primary/5 p-3 md:p-4 rounded-lg">
                <div>
                  <p className="text-xl md:text-2xl font-bold text-primary">$85K</p>
                  <p className="text-xs text-muted-foreground">Ahorro en proyecto</p>
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-bold text-primary">-32%</p>
                  <p className="text-xs text-muted-foreground">vs cotización inicial</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-base md:text-lg">Startup Fintech</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">50 empleados</p>
                </div>
              </div>
              <p className="text-sm md:text-base text-muted-foreground mb-4 italic">
                "Oficina nueva, necesitábamos: electricista, pintor, instalador redes, limpieza. En lugar de coordinar 4 proveedores, lo publicamos en Ofiz. Armamos todo en 2 semanas. El sistema escrow nos protegió en cada pago."
              </p>
              <div className="grid grid-cols-2 gap-3 bg-primary/5 p-3 md:p-4 rounded-lg">
                <div>
                  <p className="text-xl md:text-2xl font-bold text-primary">2 sem</p>
                  <p className="text-xs text-muted-foreground">vs 6 semanas tradicional</p>
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-bold text-primary">100%</p>
                  <p className="text-xs text-muted-foreground">Pagos protegidos</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-base md:text-lg">Inmobiliaria</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">Portfolio 200+ propiedades</p>
                </div>
              </div>
              <p className="text-sm md:text-base text-muted-foreground mb-4 italic">
                "Mantenemos decenas de propiedades simultáneamente. Antes era caos coordinar. Ahora tenemos todo en Ofiz: qué profesional va a qué propiedad, cuándo, el pago ya está procesado. Los dashboards me ahorran 15hs/semana."
              </p>
              <div className="grid grid-cols-2 gap-3 bg-primary/5 p-3 md:p-4 rounded-lg">
                <div>
                  <p className="text-xl md:text-2xl font-bold text-primary">15h/sem</p>
                  <p className="text-xs text-muted-foreground">Ahorro tiempo gestión</p>
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-bold text-primary">$60K</p>
                  <p className="text-xs text-muted-foreground">Ahorro mensual</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6 md:p-8 bg-primary/10 border-primary/30">
            <div className="text-center space-y-4">
              <h3 className="text-2xl md:text-3xl font-bold">Tu empresa puede ser la próxima</h3>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                Agenda una demo personalizada y descubre cuánto puedes ahorrar con Ofiz
              </p>
              <Button size="lg" onClick={handleRegister} className="gap-2">
                Agendar Demo Gratuita <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Page 6: FAQ & Final CTA */}
      <div className="min-h-screen p-4 md:p-8 page-break flex items-center">
        <div className="max-w-4xl mx-auto space-y-8 md:space-y-12 w-full">
          <div className="text-center space-y-3 md:space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Preguntas Frecuentes</h2>
            <p className="text-base md:text-xl text-muted-foreground">Resolvemos tus dudas antes de empezar</p>
          </div>

          <div className="space-y-4">
            <Card className="p-6 hover:shadow-lg transition-all">
              <h3 className="font-bold text-base md:text-lg mb-2">¿Cómo garantizan la calidad de los profesionales?</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Verificamos identidad, certificaciones y referencias. Solo aceptamos profesionales con trayectoria comprobada. Además, el sistema de reviews es verificado: solo clientes reales pueden opinar. Ratings falsos = expulsión.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all">
              <h3 className="font-bold text-base md:text-lg mb-2">¿Qué pasa si el trabajo no queda bien?</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Sistema de mediación con pruebas (fotos, chat, contrato). Si el profesional falló, no liberamos el pago o hacemos devolución parcial. Si es un desacuerdo menor, negociamos un acuerdo justo. Siempre hay solución documentada y legal.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all">
              <h3 className="font-bold text-base md:text-lg mb-2">¿Cuánto tiempo toma implementar Ofiz en nuestra empresa?</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Onboarding de 1-2 semanas. Account manager te guía: configuración inicial, capacitación de equipo, integración con tus sistemas (si aplica). Puedes empezar a publicar proyectos desde día 1.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all">
              <h3 className="font-bold text-base md:text-lg mb-2">¿Ofiz reemplaza a nuestros proveedores actuales?</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                No necesariamente. Muchas empresas usan Ofiz para proyectos específicos o como respaldo cuando su proveedor habitual no está disponible. Otros migran completamente porque ven el ahorro. Tú decides cómo usarlo.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all">
              <h3 className="font-bold text-base md:text-lg mb-2">¿Hay algún costo oculto o comisión extra?</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Cero costos ocultos. Pagas tu plan mensual + una pequeña comisión de transacción (2-3%) en pagos procesados. Todo transparente desde el inicio. Sin sorpresas en la factura.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all">
              <h3 className="font-bold text-base md:text-lg mb-2">¿Puedo cancelar el plan cuando quiera?</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Sí, sin permanencia mínima. Cancelas cuando quieras y solo pagas hasta ese mes. No hay penalidades ni letra chica. Queremos que te quedes por los resultados, no por un contrato.
              </p>
            </Card>
          </div>

          <div className="space-y-6 md:space-y-8 pt-8 md:pt-12">
            <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/20 via-primary/10 to-background border-primary/30 text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
                Reduce Costos. Ya.
              </h2>
              <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
                Agenda una demo personalizada y descubre cuánto puede ahorrar tu empresa con Ofiz
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button size="lg" className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6" onClick={handleRegister}>
                  🏢 Agendar Demo Gratuita
                </Button>
                <Button size="lg" variant="outline" className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6" onClick={handlePrint}>
                  📄 Descargar PDF
                </Button>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  <span>Demo 30 minutos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  <span>Sin compromiso</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  <span>Análisis de ahorro incluido</span>
                </div>
              </div>
            </Card>

            <div className="text-center space-y-3 text-sm text-muted-foreground">
              <p>¿Preguntas comerciales? Contactanos:</p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
                <span>📧 empresas@ofiz.uy</span>
                <span className="hidden md:inline">|</span>
                <span>📱 WhatsApp: +598 99 654 321</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
