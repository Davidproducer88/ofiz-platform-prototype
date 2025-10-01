import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, User, Bell, Settings, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface HeaderProps {
  userType?: 'client' | 'master' | 'admin' | null;
  userName?: string;
}

export const Header = ({ userType }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  const handleAuthAction = (action: 'login' | 'signup') => {
    navigate('/auth');
  };

  const getUserTypeLabel = () => {
    switch (userType) {
      case 'master': return 'Profesional';
      case 'client': return 'Cliente';
      case 'admin': return 'Admin';
      default: return 'Beta';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/')}
            className="text-2xl font-bold gradient-text cursor-pointer hover:opacity-80 transition-smooth"
          >
            Ofiz
          </button>
          <Badge variant="secondary" className="hidden md:inline-flex">
            {getUserTypeLabel()}
          </Badge>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <button 
            onClick={() => navigate('/')}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
          >
            Inicio
          </button>
          {userType === 'master' && (
            <button 
              onClick={() => navigate('/dashboard/master')}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
            >
              Mi Dashboard
            </button>
          )}
          {userType === 'client' && (
            <button 
              onClick={() => navigate('/dashboard/client')}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
            >
              Mi Dashboard
            </button>
          )}
          {userType === 'admin' && (
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
            >
              Panel Admin
            </button>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {userType ? (
            <>
              {/* Search */}
              <Button variant="ghost" size="icon">
                <Search className="h-4 w-4" />
              </Button>
              
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-accent rounded-full animate-pulse"></div>
              </Button>

              {/* User menu */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  className="flex items-center space-x-2"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline-block">{profile?.full_name || 'Usuario'}</span>
                </Button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-elegant py-1 z-10">
                    <button 
                      onClick={() => {
                        if (userType === 'client') navigate('/dashboard/client');
                        else if (userType === 'master') navigate('/dashboard/master');
                        else if (userType === 'admin') navigate('/admin/dashboard');
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center px-3 py-2 text-sm text-foreground hover:bg-muted w-full text-left"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Mi Dashboard
                    </button>
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center px-3 py-2 text-sm text-foreground hover:bg-muted w-full text-left"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Configuración
                    </button>
                    <div className="border-t border-border my-1"></div>
                    <button 
                      onClick={handleSignOut}
                      className="flex items-center px-3 py-2 text-sm text-destructive hover:bg-muted w-full text-left"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
};