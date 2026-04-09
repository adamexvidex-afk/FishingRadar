import { useTranslation } from 'react-i18next';
import FishingForecast from '@/components/FishingForecast';
import FishDetailOverlay from '@/components/FishDetailOverlay';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Droplets, Wind, Moon, Clock, Thermometer, ArrowDown, ArrowUp, AlertTriangle, MapPin, Search, Fish, Target, LocateFixed, Loader2, Crown, Lock, Brain, Anchor, Waves, Crosshair, Map, Navigation, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useArsoData } from '@/hooks/useArsoData';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
// Fish images no longer loaded from static catalog
import { supabase } from '@/integrations/supabase/client';
import { lazy, Suspense } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
const LocationMapPicker = lazy(() => import('@/components/LocationMapPicker'));

// Fishing locations mapped to USGS site IDs (US) or just coordinates (global)
const DISTRICT_MAP: Record<string, { usgsSiteId?: string; lat: number; lng: number; label: string }> = {
  // ─── US Northeast ───
  'potomac river': { usgsSiteId: '01646500', lat: 38.9, lng: -77.0, label: 'Potomac River, DC' },
  'delaware river': { usgsSiteId: '01463500', lat: 40.22, lng: -74.77, label: 'Delaware River, PA' },
  'connecticut river': { usgsSiteId: '01184000', lat: 41.80, lng: -72.60, label: 'Connecticut River, CT' },
  'hudson river': { usgsSiteId: '01335754', lat: 42.75, lng: -73.69, label: 'Hudson River, NY' },
  'susquehanna river': { usgsSiteId: '01576000', lat: 39.65, lng: -76.17, label: 'Susquehanna River, MD' },
  'kennebec river': { usgsSiteId: '01049500', lat: 44.63, lng: -69.73, label: 'Kennebec River, ME' },
  'lake champlain': { usgsSiteId: '04294500', lat: 44.55, lng: -73.21, label: 'Lake Champlain, VT' },
  // ─── US Southeast ───
  'chattahoochee river': { usgsSiteId: '02336000', lat: 33.82, lng: -84.43, label: 'Chattahoochee River, GA' },
  'st johns river': { usgsSiteId: '02232400', lat: 28.54, lng: -81.37, label: 'St. Johns River, FL' },
  'lake okeechobee': { usgsSiteId: '02276400', lat: 26.96, lng: -80.83, label: 'Lake Okeechobee, FL' },
  'neuse river': { usgsSiteId: '02089000', lat: 35.27, lng: -77.58, label: 'Neuse River, NC' },
  'james river': { usgsSiteId: '02037500', lat: 37.56, lng: -77.54, label: 'James River, VA' },
  // ─── US Midwest / Great Lakes ───
  'mississippi river': { usgsSiteId: '05587450', lat: 38.63, lng: -90.18, label: 'Mississippi River, St. Louis' },
  'mississippi river minneapolis': { usgsSiteId: '05331000', lat: 44.98, lng: -93.26, label: 'Mississippi River, Minneapolis' },
  'missouri river': { usgsSiteId: '06893000', lat: 39.10, lng: -94.59, label: 'Missouri River, Kansas City' },
  'ohio river': { usgsSiteId: '03085000', lat: 40.44, lng: -80.02, label: 'Ohio River, Pittsburgh' },
  'mille lacs lake': { usgsSiteId: '05284000', lat: 46.13, lng: -94.36, label: 'Mille Lacs Lake, MN' },
  'lake erie': { usgsSiteId: '04208000', lat: 41.68, lng: -83.47, label: 'Lake Erie, OH' },
  'fox river': { usgsSiteId: '04084445', lat: 44.26, lng: -88.40, label: 'Fox River, WI' },
  'wabash river': { usgsSiteId: '03377500', lat: 37.97, lng: -87.94, label: 'Wabash River, IN' },
  'illinois river': { usgsSiteId: '05586100', lat: 38.97, lng: -90.65, label: 'Illinois River, IL' },
  'table rock lake': { usgsSiteId: '07053810', lat: 36.60, lng: -93.26, label: 'Table Rock Lake, MO' },
  // ─── US South Central ───
  'lake texoma': { usgsSiteId: '07331600', lat: 33.98, lng: -96.37, label: 'Lake Texoma, TX/OK' },
  'sam rayburn reservoir': { usgsSiteId: '08039500', lat: 30.75, lng: -94.10, label: 'Sam Rayburn Reservoir, TX' },
  'toledo bend': { usgsSiteId: '08025360', lat: 30.54, lng: -93.27, label: 'Toledo Bend, TX/LA' },
  'red river': { usgsSiteId: '07337000', lat: 33.74, lng: -94.04, label: 'Red River, TX/AR' },
  'arkansas river': { usgsSiteId: '07164500', lat: 36.12, lng: -95.99, label: 'Arkansas River, OK' },
  // ─── US Mountain West ───
  'yellowstone river': { usgsSiteId: '06191500', lat: 45.63, lng: -110.56, label: 'Yellowstone River, MT' },
  'snake river': { usgsSiteId: '13011000', lat: 43.73, lng: -111.04, label: 'Snake River, ID' },
  'clark fork': { usgsSiteId: '12340500', lat: 46.87, lng: -113.99, label: 'Clark Fork, MT' },
  'flathead lake': { usgsSiteId: '12370000', lat: 47.85, lng: -114.08, label: 'Flathead Lake, MT' },
  'green river': { usgsSiteId: '09217000', lat: 41.53, lng: -109.46, label: 'Green River, WY' },
  'south platte river': { usgsSiteId: '06714000', lat: 39.65, lng: -105.17, label: 'South Platte River, CO' },
  'fryingpan river': { usgsSiteId: '09080400', lat: 39.22, lng: -106.87, label: 'Fryingpan River, CO' },
  'provo river': { usgsSiteId: '10163000', lat: 40.82, lng: -111.81, label: 'Provo River, UT' },
  // ─── US Pacific West ───
  'columbia river': { usgsSiteId: '14105700', lat: 45.63, lng: -121.94, label: 'Columbia River, OR/WA' },
  'deschutes river': { usgsSiteId: '14092500', lat: 44.63, lng: -121.97, label: 'Deschutes River, OR' },
  'sacramento river': { usgsSiteId: '11377100', lat: 40.59, lng: -122.37, label: 'Sacramento River, CA' },
  'klamath river': { usgsSiteId: '11516530', lat: 41.71, lng: -122.38, label: 'Klamath River, OR' },
  'lake tahoe': { usgsSiteId: '10337000', lat: 39.17, lng: -120.14, label: 'Lake Tahoe, CA/NV' },
  'skykomish river': { usgsSiteId: '12134500', lat: 47.75, lng: -121.11, label: 'Skykomish River, WA' },
  // ─── US Alaska ───
  'kenai river': { usgsSiteId: '15266300', lat: 60.49, lng: -149.98, label: 'Kenai River, AK' },

  // ─── Europe ───
  'river test': { lat: 51.06, lng: -1.50, label: 'River Test, England' },
  'loch lomond': { lat: 56.08, lng: -4.63, label: 'Loch Lomond, Scotland' },
  'river shannon': { lat: 52.67, lng: -8.63, label: 'River Shannon, Ireland' },
  'lac leman': { lat: 46.45, lng: 6.50, label: 'Lake Geneva, Switzerland' },
  'bodensee': { lat: 47.63, lng: 9.38, label: 'Lake Constance, Germany' },
  'river ebro': { lat: 41.09, lng: 0.86, label: 'River Ebro, Spain' },
  'lofoten': { lat: 68.23, lng: 14.57, label: 'Lofoten Islands, Norway' },
  'lake vänern': { lat: 58.90, lng: 13.50, label: 'Lake Vänern, Sweden' },
  'lake saimaa': { lat: 61.20, lng: 28.30, label: 'Lake Saimaa, Finland' },
  'river loire': { lat: 47.40, lng: 0.68, label: 'River Loire, France' },
  'lake como': { lat: 46.01, lng: 9.26, label: 'Lake Como, Italy' },
  'danube river': { lat: 48.20, lng: 16.37, label: 'Danube River, Vienna' },
  'lake balaton': { lat: 46.85, lng: 17.74, label: 'Lake Balaton, Hungary' },
  'vistula river': { lat: 52.23, lng: 21.01, label: 'Vistula River, Poland' },

  // ─── Canada ───
  'fraser river': { lat: 49.18, lng: -122.90, label: 'Fraser River, BC, Canada' },
  'lake ontario': { lat: 43.65, lng: -77.85, label: 'Lake Ontario, Canada' },
  'bow river': { lat: 51.05, lng: -114.07, label: 'Bow River, AB, Canada' },
  'miramichi river': { lat: 46.50, lng: -65.85, label: 'Miramichi River, NB, Canada' },

  // ─── Asia ───
  'lake biwa': { lat: 35.28, lng: 136.10, label: 'Lake Biwa, Japan' },
  'mekong river': { lat: 15.12, lng: 105.80, label: 'Mekong River, Thailand/Laos' },
  'lake toba': { lat: 2.62, lng: 98.85, label: 'Lake Toba, Indonesia' },
  'ganges river': { lat: 25.32, lng: 83.00, label: 'Ganges River, India' },
  'bosphorus': { lat: 41.12, lng: 29.05, label: 'Bosphorus Strait, Turkey' },

  // ─── Oceania ───
  'sydney harbour': { lat: -33.85, lng: 151.22, label: 'Sydney Harbour, Australia' },
  'lake taupo': { lat: -38.69, lng: 175.91, label: 'Lake Taupo, New Zealand' },
  'great barrier reef': { lat: -18.29, lng: 147.70, label: 'Great Barrier Reef, Australia' },
  'murray river': { lat: -35.12, lng: 139.00, label: 'Murray River, Australia' },

  // ─── South America ───
  'amazon river': { lat: -3.12, lng: -60.02, label: 'Amazon River, Brazil' },
  'lake titicaca': { lat: -15.84, lng: -69.33, label: 'Lake Titicaca, Peru/Bolivia' },
  'paraná river': { lat: -33.73, lng: -59.65, label: 'Paraná River, Argentina' },

  // ─── Africa ───
  'lake victoria': { lat: -1.05, lng: 33.45, label: 'Lake Victoria, East Africa' },
  'nile river': { lat: 30.04, lng: 31.24, label: 'Nile River, Egypt' },
  'cape town coast': { lat: -33.92, lng: 18.42, label: 'Cape Town Coast, South Africa' },
  'okavango delta': { lat: -19.50, lng: 22.88, label: 'Okavango Delta, Botswana' },
};

const SUGGESTIONS = Object.values(DISTRICT_MAP).map(d => d.label).filter((v, i, a) => a.indexOf(v) === i);

type ResolvedLocation = {
  usgsSiteId?: string;
  lat: number;
  lng: number;
  label: string;
  source: 'catalog' | 'database' | 'geocoded';
  species?: string[];
};

const sanitizeLocationQuery = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/^(reka|rijeka|river)\s+/i, '')
    .replace(/^(jezero|lake|lac|lago)\s+/i, '')
    .replace(/^(zaliv|bay)\s+/i, '')
    .replace(/\s+/g, ' ');

const toFishId = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Map common short species names (from fishing_locations) to canonical fish_species.name_en
const SPECIES_ALIASES: Record<string, string> = {
  'pike': 'Northern Pike',
  'carp': 'Common Carp',
  'barbel': 'Common Barbel',
  'grayling': 'European Grayling',
  'catfish': 'Wels Catfish',
  'perch': 'European Perch',
  'trout': 'Brown Trout',
  'bream': 'Common Bream',
  'ruffe': 'Ruffe',
  'pikeperch': 'Zander',
  'danube salmon': 'Danube Salmon (Huchen)',
  'huchen': 'Danube Salmon (Huchen)',
  'rainbow trout': 'Rainbow Trout',
  'brown trout': 'Brown Trout',
  'brook trout': 'Brook Trout',
  'walleye': 'Walleye',
  'largemouth bass': 'Largemouth Bass',
  'smallmouth bass': 'Smallmouth Bass',
  'channel catfish': 'Channel Catfish',
  'blue catfish': 'Blue Catfish',
  'flathead catfish': 'Flathead Catfish',
  'crappie': 'Crappie',
  'bluegill': 'Bluegill',
  'muskie': 'Muskie',
  'muskellunge': 'Muskie',
  'striped bass': 'Striped Bass',
  'yellow perch': 'Yellow Perch',
  'white perch': 'White Perch',
  'northern pike': 'Northern Pike',
  'common carp': 'Common Carp',
  'wels catfish': 'Wels Catfish',
  'european perch': 'European Perch',
  'european grayling': 'European Grayling',
  'common barbel': 'Common Barbel',
  'common bream': 'Common Bream',
  'crucian carp': 'Crucian Carp',
  'grass carp': 'Grass Carp',
  'silver carp': 'Silver Carp',
  'tench': 'Tench',
  'roach': 'Roach',
  'rudd': 'Rudd',
  'chub': 'Chub',
  'dace': 'Dace',
  'zander': 'Zander',
  'redfish': 'Redfish',
  'snook': 'Snook',
  'tarpon': 'Tarpon',
  'sea trout': 'Sea Trout',
  'atlantic salmon': 'Atlantic Salmon',
  // ─── Adriatic / Mediterranean saltwater ───
  'dentex': 'Common Dentex',
  'common dentex': 'Common Dentex',
  'scorpionfish': 'Black Scorpionfish',
  'black scorpionfish': 'Black Scorpionfish',
  'red scorpionfish': 'Red Scorpionfish',
  'sea bass': 'European Sea Bass',
  'european sea bass': 'European Sea Bass',
  'seabass': 'European Sea Bass',
  'gilthead bream': 'Gilthead Sea Bream',
  'gilthead sea bream': 'Gilthead Sea Bream',
  'gilt-head bream': 'Gilthead Sea Bream',
  'sea bream': 'Gilthead Sea Bream',
  'octopus': 'Common Octopus',
  'common octopus': 'Common Octopus',
  'mullet': 'Flathead Grey Mullet',
  'grey mullet': 'Flathead Grey Mullet',
  'flathead grey mullet': 'Flathead Grey Mullet',
  'red mullet': 'Red Mullet',
  'striped red mullet': 'Striped Red Mullet',
  'surmullet': 'Surmullet',
  'annular sea bream': 'Annular Sea Bream',
  'two-banded sea bream': 'Two-banded Sea Bream',
  'white sea bream': 'White Sea Bream',
  'saddled sea bream': 'Saddled Sea Bream',
  'sharpsnout sea bream': 'Sharpsnout Sea Bream',
  'zebra sea bream': 'Zebra Sea Bream',
  'striped sea bream': 'Striped Sea Bream',
  'black sea bream': 'Black Sea Bream',
  'bogue': 'Bogue',
  'salema': 'Salema',
  'comber': 'Comber',
  'painted comber': 'Painted Comber',
  'grouper': 'Dusky Grouper',
  'dusky grouper': 'Dusky Grouper',
  'moray': 'Mediterranean Moray',
  'moray eel': 'Moray Eel',
  'mediterranean moray': 'Mediterranean Moray',
  'conger': 'Conger Eel',
  'conger eel': 'Conger Eel',
  'barracuda': 'European Barracuda',
  'european barracuda': 'European Barracuda',
  'garfish': 'Garfish',
  'leerfish': 'Leerfish (Garrick)',
  'bluefish': 'Bluefish (European)',
  'weever': 'Greater Weever',
  'greater weever': 'Greater Weever',
  'meagre': 'Meagre',
  'brown meagre': 'Brown Meagre',
  'shi drum': 'Shi Drum',
  'cuttlefish': 'Cuttlefish',
  'squid': 'European Squid',
  'european squid': 'European Squid',
  'spotted sea bass': 'Spotted Sea Bass',
  'tub gurnard': 'Tub Gurnard',
  'gurnard': 'Tub Gurnard',
  'red gurnard': 'Red Gurnard',
  'rainbow wrasse': 'Mediterranean Rainbow Wrasse',
  'brown wrasse': 'Brown Wrasse',
  'wrasse': 'Brown Wrasse',
  'damselfish': 'Damselfish',
  'picarel': 'Picarel',
  'pandora': 'Common Pandora',
  'common pandora': 'Common Pandora',
  'john dory': 'European John Dory',
  'hake': 'European Hake',
  'european hake': 'European Hake',
  'sole': 'Common Sole',
  'common sole': 'Common Sole',
  'turbot': 'Turbot',
  'brill': 'Brill',
  'sardine': 'European Pilchard (Sardine)',
  'anchovy': 'European Anchovy',
  'horse mackerel': 'Atlantic Horse Mackerel',
  'stingray': 'Common Stingray',
  'eagle ray': 'Eagle Ray',
  'monkfish': 'Monkfish (Anglerfish)',
  'anglerfish': 'Monkfish (Anglerfish)',
  'sand smelt': 'Mediterranean Sand Smelt',
  'goby': 'Giant Goby',
  'thornback ray': 'Thornback Ray',
  'smoothhound': 'Smoothhound Shark',
  // ─── Other global common names ───
  'bass': 'Largemouth Bass',
  'salmon': 'Atlantic Salmon',
  'lake trout': 'Lake Trout',
  'chinook': 'Chinook Salmon',
  'chinook salmon': 'Chinook Salmon',
  'coho': 'Coho Salmon',
  'coho salmon': 'Coho Salmon',
  'steelhead': 'Steelhead Trout',
  // ─── Global saltwater / tropical ───
  'blue marlin': 'Blue Marlin',
  'black marlin': 'Black Marlin',
  'white marlin': 'White Marlin',
  'striped marlin': 'Striped Marlin',
  'yellowfin tuna': 'Yellowfin Tuna',
  'bigeye tuna': 'Bigeye Tuna',
  'bluefin tuna': 'Bluefin Tuna',
  'skipjack tuna': 'Skipjack Tuna',
  'albacore tuna': 'Albacore Tuna',
  'mahi-mahi': 'Mahi-Mahi',
  'mahi mahi': 'Mahi-Mahi',
  'dolphinfish': 'Mahi-Mahi',
  'wahoo': 'Wahoo',
  'ono': 'Wahoo',
  'giant trevally': 'Giant Trevally',
  'gt': 'Giant Trevally',
  'bonefish': 'Bonefish',
  'sailfish': 'Sailfish',
  'swordfish': 'Swordfish',
  'barramundi': 'Barramundi',
  'king mackerel': 'King Mackerel',
  'spanish mackerel': 'Spanish Mackerel',
  'cobia': 'Cobia',
  'permit': 'Permit',
  'roosterfish': 'Roosterfish',
  'red snapper': 'Red Snapper',
  'yellowtail': 'Yellowtail Amberjack',
  'amberjack': 'Greater Amberjack',
  'snapper': 'Red Snapper',
  'pompano': 'Florida Pompano',
  'trevally': 'Giant Trevally',
  'kingfish': 'King Mackerel',
  'dogtooth tuna': 'Dogtooth Tuna',
  'coral trout': 'Coral Trout',
  'mangrove jack': 'Mangrove Jack',
  'great barracuda': 'Great Barracuda',
  'nile perch': 'Nile Perch',
  'tiger fish': 'Tiger Fish',
  'tilapia': 'Tilapia',
  'peacock bass': 'Peacock Bass',
  'murray cod': 'Murray Cod',
  'pomfret': 'Pomfret',
  // ─── AU/NZ ───
  'australian bass': 'Australian Bass',
  'flathead': 'Dusky Flathead',
  'mulloway': 'Mulloway',
  'tailor': 'Tailor',
  'kahawai': 'Kahawai',
  'tarakihi': 'Tarakihi',
  'blue cod': 'Blue Cod',
  'hapuku': 'Hapuku',
  'yellowtail kingfish': 'Yellowtail Kingfish',
  'luderick': 'Luderick',
  'whiting': 'Sand Whiting',
  'australian salmon': 'Australian Salmon',
  'gummy shark': 'Gummy Shark',
  // ─── Asian ───
  'mahseer': 'Mahseer',
  'rohu': 'Rohu',
  'catla': 'Catla',
  'snakehead': 'Snakehead Murrel',
  'arapaima': 'Arapaima',
  'red sea bream': 'Red Sea Bream',
  'japanese amberjack': 'Japanese Amberjack',
  'ayu': 'Ayu',
  // ─── African ───
  'garrick': 'Garrick',
  'kob': 'Kob',
  'snoek': 'Snoek',
  'yellowfish': 'Yellowfish',
  'vundu': 'Vundu Catfish',
};

/** Resolve a species short name to its canonical DB name */
const resolveSpeciesName = (name: string): string => {
  const lower = name.toLowerCase().trim();
  return SPECIES_ALIASES[lower] || name;
};

// Water type classification for recommendations
type WaterType = 'cold-river' | 'warm-river' | 'lake' | 'reservoir' | 'coastal' | 'sea';

const getWaterType = (key: string, label?: string): WaterType => {
  const k = (label || key).toLowerCase();
  if (k.includes('coast') || k.includes('harbour') || k.includes('harbor') || k.includes('reef') || k.includes('bay') || k.includes('bosphorus') || k.includes('lofoten') || k.includes('pier') || k.includes('ocean') || k.includes('fjord')) return 'coastal';
  if (k.includes('lake') || k.includes('loch') || k.includes('lac') || k.includes('lago') || k.includes('see') || k.includes('taupo') || k.includes('balaton') || k.includes('saimaa') || k.includes('vänern') || k.includes('biwa') || k.includes('toba') || k.includes('victoria') || k.includes('titicaca') || k.includes('champlain') || k.includes('erie') || k.includes('tahoe') || k.includes('flathead') || k.includes('okeechobee') || k.includes('mille lacs') || k.includes('como')) return 'lake';
  if (k.includes('reservoir') || k.includes('texoma') || k.includes('rayburn') || k.includes('toledo') || k.includes('table rock')) return 'reservoir';
  if (k.includes('yellowstone') || k.includes('snake') || k.includes('clark fork') || k.includes('fryingpan') || k.includes('provo') || k.includes('deschutes') || k.includes('kenai') || k.includes('skykomish') || k.includes('south platte') || k.includes('green river') || k.includes('river test')) return 'cold-river';
  return 'warm-river';
};

interface WaterRecommendation {
  fishEn: string[];
  fishIds: string[];
  baitsEn: string[];
  baitIds: string[];
}

const WATER_RECOMMENDATIONS: Record<WaterType, WaterRecommendation> = {
  'cold-river': {
    fishEn: ['Rainbow Trout', 'Brown Trout', 'Smallmouth Bass'],
    fishIds: ['rainbow-trout', 'brown-trout', 'smallmouth-bass'],
    baitsEn: ['Artificial Fly', 'Nymph', 'Spinner', 'PowerBait'],
    baitIds: ['fly', 'nymph', 'spinner', 'pellet'],
  },
  'warm-river': {
    fishEn: ['Largemouth Bass', 'Channel Catfish', 'Smallmouth Bass', 'Walleye', 'Common Carp'],
    fishIds: ['largemouth-bass', 'channel-catfish', 'smallmouth-bass', 'walleye', 'common-carp'],
    baitsEn: ['Soft Plastic', 'Crankbait', 'Jig Head', 'Earthworm', 'Boilie'],
    baitIds: ['softplastic', 'crankbait', 'jig', 'worm', 'boilie'],
  },
  'lake': {
    fishEn: ['Walleye', 'Largemouth Bass', 'Northern Pike', 'European Perch', 'Common Carp'],
    fishIds: ['walleye', 'largemouth-bass', 'northern-pike', 'european-perch', 'common-carp'],
    baitsEn: ['Jig Head', 'Crankbait', 'Live Minnow', 'Soft Plastic', 'Spoon'],
    baitIds: ['jig', 'crankbait', 'livebait', 'softplastic', 'spoon'],
  },
  'reservoir': {
    fishEn: ['Largemouth Bass', 'Crappie', 'Channel Catfish', 'Striped Bass', 'Bluegill'],
    fishIds: ['largemouth-bass', 'crappie', 'channel-catfish', 'striped-bass', 'bluegill'],
    baitsEn: ['Spinnerbait', 'Soft Plastic', 'Crankbait', 'Live Shad', 'Corn'],
    baitIds: ['spinner', 'softplastic', 'crankbait', 'livebait', 'corn'],
  },
  'coastal': {
    fishEn: ['Striped Bass', 'Red Drum (Redfish)', 'European Sea Bass'],
    fishIds: ['striped-bass', 'redfish', 'european-sea-bass'],
    baitsEn: ['Bucktail Jig', 'Soft Plastic', 'Live Shrimp', 'Spoon'],
    baitIds: ['jig', 'softplastic', 'livebait', 'spoon'],
  },
  'sea': {
    fishEn: ['European Sea Bass', 'Striped Bass', 'Red Drum (Redfish)', 'Tarpon', 'Snook'],
    fishIds: ['european-sea-bass', 'striped-bass', 'redfish', 'tarpon', 'snook'],
    baitsEn: ['Bucktail Jig', 'Soft Plastic', 'Live Shrimp', 'Spoon', 'Popper'],
    baitIds: ['jig', 'softplastic', 'livebait', 'spoon', 'popper'],
  },
};

// Species-specific optimal conditions for bite prediction
const SPECIES_BITE_PROFILES: Record<string, { optimalTemp: [number, number]; feedingHours: number[]; pressureSensitive: boolean; lowLightFeeder: boolean; flowPreference: 'low' | 'moderate' | 'high' }> = {
  'Rainbow Trout': { optimalTemp: [10, 16], feedingHours: [6, 7, 8, 17, 18, 19], pressureSensitive: true, lowLightFeeder: false, flowPreference: 'moderate' },
  'Brown Trout': { optimalTemp: [12, 18], feedingHours: [5, 6, 18, 19, 20, 21], pressureSensitive: true, lowLightFeeder: true, flowPreference: 'moderate' },
  'Largemouth Bass': { optimalTemp: [18, 27], feedingHours: [6, 7, 8, 17, 18, 19, 20], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'low' },
  'Smallmouth Bass': { optimalTemp: [15, 22], feedingHours: [6, 7, 8, 17, 18, 19], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'moderate' },
  'Walleye': { optimalTemp: [10, 18], feedingHours: [5, 6, 19, 20, 21, 22], pressureSensitive: true, lowLightFeeder: true, flowPreference: 'moderate' },
  'Channel Catfish': { optimalTemp: [21, 29], feedingHours: [20, 21, 22, 23, 0, 1, 2, 3], pressureSensitive: false, lowLightFeeder: true, flowPreference: 'low' },
  'Northern Pike': { optimalTemp: [12, 20], feedingHours: [7, 8, 9, 10, 15, 16, 17], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'low' },
  'Crappie': { optimalTemp: [15, 22], feedingHours: [6, 7, 17, 18, 19], pressureSensitive: true, lowLightFeeder: true, flowPreference: 'low' },
  'Yellow Perch': { optimalTemp: [12, 20], feedingHours: [7, 8, 9, 15, 16, 17], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'low' },
  'Striped Bass': { optimalTemp: [16, 22], feedingHours: [5, 6, 7, 17, 18, 19], pressureSensitive: true, lowLightFeeder: false, flowPreference: 'moderate' },
  'Bluegill': { optimalTemp: [20, 28], feedingHours: [8, 9, 10, 15, 16, 17], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'low' },
  'Red Drum (Redfish)': { optimalTemp: [18, 27], feedingHours: [6, 7, 8, 17, 18, 19], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'moderate' },
  'Common Carp': { optimalTemp: [18, 26], feedingHours: [5, 6, 7, 18, 19, 20, 21], pressureSensitive: false, lowLightFeeder: true, flowPreference: 'low' },
  'European Perch': { optimalTemp: [12, 20], feedingHours: [7, 8, 9, 15, 16, 17], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'low' },
  'European Sea Bass': { optimalTemp: [14, 22], feedingHours: [5, 6, 7, 17, 18, 19, 20], pressureSensitive: true, lowLightFeeder: false, flowPreference: 'moderate' },
  // European species
  'Chub': { optimalTemp: [14, 22], feedingHours: [7, 8, 9, 16, 17, 18, 19], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'moderate' },
  'Common Barbel': { optimalTemp: [14, 22], feedingHours: [17, 18, 19, 20, 21, 22], pressureSensitive: true, lowLightFeeder: true, flowPreference: 'high' },
  'European Grayling': { optimalTemp: [8, 16], feedingHours: [9, 10, 11, 14, 15, 16], pressureSensitive: true, lowLightFeeder: false, flowPreference: 'moderate' },
  'Wels Catfish': { optimalTemp: [20, 28], feedingHours: [20, 21, 22, 23, 0, 1, 2, 3, 4], pressureSensitive: false, lowLightFeeder: true, flowPreference: 'low' },
  'Zander': { optimalTemp: [12, 22], feedingHours: [5, 6, 18, 19, 20, 21, 22], pressureSensitive: true, lowLightFeeder: true, flowPreference: 'low' },
  'Tench': { optimalTemp: [18, 25], feedingHours: [5, 6, 7, 19, 20, 21], pressureSensitive: false, lowLightFeeder: true, flowPreference: 'low' },
  'Roach': { optimalTemp: [12, 20], feedingHours: [7, 8, 9, 15, 16, 17, 18], pressureSensitive: true, lowLightFeeder: false, flowPreference: 'low' },
  'Rudd': { optimalTemp: [16, 24], feedingHours: [8, 9, 10, 15, 16, 17], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'low' },
  'Dace': { optimalTemp: [10, 18], feedingHours: [8, 9, 10, 14, 15, 16], pressureSensitive: true, lowLightFeeder: false, flowPreference: 'moderate' },
  'Common Bream': { optimalTemp: [14, 22], feedingHours: [5, 6, 19, 20, 21, 22], pressureSensitive: true, lowLightFeeder: true, flowPreference: 'low' },
  'Crucian Carp': { optimalTemp: [18, 26], feedingHours: [6, 7, 8, 17, 18, 19, 20], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'low' },
  'Brook Trout': { optimalTemp: [8, 14], feedingHours: [6, 7, 8, 17, 18, 19], pressureSensitive: true, lowLightFeeder: false, flowPreference: 'moderate' },
  'Atlantic Salmon': { optimalTemp: [10, 16], feedingHours: [6, 7, 8, 17, 18, 19], pressureSensitive: true, lowLightFeeder: false, flowPreference: 'high' },
  'Sea Trout': { optimalTemp: [10, 16], feedingHours: [5, 6, 19, 20, 21, 22], pressureSensitive: true, lowLightFeeder: true, flowPreference: 'moderate' },
  'Danube Salmon (Huchen)': { optimalTemp: [6, 14], feedingHours: [6, 7, 16, 17, 18, 19], pressureSensitive: true, lowLightFeeder: true, flowPreference: 'high' },
  'Grass Carp': { optimalTemp: [20, 28], feedingHours: [8, 9, 10, 15, 16, 17], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'low' },
  'Silver Carp': { optimalTemp: [20, 28], feedingHours: [7, 8, 9, 16, 17, 18], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'low' },
  'Blue Catfish': { optimalTemp: [21, 29], feedingHours: [19, 20, 21, 22, 23, 0, 1], pressureSensitive: false, lowLightFeeder: true, flowPreference: 'moderate' },
  'Flathead Catfish': { optimalTemp: [22, 30], feedingHours: [20, 21, 22, 23, 0, 1, 2], pressureSensitive: false, lowLightFeeder: true, flowPreference: 'low' },
  'Muskie': { optimalTemp: [15, 22], feedingHours: [8, 9, 10, 15, 16, 17, 18], pressureSensitive: true, lowLightFeeder: false, flowPreference: 'low' },
  'White Perch': { optimalTemp: [14, 22], feedingHours: [6, 7, 17, 18, 19], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'low' },
  'Redfish': { optimalTemp: [18, 27], feedingHours: [6, 7, 8, 17, 18, 19], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'moderate' },
  'Snook': { optimalTemp: [22, 30], feedingHours: [5, 6, 18, 19, 20, 21], pressureSensitive: true, lowLightFeeder: true, flowPreference: 'moderate' },
  'Tarpon': { optimalTemp: [24, 32], feedingHours: [6, 7, 8, 17, 18, 19], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'moderate' },
  // ─── Adriatic / Mediterranean saltwater ───
  'Common Dentex': { optimalTemp: [16, 24], feedingHours: [5, 6, 7, 17, 18, 19, 20], pressureSensitive: true, lowLightFeeder: true, flowPreference: 'moderate' },
  'Black Scorpionfish': { optimalTemp: [14, 22], feedingHours: [19, 20, 21, 22, 23, 0, 1, 5, 6], pressureSensitive: false, lowLightFeeder: true, flowPreference: 'low' },
  'Red Scorpionfish': { optimalTemp: [14, 22], feedingHours: [19, 20, 21, 22, 23, 0, 1, 5, 6], pressureSensitive: false, lowLightFeeder: true, flowPreference: 'low' },
  'Gilthead Sea Bream': { optimalTemp: [16, 26], feedingHours: [6, 7, 8, 17, 18, 19, 20], pressureSensitive: true, lowLightFeeder: false, flowPreference: 'low' },
  'Common Octopus': { optimalTemp: [14, 24], feedingHours: [19, 20, 21, 22, 23, 0, 1, 2, 5, 6], pressureSensitive: false, lowLightFeeder: true, flowPreference: 'low' },
  'Flathead Grey Mullet': { optimalTemp: [16, 26], feedingHours: [5, 6, 7, 8, 16, 17, 18], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'low' },
  'Red Mullet': { optimalTemp: [14, 22], feedingHours: [6, 7, 8, 17, 18, 19], pressureSensitive: true, lowLightFeeder: false, flowPreference: 'low' },
  'Dusky Grouper': { optimalTemp: [18, 26], feedingHours: [6, 7, 8, 17, 18, 19], pressureSensitive: false, lowLightFeeder: true, flowPreference: 'low' },
  'European Barracuda': { optimalTemp: [18, 26], feedingHours: [6, 7, 8, 9, 16, 17, 18, 19], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'moderate' },
  'Leerfish (Garrick)': { optimalTemp: [18, 26], feedingHours: [5, 6, 7, 17, 18, 19, 20], pressureSensitive: true, lowLightFeeder: false, flowPreference: 'moderate' },
  'Bluefish (European)': { optimalTemp: [16, 26], feedingHours: [5, 6, 7, 17, 18, 19, 20], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'moderate' },
  'Conger Eel': { optimalTemp: [12, 20], feedingHours: [20, 21, 22, 23, 0, 1, 2, 3], pressureSensitive: false, lowLightFeeder: true, flowPreference: 'moderate' },
  'Mediterranean Moray': { optimalTemp: [14, 24], feedingHours: [20, 21, 22, 23, 0, 1, 2], pressureSensitive: false, lowLightFeeder: true, flowPreference: 'low' },
  'Garfish': { optimalTemp: [14, 20], feedingHours: [6, 7, 8, 9, 16, 17, 18], pressureSensitive: true, lowLightFeeder: false, flowPreference: 'moderate' },
  'Greater Weever': { optimalTemp: [14, 22], feedingHours: [7, 8, 9, 16, 17, 18], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'low' },
  'Meagre': { optimalTemp: [16, 24], feedingHours: [5, 6, 17, 18, 19, 20], pressureSensitive: true, lowLightFeeder: true, flowPreference: 'moderate' },
  'Brown Meagre': { optimalTemp: [16, 24], feedingHours: [18, 19, 20, 21, 22], pressureSensitive: true, lowLightFeeder: true, flowPreference: 'low' },
  'Shi Drum': { optimalTemp: [16, 24], feedingHours: [6, 7, 17, 18, 19, 20], pressureSensitive: true, lowLightFeeder: false, flowPreference: 'moderate' },
  'Cuttlefish': { optimalTemp: [12, 20], feedingHours: [18, 19, 20, 21, 22, 5, 6], pressureSensitive: false, lowLightFeeder: true, flowPreference: 'low' },
  'European Squid': { optimalTemp: [12, 20], feedingHours: [19, 20, 21, 22, 23, 0], pressureSensitive: false, lowLightFeeder: true, flowPreference: 'low' },
  'Spotted Sea Bass': { optimalTemp: [14, 22], feedingHours: [6, 7, 8, 17, 18, 19], pressureSensitive: true, lowLightFeeder: false, flowPreference: 'moderate' },
  'Annular Sea Bream': { optimalTemp: [16, 26], feedingHours: [7, 8, 9, 16, 17, 18], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'low' },
  'Two-banded Sea Bream': { optimalTemp: [16, 24], feedingHours: [7, 8, 9, 16, 17, 18], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'low' },
  'White Sea Bream': { optimalTemp: [14, 24], feedingHours: [7, 8, 9, 16, 17, 18], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'low' },
  'Saddled Sea Bream': { optimalTemp: [16, 24], feedingHours: [7, 8, 16, 17, 18], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'low' },
  'Sharpsnout Sea Bream': { optimalTemp: [14, 24], feedingHours: [7, 8, 9, 16, 17, 18], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'low' },
  'Bogue': { optimalTemp: [14, 24], feedingHours: [6, 7, 8, 16, 17, 18], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'low' },
  'Salema': { optimalTemp: [16, 24], feedingHours: [7, 8, 9, 16, 17, 18], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'low' },
  'Comber': { optimalTemp: [14, 24], feedingHours: [8, 9, 10, 15, 16, 17], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'low' },
  'Painted Comber': { optimalTemp: [14, 24], feedingHours: [8, 9, 10, 15, 16, 17], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'low' },
  'Common Pandora': { optimalTemp: [14, 22], feedingHours: [6, 7, 17, 18, 19], pressureSensitive: true, lowLightFeeder: false, flowPreference: 'low' },
  'Tub Gurnard': { optimalTemp: [12, 20], feedingHours: [7, 8, 9, 16, 17, 18], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'low' },
  'Striped Red Mullet': { optimalTemp: [14, 22], feedingHours: [6, 7, 8, 17, 18, 19], pressureSensitive: true, lowLightFeeder: false, flowPreference: 'low' },
  'Common Sole': { optimalTemp: [10, 18], feedingHours: [20, 21, 22, 23, 0, 1, 5, 6], pressureSensitive: true, lowLightFeeder: true, flowPreference: 'low' },
  'European Hake': { optimalTemp: [10, 18], feedingHours: [19, 20, 21, 22, 5, 6], pressureSensitive: false, lowLightFeeder: true, flowPreference: 'low' },
  'Monkfish (Anglerfish)': { optimalTemp: [8, 16], feedingHours: [0, 1, 2, 3, 4, 5, 20, 21, 22, 23], pressureSensitive: false, lowLightFeeder: true, flowPreference: 'low' },
  'Turbot': { optimalTemp: [10, 18], feedingHours: [6, 7, 8, 17, 18, 19], pressureSensitive: true, lowLightFeeder: false, flowPreference: 'low' },
};

// Generate a reasonable default bite profile based on category
const getDefaultProfile = (fish: string, category?: string): { optimalTemp: [number, number]; feedingHours: number[]; pressureSensitive: boolean; lowLightFeeder: boolean; flowPreference: 'low' | 'moderate' | 'high' } => {
  const name = fish.toLowerCase();
  // Sharks
  if (name.includes('shark')) return { optimalTemp: [18, 28], feedingHours: [5, 6, 7, 17, 18, 19, 20, 21], pressureSensitive: true, lowLightFeeder: true, flowPreference: 'moderate' };
  // Tuna/pelagic
  if (name.includes('tuna') || name.includes('marlin') || name.includes('sailfish') || name.includes('wahoo') || name.includes('kingfish'))
    return { optimalTemp: [20, 28], feedingHours: [5, 6, 7, 8, 15, 16, 17, 18], pressureSensitive: true, lowLightFeeder: false, flowPreference: 'moderate' };
  // Barramundi / tropical predators
  if (name.includes('barramundi') || name.includes('giant trevally') || name.includes('trevally') || name.includes('gt'))
    return { optimalTemp: [24, 32], feedingHours: [5, 6, 7, 17, 18, 19, 20], pressureSensitive: false, lowLightFeeder: true, flowPreference: 'moderate' };
  // Grouper/snapper type
  if (name.includes('grouper') || name.includes('snapper') || name.includes('emperor'))
    return { optimalTemp: [20, 28], feedingHours: [6, 7, 8, 17, 18, 19], pressureSensitive: true, lowLightFeeder: false, flowPreference: 'low' };
  // Catfish / bottom feeders
  if (name.includes('catfish') || name.includes('bullhead'))
    return { optimalTemp: [20, 28], feedingHours: [19, 20, 21, 22, 23, 0, 1, 2], pressureSensitive: false, lowLightFeeder: true, flowPreference: 'low' };
  // Trout / salmon / cold water
  if (name.includes('trout') || name.includes('salmon') || name.includes('char'))
    return { optimalTemp: [8, 16], feedingHours: [6, 7, 8, 17, 18, 19], pressureSensitive: true, lowLightFeeder: false, flowPreference: 'moderate' };
  // Bass
  if (name.includes('bass'))
    return { optimalTemp: [18, 26], feedingHours: [6, 7, 8, 17, 18, 19, 20], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'low' };
  // Pike / predator freshwater
  if (name.includes('pike') || name.includes('muskie') || name.includes('pickerel') || name.includes('perch'))
    return { optimalTemp: [12, 22], feedingHours: [7, 8, 9, 15, 16, 17, 18], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'low' };
  // Carp family
  if (name.includes('carp') || name.includes('barbel') || name.includes('tench'))
    return { optimalTemp: [18, 26], feedingHours: [5, 6, 7, 18, 19, 20, 21], pressureSensitive: false, lowLightFeeder: true, flowPreference: 'low' };
  // Bream / panfish
  if (name.includes('bream') || name.includes('sunfish') || name.includes('bluegill') || name.includes('tilapia'))
    return { optimalTemp: [18, 28], feedingHours: [7, 8, 9, 15, 16, 17], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'low' };
  // Flatfish
  if (name.includes('flounder') || name.includes('sole') || name.includes('halibut') || name.includes('flathead'))
    return { optimalTemp: [12, 22], feedingHours: [6, 7, 17, 18, 19, 20], pressureSensitive: true, lowLightFeeder: true, flowPreference: 'low' };
  // Eel / moray
  if (name.includes('eel') || name.includes('moray'))
    return { optimalTemp: [14, 24], feedingHours: [20, 21, 22, 23, 0, 1, 2], pressureSensitive: false, lowLightFeeder: true, flowPreference: 'low' };
  // Ray / skate
  if (name.includes('ray') || name.includes('skate'))
    return { optimalTemp: [16, 26], feedingHours: [6, 7, 17, 18, 19, 20], pressureSensitive: false, lowLightFeeder: true, flowPreference: 'low' };
  // Mullet
  if (name.includes('mullet'))
    return { optimalTemp: [16, 26], feedingHours: [5, 6, 7, 8, 16, 17, 18], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'low' };
  // Generic by category
  if (category === 'saltwater')
    return { optimalTemp: [18, 26], feedingHours: [5, 6, 7, 17, 18, 19, 20], pressureSensitive: true, lowLightFeeder: false, flowPreference: 'moderate' };
  if (category === 'brackish')
    return { optimalTemp: [16, 26], feedingHours: [6, 7, 8, 17, 18, 19], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'low' };
  // Default freshwater
  return { optimalTemp: [14, 24], feedingHours: [6, 7, 8, 16, 17, 18, 19], pressureSensitive: false, lowLightFeeder: false, flowPreference: 'low' };
};

const calculateBiteProbability = (
  fish: string,
  conditions: { waterTemp: number | null; airTemp: number | null; pressure: number | null; flow: number | null; moonIllumination: number | null; waveHeight?: number | null; swellHeight?: number | null; currentSpeed?: number | null },
  fishCategory?: string
): { probability: number; status: string; factors: string[] } => {
  const profile = SPECIES_BITE_PROFILES[fish] || getDefaultProfile(fish, fishCategory);

  let score = 50;
  const boosts: string[] = [];
  const hour = new Date().getHours();

  // Temperature match
  if (conditions.waterTemp != null) {
    const [lo, hi] = profile.optimalTemp;
    const mid = (lo + hi) / 2;
    const range = (hi - lo) / 2;
    const tempDiff = Math.abs(conditions.waterTemp - mid);
    if (tempDiff <= range) { score += 20; boosts.push('🌡️ Water temp in optimal range'); }
    else if (tempDiff <= range * 2) { score += 5; boosts.push('🌡️ Water temp near optimal'); }
    else { score -= 15; boosts.push('🌡️ Water temp outside range'); }
  }

  // Feeding time
  if (profile.feedingHours.includes(hour)) { score += 20; boosts.push('⏰ Peak feeding hour'); }
  else {
    const closest = profile.feedingHours.reduce((best, h) => { const d = Math.min(Math.abs(hour - h), 24 - Math.abs(hour - h)); return d < best ? d : best; }, 24);
    if (closest <= 1) { score += 10; boosts.push('⏰ Near feeding window'); }
    else { score -= 5; }
  }

  // Pressure
  if (conditions.pressure != null && profile.pressureSensitive) {
    if (conditions.pressure >= 1008 && conditions.pressure <= 1020) { score += 10; boosts.push('📊 Stable pressure — active bite'); }
    else if (conditions.pressure < 1005) { score -= 10; boosts.push('📊 Low pressure — sluggish'); }
  }

  // Moon / low light
  if (profile.lowLightFeeder) {
    if (conditions.moonIllumination != null && conditions.moonIllumination < 30) { score += 8; boosts.push('🌙 Dark water advantage'); }
    if (hour < 6 || hour > 19) { score += 5; boosts.push('🌑 Low-light conditions'); }
  }

  // Flow
  if (conditions.flow != null) {
    const flowLevel = conditions.flow < 10 ? 'low' : conditions.flow < 100 ? 'moderate' : 'high';
    if (flowLevel === profile.flowPreference) { score += 8; boosts.push('💧 Flow matches preference'); }
  }

  // ─── Wave & swell conditions (sea mode) ───
  if (conditions.waveHeight != null) {
    if (conditions.waveHeight < 0.5) { score += 12; boosts.push('🌊 Calm seas — excellent fishing'); }
    else if (conditions.waveHeight < 1.0) { score += 8; boosts.push('🌊 Light waves — good conditions'); }
    else if (conditions.waveHeight < 1.5) { score += 2; boosts.push('🌊 Moderate waves'); }
    else if (conditions.waveHeight < 2.5) { score -= 8; boosts.push('🌊 Choppy seas — difficult'); }
    else { score -= 18; boosts.push('🌊 Rough seas — poor conditions'); }
  }

  if (conditions.swellHeight != null) {
    if (conditions.swellHeight < 0.5) { score += 5; boosts.push('🌊 Low swell — stable water'); }
    else if (conditions.swellHeight > 2.0) { score -= 8; boosts.push('🌊 Heavy swell — unstable'); }
  }

  if (conditions.currentSpeed != null) {
    if (conditions.currentSpeed >= 0.1 && conditions.currentSpeed <= 0.5) { score += 6; boosts.push('🌀 Light current — bait moves naturally'); }
    else if (conditions.currentSpeed > 1.0) { score -= 5; boosts.push('🌀 Strong current — harder fishing'); }
  }

  const probability = Math.max(5, Math.min(98, score));
  const status = probability >= 75 ? 'HOT 🔥' : probability >= 55 ? 'Active' : probability >= 35 ? 'Moderate' : 'Slow';
  return { probability, status, factors: boosts };
};

interface DbFish {
  id: string;
  name_en: string;
  latin_name: string | null;
  category: string | null;
  habitat: string | null;
  techniques: string[] | null;
  baits: string[] | null;
  description: string | null;
  protection: string | null;
  min_size: string | null;
  image_url: string | null;
}

const ConditionsPage = () => {
  const [fishImageMap, setFishImageMap] = useState<Record<string, string>>({});
  const [fishDataMap, setFishDataMap] = useState<Record<string, DbFish>>({});
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isPremium, subscriptionLoading } = useAuth();
  const searchParams = new URLSearchParams(window.location.search);
  const initialQuery = searchParams.get('q') || '';
  const [districtInput, setDistrictInput] = useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locating, setLocating] = useState(false);
  const [aiPredictions, setAiPredictions] = useState<any[] | null>(null);
  const [predictionsLoading, setPredictionsLoading] = useState(false);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [geocodedResolved, setGeocodedResolved] = useState<ResolvedLocation | null>(null);
  const [nearestSpecies, setNearestSpecies] = useState<string[]>([]);
  const [nearestBaits, setNearestBaits] = useState<string[]>([]);
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const [selectedFish, setSelectedFish] = useState<DbFish | null>(null);
  const [waterMode, setWaterMode] = useState<'freshwater' | 'sea'>('freshwater');
  const [speciesCategoryMap, setSpeciesCategoryMap] = useState<Record<string, string>>({});

  const handleMapLocationSelect = async (lat: number, lng: number) => {
    setGeocodeLoading(true);
    setShowSuggestions(false);

    try {
      const { data, error } = await supabase.rpc('get_nearest_spots', {
        _lat: lat,
        _lng: lng,
        _limit: 200,
      });

      if (!error && data && data.length > 0) {
        const SEA_CATEGORIES = ['bay', 'beach', 'coast', 'coastal', 'estuary', 'fjord', 'harbor', 'inlet', 'island', 'lagoon', 'ocean', 'offshore', 'pier', 'reef', 'strait'];
        const FRESHWATER_CATEGORIES = ['river', 'lake', 'creek', 'stream', 'pond', 'reservoir', 'dam', 'canal', 'backwater', 'bayou', 'swamp', 'wetland', 'wetland/river', 'state park', 'delta'];

        const allSpots = [...(data as Array<{
          name: string;
          lat: number;
          lng: number;
          category: string | null;
          state: string | null;
          country: string | null;
          species: string[] | null;
          distance_km: number;
        }>)].sort((a, b) => a.distance_km - b.distance_km);

        // Filter by water mode category
        const categoryFilter = waterMode === 'sea' ? SEA_CATEGORIES : FRESHWATER_CATEGORIES;
        const filtered = allSpots.filter(s => s.category && categoryFilter.includes(s.category.toLowerCase()));
        const nearest = (filtered.length > 0 ? filtered : allSpots)[0];

        setDistrictInput(nearest.name);
        setGeocodedResolved({
          lat: nearest.lat,
          lng: nearest.lng,
          label: [nearest.name, nearest.state, nearest.country].filter(Boolean).join(', '),
          source: 'database',
          species: nearest.species || [],
        });
        return;
      }

      // Fallback to exact picked point if no nearby spot is found
      setDistrictInput(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      setGeocodedResolved({
        lat,
        lng,
        label: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        source: 'geocoded',
      });
    } catch {
      toast.error('Failed to resolve selected location');
    } finally {
      setGeocodeLoading(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error(t('home.locationNotSupported'));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        let bestKey = '';
        let bestDist = Infinity;
        for (const [key, val] of Object.entries(DISTRICT_MAP)) {
          const d = (val.lat - userLat) ** 2 + (val.lng - userLng) ** 2;
          if (d < bestDist) {
            bestDist = d;
            bestKey = key;
          }
        }
        setDistrictInput(bestKey);
        setLocating(false);
      },
      () => {
        setLocating(false);
        toast.error(t('home.locationDenied'));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Resolve district to stations — fuzzy match against keys and labels
  const localResolved = useMemo<ResolvedLocation | null>(() => {
    const raw = districtInput.trim().toLowerCase();
    if (!raw) return null;
    // Exact key match first
    if (DISTRICT_MAP[raw]) return { ...DISTRICT_MAP[raw], source: 'catalog' };
    // Fuzzy: match against keys and labels
    const entries = Object.entries(DISTRICT_MAP);
    // Try label match (e.g. user typed "Kenai River, AK")
    const labelMatch = entries.find(([, v]) => v.label.toLowerCase() === raw);
    if (labelMatch) return { ...labelMatch[1], source: 'catalog' };
    // Partial match on key or label
    const partialMatches = entries.filter(([k, v]) =>
      k.includes(raw) || v.label.toLowerCase().includes(raw)
    );
    if (partialMatches.length === 1) return { ...partialMatches[0][1], source: 'catalog' };
    // State abbreviation / name matching
    const STATE_NAMES: Record<string, string> = {
      alabama: 'al', alaska: 'ak', arizona: 'az', arkansas: 'ar', california: 'ca',
      colorado: 'co', connecticut: 'ct', delaware: 'de', florida: 'fl', georgia: 'ga',
      hawaii: 'hi', idaho: 'id', illinois: 'il', indiana: 'in', iowa: 'ia',
      kansas: 'ks', kentucky: 'ky', louisiana: 'la', maine: 'me', maryland: 'md',
      massachusetts: 'ma', michigan: 'mi', minnesota: 'mn', mississippi: 'ms', missouri: 'mo',
      montana: 'mt', nebraska: 'ne', nevada: 'nv', 'new hampshire': 'nh', 'new jersey': 'nj',
      'new mexico': 'nm', 'new york': 'ny', 'north carolina': 'nc', 'north dakota': 'nd',
      ohio: 'oh', oklahoma: 'ok', oregon: 'or', pennsylvania: 'pa', 'rhode island': 'ri',
      'south carolina': 'sc', 'south dakota': 'sd', tennessee: 'tn', texas: 'tx', utah: 'ut',
      vermont: 'vt', virginia: 'va', washington: 'wa', 'west virginia': 'wv', wisconsin: 'wi', wyoming: 'wy',
      dc: 'dc', 'washington dc': 'dc', 'district of columbia': 'dc',
    };
    const abbr = STATE_NAMES[raw] || (raw.length === 2 ? raw : null);
    if (abbr) {
      const stateMatches = entries.filter(([, v]) => {
        const labelLower = v.label.toLowerCase();
        return labelLower.endsWith(`, ${abbr}`) || labelLower.includes(`${abbr}/`) || labelLower.includes(`/${abbr}`);
      });
      if (stateMatches.length >= 1) return { ...stateMatches[0][1], source: 'catalog' };
    }
    if (partialMatches.length > 1) return { ...partialMatches[0][1], source: 'catalog' };
    return null;
  }, [districtInput]);

  // If location is not in local map, resolve from DB first, then geocoding fallback
  useEffect(() => {
    const query = districtInput.trim();
    if (!query || localResolved) {
      setGeocodedResolved(null);
      setGeocodeLoading(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setGeocodeLoading(true);
      try {
        const cleaned = sanitizeLocationQuery(query);

        // 1) Prefer internal fishing location DB match (prevents "Drava -> Sweden" mistakes)
        const SEA_CATS = ['bay', 'beach', 'coast', 'coastal', 'estuary', 'fjord', 'harbor', 'inlet', 'island', 'lagoon', 'ocean', 'offshore', 'pier', 'reef', 'strait'];
        const FW_CATS = ['river', 'lake', 'creek', 'stream', 'pond', 'reservoir', 'dam', 'canal', 'backwater', 'bayou', 'swamp', 'wetland', 'wetland/river', 'state park', 'delta'];
        const allowedCats = waterMode === 'sea' ? SEA_CATS : FW_CATS;

        let dbQuery = supabase
          .from('fishing_locations')
          .select('name,lat,lng,country,state,species,category')
          .ilike('name', `%${cleaned}%`);

        // Filter by category matching current water mode
        dbQuery = dbQuery.in('category', allowedCats);

        const { data: dbMatches } = await dbQuery.limit(25);

        if (!cancelled && dbMatches && dbMatches.length > 0) {
          const ranked = [...dbMatches].sort((a, b) => {
            const an = a.name.toLowerCase();
            const bn = b.name.toLowerCase();
            const aq = an.includes(cleaned) ? 2 : 0;
            const bq = bn.includes(cleaned) ? 2 : 0;
            const aRiver = query.toLowerCase().includes('reka') && an.includes('river') ? 2 : 0;
            const bRiver = query.toLowerCase().includes('reka') && bn.includes('river') ? 2 : 0;
            const aSl = a.country === 'Slovenia' ? 2 : 0;
            const bSl = b.country === 'Slovenia' ? 2 : 0;
            return bq + bRiver + bSl - (aq + aRiver + aSl);
          });

          const best = ranked[0];
          // Aggregate species from ALL matching DB entries (same lake can have multiple entries)
          const speciesFreq: Record<string, number> = {};
          dbMatches.forEach((m) => {
            (m.species || []).forEach((s: string) => {
              speciesFreq[s] = (speciesFreq[s] || 0) + 1;
            });
          });
          const aggregatedSpecies = Object.entries(speciesFreq)
            .sort((a, b) => b[1] - a[1])
            .map(([s]) => s);

          setGeocodedResolved({
            lat: best.lat,
            lng: best.lng,
            label: [best.name, best.state, best.country].filter(Boolean).join(', '),
            source: 'database',
            species: aggregatedSpecies.length > 0 ? aggregatedSpecies : best.species || [],
          });
          setGeocodeLoading(false);
          return;
        }

        // 2) External geocode fallback
        const candidates = Array.from(new Set([query, cleaned])).filter(Boolean);
        let best: any = null;

        for (const q of candidates) {
          const resp = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=10&language=en&format=json`,
            { signal: controller.signal }
          );
          if (!resp.ok) continue;
          const json = await resp.json();
          if (json?.results?.length) {
            best = json.results.sort((a: any, b: any) => {
              const aScore = (a.country === 'Slovenia' ? 2 : 0) + (String(a.name || '').toLowerCase().includes(cleaned) ? 2 : 0);
              const bScore = (b.country === 'Slovenia' ? 2 : 0) + (String(b.name || '').toLowerCase().includes(cleaned) ? 2 : 0);
              return bScore - aScore;
            })[0];
            break;
          }
        }

        if (!cancelled && best) {
          setGeocodedResolved({
            lat: best.latitude,
            lng: best.longitude,
            label: [best.name, best.admin1, best.country].filter(Boolean).join(', '),
            source: 'geocoded',
          });
        } else if (!cancelled) {
          setGeocodedResolved(null);
        }
      } catch {
        if (!cancelled) setGeocodedResolved(null);
      } finally {
        if (!cancelled) setGeocodeLoading(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [districtInput, localResolved, waterMode]);

  const resolved = localResolved || geocodedResolved;
  const usgsSiteId = localResolved?.usgsSiteId;
  const lat = resolved?.lat;
  const lng = resolved?.lng;

  const waterTypeHint = useMemo(() => {
    if (waterMode === 'sea') return 'sea' as WaterType;
    if (!resolved) return null;
    const key = districtInput.trim().toLowerCase();
    return getWaterType(key, resolved.label);
  }, [resolved, districtInput, waterMode]);

  const canFetchConditions = !!(resolved && lat != null && lng != null);
  const { data: arso, isLoading, isError } = useArsoData(
    usgsSiteId,
    lat ?? 38.9,
    lng ?? -77.0,
    waterTypeHint,
    canFetchConditions,
  );

  // Fetch nearest spots for species aggregation (more for sea to cover wider area)
  useEffect(() => {
    if (!resolved) {
      setNearestSpecies([]);
      setNearestBaits([]);
      return;
    }
    let cancelled = false;
    const fetchNearest = async () => {
      try {
        const { data, error } = await supabase.rpc('get_nearest_spots', {
          _lat: resolved.lat,
          _lng: resolved.lng,
          _limit: 50,
        });
        if (cancelled || error || !data) return;
        // Aggregate species from nearest spots, ranked by frequency
        const freq: Record<string, number> = {};
        (data as any[]).forEach((spot) => {
          (spot.species || []).forEach((s: string) => {
            freq[s] = (freq[s] || 0) + 1;
          });
        });
        const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).map(([s]) => s);
        if (!cancelled) setNearestSpecies(sorted.slice(0, 20));
      } catch {
        // ignore
      }
    };
    fetchNearest();
    return () => { cancelled = true; };
  }, [resolved?.lat, resolved?.lng]);

  // Fetch species categories from DB so we can filter saltwater vs freshwater dynamically
  useEffect(() => {
    const allRawSpecies = new Set<string>();
    const allResolved = new Set<string>();
    (resolved?.species || []).forEach(s => {
      allRawSpecies.add(s);
      allResolved.add(resolveSpeciesName(s));
    });
    nearestSpecies.forEach(s => {
      allRawSpecies.add(s);
      allResolved.add(resolveSpeciesName(s));
    });
    if (allResolved.size === 0) return;

    let cancelled = false;
    const fetchCategories = async () => {
      const resolvedNames = Array.from(allResolved);
      // First try exact match
      const { data } = await supabase
        .from('fish_species')
        .select('name_en, category')
        .in('name_en', resolvedNames);
      if (cancelled) return;

      const map: Record<string, string> = {};
      (data || []).forEach(row => { map[row.name_en] = row.category || 'freshwater'; });

      // For unmatched names, try fuzzy DB lookup (ILIKE)
      const unmatched = resolvedNames.filter(n => !map[n]);
      if (unmatched.length > 0) {
        for (const name of unmatched) {
          if (cancelled) return;
          const { data: fuzzy } = await supabase
            .from('fish_species')
            .select('name_en, category')
            .ilike('name_en', `%${name}%`)
            .limit(1);
          if (fuzzy && fuzzy.length > 0) {
            map[name] = fuzzy[0].category || 'freshwater';
            // Also map the canonical name to the DB name for image fetching
            map[fuzzy[0].name_en] = fuzzy[0].category || 'freshwater';
          }
        }
      }

      if (!cancelled) setSpeciesCategoryMap(map);
    };
    fetchCategories();
    return () => { cancelled = true; };
  }, [resolved?.species, nearestSpecies]);

  // Water type & recommendations
  const waterType = waterTypeHint;

  const recommendations = useMemo(() => {
    if (!waterType) return null;
    const base = WATER_RECOMMENDATIONS[waterType];
    const mergedFreq: Record<string, number> = {};
    (resolved?.species || []).forEach((s) => {
      const canonical = resolveSpeciesName(s);
      mergedFreq[canonical] = (mergedFreq[canonical] || 0) + 3;
    });
    nearestSpecies.forEach((s, i) => {
      const canonical = resolveSpeciesName(s);
      mergedFreq[canonical] = (mergedFreq[canonical] || 0) + (nearestSpecies.length - i);
    });

    // Filter by water mode using DB categories
    const filtered = Object.entries(mergedFreq).filter(([name]) => {
      const cat = speciesCategoryMap[name];
      if (waterMode === 'sea') {
        // Show saltwater and brackish species in sea mode
        return cat === 'saltwater' || cat === 'brackish';
      }
      // Show freshwater and brackish species in freshwater mode
      return cat === 'freshwater' || cat === 'brackish' || !cat;
    });

    const mergedSorted = filtered.sort((a, b) => b[1] - a[1]).map(([s]) => s);
    if (mergedSorted.length > 0) {
      const fishEn = mergedSorted.slice(0, 8);
      return { ...base, fishEn, fishIds: fishEn.map(toFishId) };
    }
    return base;
  }, [waterType, resolved, nearestSpecies, waterMode, speciesCategoryMap]);

  // Fetch fish images from DB when recommendations change
  useEffect(() => {
    if (!recommendations) return;
    const fetchFishImages = async () => {
      const imgMap: Record<string, string> = {};
      const dataMap: Record<string, DbFish> = {};

      // Try exact match first
      const { data } = await supabase
        .from('fish_species')
        .select('id, name_en, latin_name, category, habitat, techniques, baits, description, protection, min_size, image_url')
        .in('name_en', recommendations.fishEn);

      const matched = new Set<string>();
      if (data) {
        data.forEach((row) => {
          const idx = recommendations.fishEn.indexOf(row.name_en);
          if (idx >= 0) {
            const fishId = recommendations.fishIds[idx];
            if (row.image_url) imgMap[fishId] = row.image_url;
            dataMap[row.name_en] = row as DbFish;
            matched.add(row.name_en);
          }
        });
      }

      // Fuzzy fallback for unmatched species
      const unmatched = recommendations.fishEn.filter(n => !matched.has(n));
      for (const name of unmatched) {
        const { data: fuzzy } = await supabase
          .from('fish_species')
          .select('id, name_en, latin_name, category, habitat, techniques, baits, description, protection, min_size, image_url')
          .ilike('name_en', `%${name}%`)
          .limit(1);
        if (fuzzy && fuzzy.length > 0) {
          const row = fuzzy[0];
          const idx = recommendations.fishEn.indexOf(name);
          if (idx >= 0) {
            const fishId = recommendations.fishIds[idx];
            if (row.image_url) imgMap[fishId] = row.image_url;
            dataMap[name] = row as DbFish;
          }
        }
      }

      setFishImageMap(imgMap);
      setFishDataMap(dataMap);
    };
    fetchFishImages();
  }, [recommendations]);

  // Fetch AI predictions when conditions and fish are available
  useEffect(() => {
    if (!resolved || !recommendations || !arso || isLoading) return;
    setAiPredictions(null);
    setPredictionsLoading(true);
    const fetchPredictions = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('fishing-predictions', {
          body: {
            location: resolved.label,
            fish: recommendations.fishEn,
            conditions: {
              waterTemp: arso.waterTemp,
              airTemp: arso.airTemp,
              flow: arso.flow,
              waterLevel: arso.waterLevel,
              pressure: arso.pressure,
              humidity: arso.humidity,
              moonPhase: arso.moonPhaseEn,
              moonIllumination: arso.moonIllumination,
            },
          },
        });
        if (error) throw error;
        setAiPredictions(data?.predictions || []);
      } catch (e) {
        console.error('AI predictions error:', e);
        setAiPredictions(null);
      } finally {
        setPredictionsLoading(false);
      }
    };
    fetchPredictions();
  }, [resolved, recommendations, arso, isLoading]);

  const filteredSuggestions = useMemo(() => {
    if (!districtInput.trim()) return SUGGESTIONS.slice(0, 8);
    const q = districtInput.toLowerCase();
    // Also match state names
    const STATE_ABBRS: Record<string, string> = {
      alabama: 'al', alaska: 'ak', arizona: 'az', arkansas: 'ar', california: 'ca',
      colorado: 'co', connecticut: 'ct', delaware: 'de', florida: 'fl', georgia: 'ga',
      idaho: 'id', illinois: 'il', indiana: 'in', maine: 'me', maryland: 'md',
      minnesota: 'mn', mississippi: 'ms', missouri: 'mo', montana: 'mt', nevada: 'nv',
      'new york': 'ny', 'north carolina': 'nc', ohio: 'oh', oklahoma: 'ok', oregon: 'or',
      pennsylvania: 'pa', texas: 'tx', utah: 'ut', vermont: 'vt', virginia: 'va',
      washington: 'wa', wisconsin: 'wi', wyoming: 'wy', dc: 'dc',
    };
    const abbr = STATE_ABBRS[q] || (q.length === 2 ? q : null);
    const results = SUGGESTIONS.filter(s => {
      const sl = s.toLowerCase();
      if (sl.includes(q)) return true;
      if (abbr && (sl.endsWith(`, ${abbr}`) || sl.includes(`${abbr}/`) || sl.includes(`/${abbr}`))) return true;
      return false;
    });
    return results.slice(0, 8);
  }, [districtInput]);

  const factors = useMemo(() => {
    if (!arso) return [];
    
    const waterTempScore = arso.waterTemp != null
      ? Math.max(0, Math.min(100, 100 - Math.abs(arso.waterTemp - 15) * 5))
      : 50;
    const airTempScore = arso.airTemp != null
      ? Math.max(0, Math.min(100, 100 - Math.abs(arso.airTemp - 20) * 3))
      : 50;
    const pressureScore = arso.pressure != null
      ? Math.max(0, Math.min(100, 100 - Math.abs(arso.pressure - 1013) * 2))
      : 50;
    const flowScore = arso.flow != null
      ? Math.max(0, Math.min(100, arso.flow < 5 ? 40 : arso.flow < 20 ? 80 : arso.flow < 50 ? 60 : 30))
      : 50;

    const hour = new Date().getHours();
    const timeScore = (hour >= 5 && hour <= 9) || (hour >= 17 && hour <= 21) ? 90 : 
                      (hour >= 10 && hour <= 16) ? 50 : 30;
    
    const moonScore = arso.moonIllumination != null
      ? Math.max(30, 100 - arso.moonIllumination)
      : 60;

    const baseFactors = [
      { key: 'waterTemp', value: Math.round(waterTempScore), icon: Thermometer },
      { key: 'airTemp', value: Math.round(airTempScore), icon: Thermometer },
      { key: 'pressure', value: Math.round(pressureScore), icon: Wind },
      { key: 'flow', value: Math.round(flowScore), icon: Droplets },
      { key: 'moonPhase', value: Math.round(moonScore), icon: Moon },
      { key: 'timeOfDay', value: timeScore, icon: Clock },
    ];

    // Add wave score for sea mode
    if (waterMode === 'sea' && arso.marine) {
      const wh = arso.marine.waveHeight;
      const waveScore = wh != null
        ? Math.max(0, Math.min(100, wh < 0.5 ? 95 : wh < 1.0 ? 80 : wh < 1.5 ? 60 : wh < 2.5 ? 35 : 10))
        : 50;
      baseFactors.push({ key: 'waves', value: Math.round(waveScore), icon: Waves });
    }

    return baseFactors;
  }, [arso, waterMode]);

  const score = useMemo(() => {
    if (factors.length === 0) return 0;
    const base = factors.reduce((s, f) => s + f.value, 0) / factors.length;
    return Math.min(100, Math.round(base));
  }, [factors]);

  const getStatus = (s: number) => {
    if (s >= 80) return { label: t('conditions.status.excellent'), className: 'bg-score-excellent text-card' };
    if (s >= 60) return { label: t('conditions.status.good'), className: 'bg-score-good text-card' };
    if (s >= 40) return { label: t('conditions.status.ok'), className: 'bg-score-ok text-foreground' };
    return { label: t('conditions.status.poor'), className: 'bg-score-poor text-card' };
  };

  const status = getStatus(score);
  const showWarning = arso && (!arso.hydroAvailable || !arso.weatherAvailable);

  const FACTOR_COLORS = ['#0ea5e9', '#f59e0b', '#8b5cf6', '#10b981', '#f97316', '#ec4899', '#06b6d4'];

  const donutData = useMemo(() => {
    if (factors.length === 0) return [{ value: 100, color: 'hsl(var(--muted))' }];
    const segments = factors.map((f, i) => ({
      value: f.value,
      color: FACTOR_COLORS[i % FACTOR_COLORS.length],
    }));
    return segments;
  }, [factors]);

  const isFree = !subscriptionLoading && !isPremium;

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 relative">
      <h1 className="mb-4 font-display text-2xl font-bold text-foreground lg:text-3xl">
        {t('conditions.title')}
      </h1>

      {/* Sea / Freshwater Toggle */}
      <div className="mb-6 flex rounded-xl bg-muted p-1 w-full">
        <button
          onClick={() => setWaterMode('freshwater')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${waterMode === 'freshwater' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Droplets className="h-4 w-4" />
          {t('conditions.freshwater')}
        </button>
        <button
          onClick={() => setWaterMode('sea')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${waterMode === 'sea' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Waves className="h-4 w-4" />
          {t('conditions.sea')}
        </button>
      </div>

      {showWarning && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-border bg-accent p-3 text-sm text-muted-foreground">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {t('conditions.dataWarning')}
        </div>
      )}

      {/* District input */}
      <div className="mb-8 relative max-w-md">
        <label className="mb-2 block text-sm font-medium text-foreground">
          <MapPin className="inline h-4 w-4 mr-1" />
          Enter a river, lake or fishing location
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={districtInput}
            onChange={(e) => {
              setDistrictInput(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder='e.g. "Potomac River", "Lake Erie", "Yellowstone River"...'
            className="pl-10"
          />
        </div>
        <div className="mt-2 flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleUseMyLocation}
            disabled={locating}
            className="flex-1 h-10 rounded-xl gap-2 text-sm font-medium"
          >
            {locating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LocateFixed className="h-4 w-4" />
            )}
            {locating ? t('home.locating') : t('home.useMyLocation')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setMapPickerOpen(true)}
            className="h-10 rounded-xl gap-2 text-sm font-medium"
          >
            <Map className="h-4 w-4" />
            Pick on Map
          </Button>
        </div>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-card shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.map((s) => (
              <button
                key={s}
                onMouseDown={() => {
                  // Find the key that matches this label
                  const entry = Object.entries(DISTRICT_MAP).find(([, v]) => v.label === s);
                  if (entry) setDistrictInput(entry[0]);
                  else setDistrictInput(s);
                  setShowSuggestions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {resolved && (
          <p className="mt-2 text-xs text-muted-foreground">
            📍 {resolved.label}{usgsSiteId ? ` · USGS Site: ${usgsSiteId}` : ` · ${lat.toFixed(2)}°, ${lng.toFixed(2)}°`}
            {resolved.source === 'geocoded' ? ' · interpreted from your input' : ''}
          </p>
        )}
        {geocodeLoading && !resolved && (
          <p className="mt-2 text-xs text-muted-foreground">Searching location from your input…</p>
        )}
        <p className="mt-2 text-xs text-muted-foreground italic">
          Data sourced from real-time weather and hydrological services. Not all stations report all parameters.
        </p>
      </div>

      {/* Current condition values - visible to ALL users */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))
        ) : arso ? (
          <>
            <InfoCard label={t('conditions.waterTemp')} value={arso.waterTemp != null ? `${arso.waterTemp}°C / ${Math.round(arso.waterTemp * 9/5 + 32)}°F` : '—'} icon={<Droplets className="h-5 w-5 text-water" />} />
            <InfoCard label={t('conditions.airTemp')} value={arso.airTemp != null ? `${arso.airTemp}°C / ${Math.round(arso.airTemp * 9/5 + 32)}°F` : '—'} icon={<Thermometer className="h-5 w-5 text-warm" />} />
            <InfoCard label={t('conditions.flow')} value={arso.flow != null ? `${arso.flow} m³/s` : '—'} icon={<ArrowDown className="h-5 w-5 text-primary" />} />
            <InfoCard label={t('conditions.waterLevel')} value={arso.waterLevel != null ? `${arso.waterLevel} m / ${(arso.waterLevel * 3.281).toFixed(1)} ft` : '—'} icon={<ArrowUp className="h-5 w-5 text-primary" />} />
            <InfoCard label={t('conditions.pressure')} value={arso.pressure != null ? `${arso.pressure} hPa` : '—'} icon={<Wind className="h-5 w-5 text-muted-foreground" />} />
            <InfoCard label={t('conditions.moonPhase')} value={arso.moonPhaseEn} icon={<Moon className="h-5 w-5 text-warm" />} />
          </>
        ) : null}
      </div>

      {/* Sea Conditions — waves, currents */}
      {waterMode === 'sea' && arso?.marine && !isLoading && (
        <div className="mb-8 space-y-4">
          {/* Current sea conditions header */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-primary">{t('conditions.seaConditions')}</h3>
              {resolved && <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{resolved.label}</span>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">{t('conditions.seaTemperature')}</p>
                <p className="text-3xl font-bold text-foreground flex items-center gap-1">
                  <Thermometer className="h-5 w-5 text-water" />
                  {arso.marine.seaTemp != null ? `${arso.marine.seaTemp}°` : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('conditions.seaCurrent')}</p>
                <p className="text-2xl font-bold text-foreground">
                  {arso.marine.currentSpeed != null ? `${arso.marine.currentSpeed} m/s` : '—'}
                </p>
                {arso.marine.currentDirection != null && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {Math.round(arso.marine.currentDirection)}° {arso.marine.currentDirectionLabel}
                    <Navigation className="h-3 w-3" style={{ transform: `rotate(${arso.marine.currentDirection}deg)` }} />
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Wave tabs: Combined, Swell, Wind Waves */}
          <SeaWaveTabs marine={arso.marine} t={t} />
        </div>
      )}

      {waterMode === 'sea' && isLoading && (
        <div className="mb-8 space-y-3">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      )}

      {/* Premium gate for score + advanced features */}
      {isFree ? (
        <div className="relative mt-4">
          <div className="filter blur-sm pointer-events-none select-none opacity-50">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card lg:col-span-1 flex flex-col items-center justify-center h-64">
                <p className="text-sm font-medium text-muted-foreground mb-2">{t('conditions.score')}</p>
                <span className="font-display text-5xl font-bold text-foreground">??</span>
              </div>
              <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {['waterTemp', 'airTemp', 'pressure', 'flow', 'moonPhase', 'timeOfDay'].map((k) => (
                  <div key={k} className="rounded-xl border border-border bg-card p-4 shadow-card">
                    <span className="text-sm font-medium text-foreground">{t(`conditions.${k}`)}</span>
                    <div className="h-2.5 mt-3 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary/30 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div className="rounded-2xl bg-card/95 backdrop-blur-sm border border-border shadow-lg p-8 text-center max-w-sm">
              <div className="rounded-2xl bg-primary/10 p-4 mb-4 mx-auto w-fit">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-bold mb-2 text-foreground">Fishing Score & AI Predictions</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Unlock fishing score, bite predictions, species recommendations, AI analysis, and 7-day forecast.
              </p>
              <Button onClick={() => navigate('/premium')} className="gap-2 w-full">
                <Crown className="h-4 w-4" />
                Unlock Premium
              </Button>
            </div>
          </div>
        </div>
      ) : (
      <>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Score donut card */}
        <motion.div
          className="rounded-2xl border border-border bg-card p-6 shadow-card lg:col-span-1 flex flex-col items-center justify-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-sm font-medium text-muted-foreground mb-2">{t('conditions.score')}</p>
          {isLoading ? (
            <Skeleton className="h-48 w-48 rounded-full" />
          ) : (
            <div className="relative w-52 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={68}
                    outerRadius={90}
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-5xl font-bold text-foreground">{score}</span>
                <span className={`mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${status.className}`}>
                  {status.label}
                </span>
              </div>
            </div>
          )}
          {!isLoading && factors.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1">
              {factors.map((f, i) => (
                <div key={f.key} className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: FACTOR_COLORS[i % FACTOR_COLORS.length] }} />
                  <span className="text-xs text-muted-foreground">{t(`conditions.${f.key}`)}</span>
                </div>
              ))}
            </div>
          )}
          {arso && (
            <p className="mt-4 text-xs text-muted-foreground">
              {t('conditions.lastUpdate')}: {new Date(arso.lastUpdate).toLocaleTimeString('en-US')}
            </p>
          )}
        </motion.div>

      </div>

      {/* Factor breakdown cards */}
      <div className="mt-10">
        <h2 className="mb-6 font-display text-xl font-semibold text-foreground">
          {t('conditions.breakdown')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {factors.map((f, idx) => {
            const Icon = f.icon;
            const color = FACTOR_COLORS[idx % FACTOR_COLORS.length];
            return (
              <motion.div
                key={f.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-xl border border-border bg-card p-4 shadow-card"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg p-1.5" style={{ backgroundColor: `${color}20` }}>
                      <Icon className="h-4 w-4" style={{ color }} />
                    </div>
                    <span className="text-sm font-medium text-foreground">{t(`conditions.${f.key}`)}</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">{f.value}</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${f.value}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.08, ease: 'easeOut' }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {f.value >= 80 ? 'Excellent' : f.value >= 60 ? 'Good' : f.value >= 40 ? 'Fair' : 'Poor'}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Real-time Bite Prediction */}
      {resolved && recommendations && arso && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8"
        >
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-foreground">
            <Activity className="h-5 w-5 text-primary" />
            🎣 Real-time Bite Prediction
            <span className="ml-auto flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-score-excellent opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-score-excellent" />
              </span>
              LIVE
            </span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.fishEn.map((fish, idx) => {
               const bite = calculateBiteProbability(fish, {
                waterTemp: arso.waterTemp,
                airTemp: arso.airTemp,
                pressure: arso.pressure,
                flow: arso.flow,
                moonIllumination: arso.moonIllumination,
                waveHeight: waterMode === 'sea' ? arso.marine?.waveHeight ?? null : null,
                swellHeight: waterMode === 'sea' ? arso.marine?.swellHeight ?? null : null,
                currentSpeed: waterMode === 'sea' ? arso.marine?.currentSpeed ?? null : null,
              }, speciesCategoryMap[fish]);
              const barColor = bite.probability >= 75 ? 'bg-score-excellent' : bite.probability >= 55 ? 'bg-score-good' : bite.probability >= 35 ? 'bg-score-ok' : 'bg-score-poor';
              const statusColor = bite.probability >= 75 ? 'text-score-excellent' : bite.probability >= 55 ? 'text-score-good' : bite.probability >= 35 ? 'text-score-ok' : 'text-score-poor';
              const imgUrl = fishImageMap[recommendations.fishIds[idx]];

              return (
                <motion.div
                  key={fish}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.06 }}
                  className="rounded-2xl border border-border bg-card p-4 shadow-card cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => { const fishItem = fishDataMap[fish]; if (!fishItem) return; setSelectedFish(fishItem); requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'auto' })); }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {imgUrl && imgUrl !== '/placeholder.svg' ? (
                      <img src={imgUrl} alt={fish} className="h-10 w-10 rounded-lg object-contain bg-accent p-0.5" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                        <Fish className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-foreground truncate">{fish}</h3>
                      <p className={`text-xs font-bold ${statusColor}`}>{bite.status}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-black ${statusColor}`}>{bite.probability}%</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden mb-3">
                    <motion.div
                      className={`h-full rounded-full ${barColor}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${bite.probability}%` }}
                      transition={{ duration: 1, delay: idx * 0.08, ease: 'easeOut' }}
                    />
                  </div>

                  {/* Factors */}
                  {bite.factors.length > 0 && (
                    <div className="space-y-1">
                      {bite.factors.slice(0, 3).map((f, i) => (
                        <p key={i} className="text-[11px] text-muted-foreground leading-tight">{f}</p>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
          <p className="mt-3 text-[10px] text-muted-foreground italic">
            Bite probability calculated from real-time water temperature, flow, pressure, moon phase, and species feeding patterns.
          </p>
        </motion.div>
      )}

      {/* Recommendations */}
      <AnimatePresence>
        {resolved && recommendations && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="mt-10 space-y-8"
          >
            {/* Top fish */}
            <div>
              <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-foreground">
                <Fish className="h-5 w-5 text-primary" />
                Top fish – {resolved.label}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {recommendations.fishEn.map((name, idx) => {
                  const fishId = recommendations.fishIds[idx];
                  const imgUrl = fishImageMap[fishId];
                  return (
                    <motion.div
                      key={fishId}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 shadow-card cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => { const fishItem = fishDataMap[name]; if (!fishItem) return; setSelectedFish(fishItem); requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'auto' })); }}
                    >
                      {imgUrl && imgUrl !== '/placeholder.svg' ? (
                        <img src={imgUrl} alt={name} className="h-20 w-full rounded-lg object-contain bg-card p-1" />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
                          <Fish className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <span className="text-center text-sm font-medium text-foreground">{name}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Recommended baits */}
            <div>
              <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-foreground">
                <Target className="h-5 w-5 text-primary" />
                Recommended baits – {resolved.label}
              </h2>
              <div className="flex flex-wrap gap-3">
                {recommendations.baitsEn.map((name, idx) => (
                  <motion.div
                    key={recommendations.baitIds[idx]}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="rounded-lg border border-border bg-card px-4 py-3 shadow-card"
                  >
                    <span className="text-sm font-medium text-foreground">{name}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* AI Prediction Engine */}
            <div>
              <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-foreground">
                <Brain className="h-5 w-5 text-primary" />
                🎯 AI Fishing Predictions – {resolved.label}
              </h2>
              {predictionsLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-3">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ))}
                </div>
              ) : aiPredictions && aiPredictions.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {aiPredictions.map((pred, idx) => {
                    const confidence = pred.confidence || 3;
                    const confColor = confidence >= 4 ? 'text-score-excellent' : confidence >= 3 ? 'text-score-good' : 'text-score-ok';
                    const confBg = confidence >= 4 ? 'bg-score-excellent/10' : confidence >= 3 ? 'bg-score-good/10' : 'bg-score-ok/10';
                    return (
                      <motion.div
                        key={pred.fish}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="rounded-2xl border border-border bg-card p-5 shadow-card space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-heading text-base font-bold text-foreground">{pred.fish}</h3>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${confBg} ${confColor}`}>
                            {'★'.repeat(confidence)}{'☆'.repeat(5 - confidence)}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent">
                              <Waves className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Best Depth</p>
                              <p className="text-sm font-semibold text-foreground">{pred.bestDepth}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent">
                              <Anchor className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Best Lure</p>
                              <p className="text-sm font-semibold text-foreground">{pred.bestLure}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent">
                              <Clock className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Best Time</p>
                              <p className="text-sm font-semibold text-foreground">{pred.bestTime}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent">
                              <Crosshair className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Best Zone</p>
                              <p className="text-sm font-semibold text-foreground">{pred.bestZone}</p>
                            </div>
                          </div>
                        </div>

                        {pred.tip && (
                          <div className="mt-2 rounded-lg bg-primary/5 border border-primary/10 px-3 py-2">
                            <p className="text-xs text-muted-foreground">💡 <span className="font-medium text-foreground">{pred.tip}</span></p>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">AI predictions will appear once conditions are loaded.</p>
              )}
              <p className="mt-3 text-[10px] text-muted-foreground italic">Predictions generated by CastMate AI based on real-time conditions. Use as guidance only.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7-Day Forecast */}
      <div className="mt-8">
        <FishingForecast data={arso} isLoading={isLoading} />
      </div>
      </>
      )}

      {mapPickerOpen && (
        <Suspense fallback={null}>
          <LocationMapPicker
            open={mapPickerOpen}
            onOpenChange={setMapPickerOpen}
            onLocationSelect={handleMapLocationSelect}
          />
        </Suspense>
      )}

      <FishDetailOverlay
        fish={selectedFish}
        onClose={() => setSelectedFish(null)}
      />
    </div>
  );
};

const InfoCard = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-card">
    <div className="rounded-lg bg-accent p-2.5">{icon}</div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold text-foreground">{value}</p>
    </div>
  </div>
);

// Sea wave tabs component
import type { MarineData } from '@/hooks/useArsoData';
import type { TFunction } from 'i18next';

const SeaWaveTabs = ({ marine, t }: { marine: MarineData; t: TFunction }) => {
  const [tab, setTab] = useState<'combined' | 'swell' | 'wind'>('combined');

  const tabs = [
    { key: 'combined' as const, icon: Waves, label: t('conditions.combinedWaves') },
    { key: 'swell' as const, icon: Waves, label: t('conditions.swell') },
    { key: 'wind' as const, icon: Wind, label: t('conditions.windWaves') },
  ];

  const getTabData = () => {
    switch (tab) {
      case 'combined':
        return { height: marine.waveHeight, period: marine.wavePeriod, direction: marine.waveDirection, dirLabel: marine.waveDirectionLabel };
      case 'swell':
        return { height: marine.swellHeight, period: marine.swellPeriod, direction: marine.swellDirection, dirLabel: marine.swellDirectionLabel };
      case 'wind':
        return { height: marine.windWaveHeight, period: marine.windWavePeriod, direction: marine.windWaveDirection, dirLabel: marine.windWaveDirectionLabel };
    }
  };

  const data = getTabData();

  // Build chart data from hourly forecast
  const chartData = (marine.waveHourly || []).map(h => {
    const d = new Date(h.time);
    return {
      label: `${d.getHours().toString().padStart(2, '0')}:00`,
      value: tab === 'swell' ? h.swellHeight : tab === 'wind' ? h.windWaveHeight : h.waveHeight,
    };
  });

  // Find min/max for labels
  const values = chartData.map(d => d.value).filter((v): v is number => v != null);
  const maxVal = values.length > 0 ? Math.max(...values) : 1;
  const chartHeight = 120;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-border">
        {tabs.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors relative ${tab === key ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Icon className="h-4 w-4" />
            {tab === key && <span className="sr-only">{label}</span>}
            {tab === key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        ))}
      </div>

      <div className="p-5">
        {/* Wave type label */}
        <p className="text-sm font-medium text-primary mb-3">
          {tab === 'combined' ? t('conditions.combinedWaves') : tab === 'swell' ? t('conditions.swell') : t('conditions.windWaves')}
        </p>

        <div className="flex gap-6">
          {/* Height */}
          <div className="flex-1">
            <p className="text-4xl font-bold text-foreground">
              {data.height != null ? `${data.height} m` : '—'}
            </p>
          </div>

          {/* Period & Direction */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground">{t('conditions.period')}</p>
                <p className="text-sm font-semibold text-foreground">{data.period != null ? `${data.period} s` : '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-muted-foreground" style={data.direction != null ? { transform: `rotate(${data.direction}deg)` } : {}} />
              <div>
                <p className="text-[10px] text-muted-foreground">{t('conditions.direction')}</p>
                <p className="text-sm font-semibold text-foreground">
                  {data.direction != null ? `${Math.round(data.direction)}° ${data.dirLabel}` : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mini wave chart */}
        {chartData.length > 0 && (
          <div className="mt-4">
            <div className="flex items-end gap-[1px] h-[120px] relative">
              {/* Y axis labels */}
              <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-[9px] text-muted-foreground pointer-events-none">
                <span>{maxVal.toFixed(1)} m</span>
                <span>{(maxVal * 0.7).toFixed(1)} m</span>
                <span>{(maxVal * 0.3).toFixed(1)} m</span>
                <span>0 m</span>
              </div>
              <div className="flex-1 ml-9 flex items-end gap-[1px] h-full">
                {chartData.map((d, i) => {
                  const h = d.value != null ? (d.value / (maxVal || 1)) * chartHeight : 0;
                  const showLabel = i % 4 === 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                      <div
                        className="w-full rounded-t-sm bg-primary/70 min-h-[1px]"
                        style={{ height: `${Math.max(1, h)}px` }}
                      />
                      {showLabel && (
                        <span className="text-[8px] text-muted-foreground mt-1">{d.label}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Min/max labels */}
            <div className="flex justify-between mt-1 px-9">
              {chartData.filter((_, i) => {
                const v = chartData[i].value;
                if (v == null) return false;
                const isMin = v === Math.min(...values);
                const isMax = v === Math.max(...values);
                return isMin || isMax;
              }).slice(0, 3).map((d, i) => (
                <span key={i} className="text-[9px] font-medium text-primary">
                  {d.value != null ? `${d.value} m` : ''}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConditionsPage;
