import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Target,
  Activity,
  Users,
  Percent,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

interface KPIData {
  gmv: number;
  gmvGrowth: number;
  totalCommissions: number;
  commissionsGrowth: number;
  avgTransactionValue: number;
  transactionGrowth: number;
  conversionRate: number;
  conversionGrowth: number;
  activeUsers: number;
  userGrowth: number;
  monthlyRevenue: any[];
  projections: any[];
  categoryBreakdown: any[];
}

export const BusinessKPIs = () => {
  const [kpiData, setKpiData] = useState<KPIData>({
    gmv: 0,
    gmvGrowth: 0,
    totalCommissions: 0,
    commissionsGrowth: 0,
    avgTransactionValue: 0,
    transactionGrowth: 0,
    conversionRate: 0,
    conversionGrowth: 0,
    activeUsers: 0,
    userGrowth: 0,
    monthlyRevenue: [],
    projections: [],
    categoryBreakdown: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKPIs();
  }, []);

  const fetchKPIs = async () => {
    try {
      setLoading(true);

      // Obtener fecha de hace 30 y 60 días
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      // Obtener pagos del último mes
      const { data: currentMonthPayments } = await supabase
        .from('payments')
        .select('amount, commission_amount, created_at, status')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .eq('status', 'approved');

      // Obtener pagos del mes anterior
      const { data: previousMonthPayments } = await supabase
        .from('payments')
        .select('amount, commission_amount, created_at, status')
        .gte('created_at', sixtyDaysAgo.toISOString())
        .lt('created_at', thirtyDaysAgo.toISOString())
        .eq('status', 'approved');

      // Obtener todos los pagos para revenue mensual (últimos 6 meses)
      const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      const { data: allPayments } = await supabase
        .from('payments')
        .select('amount, commission_amount, created_at, status')
        .gte('created_at', sixMonthsAgo.toISOString())
        .eq('status', 'approved');

      // Calcular GMV (Gross Merchandise Value)
      const currentGMV = currentMonthPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const previousGMV = previousMonthPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const gmvGrowth = previousGMV > 0 ? ((currentGMV - previousGMV) / previousGMV) * 100 : 0;

      // Calcular comisiones
      const currentCommissions = currentMonthPayments?.reduce((sum, p) => sum + Number(p.commission_amount), 0) || 0;
      const previousCommissions = previousMonthPayments?.reduce((sum, p) => sum + Number(p.commission_amount), 0) || 0;
      const commissionsGrowth = previousCommissions > 0 ? ((currentCommissions - previousCommissions) / previousCommissions) * 100 : 0;

      // Calcular valor promedio de transacción
      const currentAvg = currentMonthPayments?.length ? currentGMV / currentMonthPayments.length : 0;
      const previousAvg = previousMonthPayments?.length ? previousGMV / previousMonthPayments.length : 0;
      const transactionGrowth = previousAvg > 0 ? ((currentAvg - previousAvg) / previousAvg) * 100 : 0;

      // Obtener bookings para calcular tasa de conversión
      const { data: currentBookings } = await supabase
        .from('bookings')
        .select('id, status, created_at')
        .gte('created_at', thirtyDaysAgo.toISOString());

      const { data: previousBookings } = await supabase
        .from('bookings')
        .select('id, status, created_at')
        .gte('created_at', sixtyDaysAgo.toISOString())
        .lt('created_at', thirtyDaysAgo.toISOString());

      const currentCompleted = currentBookings?.filter(b => b.status === 'completed').length || 0;
      const currentTotal = currentBookings?.length || 1;
      const conversionRate = (currentCompleted / currentTotal) * 100;

      const previousCompleted = previousBookings?.filter(b => b.status === 'completed').length || 0;
      const previousTotal = previousBookings?.length || 1;
      const previousConversionRate = (previousCompleted / previousTotal) * 100;
      const conversionGrowth = previousConversionRate > 0 ? ((conversionRate - previousConversionRate) / previousConversionRate) * 100 : 0;

      // Obtener usuarios activos
      const { count: currentUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      const { count: previousUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sixtyDaysAgo.toISOString())
        .lt('created_at', thirtyDaysAgo.toISOString());

      const userGrowth = previousUsers ? ((currentUsers || 0) - previousUsers) / previousUsers * 100 : 0;

      // Procesar revenue mensual
      const monthlyData = processMonthlyRevenue(allPayments || []);

      // Calcular proyecciones
      const projections = calculateProjections(monthlyData);

      // Obtener breakdown por categoría
      const { data: bookingsWithService } = await supabase
        .from('bookings')
        .select(`
          id,
          service_id,
          master_services!inner (
            category
          )
        `)
        .gte('created_at', thirtyDaysAgo.toISOString());

      const categoryBreakdown = processCategories(bookingsWithService || [], currentMonthPayments || []);

      setKpiData({
        gmv: currentGMV,
        gmvGrowth,
        totalCommissions: currentCommissions,
        commissionsGrowth,
        avgTransactionValue: currentAvg,
        transactionGrowth,
        conversionRate,
        conversionGrowth,
        activeUsers: currentUsers || 0,
        userGrowth,
        monthlyRevenue: monthlyData,
        projections,
        categoryBreakdown
      });
    } catch (error) {
      console.error('Error fetching KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyRevenue = (payments: any[]) => {
    const monthlyMap = new Map();
    
    payments.forEach(payment => {
      const date = new Date(payment.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString('es-UY', { month: 'short', year: 'numeric' }),
          gmv: 0,
          commissions: 0,
          transactions: 0
        });
      }
      
      const data = monthlyMap.get(monthKey);
      data.gmv += Number(payment.amount);
      data.commissions += Number(payment.commission_amount);
      data.transactions += 1;
    });

    return Array.from(monthlyMap.values()).sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });
  };

  const calculateProjections = (monthlyData: any[]) => {
    if (monthlyData.length < 3) return [];

    // Calcular tasa de crecimiento promedio
    const growthRates = [];
    for (let i = 1; i < monthlyData.length; i++) {
      const growth = (monthlyData[i].gmv - monthlyData[i-1].gmv) / monthlyData[i-1].gmv;
      growthRates.push(growth);
    }
    const avgGrowth = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;

    // Proyectar próximos 3 meses
    const lastMonth = monthlyData[monthlyData.length - 1];
    const projections = [];
    
    for (let i = 1; i <= 3; i++) {
      const projectedGMV = lastMonth.gmv * Math.pow(1 + avgGrowth, i);
      const projectedCommissions = projectedGMV * 0.05; // 5% commission rate
      
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + i);
      
      projections.push({
        month: futureDate.toLocaleDateString('es-UY', { month: 'short', year: 'numeric' }),
        gmv: projectedGMV,
        commissions: projectedCommissions,
        projected: true
      });
    }

    return [...monthlyData, ...projections];
  };

  const processCategories = (bookings: any[], payments: any[]) => {
    const categories = new Map();
    const totalGMV = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    bookings.forEach((booking: any) => {
      const category = booking.master_services?.category || 'Otros';
      
      if (!categories.has(category)) {
        categories.set(category, {
          name: category,
          value: 0,
          percentage: 0
        });
      }
      
      // Encontrar el pago asociado
      const payment = payments.find(p => p.booking_id === booking.id);
      if (payment) {
        const data = categories.get(category);
        data.value += Number(payment.amount);
      }
    });

    return Array.from(categories.values()).map(cat => ({
      ...cat,
      percentage: totalGMV > 0 ? (cat.value / totalGMV) * 100 : 0
    })).sort((a, b) => b.value - a.value);
  };

  const MetricCard = ({ 
    title, 
    value, 
    growth, 
    icon: Icon, 
    format = 'currency' 
  }: { 
    title: string; 
    value: number; 
    growth: number; 
    icon: any; 
    format?: 'currency' | 'number' | 'percent';
  }) => {
    const isPositive = growth >= 0;
    const formattedValue = format === 'currency' 
      ? `$${value.toLocaleString('es-UY', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
      : format === 'percent'
      ? `${value.toFixed(1)}%`
      : value.toLocaleString();

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formattedValue}</div>
          <div className="flex items-center mt-2 text-sm">
            {isPositive ? (
              <>
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">+{growth.toFixed(1)}%</span>
              </>
            ) : (
              <>
                <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-red-500 font-medium">{growth.toFixed(1)}%</span>
              </>
            )}
            <span className="text-muted-foreground ml-2">vs mes anterior</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="GMV (Gross Merchandise Value)"
          value={kpiData.gmv}
          growth={kpiData.gmvGrowth}
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          title="Comisiones Generadas"
          value={kpiData.totalCommissions}
          growth={kpiData.commissionsGrowth}
          icon={Target}
          format="currency"
        />
        <MetricCard
          title="Valor Promedio Transacción"
          value={kpiData.avgTransactionValue}
          growth={kpiData.transactionGrowth}
          icon={Activity}
          format="currency"
        />
        <MetricCard
          title="Tasa de Conversión"
          value={kpiData.conversionRate}
          growth={kpiData.conversionGrowth}
          icon={Percent}
          format="percent"
        />
        <MetricCard
          title="Usuarios Activos"
          value={kpiData.activeUsers}
          growth={kpiData.userGrowth}
          icon={Users}
          format="number"
        />
      </div>

      {/* Revenue and Projections Chart */}
      <Card>
        <CardHeader>
          <CardTitle>GMV y Proyecciones de Crecimiento</CardTitle>
          <CardDescription>
            Historial de ingresos brutos y proyecciones basadas en tendencias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={kpiData.projections}>
              <defs>
                <linearGradient id="colorGMV" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCommissions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="gmv"
                name="GMV"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorGMV)"
              />
              <Area
                type="monotone"
                dataKey="commissions"
                name="Comisiones"
                stroke="hsl(var(--secondary))"
                fillOpacity={1}
                fill="url(#colorCommissions)"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-center">
            <Badge variant="secondary" className="mr-2">
              <div className="w-3 h-3 border-2 border-primary mr-2"></div>
              Histórico
            </Badge>
            <Badge variant="outline">
              <div className="w-3 h-3 border-2 border-dashed border-primary mr-2"></div>
              Proyección
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Desglose por Categoría</CardTitle>
          <CardDescription>
            Distribución de GMV por categoría de servicio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {kpiData.categoryBreakdown.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-sm text-muted-foreground">
                    ${category.value.toLocaleString()} ({category.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
