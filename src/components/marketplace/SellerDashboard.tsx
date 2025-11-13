import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DollarSign,
  TrendingUp,
  Package,
  ShoppingCart,
  Plus,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';
import type { MarketplaceProduct, MarketplaceOrder, MarketplaceCategory } from '@/hooks/useMarketplace';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ProductFormDialog } from './ProductFormDialog';
import { OrdersTable } from './OrdersTable';
import { useMarketplace } from '@/hooks/useMarketplace';
import { useAuth } from '@/hooks/useAuth';

interface SellerDashboardProps {
  balance?: {
    available: number;
    pending: number;
    total_earnings: number;
  };
  products?: MarketplaceProduct[];
  orders?: MarketplaceOrder[];
  onUpdateProduct?: (productId: string, productData: Partial<MarketplaceProduct>) => Promise<any>;
  onUpdateStock?: (productId: string, newStock: number) => Promise<any>;
  onDeleteProduct?: (productId: string) => Promise<any>;
  onCreateProduct?: (productData: any) => Promise<any>;
  onUpdateOrderStatus?: (orderId: string, status: MarketplaceOrder['status'], trackingNumber?: string) => Promise<any>;
  categories?: MarketplaceCategory[];
}

export function SellerDashboard({ 
  balance, 
  products, 
  orders,
  onUpdateProduct,
  onUpdateStock,
  onDeleteProduct,
  onCreateProduct,
  onUpdateOrderStatus,
  categories = []
}: SellerDashboardProps) {
  const [editingProduct, setEditingProduct] = useState<MarketplaceProduct | undefined>();
  const [showProductForm, setShowProductForm] = useState(false);
  const [stockEditId, setStockEditId] = useState<string | null>(null);
  const [newStock, setNewStock] = useState<number>(0);

  const totalSales = orders?.filter(o => o.status === 'delivered').length || 0;
  const totalRevenue = orders
    ?.filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.seller_amount || 0), 0) || 0;
  const pendingOrders = orders?.filter(o => o.status === 'pending' || o.status === 'confirmed').length || 0;
  const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
  const lowStockProducts = products?.filter(p => (p.stock_quantity || 0) > 0 && (p.stock_quantity || 0) <= 5) || [];

  const handleSaveProduct = async (productData: any) => {
    if (!onUpdateProduct || !onCreateProduct) return;
    
    if (editingProduct) {
      await onUpdateProduct(editingProduct.id, productData);
    } else {
      await onCreateProduct(productData);
    }
    setShowProductForm(false);
    setEditingProduct(undefined);
  };

  const handleEditStock = (product: MarketplaceProduct) => {
    setStockEditId(product.id);
    setNewStock(product.stock_quantity);
  };

  const handleSaveStock = async (productId: string) => {
    if (!onUpdateStock) return;
    await onUpdateStock(productId, newStock);
    setStockEditId(null);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!onDeleteProduct) return;
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      await onDeleteProduct(productId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Disponible</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ${(balance?.available || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              ${(balance?.pending || 0).toLocaleString()} pendiente
            </p>
            <Button size="sm" className="w-full mt-3" variant="outline">
              Retirar Fondos
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(balance?.total_earnings || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              desde el inicio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
            <Package className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {products?.filter(p => (p.stock_quantity || 0) > 0).length || 0} con stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes Pendientes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              {totalSales} completadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Info */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-background border-2 border-green-500/20">
          <CardHeader>
            <CardTitle>Información de Monetización</CardTitle>
            <CardDescription>
              Sistema de comisiones de Ofiz Market
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Comisión de Plataforma</h4>
              <p className="text-sm text-muted-foreground">
                Ofiz Market cobra una comisión del <span className="font-bold text-primary">5%</span> sobre
                cada venta realizada. Esto incluye:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>✓ Hosting y mantenimiento de tu tienda</li>
                <li>✓ Procesamiento seguro de pagos</li>
                <li>✓ Sistema de gestión de órdenes</li>
                <li>✓ Soporte técnico 24/7</li>
                <li>✓ Exposición a miles de compradores</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Ejemplo de Venta</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>Precio de venta:</span>
                  <span className="font-medium">$10,000</span>
                </div>
                <div className="flex justify-between p-2 bg-primary/10 rounded">
                  <span>Comisión Ofiz (5%):</span>
                  <span className="font-medium text-primary">-$500</span>
                </div>
                <div className="flex justify-between p-2 bg-green-500/10 rounded border-2 border-green-500/20">
                  <span className="font-semibold">Tú recibes:</span>
                  <span className="font-bold text-green-600">$9,300</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Promedio de orden: ${Math.round(averageOrderValue).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <Card className="bg-gradient-to-br from-amber-500/10 to-background border-2 border-amber-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Alertas de Inventario
              </CardTitle>
              <CardDescription>
                Productos con stock bajo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-2 bg-amber-500/5 rounded border border-amber-500/20">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{product.title}</p>
                      <p className="text-xs text-muted-foreground">
                        SKU: {product.sku || 'N/A'}
                      </p>
                    </div>
                    <Badge variant="destructive" className="ml-2">
                      {product.stock_quantity} unid.
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mis Productos</CardTitle>
              <CardDescription>Gestiona tu inventario</CardDescription>
            </div>
            <Button className="gap-2" onClick={() => {
              setEditingProduct(undefined);
              setShowProductForm(true);
            }}>
              <Plus className="h-4 w-4" />
              Nuevo Producto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!products || products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                No tienes productos aún
              </p>
              <p className="text-sm text-muted-foreground">
                Comienza a vender creando tu primer producto
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Ventas</TableHead>
                    <TableHead>Vistas</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products?.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{product.title}</p>
                            {product.featured && (
                              <Badge variant="secondary" className="text-xs">
                                Destacado
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${product.price.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {stockEditId === product.id ? (
                          <div className="flex gap-1 items-center">
                            <Input
                              type="number"
                              value={newStock}
                              onChange={(e) => setNewStock(Number(e.target.value))}
                              className="w-20 h-8"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSaveStock(product.id)}
                            >
                              ✓
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setStockEditId(null)}
                            >
                              ✗
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                product.stock_quantity === 0
                                  ? 'destructive'
                                  : product.stock_quantity <= 5
                                  ? 'secondary'
                                  : 'default'
                              }
                            >
                              {product.stock_quantity}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditStock(product)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{product.sales_count}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          {product.views_count}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            product.status === 'active'
                              ? 'default'
                              : product.status === 'draft'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingProduct(product);
                              setShowProductForm(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orders Table */}
      {orders && orders.length > 0 && (
        <OrdersTable 
          orders={orders} 
          onUpdateStatus={onUpdateOrderStatus}
          isSeller={true}
        />
      )}

      {/* Product Form Dialog */}
      <ProductFormDialog
        product={editingProduct}
        categories={categories}
        open={showProductForm}
        onOpenChange={setShowProductForm}
        onSave={handleSaveProduct}
      />
    </div>
  );
}
