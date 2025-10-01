import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Star } from 'lucide-react';

interface FiltersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    priceRange: [number, number];
    minRating: number;
    verifiedOnly: boolean;
  };
  onFiltersChange: (filters: {
    priceRange: [number, number];
    minRating: number;
    verifiedOnly: boolean;
  }) => void;
  onReset: () => void;
}

export function FiltersSheet({ 
  open, 
  onOpenChange, 
  filters,
  onFiltersChange,
  onReset 
}: FiltersSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filtros Avanzados</SheetTitle>
          <SheetDescription>
            Personaliza tu búsqueda de servicios
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Price Range */}
          <div className="space-y-4">
            <div>
              <Label>Rango de Precio</Label>
              <p className="text-sm text-muted-foreground">
                ${filters.priceRange[0].toLocaleString()} - ${filters.priceRange[1].toLocaleString()}
              </p>
            </div>
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => 
                onFiltersChange({ ...filters, priceRange: value as [number, number] })
              }
              min={0}
              max={50000}
              step={1000}
              className="w-full"
            />
          </div>

          <Separator />

          {/* Minimum Rating */}
          <div className="space-y-4">
            <Label>Calificación Mínima</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => 
                    onFiltersChange({ ...filters, minRating: rating })
                  }
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-6 w-6 ${
                      rating <= filters.minRating
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {filters.minRating === 0 ? "Sin filtro" : `${filters.minRating} estrellas o más`}
            </p>
          </div>

          <Separator />

          {/* Verified Only */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="verified">Solo Verificados</Label>
              <p className="text-sm text-muted-foreground">
                Mostrar solo profesionales verificados
              </p>
            </div>
            <Switch
              id="verified"
              checked={filters.verifiedOnly}
              onCheckedChange={(checked) =>
                onFiltersChange({ ...filters, verifiedOnly: checked })
              }
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onReset} className="flex-1">
            Limpiar Filtros
          </Button>
          <Button onClick={() => onOpenChange(false)} className="flex-1">
            Aplicar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
