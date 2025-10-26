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
  const { stats: platformStats, loading: platformLoading, error: platformError } = usePlatformStats();
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
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchRealTimeStats();
    
    // Set up real-time subscription with visual feedback
    const channel = supabase
      .channel('business-stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          setIsUpdating(true);
          fetchRealTimeStats();
          setTimeout(() => setIsUpdating(false), 2000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'business_contracts'
        },
        () => {
          setIsUpdating(true);
          fetchRealTimeStats();
          setTimeout(() => setIsUpdating(false), 2000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments'
        },
        () => {
          setIsUpdating(true);
          fetchRealTimeStats();
          setTimeout(() => setIsUpdating(false), 2000);
        }
      )
      .subscribe();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      setIsUpdating(true);
      fetchRealTimeStats();
      setTimeout(() => setIsUpdating(false), 2000);
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const fetchRealTimeStats = async () => {
    try {
      // Don't show loading on subsequent fetches (real-time updates)
      if (realTimeData.activeBookings === 0 && !loading) {
        setLoading(true);
      }

      // Parallel queries for better performance
      const [
        activeBookingsResult,
        activeContractsResult,
        pendingAppsResult,
        adsResult,
        todayPaymentsResult,
        recentTransactionsResult,
        servicesWithBookingsResult,
        last6MonthsPaymentsResult
      ] = await Promise.all([
        // Active bookings count
        supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .in('status', ['pending', 'confirmed', 'in_progress']),
        
        // Active contracts count
        supabase
          .from('business_contracts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'open'),
        
        // Pending applications count
        supabase
          .from('business_contract_applications')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
        
        // Active ads with impressions
        supabase
          .from('advertisements')
          .select('impressions_count')
          .eq('is_active', true)
          .lte('start_date', new Date().toISOString())
          .gte('end_date', new Date().toISOString()),
        
        // Today's payments
        supabase
          .from('payments')
          .select('amount')
          .eq('status', 'released')
          .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
        
        // Recent transactions
        supabase
          .from('payments')
          .select('id, amount, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
        
        // Services with category from bookings (optimized join)
        supabase
          .from('services')
          .select('category, bookings!inner(id)'),
        
        // Last 6 months payments
        supabase
          .from('payments')
          .select('amount, created_at')
          .eq('status', 'released')
          .gte('created_at', new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString())
      ]);

      // Process results with error handling
      const activeBookingsCount = activeBookingsResult.count || 0;
      const activeContractsCount = activeContractsResult.count || 0;
      const pendingAppsCount = pendingAppsResult.count || 0;
      
      const adsData = adsResult.data || [];
      const totalImpressions = adsData.reduce((sum, ad) => sum + (ad.impressions_count || 0), 0);
      
      const todayPayments = todayPaymentsResult.data || [];
      const todayRevenue = todayPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      
      const recentTransactions = recentTransactionsResult.data || [];

      // Process category statistics (optimized)
      const categoryCounts: { [key: string]: number } = {};
      const servicesData = servicesWithBookingsResult.data || [];
      
      servicesData.forEach((service: any) => {
        const category = service.category;
        if (category && service.bookings?.length > 0) {
          categoryCounts[category] = (categoryCounts[category] || 0) + service.bookings.length;
        }
      });

      const categoryStatsArray = Object.entries(categoryCounts)
        .map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' '),
          value
        }))
        .sort((a, b) => b.value - a.value);

      // Process revenue by month
      const monthlyRevenue: { [key: string]: number } = {};
      const revenueData = last6MonthsPaymentsResult.data || [];
      
      revenueData.forEach((payment) => {
        const date = new Date(payment.created_at);
        const month = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + Number(payment.amount || 0);
      });

      // Sort months chronologically
      const revenueByMonthArray = Object.entries(monthlyRevenue)
        .map(([month, revenue]) => ({
          month,
          revenue: Math.round(revenue)
        }))
        .sort((a, b) => {
          const dateA = new Date(a.month);
          const dateB = new Date(b.month);
          return dateA.getTime() - dateB.getTime();
        });

      // Update state
      setRealTimeData({
        activeBookings: activeBookingsCount,
        todayRevenue: Math.round(todayRevenue),
        activeContracts: activeContractsCount,
        pendingApplications: pendingAppsCount,
        activeAds: adsData.length,
        totalImpressions,
        recentTransactions
      });

      setCategoryStats(categoryStatsArray);
      setRevenueByMonth(revenueByMonthArray);

    } catch (error) {
      console.error('Error fetching real-time stats:', error);
      // Show user-friendly error message
      if (realTimeData.activeBookings === 0) {
        setRealTimeData({
          activeBookings: 0,
          todayRevenue: 0,
          activeContracts: 0,
          pendingApplications: 0,
          activeAds: 0,
          totalImpressions: 0,
          recentTransactions: []
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading || platformLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-lg font-medium">Cargando estadísticas en tiempo real...</p>
          <p className="text-sm text-muted-foreground">Conectando con la base de datos</p>
        </div>
      </div>
    );
  }

  if (platformError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error al cargar estadísticas</CardTitle>
            <CardDescription>{platformError}</CardDescription>
          </CardHeader>
          <CardContent>
            <button 
              onClick={() => window.location.reload()} 
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
            >
              Reintentar
            </button>
          </CardContent>
        </Card>
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
              <Zap className={`h-3 w-3 ${isUpdating ? 'text-green-500' : ''}`} />
              {isUpdating ? 'Actualizando...' : 'Actualización en vivo'}
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
                  <Badge variant={transaction.status === 'released' ? 'default' : 'secondary'}>
                        {transaction.status === 'released' ? 'Completado' : 
                         transaction.status === 'in_escrow' ? 'En custodia' : 
                         transaction.status === 'pending' ? 'Pendiente' :
                         transaction.status === 'approved' ? 'Aprobado' : transaction.status}
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
