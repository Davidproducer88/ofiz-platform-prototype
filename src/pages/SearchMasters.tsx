import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { FiltersSheet } from "@/components/FiltersSheet";
import { MastersList } from "@/components/MastersList";
import { RecommendedMasters } from "@/components/RecommendedMasters";

interface SearchFilters {
  priceRange: [number, number];
  minRating: number;
  city: string;
  verifiedOnly: boolean;
  category?: string;
}

const SearchMasters = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    priceRange: [0, 10000],
    minRating: 0,
    city: "all",
    verifiedOnly: false,
  });

  const handleSearch = () => {
    // Trigger search with current query and filters
  };

  const handleResetFilters = () => {
    setFilters({
      priceRange: [0, 10000],
      minRating: 0,
      city: "all",
      verifiedOnly: false,
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Buscar profesionales por nombre, categoría o servicio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={() => setFiltersOpen(true)} variant="outline">
              Filtros
            </Button>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </div>

        {/* Recommended Masters */}
        {!searchQuery && (
          <RecommendedMasters />
        )}

        {/* Search Results */}
        <MastersList 
          searchQuery={searchQuery}
          filters={filters}
        />
      </main>

      <Footer />

      {/* Filters Sheet */}
      <FiltersSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={filters}
        onFiltersChange={setFilters}
        onReset={handleResetFilters}
      />
    </div>
  );
};

export default SearchMasters;
