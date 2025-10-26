import { useEffect, useRef, useCallback } from 'react';
import { useFeed } from '@/hooks/useFeed';
import { FeedCard } from './FeedCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Briefcase, Search, Plus, Store, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { MarketplaceFeed } from './MarketplaceFeed';

export const Feed = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    feedItems,
    loading,
    hasMore,
    loadMore,
    refresh,
    trackInteraction
  } = useFeed();
  const observerTarget = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries;
    if (target.isIntersecting && hasMore && !loading) {
      loadMore();
    }
  }, [hasMore, loading, loadMore]);

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.5,
      rootMargin: '200px'
    });
    observer.observe(element);
    return () => {
      if (element) observer.unobserve(element);
    };
  }, [handleObserver]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    feedItems.forEach((item, index) => {
      const element = document.getElementById(`feed-item-${index}`);
      if (!element) return;
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            trackInteraction(item.id, item.type, 'view', item.data.category);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      observer.observe(element);
      observers.push(observer);
    });
    return () => {
      observers.forEach(obs => obs.disconnect());
    };
  }, [feedItems, trackInteraction]);

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="container py-6">
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="feed" className="gap-2">
              <Users className="h-4 w-4" />
              Feed Social
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="gap-2">
              <Store className="h-4 w-4" />
              Marketplace Pro
            </TabsTrigger>
            <TabsTrigger value="services" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Servicios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace">
            <MarketplaceFeed />
          </TabsContent>

          <TabsContent value="feed">
            <div className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur mb-4 -mx-4 px-4">
              <div className="flex h-14 items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Feed de Servicios</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            <div className="space-y-4 max-w-4xl mx-auto">
          {feedItems.map((item, index) => (
            <div 
              key={`${item.type}-${item.id}-${index}`} 
              id={`feed-item-${index}`}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <FeedCard item={item} onInteraction={trackInteraction} />
            </div>
          ))}

          {loading && (
            <>
              {[1, 2, 3].map(i => (
                <Skeleton key={`skeleton-${i}`} className="h-64 w-full rounded-lg" />
              ))}
            </>
          )}

          <div ref={observerTarget} className="h-20 flex items-center justify-center">
            {!loading && hasMore && (
              <p className="text-sm text-muted-foreground">Cargando más contenido...</p>
            )}
            {!loading && !hasMore && feedItems.length > 0 && (
              <p className="text-sm text-muted-foreground">Has visto todo el contenido</p>
            )}
          </div>

          {!loading && feedItems.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No hay contenido disponible</h3>
              <p className="text-muted-foreground mb-4">
                {user ? 'Empieza creando una solicitud de servicio o busca profesionales' : 'Inicia sesión para ver servicios y solicitudes'}
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => navigate('/search-masters')}>
                  <Search className="mr-2 h-4 w-4" />
                  Buscar Profesionales
                </Button>
                {user && (
                  <Button variant="outline" onClick={() => navigate('/client-dashboard?tab=requests')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Solicitud
                  </Button>
                )}
              </div>
            </div>
          )}
            </div>
          </TabsContent>

          <TabsContent value="services">
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Directorio de Servicios</h3>
              <p className="text-muted-foreground mb-4">Explora todos los servicios disponibles</p>
              <Button onClick={() => navigate('/search-masters')}>
                <Search className="mr-2 h-4 w-4" />
                Ver Todos los Servicios
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};