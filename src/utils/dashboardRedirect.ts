/**
 * Obtiene la ruta del dashboard correspondiente según el tipo de usuario
 */
export const getDashboardRoute = (userType: 'client' | 'master' | 'admin' | 'business'): string => {
  const dashboardRoutes = {
    client: '/client-dashboard',
    master: '/master-dashboard',
    business: '/business-dashboard',
    admin: '/admin-dashboard'
  };

  return dashboardRoutes[userType] || '/';
};

/**
 * Verifica si un usuario tiene acceso a una ruta específica
 */
export const hasAccessToRoute = (
  userType: 'client' | 'master' | 'admin' | 'business',
  route: string
): boolean => {
  const publicRoutes = [
    '/',
    '/auth',
    '/auth/callback',
    '/search-masters',
    '/how-it-works',
    '/pricing',
    '/guarantees',
    '/help-center',
    '/about',
    '/terms',
    '/privacy',
    '/contact',
    '/blog'
  ];

  // Rutas públicas son accesibles para todos
  if (publicRoutes.includes(route)) {
    return true;
  }

  // Dashboard routes - solo accesibles para el tipo de usuario correcto
  const dashboardAccess = {
    '/client-dashboard': ['client'],
    '/master-dashboard': ['master'],
    '/business-dashboard': ['business'],
    '/admin-dashboard': ['admin'],
    '/admin/login': ['admin'] // Solo admins pueden ver el login
  };

  const allowedRoles = dashboardAccess[route as keyof typeof dashboardAccess];
  
  if (allowedRoles) {
    return allowedRoles.includes(userType);
  }

  // Por defecto, si no está en la lista, permitir acceso
  return true;
};
