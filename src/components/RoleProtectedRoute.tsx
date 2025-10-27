import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('client' | 'master' | 'admin' | 'business')[];
  redirectTo?: string;
}

export const RoleProtectedRoute = ({ 
  children, 
  allowedRoles,
  redirectTo 
}: RoleProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  
  console.log('[RoleProtectedRoute]', {
    loading,
    hasUser: !!user,
    profile: profile?.user_type,
    allowedRoles
  });
  
  if (loading) {
    console.log('[RoleProtectedRoute] Loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Verificando permisos...</p>
        </div>
      </div>
    );
  }
  
  // Si no está autenticado, redirigir a login
  if (!user) {
    console.log('[RoleProtectedRoute] No user, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  // Verificar verificación de email si es necesario
  if (user && !user.email_confirmed_at && profile?.login_provider === 'email') {
    console.log('[RoleProtectedRoute] Email not verified, redirecting');
    const verificationUrl = `/auth?message=verify-email&email=${encodeURIComponent(user.email || '')}`;
    return <Navigate to={verificationUrl} replace />;
  }
  
  // Si el usuario no tiene el rol permitido
  if (profile && !allowedRoles.includes(profile.user_type)) {
    console.log('[RoleProtectedRoute] Wrong role:', profile.user_type, 'allowed:', allowedRoles);
    // Redirigir al dashboard correcto según su rol
    const dashboardRoutes = {
      client: '/client-dashboard',
      master: '/master-dashboard',
      business: '/business-dashboard',
      admin: '/admin-dashboard'
    };
    
    const userDashboard = dashboardRoutes[profile.user_type];
    return <Navigate to={redirectTo || userDashboard || '/'} replace />;
  }
  
  console.log('[RoleProtectedRoute] Access granted, rendering children');
  return <>{children}</>;
};
