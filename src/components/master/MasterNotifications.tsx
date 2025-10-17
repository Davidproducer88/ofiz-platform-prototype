import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMasterNotifications } from "@/hooks/useMasterNotifications";
import { Bell, CheckCheck, Trash2, DollarSign, MessageSquare, Calendar, Star, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const MasterNotifications = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useMasterNotifications();

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, any> = {
      booking_new: Calendar,
      booking_accepted: CheckCheck,
      booking_updated: Calendar,
      booking_completed: CheckCheck,
      booking_cancelled: Calendar,
      message_new: MessageSquare,
      payment_released: DollarSign,
      review_new: Star,
      application_accepted: Briefcase,
      application_rejected: Briefcase
    };
    return icons[type] || Bell;
  };

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      booking_new: 'text-blue-500',
      booking_accepted: 'text-green-500',
      booking_completed: 'text-green-500',
      booking_cancelled: 'text-red-500',
      message_new: 'text-purple-500',
      payment_released: 'text-green-500',
      review_new: 'text-yellow-500',
      application_accepted: 'text-green-500',
      application_rejected: 'text-red-500'
    };
    return colors[type] || 'text-gray-500';
  };

  if (loading) {
    return <div>Cargando notificaciones...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notificaciones
          </h2>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todas leídas'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <CheckCheck className="h-4 w-4 mr-2" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas las Notificaciones</CardTitle>
          <CardDescription>
            Mantente al tanto de todas las actualizaciones importantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tienes notificaciones</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  const iconColor = getNotificationColor(notification.type);

                  return (
                    <Card 
                      key={notification.id}
                      className={`transition-all ${!notification.read ? 'bg-primary/5 border-primary/20' : ''}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full bg-background ${iconColor}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          
                          <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold">{notification.title}</p>
                                <p className="text-sm text-muted-foreground">{notification.message}</p>
                              </div>
                              {!notification.read && (
                                <Badge variant="default" className="ml-2">Nueva</Badge>
                              )}
                            </div>
                            
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(notification.created_at), "d MMM yyyy 'a las' HH:mm", { locale: es })}
                            </p>
                          </div>

                          <div className="flex gap-1">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => markAsRead(notification.id)}
                                title="Marcar como leída"
                              >
                                <CheckCheck className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteNotification(notification.id)}
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
