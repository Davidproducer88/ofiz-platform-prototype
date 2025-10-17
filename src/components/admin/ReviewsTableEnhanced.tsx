import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Trash2, Star } from "lucide-react";
import { TablePagination } from "./TablePagination";
import { TableSearch } from "./TableSearch";
import { ExportButton } from "./ExportButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

interface ReviewsTableEnhancedProps {
  onStatsUpdate: () => void;
}

export const ReviewsTableEnhanced = ({ onStatsUpdate }: ReviewsTableEnhancedProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (reviewsError) throw reviewsError;

      const enrichedReviews = await Promise.all(
        (reviewsData || []).map(async (review) => {
          const [clientData, masterData, bookingData] = await Promise.all([
            supabase.from("profiles").select("full_name").eq("id", review.client_id).single(),
            supabase.from("profiles").select("full_name").eq("id", review.master_id).single(),
            supabase.from("bookings").select("service_id").eq("id", review.booking_id).single(),
          ]);

          let serviceTitle = "Servicio eliminado";
          if (bookingData.data?.service_id) {
            const { data: serviceData } = await supabase
              .from("services")
              .select("title")
              .eq("id", bookingData.data.service_id)
              .single();
            serviceTitle = serviceData?.title || "Servicio eliminado";
          }

          return {
            ...review,
            client_name: clientData.data?.full_name || "Cliente eliminado",
            master_name: masterData.data?.full_name || "Maestro eliminado",
            service_title: serviceTitle,
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
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
    );
  };

  // Filter and paginate
  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (
        review.client_name?.toLowerCase().includes(searchLower) ||
        review.master_name?.toLowerCase().includes(searchLower) ||
        review.service_title?.toLowerCase().includes(searchLower) ||
        review.comment?.toLowerCase().includes(searchLower)
      );
      const matchesRating = ratingFilter === "all" || review.rating === parseInt(ratingFilter);
      
      return matchesSearch && matchesRating;
    });
  }, [reviews, searchTerm, ratingFilter]);

  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredReviews.slice(startIndex, startIndex + pageSize);
  }, [filteredReviews, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredReviews.length / pageSize);

  const exportHeaders = [
    { key: 'service_title', label: 'Servicio' },
    { key: 'client_name', label: 'Cliente' },
    { key: 'master_name', label: 'Maestro' },
    { key: 'rating', label: 'Calificación' },
    { key: 'comment', label: 'Comentario' },
    { key: 'created_at', label: 'Fecha' },
  ];

  if (loading) {
    return <div>Cargando reseñas...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-2 flex-1">
          <TableSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar reseñas..."
          />
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por calificación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las calificaciones</SelectItem>
              <SelectItem value="5">5 estrellas</SelectItem>
              <SelectItem value="4">4 estrellas</SelectItem>
              <SelectItem value="3">3 estrellas</SelectItem>
              <SelectItem value="2">2 estrellas</SelectItem>
              <SelectItem value="1">1 estrella</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ExportButton
          data={filteredReviews}
          filename="resenas"
          headers={exportHeaders}
        />
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
            {paginatedReviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No se encontraron reseñas
                </TableCell>
              </TableRow>
            ) : (
              paginatedReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium">
                    {review.service_title}
                  </TableCell>
                  <TableCell>{review.client_name}</TableCell>
                  <TableCell>{review.master_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {renderStars(review.rating)}
                      <Badge variant="outline">{review.rating}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {review.comment || "Sin comentario"}
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={filteredReviews.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />
    </div>
  );
};