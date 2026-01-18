import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink, X, Megaphone } from 'lucide-react';

interface SponsoredAd {
  id: string;
  title: string;
  description: string;
  cta_text: string;
  cta_url: string;
  media_url: string | null;
  ad_type: string;
  business_id: string;
  impressions_count: number;
  clicks_count: number;
}

interface SponsoredAdBannerProps {
  targetAudience?: 'masters' | 'clients' | 'all';
  category?: string;
  variant?: 'banner' | 'sidebar' | 'feed';
}

export const SponsoredAdBanner = ({ 
  targetAudience = 'all', 
  category,
  variant = 'banner' 
}: SponsoredAdBannerProps) => {
  const [ad, setAd] = useState<SponsoredAd | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAd();
  }, [targetAudience, category]);

  const fetchAd = async () => {
    try {
      let query = supabase
        .from('advertisements')
        .select('id, title, description, cta_text, cta_url, media_url, ad_type, business_id, impressions_count, clicks_count')
        .eq('is_active', true)
        .eq('status', 'active')
        .or(`target_audience.eq.${targetAudience},target_audience.eq.all`)
        .gte('end_date', new Date().toISOString())
        .lte('start_date', new Date().toISOString());

      if (category) {
        query = query.eq('category', category as any);
      }

      const { data, error } = await query.limit(1).maybeSingle();

      if (error) throw error;
      
      if (data) {
        setAd(data as SponsoredAd);
        // Track impression
        await supabase
          .from('advertisements')
          .update({ impressions_count: (data.impressions_count || 0) + 1 })
          .eq('id', data.id);
      }
    } catch (error) {
      console.error('Error fetching ad:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async () => {
    if (!ad) return;

    // Track click
    try {
      await supabase
        .from('advertisements')
        .update({ clicks_count: (ad.clicks_count || 0) + 1 })
        .eq('id', ad.id);
    } catch (error) {
      console.error('Error tracking click:', error);
    }

    window.open(ad.cta_url, '_blank');
  };

  if (loading || !ad || dismissed) return null;

  if (variant === 'sidebar') {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background overflow-hidden">
        <CardContent className="p-4 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6 opacity-50 hover:opacity-100"
            onClick={() => setDismissed(true)}
          >
            <X className="h-3 w-3" />
          </Button>
          
          <Badge variant="secondary" className="mb-2 text-xs">
            <Megaphone className="h-3 w-3 mr-1" />
            Patrocinado
          </Badge>
          
          {ad.media_url && (
            <img 
              src={ad.media_url} 
              alt={ad.title}
              className="w-full h-24 object-cover rounded-md mb-3"
            />
          )}
          
          <h4 className="font-semibold text-sm mb-1 line-clamp-2">{ad.title}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{ad.description}</p>
          
          <Button size="sm" className="w-full" onClick={handleClick}>
            {ad.cta_text}
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'feed') {
    return (
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-background to-accent/5 overflow-hidden">
        <CardContent className="p-4 relative">
          <div className="flex items-start gap-4">
            {ad.media_url && (
              <img 
                src={ad.media_url} 
                alt={ad.title}
                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
              />
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <Badge variant="secondary" className="text-xs">
                  <Megaphone className="h-3 w-3 mr-1" />
                  Patrocinado
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-50 hover:opacity-100"
                  onClick={() => setDismissed(true)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              <h4 className="font-semibold mb-1 line-clamp-1">{ad.title}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{ad.description}</p>
              
              <Button size="sm" onClick={handleClick}>
                {ad.cta_text}
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default banner variant
  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-background to-accent/10 overflow-hidden">
      <CardContent className="p-4 md:p-6 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 opacity-50 hover:opacity-100"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          {ad.media_url && (
            <img 
              src={ad.media_url} 
              alt={ad.title}
              className="w-full md:w-32 h-24 md:h-20 object-cover rounded-lg"
            />
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-xs">
                <Megaphone className="h-3 w-3 mr-1" />
                Patrocinado
              </Badge>
            </div>
            <h3 className="font-bold text-lg mb-1">{ad.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{ad.description}</p>
          </div>
          
          <Button className="w-full md:w-auto" onClick={handleClick}>
            {ad.cta_text}
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
