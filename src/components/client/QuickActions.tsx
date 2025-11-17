import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Calendar, MessageSquare, Heart, FileText, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Search,
      label: 'Buscar Profesionales',
      description: 'Encuentra expertos cerca de ti',
      onClick: () => navigate('/search-masters'),
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20'
    },
    {
      icon: Calendar,
      label: 'Mis Reservas',
      description: 'Ver servicios agendados',
      onClick: () => {}, // Scroll to bookings
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/20'
    },
    {
      icon: Heart,
      label: 'Favoritos',
      description: 'Profesionales guardados',
      onClick: () => {}, // Navigate to favorites tab
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/20'
    },
    {
      icon: MessageSquare,
      label: 'Mensajes',
      description: 'Chat con profesionales',
      onClick: () => {}, // Navigate to messages
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20'
    },
    {
      icon: FileText,
      label: 'Solicitudes',
      description: 'Mis cotizaciones',
      onClick: () => {}, // Navigate to requests
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20'
    },
    {
      icon: Award,
      label: 'Programa Fundador',
      description: 'Beneficios exclusivos',
      onClick: () => {}, // Navigate to founder
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/20'
    }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                className="h-auto flex flex-col items-center gap-2 p-4 hover:scale-105 transition-transform"
                onClick={action.onClick}
              >
                <div className={`${action.bgColor} ${action.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium">{action.label}</p>
                  <p className="text-[10px] text-muted-foreground hidden md:block">
                    {action.description}
                  </p>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
