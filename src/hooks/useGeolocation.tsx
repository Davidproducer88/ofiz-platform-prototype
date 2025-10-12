import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

interface GeolocationState {
  location: { lat: number; lng: number } | null;
  loading: boolean;
  error: string | null;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: true,
    error: null,
  });

  const getCurrentLocation = () => {
    setState({ location: null, loading: true, error: null });

    if (!navigator.geolocation) {
      const error = "La geolocalización no está soportada en tu navegador";
      setState({ location: null, loading: false, error });
      toast({
        title: "Error de geolocalización",
        description: error,
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setState({ location, loading: false, error: null });
        toast({
          title: "Ubicación obtenida",
          description: "Mostrando servicios cerca de ti",
        });
      },
      (error) => {
        let errorMessage = "Error al obtener tu ubicación";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permiso de ubicación denegado. Por favor, habilita el acceso a tu ubicación.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Información de ubicación no disponible";
            break;
          case error.TIMEOUT:
            errorMessage = "Tiempo de espera agotado al obtener ubicación";
            break;
        }

        setState({ location: null, loading: false, error: errorMessage });
        toast({
          title: "Error de geolocalización",
          description: errorMessage,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return { ...state, refreshLocation: getCurrentLocation };
};
