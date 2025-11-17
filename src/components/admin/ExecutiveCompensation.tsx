import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users, TrendingUp, Target, DollarSign, Award, Clock } from "lucide-react";

export const ExecutiveCompensation = () => {
  const executives = [
    {
      role: "CEO",
      title: "Chief Executive Officer",
      salary: "$2,500/mes",
      equity: "28%",
      bonus: "Fundraising exitoso",
      status: "full-time",
      priority: 1,
      color: "text-primary",
      icon: Users,
      responsibilities: [
        "Visión estratégica y liderazgo",
        "Fundraising (SEED $150K USD)",
        "Gobierno corporativo",
        "Alianzas estratégicas"
      ]
    },
    {
      role: "CTO",
      title: "Chief Technology Officer",
      salary: "$3,000/mes",
      equity: "18%",
      bonus: "Product milestones",
      status: "full-time",
      priority: 1,
      color: "text-blue-500",
      icon: Target,
      responsibilities: [
        "Arquitectura técnica escalable",
        "Roadmap del producto",
        "Seguridad y compliance",
        "Team building técnico"
      ]
    },
    {
      role: "COO",
      title: "Chief Operating Officer",
      salary: "$2,000/mes",
      equity: "12%",
      bonus: "Operational KPIs",
      status: "part-time → full-time",
      priority: 2,
      color: "text-green-500",
      icon: TrendingUp,
      responsibilities: [
        "Operaciones de la plataforma",
        "Customer success",
        "Supply & demand management",
        "Calidad del servicio"
      ]
    },
    {
      role: "CDO",
      title: "Chief Digital Officer",
      salary: "$2,000/mes",
      equity: "12%",
      bonus: "Growth metrics",
      status: "part-time → full-time",
      priority: 2,
      color: "text-purple-500",
      icon: Award,
      responsibilities: [
        "Estrategia de crecimiento (AARRR)",
        "User acquisition & retention",
        "Branding y posicionamiento",
        "Analytics y optimización"
      ]
    }
  ];

  const budgetBreakdown = {
    monthly: 9500,
    annual: 114000,
    seedRound: 150000,
    runway: 36000
  };

  const milestones = [
    { metric: "500 transacciones/mes", action: "Todos a tiempo completo" },
    { metric: "$50K MRR", action: "Ajuste salarial +20%" },
    { metric: "SEED cerrado", action: "Bonos por hitos alcanzados" },
    { metric: "1,000 usuarios activos", action: "Performance bonuses activados" }
  ];

  const benefits = [
    { name: "Vesting Schedule", description: "4 años con 1 año cliff" },
    { name: "Health Insurance", description: "Plan básico ($150/mes por persona)" },
    { name: "Education Budget", description: "$500/año para cursos" },
    { name: "Remote-first", description: "Ahorro en espacio de oficina" },
    { name: "Performance Bonuses", description: "Basados en OKRs trimestrales" }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Budget Summary */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Estructura Salarial - Equipo C-Level
          </CardTitle>
          <CardDescription>
            Modelo híbrido optimizado para SEED stage ($150K USD)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Nómina Mensual</p>
              <p className="text-2xl font-bold text-primary">
                ${budgetBreakdown.monthly.toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Presupuesto Anual</p>
              <p className="text-2xl font-bold text-blue-500">
                ${budgetBreakdown.annual.toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground mb-1">SEED Round</p>
              <p className="text-2xl font-bold text-green-500">
                ${budgetBreakdown.seedRound.toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Buffer Runway</p>
              <p className="text-2xl font-bold text-purple-500">
                ${budgetBreakdown.runway.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executive Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {executives.map((exec) => {
          const Icon = exec.icon;
          return (
            <Card key={exec.role} className="border-border/50 hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${exec.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{exec.role}</CardTitle>
                      <CardDescription className="text-xs">{exec.title}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={exec.priority === 1 ? "default" : "secondary"}>
                    {exec.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Compensation */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Salario Base</p>
                    <p className="font-semibold text-sm">{exec.salary}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Equity</p>
                    <p className="font-semibold text-sm text-primary">{exec.equity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Bonos</p>
                    <Badge variant="outline" className="text-xs">
                      {exec.bonus.split(' ')[0]}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Responsibilities */}
                <div>
                  <p className="text-xs font-medium mb-2 text-muted-foreground">
                    Responsabilidades Clave
                  </p>
                  <ul className="space-y-1">
                    {exec.responsibilities.map((resp, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Milestones & Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              Hitos para Ajustes Salariales
            </CardTitle>
            <CardDescription className="text-xs">
              Incrementos automáticos al alcanzar métricas clave
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {milestones.map((milestone, idx) => (
                <div key={idx} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{milestone.metric}</p>
                    <p className="text-xs text-muted-foreground mt-1">{milestone.action}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Hito {idx + 1}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4" />
              Beneficios Adicionales
            </CardTitle>
            <CardDescription className="text-xs">
              Compensación no monetaria y desarrollo profesional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <p className="font-medium text-sm">{benefit.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{benefit.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Justification Card */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            Justificación del Modelo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">→</span>
            <p>
              <strong>CTO ligeramente superior:</strong> En tech startups el producto es crítico en etapa temprana
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">→</span>
            <p>
              <strong>CEO + CTO = 58% del presupuesto:</strong> Roles menos reemplazables inicialmente
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">→</span>
            <p>
              <strong>COO + CDO part-time inicial:</strong> Optimización hasta alcanzar product-market fit
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">→</span>
            <p>
              <strong>Equity como compensación principal:</strong> Alineación de incentivos a largo plazo
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">→</span>
            <p>
              <strong>18+ meses de runway:</strong> Buffer de $36K para imprevistos, legal, servers e inversión inicial en marketing
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Regional Benchmark */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Benchmark Regional LATAM Tech</CardTitle>
          <CardDescription className="text-xs">
            Comparativa con el mercado de startups en Latinoamérica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs text-muted-foreground mb-2">Seed Stage</p>
              <p className="text-lg font-semibold">$1,500 - $3,500</p>
              <p className="text-xs text-muted-foreground mt-1">por C-level/mes</p>
              <Badge variant="default" className="mt-2">OFIZ: $2,375 avg</Badge>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs text-muted-foreground mb-2">Series A</p>
              <p className="text-lg font-semibold text-muted-foreground">$4,000 - $8,000</p>
              <p className="text-xs text-muted-foreground mt-1">por C-level/mes</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs text-muted-foreground mb-2">Series B+</p>
              <p className="text-lg font-semibold text-muted-foreground">$8,000 - $15,000</p>
              <p className="text-xs text-muted-foreground mt-1">por C-level/mes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
