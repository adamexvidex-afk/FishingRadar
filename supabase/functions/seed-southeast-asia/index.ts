import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// [name, category, country, state, lat1, lng1, lat2, lng2, species[], pointCount]
type WaterwayDef = [string, string, string, string, number, number, number, number, string[], number];

function expand(defs: WaterwayDef[]) {
  const rows: any[] = [];
  for (const [name, cat, country, state, lat1, lng1, lat2, lng2, species, count] of defs) {
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const jitter = 0.008;
      rows.push({
        name: count > 1 ? `${name} - ${i + 1}` : name,
        category: cat,
        country,
        state: state || null,
        lat: +(lat1 + (lat2 - lat1) * t + (Math.random() - 0.5) * jitter).toFixed(5),
        lng: +(lng1 + (lng2 - lng1) * t + (Math.random() - 0.5) * jitter).toFixed(5),
        species,
      });
    }
  }
  return rows;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const defs: WaterwayDef[] = [
    // THAILAND
    ["Mekong River (Chiang Rai)", "river", "Thailand", "Chiang Rai", 20.25, 100.08, 20.05, 100.15, ["Giant Catfish", "Mekong Giant Barb", "Snakehead"], 12],
    ["Mekong River (Nong Khai)", "river", "Thailand", "Nong Khai", 17.87, 102.72, 17.75, 102.95, ["Giant Catfish", "Pangasius", "Snakehead"], 10],
    ["Mekong River (Ubon)", "river", "Thailand", "Ubon Ratchathani", 15.28, 105.40, 15.10, 105.55, ["Giant Catfish", "Striped Catfish"], 8],
    ["Chao Phraya River", "river", "Thailand", "Bangkok", 14.50, 100.50, 13.72, 100.52, ["Snakehead", "Giant Gourami", "Catfish"], 12],
    ["Bung Sam Lan Lake", "lake", "Thailand", "Ayutthaya", 14.40, 100.62, 14.40, 100.62, ["Arapaima", "Giant Siamese Carp", "Mekong Catfish"], 4],
    ["Khao Laem Dam", "reservoir", "Thailand", "Kanchanaburi", 14.82, 98.83, 14.90, 98.92, ["Jungle Perch", "Hampala Barb", "Snakehead"], 8],
    ["Cheow Lan Lake", "lake", "Thailand", "Surat Thani", 8.93, 98.78, 8.97, 98.85, ["Jungle Perch", "Hampala Barb", "Mahseer"], 6],
    ["Ping River", "river", "Thailand", "Chiang Mai", 18.78, 98.98, 18.50, 99.00, ["Mahseer", "Jungle Perch", "Catfish"], 8],
    ["Nan River", "river", "Thailand", "Nan", 18.78, 100.78, 18.30, 100.72, ["Mahseer", "Hampala Barb"], 6],
    ["Kwai Yai River", "river", "Thailand", "Kanchanaburi", 14.77, 98.52, 14.02, 99.53, ["Jungle Perch", "Hampala Barb", "Snakehead"], 10],
    ["Srinakarin Dam", "reservoir", "Thailand", "Kanchanaburi", 14.40, 98.93, 14.50, 99.00, ["Giant Snakehead", "Hampala Barb"], 6],
    ["Kaeng Krachan Reservoir", "reservoir", "Thailand", "Phetchaburi", 12.83, 99.58, 12.90, 99.65, ["Snakehead", "Catfish", "Tilapia"], 5],

    // VIETNAM
    ["Mekong Delta", "river", "Vietnam", "Can Tho", 10.03, 105.78, 9.78, 106.30, ["Pangasius", "Snakehead", "Barramundi"], 15],
    ["Red River (Hanoi)", "river", "Vietnam", "Hanoi", 21.05, 105.85, 20.88, 106.05, ["Common Carp", "Catfish", "Snakehead"], 10],
    ["Da River", "river", "Vietnam", "Hoa Binh", 21.10, 105.00, 20.82, 105.32, ["Mahseer", "Catfish", "Common Carp"], 8],
    ["Ho Tay (West Lake)", "lake", "Vietnam", "Hanoi", 21.06, 105.82, 21.06, 105.82, ["Common Carp", "Tilapia", "Catfish"], 3],
    ["Ba Be Lake", "lake", "Vietnam", "Bac Kan", 22.42, 105.62, 22.43, 105.63, ["Catfish", "Common Carp", "Barb"], 4],
    ["Dau Tieng Reservoir", "reservoir", "Vietnam", "Tay Ninh", 11.33, 106.33, 11.38, 106.40, ["Snakehead", "Tilapia", "Catfish"], 5],
    ["Tri An Reservoir", "reservoir", "Vietnam", "Dong Nai", 11.08, 107.00, 11.15, 107.08, ["Snakehead", "Catfish", "Carp"], 5],
    ["Perfume River", "river", "Vietnam", "Hue", 16.47, 107.58, 16.43, 107.50, ["Catfish", "Tilapia", "Snakehead"], 5],

    // INDONESIA
    ["Lake Toba", "lake", "Indonesia", "North Sumatra", 2.62, 98.82, 2.50, 99.00, ["Common Carp", "Tilapia", "Catfish"], 10],
    ["Citarum River", "river", "Indonesia", "West Java", -6.72, 107.30, -6.90, 107.55, ["Common Carp", "Snakehead", "Catfish"], 8],
    ["Mahakam River", "river", "Indonesia", "East Kalimantan", -0.50, 117.15, -0.30, 116.85, ["Giant Gourami", "Arowana", "Catfish"], 10],
    ["Kapuas River", "river", "Indonesia", "West Kalimantan", -0.03, 109.33, 0.15, 109.60, ["Arowana", "Giant Gourami", "Snakehead"], 10],
    ["Jatiluhur Reservoir", "reservoir", "Indonesia", "West Java", -6.52, 107.35, -6.55, 107.40, ["Common Carp", "Tilapia", "Catfish"], 5],
    ["Lake Maninjau", "lake", "Indonesia", "West Sumatra", -0.32, 100.18, -0.35, 100.20, ["Common Carp", "Tilapia"], 4],
    ["Lake Sentani", "lake", "Indonesia", "Papua", -2.60, 140.50, -2.62, 140.55, ["Rainbow Fish", "Catfish", "Tilapia"], 4],
    ["Brantas River", "river", "Indonesia", "East Java", -7.60, 112.00, -7.75, 112.75, ["Common Carp", "Catfish", "Snakehead"], 8],
    ["Barito River", "river", "Indonesia", "South Kalimantan", -3.30, 114.60, -2.90, 115.00, ["Arowana", "Snakehead", "Giant Gourami"], 8],
    ["Solo River", "river", "Indonesia", "Central Java", -7.25, 110.40, -7.50, 111.40, ["Common Carp", "Catfish", "Snakehead"], 8],

    // PHILIPPINES
    ["Laguna de Bay", "lake", "Philippines", "Laguna", 14.38, 121.18, 14.28, 121.30, ["Tilapia", "Catfish", "Snakehead"], 10],
    ["Taal Lake", "lake", "Philippines", "Batangas", 14.00, 120.98, 14.02, 121.00, ["Tilapia", "Catfish", "Largemouth Bass"], 5],
    ["Cagayan River", "river", "Philippines", "Cagayan Valley", 18.20, 121.75, 17.60, 121.70, ["Ludong", "Catfish", "Tilapia"], 8],
    ["Angat Dam", "reservoir", "Philippines", "Bulacan", 14.92, 121.17, 14.95, 121.20, ["Tilapia", "Common Carp", "Catfish"], 4],
    ["Lake Sebu", "lake", "Philippines", "South Cotabato", 6.20, 124.70, 6.22, 124.72, ["Tilapia", "Carp", "Catfish"], 4],
    ["Pantabangan Dam", "reservoir", "Philippines", "Nueva Ecija", 15.82, 121.15, 15.85, 121.18, ["Tilapia", "Catfish", "Common Carp"], 4],
    ["Lake Lanao", "lake", "Philippines", "Lanao del Sur", 7.88, 124.05, 7.92, 124.10, ["Tilapia", "Carp"], 4],

    // MALAYSIA
    ["Temenggor Lake", "lake", "Malaysia", "Perak", 5.45, 101.30, 5.50, 101.38, ["Kelah", "Sebarau", "Toman"], 6],
    ["Kenyir Lake", "lake", "Malaysia", "Terengganu", 5.00, 102.68, 5.10, 102.78, ["Kelah", "Toman", "Lampam"], 8],
    ["Belum Rainforest Lake", "lake", "Malaysia", "Perak", 5.55, 101.32, 5.60, 101.40, ["Kelah", "Sebarau", "Toman"], 6],
    ["Kinabatangan River", "river", "Malaysia", "Sabah", 5.50, 118.00, 5.52, 118.30, ["Catfish", "Barramundi", "Mahseer"], 8],
    ["Perak River", "river", "Malaysia", "Perak", 4.85, 100.73, 4.50, 100.90, ["Kelah", "Catfish", "Toman"], 8],
    ["Pahang River", "river", "Malaysia", "Pahang", 3.90, 102.20, 3.55, 103.20, ["Toman", "Catfish", "Kelah"], 10],
    ["Chenderoh Dam", "reservoir", "Malaysia", "Perak", 4.96, 100.90, 4.99, 100.93, ["Kelah", "Lampam", "Catfish"], 4],

    // MYANMAR
    ["Irrawaddy River (Mandalay)", "river", "Myanmar", "Mandalay", 21.97, 96.08, 21.50, 95.95, ["Giant Catfish", "Rohu", "Mahseer"], 10],
    ["Inle Lake", "lake", "Myanmar", "Shan State", 20.53, 96.90, 20.58, 96.93, ["Inle Carp", "Catfish", "Snakehead"], 6],
    ["Chindwin River", "river", "Myanmar", "Sagaing", 22.10, 95.02, 21.60, 95.20, ["Mahseer", "Catfish", "Rohu"], 8],
    ["Salween River", "river", "Myanmar", "Shan State", 20.50, 97.60, 19.80, 97.55, ["Mahseer", "Catfish", "Giant Barb"], 8],

    // CAMBODIA
    ["Tonle Sap Lake", "lake", "Cambodia", "Siem Reap", 13.10, 103.80, 12.80, 104.20, ["Giant Barb", "Snakehead", "Catfish"], 12],
    ["Mekong River (Phnom Penh)", "river", "Cambodia", "Phnom Penh", 11.58, 104.92, 11.50, 104.95, ["Mekong Giant Catfish", "Pangasius", "Giant Barb"], 6],
    ["Mekong River (Kratie)", "river", "Cambodia", "Kratie", 12.48, 106.02, 12.30, 106.00, ["Irrawaddy Dolphin Area - Giant Catfish", "Pangasius"], 6],

    // LAOS
    ["Nam Ngum Reservoir", "reservoir", "Laos", "Vientiane", 18.55, 102.55, 18.65, 102.65, ["Giant Catfish", "Snakehead", "Tilapia"], 6],
    ["Mekong River (Luang Prabang)", "river", "Laos", "Luang Prabang", 19.88, 102.13, 19.75, 102.20, ["Giant Catfish", "Mahseer", "Snakehead"], 6],
    ["Nam Ou River", "river", "Laos", "Phongsali", 21.00, 102.10, 20.50, 102.20, ["Mahseer", "Catfish", "Barb"], 6],

    // TAIWAN
    ["Sun Moon Lake", "lake", "Taiwan", "Nantou", 23.85, 120.91, 23.86, 120.92, ["Largemouth Bass", "Common Carp", "Tilapia"], 4],
    ["Shihmen Reservoir", "reservoir", "Taiwan", "Taoyuan", 24.82, 121.24, 24.85, 121.27, ["Largemouth Bass", "Common Carp", "Catfish"], 4],
    ["Tsengwen Reservoir", "reservoir", "Taiwan", "Tainan", 23.25, 120.52, 23.28, 120.55, ["Tilapia", "Common Carp", "Catfish"], 4],
    ["Zhuoshui River", "river", "Taiwan", "Changhua", 23.85, 120.50, 23.90, 120.70, ["Formosan Landlocked Salmon", "Common Carp"], 5],

    // COASTAL SPOTS
    ["Phuket Coast", "coastal", "Thailand", "Phuket", 7.88, 98.30, 7.82, 98.35, ["Giant Trevally", "Barracuda", "Grouper", "Sailfish"], 8],
    ["Koh Samui Coast", "coastal", "Thailand", "Surat Thani", 9.52, 100.05, 9.48, 100.08, ["Barracuda", "Grouper", "Red Snapper"], 5],
    ["Krabi Coast", "coastal", "Thailand", "Krabi", 8.05, 98.90, 8.00, 98.95, ["Giant Trevally", "Grouper", "Barracuda"], 5],
    ["Bali Coast", "coastal", "Indonesia", "Bali", -8.25, 115.20, -8.30, 115.50, ["Giant Trevally", "Mahi-Mahi", "Wahoo", "Tuna"], 8],
    ["Komodo Coast", "coastal", "Indonesia", "East Nusa Tenggara", -8.55, 119.45, -8.52, 119.50, ["Giant Trevally", "Tuna", "Dogtooth Tuna"], 5],
    ["Palawan Coast", "coastal", "Philippines", "Palawan", 10.20, 118.70, 9.80, 118.90, ["Giant Trevally", "Tuna", "Mahi-Mahi"], 8],
    ["Siargao Coast", "coastal", "Philippines", "Surigao del Norte", 9.85, 126.10, 9.88, 126.15, ["Tuna", "Wahoo", "Mahi-Mahi"], 5],
    ["Langkawi Coast", "coastal", "Malaysia", "Kedah", 6.35, 99.68, 6.40, 99.75, ["Barracuda", "Grouper", "Giant Trevally"], 5],
    ["Kuala Rompin", "coastal", "Malaysia", "Pahang", 2.78, 103.50, 2.75, 103.55, ["Sailfish", "Mahi-Mahi", "Tuna"], 5],
    ["Ha Long Bay", "coastal", "Vietnam", "Quang Ninh", 20.90, 107.05, 20.85, 107.10, ["Grouper", "Snapper", "Barracuda"], 5],
    ["Phu Quoc Coast", "coastal", "Vietnam", "Kien Giang", 10.22, 103.95, 10.18, 104.00, ["Barracuda", "Grouper", "Trevally"], 5],
    ["Ngapali Beach", "coastal", "Myanmar", "Rakhine", 18.40, 94.30, 18.35, 94.32, ["Barracuda", "Grouper", "Red Snapper"], 4],
  ];

  const rows = expand(defs);
  const BATCH = 500;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from("fishing_locations").insert(batch);
    if (error) {
      console.error("Insert error:", error.message);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    inserted += batch.length;
  }

  return new Response(JSON.stringify({ success: true, inserted }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
