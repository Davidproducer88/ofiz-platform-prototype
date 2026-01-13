import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface CheckoutBrickProps {
  amount: number;
  orderId: string;
  onSuccess: (paymentData: any) => void;
  onError: (error: any) => void;
}

declare global {
  interface Window {
    MercadoPago: any;
  }
}

const MERCADOPAGO_PUBLIC_KEY = 'APP_USR-41f544dd-2fd9-4fa0-a92b-f4440bd039f1';

export const CheckoutBrick = ({ amount, orderId, onSuccess, onError }: CheckoutBrickProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [sdkReady, setSdkReady] = useState(false);
  const brickRef = useRef<any>(null);
  const mountedRef = useRef(true);
  const initializingRef = useRef(false);
  const containerIdRef = useRef(`marketplace-brick-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // Load SDK
  useEffect(() => {
    mountedRef.current = true;
    
    const loadSdk = () => {
      if (window.MercadoPago) {
        setSdkReady(true);
        return;
      }

      const existingScript = document.querySelector('script[src*="sdk.mercadopago.com"]');
      if (existingScript) {
        const checkReady = setInterval(() => {
          if (window.MercadoPago) {
            clearInterval(checkReady);
            if (mountedRef.current) setSdkReady(true);
          }
        }, 100);
        
        setTimeout(() => clearInterval(checkReady), 10000);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.async = true;
      script.onload = () => {
        if (mountedRef.current) setSdkReady(true);
      };
      script.onerror = () => {
        if (mountedRef.current) {
          toast.error('Error al cargar MercadoPago SDK');
          setIsLoading(false);
        }
      };
      document.body.appendChild(script);
    };

    loadSdk();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Initialize brick when SDK is ready
  useEffect(() => {
    if (!sdkReady || initializingRef.current || brickRef.current) return;

    const initBrick = async () => {
      const containerId = containerIdRef.current;
      const container = document.getElementById(containerId);
      
      if (!container || !mountedRef.current) {
        setIsLoading(false);
        return;
      }

      // Clear container
      container.innerHTML = '';
      initializingRef.current = true;

      try {
        const mp = new window.MercadoPago(MERCADOPAGO_PUBLIC_KEY, {
          locale: 'es-UY',
          advancedFraudPrevention: false
        });

        const bricks = mp.bricks();
        
        brickRef.current = await bricks.create('payment', containerId, {
          initialization: {
            amount: amount,
            payer: { email: '' }
          },
          customization: {
            visual: { 
              style: { theme: 'default' },
              hideFormTitle: false,
              hidePaymentButton: false
            },
            paymentMethods: {
              creditCard: 'all',
              debitCard: 'all',
              maxInstallments: 12,
            },
          },
          callbacks: {
            onReady: () => {
              if (mountedRef.current) {
                setIsLoading(false);
                initializingRef.current = false;
                toast.success('Formulario de pago listo');
              }
            },
            onSubmit: async (formData: any) => {
              try {
                const paymentData = formData.formData || formData;
                
                const token = paymentData.token || paymentData.card_token_id;
                const paymentMethodId = paymentData.payment_method_id || paymentData.paymentMethodId;
                
                if (!token && !paymentMethodId) {
                  toast.error('Por favor completa todos los datos de pago');
                  throw new Error('Datos incompletos');
                }

                await onSuccess(paymentData);
              } catch (error: any) {
                console.error('Payment error:', error);
                toast.error(error.message || 'Error al procesar el pago');
                onError(error);
                throw error;
              }
            },
            onError: (error: any) => {
              console.warn('Brick error:', error);
              // Only treat critical errors as failures
              if (error?.type === 'critical') {
                if (mountedRef.current) {
                  toast.error('Error al cargar el formulario de pago');
                  onError(error);
                  setIsLoading(false);
                  initializingRef.current = false;
                }
              }
              // Non-critical errors (like empty_installments) are expected during form interaction
            },
          },
        });
      } catch (error) {
        console.error('Error initializing brick:', error);
        if (mountedRef.current) {
          onError(error);
          setIsLoading(false);
          initializingRef.current = false;
        }
      }
    };

    // Small delay to ensure container is in DOM
    const timer = setTimeout(initBrick, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [sdkReady, amount, orderId, onSuccess, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (brickRef.current) {
        try {
          brickRef.current.unmount?.();
        } catch (e) {
          // Ignore unmount errors
        }
        brickRef.current = null;
      }
      initializingRef.current = false;
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
        id={containerIdRef.current}
        className={`min-h-[400px] ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
      />
    </div>
  );
};
