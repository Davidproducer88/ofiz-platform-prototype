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
  const { toast } = useToast();

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
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input id="title" placeholder="Ej: Renovación de cocina" />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe el trabajo realizado..."
                  />
                </div>
                <div>
                  <Label htmlFor="image">Imagen</Label>
                  <Input id="image" type="file" accept="image/*" />
                </div>
                <Button type="submit" className="w-full">
                  Subir
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
