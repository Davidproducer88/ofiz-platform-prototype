import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gift, AlertCircle, CheckCircle2, Zap, Shield, CreditCard, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookingCheckoutBrick } from "./BookingCheckoutBrick";
import { PaymentCalculatorCard } from "./PaymentCalculatorCard";
import { cn } from "@/lib/utils";
import { calculatePayment, PaymentMethodType, formatPaymentMethod } from "@/utils/paymentCalculator";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  amount: number;
  title: string;
  description: string;
  availableCredits?: number;
  onSuccess?: () => void;
}

export const PaymentDialog = ({
  open,
  onOpenChange,
  bookingId,
  amount,
  title,
  description,
  availableCredits = 0,
  onSuccess,
}: PaymentDialogProps) => {
  const { profile } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentOption, setPaymentOption] = useState<'100' | '50'>('100');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('mp_cuenta_debito_prepaga_redes');

  // Calcular todos los valores usando el calculador central
  const calculation = calculatePayment({
    priceBase: amount,
    paymentType: paymentOption === '100' ? 'total' : 'partial',
    paymentMethod,
    accreditation: 'immediate',
    creditsAvailable: availableCredits
  });

  const finalAmount = calculation.upfrontAmount;
  const fullPaymentDiscount = calculation.fullPaymentDiscount;

  const handleStartPayment = async () => {
    if (!profile?.id) {
      toast.error("Debes iniciar sesión para realizar el pago");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Verificar booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('client_id, master_id')
        .eq('id', bookingId)
        .single();

      if (bookingError || !booking) {
        throw new Error('No se encontró la reserva');
      }

      if (booking.client_id !== profile.id) {
        throw new Error('No tienes permiso para pagar esta reserva');
      }

      // Si hay créditos, aplicarlos
      if (availableCredits > 0) {
        const { error: updateError } = await supabase
          .from('referral_credits')
          .update({ 
            used: true,
            used_in_booking_id: bookingId
          })
          .eq('user_id', profile.id)
          .eq('used', false);

        if (updateError) {
          throw new Error('Error al aplicar créditos');
        }

        toast.success(`Se aplicaron $${availableCredits.toLocaleString()} en créditos`);
      }

      // Si el pago se cubre 100% con créditos
      if (finalAmount === 0) {
        const paymentAmount = paymentOption === '100' ? amount - fullPaymentDiscount : amount * 0.5;
        const commissionAmount = paymentAmount * 0.05;
        const masterAmount = paymentAmount - commissionAmount;

        // Actualizar booking con información del pago
        const { error: bookingUpdateError } = await supabase
          .from('bookings')
          .update({
            status: 'confirmed',
            price_base: amount,
            platform_fee: calculation.platformFee,
            mp_fee_estimated: calculation.mpFee,
            payment_method_selected: paymentMethod,
            payment_type: calculation.paymentType,
            upfront_amount: calculation.upfrontAmount,
            pending_amount: calculation.pendingAmount,
            neto_profesional: calculation.netoProfesional
          })
          .eq('id', bookingId);

        if (bookingUpdateError) throw bookingUpdateError;

        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            booking_id: bookingId,
            client_id: booking.client_id,
            master_id: booking.master_id,
            amount: paymentAmount,
            commission_amount: commissionAmount,
            master_amount: masterAmount,
            status: 'approved',
            payment_method: 'credits',
            payment_percentage: paymentOption === '100' ? 100 : 50,
            remaining_amount: paymentOption === '50' ? amount * 0.5 : 0,
            is_partial_payment: paymentOption === '50',
            incentive_discount: fullPaymentDiscount,
            metadata: {
              paid_with_credits: true,
              credits_used: availableCredits,
              payment_option: paymentOption,
              payment_method_selected: paymentMethod,
              platform_fee: calculation.platformFee,
              mp_fee: calculation.mpFee,
              neto_profesional: calculation.netoProfesional
            }
          });

        if (paymentError) throw paymentError;

        toast.success('¡Pago completado con créditos!');
        onOpenChange(false);
        if (onSuccess) onSuccess();
        return;
      }

      // Mostrar formulario de pago
      setShowPaymentForm(true);
      setProcessing(false);

    } catch (err: any) {
      console.error('Payment error:', err);
      
      // Revertir créditos si hubo error
      if (availableCredits > 0) {
        await supabase
          .from('referral_credits')
          .update({ 
            used: false,
            used_in_booking_id: null
          })
          .eq('user_id', profile.id)
          .eq('used_in_booking_id', bookingId);
      }

      setError(err.message || 'Error al procesar el pago');
      toast.error(err.message || 'Error al procesar el pago');
      setProcessing(false);
    }
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    
    
    if (paymentData.status === 'approved') {
      toast.success('¡Pago aprobado exitosamente!');
      
      // Close dialog
      setTimeout(() => {
        onOpenChange(false);
        if (onSuccess) onSuccess();
      }, 1000);
    } else if (paymentData.status === 'pending' || paymentData.status === 'in_process') {
      toast('Pago pendiente', {
        description: 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.'
      });
      
      setTimeout(() => {
        onOpenChange(false);
        if (onSuccess) onSuccess();
      }, 2000);
    } else {
      toast.error('El pago no fue aprobado. Por favor intenta nuevamente.');
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    setError(error.message || 'Error al procesar el pago');
    setProcessing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">{title}</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">{description}</DialogDescription>
        </DialogHeader>

        {!showPaymentForm ? (
          <div className="space-y-4 py-4">
            {/* Selector de Método de Pago */}
            <div className="space-y-2">
              <Label htmlFor="payment-method" className="text-sm font-semibold">
                Medio de pago (a través de Mercado Pago) *
              </Label>
              <Select value={paymentMethod} onValueChange={(value: PaymentMethodType) => setPaymentMethod(value)}>
                <SelectTrigger id="payment-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp_cuenta_debito_prepaga_redes">
                    Dinero en cuenta, Débito, Prepaga y Redes de cobranza
                  </SelectItem>
                  <SelectItem value="mp_credito_1_cuota">
                    Tarjeta de crédito en una cuota
                  </SelectItem>
                  <SelectItem value="mp_credito_en_cuotas">
                    Tarjeta de crédito en cuotas
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Los pagos de Ofiz se realizan de forma segura a través de Mercado Pago
              </p>
            </div>

            <Separator />

            {/* Opciones de Pago */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Selecciona tu modalidad de pago:</h4>
              
              <RadioGroup value={paymentOption} onValueChange={(value: '100' | '50') => setPaymentOption(value)}>
                {/* Opción 100% - CON DESCUENTO */}
                <div className="relative">
                  <Label
                    htmlFor="option-100"
                    className={cn(
                      "flex flex-col gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                      paymentOption === '100' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="100" id="option-100" />
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">Pago Total (100%)</span>
                            <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                              <TrendingDown className="h-3 w-3 mr-1" />
                              5% OFF
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Paga el monto completo ahora y obtén descuento
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pl-9 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Zap className="h-4 w-4 text-secondary" />
                        <span>Confirmación inmediata</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-secondary" />
                        <span>Fondos retenidos hasta completar servicio</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="h-4 w-4 text-secondary" />
                        <span className="font-semibold text-secondary">Hasta 6 cuotas sin interés</span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground line-through">${amount.toLocaleString()}</span>
                          <span className="text-lg font-bold text-secondary">${(amount - fullPaymentDiscount).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Ahorras ${fullPaymentDiscount.toLocaleString()}</p>
                      </div>
                    </div>
                  </Label>
                </div>

                {/* Opción 50% - SIN DESCUENTO */}
                <div className="relative">
                  <Label
                    htmlFor="option-50"
                    className={cn(
                      "flex flex-col gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                      paymentOption === '50' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="50" id="option-50" />
                        <div className="flex flex-col gap-1">
                          <span className="font-bold">Pago Parcial (50%)</span>
                          <p className="text-sm text-muted-foreground">
                            Paga la mitad ahora, el resto al completar
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pl-9 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span>Fondos retenidos hasta completar servicio</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span>Hasta 3 cuotas por pago</span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Ahora:</span>
                          <span className="text-lg font-bold">${(amount * 0.5).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-muted-foreground">Al completar:</span>
                          <span className="text-sm text-muted-foreground">${(amount * 0.5).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            {/* Calculadora de pago detallada */}
            <PaymentCalculatorCard calculation={calculation} showForClient={true} />

            {paymentOption === '50' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Pagarás ${calculation.pendingAmount.toLocaleString()} adicionales al finalizar el servicio
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {finalAmount > 0 && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Completa el formulario de pago de forma segura con Mercado Pago
                </AlertDescription>
              </Alert>
            )}

            {/* Botones */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={processing}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleStartPayment}
                disabled={processing}
                className="flex-1"
              >
                {processing ? (
                  'Procesando...'
                ) : finalAmount === 0 ? (
                  <>
                    <Gift className="mr-2 h-4 w-4" />
                    Confirmar pago
                  </>
                ) : (
                  'Continuar al pago'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-4">
            <BookingCheckoutBrick
              amount={finalAmount}
              bookingId={bookingId}
              paymentPercentage={paymentOption === '100' ? 100 : 50}
              maxInstallments={paymentOption === '100' ? 6 : 3}
              incentiveDiscount={fullPaymentDiscount}
              paymentMethod={paymentMethod}
              calculation={calculation}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};