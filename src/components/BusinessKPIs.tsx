import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, Users, Briefcase, Target, Info } from "lucide-react";

export const BusinessKPIs = () => {
  const [showRevenueDetails, setShowRevenueDetails] = useState(false);
  const [showProjectionDetails, setShowProjectionDetails] = useState(false);

  // Demo data
  const kpis = {
    gmv: {
      total: 2450000,
      growth: 23.5,
      avgTransaction: 1850,
    },
    revenue: {
      total: 367500,
      growth: 28.3,
      services: 245000,
      subscriptions: 89500,
      advertising: 33000,
      commission: 5,
    },
    transactions: {
      total: 1324,
      growth: 18.7,
      completed: 1198,
      pending: 126,
    },
    users: {
      active: 8950,
      growth: 15.2,
      masters: 2840,
      clients: 6110,
    },
    projections: {
      gmv: 4200000,
      revenue: 630000,
      users: 4200,
      growth: 15,
    },
  };

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-4 lg:px-0">
      {/* Overview Cards */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GMV Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">${kpis.gmv.total.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <ArrowUpRight className="h-3 w-3 text-success mr-1" />
              <span className="text-success">+{kpis.gmv.growth}%</span>
              <span className="ml-1">vs mes anterior</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Promedio por transacción: ${kpis.gmv.avgTransaction.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">${kpis.revenue.total.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <ArrowUpRight className="h-3 w-3 text-success mr-1" />
              <span className="text-success">+{kpis.revenue.growth}%</span>
              <span className="ml-1">vs mes anterior</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Comisión: {kpis.revenue.commission}% por transacción
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{kpis.transactions.total.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <ArrowUpRight className="h-3 w-3 text-success mr-1" />
              <span className="text-success">+{kpis.transactions.growth}%</span>
              <span className="ml-1">vs mes anterior</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Completadas: {kpis.transactions.completed} | Pendientes: {kpis.transactions.pending}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{kpis.users.active.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <ArrowUpRight className="h-3 w-3 text-success mr-1" />
              <span className="text-success">+{kpis.users.growth}%</span>
              <span className="ml-1">vs mes anterior</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Maestros: {kpis.users.masters.toLocaleString()} | Clientes: {kpis.users.clients.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics Grid */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base md:text-lg">Desglose de Ingresos</CardTitle>
                <CardDescription className="text-xs md:text-sm">Distribución por fuente de ingresos</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowRevenueDetails(true)}
                className="h-8 w-8"
              >
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="flex items-center gap-2">
                  <Briefcase className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="truncate">Comisión Servicios ({kpis.revenue.commission}%)</span>
                </span>
                <span className="font-medium whitespace-nowrap ml-2">${kpis.revenue.services.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="flex items-center gap-2">
                  <Users className="h-3 w-3 md:h-4 md:w-4" />
                  Suscripciones
                </span>
                <span className="font-medium whitespace-nowrap ml-2">${kpis.revenue.subscriptions.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="flex items-center gap-2">
                  <Target className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="truncate">Publicidad & Destacados</span>
                </span>
                <span className="font-medium whitespace-nowrap ml-2">${kpis.revenue.advertising.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-3 border-t">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-sm">Total</span>
                <span className="text-base md:text-lg">${kpis.revenue.total.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Growth Projections */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base md:text-lg">Proyecciones de Crecimiento</CardTitle>
                <CardDescription className="text-xs md:text-sm">Estimaciones para próximos 6 meses</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowProjectionDetails(true)}
                className="h-8 w-8"
              >
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs md:text-sm mb-1">
                  <span className="text-muted-foreground">GMV Proyectado</span>
                  <span className="font-bold text-base md:text-lg">${kpis.projections.gmv.toLocaleString()}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{kpis.projections.growth}% crecimiento mensual
                </Badge>
              </div>
              
              <div>
                <div className="flex items-center justify-between text-xs md:text-sm mb-1">
                  <span className="text-muted-foreground">Ingresos Proyectados</span>
                  <span className="font-bold text-base md:text-lg">${kpis.projections.revenue.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs md:text-sm mb-1">
                  <span className="text-muted-foreground">Nuevos Usuarios</span>
                  <span className="font-bold text-base md:text-lg">+{kpis.projections.users.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground">
                Basado en tendencias actuales y crecimiento sostenido
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Details Dialog */}
      <Dialog open={showRevenueDetails} onOpenChange={setShowRevenueDetails}>
        <DialogContent className="max-w-[90vw] sm:max-w-md md:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">Detalle de Ingresos por Canal</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">Análisis completo de fuentes de ingresos</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 md:space-y-4 mt-2">
            <div className="border rounded-lg p-3 md:p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Comisiones por Servicios
                </h4>
                <span className="font-bold text-base md:text-lg">${kpis.revenue.services.toLocaleString()}</span>
              </div>
              <div className="space-y-1 text-xs md:text-sm text-muted-foreground">
                <p>• Tasa de comisión: {kpis.revenue.commission}%</p>
                <p>• Transacciones del mes: {kpis.transactions.total.toLocaleString()}</p>
                <p>• Ticket promedio: ${kpis.gmv.avgTransaction.toLocaleString()}</p>
              </div>
            </div>

            <div className="border rounded-lg p-3 md:p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Suscripciones
                </h4>
                <span className="font-bold text-base md:text-lg">${kpis.revenue.subscriptions.toLocaleString()}</span>
              </div>
              <div className="space-y-1 text-xs md:text-sm text-muted-foreground">
                <p>• Plan Basic: $99/mes × {Math.floor(kpis.revenue.subscriptions / 500)} usuarios</p>
                <p>• Plan Pro: $299/mes × {Math.floor(kpis.revenue.subscriptions / 800)} usuarios</p>
                <p>• Plan Premium: $599/mes × {Math.floor(kpis.revenue.subscriptions / 1200)} usuarios</p>
              </div>
            </div>

            <div className="border rounded-lg p-3 md:p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Publicidad y Destacados
                </h4>
                <span className="font-bold text-base md:text-lg">${kpis.revenue.advertising.toLocaleString()}</span>
              </div>
              <div className="space-y-1 text-xs md:text-sm text-muted-foreground">
                <p>• Perfiles destacados: $200/mes</p>
                <p>• Anuncios premium: $150/mes</p>
                <p>• Badges especiales: $50/mes</p>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 md:p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm md:text-base">Total Ingresos del Mes</span>
                <span className="font-bold text-lg md:text-xl">${kpis.revenue.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Projection Details Dialog */}
      <Dialog open={showProjectionDetails} onOpenChange={setShowProjectionDetails}>
        <DialogContent className="max-w-[90vw] sm:max-w-md md:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">Proyecciones de Crecimiento Detalladas</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">Modelo de crecimiento basado en tendencias actuales</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 md:space-y-4 mt-2">
            <div className="bg-primary/10 rounded-lg p-3 md:p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <h4 className="font-semibold text-sm md:text-base">Proyección a 6 Meses</h4>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">
                Basado en un crecimiento mensual promedio del {kpis.projections.growth}%
              </p>
            </div>

            <div className="border rounded-lg p-3 md:p-4">
              <h4 className="font-semibold mb-3 text-sm md:text-base">GMV Proyectado</h4>
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Mes actual</p>
                  <p className="text-base md:text-lg font-bold">${kpis.gmv.total.toLocaleString()}</p>
                </div>
                <ArrowUpRight className="h-5 w-5 md:h-6 md:w-6 text-success flex-shrink-0" />
                <div className="flex-1 text-right">
                  <p className="text-xs text-muted-foreground mb-1">Mes 6</p>
                  <p className="text-base md:text-lg font-bold text-success">${kpis.projections.gmv.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-3 md:p-4">
              <h4 className="font-semibold mb-3 text-sm md:text-base">Ingresos Proyectados</h4>
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Mes actual</p>
                  <p className="text-base md:text-lg font-bold">${kpis.revenue.total.toLocaleString()}</p>
                </div>
                <ArrowUpRight className="h-5 w-5 md:h-6 md:w-6 text-success flex-shrink-0" />
                <div className="flex-1 text-right">
                  <p className="text-xs text-muted-foreground mb-1">Mes 6</p>
                  <p className="text-base md:text-lg font-bold text-success">${kpis.projections.revenue.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-3 md:p-4">
              <h4 className="font-semibold mb-2 text-sm md:text-base">Crecimiento de Usuarios</h4>
              <div className="space-y-1.5 text-xs md:text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Usuarios actuales</span>
                  <span className="font-medium">{kpis.users.active.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nuevos usuarios (6 meses)</span>
                  <span className="font-medium text-success">+{kpis.projections.users.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t">
                  <span className="font-semibold">Total proyectado</span>
                  <span className="font-bold">{(kpis.users.active + kpis.projections.users).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 md:p-4">
              <p className="text-xs md:text-sm text-muted-foreground">
                <strong>Nota:</strong> Las proyecciones se basan en tendencias históricas y suponen
                el mantenimiento de las tasas de conversión y retención actuales.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
