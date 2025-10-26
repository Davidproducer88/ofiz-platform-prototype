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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, DollarSign, Truck, MapPin } from 'lucide-react';
import type { MarketplaceProduct, MarketplaceCategory } from '@/hooks/useMarketplace';

interface ProductFormDialogProps {
  product?: MarketplaceProduct;
  categories: MarketplaceCategory[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (productData: any) => void;
}

export function ProductFormDialog({ 
  product, 
  categories, 
  open, 
  onOpenChange, 
  onSave 
}: ProductFormDialogProps) {
  const [formData, setFormData] = useState({
    title: product?.title || '',
    description: product?.description || '',
    price: product?.price || 0,
    compare_at_price: product?.compare_at_price || null,
    stock_quantity: product?.stock_quantity || 0,
    sku: product?.sku || '',
    category_id: product?.category_id || '',
    status: product?.status || 'draft',
    featured: product?.featured || false,
    
    // Shipping info
    shipping_enabled: true,
    shipping_standard_cost: 200,
    shipping_express_cost: 400,
    shipping_free_over: 5000,
    
    // Pickup info
    pickup_enabled: true,
    pickup_address: '',
    pickup_hours: 'Lun-Vie 9:00-18:00, Sáb 9:00-13:00',
  });

  const handleSave = () => {
    const shippingInfo = {
      enabled: formData.shipping_enabled,
      standard: {
        enabled: true,
        cost: formData.shipping_standard_cost,
        delivery_days: '3-5 días hábiles',
      },
      express: {
        enabled: true,
        cost: formData.shipping_express_cost,
        delivery_days: '1-2 días hábiles',
      },
      free_over: formData.shipping_free_over,
      pickup: {
        enabled: formData.pickup_enabled,
        address: formData.pickup_address,
        hours: formData.pickup_hours,
      },
    };

    onSave({
      title: formData.title,
      description: formData.description,
      price: Number(formData.price),
      compare_at_price: formData.compare_at_price ? Number(formData.compare_at_price) : null,
      stock_quantity: Number(formData.stock_quantity),
      sku: formData.sku || null,
      category_id: formData.category_id || null,
      status: formData.status,
      featured: formData.featured,
      shipping_info: shippingInfo,
      images: product?.images || [],
      specifications: product?.specifications || {},
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
          <DialogDescription>
            Completa la información del producto para tu tienda
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">
              <Package className="h-4 w-4 mr-2" />
              Básico
            </TabsTrigger>
            <TabsTrigger value="pricing">
              <DollarSign className="h-4 w-4 mr-2" />
              Precios
            </TabsTrigger>
            <TabsTrigger value="shipping">
              <Truck className="h-4 w-4 mr-2" />
              Envío
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="title">Título del Producto *</Label>
              <Input
                id="title"
                placeholder="Ej: Notebook HP 15.6 Intel i5 8GB RAM"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                placeholder="Describe tu producto en detalle..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sku">SKU / Código</Label>
                <Input
                  id="sku"
                  placeholder="ABC-123"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Estado del Producto</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'draft' | 'active' | 'out_of_stock' | 'archived') => 
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="out_of_stock">Sin Stock</SelectItem>
                  <SelectItem value="archived">Archivado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
              <Label htmlFor="featured">Producto destacado</Label>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Precio de Venta * ($)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="10000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="compare_at_price">Precio Original ($)</Label>
                <Input
                  id="compare_at_price"
                  type="number"
                  placeholder="12000"
                  value={formData.compare_at_price || ''}
                  onChange={(e) => setFormData({ ...formData, compare_at_price: Number(e.target.value) || null })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Para mostrar descuento
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="stock">Stock Disponible *</Label>
              <Input
                id="stock"
                type="number"
                placeholder="10"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Se actualizará automáticamente con cada venta
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">Cálculo de Comisión</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Precio de venta:</span>
                  <span className="font-medium">${formData.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Comisión Ofiz (12%):</span>
                  <span className="font-medium text-primary">
                    -${Math.round(formData.price * 0.12).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="font-semibold">Tú recibes:</span>
                  <span className="font-bold text-green-600">
                    ${Math.round(formData.price * 0.88).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shipping" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="shipping_enabled"
                  checked={formData.shipping_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, shipping_enabled: checked })}
                />
                <Label htmlFor="shipping_enabled">Ofrecer envío a domicilio</Label>
              </div>

              {formData.shipping_enabled && (
                <div className="ml-6 space-y-4 p-4 border rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shipping_standard">Envío Estándar ($)</Label>
                      <Input
                        id="shipping_standard"
                        type="number"
                        value={formData.shipping_standard_cost}
                        onChange={(e) => setFormData({ ...formData, shipping_standard_cost: Number(e.target.value) })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">3-5 días hábiles</p>
                    </div>

                    <div>
                      <Label htmlFor="shipping_express">Envío Express ($)</Label>
                      <Input
                        id="shipping_express"
                        type="number"
                        value={formData.shipping_express_cost}
                        onChange={(e) => setFormData({ ...formData, shipping_express_cost: Number(e.target.value) })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">1-2 días hábiles</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="free_shipping">Envío gratis en compras superiores a ($)</Label>
                    <Input
                      id="free_shipping"
                      type="number"
                      value={formData.shipping_free_over}
                      onChange={(e) => setFormData({ ...formData, shipping_free_over: Number(e.target.value) })}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="pickup_enabled"
                  checked={formData.pickup_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, pickup_enabled: checked })}
                />
                <Label htmlFor="pickup_enabled">Ofrecer retiro en tienda</Label>
              </div>

              {formData.pickup_enabled && (
                <div className="ml-6 space-y-4 p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="pickup_address">Dirección de Retiro</Label>
                    <div className="flex gap-2">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-2" />
                      <Textarea
                        id="pickup_address"
                        placeholder="Ej: Av. 18 de Julio 1234, Local 5, Montevideo"
                        value={formData.pickup_address}
                        onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
                        rows={2}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="pickup_hours">Horarios de Retiro</Label>
                    <Input
                      id="pickup_hours"
                      placeholder="Lun-Vie 9:00-18:00"
                      value={formData.pickup_hours}
                      onChange={(e) => setFormData({ ...formData, pickup_hours: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formData.title || !formData.description || formData.price <= 0}
          >
            {product ? 'Guardar Cambios' : 'Crear Producto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
