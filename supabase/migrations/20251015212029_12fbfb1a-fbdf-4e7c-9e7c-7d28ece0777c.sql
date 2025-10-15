-- Tabla de publicaciones del feed (posts de masters, actualizaciones, tips)
CREATE TABLE public.feed_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  master_id UUID NOT NULL REFERENCES public.masters(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'update', -- 'update', 'tip', 'showcase', 'promotion'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  category service_category,
  engagement_score NUMERIC DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de contenido patrocinado
CREATE TABLE public.sponsored_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  master_id UUID REFERENCES public.masters(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'service_ad', -- 'service_ad', 'brand_ad', 'featured'
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT,
  cta_text TEXT,
  cta_url TEXT,
  category service_category,
  budget NUMERIC,
  impressions_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de interacciones del usuario (para el algoritmo)
CREATE TABLE public.user_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  interaction_type TEXT NOT NULL, -- 'view', 'like', 'click', 'save', 'share', 'booking', 'message'
  target_type TEXT NOT NULL, -- 'post', 'service', 'master', 'sponsored'
  target_id UUID NOT NULL,
  category service_category,
  weight NUMERIC DEFAULT 1.0, -- peso de la interacción para el algoritmo
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para optimizar queries del feed
CREATE INDEX idx_feed_posts_master_id ON public.feed_posts(master_id);
CREATE INDEX idx_feed_posts_category ON public.feed_posts(category);
CREATE INDEX idx_feed_posts_created_at ON public.feed_posts(created_at DESC);
CREATE INDEX idx_user_interactions_user_id ON public.user_interactions(user_id);
CREATE INDEX idx_user_interactions_category ON public.user_interactions(category);
CREATE INDEX idx_sponsored_content_active ON public.sponsored_content(is_active, start_date, end_date);

-- RLS Policies para feed_posts
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published posts"
  ON public.feed_posts FOR SELECT
  USING (true);

CREATE POLICY "Masters can create own posts"
  ON public.feed_posts FOR INSERT
  WITH CHECK (master_id IN (SELECT id FROM masters WHERE id = auth.uid()));

CREATE POLICY "Masters can update own posts"
  ON public.feed_posts FOR UPDATE
  USING (master_id IN (SELECT id FROM masters WHERE id = auth.uid()));

CREATE POLICY "Masters can delete own posts"
  ON public.feed_posts FOR DELETE
  USING (master_id IN (SELECT id FROM masters WHERE id = auth.uid()));

-- RLS Policies para sponsored_content
ALTER TABLE public.sponsored_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active sponsored content"
  ON public.sponsored_content FOR SELECT
  USING (is_active = true AND start_date <= now() AND end_date >= now());

CREATE POLICY "Admins can manage sponsored content"
  ON public.sponsored_content FOR ALL
  USING (is_admin());

-- RLS Policies para user_interactions
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create own interactions"
  ON public.user_interactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own interactions"
  ON public.user_interactions FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

-- Trigger para actualizar engagement_score
CREATE OR REPLACE FUNCTION update_post_engagement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.feed_posts
  SET engagement_score = (
    views_count * 0.1 + 
    likes_count * 1.0 +
    (SELECT COUNT(*) FROM user_interactions WHERE target_id = NEW.target_id AND interaction_type IN ('share', 'save')) * 2.0
  )
  WHERE id = NEW.target_id AND NEW.target_type = 'post';
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_engagement_on_interaction
AFTER INSERT ON public.user_interactions
FOR EACH ROW
EXECUTE FUNCTION update_post_engagement();