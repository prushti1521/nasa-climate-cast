import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface WeatherMapProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
}

export function WeatherMap({ latitude, longitude, onLocationChange }: WeatherMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(containerRef.current).setView([latitude, longitude], 10);
    mapRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add draggable marker
    const marker = L.marker([latitude, longitude], { draggable: true }).addTo(map);
    markerRef.current = marker;

    // Update coordinates on marker drag
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      onLocationChange(Number(position.lat.toFixed(4)), Number(position.lng.toFixed(4)));
    });

    // Update marker position on map click
    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      onLocationChange(Number(e.latlng.lat.toFixed(4)), Number(e.latlng.lng.toFixed(4)));
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update marker position when props change
  useEffect(() => {
    if (markerRef.current && mapRef.current) {
      const newLatLng = L.latLng(latitude, longitude);
      markerRef.current.setLatLng(newLatLng);
      mapRef.current.setView(newLatLng, mapRef.current.getZoom());
    }
  }, [latitude, longitude]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[400px] rounded-lg border border-border overflow-hidden shadow-sm"
    />
  );
}
