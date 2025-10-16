import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, MapPin, Star, Award, DollarSign, Calendar, Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MasterSearchProps {
  businessId: string;
  onInvite?: (masterId: string) => void;
}

export const MasterSearch = ({ businessId, onInvite }: MasterSearchProps) => {
  const { toast } = useToast();
  const [masters, setMasters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    minRating: 0,
    maxHourlyRate: 10000,
    verified: false
  });

  useEffect(() => {
    searchMasters();
  }, [filters]);

  const searchMasters = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('masters')
        .select(`
          *,
          profile:profiles!inner(full_name, avatar_url, city),
          services:services(category, price)
        `)
        .gte('rating', filters.minRating);

      if (filters.category !== 'all') {
        query = query.contains('services.category', [filters.category]);
      }

      if (filters.verified) {
        query = query.eq('is_verified', true);
      }

      if (filters.maxHourlyRate < 10000) {
        query = query.lte('hourly_rate', filters.maxHourlyRate);
      }

      const { data, error } = await query.order('rating', { ascending: false });

      if (error) throw error;

      // Filter by search query if present
      let filteredData = data || [];
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredData = filteredData.filter(master =>
          master.business_name?.toLowerCase().includes(query) ||
          master.profile?.full_name?.toLowerCase().includes(query) ||
          master.description?.toLowerCase().includes(query) ||
          master.profile?.city?.toLowerCase().includes(query)
        );
      }

      setMasters(filteredData);
    } catch (error: any) {
      console.error('Error searching masters:', error);
      toast({
        title: "Error",
        description: "No se pudieron buscar los profesionales",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    searchMasters();
  };

  const handleInvite = async (masterId: string, masterName: string) => {
    if (onInvite) {
      onInvite(masterId);
    } else {
      toast({
        title: "Invitación enviada",
        description: `Se ha enviado una invitación a ${masterName}`,
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Búsqueda de Profesionales</h2>
        <p className="text-muted-foreground">
          Encuentra y conecta con los mejores profesionales
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, especialidad o ubicación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>Buscar</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoría</label>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="plumbing">Plomería</SelectItem>
                  <SelectItem value="electricity">Electricidad</SelectItem>
                  <SelectItem value="carpentry">Carpintería</SelectItem>
                  <SelectItem value="painting">Pintura</SelectItem>
                  <SelectItem value="cleaning">Limpieza</SelectItem>
                  <SelectItem value="gardening">Jardinería</SelectItem>
                  <SelectItem value="appliance">Electrodomésticos</SelectItem>
                  <SelectItem value="computer">Informática</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Calificación Mínima</label>
              <Select
                value={filters.minRating.toString()}
                onValueChange={(value) => setFilters(prev => ({ ...prev, minRating: parseFloat(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Todas</SelectItem>
                  <SelectItem value="3">3+ ⭐</SelectItem>
                  <SelectItem value="4">4+ ⭐</SelectItem>
                  <SelectItem value="4.5">4.5+ ⭐</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tarifa Máxima/Hora</label>
              <Select
                value={filters.maxHourlyRate.toString()}
                onValueChange={(value) => setFilters(prev => ({ ...prev, maxHourlyRate: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10000">Sin límite</SelectItem>
                  <SelectItem value="1000">Hasta $1,000</SelectItem>
                  <SelectItem value="2000">Hasta $2,000</SelectItem>
                  <SelectItem value="3000">Hasta $3,000</SelectItem>
                  <SelectItem value="5000">Hasta $5,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Buscando profesionales...</p>
        </div>
      ) : masters.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No se encontraron profesionales con los filtros seleccionados</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {masters.map((master) => (
            <Card key={master.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={master.profile?.avatar_url} />
                    <AvatarFallback>{getInitials(master.profile?.full_name || master.business_name)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {master.business_name || master.profile?.full_name}
                          {master.is_verified && (
                            <Badge variant="default" className="gap-1">
                              <Award className="h-3 w-3" />
                              Verificado
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-1">
                          {master.profile?.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {master.profile.city}
                            </span>
                          )}
                          {master.rating > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {master.rating.toFixed(1)} ({master.total_reviews} reseñas)
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      
                      <Button onClick={() => handleInvite(master.id, master.business_name)}>
                        <Mail className="h-4 w-4 mr-2" />
                        Invitar
                      </Button>
                    </div>

                    {master.description && (
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                        {master.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-3 mt-4 text-sm">
                      {master.experience_years > 0 && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {master.experience_years} años de experiencia
                        </div>
                      )}
                      {master.hourly_rate && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          ${master.hourly_rate.toLocaleString()}/hora
                        </div>
                      )}
                    </div>

                    {master.services && master.services.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {master.services.slice(0, 3).map((service: any, idx: number) => (
                          <Badge key={idx} variant="secondary">
                            {service.category}
                          </Badge>
                        ))}
                        {master.services.length > 3 && (
                          <Badge variant="outline">+{master.services.length - 3} más</Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
