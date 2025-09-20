-- Fix security warnings by setting search_path for functions

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    COALESCE((NEW.raw_user_meta_data->>'user_type')::user_type, 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update handle_master_creation function
CREATE OR REPLACE FUNCTION public.handle_master_creation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_type = 'master' AND (OLD.user_type != 'master' OR OLD.user_type IS NULL) THEN
    INSERT INTO public.masters (id, business_name)
    VALUES (NEW.id, NEW.full_name || ' - Servicios')
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update update_master_rating function
CREATE OR REPLACE FUNCTION public.update_master_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.masters 
  SET 
    rating = (
      SELECT ROUND(AVG(rating)::numeric, 2) 
      FROM public.reviews 
      WHERE master_id = NEW.master_id
    ),
    total_reviews = (
      SELECT COUNT(*) 
      FROM public.reviews 
      WHERE master_id = NEW.master_id
    )
  WHERE id = NEW.master_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;