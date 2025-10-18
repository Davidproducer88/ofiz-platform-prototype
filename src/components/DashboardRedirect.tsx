import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/**
 * Componente para redirigir automáticamente a los usuarios
 * al dashboard correcto según su rol
 */
export const DashboardRedirect = () => {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && profile) {
      const dashboardRoutes = {
        client: '/client-dashboard',
        master: '/master-dashboard',
        business: '/business-dashboard',
        admin: '/admin-dashboard'
      };

      const targetDashboard = dashboardRoutes[profile.user_type];
      if (targetDashboard) {
        navigate(targetDashboard, { replace: true });
      }
    }
  }, [profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Redirigiendo a tu dashboard...</p>
        </div>
      </div>
    );
  }

  return null;
};
