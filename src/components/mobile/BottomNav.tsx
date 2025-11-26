import { Home, FileText, MessageSquare, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  userType: 'client' | 'master' | 'business' | 'admin';
}

export function BottomNav({ userType }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const getNavItems = () => {
    const basePath = userType === 'client' ? '/client-dashboard' 
      : userType === 'master' ? '/master-dashboard'
      : userType === 'business' ? '/business-dashboard'
      : '/admin-dashboard';

    if (userType === 'client') {
      return [
        { icon: Home, label: 'Inicio', path: `${basePath}?tab=home`, tab: 'home' },
        { icon: FileText, label: 'Solicitudes', path: `${basePath}?tab=requests`, tab: 'requests' },
        { icon: MessageSquare, label: 'Chat', path: `${basePath}?tab=chat`, tab: 'chat' },
        { icon: User, label: 'Perfil', path: `${basePath}?tab=profile`, tab: 'profile' },
      ];
    }
    
    // Para otros roles (futuro)
    return [
      { icon: Home, label: 'Inicio', path: basePath, tab: 'home' },
      { icon: FileText, label: 'Trabajos', path: `${basePath}?tab=bookings`, tab: 'bookings' },
      { icon: MessageSquare, label: 'Chat', path: `${basePath}?tab=chat`, tab: 'chat' },
      { icon: User, label: 'Perfil', path: `${basePath}?tab=profile`, tab: 'profile' },
    ];
  };

  const navItems = getNavItems();
  const currentTab = new URLSearchParams(location.search).get('tab') || 'home';

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.tab;
          
          return (
            <button
              key={item.tab}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
