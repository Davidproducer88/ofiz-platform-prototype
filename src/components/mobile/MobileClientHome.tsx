import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Search, FileText, CheckCircle, Clock } from 'lucide-react';
import { SERVICE_CATEGORIES } from '@/lib/categories';

interface MobileClientHomeProps {
  stats: {
    activeRequests: number;
    completedBookings: number;
    pendingBookings: number;
  };
  onNewRequest: () => void;
  onSearchServices: () => void;
  onViewRequests: () => void;
}

export function MobileClientHome({
  stats,
  onNewRequest,
  onSearchServices,
  onViewRequests,
}: MobileClientHomeProps) {
  return (
    <div className="pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 -mx-4 -mt-4 mb-6">
        <h1 className="text-2xl font-bold mb-2">¡Hola! 👋</h1>
        <p className="text-muted-foreground mb-4">
          ¿Qué servicio necesitas hoy?
        </p>
        
        {/* CTA Principal */}
        <Button 
          size="lg" 
          className="w-full h-14 text-base font-semibold shadow-lg"
          onClick={onNewRequest}
        >
          <Plus className="mr-2 h-5 w-5" />
          Solicitar un servicio
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{stats.activeRequests}</div>
            <div className="text-xs text-muted-foreground">Solicitudes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">{stats.pendingBookings}</div>
            <div className="text-xs text-muted-foreground">Pendientes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{stats.completedBookings}</div>
            <div className="text-xs text-muted-foreground">Completados</div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones Rápidas */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Acciones rápidas</h2>
        <div className="grid gap-3">
          <Button 
            variant="outline" 
            className="h-14 justify-start text-left"
            onClick={onSearchServices}
          >
            <Search className="mr-3 h-5 w-5 text-primary" />
            <div>
              <div className="font-semibold">Buscar profesionales</div>
              <div className="text-xs text-muted-foreground">
                Encuentra el maestro ideal
              </div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-14 justify-start text-left"
            onClick={onViewRequests}
          >
            <FileText className="mr-3 h-5 w-5 text-primary" />
            <div>
              <div className="font-semibold">Ver mis solicitudes</div>
              <div className="text-xs text-muted-foreground">
                Revisa el estado de tus pedidos
              </div>
            </div>
          </Button>
        </div>
      </div>

      {/* Categorías Populares */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Categorías populares</h2>
        <div className="grid grid-cols-2 gap-3">
          {SERVICE_CATEGORIES.slice(0, 6).map((category) => {
            const Icon = category.icon;
            return (
              <Card 
                key={category.value}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={onSearchServices}
              >
                <CardContent className="p-4 text-center">
                  <Icon className={`h-8 w-8 mx-auto mb-2 ${category.color}`} />
                  <div className="font-medium text-sm">{category.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
