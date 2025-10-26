import { useState } from 'react';
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
  ShoppingBag
} from 'lucide-react';
import { useMarketplace } from '@/hooks/useMarketplace';
import { useAuth } from '@/hooks/useAuth';
import { ProductCard } from './marketplace/ProductCard';
import { ProductDialog } from './marketplace/ProductDialog';
import { OrdersTable } from './marketplace/OrdersTable';
import { SellerDashboard } from './marketplace/SellerDashboard';

export function MarketplaceFeed() {
  const { profile } = useAuth();
  const { 
    products, 
    orders, 
    categories,
    favorites,
    balance,
    loading,
    toggleFavorite,
    createOrder
  } = useMarketplace(profile?.id);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductDialog, setShowProductDialog] = useState(false);

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = 
      selectedCategory === 'all' || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredProducts = products.filter(p => p.featured).slice(0, 3);

  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    activeListings: products.filter(p => p.status === 'active').length,
    totalSales: orders.filter(o => o.status === 'delivered').length,
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
            Compra y vende productos profesionales con la comunidad más grande de Uruguay.
            <span className="font-semibold text-primary"> Comisión justa del 12%</span> · Pagos seguros · Envíos nacionales
          </CardDescription>
        </CardHeader>

        {/* Stats Grid */}
        <CardContent className="relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                <span className="text-sm text-muted-foreground">Órdenes</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{stats.totalSales} completadas</p>
            </div>

            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/50 hover:border-primary/50 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-accent" />
                <span className="text-sm text-muted-foreground">Favoritos</span>
              </div>
              <p className="text-2xl font-bold">{favorites.length}</p>
              <p className="text-xs text-muted-foreground">productos guardados</p>
            </div>

            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/50 hover:border-primary/50 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-sm text-muted-foreground">Ganancias</span>
              </div>
              <p className="text-2xl font-bold">${balance.total_earnings.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">${balance.available.toLocaleString()} disponible</p>
            </div>
          </div>

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
        </CardContent>
      </Card>

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

      {/* Main Content Tabs */}
      <Tabs defaultValue="marketplace" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="marketplace" className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            <Package className="h-4 w-4" />
            Mis Órdenes
          </TabsTrigger>
          <TabsTrigger value="seller" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Panel Vendedor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-4">
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

        <TabsContent value="orders">
          <OrdersTable orders={orders} />
        </TabsContent>

        <TabsContent value="seller">
          <SellerDashboard
            balance={balance}
            products={products.filter(p => p.business_id === profile?.id)}
            orders={orders.filter(o => o.seller_id === profile?.id)}
          />
        </TabsContent>
      </Tabs>

      {/* Product Dialog */}
      {selectedProduct && (
        <ProductDialog
          product={selectedProduct}
          open={showProductDialog}
          onOpenChange={setShowProductDialog}
          onPurchase={(quantity, address) => {
            createOrder({
              product_id: selectedProduct.id,
              quantity,
              unit_price: selectedProduct.price,
              shipping_address: address,
              shipping_cost: 0,
            });
            setShowProductDialog(false);
          }}
        />
      )}
    </div>
  );
}
