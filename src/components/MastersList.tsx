import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, MapPin, CheckCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { MasterProfile } from "@/components/MasterProfile";
import { createClient } from '@supabase/supabase-js'

interface SearchFilters {
  priceRange: [number, number];
  minRating: number;
  city: string;
  verifiedOnly: boolean;
  category?: string;
  maxDistance?: number;
}

export type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'distance';

interface Master {
  id: string;
  business_name: string;
  description: string;
  hourly_rate: number;
  experience_years: number;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  latitude: number | null;
  longitude: number | null;
  distance?: number;
  profiles: {
    full_name: string;
    avatar_url: string;
    city: string;
  };
  services: Array<{
    category: string;
    title: string;
  }>;
}

interface MastersListProps {
  searchQuery: string;
  filters: SearchFilters;
  sortBy?: SortOption;
  userLocation?: { lat: number; lng: number } | null;
  onMastersChange?: (masters: Master[]) => void;
}

export const MastersList = ({ 
  searchQuery, 
  filters,
  sortBy = 'relevance',
  userLocation,
  onMastersChange 
}: MastersListProps) => {
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  useEffect(() => {
    fetchMasters();
    searchMasters();
  }, [searchQuery, filters, sortBy, userLocation]);

  const fetchMasters = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from("masters")
        .select(`
          *,
          profiles!inner (
            full_name,
            avatar_url,
            city
          ),
          services (
            category,
            title
          )
        `);

      // Apply filters
      if (filters.verifiedOnly) {
        query = query.eq("is_verified", true);
      }

      if (filters.minRating > 0) {
        query = query.gte("rating", filters.minRating);
      }

      if (filters.city !== "all") {
        query = query.eq("profiles.city", filters.city);
      }

      if (filters.priceRange) {
        query = query
          .gte("hourly_rate", filters.priceRange[0])  
          .lte("hourly_rate", filters.priceRange[1]);
      }

      // Text search
      if (searchQuery) {
        query = query.or(
          `business_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
        );
      }

      // Invocar edge function para búsqueda avanzada
      const { data, error } = await supabase.functions.invoke('search-master', {
        body: { 
          searchQuery,
          filters: {
            priceRange: filters.priceRange,
            minRating: filters.minRating,
            city: filters.city,
            verifiedOnly: filters.verifiedOnly,
            category: filters.category,
            maxDistance: filters.maxDistance
          },
          sortBy,
          userLocation
        },
      });

      if (error) {
        console.error('Error searching masters:', error);
        throw error;
      }
      
      // La edge function ya devuelve los datos procesados y ordenados
      const mastersData = data as Master[];
      
      setMasters(mastersData);
      if (onMastersChange) {
        onMastersChange(mastersData);
      }
    } catch (error) {
      console.error("Error fetching masters:", error);
      toast.error("Error al cargar profesionales");
    } finally {
      setLoading(false);
    }
  };
  const searchMasters = async () => {
    const { data, error } = await supabase.functions.invoke('search-master', {
      body: { name: 'david' },
    })
    const results: Master[] = await data;
    console.log(results)
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      plumbing: "Plomería",
      electricity: "Electricidad",
      carpentry: "Carpintería",
      painting: "Pintura",
      cleaning: "Limpieza",
      gardening: "Jardinería",
      appliance_repair: "Reparación de Electrodomésticos",
      computer_repair: "Reparación de Computadoras",
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-48 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (masters.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No se encontraron profesionales con los criterios de búsqueda
        </p>
      </div>
    );
  }

  const handleViewProfile = (masterId: string) => {
    setSelectedMasterId(masterId);
    setProfileDialogOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {masters.map((master) => (
          <Card 
            key={master.id} 
            className="overflow-hidden hover:shadow-lg transition-all duration-300 border border-border"
          >
            {/* Header con Avatar */}
            <div className="p-6 flex flex-col items-center text-center border-b bg-gradient-to-b from-muted/30 to-background">
              <Avatar className="h-20 w-20 mb-4 ring-2 ring-primary/20">
                <AvatarImage src={master.profiles?.avatar_url} alt={master.business_name} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/50 text-primary-foreground text-2xl">
                  {master.business_name?.[0] || master.profiles.full_name?.[0]}
                </AvatarFallback>
              </Avatar>

              <h3 className="text-lg font-bold mb-1">{master.business_name || master.profiles.full_name}</h3>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <MapPin className="h-4 w-4" />
                <span>{master.profiles?.city}</span>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-4">
              {/* Servicios/Categoría */}
              {master.services && master.services.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {master.services.slice(0, 2).map((service, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {getCategoryLabel(service.category)}
                    </Badge>
                  ))}
                  {master.services.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{master.services.length - 2}
                    </Badge>
                  )}
                </div>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Experiencia</p>
                    <p className="font-medium">{master.experience_years} años</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xl">💰</span>
                  <div>
                    <p className="text-xs text-muted-foreground">Tarifa</p>
                    <p className="font-medium">${master.hourly_rate}/h</p>
                  </div>
                </div>
              </div>

              {/* Verificación y Rating */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-2">
                  {master.is_verified ? (
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      <span className="text-xs">Verificado</span>
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">No verificado</span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span className="font-medium text-sm">{master.rating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({master.total_reviews})</span>
                </div>
              </div>

              {/* Distancia (si está disponible) */}
              {master.distance !== undefined && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{master.distance.toFixed(1)} km de distancia</span>
                </div>
              )}
            </div>

            {/* Footer con botón */}
            <div className="p-4 bg-muted/30 border-t">
              <Button 
                className="w-full" 
                onClick={() => handleViewProfile(master.id)}
              >
                Ver perfil
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Master Profile Dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Perfil del Profesional</DialogTitle>
          </DialogHeader>
          {selectedMasterId && (
            <MasterProfile
              masterId={selectedMasterId}
              onClose={() => setProfileDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
