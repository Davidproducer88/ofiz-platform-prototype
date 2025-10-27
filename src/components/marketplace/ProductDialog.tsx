import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Star, Package, ShoppingCart, TrendingUp, Eye, Truck, MapPin, Clock, Zap } from 'lucide-react';
import type { MarketplaceProduct } from '@/hooks/useMarketplace';
import { CheckoutBrick } from './CheckoutBrick';
import { toast } from 'sonner';

interface ProductDialogProps {
  product: MarketplaceProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchase: (quantity: number, address: any, deliveryMethod: string, shippingType?: string) => Promise<any>;
  onPaymentComplete?: (orderId: string, formData: any) => Promise<void>;
  onUpdateOrderStatus?: (orderId: string, status: any) => void;
}

export function ProductDialog({ product, open, onOpenChange, onPurchase, onPaymentComplete }: ProductDialogProps) {
  const [quantity, setQuantity] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState<'shipping' | 'pickup'>('shipping');
  const [shippingType, setShippingType] = useState<'standard' | 'express'>('standard');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const shippingInfo = product.shipping_info as any || {};
  const pickupInfo = shippingInfo.pickup || {};
  const standardShipping = shippingInfo.standard || { cost: 200, delivery_days: '3-5 días' };
  const expressShipping = shippingInfo.express || { cost: 400, delivery_days: '1-2 días' };
  
  const subtotal = product.price * quantity;
  const platformFee = Math.round(subtotal * 0.12 * 100) / 100;
  
  let shippingCost = 0;
  if (deliveryMethod === 'shipping') {
    if (shippingInfo.free_over && subtotal >= shippingInfo.free_over) {
      shippingCost = 0;
    } else {
      shippingCost = shippingType === 'standard' ? standardShipping.cost : expressShipping.cost;
    }
  }
  
  const total = subtotal + shippingCost;

  const handleConfirmPurchase = async () => {
    // Validate form
    if (deliveryMethod === 'shipping') {
      if (!address || !city) {
        toast.error('Por favor completa la dirección de envío');
        return;
      }
    }
    
    // Phone is always required
    if (!phone) {
      toast.error('Por favor ingresa un número de teléfono');
      return;
    }

    setIsProcessing(true);
    
    try {
      const shippingAddress = deliveryMethod === 'pickup' 
        ? {
            pickup: true,
            pickup_address: pickupInfo.address,
            phone,
            notes,
          }
        : {
            address,
            city,
            postal_code: postalCode,
            phone,
            notes,
          };
      
      console.log('Creating order with address:', shippingAddress);
      const order = await onPurchase(quantity, shippingAddress, deliveryMethod, shippingType);
      
      console.log('Order created:', order);
      
      if (order) {
        setCurrentOrder(order);
        setShowPayment(true);
        toast.success('Orden creada. Completa el pago');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Error al crear la orden');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (formData: any) => {
    if (!currentOrder || !onPaymentComplete) return;
    
    try {
      await onPaymentComplete(currentOrder.id, formData);
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    toast.error('Error al procesar el pago');
  };

  const handleClose = () => {
    setShowPayment(false);
    setCurrentOrder(null);
    setQuantity(1);
    setAddress('');
    setCity('');
    setPostalCode('');
    setPhone('');
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.title}</DialogTitle>
          <DialogDescription>
            {product.business_profiles?.company_name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Product Info */}
          <div className="space-y-4">
            {/* Image */}
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-muted rounded-lg">
                <Eye className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm font-medium">{product.views_count}</p>
                <p className="text-xs text-muted-foreground">vistas</p>
              </div>
              <div className="text-center p-2 bg-muted rounded-lg">
                <TrendingUp className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm font-medium">{product.sales_count}</p>
                <p className="text-xs text-muted-foreground">ventas</p>
              </div>
              <div className="text-center p-2 bg-muted rounded-lg">
                <Star className="h-4 w-4 mx-auto mb-1 text-amber-400" />
                <p className="text-sm font-medium">{product.rating.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">rating</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Descripción</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {product.description}
              </p>
            </div>

            {/* Category */}
            {product.marketplace_categories && (
              <div>
                <Badge variant="secondary">
                  {product.marketplace_categories.icon}{' '}
                  {product.marketplace_categories.name}
                </Badge>
              </div>
            )}
          </div>

          {/* Purchase Form */}
          <div className="space-y-4">
            {/* Price */}
            <div className="p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-bold text-primary">
                  ${product.price.toLocaleString()}
                </span>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <span className="text-lg text-muted-foreground line-through mb-1">
                    ${product.compare_at_price.toLocaleString()}
                  </span>
                )}
              </div>
              {product.stock_quantity > 0 ? (
                <p className="text-sm text-green-600 dark:text-green-400">
                  ✓ {product.stock_quantity} unidades disponibles
                </p>
              ) : (
                <p className="text-sm text-red-600 dark:text-red-400">
                  ✗ Sin stock
                </p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <Label htmlFor="quantity">Cantidad</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={product.stock_quantity}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>

            <Separator />

            {/* Delivery Method */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Método de Entrega
              </h3>

              <RadioGroup value={deliveryMethod} onValueChange={(value: any) => setDeliveryMethod(value)}>
                {shippingInfo.enabled !== false && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="shipping" id="shipping" />
                      <Label htmlFor="shipping" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Envío a domicilio</p>
                            <p className="text-xs text-muted-foreground">
                              Recibe tu pedido en tu dirección
                            </p>
                          </div>
                          <Truck className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </Label>
                    </div>

                    {deliveryMethod === 'shipping' && (
                      <div className="ml-8 space-y-2">
                        <RadioGroup value={shippingType} onValueChange={(value: any) => setShippingType(value)}>
                          <div className="flex items-center space-x-2 p-2 border rounded hover:bg-muted/50">
                            <RadioGroupItem value="standard" id="standard" />
                            <Label htmlFor="standard" className="flex-1 cursor-pointer">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-sm">Envío Estándar</p>
                                  <p className="text-xs text-muted-foreground">{standardShipping.delivery_days}</p>
                                </div>
                                <span className="font-semibold">
                                  {shippingInfo.free_over && subtotal >= shippingInfo.free_over
                                    ? 'GRATIS'
                                    : `$${standardShipping.cost}`}
                                </span>
                              </div>
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2 p-2 border rounded hover:bg-muted/50">
                            <RadioGroupItem value="express" id="express" />
                            <Label htmlFor="express" className="flex-1 cursor-pointer">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <Zap className="h-4 w-4 text-amber-500" />
                                  <div>
                                    <p className="font-medium text-sm">Envío Express</p>
                                    <p className="text-xs text-muted-foreground">{expressShipping.delivery_days}</p>
                                  </div>
                                </div>
                                <span className="font-semibold">${expressShipping.cost}</span>
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}
                  </div>
                )}

                {pickupInfo.enabled && (
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Retiro en tienda</p>
                          <p className="text-xs text-muted-foreground">Sin costo · Retiro inmediato</p>
                        </div>
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </Label>
                  </div>
                )}
              </RadioGroup>

              {deliveryMethod === 'pickup' && pickupInfo.address && (
                <div className="ml-8 p-3 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Dirección:</p>
                      <p className="text-muted-foreground">{pickupInfo.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Horarios:</p>
                      <p className="text-muted-foreground">{pickupInfo.hours}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Phone field - Always visible */}
            <div className="space-y-2">
              <Label htmlFor="phone-contact">Teléfono de contacto *</Label>
              <Input
                id="phone-contact"
                placeholder="+598 99 123 456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Te contactaremos a este número para coordinar {deliveryMethod === 'pickup' ? 'el retiro' : 'la entrega'}
              </p>
            </div>

            {deliveryMethod === 'shipping' && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold">Dirección de Envío</h3>

                  <div>
                    <Label htmlFor="address">Dirección *</Label>
                    <Input
                      id="address"
                      placeholder="Calle y número"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="city">Ciudad *</Label>
                      <Input
                        id="city"
                        placeholder="Ciudad"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Código Postal</Label>
                      <Input
                        id="postalCode"
                        placeholder="12000"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Phone field removed from here - now always visible above */}

                  <div>
                    <Label htmlFor="notes">Notas (opcional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Indicaciones adicionales para la entrega..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Order Summary */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({quantity}x):</span>
                <span className="font-medium">${subtotal.toLocaleString()}</span>
              </div>
              {deliveryMethod === 'shipping' && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Envío {shippingType === 'express' && '⚡'}:
                  </span>
                  <span className="font-medium">
                    {shippingCost === 0 ? (
                      <span className="text-green-600">GRATIS</span>
                    ) : (
                      `$${shippingCost.toLocaleString()}`
                    )}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-base">
                <span className="font-semibold">Total a pagar:</span>
                <span className="font-bold text-primary text-xl">
                  ${total.toLocaleString()}
                </span>
              </div>
              <div className="p-2 bg-muted rounded text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Comisión Ofiz (12%):</span>
                  <span className="text-primary">${platformFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vendedor recibe:</span>
                  <span className="text-green-600 font-medium">
                    ${(subtotal - platformFee).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          {!showPayment ? (
            <Button
              onClick={handleConfirmPurchase}
              disabled={
                isProcessing ||
                product.stock_quantity === 0 ||
                quantity > product.stock_quantity ||
                !phone ||
                (deliveryMethod === 'shipping' && (!address || !city))
              }
              className="gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              {isProcessing ? 'Procesando...' : (deliveryMethod === 'pickup' ? 'Continuar al Pago' : 'Continuar al Pago')}
            </Button>
          ) : null}
        </DialogFooter>
        
        {/* Payment Section */}
        {showPayment && currentOrder && (
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Completa tu pago</h3>
            <CheckoutBrick
              amount={total}
              orderId={currentOrder.id}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
