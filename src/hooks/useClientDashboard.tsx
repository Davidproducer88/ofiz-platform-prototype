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
  master_id: string;
  masters: {
    business_name: string;
    rating: number;
    total_reviews: number;
  };
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
  masters: {
    business_name: string;
    rating: number;
  };
}

export const useClientDashboard = (profileId?: string) => {
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
    if (profileId) {
      fetchBookings();
    }
  }, [profileId]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          masters (
            business_name,
            rating,
            total_reviews
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los servicios",
        variant: "destructive",
      });
    }
  };

  const fetchBookings = async () => {
    if (!profileId) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching bookings for client:', profileId);
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services (title, category),
          masters (business_name, rating)
        `)
        .eq('client_id', profileId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error from Supabase:', error);
        throw error;
      }
      
      console.log('Fetched bookings:', data);
      setBookings(data || []);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error al cargar encargos",
        description: error?.message || "No se pudieron cargar tus encargos. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData: {
    serviceId: string;
    masterId: string;
    scheduledDate: Date;
    address: string;
    notes: string;
    photos: string[];
    totalPrice: number;
  }) => {
    if (!profileId) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para crear una reserva",
        variant: "destructive",
      });
      return false;
    }

    try {
      console.log('Creating booking with data:', {
        client_id: profileId,
        service_id: bookingData.serviceId,
        master_id: bookingData.masterId,
      });

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          client_id: profileId,
          service_id: bookingData.serviceId,
          master_id: bookingData.masterId,
          scheduled_date: bookingData.scheduledDate.toISOString(),
          client_address: bookingData.address,
          notes: bookingData.notes,
          client_photos: bookingData.photos,
          total_price: bookingData.totalPrice,
          status: 'pending',
        })
        .select();

      if (error) {
        console.error('Supabase error creating booking:', error);
        throw error;
      }

      console.log('Booking created successfully:', data);

      toast({
        title: "¡Reserva creada!",
        description: "El profesional ha sido notificado",
      });

      await fetchBookings();
      return true;
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error al crear reserva",
        description: error.message || "No se pudo crear la reserva. Verifica que todos los campos estén completos.",
        variant: "destructive",
      });
      return false;
    }
  };

  const rescheduleBooking = async (bookingId: string, newDate: Date) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          scheduled_date: newDate.toISOString(),
          status: 'pending'
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Reserva reprogramada",
        description: "El profesional ha sido notificado del cambio",
      });

      await fetchBookings();
      return true;
    } catch (error: any) {
      console.error('Error rescheduling booking:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo reprogramar",
        variant: "destructive",
      });
      return false;
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Reserva cancelada",
        description: "La reserva ha sido cancelada exitosamente",
      });

      await fetchBookings();
      return true;
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo cancelar la reserva",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    services,
    bookings,
    loading,
    createBooking,
    rescheduleBooking,
    cancelBooking,
    refetchServices: fetchServices,
    refetchBookings: fetchBookings,
  };
};
