import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { LogOut, Users, UserCheck, Calendar, Star, Download } from "lucide-react";
import jsPDF from "jspdf";
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
      
      // Crear PDF con jsPDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Configurar fuente y márgenes
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = margin;
      let pageNumber = 1;
      
      // Función para agregar encabezado y pie de página
      const addHeaderFooter = () => {
        // Encabezado
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(128, 128, 128);
        pdf.text('Dossier Ejecutivo C-Level - Ofiz', margin, 8);
        
        // Pie de página
        pdf.text(`Página ${pageNumber}`, pageWidth - margin - 15, pageHeight - 8);
        pdf.setTextColor(0, 0, 0);
        pageNumber++;
      };
      
      // Función para agregar nueva página si es necesario
      const checkPageBreak = (increment: number) => {
        if (yPosition + increment > pageHeight - 20) {
          pdf.addPage();
          yPosition = margin + 5;
          addHeaderFooter();
        }
      };
      
      // Primera página - encabezado inicial
      addHeaderFooter();
      
      // Parsear el markdown y convertir a PDF
      const lines = markdown.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Líneas vacías
        if (!line.trim()) {
          yPosition += 2;
          continue;
        }
        
        // Ignorar líneas de código y tablas complejas
        if (line.startsWith('```') || line.includes('┌') || line.includes('│') || 
            line.includes('├') || line.includes('└') || line.includes('━')) {
          continue;
        }
        
        // Títulos principales (#)
        if (line.match(/^# [^#]/)) {
          checkPageBreak(20);
          yPosition += 5;
          pdf.setFontSize(18);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(33, 150, 243);
          const text = line.replace(/^# /, '').replace(/<[^>]*>/g, '');
          const splitText = pdf.splitTextToSize(text, maxWidth);
          pdf.text(splitText, margin, yPosition);
          yPosition += splitText.length * 8 + 5;
          pdf.setTextColor(0, 0, 0);
        }
        // Subtítulos (##)
        else if (line.match(/^## [^#]/)) {
          checkPageBreak(15);
          yPosition += 4;
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(63, 81, 181);
          const text = line.replace(/^## /, '').replace(/<[^>]*>/g, '');
          const splitText = pdf.splitTextToSize(text, maxWidth);
          pdf.text(splitText, margin, yPosition);
          yPosition += splitText.length * 7 + 4;
          pdf.setTextColor(0, 0, 0);
        }
        // Subtítulos pequeños (###)
        else if (line.match(/^### /)) {
          checkPageBreak(12);
          yPosition += 3;
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          const text = line.replace(/^### /, '').replace(/<[^>]*>/g, '');
          const splitText = pdf.splitTextToSize(text, maxWidth);
          pdf.text(splitText, margin, yPosition);
          yPosition += splitText.length * 6 + 3;
        }
        // Títulos muy pequeños (####)
        else if (line.match(/^#### /)) {
          checkPageBreak(10);
          yPosition += 2;
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          const text = line.replace(/^#### /, '').replace(/<[^>]*>/g, '');
          const splitText = pdf.splitTextToSize(text, maxWidth);
          pdf.text(splitText, margin, yPosition);
          yPosition += splitText.length * 5 + 2;
        }
        // Listas con viñetas
        else if (line.trim().match(/^[-*✅❌⚠️✓•] /)) {
          checkPageBreak(7);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          let text = line.trim();
          
          // Reemplazar emojis con símbolos de texto
          text = text.replace(/^✅/, '✓')
                     .replace(/^❌/, '✗')
                     .replace(/^⚠️/, '!')
                     .replace(/^[-*]/, '•');
          
          const splitText = pdf.splitTextToSize(text, maxWidth - 5);
          pdf.text(splitText, margin + 5, yPosition);
          yPosition += splitText.length * 4.5;
        }
        // Separadores (---)
        else if (line.trim().match(/^---+$/)) {
          checkPageBreak(5);
          pdf.setDrawColor(200, 200, 200);
          pdf.setLineWidth(0.5);
          pdf.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 5;
        }
        // Texto normal
        else if (line.trim() && !line.startsWith('|')) {
          checkPageBreak(7);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          
          // Limpiar markdown básico
          let text = line.trim()
            .replace(/\*\*(.*?)\*\*/g, '$1') // Negritas
            .replace(/\*(.*?)\*/g, '$1')     // Itálicas
            .replace(/`(.*?)`/g, '$1')       // Código
            .replace(/<[^>]*>/g, '')         // HTML tags
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Links
          
          // Si es una línea de tabla simple, intentar procesarla
          if (line.includes('|') && line.split('|').length > 2) {
            const cells = line.split('|').map(c => c.trim()).filter(c => c);
            if (cells.length > 0 && !cells[0].includes('-')) {
              text = cells.join(' | ');
            }
          }
          
          const splitText = pdf.splitTextToSize(text, maxWidth);
          pdf.text(splitText, margin, yPosition);
          yPosition += splitText.length * 4.5;
        }
      }
      
      // Guardar el PDF
      pdf.save('Dossier_Ejecutivo_C-Level_Ofiz.pdf');
      
      toast({
        title: "PDF generado exitosamente",
        description: `El dossier ejecutivo C-Level ha sido descargado (${pageNumber} páginas)`,
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