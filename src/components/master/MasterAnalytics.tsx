import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, CheckCircle, XCircle, Clock } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";

interface AnalyticsData {
  monthlyEarnings: any[];
  conversionRate: number;
  topServices: any[];
  contractsByStatus: any[];
  applicationStats: {
    sent: number;
    accepted: number;
    rejected: number;
    pending: number;
  };
}

export const MasterAnalytics = () => {
  const [timeRange, setTimeRange] = useState("6");
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    monthlyEarnings: [],
    conversionRate: 0,
    topServices: [],
    contractsByStatus: [],
    applicationStats: { sent: 0, accepted: 0, rejected: 0, pending: 0 }
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const months = parseInt(timeRange);
      const startDate = startOfMonth(subMonths(new Date(), months - 1));

      // Fetch payments for earnings
      const { data: payments } = await supabase
        .from('payments')
        .select('amount, master_amount, created_at, status')
        .eq('master_id', user.id)
        .gte('created_at', startDate.toISOString());

      // Fetch applications
      const { data: applications } = await supabase
        .from('service_applications')
        .select('*, service_requests(category)')
        .eq('master_id', user.id)
        .gte('created_at', startDate.toISOString());

      // Calculate monthly earnings
      const earningsByMonth = new Map();
      payments?.forEach(payment => {
        if (payment.status === 'released') {
          const month = format(new Date(payment.created_at), 'MMM yyyy', { locale: es });
          earningsByMonth.set(month, (earningsByMonth.get(month) || 0) + Number(payment.master_amount));
        }
      });

      const monthlyEarnings = Array.from(earningsByMonth.entries()).map(([month, earnings]) => ({
        month,
        ingresos: earnings
      }));

      // Calculate conversion rate
      const totalApps = applications?.length || 0;
      const acceptedApps = applications?.filter(app => app.status === 'accepted').length || 0;
      const conversionRate = totalApps > 0 ? (acceptedApps / totalApps) * 100 : 0;

      // Application stats
      const applicationStats = {
        sent: totalApps,
        accepted: acceptedApps,
        rejected: applications?.filter(app => app.status === 'rejected').length || 0,
        pending: applications?.filter(app => app.status === 'pending').length || 0
      };

      // Top services by category
      const servicesByCategory = new Map();
      applications?.forEach(app => {
        const category = app.service_requests?.category || 'other';
        servicesByCategory.set(category, (servicesByCategory.get(category) || 0) + 1);
      });

      const topServices = Array.from(servicesByCategory.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Contracts by status
      const contractsByStatus = [
        { name: 'Aceptadas', value: acceptedApps, color: '#22c55e' },
        { name: 'Pendientes', value: applicationStats.pending, color: '#eab308' },
        { name: 'Rechazadas', value: applicationStats.rejected, color: '#ef4444' }
      ];

      setAnalytics({
        monthlyEarnings,
        conversionRate,
        topServices,
        contractsByStatus,
        applicationStats
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryLabels: Record<string, string> = {
    plumbing: 'Plomería',
    electricity: 'Electricidad',
    cleaning: 'Limpieza',
    computer_repair: 'Reparación PC',
    gardening: 'Jardinería',
    painting: 'Pintura',
    carpentry: 'Carpintería',
    appliance_repair: 'Reparaciones'
  };

  if (loading) {
    return <div>Cargando analíticas...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analíticas de Rendimiento</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">Últimos 3 meses</SelectItem>
            <SelectItem value="6">Últimos 6 meses</SelectItem>
            <SelectItem value="12">Último año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Propuestas Enviadas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.applicationStats.sent}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de propuestas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
            {analytics.conversionRate >= 20 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Propuestas aceptadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aceptadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.applicationStats.accepted}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Trabajos confirmados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.applicationStats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Esperando respuesta
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Earnings Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Ingresos Mensuales</CardTitle>
            <CardDescription>Tendencia de ganancias por mes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.monthlyEarnings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                <Area type="monotone" dataKey="ingresos" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Contracts by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Propuestas por Estado</CardTitle>
            <CardDescription>Distribución de tus propuestas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.contractsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.contractsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Services */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Categorías Más Solicitadas</CardTitle>
            <CardDescription>Tus servicios con mayor demanda</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topServices}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="category" 
                  tickFormatter={(value) => categoryLabels[value] || value}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => categoryLabels[value] || value}
                  formatter={(value) => [`${value} propuestas`, 'Cantidad']}
                />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
