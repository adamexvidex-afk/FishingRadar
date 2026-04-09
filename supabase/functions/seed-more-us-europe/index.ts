import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
type W = [string, string, string, string, number, number, number, number, string[], number];
function expand(defs: W[]) {
  const rows: any[] = [];
  for (const [name, cat, country, state, lat1, lng1, lat2, lng2, species, count] of defs) {
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      rows.push({
        name: count > 1 ? `${name} - ${i + 1}` : name, category: cat, country, state: state || null,
        lat: +(lat1 + (lat2 - lat1) * t + (Math.random() - 0.5) * 0.008).toFixed(5),
        lng: +(lng1 + (lng2 - lng1) * t + (Math.random() - 0.5) * 0.008).toFixed(5), species,
      });
    }
  }
  return rows;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const defs: W[] = [
    // US - Alaska
    ["Kenai River", "river", "United States", "Alaska", 60.55, -150.90, 60.45, -151.10, ["King Salmon", "Sockeye Salmon", "Rainbow Trout", "Dolly Varden"], 12],
    ["Bristol Bay Rivers", "river", "United States", "Alaska", 59.00, -158.50, 58.80, -158.20, ["King Salmon", "Sockeye Salmon", "Rainbow Trout", "Arctic Char"], 10],
    ["Naknek River", "river", "United States", "Alaska", 58.72, -157.00, 58.68, -156.90, ["King Salmon", "Sockeye Salmon", "Rainbow Trout", "Arctic Grayling"], 6],
    ["Situk River", "river", "United States", "Alaska", 59.48, -139.60, 59.45, -139.55, ["Steelhead", "Sockeye Salmon", "Coho Salmon"], 5],
    ["Tongass National Forest Streams", "river", "United States", "Alaska", 56.50, -134.00, 56.30, -133.80, ["Steelhead", "Coho Salmon", "Cutthroat Trout"], 8],

    // US - Hawaii
    ["Kona Coast", "coastal", "United States", "Hawaii", 19.63, -156.00, 19.55, -155.98, ["Blue Marlin", "Yellowfin Tuna", "Mahi-Mahi", "Ono"], 8],
    ["North Shore Oahu", "coastal", "United States", "Hawaii", 21.58, -158.10, 21.55, -158.05, ["Giant Trevally", "Tuna", "Mahi-Mahi"], 5],
    ["Maui Coast", "coastal", "United States", "Hawaii", 20.78, -156.45, 20.73, -156.40, ["Blue Marlin", "Mahi-Mahi", "Ono", "Tuna"], 6],

    // US - Florida (more)
    ["Apalachicola River", "river", "United States", "Florida", 30.00, -85.02, 29.75, -85.00, ["Largemouth Bass", "Striped Bass", "Catfish", "Bream"], 8],
    ["Kissimmee Chain of Lakes", "lake", "United States", "Florida", 28.30, -81.40, 28.20, -81.35, ["Largemouth Bass", "Bluegill", "Crappie"], 8],
    ["Homosassa River", "river", "United States", "Florida", 28.78, -82.60, 28.75, -82.62, ["Tarpon", "Snook", "Redfish", "Trout"], 5],
    ["Dry Tortugas", "coastal", "United States", "Florida", 24.63, -82.87, 24.60, -82.84, ["Yellowtail Snapper", "Permit", "Tarpon", "Barracuda"], 5],

    // US - Pacific Northwest (more)
    ["Deschutes River", "river", "United States", "Oregon", 44.97, -121.28, 44.80, -121.25, ["Steelhead", "Rainbow Trout", "Brown Trout", "Chinook Salmon"], 8],
    ["Rogue River", "river", "United States", "Oregon", 42.43, -124.42, 42.50, -123.80, ["Steelhead", "Chinook Salmon", "Coho Salmon", "Smallmouth Bass"], 10],
    ["Sol Duc River", "river", "United States", "Washington", 48.05, -124.05, 47.95, -124.00, ["Steelhead", "Chinook Salmon", "Coho Salmon"], 6],
    ["Skagit River", "river", "United States", "Washington", 48.45, -121.95, 48.35, -121.80, ["Steelhead", "Chinook Salmon", "Bull Trout"], 6],

    // US - Mountain West (more)
    ["Green River (Utah)", "river", "United States", "Utah", 40.90, -109.42, 40.70, -109.35, ["Brown Trout", "Rainbow Trout", "Cutthroat Trout"], 8],
    ["Flaming Gorge Reservoir", "reservoir", "United States", "Utah", 41.00, -109.55, 40.90, -109.45, ["Lake Trout", "Rainbow Trout", "Kokanee Salmon", "Smallmouth Bass"], 6],
    ["Henry's Fork", "river", "United States", "Idaho", 44.40, -111.55, 44.35, -111.50, ["Rainbow Trout", "Brown Trout", "Cutthroat Trout"], 6],
    ["Bighorn River", "river", "United States", "Montana", 45.30, -107.95, 45.20, -107.90, ["Brown Trout", "Rainbow Trout", "Walleye"], 6],
    ["Missouri River (Montana)", "river", "United States", "Montana", 47.00, -111.80, 46.80, -111.70, ["Rainbow Trout", "Brown Trout", "Walleye"], 8],

    // PORTUGAL
    ["Alqueva Reservoir", "reservoir", "Portugal", "Alentejo", 38.20, -7.55, 38.25, -7.48, ["Largemouth Bass", "Common Carp", "Pike", "Barbel"], 8],
    ["Douro River", "river", "Portugal", "Norte", 41.14, -8.62, 41.10, -8.50, ["Barbel", "Common Carp", "Trout"], 8],
    ["Mondego River", "river", "Portugal", "Centro", 40.20, -8.43, 40.10, -8.45, ["Barbel", "Trout", "Common Carp"], 6],
    ["Tagus River", "river", "Portugal", "Lisboa", 39.46, -8.80, 39.40, -8.50, ["Common Carp", "Barbel", "Catfish", "Sea Bass"], 8],
    ["Algarve Coast", "coastal", "Portugal", "Algarve", 37.00, -8.30, 36.98, -7.80, ["Sea Bass", "Bream", "Grouper", "Bluefin Tuna"], 10],

    // IRELAND
    ["Lough Corrib", "lake", "Ireland", "Galway", 53.43, -9.18, 53.48, -9.10, ["Brown Trout", "Pike", "Salmon", "Perch"], 8],
    ["Lough Mask", "lake", "Ireland", "Mayo", 53.60, -9.45, 53.65, -9.38, ["Brown Trout", "Pike", "Perch"], 6],
    ["River Moy", "river", "Ireland", "Mayo", 54.10, -9.18, 53.95, -9.12, ["Atlantic Salmon", "Sea Trout", "Brown Trout"], 6],
    ["River Shannon", "river", "Ireland", "Leitrim", 53.75, -8.05, 53.30, -8.30, ["Pike", "Bream", "Perch", "Trout"], 10],
    ["Lough Derg", "lake", "Ireland", "Tipperary", 52.90, -8.30, 52.85, -8.25, ["Brown Trout", "Pike", "Perch"], 5],
    ["Wild Atlantic Way Coast", "coastal", "Ireland", "Clare", 52.85, -9.55, 52.80, -9.50, ["Pollack", "Mackerel", "Conger Eel", "Bass"], 6],
    ["Dingle Peninsula Coast", "coastal", "Ireland", "Kerry", 52.13, -10.25, 52.10, -10.20, ["Pollack", "Wrasse", "Mackerel", "Blue Shark"], 5],

    // ICELAND
    ["Laxá í Adaldal", "river", "Iceland", "Northeastern", 65.88, -17.40, 65.82, -17.35, ["Atlantic Salmon", "Brown Trout", "Arctic Char"], 5],
    ["Lake Þingvallavatn", "lake", "Iceland", "Southern", 64.18, -21.12, 64.15, -21.08, ["Brown Trout", "Arctic Char"], 5],
    ["Hvítá River", "river", "Iceland", "Southern", 64.30, -20.30, 64.25, -20.25, ["Atlantic Salmon", "Brown Trout"], 4],
    ["Westfjords Coast", "coastal", "Iceland", "Westfjords", 65.75, -23.10, 65.70, -23.05, ["Atlantic Cod", "Halibut", "Haddock", "Wolffish"], 5],

    // SCOTLAND
    ["River Tay", "river", "United Kingdom", "Scotland", 56.43, -3.43, 56.38, -3.38, ["Atlantic Salmon", "Brown Trout", "Pike"], 6],
    ["River Spey", "river", "United Kingdom", "Scotland", 57.30, -3.20, 57.20, -3.10, ["Atlantic Salmon", "Sea Trout", "Brown Trout"], 6],
    ["Loch Lomond", "lake", "United Kingdom", "Scotland", 56.10, -4.58, 56.15, -4.52, ["Pike", "Brown Trout", "Perch", "Powan"], 6],
    ["Loch Awe", "lake", "United Kingdom", "Scotland", 56.35, -5.08, 56.30, -5.02, ["Brown Trout", "Pike", "Perch", "Rainbow Trout"], 5],
    ["Outer Hebrides Coast", "coastal", "United Kingdom", "Scotland", 57.85, -7.00, 57.80, -6.95, ["Pollack", "Coalfish", "Halibut", "Skate"], 5],
  ];

  const rows = expand(defs);
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const { error } = await supabase.from("fishing_locations").insert(rows.slice(i, i + BATCH));
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    inserted += rows.slice(i, i + BATCH).length;
  }
  return new Response(JSON.stringify({ success: true, inserted }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
