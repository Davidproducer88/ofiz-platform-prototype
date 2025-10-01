import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Clock, DollarSign, User, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ServiceApplication {
  id: string;
  proposed_price: number;
  message: string;
  status: string;
  created_at: string;
  masters: {
    business_name: string | null;
    rating: number | null;
    profiles: {
      full_name: string;
      phone: string | null;
    } | null;
  } | null;
}

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  budget_range: string | null;
  photos: string[];
  status: string;
  created_at: string;
  service_applications: ServiceApplication[];
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

const statusLabels: Record<string, string> = {
  open: "Abierta",
  in_progress: "En progreso",
  closed: "Cerrada",
  cancelled: "Cancelada",
};

export function MyServiceRequests() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMyRequests();

    const channel = supabase
      .channel("my-requests-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "service_requests",
        },
        () => {
          fetchMyRequests();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "service_applications",
        },
        () => {
          fetchMyRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMyRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("service_requests")
        .select(`
          *,
          service_applications (
            id,
            proposed_price,
            message,
            status,
            created_at,
            masters (
              business_name,
              rating,
              profiles:id (
                full_name,
                phone
              )
            )
          )
        `)
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      console.error("Error fetching requests:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar tus solicitudes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("service_applications")
        .update({ status })
        .eq("id", applicationId);

      if (error) throw error;

      toast({
        title: "Estado actualizado",
        description: `Presupuesto ${status === "accepted" ? "aceptado" : "rechazado"}`,
      });

      fetchMyRequests();
    } catch (error: any) {
      console.error("Error updating application:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
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
            No has publicado ninguna solicitud aún
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle>{request.title}</CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDistanceToNow(new Date(request.created_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </span>
                  {request.budget_range && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {request.budget_range}
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary">
                  {categoryLabels[request.category] || request.category}
                </Badge>
                <Badge
                  variant={
                    request.status === "open"
                      ? "default"
                      : request.status === "closed"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {statusLabels[request.status] || request.status}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{request.description}</p>

            {request.photos && request.photos.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
                {request.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Foto ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

            {request.service_applications.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Presupuestos recibidos ({request.service_applications.length})
                </h4>

                <Accordion type="single" collapsible className="w-full">
                  {request.service_applications.map((application) => (
                    <AccordionItem key={application.id} value={application.id}>
                      <AccordionTrigger>
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>
                              {application.masters?.business_name ||
                                application.masters?.profiles?.full_name ||
                                "Maestro"}
                            </span>
                            {application.masters?.rating && (
                              <Badge variant="outline">
                                ⭐ {application.masters.rating.toFixed(1)}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              ${application.proposed_price}
                            </span>
                            <Badge
                              variant={
                                application.status === "accepted"
                                  ? "default"
                                  : application.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {application.status === "accepted"
                                ? "Aceptado"
                                : application.status === "rejected"
                                ? "Rechazado"
                                : "Pendiente"}
                            </Badge>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-4">
                          <p className="text-sm text-muted-foreground">
                            {application.message}
                          </p>

                          {application.masters?.profiles?.phone && (
                            <p className="text-sm">
                              <strong>Teléfono:</strong>{" "}
                              {application.masters.profiles.phone}
                            </p>
                          )}

                          {application.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateApplicationStatus(application.id, "accepted")
                                }
                              >
                                Aceptar presupuesto
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateApplicationStatus(application.id, "rejected")
                                }
                              >
                                Rechazar
                              </Button>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}

            {request.service_applications.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aún no has recibido presupuestos para esta solicitud
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}