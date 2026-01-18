import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TypingUser {
  id: string;
  name: string;
  isTyping: boolean;
  lastTyped: number;
}

export const useTypingIndicator = (conversationId: string | undefined) => {
  const { profile } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // Clean up old typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => 
        prev.filter(user => now - user.lastTyped < 3000)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Set up presence channel
  useEffect(() => {
    if (!conversationId || !profile?.id) return;

    const channel = supabase.channel(`typing-${conversationId}`, {
      config: {
        presence: {
          key: profile.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: TypingUser[] = [];
        
        Object.entries(state).forEach(([key, presences]) => {
          if (key !== profile.id) {
            const presence = (presences as any[])[0];
            if (presence?.isTyping) {
              users.push({
                id: key,
                name: presence.name || 'Usuario',
                isTyping: true,
                lastTyped: presence.lastTyped || Date.now(),
              });
            }
          }
        });
        
        setTypingUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            isTyping: false,
            name: profile.full_name,
            lastTyped: Date.now(),
          });
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [conversationId, profile?.id, profile?.full_name]);

  const setTyping = useCallback(async (isTyping: boolean) => {
    if (!channelRef.current || !profile) return;
    
    // Prevent duplicate updates
    if (isTypingRef.current === isTyping) return;
    isTypingRef.current = isTyping;

    await channelRef.current.track({
      isTyping,
      name: profile.full_name,
      lastTyped: Date.now(),
    });
  }, [profile]);

  const startTyping = useCallback(() => {
    setTyping(true);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
    }, 3000);
  }, [setTyping]);

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setTyping(false);
  }, [setTyping]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    typingUsers,
    startTyping,
    stopTyping,
    isAnyoneTyping: typingUsers.length > 0,
  };
};
