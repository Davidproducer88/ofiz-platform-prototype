import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

// Token público de Mapbox - puedes reemplazarlo con tu propio token
mapboxgl.accessToken = "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw";

interface Master {
  id: string;
  business_name: string;
  latitude: number | null;
  longitude: number | null;
  city: string;
  rating: number;
  hourly_rate: number | null;
}

interface MastersMapProps {
  masters: Master[];
  userLocation: { lat: number; lng: number } | null;
  onMasterClick?: (masterId: string) => void;
}

export const MastersMap = ({ masters, userLocation, onMasterClick }: MastersMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Centrar en Uruguay por defecto o en la ubicación del usuario
    const center: [number, number] = userLocation 
      ? [userLocation.lng, userLocation.lat]
      : [-56.1645, -34.9011]; // Montevideo

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: center,
      zoom: userLocation ? 12 : 7,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Limpiar marcadores anteriores
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Agregar marcador de ubicación del usuario
    if (userLocation) {
      const userMarkerEl = document.createElement("div");
      userMarkerEl.className = "w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg";
      
      new mapboxgl.Marker(userMarkerEl)
        .setLngLat([userLocation.lng, userLocation.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML("<p class='font-medium'>Tu ubicación</p>")
        )
        .addTo(map.current);
    }

    // Agregar marcadores de profesionales
    masters.forEach((master) => {
      if (master.latitude && master.longitude && map.current) {
        const markerEl = document.createElement("div");
        markerEl.className = "w-8 h-8 bg-accent rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform flex items-center justify-center";
        markerEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
        
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-2">
            <h3 class="font-semibold text-sm">${master.business_name}</h3>
            <p class="text-xs text-muted-foreground">${master.city}</p>
            ${master.rating > 0 ? `<p class="text-xs">⭐ ${master.rating.toFixed(1)}</p>` : ''}
            ${master.hourly_rate ? `<p class="text-xs font-medium">$${master.hourly_rate}/hora</p>` : ''}
          </div>
        `);

        markerEl.addEventListener("click", () => {
          if (onMasterClick) {
            onMasterClick(master.id);
          }
        });

        new mapboxgl.Marker(markerEl)
          .setLngLat([master.longitude, master.latitude])
          .setPopup(popup)
          .addTo(map.current!);
      }
    });

    // Ajustar el mapa para mostrar todos los marcadores
    if (masters.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      
      if (userLocation) {
        bounds.extend([userLocation.lng, userLocation.lat]);
      }
      
      masters.forEach((master) => {
        if (master.latitude && master.longitude) {
          bounds.extend([master.longitude, master.latitude]);
        }
      });

      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, { padding: 50, maxZoom: 15 });
      }
    }
  }, [masters, userLocation, mapLoaded, onMasterClick]);

  return (
    <Card className="w-full h-[400px] md:h-[500px] overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
    </Card>
  );
};
