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
import { Star, Package, ShoppingCart, TrendingUp, Eye } from 'lucide-react';
import type { MarketplaceProduct } from '@/hooks/useMarketplace';

interface ProductDialogProps {
  product: MarketplaceProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchase: (quantity: number, address: any) => void;
}

export function ProductDialog({ product, open, onOpenChange, onPurchase }: ProductDialogProps) {
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const subtotal = product.price * quantity;
  const platformFee = Math.round(subtotal * 0.12 * 100) / 100;
  const total = subtotal;

  const handlePurchase = () => {
    onPurchase(quantity, {
      address,
      city,
      postal_code: postalCode,
      phone,
      notes,
    });
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

            {/* Shipping Info */}
            <div className="space-y-3">
              <h3 className="font-semibold">Información de Envío</h3>

              <div>
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  placeholder="Calle y número"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="city">Ciudad</Label>
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

              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  placeholder="+598 99 123 456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

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

            <Separator />

            {/* Order Summary */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Comisión plataforma (12%):</span>
                <span className="font-medium text-primary">${platformFee.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-primary text-xl">
                  ${total.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                El vendedor recibirá ${(subtotal - platformFee).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handlePurchase}
            disabled={
              product.stock_quantity === 0 ||
              !address ||
              !city ||
              !phone ||
              quantity > product.stock_quantity
            }
            className="gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Confirmar Compra
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
