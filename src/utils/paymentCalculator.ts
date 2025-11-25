// Constantes globales del sistema de pagos
export const PLATFORM_FEE = 0.05; // 5% comisión Ofiz

// Tarifas de Mercado Pago según método y plazo de acreditación
export const MP_FEES = {
  immediate: {
    debit: 0.025,           // 2.5% - Débito, prepaga, redes (0 días)
    credit_one: 0.053,      // 5.3% - Crédito 1 cuota (0 días)
    credit_installments: 0.0779  // 7.79% - Crédito en cuotas (0 días)
  },
  delayed21: {
    debit: 0.019,           // 1.9% - Débito, prepaga, redes (21 días)
    credit_one: 0.044,      // 4.4% - Crédito 1 cuota (21 días)
    credit_installments: 0.0689  // 6.89% - Crédito en cuotas (21 días)
  }
};

// Tipos de métodos de pago según propuesta comercial MP
export type PaymentMethodType = 
  | 'mp_cuenta_debito_prepaga_redes'  // Dinero en cuenta, Débito, Prepaga y Redes
  | 'mp_credito_1_cuota'               // Tarjeta de crédito en una cuota
  | 'mp_credito_en_cuotas';            // Tarjeta de crédito en cuotas

export type AccreditationType = 'immediate' | 'delayed21';

// Descuento por pago total
export const FULL_PAYMENT_DISCOUNT = 0.05; // 5% OFF

/**
 * Obtener la tarifa de MP según el método de pago y acreditación
 */
export function getMPFee(
  paymentMethod: PaymentMethodType, 
  accreditation: AccreditationType = 'immediate'
): number {
  const fees = MP_FEES[accreditation];
  
  switch (paymentMethod) {
    case 'mp_cuenta_debito_prepaga_redes':
      return fees.debit;
    case 'mp_credito_1_cuota':
      return fees.credit_one;
    case 'mp_credito_en_cuotas':
      return fees.credit_installments;
    default:
      return fees.debit; // Por defecto, el más bajo
  }
}

/**
 * Calcular todos los montos del pago
 */
export interface PaymentCalculation {
  priceBase: number;
  paymentType: 'total' | 'partial';
  paymentMethod: PaymentMethodType;
  accreditation: AccreditationType;
  
  // Descuentos
  fullPaymentDiscount: number;
  creditsApplied: number;
  
  // Montos a pagar
  upfrontAmount: number;      // Lo que paga el cliente ahora
  pendingAmount: number;       // Lo que pagará después (si es parcial)
  totalToPay: number;          // Total después de descuentos
  
  // Comisiones (descontadas al profesional)
  platformFee: number;         // 5% Ofiz
  mpFee: number;               // Variable según método MP
  totalFees: number;           // Suma de ambas
  
  // Lo que recibe el profesional
  netoProfesional: number;
}

/**
 * Calcula todos los valores del pago
 */
export function calculatePayment(params: {
  priceBase: number;
  paymentType: 'total' | 'partial';
  paymentMethod: PaymentMethodType;
  accreditation?: AccreditationType;
  creditsAvailable?: number;
}): PaymentCalculation {
  const {
    priceBase,
    paymentType,
    paymentMethod,
    accreditation = 'immediate',
    creditsAvailable = 0
  } = params;

  // Calcular descuento por pago total
  const fullPaymentDiscount = paymentType === 'total' 
    ? priceBase * FULL_PAYMENT_DISCOUNT 
    : 0;

  // Precio después del descuento
  const priceAfterDiscount = priceBase - fullPaymentDiscount;

  // Monto que se paga ahora
  const upfrontBeforeCredits = paymentType === 'total' 
    ? priceAfterDiscount 
    : priceAfterDiscount * 0.5;

  // Aplicar créditos
  const creditsApplied = Math.min(creditsAvailable, upfrontBeforeCredits);
  const upfrontAmount = upfrontBeforeCredits - creditsApplied;

  // Monto pendiente (solo para pago parcial)
  const pendingAmount = paymentType === 'partial' 
    ? priceAfterDiscount * 0.5 
    : 0;

  // Total a pagar (ahora + después)
  const totalToPay = upfrontAmount + pendingAmount;

  // Comisiones (se calculan sobre el precio base antes de descuentos)
  const platformFee = priceBase * PLATFORM_FEE;
  const mpFeeRate = getMPFee(paymentMethod, accreditation);
  const mpFee = priceBase * mpFeeRate;
  const totalFees = platformFee + mpFee;

  // Lo que recibe el profesional (precio base - comisiones)
  const netoProfesional = priceBase - totalFees;

  return {
    priceBase,
    paymentType,
    paymentMethod,
    accreditation,
    fullPaymentDiscount,
    creditsApplied,
    upfrontAmount,
    pendingAmount,
    totalToPay,
    platformFee,
    mpFee,
    totalFees,
    netoProfesional
  };
}

/**
 * Formatear método de pago para mostrar en UI
 */
export function formatPaymentMethod(method: PaymentMethodType): string {
  switch (method) {
    case 'mp_cuenta_debito_prepaga_redes':
      return 'Dinero en cuenta, Débito, Prepaga y Redes de cobranza';
    case 'mp_credito_1_cuota':
      return 'Tarjeta de crédito en una cuota';
    case 'mp_credito_en_cuotas':
      return 'Tarjeta de crédito en cuotas';
    default:
      return 'Método no especificado';
  }
}

/**
 * Obtener cuotas máximas según método y tipo de pago
 */
export function getMaxInstallments(
  paymentMethod: PaymentMethodType,
  paymentType: 'total' | 'partial'
): number {
  if (paymentMethod === 'mp_credito_en_cuotas') {
    return paymentType === 'total' ? 6 : 3;
  }
  return 1;
}

/**
 * Validar que el método de pago es válido
 */
export function isValidPaymentMethod(method: string): method is PaymentMethodType {
  return [
    'mp_cuenta_debito_prepaga_redes',
    'mp_credito_1_cuota',
    'mp_credito_en_cuotas'
  ].includes(method);
}
