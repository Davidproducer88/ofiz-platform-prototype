import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock,
  MapPin,
  CreditCard,
  User,
  Hash,
  Calendar
} from 'lucide-react';
import type { MarketplaceOrder } from '@/hooks/useMarketplace';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface OrderDetailsDialogProps {
  order: MarketplaceOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus: (orderId: string, status: MarketplaceOrder['status'], trackingNumber?: string) => Promise<void>;
  isSeller?: boolean;
}

export function OrderDetailsDialog({
  order,
  open,
  onOpenChange,
  onUpdateStatus,
  isSeller = false,
}: OrderDetailsDialogProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<MarketplaceOrder['status']>(order?.status || 'pending');
  const [trackingNumber, setTrackingNumber] = useState(order?.tracking_number || '');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!order) return null;

  const statusIcons = {
    pending: Clock,
    confirmed: CheckCircle,
    processing: Package,
    shipped: Truck,
    delivered: CheckCircle,
    cancelled: XCircle,
    refunded: XCircle,
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  };

  const StatusIcon = statusIcons[order.status] || Clock;

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(order.id, status, trackingNumber || undefined);
      toast({
        title: "Orden actualizada",
        description: "El estado de la orden se actualizó correctamente",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la orden",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StatusIcon className="h-5 w-5" />
            Detalles de Orden #{order.order_number}
          </DialogTitle>
          <DialogDescription>
            Creada el {format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <Badge className={`${statusColors[order.status]} text-base px-4 py-2`}>
              {order.status === 'pending' && 'Pendiente'}
              {order.status === 'confirmed' && 'Confirmada'}
              {order.status === 'processing' && 'Procesando'}
              {order.status === 'shipped' && 'Enviada'}
              {order.status === 'delivered' && 'Entregada'}
              {order.status === 'cancelled' && 'Cancelada'}
              {order.status === 'refunded' && 'Reembolsada'}
            </Badge>
            <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
              {order.payment_status === 'paid' ? '✓ Pagado' : 'Pago Pendiente'}
            </Badge>
          </div>

          {/* Product Info */}
          {order.marketplace_products && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Producto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {order.marketplace_products.images && order.marketplace_products.images.length > 0 && (
                    <img
                      src={order.marketplace_products.images[0]}
                      alt={order.marketplace_products.title}
                      className="h-20 w-20 rounded-lg object-cover border"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold">{order.marketplace_products.title}</h4>
                    {order.marketplace_products.sku && (
                      <p className="text-sm text-muted-foreground">SKU: {order.marketplace_products.sku}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      Cantidad: <span className="font-medium">{order.quantity} unidades</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Info Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Resumen de Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Precio unitario:</span>
                  <span className="font-medium">${order.unit_price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cantidad:</span>
                  <span className="font-medium">{order.quantity}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">${order.subtotal.toLocaleString()}</span>
                </div>
                {order.shipping_cost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Envío:</span>
                    <span className="font-medium">${order.shipping_cost.toLocaleString()}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total:</span>
                  <span className="text-primary">${order.total_amount.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {isSeller && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Información de Pago
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>${order.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-primary">
                    <span>Comisión (7%):</span>
                    <span>-${order.platform_fee.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-base">
                    <span>Tú recibes:</span>
                    <span className="text-green-600">${order.seller_amount.toLocaleString()}</span>
                  </div>
                  {order.payment_method && (
                    <>
                      <Separator />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Método de pago:</span>
                        <span className="capitalize">{order.payment_method}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Customer & Shipping Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                {order.profiles?.full_name && (
                  <p className="font-medium">{order.profiles.full_name}</p>
                )}
                {order.profiles?.phone && (
                  <p className="text-muted-foreground">Tel: {order.profiles.phone}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Dirección de Envío
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  {order.shipping_address?.name && (
                    <p className="font-medium">{order.shipping_address.name}</p>
                  )}
                  {order.shipping_address?.address && (
                    <p>{order.shipping_address.address}</p>
                  )}
                  {order.shipping_address?.city && (
                    <p className="text-muted-foreground">
                      {order.shipping_address.city}
                      {order.shipping_address.state && `, ${order.shipping_address.state}`}
                    </p>
                  )}
                  {order.shipping_address?.zip_code && (
                    <p className="text-muted-foreground">CP: {order.shipping_address.zip_code}</p>
                  )}
                  {order.shipping_address?.phone && (
                    <p className="text-muted-foreground">Tel: {order.shipping_address.phone}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tracking Number */}
          {(order.tracking_number || isSeller) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Número de Seguimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.tracking_number ? (
                  <div className="flex items-center gap-2">
                    <code className="px-3 py-2 bg-muted rounded font-mono text-sm flex-1">
                      {order.tracking_number}
                    </code>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No se ha asignado un número de seguimiento aún
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Order Notes */}
          {order.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Notas del Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Seller Actions */}
          {isSeller && order.payment_status === 'paid' && (
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="text-base">Actualizar Estado de Orden</CardTitle>
                <CardDescription>
                  Mantén a tu cliente informado del progreso de su pedido
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Estado de la Orden</Label>
                  <Select value={status} onValueChange={(value) => setStatus(value as MarketplaceOrder['status'])}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="confirmed">Confirmada</SelectItem>
                      <SelectItem value="processing">Procesando</SelectItem>
                      <SelectItem value="shipped">Enviada</SelectItem>
                      <SelectItem value="delivered">Entregada</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(status === 'shipped' || status === 'delivered') && (
                  <div className="space-y-2">
                    <Label htmlFor="tracking">Número de Seguimiento</Label>
                    <Input
                      id="tracking"
                      placeholder="Ej: UY123456789"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Ingresa el número de rastreo de la empresa de envíos
                    </p>
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={handleUpdateStatus}
                  disabled={isUpdating || status === order.status}
                >
                  {isUpdating ? 'Actualizando...' : 'Actualizar Orden'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
