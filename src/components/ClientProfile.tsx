import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { User, Mail, Phone, MapPin, Save, Camera } from 'lucide-react';

const URUGUAY_LOCATIONS = [
  // Montevideo
  "Montevideo - Aguada", "Montevideo - Aires Puros", "Montevideo - Atahualpa", "Montevideo - Bella Italia",
  "Montevideo - Bella Vista", "Montevideo - Belvedere", "Montevideo - Bolívar", "Montevideo - Brazo Oriental",
  "Montevideo - Buceo", "Montevideo - Capurro", "Montevideo - Carrasco", "Montevideo - Carrasco Norte",
  "Montevideo - Casabó", "Montevideo - Casavalle", "Montevideo - Castro", "Montevideo - Centro",
  "Montevideo - Cerrito", "Montevideo - Cerro", "Montevideo - Ciudad Vieja", "Montevideo - Colón",
  "Montevideo - Cordón", "Montevideo - Goes", "Montevideo - Ituzaingó", "Montevideo - Jacinto Vera",
  "Montevideo - La Blanqueada", "Montevideo - La Comercial", "Montevideo - La Figurita", "Montevideo - Larrañaga",
  "Montevideo - Las Acacias", "Montevideo - Las Canteras", "Montevideo - Lezica", "Montevideo - Malvín",
  "Montevideo - Malvín Norte", "Montevideo - Manga", "Montevideo - Maroñas", "Montevideo - Mercado Modelo",
  "Montevideo - Nuevo París", "Montevideo - Palermo", "Montevideo - Parque Batlle", "Montevideo - Parque Rodó",
  "Montevideo - Paso de la Arena", "Montevideo - Paso de las Duranas", "Montevideo - Paso Molino", "Montevideo - Peñarol",
  "Montevideo - Piedras Blancas", "Montevideo - Pocitos", "Montevideo - Prado", "Montevideo - Punta Carretas",
  "Montevideo - Punta Gorda", "Montevideo - Reducto", "Montevideo - Retiro", "Montevideo - Sayago",
  "Montevideo - Tres Cruces", "Montevideo - Tres Ombúes", "Montevideo - Unión", "Montevideo - Villa Dolores",
  "Montevideo - Villa Española", "Montevideo - Villa Muñoz",
  
  // Canelones
  "Ciudad de la Costa - Solymar", "Ciudad de la Costa - Lagomar", "Ciudad de la Costa - Colinas de Solymar",
  "Ciudad de la Costa - Lomas de Solymar", "Ciudad de la Costa - Bello Horizonte", "Ciudad de la Costa - Parque del Plata",
  "Ciudad de la Costa - San José de Carrasco", "Ciudad de la Costa - Shangrilá", "Ciudad de la Costa - Montes de Solymar",
  "Las Piedras - Centro", "Las Piedras - Barrio Artigas", "Las Piedras - La Arbolada", "Las Piedras - Progreso",
  "Pando", "Canelones", "Santa Lucía", "Atlántida", "La Paz", "Salinas", "Barros Blancos",
  
  // Maldonado
  "Maldonado - Centro", "Maldonado - San Fernando", "Maldonado - Cerro Pelado", "Maldonado - Parque del Plata",
  "Punta del Este - Península", "Punta del Este - Playa Brava", "Punta del Este - Playa Mansa", "Punta del Este - Beverly Hills",
  "Punta del Este - San Rafael", "Punta del Este - Pinares", "Punta del Este - Cantegril", "Punta del Este - La Barra",
  "Piriápolis - Centro", "Piriápolis - Playa Grande", "Piriápolis - Playa Hermosa",
  "San Carlos", "Pan de Azúcar", "La Barra", "José Ignacio", "Punta Ballena",
  
  // Salto
  "Salto - Centro", "Salto - Barrio Artigas", "Salto - Barrio Ferrocarril", "Salto - Barrio Ceibal",
  "Salto - Barrio España", "Salto - Barrio Cerro", "Salto - Villa Constitución",
  
  // Paysandú
  "Paysandú - Centro", "Paysandú - Barrio Anglo", "Paysandú - Barrio Artigas", "Paysandú - Barrio Chacras",
  "Paysandú - Barrio Municipal", "Paysandú - Barrio Nuevo", "Paysandú - La Lata",
  
  // Rivera
  "Rivera - Centro", "Rivera - Barrio Artigas", "Rivera - Barrio Atahualpa", "Rivera - Cerro Marconi",
  "Rivera - Mandubí", "Rivera - Barrio Hospital",
  
  // Tacuarembó
  "Tacuarembó - Centro", "Tacuarembó - Barrio Artigas", "Tacuarembó - Barrio Ipora", "Tacuarembó - La Pedrera",
  "Tacuarembó - Barrio Olivera",
  
  // Cerro Largo
  "Melo - Centro", "Melo - Barrio Aparicio Saravia", "Melo - Barrio Artigas", "Melo - Barrio La Ventura",
  "Río Branco",
  
  // Colonia
  "Colonia del Sacramento - Centro", "Colonia del Sacramento - Barrio Real de San Carlos", "Colonia del Sacramento - Barrio Reus",
  "Carmelo - Centro", "Carmelo - Playa Seré", "Carmelo - Barrio Riachuelo",
  "Nueva Helvecia", "Juan Lacaze", "Rosario", "Tarariras",
  
  // Soriano
  "Mercedes - Centro", "Mercedes - Barrio Anglo", "Mercedes - Barrio Artigas", "Mercedes - Barrio Prado",
  "Dolores", "Cardona",
  
  // Flores
  "Trinidad - Centro", "Trinidad - Barrio Artigas", "Trinidad - Barrio Estación",
  
  // Florida
  "Florida - Centro", "Florida - Barrio Artigas", "Florida - Barrio Capilla", "Florida - Barrio Cerro Colorado",
  "Fray Marcos", "Sarandí Grande",
  
  // Durazno
  "Durazno - Centro", "Durazno - Barrio Artigas", "Durazno - Barrio Hospital", "Durazno - Barrio Parada",
  "Sarandí del Yi",
  
  // Treinta y Tres
  "Treinta y Tres - Centro", "Treinta y Tres - Barrio Artigas", "Treinta y Tres - Barrio Olivera",
  "Vergara",
  
  // Rocha
  "Rocha - Centro", "Rocha - Barrio Parque", "Rocha - Barrio 25 de Agosto",
  "La Paloma - Centro", "La Paloma - Anaconda", "La Paloma - Costa Azul", "La Paloma - La Aguada",
  "Chuy", "Castillos", "Lascano", "La Coronilla", "Cabo Polonio", "Punta del Diablo",
  
  // Artigas
  "Artigas - Centro", "Artigas - Barrio Rincón", "Artigas - Barrio Calpica", "Artigas - Barrio Terminal",
  "Bella Unión",
  
  // San José
  "San José de Mayo - Centro", "San José de Mayo - Barrio Anglo", "San José de Mayo - Barrio Ferrocarril",
  "Ciudad del Plata", "Libertad", "Ecilda Paullier", "Rafael Perazza",
  
  // Río Negro
  "Fray Bentos - Centro", "Fray Bentos - Barrio Anglo", "Fray Bentos - Barrio Nuevo", "Fray Bentos - Barrio Rincón",
  "Young", "San Javier",
  
  // Lavalleja
  "Minas - Centro", "Minas - Barrio Artigas", "Minas - Barrio Aparicio Saravia", "Minas - Villa Serrana",
  "José Pedro Varela", "Solís de Mataojo",
];

interface ClientProfileProps {
  profile: {
    id: string;
    full_name: string;
    phone: string | null;
    address: string | null;
    city: string | null;
    avatar_url: string | null;
  };
  onProfileUpdate: () => void;
}

export function ClientProfile({ profile, onProfileUpdate }: ClientProfileProps) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    phone: profile.phone || '',
    address: profile.address || '',
    city: profile.city || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "¡Perfil actualizado!",
        description: "Tus cambios han sido guardados exitosamente",
      });

      setEditing(false);
      onProfileUpdate();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Información Personal</CardTitle>
        <CardDescription>
          Gestiona tu información de perfil y preferencias
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {profile.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm">
                <Camera className="h-4 w-4 mr-2" />
                Cambiar Foto
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                JPG, PNG o GIF. Máximo 2MB
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name">Nombre Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    disabled={!editing}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!editing}
                    className="pl-10"
                    placeholder="+56 9 1234 5678"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={!editing}
                    className="pl-10"
                    placeholder="Calle, número, depto"
                  />
                </div>
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad y Barrio</Label>
                <Select
                  value={formData.city}
                  onValueChange={(value) => setFormData({ ...formData, city: value })}
                  disabled={!editing}
                >
                  <SelectTrigger id="city">
                    <SelectValue placeholder="Selecciona tu ciudad y barrio" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {URUGUAY_LOCATIONS.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              {editing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        full_name: profile.full_name || '',
                        phone: profile.phone || '',
                        address: profile.address || '',
                        city: profile.city || '',
                      });
                    }}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </>
              ) : (
                <Button type="button" onClick={() => setEditing(true)}>
                  Editar Perfil
                </Button>
              )}
            </div>
          </form>

          {/* Security Section */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-base">Seguridad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Cambiar Email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Cambiar Contraseña
              </Button>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
