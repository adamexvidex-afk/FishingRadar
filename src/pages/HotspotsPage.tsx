import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Map, Layers, Satellite, Mountain, Crown, Lock,
  Flame, Users, Thermometer, Waves as WavesIcon, Anchor,
  ChevronDown, ChevronUp, MapPin, Search, Globe, ArrowLeft, Info,
  Fish, X, Eye, EyeOff,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

import { supabase } from '@/integrations/supabase/client';


type Category = 'river' | 'lake' | 'reservoir' | 'stream' | 'bay' | 'pond';

const categoryColors: Record<Category, string> = {
  river: '#2563eb',
  lake: '#0891b2',
  reservoir: '#16a34a',
  stream: '#06b6d4',
  bay: '#d97706',
  pond: '#9333ea',
};

const categories: Category[] = ['river', 'lake', 'reservoir', 'stream', 'bay', 'pond'];

interface DbLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: string | null;
  state: string | null;
  country: string | null;
  species: string[] | null;
}

interface PublicCatch {
  id: string;
  fish: string;
  weight: number | null;
  length: number | null;
  water: string | null;
  bait: string | null;
  technique: string | null;
  photo_url: string | null;
  catch_date: string;
  location_lat: number;
  location_lng: number;
  profiles: { username: string | null; avatar_url: string | null } | null;
}

// Species color palette for catch dots (Fishbrain-style)
const speciesColors: Record<string, string> = {
  'Largemouth Bass': '#22c55e',
  'Smallmouth Bass': '#16a34a',
  'Striped Bass': '#15803d',
  'Rainbow Trout': '#f472b6',
  'Brown Trout': '#a16207',
  'Walleye': '#eab308',
  'Northern Pike': '#14b8a6',
  'Muskie': '#0d9488',
  'Channel Catfish': '#78716c',
  'Flathead Catfish': '#57534e',
  'Crappie': '#a78bfa',
  'Bluegill': '#60a5fa',
  'Common Carp': '#d97706',
  'Zander': '#6366f1',
  'European Perch': '#f59e0b',
  'Wels Catfish': '#44403c',
  'Grayling': '#818cf8',
  'Marble Trout': '#34d399',
  'Barramundi': '#f97316',
  'Arapaima': '#dc2626',
  'Mahseer': '#b91c1c',
  'Taimen': '#9f1239',
  'Redfish': '#ef4444',
};

function getSpeciesColor(species: string): string {
  if (speciesColors[species]) return speciesColors[species];
  // Generate a consistent color from species name
  let h = 0;
  for (let i = 0; i < species.length; i++) h = ((h << 5) - h + species.charCodeAt(i)) | 0;
  return `hsl(${Math.abs(h) % 360}, 65%, 50%)`;
}

type MapLayer = 'standard' | 'satellite' | 'topo';
type DataOverlay = 'heatmap' | 'pressure' | 'watertemp' | 'flow' | 'structure';

const tileLayers: Record<MapLayer, { url: string; attribution: string; maxZoom?: number }> = {
  standard: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    maxZoom: 18,
  },
  topo: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap (CC-BY-SA)',
    maxZoom: 17,
  },
};

const DATA_OVERLAYS: { key: DataOverlay; icon: typeof Flame; label: string; color: string }[] = [
  { key: 'heatmap', icon: Flame, label: 'Catch Density', color: '#ef4444' },
  { key: 'pressure', icon: Users, label: 'Angler Pressure', color: '#f97316' },
  { key: 'watertemp', icon: Thermometer, label: 'Water Temp', color: '#06b6d4' },
  { key: 'flow', icon: WavesIcon, label: 'Flow Rate', color: '#3b82f6' },
  { key: 'structure', icon: Anchor, label: 'Structure', color: '#8b5cf6' },
];

function seededRandom(seed: number) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function normalizeCategory(cat: string | null): Category {
  const value = (cat || 'lake').toLowerCase();
  if (value === 'river' || value === 'lake' || value === 'reservoir' || value === 'stream' || value === 'bay' || value === 'pond') {
    return value as Category;
  }
  if (value === 'creek' || value === 'canal') return 'stream';
  if (value === 'ocean' || value === 'pier' || value === 'fjord') return 'bay';
  return 'lake';
}

function getLocationData(loc: DbLocation) {
  const h = hashStr(loc.id);
  const speciesCount = loc.species?.length || 0;
  const cat = normalizeCategory(loc.category);
  const catBonus = cat === 'lake' ? 0.3 : cat === 'reservoir' ? 0.25 : cat === 'river' ? 0.2 : 0.1;
  const catchDensity = Math.min(1, (speciesCount / 15) * 0.7 + catBonus + seededRandom(h) * 0.15);
  const popFactor = 1 - Math.abs(loc.lat - 39) / 20;
  const pressure = Math.min(1, Math.max(0.05, popFactor * 0.5 + seededRandom(h + 1) * 0.4 + (cat === 'lake' ? 0.15 : 0)));
  const month = new Date().getMonth();
  const seasonFactor = Math.sin((month - 1) * Math.PI / 6);
  const baseTemp = 22 - (loc.lat - 30) * 0.4 + seasonFactor * 8;
  const waterTemp = Math.max(1, Math.min(30, baseTemp + seededRandom(h + 2) * 6 - 3));
  const flowBase = cat === 'river' ? 0.7 : cat === 'stream' ? 0.85 : cat === 'bay' ? 0.3 : 0.1;
  const flowRate = Math.min(1, Math.max(0.02, flowBase + seededRandom(h + 3) * 0.25 - 0.1));
  const structureTypes = ['Rocky', 'Weedy', 'Sandy', 'Muddy', 'Drop-off', 'Submerged timber', 'Riprap', 'Points'];
  const structure = structureTypes[h % structureTypes.length];
  const structureScore = seededRandom(h + 4);
  return { catchDensity, pressure, waterTemp, flowRate, structure, structureScore };
}

function tempToColor(temp: number): string {
  const t = Math.max(0, Math.min(30, temp)) / 30;
  if (t < 0.4) return `hsl(${220 - t * 200}, 80%, 50%)`;
  if (t < 0.65) return `hsl(${120 - (t - 0.4) * 480}, 75%, 45%)`;
  return `hsl(${0 + (1 - t) * 40}, 85%, 50%)`;
}

function valueToColor(value: number, hueStart: number, hueEnd: number): string {
  const hue = hueStart + (hueEnd - hueStart) * (1 - value);
  return `hsl(${hue}, 80%, 50%)`;
}

interface CountrySummary {
  country: string;
  loc_count: number;
  avg_lat: number;
  avg_lng: number;
}

const HotspotsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isPremium, subscriptionLoading } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const overlayLayerRef = useRef<L.LayerGroup | null>(null);
  const canvasRendererRef = useRef<L.Canvas | null>(null);
  const heatLayerRef = useRef<any>(null);
  const countryMarkersRef = useRef<L.LayerGroup | null>(null);
  const markerRenderTokenRef = useRef(0);
  const countryFetchTokenRef = useRef(0);
  const [activeCategories, setActiveCategories] = useState<Set<Category>>(new Set(categories));
  const [search, setSearch] = useState('');
  const [countrySummaries, setCountrySummaries] = useState<CountrySummary[]>([]);
  const [countryLocations, setCountryLocations] = useState<DbLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [countryLoading, setCountryLoading] = useState(false);
  const [mapLayer, setMapLayer] = useState<MapLayer>('satellite');
  const [activeOverlays, setActiveOverlays] = useState<Set<DataOverlay>>(new Set());
  const [overlayPanelOpen, setOverlayPanelOpen] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  const [mapZoom, setMapZoom] = useState(2);
  const [publicCatches, setPublicCatches] = useState<PublicCatch[]>([]);
  const [showCatches, setShowCatches] = useState(true);
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
  const [speciesFilterOpen, setSpeciesFilterOpen] = useState(false);
  const catchMarkersRef = useRef<L.LayerGroup | null>(null);

  // Fetch public catches with location
  useEffect(() => {
    const fetchPublicCatches = async () => {
      const { data } = await supabase
        .from('catches')
        .select('id, fish, weight, length, water, bait, technique, photo_url, catch_date, location_lat, location_lng, user_id')
        .eq('is_public', true)
        .not('location_lat', 'is', null)
        .not('location_lng', 'is', null)
        .order('catch_date', { ascending: false })
        .limit(1000);

      if (data && data.length > 0) {
        // Fetch profiles for these users
        const userIds = [...new Set(data.map(c => c.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds);

        const profileMap = new globalThis.Map(profiles?.map(p => [p.id, p]) || []);
        setPublicCatches(data.map(c => ({
          ...c,
          location_lat: c.location_lat!,
          location_lng: c.location_lng!,
          profiles: profileMap.get(c.user_id) || null,
        })));
      }
    };
    fetchPublicCatches();
  }, []);

  // Fetch only country summaries on mount (lightweight)
  useEffect(() => {
    const fetchSummaries = async () => {
      const { data, error } = await supabase.rpc('get_country_summary');
      if (!error && data) {
        setCountrySummaries(data as CountrySummary[]);
      }
      setLoading(false);
    };
    fetchSummaries();
  }, []);

  // Fetch locations only when a country is selected (hard-limited to keep UI responsive)
  useEffect(() => {
    if (!selectedCountry) {
      setCountryLocations([]);
      return;
    }

    const fetchCountryLocations = async () => {
      setCountryLoading(true);
      const summary = countrySummaries.find((c) => c.country === selectedCountry);
      const totalInCountry = Number(summary?.loc_count || 0);
      const hardLimit = totalInCountry > 8000 ? 1600 : totalInCountry > 3000 ? 2000 : 3000;

      const { data, error } = await supabase
        .from('fishing_locations')
        .select('id,name,lat,lng,category,state,species,country')
        .eq('country', selectedCountry)
        .order('name')
        .range(0, hardLimit - 1);

      if (error || !data) {
        setCountryLocations([]);
      } else {
        setCountryLocations(data as DbLocation[]);
      }
      setCountryLoading(false);
    };

    fetchCountryLocations();
  }, [selectedCountry, countrySummaries]);

  const totalLocations = useMemo(() => countrySummaries.reduce((s, c) => s + Number(c.loc_count), 0), [countrySummaries]);
  const selectedCountryTotal = useMemo(
    () => (selectedCountry ? Number(countrySummaries.find((c) => c.country === selectedCountry)?.loc_count || 0) : 0),
    [selectedCountry, countrySummaries]
  );

  const toggleCategory = (cat: Category) => {
    setActiveCategories((prev) => {
      if (prev.size === 1 && prev.has(cat)) return new Set(categories);
      return new Set([cat]);
    });
  };

  const toggleOverlay = (overlay: DataOverlay) => {
    setActiveOverlays((prev) => {
      const next = new Set(prev);
      if (next.has(overlay)) next.delete(overlay);
      else next.add(overlay);
      return next;
    });
  };

  // Filter locations for selected country
  const filtered = useMemo(() => {
    if (!selectedCountry) return [];
    return countryLocations.filter((hs) => {
      const cat = normalizeCategory(hs.category);
      if (!activeCategories.has(cat)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return hs.name.toLowerCase().includes(q) || (hs.species || []).some(s => s.toLowerCase().includes(q));
      }
      return true;
    });
  }, [selectedCountry, countryLocations, activeCategories, search]);

  // Render only visible subset to keep map responsive
  const visibleLocations = useMemo(() => {
    if (!selectedCountry) return [];
    const base = mapBounds
      ? filtered.filter((loc) => mapBounds.contains([loc.lat, loc.lng]))
      : filtered;

    const maxPoints = mapZoom <= 5 ? 450 : mapZoom <= 7 ? 1200 : 2500;
    if (base.length <= maxPoints) return base;

    const sampled: DbLocation[] = [];
    const step = Math.ceil(base.length / maxPoints);
    for (let i = 0; i < base.length; i += step) sampled.push(base[i]);
    return sampled;
  }, [filtered, mapBounds, mapZoom, selectedCountry]);

  // Initialize map after loading is finished (map container must exist in DOM)
  useEffect(() => {
    if (loading) return;
    if (!mapRef.current) return;
    if (mapInstance.current) return;

    const canvas = L.canvas({ padding: 0.5 });
    canvasRendererRef.current = canvas;

    const map = L.map(mapRef.current, {
      center: [25, 10],
      zoom: 2,
      minZoom: 2,
      maxZoom: 18,
      preferCanvas: true,
      renderer: canvas,
      worldCopyJump: false,
      maxBounds: L.latLngBounds(L.latLng(-85, -180), L.latLng(85, 180)),
      maxBoundsViscosity: 1.0,
    });

    const layer = tileLayers[mapLayer];
    tileLayerRef.current = L.tileLayer(layer.url, {
      attribution: layer.attribution,
      maxZoom: layer.maxZoom || 19,
      noWrap: true,
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    overlayLayerRef.current = L.layerGroup().addTo(map);
    countryMarkersRef.current = L.layerGroup().addTo(map);
    catchMarkersRef.current = L.layerGroup().addTo(map);
    mapInstance.current = map;

    const onViewportChange = () => {
      setMapBounds(map.getBounds());
      setMapZoom(map.getZoom());
    };
    onViewportChange();
    map.on('moveend zoomend', onViewportChange);
    requestAnimationFrame(() => map.invalidateSize());

    return () => {
      map.off('moveend zoomend', onViewportChange);
      map.remove();
      mapInstance.current = null;
      tileLayerRef.current = null;
      markersRef.current = null;
      overlayLayerRef.current = null;
      heatLayerRef.current = null;
      canvasRendererRef.current = null;
      countryMarkersRef.current = null;
      catchMarkersRef.current = null;
    };
  }, [loading]);

  // Show country markers when no country is selected
  useEffect(() => {
    if (!countryMarkersRef.current || !mapInstance.current) return;
    countryMarkersRef.current.clearLayers();

    if (selectedCountry) return; // Don't show country pins when drilled in

    for (const cs of countrySummaries) {
      const count = cs.loc_count;
      const size = Math.max(22, Math.min(44, 18 + Math.log2(count + 1) * 4));

      const divIcon = L.divIcon({
        html: `<div style="
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          border-radius: 50%;
          width: ${size}px;
          height: ${size}px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${size < 30 ? 9 : 11}px;
          font-weight: 700;
          border: 2px solid rgba(255,255,255,0.8);
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
        ">${count}</div>`,
        className: '',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      L.marker([cs.avg_lat, cs.avg_lng], { icon: divIcon })
        .bindTooltip(cs.country, { direction: 'top', offset: [0, -size / 2] })
        .on('click', () => {
          setSelectedCountry(cs.country);
        })
        .addTo(countryMarkersRef.current!);
    }
  }, [countrySummaries, selectedCountry]);

  // Zoom to country when selected — avoid expensive bounds fit for huge datasets
  useEffect(() => {
    if (!mapInstance.current) return;
    if (selectedCountry) {
      const summary = countrySummaries.find(c => c.country === selectedCountry);
      if (countryLocations.length > 0 && countryLocations.length <= 2500) {
        const bounds = L.latLngBounds(countryLocations.map(l => [l.lat, l.lng] as [number, number]));
        mapInstance.current.flyToBounds(bounds.pad(0.15), { duration: 0.8, maxZoom: 9 });
      } else if (summary) {
        mapInstance.current.flyTo([summary.avg_lat, summary.avg_lng], 5, { duration: 0.8 });
      }
    } else {
      mapInstance.current.flyTo([25, 10], 2, { duration: 0.8 });
    }
  }, [selectedCountry, countryLocations, countrySummaries]);

  // Switch tile layer
  useEffect(() => {
    if (!mapInstance.current || !tileLayerRef.current) return;
    const map = mapInstance.current;
    map.removeLayer(tileLayerRef.current);
    const layer = tileLayers[mapLayer];
    tileLayerRef.current = L.tileLayer(layer.url, {
      attribution: layer.attribution,
      maxZoom: layer.maxZoom || 19,
      noWrap: true,
    }).addTo(map);
  }, [mapLayer]);

  // Update markers when country selected (chunked render for performance)
  useEffect(() => {
    if (!markersRef.current) return;
    markersRef.current.clearLayers();
    markerRenderTokenRef.current += 1;

    if (!selectedCountry) return;

    const token = markerRenderTokenRef.current;
    const chunkSize = 350;
    let i = 0;

    const renderChunk = () => {
      if (!markersRef.current || token !== markerRenderTokenRef.current) return;
      const end = Math.min(i + chunkSize, visibleLocations.length);

      for (; i < end; i += 1) {
        const hs = visibleLocations[i];
        const cat = normalizeCategory(hs.category);
        const color = categoryColors[cat] || '#888';
        L.circleMarker([hs.lat, hs.lng], {
          renderer: canvasRendererRef.current || undefined,
          radius: activeOverlays.size > 0 ? 5 : 7,
          fillColor: color,
          color: mapLayer === 'satellite' ? '#fff' : color,
          weight: activeOverlays.size > 0 ? 1 : 1.5,
          opacity: activeOverlays.size > 0 ? 0.5 : 0.9,
          fillOpacity: activeOverlays.size > 0 ? 0.25 : 0.5,
        })
          .bindPopup(
            `<strong>${hs.name}</strong><br/><em>${t(`hotspots.cat_${cat}`)}</em>${hs.state ? `<br/><small>${hs.state}${hs.country && hs.country !== 'United States' ? `, ${hs.country}` : ''}</small>` : ''}${hs.species && hs.species.length > 0 ? `<br/><small style="color:#2563eb">🐟 ${hs.species.join(', ')}</small>` : ''}`
          )
          .addTo(markersRef.current);
      }

      if (i < visibleLocations.length) {
        requestAnimationFrame(renderChunk);
      }
    };

    renderChunk();
  }, [visibleLocations, t, mapLayer, activeOverlays, selectedCountry]);

  // Update data overlay layers (also use visible subset)
  useEffect(() => {
    if (!mapInstance.current || !overlayLayerRef.current) return;
    overlayLayerRef.current.clearLayers();

    if (heatLayerRef.current && mapInstance.current) {
      mapInstance.current.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (activeOverlays.size === 0 || !selectedCountry) return;

    if (activeOverlays.has('heatmap')) {
      const heatData = visibleLocations.map((loc) => {
        const d = getLocationData(loc);
        return [loc.lat, loc.lng, d.catchDensity] as [number, number, number];
      });
      // @ts-ignore
      heatLayerRef.current = (L as any).heatLayer(heatData, {
        radius: 25, blur: 20, maxZoom: 10, max: 1,
        gradient: { 0.2: '#22d3ee', 0.4: '#34d399', 0.6: '#fbbf24', 0.8: '#f97316', 1.0: '#ef4444' },
      }).addTo(mapInstance.current);
    }

    if (activeOverlays.has('pressure')) {
      visibleLocations.forEach((loc) => {
        const d = getLocationData(loc);
        const radius = 6 + d.pressure * 14;
        const color = valueToColor(d.pressure, 120, 0);
        L.circleMarker([loc.lat, loc.lng], {
          renderer: canvasRendererRef.current || undefined,
          radius, fillColor: color, color: 'rgba(255,255,255,0.6)', weight: 1, fillOpacity: 0.55,
        })
          .bindPopup(`<strong>${loc.name}</strong><br/>👥 Angler Pressure: <b>${Math.round(d.pressure * 100)}%</b>`)
          .addTo(overlayLayerRef.current!);
      });
    }

    if (activeOverlays.has('watertemp')) {
      visibleLocations.forEach((loc) => {
        const d = getLocationData(loc);
        const color = tempToColor(d.waterTemp);
        L.circleMarker([loc.lat, loc.lng], {
          renderer: canvasRendererRef.current || undefined,
          radius: 10, fillColor: color, color: 'rgba(255,255,255,0.5)', weight: 1.5, fillOpacity: 0.65,
        })
          .bindPopup(`<strong>${loc.name}</strong><br/>🌡️ Water Temp: <b>${d.waterTemp.toFixed(1)}°C / ${(d.waterTemp * 9 / 5 + 32).toFixed(1)}°F</b>`)
          .addTo(overlayLayerRef.current!);
      });
    }

    if (activeOverlays.has('flow')) {
      visibleLocations.forEach((loc) => {
        const d = getLocationData(loc);
        const cat = normalizeCategory(loc.category);
        if (['river', 'stream', 'bay'].includes(cat) || d.flowRate > 0.15) {
          const size = 5 + d.flowRate * 16;
          const hue = 200 + (1 - d.flowRate) * 40;
          L.circleMarker([loc.lat, loc.lng], {
            renderer: canvasRendererRef.current || undefined,
            radius: size, fillColor: `hsl(${hue}, 80%, 50%)`, color: 'rgba(255,255,255,0.4)', weight: 1, fillOpacity: 0.5,
          })
            .bindPopup(`<strong>${loc.name}</strong><br/>🌊 Flow: <b>${d.flowRate > 0.7 ? 'High' : d.flowRate > 0.35 ? 'Moderate' : 'Low'}</b>`)
            .addTo(overlayLayerRef.current!);
        }
      });
    }

    if (activeOverlays.has('structure')) {
      visibleLocations.forEach((loc) => {
        const d = getLocationData(loc);
        const structEmoji: Record<string, string> = {
          'Rocky': '🪨', 'Weedy': '🌿', 'Sandy': '🏖️', 'Muddy': '🟤',
          'Drop-off': '📐', 'Submerged timber': '🪵', 'Riprap': '🧱', 'Points': '📍',
        };
        const emoji = structEmoji[d.structure] || '📍';
        const divIcon = L.divIcon({
          html: `<div style="font-size:18px;text-shadow:0 1px 3px rgba(0,0,0,0.5)">${emoji}</div>`,
          className: '', iconSize: [24, 24], iconAnchor: [12, 12],
        });
        L.marker([loc.lat, loc.lng], { icon: divIcon })
          .bindPopup(`<strong>${loc.name}</strong><br/>🏗️ Structure: <b>${d.structure}</b><br/><small>Quality: ${Math.round(d.structureScore * 100)}%</small>`)
          .addTo(overlayLayerRef.current!);
      });
    }
  }, [visibleLocations, activeOverlays, selectedCountry]);

  // Unique species from catches for filter
  const catchSpecies = useMemo(() => {
    const species = new globalThis.Map<string, number>();
    publicCatches.forEach(c => {
      species.set(c.fish, (species.get(c.fish) || 0) + 1);
    });
    return Array.from(species.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [publicCatches]);

  // Render public catch markers on the map (Fishbrain-style colored dots)
  useEffect(() => {
    if (!catchMarkersRef.current || !mapInstance.current) return;
    catchMarkersRef.current.clearLayers();

    if (!showCatches) return;

    const filteredCatches = selectedSpecies
      ? publicCatches.filter(c => c.fish === selectedSpecies)
      : publicCatches;

    const visibleCatches = mapBounds
      ? filteredCatches.filter(c => mapBounds.contains([c.location_lat, c.location_lng]))
      : filteredCatches;

    const maxCatchMarkers = 300;
    const toRender = visibleCatches.length > maxCatchMarkers
      ? visibleCatches.slice(0, maxCatchMarkers)
      : visibleCatches;

    for (const c of toRender) {
      const color = getSpeciesColor(c.fish);
      const username = c.profiles?.username || 'Angler';
      const date = new Date(c.catch_date).toLocaleDateString();
      const details = [
        c.weight ? `${c.weight} kg` : '',
        c.length ? `${c.length} cm` : '',
      ].filter(Boolean).join(' · ');

      const popupHtml = `
        <div style="min-width:200px;font-family:system-ui,sans-serif">
          ${c.photo_url ? `<img src="${c.photo_url}" style="width:100%;height:130px;object-fit:cover;border-radius:8px;margin-bottom:8px" />` : ''}
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};flex-shrink:0"></span>
            <strong style="font-size:14px">${c.fish}</strong>
          </div>
          ${details ? `<div style="font-size:12px;color:#555;margin-bottom:2px">📐 ${details}</div>` : ''}
          ${c.water ? `<div style="font-size:12px;color:#555;margin-bottom:2px">📍 ${c.water}</div>` : ''}
          ${c.bait ? `<div style="font-size:12px;color:#555;margin-bottom:2px">🎣 ${c.bait}${c.technique ? ` · ${c.technique}` : ''}</div>` : ''}
          <div style="display:flex;align-items:center;gap:6px;margin-top:6px;padding-top:6px;border-top:1px solid #eee">
            ${c.profiles?.avatar_url ? `<img src="${c.profiles.avatar_url}" style="width:20px;height:20px;border-radius:50%;object-fit:cover" />` : `<span style="width:20px;height:20px;border-radius:50%;background:#ddd;display:inline-flex;align-items:center;justify-content:center;font-size:10px">🎣</span>`}
            <span style="font-size:11px;color:#888">${username} · ${date}</span>
          </div>
        </div>
      `;

      if (c.photo_url && mapZoom >= 6) {
        // Snapchat-style: circular photo thumbnail marker
        const imgSize = mapZoom >= 12 ? 56 : mapZoom >= 10 ? 48 : mapZoom >= 8 ? 40 : 32;
        const borderWidth = 3;
        const totalSize = imgSize + borderWidth * 2;
        const snapIcon = L.divIcon({
          className: 'snap-catch-marker',
          iconSize: [totalSize, totalSize + 10],
          iconAnchor: [totalSize / 2, totalSize + 10],
          popupAnchor: [0, -(totalSize + 10)],
          html: `
            <div style="
              width:${totalSize}px;height:${totalSize}px;
              border-radius:50%;
              border:${borderWidth}px solid ${color};
              box-shadow:0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.3);
              overflow:hidden;
              background:#000;
              cursor:pointer;
            ">
              <img src="${c.photo_url}" style="width:100%;height:100%;object-fit:cover;display:block" />
            </div>
            <div style="
              width:0;height:0;
              border-left:6px solid transparent;
              border-right:6px solid transparent;
              border-top:10px solid ${color};
              margin:0 auto;
              filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3));
            "></div>
          `,
        });
        L.marker([c.location_lat, c.location_lng], { icon: snapIcon })
          .bindPopup(popupHtml, { maxWidth: 240, className: 'catch-popup' })
          .addTo(catchMarkersRef.current!);
      } else {
        // Fish icon marker with species color
        const size = mapZoom >= 10 ? 32 : mapZoom >= 7 ? 26 : 20;
        const fishIcon = L.divIcon({
          className: 'fish-catch-marker',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          popupAnchor: [0, -size / 2],
          html: `
            <div style="
              width:${size}px;height:${size}px;
              display:flex;align-items:center;justify-content:center;
              background:${color};
              border-radius:50%;
              border:2px solid #fff;
              box-shadow:0 2px 6px rgba(0,0,0,0.35);
              cursor:pointer;
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="${size * 0.55}" height="${size * 0.55}" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6.5 12c2-6 7-7 11.5-4C14.5 5 10 6 6.5 12Z"/>
                <path d="M6.5 12c2 6 7 7 11.5 4C14.5 19 10 18 6.5 12Z"/>
                <path d="M2 12s2-3 4.5-3c0 0 .5 3-4.5 3Z"/>
                <circle cx="15.5" cy="11" r="1" fill="#fff" stroke="none"/>
              </svg>
            </div>
          `,
        });
        L.marker([c.location_lat, c.location_lng], { icon: fishIcon })
          .bindPopup(popupHtml, { maxWidth: 240, className: 'catch-popup' })
          .addTo(catchMarkersRef.current!);
      }
    }
  }, [publicCatches, mapBounds, showCatches, selectedSpecies, mapZoom]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Premium blur overlay */}
      {!subscriptionLoading && !isPremium && (
        <div className="absolute inset-0 z-[2000] flex flex-col items-center justify-center" style={{ pointerEvents: 'auto' }}>
          <div className="absolute inset-0 bg-background/70 backdrop-blur-lg" />
          <div className="relative z-10 flex flex-col items-center gap-4 text-center px-6">
            <div className="rounded-2xl bg-primary/10 p-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-foreground">Hotspots are Premium</h2>
            <p className="max-w-sm text-muted-foreground">
              Unlock fishing locations worldwide with detailed species info.
            </p>
            <Button onClick={() => navigate('/premium')} className="gap-2">
              <Crown className="h-4 w-4" />
              Unlock Premium
            </Button>
          </div>
        </div>
      )}

      {/* Full-screen map */}
      <div className="relative flex-1">
        <div ref={mapRef} className="absolute inset-0" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-3 z-[1000] flex h-10 w-10 items-center justify-center rounded-full bg-card/90 shadow-lg backdrop-blur-sm border border-border text-foreground hover:bg-card transition-colors"
          style={{ top: 'max(0.75rem, env(safe-area-inset-top, 0px))' }}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Top bar: search + filters (overlaid on map) */}
        <div className="absolute left-16 right-16 z-[1000] flex flex-col gap-2" style={{ top: 'max(0.75rem, env(safe-area-inset-top, 0px))' }}>
          {selectedCountry && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setSelectedCountry(null); setSearch(''); }}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-card/90 backdrop-blur-sm border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-card transition-colors shadow-md"
              >
                <Globe className="h-3 w-3" /> All
              </button>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search in ${selectedCountry}...`}
                  className="w-full rounded-full bg-card/90 backdrop-blur-sm border border-border pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-md"
                />
              </div>
            </div>
          )}
          {!selectedCountry && (
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-card/90 backdrop-blur-sm border border-border px-4 py-2 shadow-md">
                <p className="text-xs text-muted-foreground font-medium">
                  <Globe className="inline h-3.5 w-3.5 mr-1 text-primary" />
                  {totalLocations} spots · {countrySummaries.length} countries
                  {publicCatches.length > 0 && (
                    <span className="ml-1.5">· <Fish className="inline h-3.5 w-3.5 mr-0.5 text-emerald-500" />{publicCatches.length} catches</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Category filter chips - when country selected */}
        {selectedCountry && (
          <div className="absolute left-3 right-3 z-[1000] flex overflow-x-auto gap-1.5 pb-1 no-scrollbar" style={{ top: 'calc(max(0.75rem, env(safe-area-inset-top, 0px)) + 3.25rem)' }}>
            {categories.map((cat) => {
              const active = activeCategories.has(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors shadow-sm ${
                    active
                      ? 'border-transparent text-white'
                      : 'border-border bg-card/90 backdrop-blur-sm text-muted-foreground'
                  }`}
                  style={active ? { backgroundColor: categoryColors[cat] } : undefined}
                >
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: categoryColors[cat] }}
                  />
                  {t(`hotspots.cat_${cat}`)}
                </button>
              );
            })}
          </div>
        )}

        {/* Country info badge when selected */}
        {selectedCountry && (
          <div className="absolute bottom-20 left-3 z-[1000]">
            <div className="rounded-xl bg-card/90 backdrop-blur-sm border border-border px-3 py-2 shadow-lg">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">{selectedCountry}</span>
                <span className="text-xs text-muted-foreground">
                  {countryLoading ? '…' : `${visibleLocations.length}/${filtered.length}`} spots
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Accuracy disclaimer */}
        {selectedCountry && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] max-w-xs sm:max-w-sm">
            <div className="rounded-lg bg-card/85 backdrop-blur-sm border border-border/50 px-3 py-1.5 shadow-md">
              <div className="flex items-start gap-1.5">
                <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-[10px] leading-tight text-muted-foreground">
                  {t('hotspots.disclaimer', 'Some pins may point to nearby parking areas, access roads or boat ramps rather than the exact water body. Always verify on-site.')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Base layer switcher + Catches toggle */}
        <div className="absolute right-3 z-[1000] flex flex-col gap-2" style={{ top: 'max(0.75rem, env(safe-area-inset-top, 0px))' }}>
          <div className="flex flex-col gap-1 rounded-lg border border-border bg-card/90 p-1 shadow-lg backdrop-blur-sm">
            {([
              { key: 'standard' as MapLayer, icon: Map, label: 'Map' },
              { key: 'satellite' as MapLayer, icon: Satellite, label: 'Satellite' },
              { key: 'topo' as MapLayer, icon: Mountain, label: 'Terrain' },
            ]).map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setMapLayer(key)}
                title={label}
                className={`flex items-center justify-center rounded-md p-1.5 transition-colors ${
                  mapLayer === key
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
          {/* Catches visibility toggle */}
          <button
            onClick={() => { setShowCatches(v => !v); if (showCatches) { setSelectedSpecies(null); setSpeciesFilterOpen(false); } }}
            title={showCatches ? 'Hide catches' : 'Show catches'}
            className={`flex items-center justify-center rounded-lg border p-2 shadow-lg backdrop-blur-sm transition-colors ${
              showCatches
                ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-600'
                : 'border-border bg-card/90 text-muted-foreground'
            }`}
          >
            <Fish className="h-4 w-4" />
          </button>
          {/* Species filter toggle button */}
          {showCatches && catchSpecies.length > 0 && (
            <button
              onClick={() => setSpeciesFilterOpen(v => !v)}
              title="Filter by species"
              className={`flex items-center justify-center rounded-lg border p-2 shadow-lg backdrop-blur-sm transition-colors ${
                speciesFilterOpen || selectedSpecies
                  ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-600'
                  : 'border-border bg-card/90 text-muted-foreground'
              }`}
            >
              <Search className="h-4 w-4" />
              {selectedSpecies && (
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
              )}
            </button>
          )}
        </div>

        {/* Species filter popup */}
        {showCatches && speciesFilterOpen && catchSpecies.length > 0 && (
          <div className="absolute top-3 right-16 z-[1000] w-[200px]">
            <div className="rounded-xl border border-border bg-card/95 shadow-lg backdrop-blur-sm overflow-hidden">
              <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                <p className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                  <Fish className="h-3.5 w-3.5" /> Species
                </p>
                <div className="flex items-center gap-1">
                  {selectedSpecies && (
                    <button onClick={() => setSelectedSpecies(null)} className="text-[10px] text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded bg-accent/50">
                      Clear
                    </button>
                  )}
                  <button onClick={() => setSpeciesFilterOpen(false)} className="text-muted-foreground hover:text-foreground p-0.5">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="max-h-[250px] overflow-y-auto py-1 px-1">
                {catchSpecies.slice(0, 20).map(({ name, count }) => {
                  const active = selectedSpecies === name;
                  const color = getSpeciesColor(name);
                  return (
                    <button
                      key={name}
                      onClick={() => { setSelectedSpecies(active ? null : name); }}
                      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] transition-all ${
                        active
                          ? 'bg-accent text-foreground font-medium'
                          : 'text-muted-foreground hover:bg-accent/50'
                      }`}
                    >
                      <span
                        className="inline-block h-3 w-3 rounded-full shrink-0 border border-white/30"
                        style={{ backgroundColor: color }}
                      />
                      <span className="truncate flex-1 text-left">{name}</span>
                      <span className="text-[10px] opacity-50 tabular-nums">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Selected species badge */}
        {showCatches && selectedSpecies && !speciesFilterOpen && (
          <div className="absolute top-3 right-16 z-[1000]">
            <button
              onClick={() => setSpeciesFilterOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-card/95 backdrop-blur-sm px-3 py-1.5 shadow-lg"
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getSpeciesColor(selectedSpecies) }} />
              <span className="text-[11px] font-medium text-foreground">{selectedSpecies}</span>
              <button onClick={(e) => { e.stopPropagation(); setSelectedSpecies(null); }} className="text-muted-foreground hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </button>
          </div>
        )}

        {/* Data Overlay Panel - only when country selected */}
        {selectedCountry && (
          <div className="absolute bottom-3 left-3 z-[1000]">
            <div className="rounded-xl border border-border bg-card/95 shadow-lg backdrop-blur-sm overflow-hidden" style={{ minWidth: 180 }}>
              <button
                onClick={() => setOverlayPanelOpen((o) => !o)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent/50 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-primary" />
                  Data Layers
                  {activeOverlays.size > 0 && (
                    <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {activeOverlays.size}
                    </span>
                  )}
                </span>
                {overlayPanelOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
              </button>

              {overlayPanelOpen && (
                <div className="border-t border-border px-1 py-1">
                  {DATA_OVERLAYS.map(({ key, icon: Icon, label, color }) => {
                    const active = activeOverlays.has(key);
                    return (
                      <button
                        key={key}
                        onClick={() => toggleOverlay(key)}
                        className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition-all ${
                          active
                            ? 'bg-accent text-foreground font-medium'
                            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                        }`}
                      >
                        <span
                          className="flex h-5 w-5 items-center justify-center rounded-md transition-colors"
                          style={{ backgroundColor: active ? color : 'transparent', border: `1.5px solid ${color}` }}
                        >
                          <Icon className="h-3 w-3" style={{ color: active ? '#fff' : color }} />
                        </span>
                        {label}
                        {active && (
                          <span className="ml-auto text-[10px] font-bold uppercase tracking-wider" style={{ color }}>ON</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active overlay legend */}
        {selectedCountry && activeOverlays.size > 0 && (
          <div className="absolute top-28 left-3 z-[1000] flex flex-col gap-1.5">
            {activeOverlays.has('heatmap') && (
              <div className="rounded-lg border border-border bg-card/90 px-2.5 py-1.5 shadow-sm backdrop-blur-sm">
                <p className="text-[10px] font-semibold text-foreground mb-1">🔥 Catch Density</p>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-24 rounded-full" style={{ background: 'linear-gradient(90deg, #22d3ee, #34d399, #fbbf24, #f97316, #ef4444)' }} />
                  <span className="text-[9px] text-muted-foreground ml-0.5">Low → High</span>
                </div>
              </div>
            )}
            {activeOverlays.has('watertemp') && (
              <div className="rounded-lg border border-border bg-card/90 px-2.5 py-1.5 shadow-sm backdrop-blur-sm">
                <p className="text-[10px] font-semibold text-foreground mb-1">🌡️ Water Temp</p>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-24 rounded-full" style={{ background: 'linear-gradient(90deg, #3b82f6, #22c55e, #f97316, #ef4444)' }} />
                  <span className="text-[9px] text-muted-foreground ml-0.5">Cold → Hot</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HotspotsPage;