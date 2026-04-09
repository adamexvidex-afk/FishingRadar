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
        name: count > 1 ? `${name} - ${i + 1}` : name,
        category: cat, country, state: state || null,
        lat: +(lat1 + (lat2 - lat1) * t + (Math.random() - 0.5) * 0.008).toFixed(5),
        lng: +(lng1 + (lng2 - lng1) * t + (Math.random() - 0.5) * 0.008).toFixed(5),
        species,
      });
    }
  }
  return rows;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const defs: W[] = [
    // SOUTH AFRICA
    ["Vaal Dam", "reservoir", "South Africa", "Gauteng", -26.87, 28.12, -26.95, 28.25, ["Largemouth Bass", "Common Carp", "Yellowfish"], 12],
    ["Hartbeespoort Dam", "reservoir", "South Africa", "North West", -25.74, 27.83, -25.78, 27.88, ["Largemouth Bass", "Carp", "Tilapia"], 8],
    ["Sterkfontein Dam", "reservoir", "South Africa", "Free State", -28.43, 29.05, -28.48, 29.10, ["Rainbow Trout", "Brown Trout", "Yellowfish"], 6],
    ["Gariep Dam", "reservoir", "South Africa", "Free State", -30.60, 25.50, -30.65, 25.60, ["Largemouth Bass", "Yellowfish", "Catfish"], 8],
    ["Loskop Dam", "reservoir", "South Africa", "Mpumalanga", -25.42, 29.30, -25.48, 29.38, ["Tigerfish", "Largemouth Bass", "Carp"], 6],
    ["Inanda Dam", "reservoir", "South Africa", "KwaZulu-Natal", -29.70, 30.85, -29.73, 30.88, ["Largemouth Bass", "Tilapia", "Catfish"], 5],
    ["Orange River", "river", "South Africa", "Northern Cape", -28.75, 21.00, -28.60, 20.00, ["Yellowfish", "Catfish", "Mudfish"], 15],
    ["Breede River", "river", "South Africa", "Western Cape", -33.90, 19.80, -34.10, 20.50, ["Largemouth Bass", "Carp", "Mullet"], 10],
    ["Olifants River (Limpopo)", "river", "South Africa", "Limpopo", -24.10, 30.80, -24.00, 31.20, ["Tigerfish", "Catfish", "Bream"], 8],
    ["Berg River", "river", "South Africa", "Western Cape", -33.45, 19.05, -33.80, 18.90, ["Rainbow Trout", "Brown Trout", "Bass"], 8],
    ["Theewaterskloof Dam", "reservoir", "South Africa", "Western Cape", -34.05, 19.25, -34.08, 19.30, ["Largemouth Bass", "Carp", "Bluegill"], 5],
    ["Bloemhof Dam", "reservoir", "South Africa", "North West", -27.62, 25.58, -27.68, 25.65, ["Yellowfish", "Carp", "Catfish"], 6],
    ["False Bay Coast", "coastal", "South Africa", "Western Cape", -34.18, 18.45, -34.22, 18.55, ["Yellowtail", "Snoek", "Cape Salmon"], 6],
    ["KZN South Coast", "coastal", "South Africa", "KwaZulu-Natal", -30.80, 30.40, -30.30, 30.60, ["Garrick", "Shad", "Kingfish"], 8],
    ["Sodwana Bay", "coastal", "South Africa", "KwaZulu-Natal", -27.52, 32.68, -27.55, 32.70, ["Marlin", "Sailfish", "Dorado", "Kingfish"], 5],
    ["Wild Coast", "coastal", "South Africa", "Eastern Cape", -31.80, 29.20, -31.50, 29.50, ["Garrick", "Kob", "Shad"], 8],

    // MOZAMBIQUE
    ["Bazaruto Archipelago", "coastal", "Mozambique", "Inhambane", -21.50, 35.40, -21.80, 35.50, ["Marlin", "Sailfish", "Giant Trevally", "Wahoo"], 10],
    ["Zambezi River Delta", "river", "Mozambique", "Zambezia", -18.50, 36.20, -18.30, 36.50, ["Tigerfish", "Vundu Catfish", "Bream"], 8],
    ["Lake Cahora Bassa", "reservoir", "Mozambique", "Tete", -15.55, 32.70, -15.40, 33.00, ["Tigerfish", "Vundu Catfish", "Bream", "Nile Perch"], 10],
    ["Inhambane Coast", "coastal", "Mozambique", "Inhambane", -23.85, 35.38, -23.80, 35.42, ["Giant Trevally", "Kingfish", "Barracuda"], 5],

    // ZIMBABWE
    ["Lake Kariba", "reservoir", "Zimbabwe", "Mashonaland West", -16.52, 28.78, -16.80, 29.20, ["Tigerfish", "Vundu Catfish", "Bream", "Kapenta"], 12],
    ["Mana Pools (Zambezi)", "river", "Zimbabwe", "Mashonaland West", -15.78, 29.35, -15.65, 29.55, ["Tigerfish", "Vundu Catfish", "Chessa"], 8],
    ["Lake Chivero", "reservoir", "Zimbabwe", "Harare", -17.88, 30.78, -17.90, 30.82, ["Largemouth Bass", "Bream", "Catfish"], 5],
    ["Save River", "river", "Zimbabwe", "Masvingo", -20.80, 31.50, -21.30, 31.80, ["Tigerfish", "Catfish", "Bream"], 6],

    // ZAMBIA
    ["Lake Bangweulu", "lake", "Zambia", "Northern", -11.10, 29.70, -11.30, 29.90, ["Tigerfish", "Catfish", "Bream"], 8],
    ["Kafue River", "river", "Zambia", "Central", -15.80, 28.30, -15.40, 28.00, ["Tigerfish", "Vundu Catfish", "Bream"], 10],
    ["Lower Zambezi", "river", "Zambia", "Lusaka", -15.35, 29.00, -15.25, 29.40, ["Tigerfish", "Vundu Catfish", "Bream"], 8],
    ["Lake Itezhi-Tezhi", "reservoir", "Zambia", "Southern", -15.78, 26.00, -15.85, 26.10, ["Tigerfish", "Bream", "Catfish"], 5],

    // TANZANIA
    ["Lake Victoria (Mwanza)", "lake", "Tanzania", "Mwanza", -2.50, 32.88, -2.60, 33.00, ["Nile Perch", "Tilapia", "Catfish"], 12],
    ["Lake Tanganyika (Kigoma)", "lake", "Tanzania", "Kigoma", -4.88, 29.62, -5.10, 29.68, ["Nile Perch", "Goliath Tigerfish", "Catfish"], 10],
    ["Rufiji River", "river", "Tanzania", "Pwani", -7.80, 39.28, -7.90, 39.40, ["Tigerfish", "Catfish", "Tilapia"], 8],
    ["Pemba Channel", "coastal", "Tanzania", "Tanga", -5.20, 39.80, -5.30, 39.85, ["Marlin", "Sailfish", "Tuna", "Wahoo"], 6],
    ["Mafia Island", "coastal", "Tanzania", "Pwani", -7.85, 39.65, -7.90, 39.70, ["Giant Trevally", "Tuna", "Barracuda"], 5],

    // KENYA
    ["Lake Turkana", "lake", "Kenya", "Turkana", 3.50, 36.10, 3.20, 36.20, ["Nile Perch", "Tigerfish", "Tilapia"], 10],
    ["Lake Naivasha", "lake", "Kenya", "Nakuru", -0.77, 36.33, -0.80, 36.38, ["Largemouth Bass", "Tilapia", "Catfish"], 6],
    ["Tana River", "river", "Kenya", "Tana River", -1.50, 40.00, -2.50, 40.30, ["Catfish", "Tilapia", "Barbus"], 10],
    ["Diani Beach", "coastal", "Kenya", "Kwale", -4.32, 39.58, -4.38, 39.60, ["Sailfish", "Marlin", "Tuna", "Kingfish"], 6],
    ["Watamu", "coastal", "Kenya", "Kilifi", -3.35, 40.02, -3.38, 40.05, ["Sailfish", "Giant Trevally", "Barracuda"], 5],
    ["Lamu Archipelago", "coastal", "Kenya", "Lamu", -2.27, 40.90, -2.30, 40.93, ["Giant Trevally", "Tuna", "Sailfish"], 5],

    // UGANDA
    ["Lake Victoria (Entebbe)", "lake", "Uganda", "Central", 0.05, 32.45, -0.05, 32.55, ["Nile Perch", "Tilapia", "Catfish"], 8],
    ["Murchison Falls (Nile)", "river", "Uganda", "Northern", 2.28, 31.68, 2.20, 31.75, ["Nile Perch", "Tigerfish", "Catfish"], 6],
    ["Lake Albert", "lake", "Uganda", "Western", 1.80, 30.85, 1.60, 30.95, ["Nile Perch", "Tigerfish", "Tilapia"], 8],

    // BOTSWANA
    ["Okavango Delta", "river", "Botswana", "North-West", -19.00, 22.60, -19.50, 23.00, ["Tigerfish", "Bream", "Catfish", "Pike"], 12],
    ["Chobe River", "river", "Botswana", "North-West", -17.80, 25.12, -17.78, 25.25, ["Tigerfish", "Bream", "Vundu Catfish"], 8],

    // NAMIBIA
    ["Zambezi Region Rivers", "river", "Namibia", "Zambezi", -17.80, 24.25, -17.78, 24.50, ["Tigerfish", "Bream", "Catfish"], 6],
    ["Hardap Dam", "reservoir", "Namibia", "Hardap", -24.48, 17.82, -24.52, 17.85, ["Largemouth Bass", "Carp", "Catfish"], 4],
    ["Skeleton Coast", "coastal", "Namibia", "Kunene", -19.50, 12.50, -20.50, 13.20, ["Steenbras", "Kob", "Galjoen"], 6],

    // MADAGASCAR
    ["Pangalanes Canal", "river", "Madagascar", "Atsinanana", -18.90, 49.15, -19.50, 49.20, ["Tilapia", "Catfish", "Snakehead"], 8],
    ["Nosy Be Coast", "coastal", "Madagascar", "Diana", -13.32, 48.20, -13.38, 48.25, ["Sailfish", "Giant Trevally", "Dogtooth Tuna"], 5],
    ["Lake Itasy", "lake", "Madagascar", "Itasy", -19.05, 46.75, -19.08, 46.78, ["Tilapia", "Common Carp", "Catfish"], 4],
  ];

  const rows = expand(defs);
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from("fishing_locations").insert(batch);
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    inserted += batch.length;
  }

  return new Response(JSON.stringify({ success: true, inserted }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
