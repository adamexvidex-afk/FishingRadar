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
    // NEW ZEALAND - North Island
    ["Lake Taupo", "lake", "New Zealand", "Waikato", -38.78, 175.88, -38.85, 176.00, ["Rainbow Trout", "Brown Trout"], 10],
    ["Tongariro River", "river", "New Zealand", "Waikato", -38.98, 175.80, -39.02, 175.82, ["Rainbow Trout", "Brown Trout"], 6],
    ["Waikato River", "river", "New Zealand", "Waikato", -37.78, 175.28, -38.20, 175.50, ["Rainbow Trout", "Brown Trout", "Perch"], 10],
    ["Lake Rotorua", "lake", "New Zealand", "Bay of Plenty", -38.08, 176.25, -38.12, 176.30, ["Rainbow Trout", "Brown Trout"], 5],
    ["Lake Tarawera", "lake", "New Zealand", "Bay of Plenty", -38.18, 176.40, -38.22, 176.45, ["Rainbow Trout", "Brown Trout"], 5],
    ["Rangitikei River", "river", "New Zealand", "Manawatū-Whanganui", -39.55, 175.75, -39.70, 175.80, ["Brown Trout", "Rainbow Trout"], 6],
    ["Bay of Islands", "coastal", "New Zealand", "Northland", -35.22, 174.10, -35.28, 174.15, ["Marlin", "Kingfish", "Snapper", "Kahawai"], 8],
    ["Hauraki Gulf", "coastal", "New Zealand", "Auckland", -36.75, 175.10, -36.80, 175.15, ["Snapper", "Kingfish", "Kahawai", "Trevally"], 8],
    ["Coromandel Coast", "coastal", "New Zealand", "Waikato", -36.78, 175.48, -36.85, 175.52, ["Snapper", "Kingfish", "Kahawai"], 6],
    ["Ninety Mile Beach", "coastal", "New Zealand", "Northland", -35.00, 173.10, -35.20, 173.05, ["Snapper", "Kahawai", "Trevally"], 5],

    // NEW ZEALAND - South Island
    ["Lake Brunner", "lake", "New Zealand", "West Coast", -42.62, 171.45, -42.65, 171.48, ["Brown Trout", "Perch"], 4],
    ["Mataura River", "river", "New Zealand", "Southland", -46.20, 168.85, -46.35, 168.90, ["Brown Trout", "Rainbow Trout"], 6],
    ["Oreti River", "river", "New Zealand", "Southland", -45.90, 168.10, -46.05, 168.20, ["Brown Trout", "Rainbow Trout"], 6],
    ["Waiau River", "river", "New Zealand", "Canterbury", -42.60, 172.80, -42.70, 172.85, ["Brown Trout", "Salmon"], 5],
    ["Rakaia River", "river", "New Zealand", "Canterbury", -43.55, 171.95, -43.75, 172.00, ["Chinook Salmon", "Brown Trout", "Rainbow Trout"], 6],
    ["Waimakariri River", "river", "New Zealand", "Canterbury", -43.38, 172.30, -43.48, 172.35, ["Chinook Salmon", "Brown Trout"], 5],
    ["Lake Wanaka", "lake", "New Zealand", "Otago", -44.70, 169.10, -44.75, 169.15, ["Brown Trout", "Rainbow Trout", "Landlocked Salmon"], 6],
    ["Lake Wakatipu", "lake", "New Zealand", "Otago", -45.00, 168.65, -45.05, 168.70, ["Brown Trout", "Rainbow Trout"], 5],
    ["Lake Te Anau", "lake", "New Zealand", "Southland", -45.42, 167.72, -45.48, 167.78, ["Brown Trout", "Rainbow Trout"], 5],
    ["Milford Sound Coast", "coastal", "New Zealand", "Southland", -44.67, 167.92, -44.70, 167.95, ["Blue Cod", "Groper", "Trumpeter"], 4],
    ["Kaikōura Coast", "coastal", "New Zealand", "Canterbury", -42.40, 173.68, -42.45, 173.72, ["Blue Cod", "Groper", "Kahawai", "Kingfish"], 6],
    ["Marlborough Sounds", "coastal", "New Zealand", "Marlborough", -41.10, 174.00, -41.15, 174.05, ["Blue Cod", "Snapper", "Kahawai"], 6],

    // FIJI
    ["Viti Levu Coast", "coastal", "Fiji", "Western", -17.78, 177.90, -17.82, 177.95, ["Giant Trevally", "Wahoo", "Mahi-Mahi", "Yellowfin Tuna"], 6],
    ["Kadavu Passage", "coastal", "Fiji", "Eastern", -19.05, 178.10, -19.08, 178.15, ["Giant Trevally", "Dogtooth Tuna", "Wahoo"], 4],
    ["Beqa Lagoon", "coastal", "Fiji", "Central", -18.40, 178.00, -18.42, 178.02, ["Giant Trevally", "Barracuda", "Grouper"], 4],

    // PAPUA NEW GUINEA
    ["Sepik River", "river", "Papua New Guinea", "East Sepik", -4.20, 142.80, -4.30, 143.00, ["Barramundi", "Catfish", "Giant Perch"], 8],
    ["Fly River", "river", "Papua New Guinea", "Western", -7.70, 141.40, -7.80, 141.60, ["Barramundi", "Saratoga", "Giant Perch"], 8],
    ["Kimbe Bay", "coastal", "Papua New Guinea", "West New Britain", -5.55, 150.10, -5.58, 150.15, ["Giant Trevally", "Spanish Mackerel", "Tuna", "Wahoo"], 5],
    ["Rabaul Coast", "coastal", "Papua New Guinea", "East New Britain", -4.20, 152.17, -4.22, 152.20, ["Giant Trevally", "Tuna", "Mahi-Mahi"], 4],

    // TONGA
    ["Vava'u Islands", "coastal", "Tonga", "Vava'u", -18.65, -173.98, -18.68, -173.95, ["Yellowfin Tuna", "Blue Marlin", "Wahoo", "Mahi-Mahi"], 5],

    // SAMOA
    ["Apia Coast", "coastal", "Samoa", "Upolu", -13.83, -171.78, -13.85, -171.75, ["Yellowfin Tuna", "Wahoo", "Giant Trevally"], 4],

    // VANUATU
    ["Efate Coast", "coastal", "Vanuatu", "Shefa", -17.73, 168.30, -17.76, 168.33, ["Marlin", "Wahoo", "Mahi-Mahi", "Tuna"], 5],
    ["Espiritu Santo", "coastal", "Vanuatu", "Sanma", -15.50, 167.20, -15.53, 167.23, ["Giant Trevally", "Wahoo", "Tuna"], 4],

    // SOLOMON ISLANDS
    ["Marovo Lagoon", "coastal", "Solomon Islands", "Western", -8.50, 158.10, -8.53, 158.15, ["Giant Trevally", "Barracuda", "Dogtooth Tuna"], 4],

    // MORE AUSTRALIA (underrepresented areas)
    ["Daintree River", "river", "Australia", "Queensland", -16.30, 145.40, -16.32, 145.42, ["Barramundi", "Mangrove Jack", "Jungle Perch"], 5],
    ["Lake Eildon", "reservoir", "Australia", "Victoria", -37.22, 145.90, -37.28, 145.95, ["Murray Cod", "Golden Perch", "Brown Trout"], 6],
    ["Hawkesbury River", "river", "Australia", "New South Wales", -33.55, 151.10, -33.48, 151.15, ["Mulloway", "Flathead", "Bream"], 6],
    ["Murray River (Mildura)", "river", "Australia", "Victoria", -34.18, 142.15, -34.12, 142.25, ["Murray Cod", "Golden Perch", "Silver Perch"], 8],
    ["Fitzroy River", "river", "Australia", "Western Australia", -18.18, 125.55, -18.30, 125.70, ["Barramundi", "Mangrove Jack", "Sooty Grunter"], 6],
    ["Exmouth Gulf", "coastal", "Australia", "Western Australia", -21.95, 114.10, -22.00, 114.15, ["Giant Trevally", "Sailfish", "Marlin", "Wahoo"], 6],
    ["Cairns Coast", "coastal", "Australia", "Queensland", -16.92, 145.78, -16.88, 145.80, ["Black Marlin", "Giant Trevally", "Spanish Mackerel"], 6],
    ["Ningaloo Reef", "coastal", "Australia", "Western Australia", -22.70, 113.68, -22.75, 113.70, ["Giant Trevally", "Spangled Emperor", "Coral Trout"], 5],
    ["Port Lincoln", "coastal", "Australia", "South Australia", -34.72, 135.85, -34.75, 135.88, ["Bluefin Tuna", "Kingfish", "Snapper"], 5],
    ["Great Barrier Reef (Lizard Island)", "coastal", "Australia", "Queensland", -14.67, 145.45, -14.70, 145.48, ["Giant Trevally", "Coral Trout", "Red Emperor"], 5],
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
