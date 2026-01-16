/**
 * Hook centralizado para gestión de pagos
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  getPaymentHistory,
  getEscrowPayments,
  getPaymentStats,
  getAvailableCredits,
  releaseEscrow,
  verifyPaymentStatus,
  manageSubscription,
  PaymentResult
} from '@/services/paymentService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PaymentStats {
  totalPaid: number;
  totalPending: number;
  totalEscrow: number;
  transactionCount: number;
}

interface UsePaymentsReturn {
  // Estado
  payments: any[];
  escrowPayments: any[];
  stats: PaymentStats;
  availableCredits: number;
  loading: boolean;
  
  // Acciones
  refreshPayments: () => Promise<void>;
  refreshCredits: () => Promise<void>;
  releaseEscrowFunds: (bookingId: string) => Promise<PaymentResult>;
  verifyPayment: (paymentId: string) => Promise<PaymentResult>;
  cancelSubscription: (params: { masterId?: string; businessId?: string; action: 'cancel' | 'cancel_end_of_period' | 'cancel_with_refund' }) => Promise<PaymentResult>;
}

export function usePayments(role: 'client' | 'master' = 'client'): UsePaymentsReturn {
  const { profile } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [escrowPayments, setEscrowPayments] = useState<any[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalPaid: 0,
    totalPending: 0,
    totalEscrow: 0,
    transactionCount: 0
  });
  const [availableCredits, setAvailableCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  const userId = profile?.id;

  // Cargar pagos
  const refreshPayments = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const [paymentData, statsData] = await Promise.all([
        getPaymentHistory(userId, role),
        getPaymentStats(userId, role)
      ]);
      
      setPayments(paymentData);
      setStats(statsData);
      
      // Solo cargar escrow para clientes
      if (role === 'client') {
        const escrowData = await getEscrowPayments(userId);
        setEscrowPayments(escrowData);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, role]);

  // Cargar créditos
  const refreshCredits = useCallback(async () => {
    if (!userId) return;
    
    try {
      const credits = await getAvailableCredits(userId);
      setAvailableCredits(credits);
    } catch (error) {
      console.error('Error loading credits:', error);
    }
  }, [userId]);

  // Liberar escrow
  const releaseEscrowFunds = useCallback(async (bookingId: string): Promise<PaymentResult> => {
    const result = await releaseEscrow({ bookingId });
    
    if (result.success) {
      toast.success('Fondos liberados exitosamente');
      await refreshPayments();
    } else {
      toast.error(result.error || 'Error al liberar fondos');
    }
    
    return result;
  }, [refreshPayments]);

  // Verificar pago
  const verifyPayment = useCallback(async (paymentId: string): Promise<PaymentResult> => {
    const result = await verifyPaymentStatus(paymentId);
    
    if (result.success && result.data?.updated) {
      toast.success('Estado del pago actualizado');
      await refreshPayments();
    }
    
    return result;
  }, [refreshPayments]);

  // Cancelar suscripción
  const cancelSubscription = useCallback(async (params: { 
    masterId?: string; 
    businessId?: string; 
    action: 'cancel' | 'cancel_end_of_period' | 'cancel_with_refund' 
  }): Promise<PaymentResult> => {
    const result = await manageSubscription(params);
    
    if (result.success) {
      const message = params.action === 'cancel_with_refund' 
        ? 'Suscripción cancelada con reembolso'
        : 'Suscripción cancelada';
      toast.success(message);
    } else {
      toast.error(result.error || 'Error al cancelar suscripción');
    }
    
    return result;
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    if (userId) {
      refreshPayments();
      refreshCredits();
    }
  }, [userId, refreshPayments, refreshCredits]);

  // Suscripción en tiempo real para pagos
  useEffect(() => {
    if (!userId) return;

    const column = role === 'client' ? 'client_id' : 'master_id';
    
    const subscription = supabase
      .channel('payments-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'payments',
        filter: `${column}=eq.${userId}`
      }, () => {
        refreshPayments();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, role, refreshPayments]);

  return {
    payments,
    escrowPayments,
    stats,
    availableCredits,
    loading,
    refreshPayments,
    refreshCredits,
    releaseEscrowFunds,
    verifyPayment,
    cancelSubscription
  };
}

/**
 * Hook para verificar si un pago existe para una reserva
 */
export function useBookingPayment(bookingId: string | null) {
  const [hasPayment, setHasPayment] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPayment = async () => {
      if (!bookingId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('booking_id', bookingId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          setHasPayment(true);
          setPaymentInfo(data);
        }
      } catch (error) {
        console.error('Error checking payment:', error);
      } finally {
        setLoading(false);
      }
    };

    checkPayment();
  }, [bookingId]);

  return { hasPayment, paymentInfo, loading };
}

/**
 * Hook para estadísticas de escrow (para maestros)
 */
export function useMasterEscrowStats(masterId: string | null) {
  const [stats, setStats] = useState({
    pending: 0,
    released: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!masterId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('payments')
          .select('master_amount, status, escrow_released_at')
          .eq('master_id', masterId)
          .eq('status', 'approved');

        if (error) throw error;

        const pending = data
          ?.filter(p => !p.escrow_released_at)
          .reduce((sum, p) => sum + Number(p.master_amount), 0) || 0;
          
        const released = data
          ?.filter(p => p.escrow_released_at)
          .reduce((sum, p) => sum + Number(p.master_amount), 0) || 0;

        setStats({
          pending,
          released,
          total: pending + released
        });
      } catch (error) {
        console.error('Error fetching escrow stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [masterId]);

  return { stats, loading };
}
