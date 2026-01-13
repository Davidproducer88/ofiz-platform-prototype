import { useEffect, useRef, useState, useId } from 'react';
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
  const mountedRef = useRef(false);
  const uniqueId = useId().replace(/:/g, '');
  const containerId = `mp-brick-${uniqueId}`;

  useEffect(() => {
    // Prevenir doble montaje en StrictMode
    if (mountedRef.current) return;
    mountedRef.current = true;
    
    const loadMercadoPago = async () => {
      try {
        setIsLoading(true);
        
        // @ts-ignore
        if (window.MercadoPago) {
          await initializeBrick();
          return;
        }

        // Verificar si el script ya está cargando
        const existingScript = document.querySelector('script[src*="mercadopago"]');
        if (existingScript) {
          existingScript.addEventListener('load', () => initializeBrick());
          return;
        }

        const scriptElement = document.createElement('script');
        scriptElement.src = 'https://sdk.mercadopago.com/js/v2';
        scriptElement.async = true;
        
        scriptElement.onload = () => {
          initializeBrick();
        };

        scriptElement.onerror = () => {
          toast.error('Error al cargar MercadoPago');
          onError(new Error('Failed to load MercadoPago SDK'));
          setIsLoading(false);
        };

        document.body.appendChild(scriptElement);
      } catch (error) {
        console.error('Error loading MercadoPago:', error);
        onError(error);
        setIsLoading(false);
      }
    };

    const initializeBrick = async () => {
      try {
        const container = document.getElementById(containerId);
        if (!container) {
          console.error('Container not found:', containerId);
          setIsLoading(false);
          return;
        }

        // Verificar si ya hay un brick en el contenedor
        if (container.children.length > 0) {
          console.log('Brick already exists in container');
          setIsLoading(false);
          return;
        }
        
        // @ts-ignore
        if (!window.MercadoPago) {
          console.error('MercadoPago SDK not loaded!');
          setIsLoading(false);
          return;
        }
        
        // @ts-ignore
        const mp = new window.MercadoPago('TEST-e3eeddeb-6fd7-4a45-ba8d-a487720f7fc1', {
          locale: 'es-UY',
          advancedFraudPrevention: false
        });

        const bricksBuilder = mp.bricks();
        
        brickRef.current = await bricksBuilder.create('payment', containerId, {
          initialization: {
            amount: amount,
            payer: { email: '' }
          },
          customization: {
            visual: { style: { theme: 'default' } },
            paymentMethods: {
              creditCard: 'all',
              debitCard: 'all',
              maxInstallments: 12,
            },
          },
          callbacks: {
            onReady: () => {
              setIsLoading(false);
            },
            onSubmit: async (formData: any) => {
              return new Promise<void>(async (resolve, reject) => {
                try {
                  let paymentData = formData.formData || formData;
                  
                  if (formData.selectedPaymentMethod) {
                    paymentData = { ...paymentData, ...formData };
                  }
                  
                  const hasToken = paymentData.token || paymentData.card_token_id;
                  const hasPaymentMethod = paymentData.payment_method_id || paymentData.paymentMethodId;
                  
                  if (!hasToken && !hasPaymentMethod) {
                    toast.error('Por favor completa todos los datos de pago');
                    reject(new Error('Datos incompletos'));
                    return;
                  }

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
                      paymentMethodId: paymentData.payment_method_id || paymentData.paymentMethodId,
                      token: paymentData.token || paymentData.card_token_id,
                      issuerId: paymentData.issuer_id || paymentData.issuerId,
                      installments: paymentData.installments,
                      payer: paymentData.payer
                    }
                  });

                  if (error) throw new Error(error.message || 'Error al procesar el pago');

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
        onError(error);
        setIsLoading(false);
      }
    };

    loadMercadoPago();

    return () => {
      if (brickRef.current) {
        try {
          brickRef.current.unmount?.();
        } catch (err) {
          console.warn('Error unmounting brick:', err);
        }
        brickRef.current = null;
      }
      mountedRef.current = false;
    };
  }, [containerId]);

  return (
    <div className="w-full space-y-4">
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-muted-foreground">Cargando formulario de pago...</p>
        </div>
      )}
      <div 
        id={containerId} 
        className={`min-h-[400px] ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity'}`}
      />
    </div>
  );
};
