import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Eye, MousePointer, Calendar, TrendingUp, Pause, Play, Trash2 } from "lucide-react";

interface AdvertisementManagerProps {
  businessId: string;
  subscription: any;
  onUpdate: () => void;
}

export const AdvertisementManager = ({ businessId, subscription, onUpdate }: AdvertisementManagerProps) => {
  const { toast } = useToast();
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ad_type: 'banner',
    target_audience: 'masters',
    category: '',
    cta_text: 'Ver más',
    cta_url: '',
    budget: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchAds();
  }, [businessId]);

  const fetchAds = async () => {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAds(data || []);
    } catch (error: any) {
      console.error('Error fetching ads:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los anuncios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subscription || subscription.status !== 'active' || !subscription.can_post_ads) {
      toast({
        title: "Función no disponible",
        description: "Necesitas una suscripción activa con publicidad habilitada para crear anuncios",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('advertisements')
        .insert([{
          business_id: businessId,
          ...formData,
          budget: parseFloat(formData.budget),
          category: formData.category as any || null
        }]);

      if (error) throw error;

      toast({
        title: "Anuncio creado",
        description: "Tu anuncio está pendiente de aprobación",
      });

      setDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        ad_type: 'banner',
        target_audience: 'masters',
        category: '',
        cta_text: 'Ver más',
        cta_url: '',
        budget: '',
        start_date: '',
        end_date: ''
      });
      fetchAds();
      onUpdate();
    } catch (error: any) {
      const errorMessage = error?.message || "No se pudo crear el anuncio";
      console.error('Error creating ad:', errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const toggleAdStatus = async (adId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('advertisements')
        .update({ is_active: !currentStatus })
        .eq('id', adId);

      if (error) throw error;

      toast({
        title: currentStatus ? "Anuncio pausado" : "Anuncio activado",
        description: `El anuncio ha sido ${currentStatus ? 'pausado' : 'activado'} correctamente`,
      });

      fetchAds();
      onUpdate();
    } catch (error: any) {
      console.error('Error toggling ad status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del anuncio",
        variant: "destructive",
      });
    }
  };

  const deleteAd = async (adId: string) => {
    if (!confirm('¿Estás seguro de eliminar este anuncio?')) return;

    try {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', adId);

      if (error) throw error;

      toast({
        title: "Anuncio eliminado",
        description: "El anuncio ha sido eliminado correctamente",
      });

      fetchAds();
      onUpdate();
    } catch (error: any) {
      console.error('Error deleting ad:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el anuncio",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Publicidad</h2>
          <p className="text-muted-foreground">
            Crea y administra tus campañas publicitarias
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!subscription || subscription.status !== 'active' || !subscription.can_post_ads}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Anuncio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreateAd}>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Anuncio</DialogTitle>
                <DialogDescription>
                  Completa la información para crear tu campaña publicitaria
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ad_type">Tipo de Anuncio</Label>
                    <Select value={formData.ad_type} onValueChange={(value) => setFormData({ ...formData, ad_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="banner">Banner Principal</SelectItem>
                        <SelectItem value="sidebar">Sidebar</SelectItem>
                        <SelectItem value="feed_sponsored">Post Patrocinado</SelectItem>
                        <SelectItem value="dashboard_promo">Promoción en Dashboard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target_audience">Audiencia</Label>
                    <Select value={formData.target_audience} onValueChange={(value) => setFormData({ ...formData, target_audience: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masters">Solo Maestros</SelectItem>
                        <SelectItem value="clients">Solo Clientes</SelectItem>
                        <SelectItem value="all">Todos los usuarios</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cta_text">Texto del Botón</Label>
                    <Input
                      id="cta_text"
                      value={formData.cta_text}
                      onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cta_url">URL de Destino *</Label>
                    <Input
                      id="cta_url"
                      type="url"
                      value={formData.cta_url}
                      onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Presupuesto ($) *</Label>
                    <Input
                      id="budget"
                      type="number"
                      min="100"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start_date">Fecha Inicio *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">Fecha Fin *</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Crear Anuncio
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando anuncios...</p>
        </div>
      ) : ads.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No tienes anuncios creados aún</p>
            {subscription?.can_post_ads ? (
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear tu primer anuncio
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Activa una suscripción para comenzar a crear anuncios
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {ads.map((ad) => (
            <Card key={ad.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{ad.title}</CardTitle>
                      <Badge variant={
                        ad.status === 'active' ? 'default' :
                        ad.status === 'pending' ? 'secondary' :
                        ad.status === 'paused' ? 'outline' : 'destructive'
                      }>
                        {ad.status}
                      </Badge>
                      {ad.is_active && <Badge variant="secondary">Activo</Badge>}
                    </div>
                    <CardDescription>{ad.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleAdStatus(ad.id, ad.is_active)}
                      disabled={ad.status !== 'active'}
                    >
                      {ad.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteAd(ad.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{ad.impressions_count.toLocaleString()}</p>
                      <p className="text-muted-foreground">Impresiones</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MousePointer className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{ad.clicks_count.toLocaleString()}</p>
                      <p className="text-muted-foreground">Clics</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {ad.impressions_count > 0 ? ((ad.clicks_count / ad.impressions_count) * 100).toFixed(2) : 0}%
                      </p>
                      <p className="text-muted-foreground">CTR</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">${ad.budget.toLocaleString()}</p>
                      <p className="text-muted-foreground">Presupuesto</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};