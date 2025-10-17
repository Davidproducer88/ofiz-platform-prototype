import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, CheckCircle, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface RecommendedMaster {
  id: string;
  business_name: string;
  hourly_rate: number;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  profiles: {
    full_name: string;
    avatar_url: string;
    city: string;
  };
}

export const RecommendedMasters = () => {
  const [masters, setMasters] = useState<RecommendedMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCity, setUserCity] = useState<string | null>(null);

  useEffect(() => {
    fetchUserCity();
  }, []);

  useEffect(() => {
    if (userCity) {
      fetchRecommendedMasters();
    }
  }, [userCity]);

  const fetchUserCity = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("city")
          .eq("id", user.id)
          .single();
        
        setUserCity(profile?.city || null);
      }
    } catch (error) {
      console.error("Error fetching user city:", error);
    }
  };

  const fetchRecommendedMasters = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from("masters")
        .select(`
          id,
          business_name,
          hourly_rate,
          rating,
          total_reviews,
          is_verified,
          profiles!inner (
            full_name,
            avatar_url,
            city
          )
        `)
        .eq("is_verified", true)
        .gte("rating", 4.0)
        .order("rating", { ascending: false })
        .order("total_reviews", { ascending: false })
        .limit(6);

      // Filter by user's city if available
      if (userCity) {
        query = query.eq("profiles.city", userCity);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMasters(data || []);
    } catch (error) {
      console.error("Error fetching recommended masters:", error);
      toast.error("Error al cargar recomendaciones");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Profesionales Recomendados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-32 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (masters.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">
          {userCity ? `Profesionales Destacados en ${userCity}` : "Profesionales Destacados"}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {masters.map((master) => (
          <Card key={master.id} className="p-6 hover:shadow-lg transition-shadow bg-card/50 backdrop-blur">
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
                    ({master.total_reviews})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Badge variant="secondary">
                ${master.hourly_rate}/hora
              </Badge>
              <Badge variant="outline">
                {master.profiles.city}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
