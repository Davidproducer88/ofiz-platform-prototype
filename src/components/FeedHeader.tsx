import { Search, Bell, MessageSquare, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

export const FeedHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full bg-card border-b border-border">
      <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-primary">OFIZ</h1>
          <span className="text-xs font-medium text-muted-foreground">OPEN FEED</span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar proyectos, profesionales, tutoriales..."
              className="pl-10 bg-background"
              aria-label="Buscar en el feed"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="relative"
            aria-label="Notificaciones"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            aria-label="Mensajes"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/dashboard')}
            aria-label="Perfil"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="px-4 pb-3 md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar..."
            className="pl-10 bg-background"
            aria-label="Buscar en el feed"
          />
        </div>
      </div>
    </header>
  );
};
