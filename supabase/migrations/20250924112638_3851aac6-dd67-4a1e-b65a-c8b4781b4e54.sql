-- Fix security vulnerability: Restrict profiles table access
-- Replace the overly permissive "Users can view all profiles" policy

-- First, drop the existing insecure policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a new secure policy that only allows:
-- 1. Users to view their own profile
-- 2. Admins to view all profiles (needed for admin dashboard)
CREATE POLICY "Users can view own profile, admins can view all" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id OR is_admin()
);