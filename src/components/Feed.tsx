import { useEffect, useRef, useCallback } from 'react';
import { useFeed } from '@/hooks/useFeed';
import { FeedCard } from './FeedCard';
import { FeedHeader } from './FeedHeader';
import { StoriesCarousel } from './StoriesCarousel';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Home, Compass, PlusCircle, Video, User } from 'lucide-react';
interface FeedProps {
  compact?: boolean;
}

export const Feed = ({ compact = false }: FeedProps) => {
  const {
    feedItems,
    loading,
    hasMore,
    loadMore,
    refresh,
    trackInteraction
  } = useFeed();
  const observerTarget = useRef<HTMLDivElement>(null);

  // Infinite scroll con Intersection Observer
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

  // Track view cuando un item entra en viewport
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
      }, {
        threshold: 0.5
      });
      observer.observe(element);
      observers.push(observer);
    });
    return () => {
      observers.forEach(obs => obs.disconnect());
    };
  }, [feedItems, trackInteraction]);
  return <div className={`w-full ${compact ? 'h-full' : 'min-h-screen'} bg-background ${compact ? '' : 'pb-20'}`}>
      {/* Header */}
      {!compact && <FeedHeader />}
      
      {/* Stories Carousel */}
      {!compact && <StoriesCarousel />}

      {/* Feed Content */}
      <div className={`w-full ${compact ? 'px-2 py-2' : 'max-w-2xl mx-auto px-4 py-6'}`}>
        {!compact && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Para ti</h2>
            <Button variant="ghost" size="sm" onClick={refresh} disabled={loading} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        )}

        {/* Lista del Feed */}
        <div className={compact ? 'space-y-2' : 'space-y-4'}>
          {feedItems.map((item, index) => <div key={`${item.type}-${item.id}-${index}`} id={`feed-item-${index}`} className="animate-fade-in" style={{
          animationDelay: `${index * 50}ms`
        }}>
              <FeedCard item={item} onInteraction={trackInteraction} compact={compact} />
            </div>)}

          {/* Loading skeletons */}
          {loading && <>
              {[1, 2].map(i => <div key={`skeleton-${i}`} className="space-y-3">
                  <Skeleton className={compact ? 'h-48 w-full rounded-lg' : 'h-80 w-full rounded-xl'} />
                </div>)}
            </>}

          {/* Infinite scroll trigger */}
          <div ref={observerTarget} className="h-20 flex items-center justify-center">
            {!loading && hasMore && <p className="text-sm text-muted-foreground">Cargando más contenido...</p>}
            {!loading && !hasMore && feedItems.length > 0 && <p className="text-sm text-muted-foreground">
                ¡Has visto todo el contenido disponible! 🎉
              </p>}
          </div>

          {/* Empty state */}
          {!loading && feedItems.length === 0 && <div className="text-center py-12">
              <Compass className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No hay contenido disponible
              </h3>
              <p className="text-muted-foreground mb-4">
                Vuelve más tarde para ver nuevas publicaciones y servicios
              </p>
              <Button onClick={refresh}>Intentar de nuevo</Button>
            </div>}
        </div>
      </div>

    </div>;
};