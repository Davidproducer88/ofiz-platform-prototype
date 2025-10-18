import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface User {
  id: string;
  full_name: string;
  user_type: "client" | "master" | "admin" | "business";
  phone?: string;
  city?: string;
  address?: string;
}

interface UserEditDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export const UserEditDialog = ({ user, open, onOpenChange, onSave }: UserEditDialogProps) => {
  const [formData, setFormData] = useState({
    full_name: "",
    user_type: "client" as "client" | "master" | "admin" | "business",
    phone: "",
    city: "",
    address: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        user_type: user.user_type,
        phone: user.phone || "",
        city: user.city || "",
        address: user.address || "",
        email: "",
        password: "",
      });
    } else {
      setFormData({
        full_name: "",
        user_type: "client",
        phone: "",
        city: "",
        address: "",
        email: "",
        password: "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (user) {
        // Actualizar usuario existente
        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: formData.full_name,
            user_type: formData.user_type,
            phone: formData.phone,
            city: formData.city,
            address: formData.address,
          })
          .eq("id", user.id);

        if (error) throw error;

        toast({
          title: "Usuario actualizado",
          description: "Los datos del usuario han sido actualizados exitosamente",
        });
      } else {
        // Crear nuevo usuario
        if (!formData.email || !formData.password) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Email y contraseña son requeridos para crear un usuario",
          });
          return;
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.full_name,
              user_type: formData.user_type,
            },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (authError) throw authError;

        if (authData.user) {
          // Actualizar perfil adicional si es necesario
          await supabase
            .from("profiles")
            .update({
              phone: formData.phone,
              city: formData.city,
              address: formData.address,
            })
            .eq("id", authData.user.id);
        }

        toast({
          title: "Usuario creado",
          description: "El nuevo usuario ha sido creado exitosamente",
        });
      }

      onSave();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Ocurrió un error al guardar el usuario",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {user ? "Editar Usuario" : "Crear Nuevo Usuario"}
          </DialogTitle>
          <DialogDescription>
            {user 
              ? "Modifica los datos del usuario seleccionado"
              : "Crea un nuevo usuario en el sistema"
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="full_name" className="text-right">
                Nombre
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            
            {!user && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
              </>
            )}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="user_type" className="text-right">
                Tipo
              </Label>
              <Select
                value={formData.user_type}
                onValueChange={(value: "client" | "master" | "admin" | "business") => 
                  setFormData({ ...formData, user_type: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Cliente</SelectItem>
                  <SelectItem value="master">Maestro</SelectItem>
                  <SelectItem value="business">Empresa</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Teléfono
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="city" className="text-right">
                Ciudad
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Dirección
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};