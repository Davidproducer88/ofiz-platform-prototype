import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  DollarSign,
  Activity,
  Target,
  BarChart3,
  PieChart,
  Calendar,
  Zap
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function BusinessStats() {
  const { stats: platformStats, loading: platformLoading } = usePlatformStats();
  const [realTimeData, setRealTimeData] = useState({
    activeBookings: 0,
    todayRevenue: 0,
    activeContracts: 0,
    pendingApplications: 0,
    activeAds: 0,
    totalImpressions: 0,
    recentTransactions: [] as any[]
  });
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [revenueByMonth, setRevenueByMonth] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRealTimeStats();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('business-stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => fetchRealTimeStats()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'business_contracts'
        },
        () => fetchRealTimeStats()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments'
        },
        () => fetchRealTimeStats()
      )
      .subscribe();

    // Refresh every 30 seconds
    const interval = setInterval(fetchRealTimeStats, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const fetchRealTimeStats = async () => {
    try {
      setLoading(true);

      // Active bookings
      const { count: activeBookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'confirmed', 'in_progress']);

      // Active contracts
      const { count: activeContractsCount } = await supabase
        .from('business_contracts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      // Pending applications
      const { count: pendingAppsCount } = await supabase
        .from('business_contract_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Active ads
      const { data: adsData } = await supabase
        .from('advertisements')
        .select('impressions_count')
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString());

      const totalImpressions = adsData?.reduce((sum, ad) => sum + (ad.impressions_count || 0), 0) || 0;

      // Today's revenue
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'released')
        .gte('created_at', today.toISOString());

      const todayRevenue = paymentsData?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      // Recent transactions
      const { data: recentTransactions } = await supabase
        .from('payments')
        .select('id, amount, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // Category statistics
      const { data: categoryData } = await supabase
        .from('bookings')
        .select('service_id, services(category)')
        .not('services', 'is', null);

      const categoryCounts: { [key: string]: number } = {};
      categoryData?.forEach((booking: any) => {
        const category = booking.services?.category;
        if (category) {
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }
      });

      const categoryStatsArray = Object.entries(categoryCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
        value
      }));

      // Revenue by month (last 6 months)
      const monthsAgo = new Date();
      monthsAgo.setMonth(monthsAgo.getMonth() - 6);

      const { data: revenueData } = await supabase
        .from('payments')
        .select('amount, created_at')
        .eq('status', 'released')
        .gte('created_at', monthsAgo.toISOString());

      const monthlyRevenue: { [key: string]: number } = {};
      revenueData?.forEach((payment) => {
        const month = new Date(payment.created_at).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + Number(payment.amount);
      });

      const revenueByMonthArray = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
        month,
        revenue: Math.round(revenue)
      }));

      setRealTimeData({
        activeBookings: activeBookingsCount || 0,
        todayRevenue,
        activeContracts: activeContractsCount || 0,
        pendingApplications: pendingAppsCount || 0,
        activeAds: adsData?.length || 0,
        totalImpressions,
        recentTransactions: recentTransactions || []
      });

      setCategoryStats(categoryStatsArray);
      setRevenueByMonth(revenueByMonthArray);

    } catch (error) {
      console.error('Error fetching real-time stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || platformLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando estadísticas en tiempo real...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold gradient-text">Estadísticas Empresariales</h1>
                <p className="text-muted-foreground">Métricas y datos en tiempo real</p>
              </div>
            </div>
            <Badge variant="secondary" className="flex items-center gap-2 animate-pulse">
              <Zap className="h-3 w-3" />
              Actualización en vivo
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="revenue">Ingresos</TabsTrigger>
            <TabsTrigger value="categories">Categorías</TabsTrigger>
            <TabsTrigger value="platform">Plataforma</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Real-time metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="shadow-soft hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reservas Activas</CardTitle>
                  <Activity className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{realTimeData.activeBookings}</div>
                  <p className="text-xs text-muted-foreground">En proceso actual</p>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos Hoy</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${realTimeData.todayRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Últimas 24 horas</p>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Contratos Activos</CardTitle>
                  <Briefcase className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{realTimeData.activeContracts}</div>
                  <p className="text-xs text-muted-foreground">{realTimeData.pendingApplications} aplicaciones pendientes</p>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Anuncios Activos</CardTitle>
                  <Target className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{realTimeData.activeAds}</div>
                  <p className="text-xs text-muted-foreground">{realTimeData.totalImpressions.toLocaleString()} impresiones</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent transactions */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Transacciones Recientes</CardTitle>
                <CardDescription>Últimas 5 transacciones en tiempo real</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {realTimeData.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium">${Number(transaction.amount).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleString('es-ES')}
                          </p>
                        </div>
                      </div>
                      <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                        {transaction.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Ingresos por Mes</CardTitle>
                <CardDescription>Últimos 6 meses de facturación</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Ingresos ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Distribución por Categorías</CardTitle>
                <CardDescription>Servicios más solicitados</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsPieChart>
                    <Pie
                      data={categoryStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {categoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="platform" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="shadow-soft hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Profesionales</CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{platformStats.total_masters.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Activos en plataforma</p>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{platformStats.total_clients.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Registrados</p>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reservas Totales</CardTitle>
                  <Calendar className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{platformStats.total_bookings.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{platformStats.completed_bookings.toLocaleString()} completadas</p>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Calificación Promedio</CardTitle>
                  <TrendingUp className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{platformStats.average_rating.toFixed(1)} ⭐</div>
                  <p className="text-xs text-muted-foreground">{platformStats.total_reviews.toLocaleString()} reseñas</p>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Satisfacción</CardTitle>
                  <Target className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{platformStats.satisfaction_rate}%</div>
                  <p className="text-xs text-muted-foreground">Clientes satisfechos</p>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tasa de Éxito</CardTitle>
                  <PieChart className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {platformStats.total_bookings > 0 
                      ? ((platformStats.completed_bookings / platformStats.total_bookings) * 100).toFixed(1)
                      : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">Reservas completadas</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
