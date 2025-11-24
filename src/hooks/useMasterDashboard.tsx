import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  duration_minutes: number;
  status: string;
  created_at: string;
}

interface Booking {
  id: string;
  service_id: string | null;
  scheduled_date: string;
  status: string;
  total_price: number;
  client_address: string;
  notes?: string;
  services: {
    title: string;
    category: string;
  } | null;
  profiles: {
    full_name: string;
    phone?: string;
  } | null;
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
  services: {
    title: string;
  };
}

interface MasterProfile {
  id: string;
  business_name?: string;
  description?: string;
  experience_years?: number;
  hourly_rate?: number;
  rating?: number;
  total_reviews?: number;
  is_verified?: boolean;
}

interface DashboardStats {
  totalServices: number;
  activeServices: number;
  pendingBookings: number;
  completedBookings: number;
  totalReviews: number;
  averageRating: number;
  totalEarnings: number;
}

export const useMasterDashboard = (profileId?: string) => {
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [masterProfile, setMasterProfile] = useState<MasterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalServices: 0,
    activeServices: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalReviews: 0,
    averageRating: 0,
    totalEarnings: 0,
  });

  useEffect(() => {
    if (profileId) {
      fetchDashboardData();
    }
  }, [profileId]);

  const fetchDashboardData = async () => {
    if (!profileId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      await Promise.all([
        fetchMasterProfile(),
        fetchServices(),
        fetchBookings(),
        fetchReviews(),
      ]);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error al cargar el dashboard',
        description: error?.message || 'No se pudieron cargar los datos del dashboard. Por favor intenta de nuevo.',
        variant: 'destructive',
      });
      // No bloquear el dashboard si hay error, solo mostrar el toast
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterProfile = async () => {
    if (!profileId) return;

    try {
      const { data, error } = await supabase
        .from('masters')
        .select('*')
        .eq('id', profileId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data && profileId) {
        const { data: newMasterData, error: createError } = await supabase
          .from('masters')
          .insert({
            id: profileId,
            business_name: 'Mi Negocio',
          })
          .select()
          .maybeSingle();

        if (createError) {
          console.error('Error creating master profile:', createError);
          throw createError;
        } else {
          setMasterProfile(newMasterData);
        }
      } else {
        setMasterProfile(data);
      }
    } catch (error: any) {
      console.error('Error fetching/creating master profile:', error);
      toast({
        title: 'Error al cargar el perfil',
        description: error?.message || 'No se pudo cargar el perfil de maestro',
        variant: 'destructive',
      });
    }
  };

  const fetchServices = async () => {
    if (!profileId) return;

    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('master_id', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      console.error('Error fetching services:', error);
      toast({
        title: 'Error al cargar servicios',
        description: error?.message || 'No se pudieron cargar tus servicios',
        variant: 'destructive',
      });
    }
  };

  const fetchBookings = async () => {
    if (!profileId) return;

    try {
      console.log('Fetching bookings for master:', profileId);
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services (title, category),
          profiles (full_name, phone)
        `)
        .eq('master_id', profileId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error from Supabase:', error);
        throw error;
      }
      
      console.log('Fetched bookings for master:', data);
      setBookings(data || []);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast({
        title: 'Error al cargar reservas',
        description: error?.message || 'No se pudieron cargar tus reservas',
        variant: 'destructive',
      });
    }
  };

  const fetchReviews = async () => {
    if (!profileId) return;

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles (full_name)
        `)
        .eq('master_id', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const reviewsWithServices = await Promise.all(
        (data || []).map(async (review) => {
          const { data: serviceData } = await supabase
            .from('services')
            .select('title')
            .eq('id', review.booking_id)
            .maybeSingle();

          return {
            ...review,
            services: { title: serviceData?.title || 'Servicio no encontrado' },
          };
        })
      );

      setReviews(reviewsWithServices);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      toast({
        title: 'Error al cargar reseñas',
        description: error?.message || 'No se pudieron cargar tus reseñas',
        variant: 'destructive',
      });
    }
  };

  // Calculate stats
  useEffect(() => {
    const activeServices = services.filter((s) => s.status === 'active').length;
    const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
    const completedBookings = bookings.filter((b) => b.status === 'completed').length;
    const totalEarnings = bookings
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + b.total_price, 0);
    const averageRating = masterProfile?.rating || 0;

    setStats({
      totalServices: services.length,
      activeServices,
      pendingBookings,
      completedBookings,
      totalReviews: reviews.length,
      averageRating,
      totalEarnings,
    });
  }, [services, bookings, reviews, masterProfile]);

  return {
    services,
    bookings,
    reviews,
    masterProfile,
    loading,
    stats,
    refetch: fetchDashboardData,
    setServices,
    setBookings,
    setReviews,
    setMasterProfile,
  };
};
