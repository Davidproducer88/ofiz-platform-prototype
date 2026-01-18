import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RealtimeChannel } from '@supabase/supabase-js';

interface BusinessNotification {
  id: string;
  type: 'application' | 'contract_update' | 'payment' | 'message';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  metadata?: any;
}

export const useBusinessNotifications = (businessId: string | undefined) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<BusinessNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!businessId) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', businessId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const mapped = (data || []).map(n => ({
        id: n.id,
        type: n.type as 'application' | 'contract_update' | 'payment' | 'message',
        title: n.title,
        message: n.message,
        read: n.read || false,
        created_at: n.created_at || new Date().toISOString(),
        metadata: n.metadata
      }));

      setNotifications(mapped);
      setUnreadCount(mapped.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!businessId) return;

    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', businessId)
        .eq('read', false);

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [businessId]);

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!businessId) return;

    fetchNotifications();

    // Subscribe to new notifications
    const channel: RealtimeChannel = supabase
      .channel(`business-notifications-${businessId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${businessId}`
        },
        (payload) => {
          const newNotification = payload.new as any;
          
          setNotifications(prev => [{
            id: newNotification.id,
            type: newNotification.type,
            title: newNotification.title,
            message: newNotification.message,
            read: false,
            created_at: newNotification.created_at,
            metadata: newNotification.metadata
          }, ...prev]);
          
          setUnreadCount(prev => prev + 1);

          // Show toast for new notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      )
      .subscribe();

    // Subscribe to contract applications
    const applicationsChannel: RealtimeChannel = supabase
      .channel(`business-applications-${businessId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'business_contract_applications'
        },
        async (payload) => {
          // Check if this application is for one of our contracts
          const application = payload.new as any;
          
          const { data: contract } = await supabase
            .from('business_contracts')
            .select('id, title')
            .eq('id', application.contract_id)
            .eq('business_id', businessId)
            .maybeSingle();

          if (contract) {
            // Create notification
            await supabase.from('notifications').insert({
              user_id: businessId,
              type: 'application',
              title: '¡Nueva aplicación recibida!',
              message: `Un profesional ha aplicado a tu proyecto "${contract.title}"`,
              metadata: {
                contract_id: contract.id,
                application_id: application.id,
                master_id: application.master_id
              }
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(applicationsChannel);
    };
  }, [businessId, fetchNotifications, toast]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications
  };
};
