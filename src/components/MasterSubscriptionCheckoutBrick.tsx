import { useEffect, useRef, useState, useCallback } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  const brickRef = useRef<any>(null);
  const initializingRef = useRef(false);
  const containerId = 'master-subscription-brick-container';

  const initializeBrick = useCallback(async () => {
    // Prevent multiple initializations
    if (initializingRef.current || brickRef.current) {
      setIsLoading(false);
      return;
    }
    
    const container = document.getElementById(containerId);
    if (!container) {
      setIsLoading(false);
      return;
    }

    // Check if brick already exists in DOM
    if (container.children.length > 0) {
      setIsLoading(false);
      return;
    }

    initializingRef.current = true;

    try {
      // @ts-ignore
      if (!window.MercadoPago) {
        initializingRef.current = false;
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
            initializingRef.current = false;
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
            initializingRef.current = false;
          },
        },
      });
    } catch (error) {
      console.error('Error initializing brick:', error);
      onError(error);
      setIsLoading(false);
      initializingRef.current = false;
    }
  }, [amount, planId, planName, applicationsLimit, isFeatured, onSuccess, onError]);

  useEffect(() => {
    let mounted = true;
    
    const loadMercadoPago = async () => {
      // @ts-ignore
      if (window.MercadoPago) {
        if (mounted) await initializeBrick();
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector('script[src*="sdk.mercadopago"]');
      if (existingScript) {
        const checkLoaded = setInterval(() => {
          // @ts-ignore
          if (window.MercadoPago) {
            clearInterval(checkLoaded);
            if (mounted) initializeBrick();
          }
        }, 100);
        return () => clearInterval(checkLoaded);
      }

      const scriptElement = document.createElement('script');
      scriptElement.src = 'https://sdk.mercadopago.com/js/v2';
      scriptElement.async = true;
      
      scriptElement.onload = () => {
        if (mounted) initializeBrick();
      };
      scriptElement.onerror = () => {
        toast.error('Error al cargar MercadoPago');
        onError(new Error('Failed to load MercadoPago SDK'));
        setIsLoading(false);
      };

      document.body.appendChild(scriptElement);
    };

    loadMercadoPago();

    return () => {
      mounted = false;
      if (brickRef.current) {
        try {
          brickRef.current.unmount?.();
        } catch (e) {}
        brickRef.current = null;
      }
      initializingRef.current = false;
    };
  }, [initializeBrick]);

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
