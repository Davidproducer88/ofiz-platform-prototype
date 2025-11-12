import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Star, TrendingUp, Shield, Users, DollarSign, Award, Zap, Target, BarChart, Clock, Building } from "lucide-react";
import logoOfiz from "@/assets/logo-ofiz-new.png";

export const DossierEmpresas = () => {
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
                alt="Ofiz Business" 
                className="h-24 md:h-32"
              />
            </div>
            <p className="text-3xl font-semibold text-muted-foreground">
              Solución Empresarial
            </p>
          </div>
          
          <div className="space-y-6 mt-12">
            <h2 className="text-5xl font-bold">
              Conecta con Profesionales Verificados
            </h2>
            <p className="text-2xl text-muted-foreground max-w-2xl mx-auto">
              Gestiona servicios, reduce costos operativos y optimiza la contratación de profesionales
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-16">
            <Card className="p-6 bg-primary/5">
              <div className="text-4xl font-bold text-primary mb-2">5,000+</div>
              <div className="text-sm text-muted-foreground">Profesionales Verificados</div>
            </Card>
            <Card className="p-6 bg-primary/5">
              <div className="text-4xl font-bold text-primary mb-2">-40%</div>
              <div className="text-sm text-muted-foreground">Reducción Costos</div>
            </Card>
            <Card className="p-6 bg-primary/5">
              <div className="text-4xl font-bold text-primary mb-2">72h</div>
              <div className="text-sm text-muted-foreground">Tiempo Respuesta</div>
            </Card>
          </div>

          <div className="mt-16 text-sm text-muted-foreground">
            Dossier Empresarial 2025 | Uruguay
          </div>
        </div>
      </div>

      {/* Page 2: Problem & Solution */}
      <div className="min-h-screen p-8 page-break">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-bold">Desafíos Empresariales</h2>
            <p className="text-xl text-muted-foreground">Resolvemos problemas reales de contratación</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 bg-destructive/5 border-destructive/20">
              <h3 className="text-2xl font-bold mb-6 text-destructive">❌ Problemas Comunes</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold">Búsqueda Ineficiente</p>
                    <p className="text-sm text-muted-foreground">Horas perdidas buscando profesionales confiables para cada proyecto</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold">Sin Garantías</p>
                    <p className="text-sm text-muted-foreground">Riesgo de mala calidad, incumplimientos o trabajos sin terminar</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold">Gestión Manual</p>
                    <p className="text-sm text-muted-foreground">Múltiples contactos, cotizaciones dispersas, sin trazabilidad</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold">Costos Elevados</p>
                    <p className="text-sm text-muted-foreground">Intermediarios caros, contratos rígidos, falta de competencia</p>
                  </div>
                </li>
              </ul>
            </Card>

            <Card className="p-8 bg-primary/5 border-primary/20">
              <h3 className="text-2xl font-bold mb-6 text-primary">✅ Solución Ofiz Business</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Marketplace Centralizado</p>
                    <p className="text-sm text-muted-foreground">5,000+ profesionales verificados en todas las especialidades</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Sistema de Garantías</p>
                    <p className="text-sm text-muted-foreground">Seguros, ratings verificados, pagos escrow con protección total</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Plataforma Integral</p>
                    <p className="text-sm text-muted-foreground">Gestiona proyectos, pagos, contratos y comunicación en un solo lugar</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Precios Competitivos</p>
                    <p className="text-sm text-muted-foreground">Múltiples propuestas por proyecto, ahorro promedio del 40%</p>
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
            <h2 className="text-5xl font-bold">Funcionalidades Enterprise</h2>
            <p className="text-xl text-muted-foreground">Herramientas diseñadas para empresas</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Target className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Gestión de Proyectos</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Publica proyectos y recibe múltiples propuestas de profesionales calificados
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Descripciones detalladas
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Presupuestos múltiples
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Seguimiento en tiempo real
                </li>
              </ul>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Users className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Base de Profesionales</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Acceso a miles de profesionales verificados con ratings reales
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Perfiles verificados
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Portfolios completos
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Historial de trabajos
                </li>
              </ul>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Shield className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Pagos Seguros</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Sistema escrow: paga solo cuando el trabajo esté completado
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Protección total
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Múltiples métodos
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Facturación automática
                </li>
              </ul>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <BarChart className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Analytics & Reportes</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Dashboards con métricas de gastos, proveedores y proyectos
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Costos por categoría
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  ROI por proveedor
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Exportación Excel/PDF
                </li>
              </ul>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Building className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Contratos Digitales</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Genera contratos automáticos con validez legal
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Templates legales
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Firma electrónica
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Archivo digital
                </li>
              </ul>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Clock className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Soporte Dedicado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Gestor de cuenta y soporte prioritario 24/7
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Account manager
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  WhatsApp directo
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Resolución urgente
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
            <h2 className="text-5xl font-bold">Planes Empresariales</h2>
            <p className="text-xl text-muted-foreground">Escalables según el tamaño de tu operación</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 relative">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Basic</h3>
                <div className="text-4xl font-bold">$4,500<span className="text-lg text-muted-foreground">/mes</span></div>
                <p className="text-sm text-muted-foreground">Para pequeñas empresas</p>
                
                <ul className="space-y-3 pt-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>50 contactos/mes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>5 anuncios activos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>10K impresiones</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Gestión de contratos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Soporte por email</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Analíticas básicas</span>
                  </li>
                </ul>
              </div>
            </Card>

            <Card className="p-8 relative border-2 border-primary">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  Más Popular
                </span>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Professional</h3>
                <div className="text-4xl font-bold">$8,500<span className="text-lg text-muted-foreground">/mes</span></div>
                <p className="text-sm text-muted-foreground">Para empresas en crecimiento</p>
                
                <ul className="space-y-3 pt-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="font-semibold">150 contactos/mes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>15 anuncios activos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>50K impresiones</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Contratos avanzados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Facturación automatizada</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Soporte prioritario</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>API para integraciones</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Analíticas avanzadas</span>
                  </li>
                </ul>
              </div>
            </Card>

            <Card className="p-8 relative bg-primary/5">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  Enterprise <Star className="w-6 h-6 text-primary" />
                </h3>
                <div className="text-4xl font-bold">$15,000<span className="text-lg text-muted-foreground">/mes</span></div>
                <p className="text-sm text-muted-foreground">Para grandes corporaciones</p>
                
                <ul className="space-y-3 pt-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Contactos ilimitados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Anuncios ilimitados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Impresiones ilimitadas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Gestor dedicado</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Facturación centralizada</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Soporte 24/7</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>API completa + webhooks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Analytics empresariales</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>Personalización de marca</span>
                  </li>
                </ul>
              </div>
            </Card>
          </div>

          <Card className="p-8 bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">ROI Comprobado</h3>
                <p className="text-muted-foreground">Empresas ahorran en promedio 40% en costos operativos</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-primary">-40%</div>
                <div className="text-sm text-muted-foreground">Reducción de costos</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Page 5: Use Cases */}
      <div className="min-h-screen p-8 page-break">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-bold">Casos de Uso</h2>
            <p className="text-xl text-muted-foreground">Empresas que ya confían en Ofiz</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
                  🏢
                </div>
                <div>
                  <h3 className="font-bold text-xl">Inmobiliaria Urbana</h3>
                  <p className="text-sm text-muted-foreground">50 propiedades en gestión</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                "Antes gastábamos $150,000/mes en mantenimiento coordinando con 20 proveedores diferentes. 
                Ahora centralizamos todo en Ofiz y gastamos $90,000 con mejor calidad."
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
                <div>
                  <div className="text-2xl font-bold text-primary">-40%</div>
                  <div className="text-sm text-muted-foreground">Ahorro mensual</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">72h</div>
                  <div className="text-sm text-muted-foreground">Tiempo respuesta</div>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
                  🏨
                </div>
                <div>
                  <h3 className="font-bold text-xl">Hotel Boutique</h3>
                  <p className="text-sm text-muted-foreground">Apart Hotel 30 habitaciones</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                "La gestión de mantenimiento era un caos. Con Ofiz programamos servicios recurrentes 
                y tenemos 5 profesionales de confianza para emergencias. Operación impecable."
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
                <div>
                  <div className="text-2xl font-bold text-primary">-50%</div>
                  <div className="text-sm text-muted-foreground">Tiempo gestión</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">5★</div>
                  <div className="text-sm text-muted-foreground">Satisfacción</div>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
                  🏪
                </div>
                <div>
                  <h3 className="font-bold text-xl">Cadena de Retail</h3>
                  <p className="text-sm text-muted-foreground">8 sucursales en Uruguay</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                "Necesitábamos mantenimiento eléctrico, limpieza y reparaciones en múltiples locales. 
                Ofiz nos dio trazabilidad total y facturas centralizadas. Game changer."
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
                <div>
                  <div className="text-2xl font-bold text-primary">-35%</div>
                  <div className="text-sm text-muted-foreground">Costos operativos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">100%</div>
                  <div className="text-sm text-muted-foreground">Trazabilidad</div>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
                  🏗️
                </div>
                <div>
                  <h3 className="font-bold text-xl">Constructora Moderna</h3>
                  <p className="text-sm text-muted-foreground">Proyectos residenciales</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                "Para acabados finales contratábamos servicios puntuales de pintura, electricidad y carpintería. 
                Ofiz nos da profesionales verificados con portfolios reales. Confianza total."
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
                <div>
                  <div className="text-2xl font-bold text-primary">-30%</div>
                  <div className="text-sm text-muted-foreground">Tiempo búsqueda</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">4.8★</div>
                  <div className="text-sm text-muted-foreground">Rating promedio</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Page 6: Benefits Summary */}
      <div className="min-h-screen p-8 page-break">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-bold">Beneficios Clave</h2>
            <p className="text-xl text-muted-foreground">Por qué las empresas eligen Ofiz</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10">
              <TrendingUp className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-4">Reducción de Costos</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-1" />
                  <span>Ahorro promedio de 40% en gastos operativos</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-1" />
                  <span>Sin intermediarios costosos ni sobrecostos</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-1" />
                  <span>Competencia de precios entre proveedores</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-1" />
                  <span>Facturación centralizada y automatizada</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10">
              <Clock className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-4">Ahorro de Tiempo</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-1" />
                  <span>Reducción del 60% en tiempo de búsqueda</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-1" />
                  <span>Respuesta promedio en menos de 72 horas</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-1" />
                  <span>Gestión automática de contratos y pagos</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-1" />
                  <span>Comunicación centralizada en un solo lugar</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10">
              <Shield className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-4">Seguridad y Garantías</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-1" />
                  <span>Profesionales verificados con identidad confirmada</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-1" />
                  <span>Sistema de pagos escrow con protección</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-1" />
                  <span>Seguros incluidos hasta $10,000 por trabajo</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-1" />
                  <span>Contratos digitales con validez legal</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10">
              <BarChart className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-4">Control y Visibilidad</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-1" />
                  <span>Dashboard con métricas en tiempo real</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-1" />
                  <span>Trazabilidad completa de todos los servicios</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-1" />
                  <span>Reportes exportables para contabilidad</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-1" />
                  <span>Analíticas de ROI por proveedor</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>

      {/* Page 7: Call to Action */}
      <div className="min-h-screen flex flex-col items-center justify-center p-8 page-break">
        <div className="max-w-4xl w-full text-center space-y-12">
          <div className="space-y-6">
            <h2 className="text-6xl font-bold">
              ¿Listo para Optimizar tu Operación?
            </h2>
            <p className="text-2xl text-muted-foreground">
              Únete a las empresas líderes que ya están reduciendo costos con Ofiz
            </p>
          </div>

          <Card className="p-12 bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="space-y-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">30 días</div>
                  <div className="text-muted-foreground">Prueba sin costo</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">5,000+</div>
                  <div className="text-muted-foreground">Profesionales disponibles</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                  <div className="text-muted-foreground">Soporte empresarial</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Agenda una Demo</h3>
                <p className="text-muted-foreground">
                  Nuestro equipo te mostrará la plataforma y diseñará una solución a medida
                </p>
                <div className="flex justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    Demo personalizada 30 min
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    Sin compromiso
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="pt-12 space-y-4">
            <h3 className="text-xl font-semibold">Contacto Empresas</h3>
            <div className="flex flex-col gap-2 text-muted-foreground">
              <p>📧 empresas@ofiz.com.uy</p>
              <p>📱 WhatsApp Business: +598 99 987 654</p>
              <p>🌐 www.ofiz.com.uy/empresas</p>
              <p>📍 World Trade Center, Montevideo</p>
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
