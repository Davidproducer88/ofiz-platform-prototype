import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getDashboardRoute } from "@/utils/dashboardRedirect";

export const UnauthorizedAccess = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleGoToDashboard = () => {
    if (profile) {
      const dashboardRoute = getDashboardRoute(profile.user_type);
      navigate(dashboardRoute);
    } else {
      navigate('/');
    }
  };

  const getUserTypeLabel = () => {
    if (!profile) return 'Usuario';
    
    const labels = {
      client: 'Cliente',
      master: 'Profesional',
      business: 'Empresa',
      admin: 'Administrador'
    };
    
    return labels[profile.user_type] || 'Usuario';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-destructive/10 to-muted/10">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Acceso No Autorizado</CardTitle>
          <CardDescription>
            No tienes permiso para acceder a esta sección
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Tu cuenta está registrada como <strong>{getUserTypeLabel()}</strong> y solo puedes acceder a las secciones correspondientes a tu tipo de cuenta.
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={handleGoToDashboard} className="w-full">
              Ir a Mi Dashboard
            </Button>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
              Volver al Inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
