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

interface Master {
  id: string;
  business_name: string;
  description?: string;
  hourly_rate?: number;
  rating?: number;
  total_reviews?: number;
  experience_years?: number;
  is_verified: boolean;
  created_at: string;
  profiles?: {
    full_name: string;
    phone?: string;
    city?: string;
  };
}

interface MastersTableEnhancedProps {
  onStatsUpdate: () => void;
}

export const MastersTableEnhanced = ({ onStatsUpdate }: MastersTableEnhancedProps) => {
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadMasters();
  }, []);

  const loadMasters = async () => {
    try {
      const { data, error } = await supabase
        .from("masters")
        .select(`
          *,
          profiles:id (
            full_name,
            phone,
            city
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMasters(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los maestros",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerification = async (masterId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("masters")
        .update({ is_verified: !currentStatus })
        .eq("id", masterId);

      if (error) throw error;

      toast({
        title: "Estado actualizado",
        description: `Maestro ${!currentStatus ? "verificado" : "desverificado"} exitosamente`,
      });

      loadMasters();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el estado de verificación",
      });
    }
  };

  const handleDelete = async (masterId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este maestro?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("masters")
        .delete()
        .eq("id", masterId);

      if (error) throw error;

      toast({
        title: "Maestro eliminado",
        description: "El maestro ha sido eliminado exitosamente",
      });

      loadMasters();
      onStatsUpdate();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el maestro",
      });
    }
  };

  // Filter and paginate
  const filteredMasters = useMemo(() => {
    return masters.filter(master => {
      const searchLower = searchTerm.toLowerCase();
      return (
        master.business_name?.toLowerCase().includes(searchLower) ||
        master.profiles?.full_name.toLowerCase().includes(searchLower) ||
        master.profiles?.city?.toLowerCase().includes(searchLower) ||
        master.description?.toLowerCase().includes(searchLower)
      );
    });
  }, [masters, searchTerm]);

  const paginatedMasters = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredMasters.slice(startIndex, startIndex + pageSize);
  }, [filteredMasters, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredMasters.length / pageSize);

  const exportHeaders = [
    { key: 'business_name', label: 'Nombre del Negocio' },
    { key: 'owner_name', label: 'Propietario' },
    { key: 'hourly_rate', label: 'Tarifa por Hora' },
    { key: 'rating', label: 'Calificación' },
    { key: 'total_reviews', label: 'Total Reseñas' },
    { key: 'experience_years', label: 'Años de Experiencia' },
    { key: 'is_verified', label: 'Verificado' },
    { key: 'created_at', label: 'Fecha de Registro' },
  ];

  const exportData = filteredMasters.map(m => ({
    ...m,
    owner_name: m.profiles?.full_name || 'N/A',
    is_verified: m.is_verified ? 'Sí' : 'No',
  }));

  if (loading) {
    return <div>Cargando maestros...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <TableSearch
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar maestros..."
        />
        <ExportButton
          data={exportData}
          filename="maestros"
          headers={exportHeaders}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre del Negocio</TableHead>
              <TableHead>Propietario</TableHead>
              <TableHead>Tarifa por Hora</TableHead>
              <TableHead>Calificación</TableHead>
              <TableHead>Experiencia</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedMasters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No se encontraron maestros
                </TableCell>
              </TableRow>
            ) : (
              paginatedMasters.map((master) => (
                <TableRow key={master.id}>
                  <TableCell className="font-medium">
                    {master.business_name || "Sin nombre"}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{master.profiles?.full_name || "N/A"}</div>
                      <div className="text-sm text-muted-foreground">
                        {master.profiles?.city || "Ciudad no especificada"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {master.hourly_rate 
                      ? `$${master.hourly_rate.toLocaleString()}/hora` 
                      : "No definida"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{master.rating?.toFixed(1) || "0.0"}</span>
                      <span className="text-sm text-muted-foreground">
                        ({master.total_reviews || 0})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {master.experience_years ? `${master.experience_years} años` : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={master.is_verified ? "default" : "secondary"}>
                      {master.is_verified ? "Verificado" : "Sin verificar"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleVerification(master.id, master.is_verified)}
                      >
                        {master.is_verified ? "Desverificar" : "Verificar"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(master.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
        totalItems={filteredMasters.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />
    </div>
  );
};