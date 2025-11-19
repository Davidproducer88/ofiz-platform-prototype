import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, ArrowUpDown } from "lucide-react";
import { FiltersSheet } from "@/components/FiltersSheet";
import { MastersList } from "@/components/MastersList";
import { RecommendedMasters } from "@/components/RecommendedMasters";
import { MastersMap } from "@/components/MastersMap";
import { useGeolocation } from "@/hooks/useGeolocation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SearchFilters {
  priceRange: [number, number];
  minRating: number;
  city: string;
  verifiedOnly: boolean;
  category?: string;
  maxDistance?: number;
}

export type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'distance';

const SearchMasters = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [filters, setFilters] = useState<SearchFilters>({
    priceRange: [0, 10000],
    minRating: 0,
    city: "all",
    verifiedOnly: false,
    category: undefined,
    maxDistance: undefined,
  });

  // Load category from URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setFilters(prev => ({ ...prev, category: categoryParam }));
    }
  }, [searchParams]);
  const [masters, setMasters] = useState<any[]>([]);
  const { location: userLocation, loading: locationLoading, refreshLocation } = useGeolocation();

  const handleSearch = () => {
    // Trigger search with current query and filters
  };

  const handleResetFilters = () => {
    setFilters({
      priceRange: [0, 10000],
      minRating: 0,
      city: "all",
      verifiedOnly: false,
      category: undefined,
      maxDistance: undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-4 sm:py-8">
        {/* Breadcrumbs */}
        <div className="mb-4">
          <Breadcrumbs items={[{ label: "Buscar Profesionales" }]} />
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="text"
                placeholder="Buscar profesionales..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <div className="flex gap-2 w-full sm:w-auto">
                <Button onClick={() => setFiltersOpen(true)} variant="outline" className="flex-1 sm:flex-none">
                  Filtros
                </Button>
                <Button onClick={refreshLocation} variant="outline" disabled={locationLoading} className="hidden sm:flex">
                  <MapPin className="h-4 w-4 sm:mr-2" />
                  <span className="hidden lg:inline">{locationLoading ? "Obteniendo..." : "Mi ubicación"}</span>
                </Button>
                <Button onClick={handleSearch} className="flex-1 sm:flex-none">
                  <Search className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Buscar</span>
                </Button>
              </div>
            </div>
            
            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Más relevantes</SelectItem>
                  <SelectItem value="rating">Mejor valorados</SelectItem>
                  <SelectItem value="price_asc">Precio: menor a mayor</SelectItem>
                  <SelectItem value="price_desc">Precio: mayor a menor</SelectItem>
                  {userLocation && (
                    <SelectItem value="distance">Más cercanos</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Recommended Masters - mostrar solo si no hay búsqueda ni filtros aplicados */}
        {!searchQuery && filters.city === "all" && filters.minRating === 0 && !filters.category && (
          <RecommendedMasters />
        )}

        {/* Search Results with Map - siempre mostrar */}
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
            <TabsTrigger value="list">Lista</TabsTrigger>
            <TabsTrigger value="map">Mapa</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <MastersList 
              searchQuery={searchQuery}
              filters={filters}
              sortBy={sortBy}
              userLocation={userLocation}
              onMastersChange={setMasters}
            />
          </TabsContent>
          
          <TabsContent value="map">
            <MastersMap 
              masters={masters}
              userLocation={userLocation}
            />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />

      {/* Filters Sheet */}
      <FiltersSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={filters}
        onFiltersChange={setFilters}
        onReset={handleResetFilters}
        userLocation={userLocation}
      />
    </div>
  );
};

export default SearchMasters;
