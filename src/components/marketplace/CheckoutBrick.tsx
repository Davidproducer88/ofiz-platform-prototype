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
            payer: {
              email: '',
            },
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
            onSubmit: async (formData: any) => {
              try {
                console.log('=== PAYMENT FORM SUBMITTED ===');
                console.log('Full formData received from Brick:', JSON.stringify(formData, null, 2));
                console.log('Keys in formData:', Object.keys(formData));
                console.log('payment_method_id:', formData.payment_method_id);
                console.log('token:', formData.token);
                console.log('issuer_id:', formData.issuer_id);
                console.log('installments:', formData.installments);
                console.log('payer:', formData.payer);
                console.log('================================');
                
                // Verificar que tenemos los datos mínimos necesarios
                if (!formData.token && !formData.payment_method_id) {
                  console.error('Missing required payment data!');
                  toast.error('Datos de pago incompletos');
                  return;
                }
                
                onSuccess(formData);
              } catch (error) {
                console.error('Payment error:', error);
                onError(error);
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
