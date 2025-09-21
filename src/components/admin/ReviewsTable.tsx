import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Trash2, Star } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment?: string;
  created_at: string;
  client_id: string;
  master_id: string;
  booking_id: string;
  client_name?: string;
  master_name?: string;
  service_title?: string;
}

interface ReviewsTableProps {
  onStatsUpdate: () => void;
}

export const ReviewsTable = ({ onStatsUpdate }: ReviewsTableProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      // Cargar reseñas básicas
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (reviewsError) throw reviewsError;

      // Enriquecer con datos de clientes, maestros y servicios
      const enrichedReviews = await Promise.all(
        (reviewsData || []).map(async (review) => {
          const [clientData, masterData, bookingData] = await Promise.all([
            supabase.from("profiles").select("full_name").eq("id", review.client_id).single(),
            supabase.from("profiles").select("full_name").eq("id", review.master_id).single(),
            supabase.from("bookings").select("service_id").eq("id", review.booking_id).single(),
          ]);

          let service_title = "Servicio eliminado";
          if (bookingData.data?.service_id) {
            const { data: serviceData } = await supabase
              .from("services")
              .select("title")
              .eq("id", bookingData.data.service_id)
              .single();
            service_title = serviceData?.title || "Servicio eliminado";
          }

          return {
            ...review,
            client_name: clientData.data?.full_name || "Usuario eliminado",
            master_name: masterData.data?.full_name || "Maestro eliminado", 
            service_title,
          };
        })
      );

      setReviews(enrichedReviews);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las reseñas",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta reseña?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);

      if (error) throw error;

      toast({
        title: "Reseña eliminada",
        description: "La reseña ha sido eliminada exitosamente",
      });

      loadReviews();
      onStatsUpdate();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la reseña",
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating 
            ? "fill-yellow-400 text-yellow-400" 
            : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return <div>Cargando reseñas...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Lista de Reseñas</h3>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Servicio</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Maestro</TableHead>
              <TableHead>Calificación</TableHead>
              <TableHead>Comentario</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell className="font-medium">
                  {review.service_title}
                </TableCell>
                <TableCell>
                  {review.client_name}
                </TableCell>
                <TableCell>
                  {review.master_name}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    {renderStars(review.rating)}
                    <span className="ml-2">{review.rating}/5</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="truncate" title={review.comment || ""}>
                    {review.comment || "Sin comentario"}
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(review.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(review.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};