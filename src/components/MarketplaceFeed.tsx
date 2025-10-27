import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Store, 
  ShoppingCart, 
  Heart, 
  TrendingUp, 
  Package, 
  DollarSign,
  Search,
  Filter,
  Star,
  Eye,
  Users,
  Zap,
  Award,
  ShoppingBag,
  AlertTriangle
} from 'lucide-react';
import { useMarketplace } from '@/hooks/useMarketplace';
import { useAuth } from '@/hooks/useAuth';
import { ProductCard } from './marketplace/ProductCard';
import { ProductDialog } from './marketplace/ProductDialog';
import { OrdersTable } from './marketplace/OrdersTable';
import { SellerDashboard } from './marketplace/SellerDashboard';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function MarketplaceFeed() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { 
    products, 
    orders, 
    categories,
    favorites,
    balance,
    loading,
    toggleFavorite,
    createOrder,
    updateOrderStatus,
    updateProduct,
    updateStock,
    deleteProduct,
    createProduct
  } = useMarketplace(profile?.id);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductDialog, setShowProductDialog] = useState(false);

  const handlePurchase = async (quantity: number, address: any, deliveryMethod: string, shippingType?: string) => {
    if (!selectedProduct || !profile?.id) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para realizar una compra',
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log('Starting purchase process:', {
        productId: selectedProduct.id,
        quantity,
        userId: profile.id,
        deliveryMethod
      });

      // Calculate shipping cost
      const shippingInfo = selectedProduct.shipping_info as any || {};
      const subtotal = selectedProduct.price * quantity;
      let shippingCost = 0;
      
      if (deliveryMethod === 'shipping') {
        const standardShipping = shippingInfo.standard || { cost: 200 };
        const expressShipping = shippingInfo.express || { cost: 400 };
        
        if (shippingInfo.free_over && subtotal >= shippingInfo.free_over) {
          shippingCost = 0;
        } else {
          shippingCost = shippingType === 'standard' ? standardShipping.cost : expressShipping.cost;
        }
      }

      // Ensure address has required fields
      const shippingAddress = {
        street: address.street || address.address || '',
        city: address.city || 'Montevideo',
        state: address.state || 'Montevideo',
        country: address.country || 'Uruguay',
        postal_code: address.postal_code || '',
        notes: address.notes || ''
      };

      const orderData = {
        product_id: selectedProduct.id,
        seller_id: selectedProduct.business_id,
        quantity,
        unit_price: selectedProduct.price,
        shipping_address: shippingAddress,
        shipping_cost: shippingCost,
        delivery_method: deliveryMethod,
        notes: shippingAddress.notes
      };

      console.log('Creating order with data:', orderData);

      const newOrder = await createOrder(orderData);
      
      if (!newOrder) {
        throw new Error('No se pudo crear la orden');
      }

      console.log('Order created successfully:', newOrder.id);

      // Return the order to ProductDialog to show payment form
      return newOrder;

    } catch (error: any) {
      console.error('Error in purchase process:', error);
      toast({
        title: 'Error al procesar compra',
        description: error.message || 'No se pudo procesar la compra. Por favor intenta de nuevo.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const handlePaymentComplete = async (orderId: string, formData: any) => {
    try {
      console.log('=== MARKETPLACE FEED: Processing payment ===');
      console.log('Processing payment with form data:', formData);
      
      toast({
        title: 'Procesando pago...',
        description: 'Espera mientras procesamos tu pago',
      });

      // Extraer datos de pago de manera flexible
      const paymentMethodId = formData.payment_method_id || formData.paymentMethodId;
      const token = formData.token || formData.card_token_id;
      const issuerId = formData.issuer_id || formData.issuerId;
      const installments = formData.installments;
      const payer = formData.payer;

      console.log('Calling create-marketplace-payment edge function...');

      const { data, error } = await supabase.functions.invoke('create-marketplace-payment', {
        body: {
          orderId: orderId,
          paymentMethodId,
          token,
          issuerId,
          installments,
          payer
        }
      });

      if (error) {
        console.error('Error processing payment:', error);
        throw new Error(error.message || 'Error al procesar el pago');
      }

      console.log('Payment processed successfully:', data);

      if (data.status === 'approved') {
        console.log('Payment approved! Updating UI...');
        
        toast({
          title: '✅ ¡Pago exitoso!',
          description: `Tu orden fue procesada correctamente. Redirigiendo a tu dashboard...`,
          duration: 3000,
        });
        
        // Close dialog first to unmount the brick properly
        console.log('Closing product dialog...');
        setShowProductDialog(false);
        setSelectedProduct(null);
        
        // Wait for the dialog to close and brick to unmount, then redirect
        setTimeout(() => {
          console.log('Redirecting to client dashboard...');
          navigate('/client-dashboard');
        }, 500); // Shorter delay since we're already closing the dialog
        
      } else if (data.status === 'pending' || data.status === 'in_process') {
        toast({
          title: '⏳ Pago pendiente',
          description: 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.',
        });
        
        setTimeout(() => {
          setShowProductDialog(false);
          setSelectedProduct(null);
        }, 3000);
      } else {
        throw new Error('El pago fue rechazado');
      }
    } catch (error: any) {
      console.error('Error completing payment:', error);
      toast({
        title: 'Error al procesar pago',
        description: error.message || 'No se pudo completar el pago',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const filteredProducts = (products || []).filter(product => {
    const matchesSearch = 
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = 
      selectedCategory === 'all' || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredProducts = (products || []).filter(p => p.featured).slice(0, 3);

  // Filtrar productos y órdenes según si es vendedor o comprador
  const myProducts = products?.filter(p => p.business_id === profile?.id) || [];
  const myBuyerOrders = orders?.filter(o => o.buyer_id === profile?.id) || [];
  const mySellerOrders = orders?.filter(o => o.seller_id === profile?.id) || [];
  const isBusinessSeller = profile?.user_type === 'business' && myProducts.length > 0;

  const stats = {
    totalProducts: products?.length || 0,
    totalOrders: orders?.length || 0,
    activeListings: products?.filter(p => p.status === 'active').length || 0,
    totalSales: orders?.filter(o => o.status === 'delivered').length || 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/10 to-transparent" />
        <CardHeader className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Store className="h-8 w-8 text-primary" />
            </div>
            <div>
              <Badge className="mb-2 bg-gradient-primary">
                <Zap className="h-3 w-3 mr-1" />
                Marketplace Empresarial 24/7
              </Badge>
              <CardTitle className="text-3xl font-bold gradient-text">
                🏪 Ofiz Market Pro
              </CardTitle>
            </div>
          </div>
          <CardDescription className="text-base">
            Compra productos profesionales con la comunidad más grande de Uruguay. Pagos seguros · Envíos nacionales
          </CardDescription>
        </CardHeader>

        {/* Stats Grid */}
        <CardContent className="relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/50 hover:border-primary/50 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Productos</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalProducts.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{stats.activeListings} activos</p>
            </div>

            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/50 hover:border-primary/50 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="h-5 w-5 text-secondary" />
                <span className="text-sm text-muted-foreground">Mis Compras</span>
              </div>
              <p className="text-2xl font-bold">{orders?.filter(o => o.buyer_id === profile?.id).length || 0}</p>
              <p className="text-xs text-muted-foreground">
                {orders?.filter(o => o.buyer_id === profile?.id && o.status === 'delivered').length || 0} recibidas
              </p>
            </div>

            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/50 hover:border-primary/50 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-5 w-5 text-accent" />
                <span className="text-sm text-muted-foreground">Favoritos</span>
              </div>
              <p className="text-2xl font-bold">{favorites?.length || 0}</p>
              <p className="text-xs text-muted-foreground">productos guardados</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="explorar" className="w-full">
        <TabsList className={`grid w-full ${isBusinessSeller ? 'grid-cols-3' : 'grid-cols-2'} mb-6`}>
          <TabsTrigger value="explorar" className="gap-2">
            <Store className="h-4 w-4" />
            Explorar Productos
          </TabsTrigger>
          <TabsTrigger value="compras" className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            Mis Compras
          </TabsTrigger>
          {isBusinessSeller && (
            <TabsTrigger value="ventas" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Mis Ventas
            </TabsTrigger>
          )}
        </TabsList>

        {/* Explorar Tab */}
        <TabsContent value="explorar" className="space-y-6">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos, equipamiento, servicios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 border-2"
              />
            </div>
            <Button variant="outline" size="lg" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              size="sm"
              className="whitespace-nowrap"
            >
              Todos
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                size="sm"
                className="whitespace-nowrap gap-1"
              >
                {category.icon} {category.name}
              </Button>
            ))}
          </div>

          {/* Featured Products */}
          {featuredProducts.length > 0 && (
            <Card className="border-2 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  Productos Destacados
                  <Badge variant="secondary">Premium</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {featuredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isFavorite={favorites.includes(product.id)}
                      onToggleFavorite={() => toggleFavorite(product.id)}
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowProductDialog(true);
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  No se encontraron productos
                </p>
                <p className="text-sm text-muted-foreground">
                  Intenta con otros términos de búsqueda
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite={favorites.includes(product.id)}
                  onToggleFavorite={() => toggleFavorite(product.id)}
                  onClick={() => {
                    setSelectedProduct(product);
                    setShowProductDialog(true);
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Mis Compras Tab */}
        <TabsContent value="compras" className="space-y-6">
          {myBuyerOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  No tienes compras aún
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Explora el marketplace y realiza tu primera compra
                </p>
                <Button onClick={() => document.querySelector('[value="explorar"]')?.dispatchEvent(new Event('click', { bubbles: true }))}>
                  Explorar productos
                </Button>
              </CardContent>
            </Card>
          ) : (
            <OrdersTable 
              orders={myBuyerOrders} 
              onUpdateStatus={updateOrderStatus}
              isSeller={false}
            />
          )}
        </TabsContent>

        {/* Mis Ventas Tab (Solo para empresas vendedoras) */}
        {isBusinessSeller && (
          <TabsContent value="ventas" className="space-y-6">
            <SellerDashboard
              balance={balance}
              products={myProducts}
              orders={mySellerOrders}
              onUpdateProduct={updateProduct}
              onUpdateStock={updateStock}
              onDeleteProduct={deleteProduct}
              onCreateProduct={createProduct}
              onUpdateOrderStatus={updateOrderStatus}
              categories={categories}
            />
          </TabsContent>
        )}
      </Tabs>

      {/* Product Dialog */}
      {selectedProduct && (
        <ProductDialog
          product={selectedProduct}
          open={showProductDialog}
          onOpenChange={setShowProductDialog}
          onPurchase={handlePurchase}
          onPaymentComplete={handlePaymentComplete}
          onUpdateOrderStatus={updateOrderStatus}
        />
      )}
    </div>
  );
}
