import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MapPin, Plus, Home, Building, Edit, Trash, Star } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Address {
  id: string;
  label: string;
  address: string;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
  notes: string | null;
  created_at: string;
}

export const AddressBook = () => {
  const { profile } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    address: '',
    city: '',
    notes: '',
    is_default: false,
  });

  useEffect(() => {
    fetchAddresses();
  }, [profile?.id]);

  const fetchAddresses = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('client_addresses')
        .select('*')
        .eq('client_id', profile.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las direcciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile?.id) return;

    try {
      if (editingAddress) {
        const { error } = await supabase
          .from('client_addresses')
          .update({
            label: formData.label,
            address: formData.address,
            city: formData.city || null,
            notes: formData.notes || null,
            is_default: formData.is_default,
          })
          .eq('id', editingAddress.id);

        if (error) throw error;

        toast({
          title: "Dirección actualizada",
          description: "La dirección se actualizó correctamente",
        });
      } else {
        const { error } = await supabase
          .from('client_addresses')
          .insert({
            client_id: profile.id,
            label: formData.label,
            address: formData.address,
            city: formData.city || null,
            notes: formData.notes || null,
            is_default: formData.is_default,
          });

        if (error) throw error;

        toast({
          title: "Dirección agregada",
          description: "La dirección se agregó correctamente",
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchAddresses();
    } catch (error: any) {
      console.error('Error saving address:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la dirección",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('client_addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Dirección eliminada",
        description: "La dirección se eliminó correctamente",
      });
      
      fetchAddresses();
    } catch (error: any) {
      console.error('Error deleting address:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la dirección",
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!profile?.id) return;

    try {
      // Remove default from all addresses
      await supabase
        .from('client_addresses')
        .update({ is_default: false })
        .eq('client_id', profile.id);

      // Set new default
      const { error } = await supabase
        .from('client_addresses')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Dirección predeterminada",
        description: "La dirección se estableció como predeterminada",
      });
      
      fetchAddresses();
    } catch (error: any) {
      console.error('Error setting default:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo establecer como predeterminada",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      address: address.address,
      city: address.city || '',
      notes: address.notes || '',
      is_default: address.is_default,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingAddress(null);
    setFormData({
      label: '',
      address: '',
      city: '',
      notes: '',
      is_default: false,
    });
  };

  const getIconForLabel = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('casa') || lowerLabel.includes('hogar')) {
      return <Home className="h-5 w-5" />;
    }
    if (lowerLabel.includes('oficina') || lowerLabel.includes('trabajo')) {
      return <Building className="h-5 w-5" />;
    }
    return <MapPin className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando direcciones...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mis Direcciones</h2>
          <p className="text-muted-foreground">Gestiona tus direcciones guardadas</p>
        </div>
        <Button onClick={() => {
          resetForm();
          setDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Dirección
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No tienes direcciones guardadas</h3>
            <p className="text-muted-foreground mb-4">
              Agrega direcciones para solicitar servicios más rápidamente
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Primera Dirección
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {addresses.map((address) => (
            <Card key={address.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getIconForLabel(address.label)}
                    <div>
                      <CardTitle className="text-base">{address.label}</CardTitle>
                      {address.is_default && (
                        <Badge variant="secondary" className="mt-1">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Predeterminada
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Dirección</p>
                  <p className="text-sm text-muted-foreground">{address.address}</p>
                </div>
                {address.city && (
                  <div>
                    <p className="text-sm font-medium">Ciudad</p>
                    <p className="text-sm text-muted-foreground">{address.city}</p>
                  </div>
                )}
                {address.notes && (
                  <div>
                    <p className="text-sm font-medium">Notas</p>
                    <p className="text-sm text-muted-foreground">{address.notes}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(address)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  {!address.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(address.id)}
                    >
                      <Star className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(address.id)}
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? 'Editar Dirección' : 'Nueva Dirección'}
            </DialogTitle>
            <DialogDescription>
              {editingAddress 
                ? 'Actualiza la información de la dirección' 
                : 'Agrega una nueva dirección para tus servicios'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="label">Etiqueta</Label>
              <Input
                id="label"
                placeholder="Casa, Oficina, etc."
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="address">Dirección Completa</Label>
              <Textarea
                id="address"
                placeholder="Calle, número, departamento, etc."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                placeholder="Ciudad"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Instrucciones de acceso, referencias, etc."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_default"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              />
              <Label htmlFor="is_default" className="cursor-pointer">
                Establecer como dirección predeterminada
              </Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingAddress ? 'Actualizar' : 'Agregar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
