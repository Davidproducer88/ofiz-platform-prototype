import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Star, Eye, TrendingUp } from 'lucide-react';
import type { MarketplaceProduct } from '@/hooks/useMarketplace';

interface ProductCardProps {
  product: MarketplaceProduct;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClick: () => void;
}

export function ProductCard({ product, isFavorite, onToggleFavorite, onClick }: ProductCardProps) {
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0;

  return (
    <Card className="group relative overflow-hidden hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 cursor-pointer">
      {/* Featured Badge */}
      {product.featured && (
        <Badge className="absolute top-3 left-3 z-10 bg-gradient-primary">
          <Star className="h-3 w-3 mr-1" />
          Featured
        </Badge>
      )}

      {/* Discount Badge */}
      {hasDiscount && (
        <Badge className="absolute top-3 right-3 z-10 bg-red-500 hover:bg-red-600">
          -{discountPercent}%
        </Badge>
      )}

      {/* Image */}
      <div className="relative aspect-square bg-muted overflow-hidden" onClick={onClick}>
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Quick Stats Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between text-white text-xs">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {product.views_count}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {product.sales_count} ventas
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4" onClick={onClick}>
        {/* Category */}
        {product.marketplace_categories && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <span>{product.marketplace_categories.icon}</span>
            <span>{product.marketplace_categories.name}</span>
          </div>
        )}

        {/* Title */}
        <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {product.title}
        </h3>

        {/* Seller */}
        {product.business_profiles && (
          <p className="text-xs text-muted-foreground mb-2">
            Por {product.business_profiles.company_name}
          </p>
        )}

        {/* Rating */}
        {product.reviews_count > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(product.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviews_count})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-primary">
            ${product.price.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through mb-1">
              ${product.compare_at_price!.toLocaleString()}
            </span>
          )}
        </div>

        {/* Stock */}
        {product.stock_quantity > 0 ? (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            {product.stock_quantity} disponibles
          </p>
        ) : (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            Sin stock
          </p>
        )}
      </CardContent>

      {/* Actions */}
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={isFavorite ? 'text-red-500 border-red-500' : ''}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </Button>
        <Button
          className="flex-1 gap-2"
          disabled={product.stock_quantity === 0}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <ShoppingCart className="h-4 w-4" />
          Comprar
        </Button>
      </CardFooter>
    </Card>
  );
}
