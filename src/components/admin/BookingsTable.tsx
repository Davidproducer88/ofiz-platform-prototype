import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

  interface Booking {
    id: string;
    total_price: number;
    status: BookingStatus;
    scheduled_date: string;
    client_address: string;
    notes?: string;
    created_at: string;
    client_id: string;
    master_id: string;
    service_id: string;
    client_name?: string;
    master_name?: string;
    service_title?: string;
  }

interface BookingsTableProps {
  onStatsUpdate: () => void;
}

const statusLabels = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  in_progress: "En progreso",
  completed: "Completada",
  cancelled: "Cancelada",
};

const statusVariants = {
  pending: "secondary" as const,
  confirmed: "default" as const,
  in_progress: "outline" as const,
  completed: "default" as const,
  cancelled: "destructive" as const,
};

export const BookingsTable = ({ onStatsUpdate }: BookingsTableProps) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      // Cargar reservas básicas
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (bookingsError) throw bookingsError;

      // Enriquecer con datos de clientes, maestros y servicios
      const enrichedBookings = await Promise.all(
        (bookingsData || []).map(async (booking) => {
          const [clientData, masterData, serviceData] = await Promise.all([
            supabase.from("profiles").select("full_name").eq("id", booking.client_id).single(),
            supabase.from("profiles").select("full_name").eq("id", booking.master_id).single(),
            supabase.from("services").select("title").eq("id", booking.service_id).single(),
          ]);

          return {
            ...booking,
            client_name: clientData.data?.full_name || "Usuario eliminado",
            master_name: masterData.data?.full_name || "Maestro eliminado",
            service_title: serviceData.data?.title || "Servicio eliminado",
          };
        })
      );

      setBookings(enrichedBookings);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error", 
        description: "No se pudieron cargar las reservas",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", bookingId);

      if (error) throw error;

      toast({
        title: "Estado actualizado",
        description: "El estado de la reserva ha sido actualizado",
      });

      loadBookings();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el estado de la reserva",
      });
    }
  };

  const handleDelete = async (bookingId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta reserva?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", bookingId);

      if (error) throw error;

      toast({
        title: "Reserva eliminada",
        description: "La reserva ha sido eliminada exitosamente",
      });

      loadBookings();
      onStatsUpdate();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la reserva",
      });
    }
  };

  if (loading) {
    return <div>Cargando reservas...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Lista de Reservas</h3>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Servicio</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Maestro</TableHead>
              <TableHead>Fecha Programada</TableHead>
              <TableHead>Precio Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">
                  {booking.service_title}
                </TableCell>
                <TableCell>
                  {booking.client_name}
                </TableCell>
                <TableCell>
                  {booking.master_name}
                </TableCell>
                <TableCell>
                  {new Date(booking.scheduled_date).toLocaleString()}
                </TableCell>
                <TableCell>
                  ${booking.total_price.toLocaleString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Badge variant={statusVariants[booking.status]}>
                      {statusLabels[booking.status]}
                    </Badge>
                    <Select
                      value={booking.status}
                      onValueChange={(value: BookingStatus) => 
                        handleStatusChange(booking.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="confirmed">Confirmada</SelectItem>
                        <SelectItem value="in_progress">En progreso</SelectItem>
                        <SelectItem value="completed">Completada</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(booking.id)}
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