import { useEffect, useRef, useCallback } from 'react';
import { useFeed } from '@/hooks/useFeed';
import { FeedCard } from './FeedCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Briefcase, Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Feed = () => {
  const navigate = useNavigate();
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
      {/* Header simplificado */}
      <div className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Servicios Disponibles</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/search-masters')}>
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="w-full border-b bg-muted/50">
        <div className="container py-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button 
              variant="outline" 
              className="justify-start gap-2"
              onClick={() => navigate('/search-masters')}
            >
              <Search className="h-4 w-4" />
              Buscar Profesionales
            </Button>
            <Button 
              variant="outline" 
              className="justify-start gap-2"
              onClick={() => navigate('/client-dashboard?tab=requests')}
            >
              <Plus className="h-4 w-4" />
              Crear Solicitud
            </Button>
            <Button 
              variant="outline" 
              className="justify-start gap-2"
              onClick={() => navigate('/client-dashboard')}
            >
              <Briefcase className="h-4 w-4" />
              Mis Servicios
            </Button>
          </div>
        </div>
      </div>

      {/* Feed Content */}
      <div className="container py-6">
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
              <h3 className="text-xl font-semibold mb-2">No hay servicios disponibles</h3>
              <p className="text-muted-foreground mb-4">Sé el primero en publicar un servicio</p>
              <Button onClick={() => navigate('/search-masters')}>Explorar Profesionales</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};