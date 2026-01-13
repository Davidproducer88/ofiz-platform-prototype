import { Card, CardContent } from "@/components/ui/card";
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
  ChevronRight,
  Sparkles,
  Eye,
  MessageSquare,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppMasterHomeProps {
  stats: {
    totalServices: number;
    activeServices: number;
    pendingBookings: number;
    completedBookings: number;
    totalReviews: number;
    averageRating: number;
    totalEarnings: number;
  };
  userName?: string;
  onNavigate?: (tab: string) => void;
  className?: string;
}

export function AppMasterHome({ stats, userName = 'Profesional', onNavigate, className }: AppMasterHomeProps) {
  const quickStats = [
    {
      icon: Clock,
      label: 'Pendientes',
      value: stats.pendingBookings,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      tab: 'bookings'
    },
    {
      icon: CheckCircle,
      label: 'Completados',
      value: stats.completedBookings,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      tab: 'bookings'
    },
    {
      icon: Star,
      label: 'Rating',
      value: stats.averageRating.toFixed(1),
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      tab: 'reviews'
    },
    {
      icon: DollarSign,
      label: 'Ingresos',
      value: `$${(stats.totalEarnings / 1000).toFixed(0)}k`,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      tab: 'finances'
    },
  ];

  const actions = [
    {
      icon: Briefcase,
      title: 'Mis Servicios',
      subtitle: `${stats.activeServices} activos`,
      tab: 'services',
      accent: true
    },
    {
      icon: Calendar,
      title: 'Próximas Reservas',
      subtitle: `${stats.pendingBookings} pendientes`,
      tab: 'bookings'
    },
    {
      icon: MessageSquare,
      title: 'Mensajes',
      subtitle: 'Chatea con clientes',
      tab: 'messages'
    },
    {
      icon: Eye,
      title: 'Mi Portfolio',
      subtitle: 'Muestra tu trabajo',
      tab: 'portfolio'
    },
  ];

  return (
    <div className={cn("space-y-5 pb-24", className)}>
      {/* Hero Stats Card */}
      <Card className="card-ios overflow-hidden border-0">
        <div className="bg-gradient-primary p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-primary-foreground/70 text-sm">Tu rendimiento</p>
              <h2 className="text-2xl font-bold text-primary-foreground">
                ${stats.totalEarnings.toLocaleString()}
              </h2>
              <p className="text-primary-foreground/70 text-xs mt-0.5">
                Ingresos totales
              </p>
            </div>
            <div className="h-14 w-14 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <TrendingUp className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          
          {/* Mini stats row */}
          <div className="flex gap-3">
            <div className="flex-1 bg-primary-foreground/10 rounded-xl px-3 py-2">
              <p className="text-primary-foreground/70 text-[10px] uppercase tracking-wide">Servicios</p>
              <p className="text-primary-foreground font-bold text-lg">{stats.totalServices}</p>
            </div>
            <div className="flex-1 bg-primary-foreground/10 rounded-xl px-3 py-2">
              <p className="text-primary-foreground/70 text-[10px] uppercase tracking-wide">Trabajos</p>
              <p className="text-primary-foreground font-bold text-lg">{stats.completedBookings}</p>
            </div>
            <div className="flex-1 bg-primary-foreground/10 rounded-xl px-3 py-2">
              <p className="text-primary-foreground/70 text-[10px] uppercase tracking-wide">Reseñas</p>
              <p className="text-primary-foreground font-bold text-lg">{stats.totalReviews}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-4 gap-2">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.label}
              onClick={() => onNavigate?.(stat.tab)}
              className="card-ios p-3 flex flex-col items-center gap-1.5 ios-press"
            >
              <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center", stat.bgColor)}>
                <Icon className={cn("h-4.5 w-4.5", stat.color)} />
              </div>
              <span className="text-lg font-bold text-foreground">{stat.value}</span>
              <span className="text-[10px] text-muted-foreground">{stat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Pro Tip Banner */}
      <Card className="card-ios border-primary/20 bg-primary/5 overflow-hidden">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground">¡Mejora tu perfil!</p>
            <p className="text-xs text-muted-foreground truncate">Completa tu portfolio para destacar</p>
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            className="shrink-0 text-primary"
            onClick={() => onNavigate?.('portfolio')}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground px-1">Acceso Rápido</h3>
        <div className="space-y-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.tab}
                onClick={() => onNavigate?.(action.tab)}
                className={cn(
                  "card-ios w-full p-4 flex items-center gap-4 ios-press",
                  action.accent && "border-primary/30 bg-gradient-to-r from-primary/5 to-transparent"
                )}
              >
                <div className={cn(
                  "h-11 w-11 rounded-xl flex items-center justify-center",
                  action.accent ? "bg-gradient-primary" : "bg-muted"
                )}>
                  <Icon className={cn(
                    "h-5 w-5",
                    action.accent ? "text-primary-foreground" : "text-muted-foreground"
                  )} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-foreground">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.subtitle}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Rating Section */}
      <Card className="card-ios overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              <span className="font-semibold text-foreground">Tu Reputación</span>
            </div>
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
              {stats.averageRating.toFixed(1)} ★
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${(stats.averageRating / 5) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{stats.totalReviews} reseñas</span>
              <button 
                onClick={() => onNavigate?.('reviews')}
                className="text-primary font-medium ios-press"
              >
                Ver todas
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}