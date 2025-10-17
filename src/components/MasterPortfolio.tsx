import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string;
  display_order: number;
}

interface MasterPortfolioProps {
  masterId: string;
  isOwner?: boolean;
}

export function MasterPortfolio({ masterId, isOwner = false }: MasterPortfolioProps) {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: '',
    file: null as File | null
  });
  const { toast } = useToast();

  const categories = [
    { id: 'plumbing', name: 'Plomería' },
    { id: 'electricity', name: 'Electricidad' },
    { id: 'cleaning', name: 'Limpieza' },
    { id: 'computer_repair', name: 'Reparación PC' },
    { id: 'gardening', name: 'Jardinería' },
    { id: 'painting', name: 'Pintura' },
    { id: 'carpentry', name: 'Carpintería' },
    { id: 'appliance_repair', name: 'Reparaciones' },
  ];

  useEffect(() => {
    loadPortfolio();
  }, [masterId]);

  const loadPortfolio = async () => {
    try {
      const { data, error } = await supabase
        .from("master_portfolio")
        .select("*")
        .eq("master_id", masterId)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setPortfolio(data || []);
    } catch (error) {
      console.error("Error loading portfolio:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el portfolio",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm("¿Eliminar esta imagen del portfolio?")) return;

    try {
      const { error } = await supabase
        .from("master_portfolio")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      toast({
        title: "Eliminado",
        description: "Imagen eliminada del portfolio",
      });

      loadPortfolio();
    } catch (error) {
      console.error("Error deleting portfolio item:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la imagen",
        variant: "destructive",
      });
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadForm.title || !uploadForm.category || !uploadForm.file) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Upload image to storage
      const fileExt = uploadForm.file.name.split('.').pop();
      const fileName = `${masterId}-${Date.now()}.${fileExt}`;
      const filePath = `portfolio/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, uploadForm.file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase
        .from('master_portfolio')
        .insert({
          master_id: masterId,
          title: uploadForm.title,
          description: uploadForm.description || null,
          image_url: publicUrl,
          category: uploadForm.category as any,
          display_order: portfolio.length
        });

      if (dbError) throw dbError;

      toast({
        title: "¡Éxito!",
        description: "Imagen agregada al portfolio",
      });

      setUploadForm({ title: '', description: '', category: '', file: null });
      setUploadDialogOpen(false);
      loadPortfolio();
    } catch (error: any) {
      console.error("Error uploading to portfolio:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo subir la imagen",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    );
  }

  if (!loading && portfolio.length === 0 && !isOwner) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No hay imágenes en el portfolio
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {isOwner && (
        <div className="flex justify-end">
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Añadir Imagen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Añadir al Portfolio</DialogTitle>
                <DialogDescription>
                  Sube imágenes de tus trabajos completados
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleUpload}>
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input 
                    id="title" 
                    placeholder="Ej: Renovación de cocina"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoría *</Label>
                  <Select 
                    value={uploadForm.category} 
                    onValueChange={(value) => setUploadForm({ ...uploadForm, category: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe el trabajo realizado..."
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="image">Imagen *</Label>
                  <Input 
                    id="image" 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={uploading}>
                  {uploading ? "Subiendo..." : "Subir"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {portfolio.map((item) => (
          <Card key={item.id} className="group relative overflow-hidden">
            <CardContent className="p-0">
              <img
                src={item.image_url}
                alt={item.title}
                className="aspect-square object-cover w-full transition-transform group-hover:scale-105"
              />
              {isOwner && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(item.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <h4 className="text-white font-semibold text-sm">
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-white/80 text-xs line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
