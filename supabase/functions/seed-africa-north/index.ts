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
    // EGYPT
    ["Nile River (Cairo)", "river", "Egypt", "Cairo", 30.05, 31.23, 29.90, 31.25, ["Nile Perch", "Tilapia", "Catfish"], 10],
    ["Nile River (Aswan)", "river", "Egypt", "Aswan", 24.10, 32.88, 23.95, 32.90, ["Nile Perch", "Tigerfish", "Catfish"], 8],
    ["Nile River (Luxor)", "river", "Egypt", "Luxor", 25.70, 32.64, 25.60, 32.66, ["Nile Perch", "Tilapia", "Catfish"], 6],
    ["Lake Nasser", "reservoir", "Egypt", "Aswan", 23.00, 32.80, 22.50, 32.50, ["Nile Perch", "Tigerfish", "Vundu Catfish"], 15],
    ["Nile Delta", "river", "Egypt", "Dakahlia", 31.05, 31.38, 31.15, 31.80, ["Tilapia", "Mullet", "Catfish"], 10],
    ["Lake Qarun", "lake", "Egypt", "Faiyum", 29.47, 30.55, 29.48, 30.70, ["Tilapia", "Mullet"], 6],
    ["Red Sea (Hurghada)", "coastal", "Egypt", "Red Sea", 27.18, 33.85, 27.10, 33.88, ["Barracuda", "Giant Trevally", "Grouper", "Tuna"], 8],
    ["Mediterranean (Alexandria)", "coastal", "Egypt", "Alexandria", 31.22, 29.92, 31.20, 29.98, ["Sea Bass", "Bream", "Mullet"], 6],

    // MOROCCO
    ["Bin el Ouidane Dam", "reservoir", "Morocco", "Beni Mellal-Khénifra", 32.10, -6.47, 32.12, -6.43, ["Common Carp", "Pike", "Black Bass", "Trout"], 6],
    ["Oum Er-Rbia River", "river", "Morocco", "Beni Mellal-Khénifra", 33.10, -6.58, 32.50, -6.80, ["Trout", "Barbel", "Carp"], 10],
    ["Al Massira Dam", "reservoir", "Morocco", "Settat", 32.43, -7.58, 32.48, -7.50, ["Black Bass", "Pike", "Common Carp"], 6],
    ["Moulouya River", "river", "Morocco", "Oriental", 35.08, -2.33, 34.50, -2.90, ["Barbel", "Trout", "Catfish"], 8],
    ["Sidi Ali Lake", "lake", "Morocco", "Ifrane", 33.07, -5.00, 33.08, -4.98, ["Rainbow Trout", "Brown Trout", "Pike"], 4],
    ["Atlantic Coast (Dakhla)", "coastal", "Morocco", "Dakhla-Oued Ed-Dahab", 23.70, -15.95, 23.65, -15.90, ["Corvina", "Barracuda", "Grouper"], 6],
    ["Atlantic Coast (Essaouira)", "coastal", "Morocco", "Marrakech-Safi", 31.50, -9.77, 31.48, -9.75, ["Sea Bass", "Bream", "Corvina"], 5],

    // TUNISIA
    ["Sidi Salem Dam", "reservoir", "Tunisia", "Jendouba", 36.58, 9.07, 36.62, 9.12, ["Common Carp", "Catfish", "Mullet"], 5],
    ["Ichkeul Lake", "lake", "Tunisia", "Bizerte", 37.15, 9.65, 37.17, 9.68, ["Mullet", "Eel", "Carp"], 4],
    ["Mediterranean Coast (Tabarka)", "coastal", "Tunisia", "Jendouba", 36.95, 8.75, 36.93, 8.78, ["Grouper", "Dentex", "Sea Bream"], 5],

    // ALGERIA
    ["Beni Haroun Dam", "reservoir", "Algeria", "Mila", 36.53, 6.27, 36.56, 6.30, ["Common Carp", "Barbel", "Catfish"], 5],
    ["Keddara Dam", "reservoir", "Algeria", "Boumerdès", 36.63, 3.40, 36.65, 3.42, ["Common Carp", "Black Bass", "Catfish"], 4],
    ["Mediterranean Coast (Annaba)", "coastal", "Algeria", "Annaba", 36.92, 7.75, 36.90, 7.80, ["Grouper", "Sea Bass", "Bream"], 5],

    // ETHIOPIA
    ["Lake Tana", "lake", "Ethiopia", "Amhara", 12.00, 37.25, 11.70, 37.40, ["Nile Perch", "Barbus", "Catfish", "Tilapia"], 12],
    ["Blue Nile (Bahir Dar)", "river", "Ethiopia", "Amhara", 11.60, 37.38, 11.40, 37.50, ["Catfish", "Barbus", "Tilapia"], 6],
    ["Lake Ziway", "lake", "Ethiopia", "Oromia", 7.95, 38.72, 7.85, 38.82, ["Tilapia", "Catfish", "Barbus"], 6],
    ["Lake Awasa", "lake", "Ethiopia", "Sidama", 7.05, 38.42, 7.00, 38.48, ["Tilapia", "Catfish", "Barbus"], 5],
    ["Omo River", "river", "Ethiopia", "SNNPR", 5.90, 35.95, 5.40, 36.10, ["Nile Perch", "Catfish", "Tilapia"], 8],
    ["Lake Chamo", "lake", "Ethiopia", "SNNPR", 5.85, 37.55, 5.75, 37.65, ["Nile Perch", "Catfish", "Tilapia"], 6],

    // CONGO / DRC
    ["Congo River (Kinshasa)", "river", "DR Congo", "Kinshasa", -4.32, 15.28, -4.35, 15.35, ["Goliath Tigerfish", "Vundu Catfish", "Nile Perch"], 8],
    ["Congo River (Kisangani)", "river", "DR Congo", "Tshopo", 0.52, 25.20, 0.45, 25.25, ["Goliath Tigerfish", "Giant Catfish", "Tilapia"], 6],
    ["Lake Kivu", "lake", "DR Congo", "South Kivu", -2.10, 29.00, -2.30, 29.15, ["Tilapia", "Catfish", "Haplochromis"], 8],

    // NIGERIA
    ["Kainji Lake", "reservoir", "Nigeria", "Niger State", 9.85, 4.55, 10.00, 4.65, ["Nile Perch", "Catfish", "Tilapia"], 8],
    ["Niger River (Lokoja)", "river", "Nigeria", "Kogi", 7.80, 6.73, 7.75, 6.78, ["Catfish", "Tilapia", "Nile Perch"], 6],
    ["Lagos Lagoon", "coastal", "Nigeria", "Lagos", 6.45, 3.40, 6.48, 3.50, ["Tilapia", "Catfish", "Barracuda"], 6],
    ["Cross River", "river", "Nigeria", "Cross River", 5.95, 8.32, 5.80, 8.35, ["Catfish", "Tilapia", "Perch"], 6],
    ["Jebba Lake", "reservoir", "Nigeria", "Kwara", 9.10, 4.80, 9.15, 4.85, ["Nile Perch", "Catfish", "Tilapia"], 5],

    // GHANA
    ["Lake Volta", "reservoir", "Ghana", "Eastern Region", 6.30, -0.05, 7.00, 0.10, ["Nile Perch", "Tilapia", "Catfish"], 12],
    ["Ada Foah (Volta Estuary)", "coastal", "Ghana", "Greater Accra", 5.78, 0.63, 5.75, 0.65, ["Barracuda", "Tarpon", "Jack Crevalle"], 5],

    // CAMEROON
    ["Sanaga River", "river", "Cameroon", "Centre", 3.98, 10.00, 4.10, 10.20, ["Goliath Tigerfish", "Catfish", "Tilapia"], 6],
    ["Lake Nyos", "lake", "Cameroon", "Northwest", 6.43, 10.30, 6.44, 10.31, ["Tilapia", "Catfish"], 3],

    // SENEGAL
    ["Senegal River", "river", "Senegal", "Saint-Louis", 16.03, -16.48, 15.80, -16.00, ["Nile Perch", "Catfish", "Tilapia"], 8],
    ["Casamance River", "river", "Senegal", "Ziguinchor", 12.58, -16.27, 12.55, -16.20, ["Barracuda", "Tarpon", "Catfish"], 6],

    // ANGOLA
    ["Kwanza River", "river", "Angola", "Cuanza Sul", -9.32, 13.82, -9.50, 14.50, ["Tigerfish", "Catfish", "Tilapia"], 8],
    ["Atlantic Coast (Luanda)", "coastal", "Angola", "Luanda", -8.82, 13.22, -8.88, 13.25, ["Tarpon", "Barracuda", "Giant African Threadfin"], 5],
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
