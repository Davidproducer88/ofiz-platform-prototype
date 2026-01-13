import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Variable global para prevenir inicialización duplicada
let globalBrickInstance: any = null;
let globalContainerId: string | null = null;

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
  const containerId = 'master-subscription-brick-container';
  const initStartedRef = useRef(false);

  useEffect(() => {
    // Si ya se inició la inicialización, no hacer nada
    if (initStartedRef.current) return;
    initStartedRef.current = true;

    // Si hay un brick existente para otro contenedor, limpiarlo
    if (globalBrickInstance && globalContainerId !== containerId) {
      try {
        globalBrickInstance.unmount?.();
      } catch (e) {}
      globalBrickInstance = null;
      globalContainerId = null;
    }

    // Si ya existe un brick para este contenedor, no crear otro
    if (globalBrickInstance && globalContainerId === containerId) {
      setIsLoading(false);
      return;
    }
    
    const loadMercadoPago = async () => {
      try {
        setIsLoading(true);
        
        // @ts-ignore
        if (window.MercadoPago) {
          await initializeBrick();
          return;
        }

        // Verificar si el script ya existe
        const existingScript = document.querySelector('script[src*="sdk.mercadopago"]');
        if (existingScript) {
          // Esperar a que cargue
          const checkLoaded = setInterval(() => {
            // @ts-ignore
            if (window.MercadoPago) {
              clearInterval(checkLoaded);
              initializeBrick();
            }
          }, 100);
          return;
        }

        const scriptElement = document.createElement('script');
        scriptElement.src = 'https://sdk.mercadopago.com/js/v2';
        scriptElement.async = true;
        
        scriptElement.onload = () => initializeBrick();
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
      // Doble verificación antes de crear
      if (globalBrickInstance) {
        setIsLoading(false);
        return;
      }

      try {
        const container = document.getElementById(containerId);
        if (!container) {
          setIsLoading(false);
          return;
        }

        // Limpiar contenedor
        container.innerHTML = '';
        
        // @ts-ignore
        if (!window.MercadoPago) {
          setIsLoading(false);
          return;
        }
        
        // @ts-ignore
        const mp = new window.MercadoPago('TEST-e3eeddeb-6fd7-4a45-ba8d-a487720f7fc1', {
          locale: 'es-UY',
          advancedFraudPrevention: false
        });

        const bricksBuilder = mp.bricks();
        
        globalBrickInstance = await bricksBuilder.create('payment', containerId, {
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
            onReady: () => setIsLoading(false),
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
        
        globalContainerId = containerId;
      } catch (error) {
        console.error('Error initializing brick:', error);
        onError(error);
        setIsLoading(false);
      }
    };

    loadMercadoPago();

    return () => {
      // Limpiar al desmontar
      if (globalBrickInstance) {
        try {
          globalBrickInstance.unmount?.();
        } catch (err) {}
        globalBrickInstance = null;
        globalContainerId = null;
      }
      initStartedRef.current = false;
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
        id={containerId} 
        className={`min-h-[400px] ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity'}`}
      />
    </div>
  );
};
