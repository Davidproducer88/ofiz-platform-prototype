import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface MasterSubscriptionCheckoutBrickProps {
  amount: number;
  planId: string;
  planName: string;
  applicationsLimit: number;
  isFeatured: boolean;
  onSuccess: (paymentData: any) => void;
  onError: (error: any) => void;
}

export const MasterSubscriptionCheckoutBrick = ({ 
  amount, 
  planId, 
  planName, 
  applicationsLimit, 
  isFeatured,
  onSuccess, 
  onError 
}: MasterSubscriptionCheckoutBrickProps) => {
  const brickRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Evitar inicialización duplicada
    if (isInitializedRef.current) return;
    
    let scriptElement: HTMLScriptElement | null = null;
    
    const loadMercadoPago = async () => {
      try {
        setIsLoading(true);
        
        // @ts-ignore
        if (window.MercadoPago) {
          console.log('MercadoPago SDK already loaded');
          await initializeBrick();
          return;
        }

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
        // Verificar si ya está inicializado
        if (brickRef.current) {
          console.log('Brick already exists, skipping initialization');
          return;
        }
        
        console.log('Initializing Payment Brick for subscription:', planId);
        
        const container = document.getElementById('master-subscription-mercadopago-brick');
        if (!container) {
          console.error('Container not found!');
          toast.error('Error: contenedor no encontrado');
          setIsLoading(false);
          return;
        }

        // Limpiar el contenedor antes de crear el brick
        container.innerHTML = '';
        
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

        console.log('Creating payment brick with amount:', amount);
        
        isInitializedRef.current = true;
        
        brickRef.current = await bricksBuilder.create('payment', 'master-subscription-mercadopago-brick', {
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
              maxInstallments: 12,
            },
          },
          callbacks: {
            onReady: () => {
              console.log('Payment Brick ready');
              setIsLoading(false);
            },
            onSubmit: async (formData: any) => {
              return new Promise<void>(async (resolve, reject) => {
                console.log('=== SUBSCRIPTION PAYMENT FORM SUBMITTED ===');
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
                  
                  const paymentMethodId = paymentData.payment_method_id || paymentData.paymentMethodId;
                  const token = paymentData.token || paymentData.card_token_id;
                  const issuerId = paymentData.issuer_id || paymentData.issuerId;
                  const installments = paymentData.installments;
                  const payer = paymentData.payer;

                  console.log('Calling create-master-subscription-payment edge function...');
                  toast('Procesando pago...', {
                    description: 'Espera mientras procesamos tu suscripción'
                  });

                  const { data, error } = await supabase.functions.invoke('create-master-subscription-payment', {
                    body: {
                      planId,
                      planName,
                      price: amount,
                      applicationsLimit,
                      isFeatured,
                      paymentMethodId,
                      token,
                      issuerId,
                      installments,
                      payer
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
        isInitializedRef.current = false;
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
      isInitializedRef.current = false;
    };
  }, []);

  return (
    <div className="w-full space-y-4">
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-muted-foreground">Cargando formulario de pago...</p>
        </div>
      )}
      <div 
        id="master-subscription-mercadopago-brick" 
        className={`min-h-[400px] ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity'}`}
      />
    </div>
  );
};
