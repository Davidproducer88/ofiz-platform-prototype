import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Clock, MapPin, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  budget_range: string | null;
  photos: string[];
  created_at: string;
  status: string;
  profiles: {
    full_name: string;
    city: string | null;
  } | null;
}

interface ServiceRequestsListProps {
  onApply?: (requestId: string) => void;
}

const categoryLabels: Record<string, string> = {
  plumbing: "Plomería",
  electricity: "Electricidad",
  cleaning: "Limpieza",
  carpentry: "Carpintería",
  painting: "Pintura",
  gardening: "Jardinería",
  other: "Otro",
};

export function ServiceRequestsList({ onApply }: ServiceRequestsListProps) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("service-requests-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "service_requests",
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("service_requests")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      if (data && data.length > 0) {
        const clientIds = data.map(r => (r as any).client_id);
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, city")
          .in("id", clientIds);

        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
        const requestsWithProfiles = data.map(request => ({
          ...request,
          profiles: profilesMap.get((request as any).client_id) || null,
        }));

        setRequests(requestsWithProfiles as any);
      } else {
        setRequests([]);
      }
    } catch (error: any) {
      console.error("Error fetching requests:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las solicitudes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-center">
            No hay solicitudes de trabajo disponibles en este momento
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {requests.map((request) => (
        <Card key={request.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{request.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <Clock className="w-4 h-4" />
                  {formatDistanceToNow(new Date(request.created_at), {
                    addSuffix: true,
                    locale: es,
                  })}
                </CardDescription>
              </div>
              <Badge variant="secondary">
                {categoryLabels[request.category] || request.category}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {request.description}
            </p>

            {request.photos && request.photos.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
                {request.photos.slice(0, 3).map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Foto ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                ))}
                {request.photos.length > 3 && (
                  <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center text-sm text-muted-foreground">
                    +{request.photos.length - 3}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-sm">
              {request.budget_range && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <span>{request.budget_range}</span>
                </div>
              )}
              {request.profiles?.city && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{request.profiles.city}</span>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter>
            <Button
              onClick={() => onApply?.(request.id)}
              className="w-full"
            >
              Enviar presupuesto
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}