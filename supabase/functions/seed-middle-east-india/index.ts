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
    // IRAN
    ["Caspian Sea (Anzali)", "coastal", "Iran", "Gilan", 37.47, 49.47, 37.45, 49.50, ["Sturgeon", "Kutum", "Pike", "Common Carp"], 8],
    ["Caspian Sea (Ramsar)", "coastal", "Iran", "Mazandaran", 36.90, 50.67, 36.88, 50.70, ["Sturgeon", "Kutum", "Sea Trout"], 5],
    ["Zayandeh River", "river", "Iran", "Isfahan", 32.65, 51.65, 32.60, 51.70, ["Common Carp", "Barbel", "Catfish"], 5],
    ["Karun River", "river", "Iran", "Khuzestan", 31.32, 48.68, 31.20, 48.75, ["Common Carp", "Catfish", "Barbel"], 6],
    ["Lar Dam", "reservoir", "Iran", "Tehran", 35.88, 52.00, 35.90, 52.03, ["Rainbow Trout", "Brown Trout"], 4],
    ["Persian Gulf (Kish Island)", "coastal", "Iran", "Hormozgan", 26.53, 54.00, 26.50, 54.03, ["Grouper", "Barracuda", "Queenfish", "King Mackerel"], 5],
    ["Strait of Hormuz", "coastal", "Iran", "Hormozgan", 27.10, 56.25, 27.05, 56.30, ["Kingfish", "Barracuda", "Grouper", "Tuna"], 5],

    // UAE
    ["Dubai Coast", "coastal", "United Arab Emirates", "Dubai", 25.15, 55.12, 25.12, 55.18, ["Kingfish", "Queenfish", "Barracuda", "Grouper"], 6],
    ["Abu Dhabi Coast", "coastal", "United Arab Emirates", "Abu Dhabi", 24.45, 54.38, 24.42, 54.42, ["Kingfish", "Grouper", "Cobia", "Queenfish"], 6],
    ["Fujairah Coast", "coastal", "United Arab Emirates", "Fujairah", 25.13, 56.35, 25.10, 56.38, ["Kingfish", "Tuna", "Sailfish", "Barracuda"], 5],

    // OMAN
    ["Musandam Peninsula", "coastal", "Oman", "Musandam", 26.20, 56.25, 26.15, 56.28, ["Kingfish", "Tuna", "Barracuda", "Grouper"], 6],
    ["Muscat Coast", "coastal", "Oman", "Muscat", 23.60, 58.60, 23.57, 58.65, ["Kingfish", "Sailfish", "Yellowfin Tuna", "Wahoo"], 6],
    ["Dhofar Coast", "coastal", "Oman", "Dhofar", 17.00, 54.10, 16.95, 54.15, ["Sailfish", "Marlin", "Yellowfin Tuna", "Mahi-Mahi"], 5],

    // JORDAN
    ["Dead Sea Area", "lake", "Jordan", "Balqa", 31.75, 35.58, 31.73, 35.60, ["Tilapia"], 2],
    ["Gulf of Aqaba", "coastal", "Jordan", "Aqaba", 29.52, 35.00, 29.48, 35.02, ["Grouper", "Barracuda", "Trevally", "Snapper"], 5],

    // ISRAEL
    ["Sea of Galilee", "lake", "Israel", "Northern District", 32.82, 35.58, 32.78, 35.60, ["St. Peter's Fish (Tilapia)", "Common Carp", "Catfish"], 6],
    ["Mediterranean Coast (Haifa)", "coastal", "Israel", "Haifa", 32.82, 35.00, 32.80, 35.02, ["Grouper", "Sea Bream", "Amberjack"], 5],

    // INDIA (more spots)
    ["Ganges River (Varanasi)", "river", "India", "Uttar Pradesh", 25.32, 83.00, 25.28, 83.05, ["Mahseer", "Rohu", "Catla", "Catfish"], 8],
    ["Ganges River (Rishikesh)", "river", "India", "Uttarakhand", 30.10, 78.28, 30.05, 78.32, ["Golden Mahseer", "Goonch Catfish", "Trout"], 6],
    ["Brahmaputra River", "river", "India", "Assam", 26.18, 91.72, 26.10, 91.80, ["Golden Mahseer", "Giant Catfish", "Rohu"], 8],
    ["Cauvery River", "river", "India", "Karnataka", 12.42, 77.10, 12.30, 77.20, ["Mahseer", "Common Carp", "Catfish"], 8],
    ["Tungabhadra Dam", "reservoir", "India", "Karnataka", 15.27, 76.32, 15.30, 76.38, ["Common Carp", "Rohu", "Catla", "Tilapia"], 6],
    ["Beas River", "river", "India", "Himachal Pradesh", 32.10, 77.15, 31.90, 77.10, ["Brown Trout", "Rainbow Trout", "Mahseer"], 8],
    ["Parvati River", "river", "India", "Himachal Pradesh", 32.05, 77.30, 31.95, 77.25, ["Brown Trout", "Rainbow Trout"], 5],
    ["Tirthan River", "river", "India", "Himachal Pradesh", 31.63, 77.45, 31.58, 77.42, ["Brown Trout", "Rainbow Trout"], 5],
    ["Nagarjuna Sagar Dam", "reservoir", "India", "Telangana", 16.57, 79.30, 16.60, 79.35, ["Common Carp", "Rohu", "Catla", "Catfish"], 6],
    ["Chilika Lake", "lake", "India", "Odisha", 19.70, 85.35, 19.65, 85.45, ["Mullet", "Prawn", "Hilsa", "Sea Bass"], 8],
    ["Andaman Islands Coast", "coastal", "India", "Andaman & Nicobar", 11.68, 92.72, 11.62, 92.75, ["Giant Trevally", "Sailfish", "Mahi-Mahi", "Wahoo", "Dogtooth Tuna"], 8],
    ["Lakshadweep Islands", "coastal", "India", "Lakshadweep", 10.57, 72.63, 10.53, 72.65, ["Yellowfin Tuna", "Giant Trevally", "Wahoo"], 5],
    ["Kerala Backwaters (Alleppey)", "river", "India", "Kerala", 9.50, 76.33, 9.45, 76.38, ["Karimeen", "Catfish", "Mullet", "Tilapia"], 6],
    ["Goa Coast", "coastal", "India", "Goa", 15.50, 73.78, 15.45, 73.80, ["Kingfish", "Barracuda", "Red Snapper", "Sailfish"], 6],

    // SRI LANKA
    ["Bolgoda Lake", "lake", "Sri Lanka", "Western", 6.72, 79.95, 6.70, 79.98, ["Snakehead", "Tilapia", "Catfish"], 4],
    ["Kirindi Oya Reservoir", "reservoir", "Sri Lanka", "Southern", 6.35, 81.15, 6.38, 81.18, ["Barramundi", "Snakehead", "Common Carp"], 4],
    ["Southern Coast (Mirissa)", "coastal", "Sri Lanka", "Southern", 5.95, 80.45, 5.93, 80.48, ["Sailfish", "Marlin", "Yellowfin Tuna", "Mahi-Mahi"], 5],
    ["East Coast (Trincomalee)", "coastal", "Sri Lanka", "Eastern", 8.57, 81.22, 8.53, 81.25, ["Sailfish", "Giant Trevally", "Wahoo", "Tuna"], 5],

    // PAKISTAN
    ["Indus River (Tarbela)", "river", "Pakistan", "KPK", 34.08, 72.70, 33.95, 72.75, ["Mahseer", "Snow Trout", "Catfish"], 6],
    ["Mangla Dam", "reservoir", "Pakistan", "Punjab", 33.15, 73.62, 33.18, 73.68, ["Mahseer", "Common Carp", "Catfish"], 5],
    ["Kunhar River", "river", "Pakistan", "KPK", 34.75, 73.50, 34.60, 73.55, ["Brown Trout", "Rainbow Trout", "Mahseer"], 6],
    ["Swat River", "river", "Pakistan", "KPK", 35.22, 72.35, 35.00, 72.40, ["Brown Trout", "Rainbow Trout", "Mahseer", "Snow Trout"], 6],
    ["Arabian Sea (Karachi)", "coastal", "Pakistan", "Sindh", 24.85, 66.98, 24.80, 67.02, ["Sailfish", "Yellowfin Tuna", "Barracuda", "Kingfish"], 6],

    // NEPAL
    ["Phewa Lake", "lake", "Nepal", "Gandaki", 28.22, 83.95, 28.20, 83.97, ["Common Carp", "Mahseer", "Catfish"], 4],
    ["Kali Gandaki River", "river", "Nepal", "Gandaki", 28.40, 83.60, 28.20, 83.65, ["Golden Mahseer", "Snow Trout", "Catfish"], 6],
    ["Trisuli River", "river", "Nepal", "Bagmati", 27.95, 85.00, 27.80, 85.05, ["Golden Mahseer", "Catfish", "Trout"], 5],

    // BANGLADESH
    ["Padma River", "river", "Bangladesh", "Rajshahi", 24.37, 88.60, 24.30, 88.70, ["Hilsa", "Rohu", "Catla", "Catfish"], 8],
    ["Sundarbans", "river", "Bangladesh", "Khulna", 22.20, 89.30, 21.90, 89.50, ["Barramundi", "Hilsa", "Giant Catfish", "Snapper"], 8],
    ["Kaptai Lake", "reservoir", "Bangladesh", "Chittagong", 22.50, 92.22, 22.55, 92.28, ["Common Carp", "Catfish", "Mahseer"], 5],
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
