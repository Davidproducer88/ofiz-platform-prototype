import { useState } from 'react';
import { Home, Search, Plus, MessageSquare, User, Menu, X, Briefcase, Calendar, DollarSign, Bell, Settings, Star, BarChart3, FileText, Award, Package } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface AppBottomNavProps {
  userType: 'client' | 'master' | 'business' | 'admin';
  userName?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  unreadNotifications?: number;
  onFabClick?: () => void;
}

export function AppBottomNav({ 
  userType, 
  userName = 'Usuario',
  avatarUrl,
  isVerified = false,
  unreadNotifications = 0,
  onFabClick
}: AppBottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const basePath = userType === 'client' ? '/client-dashboard' 
    : userType === 'master' ? '/master-dashboard'
    : userType === 'business' ? '/business-dashboard'
    : '/admin-dashboard';

  const currentTab = new URLSearchParams(location.search).get('tab') || 'home';

  const mainNavItems = [
    { icon: Home, label: 'Inicio', tab: 'home' },
    { icon: Search, label: 'Buscar', tab: 'job-requests' },
    { icon: MessageSquare, label: 'Chat', tab: 'messages', badge: unreadNotifications > 0 ? unreadNotifications : undefined },
    { icon: User, label: 'Perfil', tab: 'profile' },
  ];

  const drawerSections = [
    {
      title: 'Trabajo',
      items: [
        { icon: Briefcase, label: 'Mis Servicios', tab: 'services' },
        { icon: Calendar, label: 'Reservas', tab: 'bookings' },
        { icon: FileText, label: 'Propuestas', tab: 'applications' },
        { icon: Package, label: 'Contratos', tab: 'contracts' },
      ]
    },
    {
      title: 'Finanzas',
      items: [
        { icon: DollarSign, label: 'Finanzas', tab: 'finances' },
        { icon: BarChart3, label: 'Análisis', tab: 'analytics' },
      ]
    },
    {
      title: 'Cuenta',
      items: [
        { icon: Award, label: 'Mi Plan', tab: 'subscription' },
        { icon: Star, label: 'Reseñas', tab: 'reviews' },
        { icon: Bell, label: 'Notificaciones', tab: 'notifications' },
        { icon: Settings, label: 'Configuración', tab: 'profile' },
      ]
    }
  ];

  const handleNavigation = (tab: string) => {
    navigate(`${basePath}?tab=${tab}`);
  };

  const handleDrawerNavigation = (tab: string) => {
    setDrawerOpen(false);
    handleNavigation(tab);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={onFabClick}
        className="fab ios-press"
        aria-label="Agregar"
      >
        <Plus className="h-6 w-6 text-primary-foreground" />
      </button>

      {/* Bottom Navigation */}
      <nav className="bottom-nav-ios md:hidden">
        <div className="grid grid-cols-5 h-16">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.tab;
            
            return (
              <button
                key={item.tab}
                onClick={() => handleNavigation(item.tab)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 transition-all ios-press relative",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )}
              >
                <div className="relative">
                  <Icon className={cn(
                    "h-6 w-6 transition-all",
                    isActive && "scale-110"
                  )} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-all",
                  isActive && "font-semibold"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-1 w-1 h-1 bg-primary rounded-full" />
                )}
              </button>
            );
          })}

          {/* Menu/Drawer Trigger */}
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground ios-press">
                <Menu className="h-6 w-6" />
                <span className="text-[10px] font-medium">Más</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-0 glass-ios">
              {/* Drawer Header */}
              <div className="p-6 pb-4 bg-gradient-primary">
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14 border-2 border-primary-foreground/30">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-lg font-bold">
                      {userName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary-foreground text-lg">{userName}</h3>
                    {isVerified && (
                      <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground text-xs mt-1">
                        <Award className="h-3 w-3 mr-1" />
                        Verificado
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Drawer Sections */}
              <div className="flex-1 overflow-y-auto py-2">
                {drawerSections.map((section, idx) => (
                  <div key={section.title}>
                    <h4 className="section-header-ios bg-muted/50">{section.title}</h4>
                    <div>
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentTab === item.tab;
                        return (
                          <button
                            key={item.tab}
                            onClick={() => handleDrawerNavigation(item.tab)}
                            className={cn(
                              "list-item-ios w-full",
                              isActive && "bg-primary/5 text-primary"
                            )}
                          >
                            <Icon className="h-5 w-5" />
                            <span className="flex-1 text-left font-medium">{item.label}</span>
                            {isActive && (
                              <div className="h-2 w-2 bg-primary rounded-full" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-border/50">
                <button 
                  onClick={() => {
                    setDrawerOpen(false);
                    navigate('/');
                  }}
                  className="w-full py-3 text-center text-muted-foreground text-sm font-medium ios-press rounded-lg hover:bg-muted"
                >
                  Volver al Inicio
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </>
  );
}