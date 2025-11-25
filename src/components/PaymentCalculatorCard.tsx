import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Percent, TrendingDown, Calculator } from 'lucide-react';
import { PaymentCalculation, formatPaymentMethod } from '@/utils/paymentCalculator';

interface PaymentCalculatorCardProps {
  calculation: PaymentCalculation;
  showForClient?: boolean;
}

export function PaymentCalculatorCard({ calculation, showForClient = true }: PaymentCalculatorCardProps) {
  if (showForClient) {
    // Vista para el cliente: solo ve los montos a pagar
    return (
      <Card className="bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Detalle del pago
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Precio base:</span>
            <span className="font-medium">${calculation.priceBase.toLocaleString()}</span>
          </div>

          {calculation.fullPaymentDiscount > 0 && (
            <div className="flex justify-between items-center p-2 bg-secondary/10 rounded">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-secondary" />
                <span className="text-sm font-medium">Descuento pago total (5%):</span>
              </div>
              <span className="text-sm font-bold text-secondary">
                -${calculation.fullPaymentDiscount.toLocaleString()}
              </span>
            </div>
          )}

          {calculation.creditsApplied > 0 && (
            <div className="flex justify-between items-center p-2 bg-secondary/10 rounded">
              <span className="text-sm font-medium">Créditos aplicados:</span>
              <span className="text-sm font-bold text-secondary">
                -${calculation.creditsApplied.toLocaleString()}
              </span>
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Total ahora:</span>
              <span className="font-bold text-lg">
                ${calculation.upfrontAmount.toLocaleString()}
              </span>
            </div>

            {calculation.pendingAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Al completar:</span>
                <span className="font-medium">
                  ${calculation.pendingAmount.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <div className="pt-2 mt-2 border-t">
            <div className="text-xs text-muted-foreground">
              Método seleccionado: {formatPaymentMethod(calculation.paymentMethod)}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Vista para el profesional: ve todos los detalles de comisiones
  return (
    <Card className="bg-muted/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Desglose de Comisiones y Pago
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Precio base del trabajo:</span>
            <span className="font-semibold">${calculation.priceBase.toLocaleString()}</span>
          </div>

          <Separator className="my-2" />

          <div className="space-y-2 bg-destructive/5 p-3 rounded-lg">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              COMISIONES (descontadas del profesional):
            </div>

            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <Percent className="h-3 w-3 text-destructive" />
                <span>Comisión Ofiz (5%):</span>
              </div>
              <span className="font-medium text-destructive">
                -${calculation.platformFee.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <Percent className="h-3 w-3 text-destructive" />
                <span>Comisión Mercado Pago:</span>
              </div>
              <span className="font-medium text-destructive">
                -${calculation.mpFee.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs pt-2 border-t border-destructive/20">
              <span className="text-muted-foreground">Total comisiones:</span>
              <span className="font-bold text-destructive">
                -${calculation.totalFees.toLocaleString()}
              </span>
            </div>
          </div>

          <Separator className="my-2" />

          <div className="bg-secondary/10 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Neto que recibirás:</span>
              <span className="text-xl font-bold text-secondary">
                ${calculation.netoProfesional.toLocaleString()}
              </span>
            </div>
          </div>

          {calculation.paymentType === 'partial' && (
            <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg mt-3">
              <div className="text-xs font-medium text-amber-800 dark:text-amber-200 mb-2">
                Pago parcial (50/50):
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-amber-700 dark:text-amber-300">Al confirmar:</span>
                  <span className="font-medium">${(calculation.netoProfesional * 0.5).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-700 dark:text-amber-300">Al completar:</span>
                  <span className="font-medium">${(calculation.netoProfesional * 0.5).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 mt-2 border-t">
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Método: {formatPaymentMethod(calculation.paymentMethod)}</div>
            <div className="flex items-center gap-2">
              <span>Acreditación:</span>
              <Badge variant="outline" className="text-xs">
                {calculation.accreditation === 'immediate' ? '0 días' : '21 días'}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
