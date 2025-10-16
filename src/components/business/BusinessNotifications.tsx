import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bell, BellOff, Check, Trash2, Mail, MessageSquare, FileText, TrendingUp } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BusinessNotificationsProps {
  businessId: string;
}

export const BusinessNotifications = ({ businessId }: BusinessNotificationsProps) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    newApplications: true,
    contractUpdates: true,
    adPerformance: true,
    subscriptionAlerts: true,
    emailNotifications: true
  });

  useEffect(() => {
    fetchNotifications();
    
    // Subscribe to real-time notifications
    const channel = supabase
      .channel('business-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${businessId}`
        },
        (payload) => {
          console.log('New notification:', payload);
          setNotifications(prev => [payload.new, ...prev]);
          
          // Show toast for new notification
          if (payload.new) {
            toast({
              title: payload.new.title,
              description: payload.new.message,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', businessId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las notificaciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', businessId)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      
      toast({
        title: "Notificaciones marcadas",
        description: "Todas las notificaciones han sido marcadas como leídas",
      });
    } catch (error: any) {
      console.error('Error marking all as read:', error);
      toast({
        title: "Error",
        description: "No se pudieron marcar las notificaciones",
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la notificación",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: { [key: string]: any } = {
      application_new: FileText,
      contract_update: MessageSquare,
      ad_performance: TrendingUp,
      subscription_alert: Bell,
      default: Mail
    };
    
    const Icon = icons[type] || icons.default;
    return <Icon className="h-4 w-4" />;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Cargando notificaciones...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notificaciones
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </h2>
          <p className="text-muted-foreground">
            Mantente informado de todas las novedades
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <Check className="h-4 w-4 mr-2" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {/* Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle>Preferencias de Notificación</CardTitle>
          <CardDescription>
            Configura qué notificaciones deseas recibir
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Nuevas Aplicaciones</Label>
              <p className="text-sm text-muted-foreground">
                Cuando recibas aplicaciones a tus contratos
              </p>
            </div>
            <Switch
              checked={preferences.newApplications}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, newApplications: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Actualizaciones de Contratos</Label>
              <p className="text-sm text-muted-foreground">
                Cambios de estado en tus proyectos
              </p>
            </div>
            <Switch
              checked={preferences.contractUpdates}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, contractUpdates: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Rendimiento de Anuncios</Label>
              <p className="text-sm text-muted-foreground">
                Alertas de rendimiento de tus campañas
              </p>
            </div>
            <Switch
              checked={preferences.adPerformance}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, adPerformance: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Alertas de Suscripción</Label>
              <p className="text-sm text-muted-foreground">
                Límites alcanzados y renovaciones
              </p>
            </div>
            <Switch
              checked={preferences.subscriptionAlerts}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, subscriptionAlerts: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificaciones por Email</Label>
              <p className="text-sm text-muted-foreground">
                Recibir notificaciones en tu correo
              </p>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, emailNotifications: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Todas las Notificaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tienes notificaciones</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                      !notification.read ? 'bg-primary/5 border-primary/20' : 'bg-background'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium">{notification.title}</p>
                        {!notification.read && (
                          <Badge variant="secondary" className="text-xs">
                            Nueva
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleDateString()} -{' '}
                        {new Date(notification.created_at).toLocaleTimeString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
