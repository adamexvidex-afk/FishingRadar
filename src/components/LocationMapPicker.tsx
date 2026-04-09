import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Check } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });

interface LocationMapPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect: (lat: number, lng: number) => void;
}

const LocationMapPicker = ({ open, onOpenChange, onLocationSelect }: LocationMapPickerProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!open) return;

    // Wait for dialog portal to mount and animate in
    const timer = setTimeout(() => {
      if (!containerRef.current || mapRef.current) return;

      try {
        const map = L.map(containerRef.current, {
          center: [39.8, -98.5],
          zoom: 4,
          zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        map.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          setSelected({ lat, lng });

          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            markerRef.current = L.marker([lat, lng], { icon: DefaultIcon }).addTo(map);
          }
        });

        mapRef.current = map;

        // Force resize after dialog animation completes
        setTimeout(() => map.invalidateSize(), 300);
        setTimeout(() => map.invalidateSize(), 600);
      } catch (e) {
        console.error('Map init error:', e);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [open]);

  const handleConfirm = () => {
    if (selected) {
      onLocationSelect(selected.lat, selected.lng);
      onOpenChange(false);
      setSelected(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => {
      if (!v) {
        setSelected(null);
      }
      onOpenChange(v);
    }}>
      <DialogContent className="max-w-2xl w-[95vw] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4 text-primary" />
            Pick your fishing location
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Click anywhere on the map to select your location. We'll find the nearest monitoring station.
          </p>
        </DialogHeader>
        <div
          ref={containerRef}
          className="h-[50vh] min-h-[300px] w-full"
          style={{ zIndex: 0 }}
        />
        <div className="p-4 pt-2 flex items-center justify-between gap-4 border-t border-border">
          <span className="text-xs text-muted-foreground truncate">
            {selected
              ? `📍 ${selected.lat.toFixed(4)}, ${selected.lng.toFixed(4)}`
              : 'Click on the map to select a point'}
          </span>
          <Button
            onClick={handleConfirm}
            disabled={!selected}
            size="sm"
            className="gap-2 shrink-0"
          >
            <Check className="h-4 w-4" />
            Confirm Location
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationMapPicker;
