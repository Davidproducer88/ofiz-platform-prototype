import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PaymentMethodType, PaymentCalculation } from '@/utils/paymentCalculator';

interface BookingCheckoutBrickProps {
  amount: number;
  bookingId: string;
  paymentPercentage?: number;
  maxInstallments?: number;
  incentiveDiscount?: number;
  paymentMethod: PaymentMethodType;
  calculation: PaymentCalculation;
  onSuccess: (paymentData: any) => void;
  onError: (error: any) => void;
}

export const BookingCheckoutBrick = ({ 
  amount, 
  bookingId, 
  paymentPercentage = 100,
  maxInstallments = 6,
  incentiveDiscount = 0,
  paymentMethod,
  calculation,
  onSuccess, 
  onError 
}: BookingCheckoutBrickProps) => {
  const brickRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let scriptElement: HTMLScriptElement | null = null;
    
    const loadMercadoPago = async () => {
      try {
        setIsLoading(true);
        
        // Check if SDK is already loaded
        // @ts-ignore
        if (window.MercadoPago) {
          console.log('MercadoPago SDK already loaded');
          initializeBrick();
          return;
        }

        // Load MercadoPago SDK
        console.log('Loading MercadoPago SDK...');
        scriptElement = document.createElement('script');
        scriptElement.src = 'https://sdk.mercadopago.com/js/v2';
        scriptElement.async = true;
        
        scriptElement.onload = () => {
          console.log('MercadoPago SDK loaded successfully');
          initializeBrick();
        };

        scriptElement.onerror = () => {
          console.error('Failed to load MercadoPago SDK');
          toast.error('Error al cargar MercadoPago');
          onError(new Error('Failed to load MercadoPago SDK'));
          setIsLoading(false);
        };

        document.body.appendChild(scriptElement);
      } catch (error) {
        console.error('Error loading MercadoPago:', error);
        toast.error('Error al inicializar el pago');
        onError(error);
        setIsLoading(false);
      }
    };

    const initializeBrick = async () => {
      try {
        console.log('Initializing Payment Brick for booking:', bookingId);
        
        const container = document.getElementById('booking-mercadopago-brick');
        if (!container) {
          console.error('Container not found!');
          toast.error('Error: contenedor no encontrado');
          setIsLoading(false);
          return;
        }
        
        // @ts-ignore
        if (!window.MercadoPago) {
          console.error('MercadoPago SDK not loaded!');
          toast.error('SDK de MercadoPago no disponible');
          setIsLoading(false);
          return;
        }
        
        // @ts-ignore
        const mp = new window.MercadoPago('TEST-e3eeddeb-6fd7-4a45-ba8d-a487720f7fc1', {
          locale: 'es-UY',
          advancedFraudPrevention: false
        });

        const bricksBuilder = mp.bricks();

        // Destroy previous brick if exists
        if (brickRef.current) {
          try {
            await brickRef.current.unmount();
          } catch (unmountError) {
            console.warn('Error unmounting previous brick:', unmountError);
          }
        }

        console.log('Creating payment brick with amount:', amount);
        
        brickRef.current = await bricksBuilder.create('payment', 'booking-mercadopago-brick', {
          initialization: {
            amount: amount,
            payer: {
              email: ''
            }
          },
          customization: {
            visual: {
              style: {
                theme: 'default',
              },
            },
            paymentMethods: {
              creditCard: 'all',
              debitCard: 'all',
              maxInstallments: maxInstallments,
            },
          },
          callbacks: {
            onReady: () => {
              console.log('Payment Brick ready');
              setIsLoading(false);
              toast.success('Formulario de pago listo');
            },
            onSubmit: async (formData: any) => {
              return new Promise<void>(async (resolve, reject) => {
                console.log('=== PAYMENT FORM SUBMITTED ===');
                console.log('Form data received:', formData);
                
                try {
                  let paymentData = formData;
                  
                  if (formData.formData) {
                    paymentData = formData.formData;
                  }
                  
                  if (formData.selectedPaymentMethod) {
                    paymentData = { ...paymentData, ...formData };
                  }
                  
                  console.log('Processed payment data:', paymentData);
                  
                  const hasToken = paymentData.token || paymentData.card_token_id;
                  const hasPaymentMethod = paymentData.payment_method_id || paymentData.paymentMethodId;
                  
                  if (!hasToken && !hasPaymentMethod) {
                    console.error('Missing required payment data!', paymentData);
                    toast.error('Por favor completa todos los datos de pago');
                    reject(new Error('Datos incompletos'));
                    return;
                  }
                  
                  // Extract payment data
                  const paymentMethodId = paymentData.payment_method_id || paymentData.paymentMethodId;
                  const token = paymentData.token || paymentData.card_token_id;
                  const issuerId = paymentData.issuer_id || paymentData.issuerId;
                  const installments = paymentData.installments;
                  const payer = paymentData.payer;

                  console.log('Calling create-booking-payment edge function...');
                  toast('Procesando pago...', {
                    description: 'Espera mientras procesamos tu pago'
                  });

                  const { data, error } = await supabase.functions.invoke('create-booking-payment', {
                    body: {
                      bookingId,
                      paymentMethodId,
                      token,
                      issuerId,
                      installments,
                      payer,
                      paymentPercentage,
                      incentiveDiscount,
                      paymentMethod,
                      priceBase: calculation.priceBase,
                      platformFee: calculation.platformFee,
                      mpFee: calculation.mpFee,
                      netoProfesional: calculation.netoProfesional,
                      paymentType: calculation.paymentType
                    }
                  });

                  if (error) {
                    console.error('Error processing payment:', error);
                    throw new Error(error.message || 'Error al procesar el pago');
                  }

                  console.log('Payment processed successfully:', data);
                  await onSuccess(data);
                  resolve();
                } catch (error) {
                  console.error('Payment error:', error);
                  toast.error('Error al procesar el pago');
                  onError(error);
                  reject(error);
                }
              });
            },
            onError: (error: any) => {
              console.error('Brick error:', error);
              toast.error('Error al cargar el formulario de pago');
              onError(error);
              setIsLoading(false);
            },
          },
        });
      } catch (error) {
        console.error('Error initializing brick:', error);
        toast.error('Error al inicializar el formulario de pago');
        onError(error);
        setIsLoading(false);
      }
    };

    loadMercadoPago();

    return () => {
      if (brickRef.current) {
        console.log('Cleaning up Payment Brick');
        try {
          const unmountPromise = brickRef.current.unmount();
          if (unmountPromise && typeof unmountPromise.catch === 'function') {
            unmountPromise.catch((err: any) => {
              console.warn('Error unmounting brick:', err);
            });
          }
        } catch (err) {
          console.warn('Error during brick cleanup:', err);
        }
        brickRef.current = null;
      }
    };
  }, [amount, bookingId]);

  return (
    <div className="w-full space-y-4">
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-muted-foreground">Cargando formulario de pago...</p>
        </div>
      )}
      <div 
        id="booking-mercadopago-brick" 
        className={`min-h-[400px] ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity'}`}
      />
    </div>
  );
};