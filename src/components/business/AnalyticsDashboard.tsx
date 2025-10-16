import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Eye, MousePointer, Users, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AnalyticsDashboardProps {
  businessId: string;
  subscription: any;
}

export const AnalyticsDashboard = ({ businessId, subscription }: AnalyticsDashboardProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');
  const [analytics, setAnalytics] = useState<any>({
    impressionsData: [],
    categoryData: [],
    contractsData: [],
    performanceMetrics: {
      totalImpressions: 0,
      totalClicks: 0,
      avgCTR: 0,
      totalContracts: 0,
      activeContracts: 0,
      totalSpent: 0
    },
    trends: {
      impressions: 0,
      clicks: 0,
      contracts: 0
    }
  });

  useEffect(() => {
    fetchAnalytics();
  }, [businessId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const daysAgo = parseInt(timeRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Fetch ads data
      const { data: adsData } = await supabase
        .from('advertisements')
        .select('*')
        .eq('business_id', businessId)
        .gte('created_at', startDate.toISOString());

      // Fetch contracts data
      const { data: contractsData } = await supabase
        .from('business_contracts')
        .select('*')
        .eq('business_id', businessId)
        .gte('created_at', startDate.toISOString());

      // Process impressions by day
      const impressionsByDay = processImpressionsByDay(adsData || [], daysAgo);
      
      // Process contracts by category
      const contractsByCategory = processContractsByCategory(contractsData || []);
      
      // Process contracts by status
      const contractsByStatus = processContractsByStatus(contractsData || []);

      // Calculate metrics
      const totalImpressions = adsData?.reduce((sum, ad) => sum + (ad.impressions_count || 0), 0) || 0;
      const totalClicks = adsData?.reduce((sum, ad) => sum + (ad.clicks_count || 0), 0) || 0;
      const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
      const totalSpent = adsData?.reduce((sum, ad) => sum + ((ad.impressions_count || 0) * (ad.cost_per_impression || 0)), 0) || 0;

      // Calculate trends (comparing last period)
      const midPoint = Math.floor(daysAgo / 2);
      const midDate = new Date();
      midDate.setDate(midDate.getDate() - midPoint);

      const { data: previousAdsData } = await supabase
        .from('advertisements')
        .select('*')
        .eq('business_id', businessId)
        .gte('created_at', startDate.toISOString())
        .lt('created_at', midDate.toISOString());

      const { data: previousContractsData } = await supabase
        .from('business_contracts')
        .select('*')
        .eq('business_id', businessId)
        .gte('created_at', startDate.toISOString())
        .lt('created_at', midDate.toISOString());

      const prevImpressions = previousAdsData?.reduce((sum, ad) => sum + (ad.impressions_count || 0), 0) || 0;
      const prevClicks = previousAdsData?.reduce((sum, ad) => sum + (ad.clicks_count || 0), 0) || 0;
      const prevContracts = previousContractsData?.length || 0;

      const currentImpressions = totalImpressions - prevImpressions;
      const currentClicks = totalClicks - prevClicks;
      const currentContracts = (contractsData?.length || 0) - prevContracts;

      const impressionsTrend = prevImpressions > 0 ? ((currentImpressions - prevImpressions) / prevImpressions) * 100 : 0;
      const clicksTrend = prevClicks > 0 ? ((currentClicks - prevClicks) / prevClicks) * 100 : 0;
      const contractsTrend = prevContracts > 0 ? ((currentContracts - prevContracts) / prevContracts) * 100 : 0;

      setAnalytics({
        impressionsData: impressionsByDay,
        categoryData: contractsByCategory,
        contractsData: contractsByStatus,
        performanceMetrics: {
          totalImpressions,
          totalClicks,
          avgCTR,
          totalContracts: contractsData?.length || 0,
          activeContracts: contractsData?.filter(c => c.status === 'open').length || 0,
          totalSpent
        },
        trends: {
          impressions: impressionsTrend,
          clicks: clicksTrend,
          contracts: contractsTrend
        }
      });

    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las analíticas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processImpressionsByDay = (ads: any[], days: number) => {
    const data: any[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
      
      const dayImpressions = ads.reduce((sum, ad) => {
        const adDate = new Date(ad.created_at);
        if (adDate.toDateString() === date.toDateString()) {
          return sum + (ad.impressions_count || 0);
        }
        return sum;
      }, 0);

      const dayClicks = ads.reduce((sum, ad) => {
        const adDate = new Date(ad.created_at);
        if (adDate.toDateString() === date.toDateString()) {
          return sum + (ad.clicks_count || 0);
        }
        return sum;
      }, 0);

      data.push({
        date: dateStr,
        impresiones: dayImpressions,
        clics: dayClicks
      });
    }
    return data;
  };

  const processContractsByCategory = (contracts: any[]) => {
    const categories: { [key: string]: number } = {};
    contracts.forEach(contract => {
      const cat = contract.category || 'other';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    const categoryNames: { [key: string]: string } = {
      plumbing: 'Plomería',
      electricity: 'Electricidad',
      carpentry: 'Carpintería',
      painting: 'Pintura',
      cleaning: 'Limpieza',
      gardening: 'Jardinería',
      appliance: 'Electrodomésticos',
      computer: 'Informática',
      other: 'Otros'
    };

    return Object.entries(categories).map(([key, value]) => ({
      name: categoryNames[key] || key,
      value,
      category: key
    }));
  };

  const processContractsByStatus = (contracts: any[]) => {
    const statuses: { [key: string]: number } = {};
    contracts.forEach(contract => {
      const status = contract.status || 'open';
      statuses[status] = (statuses[status] || 0) + 1;
    });

    const statusNames: { [key: string]: string } = {
      open: 'Abiertos',
      in_progress: 'En Progreso',
      completed: 'Completados',
      cancelled: 'Cancelados'
    };

    return Object.entries(statuses).map(([key, value]) => ({
      name: statusNames[key] || key,
      value
    }));
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--muted))'];

  const MetricCard = ({ title, value, icon: Icon, trend, prefix = '', suffix = '' }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}</div>
        {trend !== undefined && (
          <div className={`flex items-center text-xs ${trend >= 0 ? 'text-success' : 'text-destructive'}`}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {Math.abs(trend).toFixed(1)}% vs período anterior
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Cargando analíticas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analíticas y Reportes</h2>
          <p className="text-muted-foreground">
            Monitorea el rendimiento de tus campañas y contratos
          </p>
        </div>
        <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 días</SelectItem>
            <SelectItem value="30">Últimos 30 días</SelectItem>
            <SelectItem value="90">Últimos 90 días</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Impresiones Totales"
          value={analytics.performanceMetrics.totalImpressions}
          icon={Eye}
          trend={analytics.trends.impressions}
        />
        <MetricCard
          title="Clics Totales"
          value={analytics.performanceMetrics.totalClicks}
          icon={MousePointer}
          trend={analytics.trends.clicks}
        />
        <MetricCard
          title="CTR Promedio"
          value={analytics.performanceMetrics.avgCTR.toFixed(2)}
          icon={TrendingUp}
          suffix="%"
        />
        <MetricCard
          title="Inversión Total"
          value={analytics.performanceMetrics.totalSpent.toFixed(2)}
          icon={DollarSign}
          prefix="$"
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue="impressions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="impressions">Impresiones y Clics</TabsTrigger>
          <TabsTrigger value="contracts">Contratos</TabsTrigger>
          <TabsTrigger value="categories">Por Categoría</TabsTrigger>
        </TabsList>

        <TabsContent value="impressions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento Publicitario</CardTitle>
              <CardDescription>
                Evolución de impresiones y clics en tus anuncios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={analytics.impressionsData}>
                  <defs>
                    <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="impresiones" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorImpressions)" />
                  <Area type="monotone" dataKey="clics" stroke="hsl(var(--accent))" fillOpacity={1} fill="url(#colorClicks)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Contratos por Estado</CardTitle>
                <CardDescription>
                  Distribución de tus proyectos activos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.contractsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.contractsData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estadísticas de Contratos</CardTitle>
                <CardDescription>
                  Resumen de tus proyectos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total de Contratos</span>
                  <span className="text-2xl font-bold">{analytics.performanceMetrics.totalContracts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Contratos Activos</span>
                  <span className="text-2xl font-bold text-primary">{analytics.performanceMetrics.activeContracts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Contactos Usados</span>
                  <span className="text-lg font-medium">
                    {subscription?.contacts_used || 0} / {subscription?.monthly_contacts_limit || 0}
                  </span>
                </div>
                {analytics.trends.contracts !== 0 && (
                  <div className={`flex items-center gap-2 text-sm ${analytics.trends.contracts >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {analytics.trends.contracts >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {Math.abs(analytics.trends.contracts).toFixed(1)}% vs período anterior
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contratos por Categoría</CardTitle>
              <CardDescription>
                Distribución de servicios solicitados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={analytics.categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="hsl(var(--primary))" name="Contratos" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
