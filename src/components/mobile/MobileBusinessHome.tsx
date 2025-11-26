import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Megaphone, 
  Users, 
  FileText,
  TrendingUp,
  BarChart3,
  Plus,
  Package,
  Target
} from "lucide-react";

interface MobileBusinessHomeProps {
  stats: {
    activeAds: number;
    totalImpressions: number;
    totalClicks: number;
    openContracts: number;
    contactsUsed: number;
    contactsLimit: number;
    activeProducts: number;
    totalOrders: number;
  };
  subscription: any;
  onNavigate?: (tab: string) => void;
}

export function MobileBusinessHome({ stats, subscription, onNavigate }: MobileBusinessHomeProps) {
  const ctr = stats.totalImpressions > 0 
    ? ((stats.totalClicks / stats.totalImpressions) * 100).toFixed(2) 
    : "0.00";

  return (
    <div className="space-y-4 pb-20">
      {/* CTA Principal */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <Building2 className="h-12 w-12 mx-auto text-primary" />
            <h2 className="text-xl font-bold">Panel Empresarial</h2>
            <p className="text-sm text-muted-foreground">
              Gestiona campañas y contrataciones
            </p>
            {subscription?.status === 'active' ? (
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => onNavigate?.('ads')} 
                  size="lg"
                  className="w-full"
                >
                  <Megaphone className="h-4 w-4 mr-2" />
                  Nueva Campaña
                </Button>
                <Button 
                  onClick={() => onNavigate?.('contracts')} 
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Contratar
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => onNavigate?.('subscription')} 
                size="lg"
                className="w-full"
              >
                <Target className="h-4 w-4 mr-2" />
                Activar Plan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Status */}
      {subscription && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Plan Actual</CardTitle>
              <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                {subscription.status === 'active' ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold capitalize">{subscription.plan_type}</span>
                <span className="text-sm text-muted-foreground">
                  ${subscription.price.toLocaleString()}/mes
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Contactos: {stats.contactsUsed}/{stats.contactsLimit}
              </div>
              <div className="w-full bg-secondary rounded-full h-1.5">
                <div 
                  className="bg-primary h-1.5 rounded-full transition-all"
                  style={{ width: `${(stats.contactsUsed / stats.contactsLimit) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
              <Megaphone className="h-3 w-3" />
              Campañas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAds}</div>
            <p className="text-xs text-muted-foreground">Activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Impresiones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalImpressions.toLocaleString('es', { notation: 'compact' })}
            </div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              CTR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{ctr}%</div>
            <p className="text-xs text-muted-foreground">{stats.totalClicks} clics</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Contratos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openContracts}</div>
            <p className="text-xs text-muted-foreground">Abiertos</p>
          </CardContent>
        </Card>
      </div>

      {/* Marketplace Stats */}
      {stats.activeProducts > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="h-4 w-4" />
              Marketplace
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Productos</p>
                <p className="text-xl font-bold">{stats.activeProducts}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Órdenes</p>
                <p className="text-xl font-bold">{stats.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Acciones Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => onNavigate?.('analytics')}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Ver Analíticas
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => onNavigate?.('search')}
          >
            <Users className="h-4 w-4 mr-2" />
            Buscar Profesionales
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => onNavigate?.('marketplace')}
          >
            <Package className="h-4 w-4 mr-2" />
            Gestionar Productos
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
