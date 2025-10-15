import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, SkipForward, Save } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const URUGUAY_CITIES = [
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

const ProfileSetup = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    avatar_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Pre-fill form with existing data
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        avatar_url: profile.avatar_url || ''
      });
    }

    // Pre-fill with OAuth data if available
    if (user.user_metadata) {
      setFormData(prev => ({
        ...prev,
        full_name: prev.full_name || user.user_metadata.full_name || user.user_metadata.name || '',
        avatar_url: prev.avatar_url || user.user_metadata.avatar_url || user.user_metadata.picture || ''
      }));
    }
  }, [user, profile, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      
      toast({
        title: "Foto subida",
        description: "Tu foto de perfil se ha actualizado correctamente"
      });
    } catch (error: any) {
      toast({
        title: "Error al subir foto",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone || null,
          address: formData.address || null,
          city: formData.city || null,
          avatar_url: formData.avatar_url || null
        })
        .eq('id', user?.id);

      if (error) throw error;

      await refreshProfile();
      
      toast({
        title: "Perfil actualizado",
        description: "Tu información se ha guardado correctamente"
      });

      // Redirect based on user type
      if (profile?.user_type === 'master') {
        navigate('/master-dashboard');
      } else if (profile?.user_type === 'admin') {
        navigate('/admin');
      } else {
        navigate('/client-dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Error al guardar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (profile?.user_type === 'master') {
      navigate('/master-dashboard');
    } else if (profile?.user_type === 'admin') {
      navigate('/admin');
    } else {
      navigate('/client-dashboard');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Completa tu perfil</CardTitle>
          <CardDescription>
            Ayúdanos a personalizar tu experiencia en OFIZ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={formData.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {formData.full_name ? formData.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={uploadAvatar}
                  disabled={uploading}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Haz clic en la cámara para subir tu foto
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nombre completo</Label>
                <Input
                  id="full_name"
                  type="text"
                  placeholder="Tu nombre completo"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+57 300 123 4567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Textarea
                  id="address"
                  placeholder="Tu dirección completa"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={loading}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Select 
                  value={formData.city} 
                  onValueChange={(value) => handleInputChange('city', value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu ciudad" />
                  </SelectTrigger>
                  <SelectContent>
                    {URUGUAY_CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                disabled={loading}
                className="flex-1"
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Omitir por ahora
              </Button>
              
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Guardar perfil
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSetup;