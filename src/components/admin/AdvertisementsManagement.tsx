import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Megaphone, 
  Eye, 
  MousePointer, 
  DollarSign, 
  Pause, 
  Play, 
  Trash2,
  RefreshCcw,
  BarChart3
} from "lucide-react";

interface Advertisement {
  id: string;
  business_id: string;
  title: string;
  description: string;
  ad_type: string;
  target_audience: string;
  budget: number;
  cost_per_impression: number;
  impressions_count: number;
  clicks_count: number;
  start_date: string;
  end_date: string;
  status: string;
  is_active: boolean;
  cta_text: string;
  cta_url: string;
  media_url: string | null;
  category: string | null;
  created_at: string;
  business_profiles?: {
    company_name: string;
  };
}

export const AdvertisementsManagement = () => {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadAdvertisements();
  }, [statusFilter]);

  const loadAdvertisements = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('advertisements')
        .select(`
          *,
          business_profiles (
            company_name
          )
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAdvertisements((data || []) as Advertisement[]);
    } catch (error) {
      console.error("Error loading advertisements:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los anuncios"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAdStatus = async (ad: Advertisement) => {
    try {
      const { error } = await supabase
        .from('advertisements')
        .update({ 
          is_active: !ad.is_active,
          status: !ad.is_active ? 'active' : 'paused'
        })
        .eq('id', ad.id);

      if (error) throw error;

      toast({
        title: ad.is_active ? "Anuncio pausado" : "Anuncio activado",
        description: `El anuncio "${ad.title}" ha sido ${ad.is_active ? 'pausado' : 'activado'}`
      });

      loadAdvertisements();
    } catch (error) {
      console.error("Error toggling ad status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cambiar el estado del anuncio"
      });
    }
  };

  const deleteAd = async (ad: Advertisement) => {
    if (!confirm(`¿Estás seguro de eliminar el anuncio "${ad.title}"?`)) return;

    try {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', ad.id);

      if (error) throw error;

      toast({
        title: "Anuncio eliminado",
        description: `El anuncio "${ad.title}" ha sido eliminado`
      });

      loadAdvertisements();
    } catch (error) {
      console.error("Error deleting ad:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el anuncio"
      });
    }
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) {
      return <Badge variant="secondary">Inactivo</Badge>;
    }
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Activo</Badge>;
      case 'paused':
        return <Badge variant="secondary">Pausado</Badge>;
      case 'completed':
        return <Badge variant="outline">Completado</Badge>;
      case 'pending':
        return <Badge variant="default">Pendiente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateCTR = (clicks: number, impressions: number) => {
    if (impressions === 0) return 0;
    return ((clicks / impressions) * 100).toFixed(2);
  };

  const calculateSpend = (impressions: number, costPerImpression: number) => {
    return impressions * costPerImpression;
  };

  // Stats
  const stats = {
    total: advertisements.length,
    active: advertisements.filter(a => a.is_active && a.status === 'active').length,
    paused: advertisements.filter(a => !a.is_active || a.status === 'paused').length,
    totalImpressions: advertisements.reduce((sum, a) => sum + a.impressions_count, 0),
    totalClicks: advertisements.reduce((sum, a) => sum + a.clicks_count, 0),
    totalSpend: advertisements.reduce((sum, a) => sum + calculateSpend(a.impressions_count, a.cost_per_impression), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              Total Anuncios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Play className="h-4 w-4 text-green-500" />
              Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Pause className="h-4 w-4" />
              Pausados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{stats.paused}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Impresiones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalImpressions.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MousePointer className="h-4 w-4" />
              Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Gasto Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSpend.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex justify-between items-center">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="paused">Pausados</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="completed">Completados</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={loadAdvertisements}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Advertisements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Anuncios Publicitarios</CardTitle>
          <CardDescription>Gestiona los anuncios de empresas en la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Anuncio</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Impresiones</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>CTR</TableHead>
                <TableHead>Gasto</TableHead>
                <TableHead>Período</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {advertisements.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{ad.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{ad.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {ad.business_profiles?.company_name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{ad.ad_type}</Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(ad.status, ad.is_active)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3 text-muted-foreground" />
                      {ad.impressions_count.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MousePointer className="h-3 w-3 text-muted-foreground" />
                      {ad.clicks_count.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {calculateCTR(ad.clicks_count, ad.impressions_count)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    ${calculateSpend(ad.impressions_count, ad.cost_per_impression).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <p>{format(new Date(ad.start_date), 'dd/MM/yy', { locale: es })}</p>
                      <p className="text-muted-foreground">al {format(new Date(ad.end_date), 'dd/MM/yy', { locale: es })}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAd(ad);
                          setDialogOpen(true);
                        }}
                        title="Ver detalles"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAdStatus(ad)}
                        title={ad.is_active ? "Pausar" : "Activar"}
                      >
                        {ad.is_active ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4 text-green-500" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAd(ad)}
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {advertisements.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                    No se encontraron anuncios
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Ad Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Anuncio</DialogTitle>
            <DialogDescription>
              {selectedAd?.title}
            </DialogDescription>
          </DialogHeader>

          {selectedAd && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Empresa</label>
                  <p className="font-medium">{selectedAd.business_profiles?.company_name}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Tipo</label>
                  <p className="font-medium">{selectedAd.ad_type}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Audiencia</label>
                  <p className="font-medium">{selectedAd.target_audience}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Categoría</label>
                  <p className="font-medium">{selectedAd.category || 'General'}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Descripción</label>
                <p className="text-sm">{selectedAd.description}</p>
              </div>

              <div className="grid grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedAd.impressions_count.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Impresiones</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedAd.clicks_count.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Clicks</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{calculateCTR(selectedAd.clicks_count, selectedAd.impressions_count)}%</p>
                  <p className="text-xs text-muted-foreground">CTR</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">${calculateSpend(selectedAd.impressions_count, selectedAd.cost_per_impression).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Gasto</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Presupuesto</label>
                  <p className="font-medium">${selectedAd.budget.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Costo por Impresión</label>
                  <p className="font-medium">${selectedAd.cost_per_impression}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">CTA</label>
                <div className="flex items-center gap-2">
                  <Badge>{selectedAd.cta_text}</Badge>
                  <a href={selectedAd.cta_url} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline">
                    {selectedAd.cta_url}
                  </a>
                </div>
              </div>

              {selectedAd.media_url && (
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Media</label>
                  <img src={selectedAd.media_url} alt="Ad media" className="rounded-lg max-h-48 object-cover" />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
