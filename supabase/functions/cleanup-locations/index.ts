import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Major city centers worldwide - if a "fishing spot" is within ~1.5km of these, 
// it's likely wrong unless it's explicitly a river/canal through the city
const cityCenters: [string, number, number][] = [
  // Europe
  ["Ljubljana", 46.0511, 14.5058],
  ["Zagreb", 45.8131, 15.9775],
  ["Belgrade Center", 44.8176, 20.4569],
  ["Budapest Center", 47.4979, 19.0402],
  ["Vienna Center", 48.2082, 16.3738],
  ["Prague Center", 50.0755, 14.4378],
  ["Warsaw Center", 52.2297, 21.0122],
  ["Bratislava Center", 48.1486, 17.1077],
  ["Bucharest Center", 44.4268, 26.1025],
  ["Sofia Center", 42.6977, 23.3219],
  ["Athens Center", 37.9838, 23.7275],
  ["Rome Center", 41.9028, 12.4964],
  ["Madrid Center", 40.4168, -3.7038],
  ["Barcelona Center", 41.3874, 2.1686],
  ["Lisbon Center", 38.7223, -9.1393],
  ["Amsterdam Center", 52.3676, 4.9041],
  ["Brussels Center", 50.8503, 4.3517],
  ["Zurich Center", 47.3769, 8.5417],
  ["Munich Center", 48.1351, 11.5820],
  ["Milan Center", 45.4642, 9.1900],
  // Asia
  ["Tokyo Center", 35.6762, 139.6503],
  ["Seoul Center", 37.5665, 126.9780],
  ["Manila Center", 14.5995, 120.9842],
  ["Jakarta Center", 6.2088, 106.8456],
  ["Kuala Lumpur Center", 3.1390, 101.6869],
  ["Singapore Center", 1.3521, 103.8198],
  ["Hanoi Center", 21.0278, 105.8342],
  ["Phnom Penh Center", 11.5564, 104.9282],
  ["Delhi Center", 28.6139, 77.2090],
  ["Mumbai Center", 19.0760, 72.8777],
  ["Kolkata Center", 22.5726, 88.3639],
  ["Dhaka Center", 23.8103, 90.4125],
  // Americas
  ["Mexico City Center", 19.4326, -99.1332],
  ["Bogotá Center", 4.7110, -74.0721],
  ["Lima Center", -12.0464, -77.0428],
  ["São Paulo Center", -23.5505, -46.6333],
  ["Buenos Aires Center", -34.6037, -58.3816],
  ["Santiago Center", -33.4489, -70.6693],
  // Africa
  ["Cairo Center", 30.0444, 31.2357],
  ["Lagos Center", 6.5244, 3.3792],
  ["Nairobi Center", -1.2921, 36.8219],
  ["Johannesburg Center", -26.2041, 28.0473],
  ["Cape Town Center", -33.9249, 18.4241],
  ["Casablanca Center", 33.5731, -7.5898],
  // Oceania
  ["Sydney Center", -33.8688, 151.2093],
  ["Melbourne Center", -37.8136, 144.9631],
];

// Haversine distance in km
function distKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// River/canal keywords — spots with these in the name that are near a city are likely OK
const waterKeywords = /river|canal|kanal|reka|potok|stream|creek|harbour|harbor|port|pier|dock|wharf|bay|fjord|sea|ocean|coast|shore|beach|dam|reservoir|jezero|lake|étang|lago|see|lac|rio|fleuve|fluss|flu(ss|ß)/i;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const body = await req.json().catch(() => ({}));
  const dryRun = body.dry_run ?? true;
  const radiusKm = body.radius_km ?? 1.5;

  // Fetch all locations
  const allLocations: any[] = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data } = await supabase
      .from("fishing_locations")
      .select("id, name, lat, lng, country, category")
      .range(from, from + pageSize - 1);
    if (!data || data.length === 0) break;
    allLocations.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  // Find locations too close to city centers that don't have water keywords
  const flagged: { id: string; name: string; lat: number; lng: number; nearCity: string; dist: number }[] = [];

  for (const loc of allLocations) {
    // Skip if name clearly indicates water
    if (waterKeywords.test(loc.name)) continue;
    // Skip if category is explicitly coastal/ocean
    if (['ocean', 'coastal', 'pier', 'bay'].includes(loc.category)) continue;

    for (const [cityName, cityLat, cityLng] of cityCenters) {
      const d = distKm(loc.lat, loc.lng, cityLat, cityLng);
      if (d < radiusKm) {
        flagged.push({ id: loc.id, name: loc.name, lat: loc.lat, lng: loc.lng, nearCity: cityName, dist: Math.round(d * 100) / 100 });
        break;
      }
    }
  }

  let deleted = 0;
  if (!dryRun && flagged.length > 0) {
    const ids = flagged.map(f => f.id);
    // Delete in batches of 100
    for (let i = 0; i < ids.length; i += 100) {
      const batch = ids.slice(i, i + 100);
      await supabase.from("fishing_locations").delete().in("id", batch);
    }
    deleted = flagged.length;
  }

  return new Response(
    JSON.stringify({
      totalChecked: allLocations.length,
      flaggedCount: flagged.length,
      deleted: dryRun ? 0 : deleted,
      dryRun,
      radiusKm,
      flagged: flagged.map(f => ({ name: f.name, nearCity: f.nearCity, dist: f.dist })),
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
