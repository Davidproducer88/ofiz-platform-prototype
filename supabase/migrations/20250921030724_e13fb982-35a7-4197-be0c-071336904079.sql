-- Create admin functionality with policies and functions

-- Create function to check if user is admin (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND user_type = 'admin'
  );
$$;

-- Update profiles RLS policies to allow admin full access
CREATE POLICY "Admins can delete profiles" ON public.profiles
FOR DELETE USING (public.is_admin());

-- Update masters RLS policies to allow admin full access
CREATE POLICY "Admins can view all masters" ON public.masters
FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all masters" ON public.masters
FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete masters" ON public.masters
FOR DELETE USING (public.is_admin());

-- Update services RLS policies to allow admin access
CREATE POLICY "Admins can manage all services" ON public.services
FOR ALL USING (public.is_admin());

-- Update bookings RLS policies to allow admin access
CREATE POLICY "Admins can view all bookings" ON public.bookings
FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all bookings" ON public.bookings
FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete bookings" ON public.bookings
FOR DELETE USING (public.is_admin());

-- Update reviews RLS policies to allow admin access
CREATE POLICY "Admins can manage all reviews" ON public.reviews
FOR ALL USING (public.is_admin());