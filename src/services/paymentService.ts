/**
 * SERVICIO CENTRAL DE PAGOS - OFIZ
 * 
 * Este servicio centraliza toda la lógica de pagos de la plataforma:
 * - Pagos de reservas (bookings)
 * - Pagos de marketplace
 * - Pagos de contratos empresariales
 * - Suscripciones (maestros y empresas)
 * - Sistema de escrow
 * - Reembolsos
 * 
 * Integración: MercadoPago (Chile/Uruguay)
 */

import { supabase } from '@/integrations/supabase/client';
import { 
  calculatePayment, 
  PaymentMethodType, 
  PaymentCalculation,
  PLATFORM_FEE,
  FULL_PAYMENT_DISCOUNT
} from '@/utils/paymentCalculator';

// ============ TIPOS ============

export interface PaymentResult {
  success: boolean;
  paymentId?: string | number;
  status?: string;
  statusDetail?: string;
  error?: string;
  data?: any;
}

export interface BookingPaymentParams {
  bookingId: string;
  amount: number;
  paymentType: 'total' | 'partial';
  paymentMethod: PaymentMethodType;
  availableCredits?: number;
}

export interface MarketplacePaymentParams {
  orderId: string;
  amount: number;
}

export interface ContractPaymentParams {
  applicationId: string;
  amount: number;
}

export interface SubscriptionPaymentParams {
  planId: string;
  planName: string;
  price: number;
  isFounder?: boolean;
  type: 'master' | 'business';
}

export interface RefundParams {
  paymentId: string;
  reason: string;
  amount?: number; // Si no se especifica, reembolso total
}

export interface EscrowReleaseParams {
  bookingId: string;
}

// ============ CONSTANTES ============

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  RELEASED: 'released',
  REJECTED: 'rejected',
  REFUNDED: 'refunded',
} as const;

export const PAYMENT_TYPES = {
  BOOKING: 'booking',
  MARKETPLACE: 'marketplace',
  CONTRACT: 'contract',
  SUBSCRIPTION_MASTER: 'master_subscription',
  SUBSCRIPTION_BUSINESS: 'business_subscription',
} as const;

// ============ FUNCIONES DE PAGO ============

/**
 * Verificar estado de pago con MercadoPago
 */
export async function verifyPaymentStatus(paymentId: string): Promise<PaymentResult> {
  try {
    const { data, error } = await supabase.functions.invoke('verify-payment-status', {
      body: { paymentId }
    });

    if (error) throw error;

    return {
      success: true,
      paymentId,
      status: data.local_status,
      data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error al verificar el estado del pago'
    };
  }
}

/**
 * Liberar fondos de escrow al profesional
 */
export async function releaseEscrow(params: EscrowReleaseParams): Promise<PaymentResult> {
  try {
    const { data, error } = await supabase.functions.invoke('release-escrow', {
      body: { bookingId: params.bookingId }
    });

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error al liberar los fondos'
    };
  }
}

/**
 * Obtener créditos disponibles del usuario
 */
export async function getAvailableCredits(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('referral_credits')
      .select('amount')
      .eq('user_id', userId)
      .eq('used', false);

    if (error) throw error;

    return data?.reduce((sum, credit) => sum + Number(credit.amount), 0) || 0;
  } catch (error) {
    console.error('Error fetching credits:', error);
    return 0;
  }
}

/**
 * Aplicar créditos a una reserva
 */
export async function applyCredits(
  userId: string, 
  bookingId: string, 
  amount: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('referral_credits')
      .update({ 
        used: true,
        used_in_booking_id: bookingId
      })
      .eq('user_id', userId)
      .eq('used', false)
      .limit(Math.ceil(amount / 100)); // Asumiendo créditos de ~100

    return !error;
  } catch (error) {
    console.error('Error applying credits:', error);
    return false;
  }
}

/**
 * Revertir créditos aplicados (en caso de error)
 */
export async function revertCredits(userId: string, bookingId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('referral_credits')
      .update({ 
        used: false,
        used_in_booking_id: null
      })
      .eq('user_id', userId)
      .eq('used_in_booking_id', bookingId);

    return !error;
  } catch (error) {
    console.error('Error reverting credits:', error);
    return false;
  }
}

/**
 * Obtener historial de pagos del usuario
 */
export async function getPaymentHistory(userId: string, role: 'client' | 'master'): Promise<any[]> {
  try {
    const column = role === 'client' ? 'client_id' : 'master_id';
    
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        bookings(
          id,
          scheduled_date,
          services(title, category)
        )
      `)
      .eq(column, userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return [];
  }
}

/**
 * Obtener pagos en escrow pendientes de liberación
 */
export async function getEscrowPayments(clientId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        bookings!inner(
          id,
          status,
          scheduled_date,
          client_confirmed_at,
          services(title, category),
          masters(business_name)
        )
      `)
      .eq('client_id', clientId)
      .eq('status', 'approved')
      .is('escrow_released_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching escrow payments:', error);
    return [];
  }
}

/**
 * Calcular estadísticas de pagos para un usuario
 */
export async function getPaymentStats(userId: string, role: 'client' | 'master'): Promise<{
  totalPaid: number;
  totalPending: number;
  totalEscrow: number;
  transactionCount: number;
}> {
  try {
    const column = role === 'client' ? 'client_id' : 'master_id';
    
    const { data, error } = await supabase
      .from('payments')
      .select('amount, status, escrow_released_at')
      .eq(column, userId);

    if (error) throw error;

    const stats = {
      totalPaid: 0,
      totalPending: 0,
      totalEscrow: 0,
      transactionCount: data?.length || 0
    };

    data?.forEach(payment => {
      const amount = Number(payment.amount);
      if (payment.status === 'approved') {
        if (payment.escrow_released_at) {
          stats.totalPaid += amount;
        } else {
          stats.totalEscrow += amount;
        }
      } else if (payment.status === 'pending') {
        stats.totalPending += amount;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error calculating payment stats:', error);
    return {
      totalPaid: 0,
      totalPending: 0,
      totalEscrow: 0,
      transactionCount: 0
    };
  }
}

/**
 * Gestionar suscripción (cancelar, reactivar, cambiar plan)
 */
export async function manageSubscription(params: {
  action: 'cancel' | 'cancel_end_of_period' | 'cancel_with_refund' | 'reactivate' | 'change_plan';
  masterId?: string;
  businessId?: string;
  newPlan?: string;
}): Promise<PaymentResult> {
  try {
    const { data, error } = await supabase.functions.invoke('manage-user-subscription', {
      body: params
    });

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error al gestionar la suscripción'
    };
  }
}

// ============ HELPERS ============

/**
 * Formatear monto para display
 */
export function formatAmount(amount: number, currency: string = 'UYU'): string {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Obtener mensaje de error amigable según código de MercadoPago
 */
export function getPaymentErrorMessage(statusDetail: string): string {
  const errorMessages: Record<string, string> = {
    'cc_rejected_insufficient_amount': 'Fondos insuficientes en la tarjeta',
    'cc_rejected_bad_filled_card_number': 'Número de tarjeta incorrecto',
    'cc_rejected_bad_filled_date': 'Fecha de vencimiento incorrecta',
    'cc_rejected_bad_filled_security_code': 'Código de seguridad incorrecto',
    'cc_rejected_card_disabled': 'Tarjeta deshabilitada - contacta a tu banco',
    'cc_rejected_max_attempts': 'Límite de intentos alcanzado - intenta más tarde',
    'cc_rejected_duplicated_payment': 'Ya procesaste este pago recientemente',
    'cc_rejected_call_for_authorize': 'Debes autorizar el pago con tu banco',
    'cc_rejected_high_risk': 'Pago rechazado por seguridad',
    'cc_rejected_blacklist': 'Tarjeta no permitida',
    'cc_rejected_other_reason': 'El pago fue rechazado - intenta con otra tarjeta',
  };
  
  return errorMessages[statusDetail] || 'El pago fue rechazado. Por favor intenta con otra tarjeta.';
}

/**
 * Validar que un booking puede ser pagado
 */
export async function validateBookingForPayment(
  bookingId: string, 
  userId: string
): Promise<{ valid: boolean; error?: string; booking?: any }> {
  try {
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('id, client_id, master_id, status, total_price')
      .eq('id', bookingId)
      .single();

    if (error || !booking) {
      return { valid: false, error: 'Reserva no encontrada' };
    }

    if (booking.client_id !== userId) {
      return { valid: false, error: 'No tienes permiso para pagar esta reserva' };
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return { valid: false, error: 'Esta reserva no puede ser pagada' };
    }

    return { valid: true, booking };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
}

// Re-exportar utilidades del calculador
export { 
  calculatePayment, 
  PLATFORM_FEE,
  FULL_PAYMENT_DISCOUNT
} from '@/utils/paymentCalculator';

export type { PaymentMethodType, PaymentCalculation } from '@/utils/paymentCalculator';
