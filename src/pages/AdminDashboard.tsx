import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { LogOut, Users, UserCheck, Calendar, Star, Download } from "lucide-react";
import jsPDF from "jspdf";
import { marked } from "marked";
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
      toast({
        title: "Generando PDF",
        description: "Por favor espera mientras se genera el documento...",
      });

      const response = await fetch('/DOSSIER_EJECUTIVO_C_LEVEL.md');
      const markdown = await response.text();
      
      // Configurar marked para generar HTML limpio
      marked.setOptions({
        breaks: true,
        gfm: true,
      });
      
      const html = await marked(markdown);
      
      // Crear PDF con jsPDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Configurar fuente y márgenes
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = margin;
      
      // Función para agregar nueva página si es necesario
      const checkPageBreak = (increment: number) => {
        if (yPosition + increment > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
      };
      
      // Parsear el HTML y convertir a PDF
      const lines = markdown.split('\n');
      
      for (const line of lines) {
        if (!line.trim()) {
          yPosition += 3;
          continue;
        }
        
        // Títulos principales (# o ##)
        if (line.startsWith('# ')) {
          checkPageBreak(15);
          pdf.setFontSize(20);
          pdf.setFont('helvetica', 'bold');
          const text = line.replace('# ', '');
          pdf.text(text, margin, yPosition);
          yPosition += 12;
        }
        // Subtítulos (## o ###)
        else if (line.startsWith('## ')) {
          checkPageBreak(12);
          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          const text = line.replace('## ', '');
          pdf.text(text, margin, yPosition);
          yPosition += 10;
        }
        else if (line.startsWith('### ')) {
          checkPageBreak(10);
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          const text = line.replace('### ', '');
          pdf.text(text, margin, yPosition);
          yPosition += 8;
        }
        // Listas
        else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          checkPageBreak(8);
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'normal');
          const text = '• ' + line.trim().substring(2);
          const splitText = pdf.splitTextToSize(text, maxWidth - 5);
          pdf.text(splitText, margin + 5, yPosition);
          yPosition += splitText.length * 5;
        }
        // Texto normal
        else if (!line.startsWith('```') && !line.startsWith('|')) {
          checkPageBreak(8);
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'normal');
          const splitText = pdf.splitTextToSize(line, maxWidth);
          pdf.text(splitText, margin, yPosition);
          yPosition += splitText.length * 5;
        }
      }
      
      // Guardar el PDF
      pdf.save('Manual_Ejecutivo_C-Level_Ofiz.pdf');
      
      toast({
        title: "PDF descargado",
        description: "El manual ejecutivo C-Level se ha descargado exitosamente",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        variant: "destructive",
        title: "Error al generar PDF",
        description: "No se pudo generar el PDF. Por favor intenta de nuevo.",
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