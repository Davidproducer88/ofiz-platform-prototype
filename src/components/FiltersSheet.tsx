import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star } from 'lucide-react';
import { URUGUAY_LOCATIONS } from '@/lib/locations';
import { SERVICE_CATEGORIES } from '@/lib/categories';

interface FiltersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    priceRange: [number, number];
    minRating: number;
    verifiedOnly: boolean;
    city: string;
    category?: string;
    maxDistance?: number;
  };
  onFiltersChange: (filters: {
    priceRange: [number, number];
    minRating: number;
    verifiedOnly: boolean;
    city: string;
    category?: string;
    maxDistance?: number;
  }) => void;
  onReset: () => void;
  userLocation?: { lat: number; lng: number } | null;
}

export function FiltersSheet({ 
  open, 
  onOpenChange, 
  filters,
  onFiltersChange,
  onReset,
  userLocation
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
              max={500000}
              step={5000}
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

          {/* Category Filter */}
          <div className="space-y-4">
            <Label>Categoría de Servicio</Label>
            <Select
              value={filters.category || "all"}
              onValueChange={(value) => 
                onFiltersChange({ ...filters, category: value === "all" ? undefined : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="all">Todas las categorías</SelectItem>
                {SERVICE_CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  return (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${category.color}`} />
                        <span>{category.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Distance Filter (only if user location is available) */}
          {userLocation && (
            <>
              <div className="space-y-4">
                <div>
                  <Label>Distancia Máxima</Label>
                  <p className="text-sm text-muted-foreground">
                    {filters.maxDistance 
                      ? `Hasta ${filters.maxDistance} km de tu ubicación`
                      : "Sin límite de distancia"}
                  </p>
                </div>
                <Slider
                  value={[filters.maxDistance || 50]}
                  onValueChange={(value) => 
                    onFiltersChange({ ...filters, maxDistance: value[0] })
                  }
                  min={1}
                  max={50}
                  step={1}
                  className="w-full"
                />
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onFiltersChange({ ...filters, maxDistance: undefined })}
                  className="w-full"
                >
                  Eliminar filtro de distancia
                </Button>
              </div>
              <Separator />
            </>
          )}

          {/* City Filter */}
          <div className="space-y-4">
            <Label>Buscar por Zona</Label>
            <Select
              value={filters.city}
              onValueChange={(value) => 
                onFiltersChange({ ...filters, city: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona ciudad y barrio" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="all">Todas las zonas</SelectItem>
                {URUGUAY_LOCATIONS.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
