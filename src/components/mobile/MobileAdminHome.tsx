import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Star,
  Shield,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  Settings,
  MessageSquare,
  BarChart3,
  Megaphone
} from "lucide-react";

interface MobileAdminHomeProps {
  stats: {
    totalUsers: number;
    totalMasters: number;
    totalBookings: number;
    totalReviews: number;
  };
  onNavigate?: (tab: string) => void;
}

export function MobileAdminHome({ stats, onNavigate }: MobileAdminHomeProps) {
  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <Shield className="h-12 w-12 mx-auto text-primary" />
            <h2 className="text-xl font-bold">Panel Admin</h2>
            <p className="text-sm text-muted-foreground">
              Control y monitoreo de la plataforma
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" />
              Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Total registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
              <UserCheck className="h-3 w-3" />
              Profesionales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.totalMasters}
            </div>
            <p className="text-xs text-muted-foreground">Activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Reservas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
              <Star className="h-3 w-3" />
              Reseñas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Acciones Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Gestión Rápida</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => onNavigate?.('users')}
          >
            <Users className="h-4 w-4 mr-2" />
            Gestionar Usuarios
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => onNavigate?.('masters')}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Profesionales
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => onNavigate?.('bookings')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Reservas
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => onNavigate?.('subscriptions')}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Suscripciones
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => onNavigate?.('ads')}
          >
            <Megaphone className="h-4 w-4 mr-2" />
            Anuncios
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => onNavigate?.('financial')}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Dashboard Financiero
          </Button>
        </CardContent>
      </Card>

      {/* Monitoreo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Monitoreo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => onNavigate?.('disputes')}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Disputas
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => onNavigate?.('security')}
          >
            <Shield className="h-4 w-4 mr-2" />
            Seguridad
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => onNavigate?.('rankings')}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Rankings
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => onNavigate?.('transactions')}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Transacciones
          </Button>
        </CardContent>
      </Card>

      {/* Configuración */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => onNavigate?.('config')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configuración Plataforma
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => onNavigate?.('feed')}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Feed
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => onNavigate?.('executives')}
          >
            <Star className="h-4 w-4 mr-2" />
            C-Level
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
