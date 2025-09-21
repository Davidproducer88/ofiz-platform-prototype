import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Edit, Trash2, Star } from "lucide-react";

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

interface MastersTableProps {
  onStatsUpdate: () => void;
}

export const MastersTable = ({ onStatsUpdate }: MastersTableProps) => {
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div>Cargando maestros...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Lista de Maestros</h3>
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
            {masters.map((master) => (
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};