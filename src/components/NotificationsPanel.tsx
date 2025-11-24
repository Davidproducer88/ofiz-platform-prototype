import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface NotificationsPanelProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const NotificationsPanel = ({ isOpen, onOpenChange }: NotificationsPanelProps) => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, clearReadNotifications } = useNotifications();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const getNotificationIcon = (type: Notification['type']) => {
    const iconMap = {
      booking_new: '📅',
      booking_accepted: '✅',
      booking_updated: '🔄',
      booking_completed: '✨',
      booking_cancelled: '❌',
      message_new: '💬',
      review_new: '⭐',
      application_new: '📋',
      application_accepted: '🎉'
    };
    return iconMap[type] || '🔔';
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Marcar como leída
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Determinar la ruta del dashboard según el tipo de usuario
    const dashboardRoute = profile?.user_type === 'master' 
      ? '/master-dashboard'
      : profile?.user_type === 'business'
      ? '/business-dashboard'
      : '/client-dashboard';

    // Navegar según el tipo de notificación
    if (notification.booking_id) {
      // Navegar al dashboard con el tab de bookings/reservas activo
      const tab = profile?.user_type === 'client' ? 'bookings' : 'bookings';
      navigate(`${dashboardRoute}?tab=${tab}`);
    } else if (notification.conversation_id) {
      // Navegar al dashboard con el tab de mensajes activo
      navigate(`${dashboardRoute}?tab=messages`);
    } else {
      // Navegación por defecto al dashboard
      navigate(dashboardRoute);
    }

    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: es
      });
    } catch {
      return 'Hace un momento';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones
              {unreadCount > 0 && (
                <Badge variant="secondary">{unreadCount} nuevas</Badge>
              )}
            </SheetTitle>
          </div>
        </SheetHeader>

        {/* Acciones rápidas */}
        <div className="flex gap-2 my-4">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex-1"
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Marcar todas
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearReadNotifications}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Limpiar leídas
          </Button>
        </div>

        <Separator className="my-4" />

        {/* Lista de notificaciones */}
        <ScrollArea className="h-[calc(100vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tienes notificaciones</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    !notification.read ? 'bg-primary/5 border-primary/20' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <div className="text-2xl shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{notification.title}</h4>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(notification.created_at)}
                        </span>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Marcar leída
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};