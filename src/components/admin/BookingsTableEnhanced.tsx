import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import { TablePagination } from "./TablePagination";
import { TableSearch } from "./TableSearch";
import { ExportButton } from "./ExportButton";

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

interface BookingsTableEnhancedProps {
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

export const BookingsTableEnhanced = ({ onStatsUpdate }: BookingsTableEnhancedProps) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (bookingsError) throw bookingsError;

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

  // Filter and paginate
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (
        booking.client_name?.toLowerCase().includes(searchLower) ||
        booking.master_name?.toLowerCase().includes(searchLower) ||
        booking.service_title?.toLowerCase().includes(searchLower) ||
        booking.client_address?.toLowerCase().includes(searchLower)
      );
      const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredBookings.slice(startIndex, startIndex + pageSize);
  }, [filteredBookings, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredBookings.length / pageSize);

  const exportHeaders = [
    { key: 'service_title', label: 'Servicio' },
    { key: 'client_name', label: 'Cliente' },
    { key: 'master_name', label: 'Maestro' },
    { key: 'scheduled_date', label: 'Fecha Programada' },
    { key: 'total_price', label: 'Precio Total' },
    { key: 'status', label: 'Estado' },
    { key: 'client_address', label: 'Dirección' },
    { key: 'created_at', label: 'Fecha de Creación' },
  ];

  const exportData = filteredBookings.map(b => ({
    ...b,
    status: statusLabels[b.status],
  }));

  if (loading) {
    return <div>Cargando reservas...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-2 flex-1">
          <TableSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar reservas..."
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="confirmed">Confirmada</SelectItem>
              <SelectItem value="in_progress">En progreso</SelectItem>
              <SelectItem value="completed">Completada</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ExportButton
          data={exportData}
          filename="reservas"
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
              <TableHead>Fecha Programada</TableHead>
              <TableHead>Precio Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No se encontraron reservas
                </TableCell>
              </TableRow>
            ) : (
              paginatedBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">
                    {booking.service_title}
                  </TableCell>
                  <TableCell>{booking.client_name}</TableCell>
                  <TableCell>{booking.master_name}</TableCell>
                  <TableCell>
                    {new Date(booking.scheduled_date).toLocaleString()}
                  </TableCell>
                  <TableCell>${booking.total_price.toLocaleString()}</TableCell>
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={filteredBookings.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />
    </div>
  );
};