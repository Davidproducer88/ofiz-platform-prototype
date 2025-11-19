import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchParams {
  searchQuery?: string;
  filters?: {
    priceRange?: [number, number];
    minRating?: number;
    city?: string;
    verifiedOnly?: boolean;
    category?: string;
    maxDistance?: number;
  };
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'distance';
  userLocation?: {
    lat: number;
    lng: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { searchQuery, filters = {}, sortBy = 'relevance', userLocation }: SearchParams = await req.json();

    console.log('Search params:', { searchQuery, filters, sortBy, userLocation });

    // Construir query base - usar left join para profiles y services
    let query = supabase
      .from("masters")
      .select(`
        id,
        business_name,
        description,
        hourly_rate,
        experience_years,
        rating,
        total_reviews,
        is_verified,
        latitude,
        longitude,
        profiles!masters_id_fkey (
          full_name,
          avatar_url,
          city,
          phone
        ),
        services (
          id,
          category,
          title,
          price,
          description
        )
      `);

    // Aplicar filtros
    if (filters.verifiedOnly) {
      query = query.eq("is_verified", true);
    }

    if (filters.minRating && filters.minRating > 0) {
      query = query.gte("rating", filters.minRating);
    }

    if (filters.priceRange) {
      query = query
        .gte("hourly_rate", filters.priceRange[0])
        .lte("hourly_rate", filters.priceRange[1]);
    }

    const { data: mastersData, error } = await query;

    if (error) {
      console.error('Error fetching masters:', error);
      throw error;
    }

    let masters = mastersData || [];
    console.log(`Found ${masters.length} masters before filtering`);
    console.log('Sample master:', masters[0] ? JSON.stringify({
      id: masters[0].id,
      business_name: masters[0].business_name,
      profiles: masters[0].profiles,
      services_count: masters[0].services?.length || 0
    }) : 'none');

    // Filtrar por ciudad si está especificado
    if (filters.city && filters.city !== "all") {
      const beforeCityFilter = masters.length;
      masters = masters.filter(master => 
        master.profiles?.city === filters.city
      );
      console.log(`City filter (${filters.city}): ${beforeCityFilter} -> ${masters.length} masters`);
    }

    // Filtro adicional por búsqueda de texto (solo si hay searchQuery)
    if (searchQuery && searchQuery.trim() !== "") {
      const searchTerm = searchQuery.trim().toLowerCase();
      const beforeTextFilter = masters.length;
      
      masters = masters.filter(master => {
        const fullName = master.profiles?.full_name?.toLowerCase() || '';
        const businessName = master.business_name?.toLowerCase() || '';
        const description = master.description?.toLowerCase() || '';
        const city = master.profiles?.city?.toLowerCase() || '';
        
        // Buscar en servicios
        const hasServiceMatch = master.services?.some((service: any) => 
          service.title?.toLowerCase().includes(searchTerm) ||
          service.category?.toLowerCase().includes(searchTerm) ||
          service.description?.toLowerCase().includes(searchTerm)
        );

        const matches = fullName.includes(searchTerm) || 
               businessName.includes(searchTerm) || 
               description.includes(searchTerm) ||
               city.includes(searchTerm) ||
               hasServiceMatch;
        
        return matches;
      });
      
      console.log(`Text search "${searchTerm}": ${beforeTextFilter} -> ${masters.length} masters`);
    }

    // Filtrar por categoría de servicios
    if (filters.category) {
      const beforeCategoryFilter = masters.length;
      masters = masters.filter(master => 
        master.services?.some((service: any) => 
          service.category === filters.category
        )
      );
      console.log(`Category filter (${filters.category}): ${beforeCategoryFilter} -> ${masters.length} masters`);
    }

    // Calcular distancias si hay ubicación del usuario
    if (userLocation) {
      masters = masters.map(master => {
        if (master.latitude && master.longitude) {
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            master.latitude,
            master.longitude
          );
          return { ...master, distance };
        }
        return master;
      });

      // Filtrar por distancia máxima si está definido
      if (filters.maxDistance) {
        masters = masters.filter(master => 
          master.distance !== undefined && master.distance <= filters.maxDistance!
        );
      }
    }

    // Ordenar resultados
    masters = sortMasters(masters, sortBy, userLocation);

    console.log(`Returning ${masters.length} masters after filtering and sorting`);

    return new Response(
      JSON.stringify(masters),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in search-master function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error searching masters',
        details: error 
      }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

// Función para calcular distancia usando fórmula de Haversine
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(value: number): number {
  return value * Math.PI / 180;
}

// Función para ordenar los resultados
function sortMasters(
  masters: any[], 
  sortBy: string, 
  userLocation?: { lat: number; lng: number }
): any[] {
  const sorted = [...masters];

  switch (sortBy) {
    case 'price_asc':
      return sorted.sort((a, b) => (a.hourly_rate || 0) - (b.hourly_rate || 0));
    
    case 'price_desc':
      return sorted.sort((a, b) => (b.hourly_rate || 0) - (a.hourly_rate || 0));
    
    case 'rating':
      return sorted.sort((a, b) => {
        const ratingDiff = (b.rating || 0) - (a.rating || 0);
        if (ratingDiff !== 0) return ratingDiff;
        return (b.total_reviews || 0) - (a.total_reviews || 0);
      });
    
    case 'distance':
      if (userLocation) {
        return sorted.sort((a, b) => {
          if (a.distance === undefined) return 1;
          if (b.distance === undefined) return -1;
          return a.distance - b.distance;
        });
      }
      return sorted;
    
    case 'relevance':
    default:
      // Ordenar por relevancia: verificados primero, luego por rating y reviews
      return sorted.sort((a, b) => {
        if (a.is_verified && !b.is_verified) return -1;
        if (!a.is_verified && b.is_verified) return 1;
        
        const ratingDiff = (b.rating || 0) - (a.rating || 0);
        if (ratingDiff !== 0) return ratingDiff;
        
        return (b.total_reviews || 0) - (a.total_reviews || 0);
      });
  }
}
