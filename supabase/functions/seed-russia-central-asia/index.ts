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
    // RUSSIA - European
    ["Volga River (Astrakhan Delta)", "river", "Russia", "Astrakhan Oblast", 46.35, 48.05, 46.10, 48.70, ["Wels Catfish", "Zander", "Pike", "Sterlet", "Common Carp", "Asp"], 20],
    ["Volga River (Saratov)", "river", "Russia", "Saratov Oblast", 51.53, 46.00, 51.30, 46.10, ["Zander", "Pike", "Asp", "Common Carp"], 10],
    ["Volga River (Kazan)", "river", "Russia", "Tatarstan", 55.78, 49.12, 55.60, 49.20, ["Pike", "Zander", "Perch", "Asp"], 8],
    ["Rybinsk Reservoir", "reservoir", "Russia", "Yaroslavl Oblast", 58.30, 38.50, 58.50, 38.80, ["Pike", "Zander", "Perch", "Bream"], 10],
    ["Moscow River", "river", "Russia", "Moscow", 55.75, 37.62, 55.70, 37.70, ["Pike", "Perch", "Roach", "Bream"], 6],
    ["Oka River", "river", "Russia", "Ryazan Oblast", 54.62, 39.70, 54.50, 40.00, ["Pike", "Zander", "Asp", "Common Carp"], 8],
    ["Don River", "river", "Russia", "Rostov Oblast", 47.23, 39.70, 47.10, 39.60, ["Zander", "Pike", "Common Carp", "Catfish"], 10],
    ["Kama River", "river", "Russia", "Perm Krai", 58.00, 56.25, 57.80, 56.50, ["Taimen", "Grayling", "Pike", "Perch"], 8],
    ["Lake Ladoga", "lake", "Russia", "Leningrad Oblast", 61.00, 31.00, 60.70, 31.50, ["Salmon", "Brown Trout", "Pike", "Zander", "Perch"], 12],
    ["Lake Onega", "lake", "Russia", "Republic of Karelia", 61.70, 35.50, 61.50, 35.80, ["Salmon", "Brown Trout", "Pike", "Perch"], 10],
    ["Neva River", "river", "Russia", "St. Petersburg", 59.95, 30.35, 59.90, 30.40, ["Salmon", "Pike", "Perch", "Zander"], 5],
    ["White Sea Coast", "coastal", "Russia", "Arkhangelsk Oblast", 64.50, 39.80, 64.40, 39.90, ["Atlantic Salmon", "Sea Trout", "Cod", "Halibut"], 6],
    ["Kola Peninsula Rivers", "river", "Russia", "Murmansk Oblast", 68.50, 33.00, 68.30, 33.50, ["Atlantic Salmon", "Arctic Char", "Brown Trout", "Grayling"], 10],

    // RUSSIA - Siberia
    ["Ob River", "river", "Russia", "Novosibirsk Oblast", 55.03, 82.92, 54.80, 83.10, ["Pike", "Perch", "Sterlet", "Nelma"], 10],
    ["Yenisei River", "river", "Russia", "Krasnoyarsk Krai", 56.02, 92.87, 55.80, 93.00, ["Taimen", "Lenok", "Grayling", "Pike"], 10],
    ["Lake Baikal", "lake", "Russia", "Irkutsk Oblast", 53.50, 108.00, 52.50, 107.50, ["Omul", "Grayling", "Lenok", "Pike", "Perch"], 15],
    ["Angara River", "river", "Russia", "Irkutsk Oblast", 52.28, 104.30, 52.50, 104.50, ["Taimen", "Grayling", "Lenok", "Pike"], 8],
    ["Lena River", "river", "Russia", "Sakha Republic", 62.03, 129.73, 61.80, 129.90, ["Taimen", "Lenok", "Nelma", "Pike"], 8],
    ["Irtysh River", "river", "Russia", "Omsk Oblast", 55.00, 73.37, 54.80, 73.50, ["Pike", "Perch", "Zander", "Sterlet"], 8],

    // RUSSIA - Far East
    ["Kamchatka River", "river", "Russia", "Kamchatka Krai", 56.20, 160.80, 56.00, 161.00, ["Chinook Salmon", "Sockeye Salmon", "Steelhead", "Rainbow Trout", "Arctic Char"], 10],
    ["Amur River", "river", "Russia", "Khabarovsk Krai", 48.48, 134.98, 48.30, 135.20, ["Taimen", "Kaluga Sturgeon", "Pike", "Catfish"], 10],
    ["Zhupanova River", "river", "Russia", "Kamchatka Krai", 54.08, 159.95, 53.90, 160.10, ["Rainbow Trout", "Steelhead", "Dolly Varden"], 6],
    ["Sakhalin Island Coast", "coastal", "Russia", "Sakhalin Oblast", 46.95, 142.75, 46.85, 142.80, ["Chum Salmon", "Pink Salmon", "Taimen", "Halibut"], 6],

    // KAZAKHSTAN
    ["Ili River", "river", "Kazakhstan", "Almaty Region", 44.00, 77.00, 43.80, 77.30, ["Common Carp", "Pike", "Zander", "Catfish"], 8],
    ["Lake Balkhash", "lake", "Kazakhstan", "Almaty Region", 46.80, 75.00, 46.50, 75.50, ["Common Carp", "Pike", "Zander", "Perch"], 10],
    ["Ural River", "river", "Kazakhstan", "West Kazakhstan", 51.15, 51.38, 50.80, 51.50, ["Sterlet", "Pike", "Zander", "Asp"], 8],
    ["Kapchagay Reservoir", "reservoir", "Kazakhstan", "Almaty Region", 43.88, 77.05, 43.92, 77.15, ["Common Carp", "Pike", "Catfish"], 5],

    // UZBEKISTAN
    ["Amu Darya River", "river", "Uzbekistan", "Karakalpakstan", 42.45, 59.60, 42.20, 59.80, ["Common Carp", "Catfish", "Barbel", "Pike"], 6],
    ["Charvak Reservoir", "reservoir", "Uzbekistan", "Tashkent Region", 41.62, 70.05, 41.65, 70.10, ["Rainbow Trout", "Common Carp", "Catfish"], 4],

    // MONGOLIA
    ["Tuul River", "river", "Mongolia", "Töv", 47.92, 106.90, 47.80, 107.10, ["Taimen", "Lenok", "Grayling", "Pike"], 6],
    ["Onon River", "river", "Mongolia", "Khentii", 48.80, 110.80, 48.60, 111.00, ["Taimen", "Lenok", "Grayling"], 6],
    ["Eg-Uur River", "river", "Mongolia", "Khövsgöl", 49.60, 100.20, 49.40, 100.40, ["Taimen", "Lenok", "Grayling", "Pike"], 6],
    ["Lake Khövsgöl", "lake", "Mongolia", "Khövsgöl", 51.10, 100.45, 50.90, 100.55, ["Lenok", "Grayling", "Burbot", "Perch"], 8],

    // GEORGIA
    ["Rioni River", "river", "Georgia", "Imereti", 42.27, 42.70, 42.15, 42.60, ["Brown Trout", "Barbel", "Chub", "Catfish"], 6],
    ["Kura River", "river", "Georgia", "Tbilisi", 41.72, 44.80, 41.60, 44.90, ["Common Carp", "Barbel", "Catfish"], 6],
    ["Jvari Reservoir", "reservoir", "Georgia", "Mtskheta-Mtianeti", 42.12, 44.68, 42.15, 44.72, ["Brown Trout", "Common Carp"], 4],

    // ARMENIA
    ["Lake Sevan", "lake", "Armenia", "Gegharkunik", 40.30, 45.30, 40.20, 45.40, ["Sevan Trout", "Whitefish", "Common Carp"], 8],
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
