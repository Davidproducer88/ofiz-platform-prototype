import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Edit, Trash2, Plus } from "lucide-react";
import { UserEditDialog } from "./UserEditDialog";
import { TablePagination } from "./TablePagination";
import { TableSearch } from "./TableSearch";
import { ExportButton } from "./ExportButton";

interface User {
  id: string;
  full_name: string;
  user_type: "client" | "master" | "admin" | "business";
  phone?: string;
  city?: string;
  address?: string;
  created_at: string;
}

interface UsersTableEnhancedProps {
  onStatsUpdate: () => void;
}

export const UsersTableEnhanced = ({ onStatsUpdate }: UsersTableEnhancedProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los usuarios",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter and paginate
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.full_name.toLowerCase().includes(searchLower) ||
        user.user_type.toLowerCase().includes(searchLower) ||
        user.phone?.toLowerCase().includes(searchLower) ||
        user.city?.toLowerCase().includes(searchLower)
      );
    });
  }, [users, searchTerm]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredUsers.slice(startIndex, startIndex + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente",
      });

      loadUsers();
      onStatsUpdate();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el usuario",
      });
    }
  };

  const handleCreateNew = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    loadUsers();
    onStatsUpdate();
    setIsDialogOpen(false);
  };

  const exportHeaders = [
    { key: 'full_name', label: 'Nombre' },
    { key: 'user_type', label: 'Tipo' },
    { key: 'phone', label: 'Teléfono' },
    { key: 'city', label: 'Ciudad' },
    { key: 'created_at', label: 'Fecha de Registro' },
  ];

  if (loading) {
    return <div>Cargando usuarios...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <TableSearch
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar usuarios..."
        />
        <div className="flex gap-2">
          <ExportButton
            data={filteredUsers}
            filename="usuarios"
            headers={exportHeaders}
          />
          <Button onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Crear Usuario
          </Button>
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Nombre</TableHead>
              <TableHead className="min-w-[120px]">Tipo</TableHead>
              <TableHead className="min-w-[120px]">Teléfono</TableHead>
              <TableHead className="min-w-[120px]">Ciudad</TableHead>
              <TableHead className="min-w-[150px]">Fecha de Registro</TableHead>
              <TableHead className="min-w-[150px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>
                    <Badge variant={
                      user.user_type === "admin" ? "destructive" : 
                      user.user_type === "master" ? "secondary" : "default"
                    }>
                      {user.user_type === "admin" ? "Administrador" :
                       user.user_type === "master" ? "Maestro" : 
                       user.user_type === "business" ? "Empresa" : "Cliente"}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.phone || "N/A"}</TableCell>
                  <TableCell>{user.city || "N/A"}</TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
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
        totalItems={filteredUsers.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />

      <UserEditDialog
        user={editingUser}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSave}
      />
    </div>
  );
};