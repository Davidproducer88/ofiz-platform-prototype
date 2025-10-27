import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ContractPaymentCheckoutBrickProps {
  amount: number;
  applicationId: string;
  contractTitle: string;
  masterName: string;
  onSuccess: (data: any) => void;
  onError: (error: any) => void;
}

declare global {
  interface Window {
    MercadoPago: any;
  }
}

export const ContractPaymentCheckoutBrick = ({
  amount,
  applicationId,
  contractTitle,
  masterName,
  onSuccess,
  onError,
}: ContractPaymentCheckoutBrickProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMercadoPago = async () => {
      // Check if script is already loaded
      if (window.MercadoPago) {
        initializeBrick();
        return;
      }

      // Load MercadoPago SDK
      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.async = true;
      script.onload = () => initializeBrick();
      script.onerror = () => {
        console.error('Failed to load MercadoPago SDK');
        onError({ message: 'No se pudo cargar el sistema de pagos' });
      };
      document.body.appendChild(script);
    };

    const initializeBrick = async () => {
      try {
        const mp = new window.MercadoPago('APP_USR-8e0a6aa2-8ebc-48a6-84cd-c1f8f8abf63a', {
          locale: 'es-UY'
        });

        const bricksBuilder = mp.bricks();

        const renderPaymentBrick = async () => {
          const settings = {
            initialization: {
              amount: amount / 100,
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
                maxInstallments: 12,
              },
            },
            callbacks: {
              onReady: () => {
                console.log('Payment Brick ready');
                setIsLoading(false);
              },
              onSubmit: async (formData: any) => {
                console.log('Payment form submitted', formData);
                setIsLoading(true);

                try {
                  const { data, error } = await supabase.functions.invoke('create-contract-payment', {
                    body: {
                      applicationId,
                      paymentMethodId: formData.payment_method_id,
                      token: formData.token,
                      issuerId: formData.issuer_id,
                      installments: formData.installments,
                      payer: formData.payer,
                    },
                  });

                  if (error) {
                    console.error('Edge function error:', error);
                    throw new Error(error.message);
                  }

                  if (data?.error) {
                    console.error('Payment error:', data.error);
                    throw new Error(data.error);
                  }

                  console.log('Payment successful:', data);
                  onSuccess(data);
                } catch (err: any) {
                  console.error('Error processing payment:', err);
                  onError(err);
                } finally {
                  setIsLoading(false);
                }
              },
              onError: (error: any) => {
                console.error('Payment Brick error:', error);
                onError(error);
              },
            },
          };

          await bricksBuilder.create('payment', 'paymentBrick_container', settings);
        };

        renderPaymentBrick();
      } catch (error) {
        console.error('Error initializing Payment Brick:', error);
        onError(error);
        setIsLoading(false);
      }
    };

    loadMercadoPago();

    return () => {
      const brickContainer = document.getElementById('paymentBrick_container');
      if (brickContainer) {
        brickContainer.innerHTML = '';
      }
    };
  }, [amount, applicationId, onSuccess, onError]);

  return (
    <div className="space-y-4">
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      <div id="paymentBrick_container" className="min-h-[400px]"></div>
    </div>
  );
};
