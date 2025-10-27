import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface CheckoutBrickProps {
  amount: number;
  orderId: string;
  onSuccess: (paymentData: any) => void;
  onError: (error: any) => void;
}

export const CheckoutBrick = ({ amount, orderId, onSuccess, onError }: CheckoutBrickProps) => {
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
        console.log('Initializing Payment Brick for order:', orderId);
        
        // Verificar que el contenedor existe
        const container = document.getElementById('mercadopago-brick-container');
        if (!container) {
          console.error('Container not found!');
          toast.error('Error: contenedor no encontrado');
          setIsLoading(false);
          return;
        }
        
        console.log('Container found, creating MercadoPago instance...');
        
        // @ts-ignore - MercadoPago SDK
        if (!window.MercadoPago) {
          console.error('MercadoPago SDK not loaded!');
          toast.error('SDK de MercadoPago no disponible');
          setIsLoading(false);
          return;
        }
        
        // @ts-ignore - MercadoPago SDK
        const mp = new window.MercadoPago('TEST-e3eeddeb-6fd7-4a45-ba8d-a487720f7fc1', {
          locale: 'es-UY'
        });

        console.log('MercadoPago instance created, getting bricks builder...');
        const bricksBuilder = mp.bricks();

        // Destroy previous brick if exists
        if (brickRef.current) {
          console.log('Unmounting previous brick');
          try {
            await brickRef.current.unmount();
          } catch (unmountError) {
            console.warn('Error unmounting previous brick:', unmountError);
          }
        }

        console.log('Creating payment brick with amount:', amount);
        
        // Create payment brick
        brickRef.current = await bricksBuilder.create('payment', 'mercadopago-brick-container', {
          initialization: {
            amount: amount,
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
              toast.success('Formulario de pago listo');
            },
            onSubmit: async (formData: any, additionalData: any) => {
              // CRITICAL: Prevent default form submission and any redirects
              try {
                console.log('=== PAYMENT FORM SUBMITTED ===');
                console.log('Form data received:', formData);
                console.log('Additional data:', additionalData);
                
                // MercadoPago puede enviar los datos en diferentes estructuras
                // Intentar extraer los datos de diferentes maneras
                let paymentData = formData;
                
                // Si formData tiene formData dentro (estructura anidada)
                if (formData.formData) {
                  paymentData = formData.formData;
                }
                
                // Si hay selectedPaymentMethod
                if (formData.selectedPaymentMethod) {
                  paymentData = { ...paymentData, ...formData };
                }
                
                console.log('Processed payment data:', paymentData);
                console.log('================================');
                
                // Validación más flexible - solo verificar que tengamos algún dato de pago
                const hasToken = paymentData.token || paymentData.card_token_id;
                const hasPaymentMethod = paymentData.payment_method_id || paymentData.paymentMethodId;
                
                if (!hasToken && !hasPaymentMethod) {
                  console.error('Missing required payment data!', paymentData);
                  toast.error('Por favor completa todos los datos de pago');
                  return false; // Prevent default behavior
                }
                
                console.log('Payment data valid, calling onSuccess callback...');
                await onSuccess(paymentData);
                console.log('Payment processed successfully');
                toast.success('¡Pago procesado exitosamente!');
                
                // Return false to prevent any default redirect behavior
                return false;
              } catch (error) {
                console.error('Payment error:', error);
                toast.error('Error al procesar el pago');
                onError(error);
                return false; // Prevent default behavior even on error
              }
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
        brickRef.current.unmount().catch((err: any) => {
          console.error('Error unmounting brick:', err);
        });
      }
    };
  }, [amount, orderId]);

  return (
    <div className="w-full space-y-4">
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-muted-foreground">Cargando formulario de pago...</p>
        </div>
      )}
      <div 
        id="mercadopago-brick-container" 
        className={`min-h-[400px] ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity'}`}
      />
    </div>
  );
};
