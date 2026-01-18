import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, User, Bell, Settings, LogOut, Menu, ChevronDown, PlayCircle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { smoothScrollTo, scrollToTop } from "@/utils/smoothScroll";
import { getDashboardRoute } from "@/utils/dashboardRedirect";
import logoOfiz from "@/assets/logo-ofiz-new.png";
interface HeaderProps {
  userType?: 'client' | 'master' | 'admin' | 'business' | null;
  userName?: string;
  onNotificationsClick?: () => void;
  onProfileClick?: () => void;
}
export const Header = ({
  userType,
  onNotificationsClick,
  onProfileClick
}: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const {
    profile,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogoClick = () => {
    if (location.pathname === '/') {
      scrollToTop();
    } else {
      navigate('/');
    }
  };

  // Safe navigation functions
  const navigateToClientDashboard = () => {
    if (profile?.user_type === 'client') {
      navigate('/client-dashboard');
    } else {
      navigate('/auth?type=client');
    }
  };
  const navigateToMasterDashboard = () => {
    if (profile?.user_type === 'master') {
      navigate('/master-dashboard');
    } else {
      navigate('/auth?type=master');
    }
  };
  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };
  const handleAuthAction = (action: 'login' | 'signup') => {
    navigate('/auth');
  };
  const getUserTypeLabel = () => {
    switch (userType) {
      case 'master':
        return 'Profesional';
      case 'client':
        return 'Cliente';
      case 'admin':
        return 'Admin';
      default:
        return 'Beta';
    }
  };
  return <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={handleLogoClick} className="flex items-center gap-2 hover:scale-105 transition-all duration-300">
            <img src={logoOfiz} alt="Ofiz - Plataforma de Servicios Profesionales" className="h-8 w-auto" />
          </button>
          <Badge variant="secondary" className="hidden lg:inline-flex shadow-soft whitespace-nowrap">
            {getUserTypeLabel()}
          </Badge>
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <div className="flex flex-col space-y-4 mt-8">
              
              {/* User Info & Logout for Mobile */}
              {profile && (
                <div className="p-4 bg-muted rounded-lg mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{profile.full_name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {getUserTypeLabel()}
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </div>
              )}

              <Accordion type="single" collapsible className="w-full">
                {/* Clientes */}
                <AccordionItem value="clientes">
                  <AccordionTrigger className="text-lg font-medium">
                    Clientes
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col space-y-3 pl-4">
                      <button onClick={() => {
                      navigate('/search-masters');
                      setIsMobileMenuOpen(false);
                    }} className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left">
                        Buscar Profesionales
                      </button>
              <button onClick={() => {
                      navigateToClientDashboard();
                      setIsMobileMenuOpen(false);
                    }} className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left">
                Publicar Encargo
              </button>
              <button onClick={() => {
                      navigate('/how-it-works');
                      setIsMobileMenuOpen(false);
                    }} className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left">
                Cómo Funciona
              </button>
              <button onClick={() => {
                      navigate('/pricing');
                      setIsMobileMenuOpen(false);
                    }} className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left">
                Precios y Tarifas
              </button>
              <button onClick={() => {
                      navigate('/guarantees');
                      setIsMobileMenuOpen(false);
                    }} className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left">
                Garantías
              </button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Profesionales */}
                <AccordionItem value="profesionales">
                  <AccordionTrigger className="text-lg font-medium">
                    Profesionales
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col space-y-3 pl-4">
              <button onClick={() => {
                      navigate('/auth?type=master');
                      setIsMobileMenuOpen(false);
                    }} className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left">
                Registrarse como Maestro
              </button>
              <button onClick={() => {
                      navigateToMasterDashboard();
                      setIsMobileMenuOpen(false);
                    }} className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left">
                Planes Premium
              </button>
              <button onClick={() => {
                      navigate('/help-center');
                      setIsMobileMenuOpen(false);
                    }} className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left">
                Centro de Ayuda
              </button>
              <button onClick={() => {
                      navigateToMasterDashboard();
                      setIsMobileMenuOpen(false);
                    }} className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left">
                Verificación de Perfil
              </button>
              <button onClick={() => {
                      navigateToMasterDashboard();
                      setIsMobileMenuOpen(false);
                    }} className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left">
                Herramientas
              </button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Empresas */}
                <AccordionItem value="empresas">
                  <AccordionTrigger className="text-lg font-medium">
                    Empresas
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col space-y-3 pl-4">
              <button onClick={() => {
                      navigate('/business-stats');
                      setIsMobileMenuOpen(false);
                    }} className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left">
                Estadísticas en Tiempo Real
              </button>
              <button onClick={() => {
                      navigate('/business-dashboard');
                      setIsMobileMenuOpen(false);
                    }} className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left">
                Dashboard Empresarial
              </button>
              <button onClick={() => {
                      navigate('/auth?type=business');
                      setIsMobileMenuOpen(false);
                    }} className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left">
                Registrarse como Empresa
              </button>
              <button onClick={() => {
                      navigate('/pricing');
                      setIsMobileMenuOpen(false);
                    }} className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left">
                Planes Empresariales
              </button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Sobre nosotros */}
                <AccordionItem value="empresa">
                  <AccordionTrigger className="text-lg font-medium">
                    Sobre nosotros
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col space-y-3 pl-4">
              <button onClick={() => {
                      navigate('/about');
                      setIsMobileMenuOpen(false);
                    }} className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left">
                Sobre Ofiz
              </button>
              <button onClick={() => {
                      navigate('/terms');
                      setIsMobileMenuOpen(false);
                    }} className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left">
                Términos y Condiciones
              </button>
              <button onClick={() => {
                      navigate('/privacy');
                      setIsMobileMenuOpen(false);
                    }} className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left">
                Política de Privacidad
              </button>
              <button onClick={() => {
                      navigate('/contact');
                      setIsMobileMenuOpen(false);
                    }} className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left">
                Contacto
              </button>
              <button onClick={() => {
                      navigate('/blog');
                      setIsMobileMenuOpen(false);
                    }} className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left">
                Blog
              </button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Demo Link in Mobile */}
              <button onClick={() => {
              navigate('/demo');
              setIsMobileMenuOpen(false);
            }} className="text-lg font-medium text-primary hover:text-primary/80 transition-smooth text-left flex items-center gap-2">
                <PlayCircle className="h-5 w-5" />
                Ver Demo Interactivo
              </button>

              {/* Dashboard links for logged in users */}
              {userType === 'master' && <button onClick={() => {
              navigate('/master-dashboard');
              setIsMobileMenuOpen(false);
            }} className="text-lg font-medium text-foreground hover:text-primary transition-smooth text-left">
                  Mi Dashboard
                </button>}
              {userType === 'client' && <button onClick={() => {
              navigate('/client-dashboard');
              setIsMobileMenuOpen(false);
            }} className="text-lg font-medium text-foreground hover:text-primary transition-smooth text-left">
                  Mi Dashboard
                </button>}
              {userType === 'business' && <button onClick={() => {
              navigate('/business-dashboard');
              setIsMobileMenuOpen(false);
            }} className="text-lg font-medium text-foreground hover:text-primary transition-smooth text-left">
                  Dashboard Empresarial
                </button>}
              {userType === 'admin' && <button onClick={() => {
              navigate('/admin-dashboard');
              setIsMobileMenuOpen(false);
            }} className="text-lg font-medium text-foreground hover:text-primary transition-smooth text-left">
                  Panel Admin
                </button>}
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {/* Quick Search Button */}
          

          {/* Clientes Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth">
              Clientes
              <ChevronDown className="ml-1 h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card border border-border z-50">
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/search-masters')}>
                Buscar Profesionales
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={navigateToClientDashboard}>
                Publicar Encargo
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/how-it-works')}>
                Cómo Funciona
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/pricing')}>
                Precios y Tarifas
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/guarantees')}>
                Garantías
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profesionales Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth">
              Profesionales
              <ChevronDown className="ml-1 h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card border border-border z-50">
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/auth?type=master')}>
                Registrarse como Maestro
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={navigateToMasterDashboard}>
                Planes Premium
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/help-center')}>
                Centro de Ayuda
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={navigateToMasterDashboard}>
                Verificación de Perfil
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={navigateToMasterDashboard}>
                Herramientas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Empresas Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth">
              Empresas
              <ChevronDown className="ml-1 h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card border border-border z-50">
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/business-stats')}>
                Estadísticas en Tiempo Real
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/business-dashboard')}>
                Dashboard Empresarial
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/auth?type=business')}>
                Registrarse como Empresa
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/pricing')}>
                Planes Empresariales
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sobre nosotros Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth">
              Sobre nosotros
              <ChevronDown className="ml-1 h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card border border-border z-50">
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/about')}>
                Sobre Ofiz
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/terms')}>
                Términos y Condiciones
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/privacy')}>
                Política de Privacidad
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/contact')}>
                Contacto
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/blog')}>
                Blog
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dashboard links for logged in users */}
          {userType === 'master' && <button onClick={() => navigate('/master-dashboard')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth">
              Mi Dashboard
            </button>}
          {userType === 'client' && <button onClick={() => navigate('/client-dashboard')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth">
              Mi Dashboard
            </button>}
          {userType === 'business' && <button onClick={() => navigate('/business-dashboard')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth">
              Dashboard Empresarial
            </button>}
          {userType === 'admin' && <button onClick={() => navigate('/admin-dashboard')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth">
              Panel Admin
            </button>}
        </nav>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {userType ? <>
              {/* Notifications */}
              <NotificationsPanel isOpen={notificationsOpen} onOpenChange={setNotificationsOpen} />

              {/* Visible Logout Button for Desktop */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="hidden md:flex items-center text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>

              {/* User menu */}
              <div className="relative">
                <Button variant="ghost" className="flex items-center space-x-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline-block">{profile?.full_name || 'Usuario'}</span>
                </Button>

                {isMenuOpen && <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-elegant py-1 z-10">
                    <button onClick={() => {
                const dashboardRoute = getDashboardRoute(userType!);
                navigate(`${dashboardRoute}?tab=profile`, { replace: false });
                setIsMenuOpen(false);
              }} className="flex items-center px-3 py-2 text-sm text-foreground hover:bg-muted w-full text-left">
                      <User className="mr-2 h-4 w-4" />
                      Mi Perfil
                    </button>
                    <button onClick={() => {
                const dashboardRoute = getDashboardRoute(userType!);
                navigate(dashboardRoute, { replace: false });
                setIsMenuOpen(false);
              }} className="flex items-center px-3 py-2 text-sm text-foreground hover:bg-muted w-full text-left">
                      <Settings className="mr-2 h-4 w-4" />
                      Mi Dashboard
                    </button>
                    <div className="border-t border-border my-1"></div>
                    <button onClick={handleSignOut} className="flex items-center px-3 py-2 text-sm text-destructive hover:bg-muted w-full text-left">
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </button>
                  </div>}
              </div>
            </> : null}
        </div>
      </div>
    </header>;
};