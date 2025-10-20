import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, CheckCircle, MessageSquare, Calendar, DollarSign, Star, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  booking_id?: string | null;
  conversation_id?: string | null;
  metadata?: any;
}

export function ClientNotifications() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    messages: true,
    bookings: true,
    payments: true,
    promotions: false,
  });
  const [savingPreferences, setSavingPreferences] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
    
    // Real-time subscription
    const channel = supabase
      .channel('client-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile?.id}`
        },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const fetchPreferences = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', profile.id)
        .single();

      if (error) throw error;

      // Por ahora usar localStorage hasta implementar campo en DB
      const saved = localStorage.getItem(`notif_prefs_${profile.id}`);
      if (saved) {
        setPreferences(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const updatePreference = async (key: keyof typeof preferences, value: boolean) => {
    if (!profile?.id) return;

    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);

    setSavingPreferences(true);
    try {
      // Guardar en localStorage (temporal hasta implementar en DB)
      localStorage.setItem(`notif_prefs_${profile.id}`, JSON.stringify(newPrefs));

      toast({
        title: "Preferencias guardadas",
        description: "Tus preferencias de notificación han sido actualizadas",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las preferencias",
        variant: "destructive",
      });
    } finally {
      setSavingPreferences(false);
    }
  };

  const fetchNotifications = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
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
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!profile?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', profile.id)
        .eq('read', false);

      if (error) throw error;
      
      toast({
        title: "Notificaciones marcadas",
        description: "Todas las notificaciones fueron marcadas como leídas",
      });
      
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: "Error",
        description: "No se pudieron marcar las notificaciones",
        variant: "destructive",
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking':
      case 'booking_confirmed':
      case 'booking_completed':
        return <Calendar className="h-4 w-4 text-primary" />;
      case 'message':
      case 'new_message':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'payment':
      case 'payment_completed':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'review':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { 
      addSuffix: true,
      locale: es 
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando notificaciones...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Centro de Notificaciones</h2>
          <p className="text-muted-foreground">
            Mantente al día con tus servicios y actividades
          </p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="default" className="text-sm">
            {unreadCount} sin leer
          </Badge>
        )}
      </div>

      {/* Notifications List */}
      <Card className="shadow-card">
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base md:text-lg">Notificaciones Recientes</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Todas tus actualizaciones y alertas importantes
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 sm:flex-none"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Marcar todas como leídas
            </Button>
          </div>

          <ScrollArea className="h-[400px] pr-4">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No tienes notificaciones</h3>
                <p className="text-muted-foreground">
                  Te notificaremos cuando haya novedades
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 md:p-4 border rounded-lg transition-colors hover:bg-muted/50 cursor-pointer ${
                      !notification.read ? 'bg-primary/5 border-primary/20' : 'bg-background'
                    }`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full shrink-0 ${
                        !notification.read ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-sm font-medium truncate">{notification.title}</h4>
                          {!notification.read && (
                            <Badge variant="default" className="shrink-0 text-xs">Nueva</Badge>
                          )}
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="shadow-card">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">Preferencias de Notificaciones</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Personaliza qué notificaciones quieres recibir
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="messages" className="text-sm font-medium">Nuevos Mensajes</Label>
              <p className="text-xs md:text-sm text-muted-foreground">Recibe alertas de mensajes nuevos</p>
            </div>
            <Switch 
              id="messages" 
              checked={preferences.messages}
              onCheckedChange={(value) => updatePreference('messages', value)}
              disabled={savingPreferences}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="bookings" className="text-sm font-medium">Estado de Encargos</Label>
              <p className="text-xs md:text-sm text-muted-foreground">Actualizaciones del estado de tus servicios</p>
            </div>
            <Switch 
              id="bookings" 
              checked={preferences.bookings}
              onCheckedChange={(value) => updatePreference('bookings', value)}
              disabled={savingPreferences}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="payments" className="text-sm font-medium">Pagos y Facturas</Label>
              <p className="text-xs md:text-sm text-muted-foreground">Notificaciones sobre pagos realizados</p>
            </div>
            <Switch 
              id="payments" 
              checked={preferences.payments}
              onCheckedChange={(value) => updatePreference('payments', value)}
              disabled={savingPreferences}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="promotions" className="text-sm font-medium">Ofertas y Promociones</Label>
              <p className="text-xs md:text-sm text-muted-foreground">Recibe ofertas especiales y promociones</p>
            </div>
            <Switch 
              id="promotions" 
              checked={preferences.promotions}
              onCheckedChange={(value) => updatePreference('promotions', value)}
              disabled={savingPreferences}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}