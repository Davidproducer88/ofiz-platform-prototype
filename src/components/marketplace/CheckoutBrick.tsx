import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface CheckoutBrickProps {
  amount: number;
  orderId: string;
  onSuccess: (paymentData: any) => void;
  onError: (error: any) => void;
}

export const CheckoutBrick = ({ amount, orderId, onSuccess, onError }: CheckoutBrickProps) => {
  const brickRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMercadoPago = async () => {
      try {
        // Load MercadoPago SDK
        const script = document.createElement('script');
        script.src = 'https://sdk.mercadopago.com/js/v2';
        script.async = true;
        
        script.onload = async () => {
          // @ts-ignore - MercadoPago SDK
          const mp = new window.MercadoPago('TEST-4ca50886-cc32-4210-aa69-7d6faafef84c', {
            locale: 'es-UY'
          });

          const bricksBuilder = mp.bricks();

          // Destroy previous brick if exists
          if (brickRef.current) {
            await brickRef.current.unmount();
          }

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
                console.log('Brick ready');
              },
              onSubmit: async (formData: any) => {
                try {
                  console.log('Payment form submitted:', formData);
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
              },
            },
          });
        };

        script.onerror = () => {
          toast.error('Error al cargar MercadoPago');
          onError(new Error('Failed to load MercadoPago SDK'));
        };

        document.body.appendChild(script);

        return () => {
          if (brickRef.current) {
            brickRef.current.unmount();
          }
          document.body.removeChild(script);
        };
      } catch (error) {
        console.error('Error loading MercadoPago:', error);
        toast.error('Error al inicializar el pago');
        onError(error);
      }
    };

    loadMercadoPago();
  }, [amount, orderId]);

  return (
    <div className="w-full">
      <div id="mercadopago-brick-container" ref={containerRef} className="min-h-[400px]" />
    </div>
  );
};
