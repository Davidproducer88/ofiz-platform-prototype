import { Card, CardContent } from '@/components/ui/card';
import { 
  Star, 
  Users, 
  CheckCircle, 
  DollarSign, 
  Clock, 
  TrendingUp,
  LucideIcon
} from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  iconColor: string;
  bgColor: string;
}

const StatCard = ({ icon: Icon, title, value, subtitle, iconColor, bgColor }: StatCardProps) => (
  <Card className="shadow-elegant hover:shadow-soft transition-all duration-300 hover:-translate-y-1 border-border/50 bg-gradient-to-br from-card to-card/50">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold gradient-text mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

interface DashboardStatsProps {
  stats: {
    totalServices: number;
    activeServices: number;
    pendingBookings: number;
    completedBookings: number;
    totalReviews: number;
    averageRating: number;
    totalEarnings: number;
  };
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
      <StatCard
        icon={Star}
        title="Calificación"
        value={stats.averageRating.toFixed(1)}
        subtitle={`${stats.totalReviews} reseñas`}
        iconColor="text-yellow-600"
        bgColor="bg-yellow-100 dark:bg-yellow-900/20"
      />
      
      <StatCard
        icon={Clock}
        title="Reservas Pendientes"
        value={stats.pendingBookings}
        subtitle="Por completar"
        iconColor="text-orange-600"
        bgColor="bg-orange-100 dark:bg-orange-900/20"
      />
      
      <StatCard
        icon={CheckCircle}
        title="Trabajos Completados"
        value={stats.completedBookings}
        subtitle="Total histórico"
        iconColor="text-green-600"
        bgColor="bg-green-100 dark:bg-green-900/20"
      />
      
      <StatCard
        icon={DollarSign}
        title="Ingresos Totales"
        value={`$${stats.totalEarnings.toLocaleString()} UYU`}
        subtitle="Acumulado"
        iconColor="text-blue-600"
        bgColor="bg-blue-100 dark:bg-blue-900/20"
      />
    </div>
  );
};
