import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  Calendar, 
  DollarSign, 
  Star, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus
} from "lucide-react";

interface MobileMasterHomeProps {
  stats: {
    totalServices: number;
    activeServices: number;
    pendingBookings: number;
    completedBookings: number;
    totalReviews: number;
    averageRating: number;
    totalEarnings: number;
  };
  onNavigate?: (tab: string) => void;
}

export function MobileMasterHome({ stats, onNavigate }: MobileMasterHomeProps) {
  return (
    <div className="space-y-4 pb-20">
      {/* CTA Principal */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <Briefcase className="h-12 w-12 mx-auto text-primary" />
            <h2 className="text-xl font-bold">Panel Profesional</h2>
            <p className="text-sm text-muted-foreground">
              Gestiona tus servicios y trabajos
            </p>
            <Button 
              onClick={() => onNavigate?.('services')} 
              className="w-full"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Agregar Servicio
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              Servicios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalServices}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeServices} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {stats.pendingBookings}
            </div>
            <p className="text-xs text-muted-foreground">Esperando acción</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Completados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.completedBookings}
            </div>
            <p className="text-xs text-muted-foreground">Trabajos finalizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              ${stats.totalEarnings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total ganado</p>
          </CardContent>
        </Card>
      </div>

      {/* Reputación */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              Reputación
            </span>
            <Badge variant="secondary">
              {stats.averageRating.toFixed(1)} ★
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Reseñas totales</span>
              <span className="font-medium">{stats.totalReviews}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all"
                style={{ width: `${(stats.averageRating / 5) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => onNavigate?.('bookings')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Ver Trabajos Pendientes
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => onNavigate?.('requests')}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Solicitudes de Clientes
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => onNavigate?.('financials')}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Finanzas y Retiros
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
