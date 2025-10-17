import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, CheckCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface SearchFilters {
  priceRange: [number, number];
  minRating: number;
  city: string;
  verifiedOnly: boolean;
  category?: string;
  maxDistance?: number;
}

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
  userLocation?: { lat: number; lng: number } | null;
  onMastersChange?: (masters: Master[]) => void;
}

export const MastersList = ({ 
  searchQuery, 
  filters, 
  userLocation,
  onMastersChange 
}: MastersListProps) => {
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMasters();
  }, [searchQuery, filters, userLocation]);

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
          `business_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,profiles.full_name.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      
      let mastersWithDistance = (data || []) as Master[];

      // Calcular distancias si hay ubicación del usuario
      if (userLocation && mastersWithDistance.length > 0) {
        mastersWithDistance = mastersWithDistance.map(master => {
          if (master.latitude && master.longitude) {
            // Fórmula de Haversine simplificada
            const R = 6371; // Radio de la Tierra en km
            const dLat = (master.latitude - userLocation.lat) * Math.PI / 180;
            const dLon = (master.longitude - userLocation.lng) * Math.PI / 180;
            const a = 
              Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(userLocation.lat * Math.PI / 180) * 
              Math.cos(master.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = R * c;
            
            return { ...master, distance };
          }
          return master;
        });

        // Filtrar por distancia máxima si está configurado
        if (filters.maxDistance) {
          mastersWithDistance = mastersWithDistance.filter(
            master => master.distance !== undefined && master.distance <= filters.maxDistance!
          );
        }

        // Ordenar por distancia
        mastersWithDistance.sort((a, b) => {
          if (a.distance === undefined) return 1;
          if (b.distance === undefined) return -1;
          return a.distance - b.distance;
        });
      }

      setMasters(mastersWithDistance);
      if (onMastersChange) {
        onMastersChange(mastersWithDistance);
      }
    } catch (error) {
      console.error("Error fetching masters:", error);
      toast.error("Error al cargar profesionales");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {masters.map((master) => (
        <Card key={master.id} className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={master.profiles.avatar_url} />
              <AvatarFallback>{master.profiles.full_name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{master.profiles.full_name}</h3>
                {master.is_verified && (
                  <CheckCircle className="h-4 w-4 text-primary" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {master.business_name}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{master.rating}</span>
                <span className="text-sm text-muted-foreground">
                  ({master.total_reviews} reviews)
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {master.description}
          </p>

          <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{master.profiles.city}</span>
            {master.distance !== undefined && (
              <>
                <span className="text-primary font-medium">• {master.distance.toFixed(1)} km</span>
              </>
            )}
            <Clock className="h-4 w-4 ml-2" />
            <span>{master.experience_years} años exp.</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {master.services.slice(0, 3).map((service, idx) => (
              <Badge key={idx} variant="secondary">
                {getCategoryLabel(service.category)}
              </Badge>
            ))}
            {master.services.length > 3 && (
              <Badge variant="outline">+{master.services.length - 3}</Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold">
                ${master.hourly_rate}
              </span>
              <span className="text-sm text-muted-foreground">/hora</span>
            </div>
            <Button>Ver Perfil</Button>
          </div>
        </Card>
      ))}
    </div>
  );
};
