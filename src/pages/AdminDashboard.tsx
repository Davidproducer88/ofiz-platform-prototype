import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { LogOut, Users, UserCheck, Calendar, Star, Download } from "lucide-react";
import { UsersTableEnhanced } from "@/components/admin/UsersTableEnhanced";
import { MastersTableEnhanced } from "@/components/admin/MastersTableEnhanced";
import { BookingsTableEnhanced } from "@/components/admin/BookingsTableEnhanced";
import { ReviewsTableEnhanced } from "@/components/admin/ReviewsTableEnhanced";
import { FinancialDashboardTab } from "@/components/admin/FinancialDashboardTab";
import { TransactionsTable } from "@/components/admin/TransactionsTable";
import { RankingsTable } from "@/components/admin/RankingsTable";
import { Feed } from "@/components/Feed";

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMasters: 0,
    totalBookings: 0,
    totalReviews: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadStats();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/admin/login");
      return;
    }

    // Verificar si es admin usando la función de seguridad
    const { data: isAdmin, error } = await supabase.rpc('is_admin');

    if (error || !isAdmin) {
      toast({
        variant: "destructive",
        title: "Acceso denegado",
        description: "No tienes permisos de administrador",
      });
      navigate("/");
      return;
    }

    // Obtener información del perfil
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    setUser({ ...user, profile });
  };

  const loadStats = async () => {
    try {
      const [usersCount, mastersCount, bookingsCount, reviewsCount] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("masters").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("*", { count: "exact", head: true }),
        supabase.from("reviews").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        totalUsers: usersCount.count || 0,
        totalMasters: mastersCount.count || 0,
        totalBookings: bookingsCount.count || 0,
        totalReviews: reviewsCount.count || 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleDownloadManual = async () => {
    try {
      const response = await fetch('/DOSSIER_EJECUTIVO_C_LEVEL.md');
      const content = await response.text();
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Manual_Ejecutivo_C-Level_Ofiz.md';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Manual descargado",
        description: "El manual ejecutivo C-Level se ha descargado exitosamente",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al descargar",
        description: "No se pudo descargar el manual. Por favor intenta de nuevo.",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (!user) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')} 
              className="text-2xl font-bold gradient-text cursor-pointer hover:scale-105 transition-all duration-300"
            >
              Ofiz
            </button>
            <div>
              <h1 className="text-xl font-bold">Panel de Administración</h1>
              <p className="text-sm text-muted-foreground">
                Bienvenido, {user.profile?.full_name || user.email}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleDownloadManual} variant="default" className="bg-gradient-to-r from-primary to-primary-glow">
              <Download className="w-4 h-4 mr-2" />
              Manual C-Level
            </Button>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Maestros</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMasters}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reseñas</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReviews}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="masters">Maestros</TabsTrigger>
            <TabsTrigger value="bookings">Reservas</TabsTrigger>
            <TabsTrigger value="reviews">Reseñas</TabsTrigger>
            <TabsTrigger value="transactions">Transacciones</TabsTrigger>
            <TabsTrigger value="rankings">Rankings</TabsTrigger>
            <TabsTrigger value="financial">Financiero</TabsTrigger>
          </TabsList>

          <TabsContent value="feed">
            <Feed />
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Usuarios</CardTitle>
                <CardDescription>
                  Administra todos los usuarios registrados en la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UsersTableEnhanced onStatsUpdate={loadStats} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="masters">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Maestros</CardTitle>
                <CardDescription>
                  Administra los perfiles de maestros y servicios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MastersTableEnhanced onStatsUpdate={loadStats} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Reservas</CardTitle>
                <CardDescription>
                  Supervisa y administra todas las reservas de servicios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BookingsTableEnhanced onStatsUpdate={loadStats} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Reseñas</CardTitle>
                <CardDescription>
                  Modera las reseñas y comentarios de los usuarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReviewsTableEnhanced onStatsUpdate={loadStats} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionsTable />
          </TabsContent>

          <TabsContent value="rankings">
            <RankingsTable />
          </TabsContent>

          <TabsContent value="financial">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Financiero</CardTitle>
                <CardDescription>
                  Gestiona las finanzas y comisiones de la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FinancialDashboardTab />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;