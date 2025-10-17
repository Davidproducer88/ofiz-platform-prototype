import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { LogOut, Users, UserCheck, Calendar, Star } from "lucide-react";
import { UsersTableEnhanced } from "@/components/admin/UsersTableEnhanced";
import { MastersTableEnhanced } from "@/components/admin/MastersTableEnhanced";
import { BookingsTableEnhanced } from "@/components/admin/BookingsTableEnhanced";
import { ReviewsTableEnhanced } from "@/components/admin/ReviewsTableEnhanced";
import { FinancialDashboardTab } from "@/components/admin/FinancialDashboardTab";

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

    // Verificar si es admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type, full_name")
      .eq("id", user.id)
      .single();

    if (profile?.user_type !== "admin") {
      toast({
        variant: "destructive",
        title: "Acceso denegado",
        description: "No tienes permisos de administrador",
      });
      navigate("/");
      return;
    }

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
          <div>
            <h1 className="text-2xl font-bold">Panel de Administración</h1>
            <p className="text-muted-foreground">
              Bienvenido, {user.profile?.full_name || user.email}
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="masters">Maestros</TabsTrigger>
            <TabsTrigger value="bookings">Reservas</TabsTrigger>
            <TabsTrigger value="reviews">Reseñas</TabsTrigger>
            <TabsTrigger value="financial">Financiero</TabsTrigger>
          </TabsList>

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