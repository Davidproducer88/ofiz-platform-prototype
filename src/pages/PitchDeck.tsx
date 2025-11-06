import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Globe,
  Shield,
  Zap,
  Award,
  BarChart3,
  Rocket,
  Building2,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  icon: any;
  color: string;
}

const slides: Slide[] = [
  { id: 1, title: "Portada", subtitle: "La Revolución Digital", icon: Rocket, color: "primary" },
  { id: 2, title: "El Problema", subtitle: "Dolor del Mercado", icon: Target, color: "destructive" },
  { id: 3, title: "La Solución", subtitle: "Plataforma Todo-en-Uno", icon: Zap, color: "success" },
  { id: 4, title: "Modelo de Negocio", subtitle: "Múltiples Fuentes", icon: DollarSign, color: "primary" },
  { id: 5, title: "Tamaño del Mercado", subtitle: "TAM/SAM/SOM", icon: Globe, color: "accent" },
  { id: 6, title: "Ventaja Competitiva", subtitle: "Diferenciadores", icon: Award, color: "success" },
  { id: 7, title: "Tracción", subtitle: "Métricas y Crecimiento", icon: TrendingUp, color: "primary" },
  { id: 8, title: "Equipo", subtitle: "Founders & Advisors", icon: Users, color: "accent" },
  { id: 9, title: "Financials", subtitle: "P&L Proyectado", icon: BarChart3, color: "primary" },
  { id: 10, title: "Uso de Fondos", subtitle: "Serie A $1.5M", icon: DollarSign, color: "success" },
  { id: 11, title: "Go-to-Market", subtitle: "Estrategia GTM", icon: MapPin, color: "accent" },
  { id: 12, title: "Roadmap", subtitle: "Hitos 18 Meses", icon: Rocket, color: "primary" },
  { id: 13, title: "Riesgos", subtitle: "Mitigación", icon: Shield, color: "warning" },
  { id: 14, title: "Inversión", subtitle: "Estructura Serie A", icon: Building2, color: "primary" },
  { id: 15, title: "Call to Action", subtitle: "¡Únete a la Revolución!", icon: Zap, color: "success" },
];

export default function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [view, setView] = useState<"slides" | "executive">("slides");

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleDownload = async (format: "pdf" | "docx" | "md") => {
    try {
      const response = await fetch("/PITCH_DECK_INVERSORES.md");
      const content = await response.text();

      if (format === "md") {
        const blob = new Blob([content], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Pitch_Deck_Inversores.md";
        a.click();
        URL.revokeObjectURL(url);
      }

      toast.success(`Descargando Pitch Deck en formato ${format.toUpperCase()}...`);
    } catch (error) {
      toast.error("Error al descargar el documento");
    }
  };

  const currentSlideData = slides[currentSlide];
  const Icon = currentSlideData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Rocket className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Pitch Deck Inversores</h1>
                <p className="text-sm text-muted-foreground">Serie A - $1.5M USD</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tabs value={view} onValueChange={(v: any) => setView(v)} className="w-auto">
                <TabsList>
                  <TabsTrigger value="slides">Presentación</TabsTrigger>
                  <TabsTrigger value="executive">Resumen Ejecutivo</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload("md")}
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {view === "slides" ? (
        <div className="container mx-auto px-4 py-8">
          {/* Slide Navigation */}
          <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto pb-4">
            {slides.map((slide, index) => (
              <Button
                key={slide.id}
                variant={currentSlide === index ? "default" : "ghost"}
                size="sm"
                className="flex-shrink-0"
                onClick={() => setCurrentSlide(index)}
              >
                {slide.id}
              </Button>
            ))}
          </div>

          {/* Main Slide */}
          <Card className="max-w-6xl mx-auto">
            <CardContent className="p-12">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                  <Icon className="h-10 w-10 text-primary" />
                </div>
                <Badge variant="outline" className="mb-4">
                  Slide {currentSlideData.id} de {slides.length}
                </Badge>
                <h2 className="text-4xl font-bold mb-2">{currentSlideData.title}</h2>
                {currentSlideData.subtitle && (
                  <p className="text-xl text-muted-foreground">{currentSlideData.subtitle}</p>
                )}
              </div>

              {/* Slide Content */}
              <div className="prose prose-lg max-w-none">
                {currentSlideData.id === 1 && (
                  <div className="text-center space-y-6">
                    <h3 className="text-3xl font-bold">Plataforma de Servicios Profesionales</h3>
                    <p className="text-xl">Conectando clientes con maestros verificados en Uruguay</p>
                    <div className="flex justify-center gap-4 flex-wrap">
                      <Badge variant="secondary" className="text-lg px-6 py-2">
                        💡 Pagos Seguros
                      </Badge>
                      <Badge variant="secondary" className="text-lg px-6 py-2">
                        🔒 Escrow Integrado
                      </Badge>
                      <Badge variant="secondary" className="text-lg px-6 py-2">
                        📈 Marketplace
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-8">Q1 2026</p>
                  </div>
                )}

                {currentSlideData.id === 2 && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="p-6 border-destructive/50">
                        <h4 className="font-bold text-lg mb-4 text-destructive">PARA CLIENTES</h4>
                        <ul className="space-y-2">
                          <li>❌ 47% no encuentra profesionales confiables</li>
                          <li>❌ 62% ha sufrido fraudes</li>
                          <li>❌ Sin garantías ni protección</li>
                          <li>❌ Búsqueda toma 3-7 días</li>
                          <li>❌ Sin transparencia de precios</li>
                        </ul>
                      </Card>
                      <Card className="p-6 border-destructive/50">
                        <h4 className="font-bold text-lg mb-4 text-destructive">PARA PROFESIONALES</h4>
                        <ul className="space-y-2">
                          <li>❌ 73% depende solo de boca a boca</li>
                          <li>❌ Difícil conseguir clientes nuevos</li>
                          <li>❌ Cobros impagos (35%)</li>
                          <li>❌ Sin herramientas digitales</li>
                          <li>❌ Competencia informal</li>
                        </ul>
                      </Card>
                    </div>
                    <Card className="p-6 bg-primary/5">
                      <h4 className="font-bold text-lg mb-4">TAMAÑO DEL PROBLEMA</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-3xl font-bold text-primary">3.5M</p>
                          <p className="text-sm text-muted-foreground">Habitantes</p>
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-primary">150K</p>
                          <p className="text-sm text-muted-foreground">Profesionales</p>
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-primary">$45B</p>
                          <p className="text-sm text-muted-foreground">Mercado Anual</p>
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-primary">68%</p>
                          <p className="text-sm text-muted-foreground">Digitalización</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {currentSlideData.id === 4 && (
                  <div className="space-y-6">
                    <h4 className="font-bold text-xl mb-4">💰 Múltiples Fuentes de Ingreso</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="p-6">
                        <h5 className="font-bold mb-3">1️⃣ Comisión Transacciones</h5>
                        <p className="text-2xl font-bold text-primary mb-2">12%</p>
                        <p className="text-sm text-muted-foreground">
                          Sobre valor del servicio. Ejemplo: Servicio $3,000 → Cliente paga $3,360
                        </p>
                      </Card>
                      <Card className="p-6">
                        <h5 className="font-bold mb-3">2️⃣ Suscripciones Maestros</h5>
                        <p className="text-2xl font-bold text-primary mb-2">$0 - $999</p>
                        <p className="text-sm text-muted-foreground">
                          3 planes: Gratis, Profesional ($599/mes), Elite ($999/mes)
                        </p>
                      </Card>
                      <Card className="p-6">
                        <h5 className="font-bold mb-3">3️⃣ Suscripciones Empresas</h5>
                        <p className="text-2xl font-bold text-primary mb-2">$4.5K - $15K</p>
                        <p className="text-sm text-muted-foreground">
                          Gestión de equipos, facturación masiva, analytics
                        </p>
                      </Card>
                      <Card className="p-6">
                        <h5 className="font-bold mb-3">4️⃣ Marketplace</h5>
                        <p className="text-2xl font-bold text-primary mb-2">7%</p>
                        <p className="text-sm text-muted-foreground">
                          Comisión sobre ventas de herramientas y materiales
                        </p>
                      </Card>
                    </div>
                    <Card className="p-6 bg-success/5 border-success/50">
                      <h5 className="font-bold mb-3">💵 Proyección Ingresos Año 1</h5>
                      <p className="text-4xl font-bold text-success">$U 4,860,000</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        EBITDA: $U 330,000 (7%) | Break-even: Mes 6-8
                      </p>
                    </Card>
                  </div>
                )}

                {currentSlideData.id === 10 && (
                  <div className="space-y-6">
                    <h4 className="font-bold text-xl mb-4">💰 Serie A: $USD 1,500,000</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="p-6 border-primary">
                        <h5 className="font-bold mb-3">40% Marketing & Adquisición</h5>
                        <p className="text-2xl font-bold text-primary mb-2">$600,000</p>
                        <ul className="text-sm space-y-1">
                          <li>• Campañas digitales (Google, Meta)</li>
                          <li>• Influencers y contenido</li>
                          <li>• Eventos y activaciones</li>
                          <li>• Programa de referidos</li>
                        </ul>
                      </Card>
                      <Card className="p-6 border-primary">
                        <h5 className="font-bold mb-3">30% Equipo & Talento</h5>
                        <p className="text-2xl font-bold text-primary mb-2">$450,000</p>
                        <ul className="text-sm space-y-1">
                          <li>• 8 developers adicionales</li>
                          <li>• 4 marketing & growth</li>
                          <li>• 3 customer success</li>
                          <li>• 2 operaciones</li>
                        </ul>
                      </Card>
                      <Card className="p-6 border-primary">
                        <h5 className="font-bold mb-3">20% Tecnología & Producto</h5>
                        <p className="text-2xl font-bold text-primary mb-2">$300,000</p>
                        <ul className="text-sm space-y-1">
                          <li>• App móvil nativa (iOS + Android)</li>
                          <li>• ML para matching avanzado</li>
                          <li>• Sistema seguros automatizado</li>
                          <li>• Infraestructura cloud escalable</li>
                        </ul>
                      </Card>
                      <Card className="p-6 border-primary">
                        <h5 className="font-bold mb-3">10% Operaciones & Legal</h5>
                        <p className="text-2xl font-bold text-primary mb-2">$150,000</p>
                        <ul className="text-sm space-y-1">
                          <li>• Acuerdos con aseguradoras</li>
                          <li>• Compliance regulatorio</li>
                          <li>• Oficina y equipamiento</li>
                          <li>• Buffer operativo</li>
                        </ul>
                      </Card>
                    </div>
                    <Card className="p-6 bg-primary/5">
                      <p className="text-center">
                        <span className="text-lg font-bold">Runway: </span>
                        <span className="text-2xl font-bold text-primary">24 meses</span>
                        <span className="text-muted-foreground"> | Break-even esperado: Mes 18</span>
                      </p>
                    </Card>
                  </div>
                )}

                {currentSlideData.id === 15 && (
                  <div className="text-center space-y-8">
                    <h3 className="text-3xl font-bold">¿Por qué AHORA?</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="p-6">
                        <h5 className="font-bold mb-3">✅ Post-Pandemia Digital Shift</h5>
                        <p className="text-sm">68% digitalización permanente</p>
                      </Card>
                      <Card className="p-6">
                        <h5 className="font-bold mb-3">✅ Mercado Fragmentado</h5>
                        <p className="text-sm">Sin líder claro en Uruguay</p>
                      </Card>
                      <Card className="p-6">
                        <h5 className="font-bold mb-3">✅ Tecnología Madura</h5>
                        <p className="text-sm">Pagos digitales normalizados</p>
                      </Card>
                      <Card className="p-6">
                        <h5 className="font-bold mb-3">✅ Regulación Favorable</h5>
                        <p className="text-sm">Fintech-friendly</p>
                      </Card>
                    </div>
                    <Card className="p-8 bg-gradient-to-r from-primary/10 to-success/10 border-primary">
                      <h3 className="text-2xl font-bold mb-4">LA OPORTUNIDAD</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div>
                          <p className="text-3xl font-bold text-primary">$45B</p>
                          <p className="text-sm">Mercado UY</p>
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-primary">15%</p>
                          <p className="text-sm">Crecimiento</p>
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-primary">0.2%</p>
                          <p className="text-sm">Penetración</p>
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-primary">🏆</p>
                          <p className="text-sm">Winner-Takes-Most</p>
                        </div>
                      </div>
                      <p className="text-lg font-semibold">
                        El "Uber de servicios" de LATAM comienza aquí
                      </p>
                    </Card>
                    <Button size="lg" className="text-lg px-8 py-6">
                      <Rocket className="mr-2 h-5 w-5" />
                      Agendar Reunión
                    </Button>
                  </div>
                )}

                {/* Default content for other slides */}
                {![1, 2, 4, 10, 15].includes(currentSlideData.id) && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      Contenido detallado disponible en el documento completo
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => handleDownload("md")}
                    >
                      Descargar Pitch Deck Completo
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between max-w-6xl mx-auto mt-8">
            <Button
              variant="outline"
              onClick={prevSlide}
              disabled={currentSlide === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            <p className="text-sm text-muted-foreground">
              Slide {currentSlide + 1} de {slides.length}
            </p>
            <Button
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="p-8">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold mb-6">Resumen Ejecutivo</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">🎯 Oportunidad</h3>
                  <p>
                    Mercado de servicios profesionales en Uruguay de $45B anuales, con solo 0.2%
                    de penetración digital. Fragmentado, sin líder claro, y con fuerte dolor de
                    ambos lados del marketplace.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">💡 Solución</h3>
                  <p>
                    Plataforma todo-en-uno que conecta clientes con maestros verificados,
                    integrando pagos seguros con escrow, seguros hasta $10K, facturación
                    automática DGI-compliant, y marketplace de herramientas.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">💰 Modelo de Negocio</h3>
                  <ul>
                    <li>12% comisión por transacción</li>
                    <li>Suscripciones profesionales: $0 - $999/mes</li>
                    <li>Suscripciones empresas: $4,500 - $15,000/mes</li>
                    <li>Marketplace: 7% comisión</li>
                    <li>Publicidad y patrocinios</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">📈 Tracción</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4">
                      <p className="text-2xl font-bold text-primary">1,200</p>
                      <p className="text-sm text-muted-foreground">Usuarios registrados</p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-2xl font-bold text-primary">145</p>
                      <p className="text-sm text-muted-foreground">Transacciones completadas</p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-2xl font-bold text-primary">$464K</p>
                      <p className="text-sm text-muted-foreground">GMV total</p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-2xl font-bold text-primary">72</p>
                      <p className="text-sm text-muted-foreground">NPS Score</p>
                    </Card>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">💵 Proyecciones Financieras</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Año 1:</span>
                      <span className="font-bold">$U 4,860,000 (EBITDA 7%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Año 2:</span>
                      <span className="font-bold">$U 20,160,000 (EBITDA 40%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Año 3:</span>
                      <span className="font-bold">$U 57,888,000 (EBITDA 51%)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">🚀 Solicitud de Inversión</h3>
                  <Card className="p-6 bg-primary/5 border-primary">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Monto:</span>
                        <span className="font-bold">$USD 1,500,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tipo:</span>
                        <span className="font-bold">Serie A Priced</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Valuación Pre:</span>
                        <span className="font-bold">$6,000,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Equity:</span>
                        <span className="font-bold">20%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Runway:</span>
                        <span className="font-bold">24 meses</span>
                      </div>
                    </div>
                  </Card>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">🎯 Uso de Fondos</h3>
                  <ul>
                    <li>40% Marketing & Adquisición ($600K)</li>
                    <li>30% Equipo & Talento ($450K)</li>
                    <li>20% Tecnología & Producto ($300K)</li>
                    <li>10% Operaciones & Legal ($150K)</li>
                  </ul>
                </div>

                <div className="pt-6 border-t">
                  <Button className="w-full" size="lg" onClick={() => handleDownload("md")}>
                    <Download className="mr-2 h-5 w-5" />
                    Descargar Pitch Deck Completo
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
