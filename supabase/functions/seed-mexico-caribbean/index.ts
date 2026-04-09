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
    // MEXICO - Pacific Coast
    ["Los Cabos", "coastal", "Mexico", "Baja California Sur", 22.88, -109.92, 22.82, -109.88, ["Marlin", "Dorado", "Roosterfish", "Yellowfin Tuna", "Wahoo"], 10],
    ["Puerto Vallarta Coast", "coastal", "Mexico", "Jalisco", 20.65, -105.25, 20.58, -105.22, ["Sailfish", "Mahi-Mahi", "Roosterfish", "Red Snapper"], 8],
    ["Mazatlán Coast", "coastal", "Mexico", "Sinaloa", 23.22, -106.42, 23.18, -106.38, ["Marlin", "Sailfish", "Dorado", "Yellowfin Tuna"], 8],
    ["Zihuatanejo Coast", "coastal", "Mexico", "Guerrero", 17.64, -101.55, 17.60, -101.52, ["Sailfish", "Roosterfish", "Jack Crevalle"], 6],
    ["Sea of Cortez (La Paz)", "coastal", "Mexico", "Baja California Sur", 24.15, -110.30, 24.10, -110.25, ["Dorado", "Roosterfish", "Yellowtail", "Grouper"], 8],
    ["Sea of Cortez (Loreto)", "coastal", "Mexico", "Baja California Sur", 26.02, -111.35, 25.98, -111.30, ["Yellowtail", "Dorado", "Grouper", "Cabrilla"], 6],
    ["Magdalena Bay", "coastal", "Mexico", "Baja California Sur", 24.60, -112.10, 24.55, -112.05, ["Marlin", "Wahoo", "Yellowfin Tuna"], 5],

    // MEXICO - Gulf Coast
    ["Cancún Coast", "coastal", "Mexico", "Quintana Roo", 21.15, -86.77, 21.10, -86.74, ["Sailfish", "Wahoo", "Barracuda", "Mahi-Mahi"], 8],
    ["Cozumel", "coastal", "Mexico", "Quintana Roo", 20.43, -86.92, 20.38, -86.88, ["Sailfish", "Marlin", "Wahoo", "Barracuda"], 6],
    ["Isla Mujeres", "coastal", "Mexico", "Quintana Roo", 21.25, -86.73, 21.22, -86.72, ["Sailfish", "Wahoo", "Mahi-Mahi"], 5],
    ["Veracruz Coast", "coastal", "Mexico", "Veracruz", 19.18, -96.13, 19.15, -96.10, ["Red Snapper", "Grouper", "Tarpon", "Snook"], 6],
    ["Tampico Coast", "coastal", "Mexico", "Tamaulipas", 22.25, -97.85, 22.22, -97.82, ["Tarpon", "Snook", "Red Drum", "Snapper"], 5],
    ["Ascension Bay (Sian Ka'an)", "coastal", "Mexico", "Quintana Roo", 19.60, -87.45, 19.55, -87.40, ["Bonefish", "Permit", "Tarpon", "Snook"], 8],
    ["Holbox Island", "coastal", "Mexico", "Quintana Roo", 21.52, -87.38, 21.50, -87.35, ["Tarpon", "Bonefish", "Permit", "Barracuda"], 5],

    // MEXICO - Freshwater
    ["Lake El Salto", "reservoir", "Mexico", "Sinaloa", 23.77, -105.95, 23.80, -105.90, ["Largemouth Bass", "Tilapia"], 6],
    ["Lake Baccarac", "reservoir", "Mexico", "Sinaloa", 25.80, -108.50, 25.83, -108.45, ["Largemouth Bass", "Tilapia"], 5],
    ["Lake Comedero", "reservoir", "Mexico", "Sinaloa", 24.10, -106.15, 24.13, -106.10, ["Largemouth Bass", "Tilapia", "Catfish"], 5],
    ["Lake Guerrero", "reservoir", "Mexico", "Tamaulipas", 24.95, -99.15, 24.98, -99.10, ["Largemouth Bass", "Channel Catfish"], 5],
    ["Lake Falcon", "reservoir", "Mexico", "Tamaulipas", 26.55, -99.20, 26.58, -99.15, ["Largemouth Bass", "Catfish", "Striped Bass"], 5],
    ["Usumacinta River", "river", "Mexico", "Tabasco", 17.82, -91.50, 17.60, -91.30, ["Snook", "Tarpon", "Catfish", "Cichlid"], 8],
    ["Grijalva River", "river", "Mexico", "Chiapas", 16.75, -93.10, 16.90, -93.30, ["Catfish", "Snook", "Cichlid"], 6],

    // COSTA RICA
    ["Quepos / Manuel Antonio", "coastal", "Costa Rica", "Puntarenas", 9.43, -84.17, 9.40, -84.15, ["Sailfish", "Marlin", "Roosterfish", "Mahi-Mahi"], 6],
    ["Drake Bay", "coastal", "Costa Rica", "Puntarenas", 8.70, -83.67, 8.68, -83.65, ["Sailfish", "Marlin", "Yellowfin Tuna", "Roosterfish"], 5],
    ["Golfo Dulce", "coastal", "Costa Rica", "Puntarenas", 8.63, -83.35, 8.58, -83.30, ["Roosterfish", "Snapper", "Snook", "Jack Crevalle"], 5],
    ["Caribbean Coast (Tortuguero)", "coastal", "Costa Rica", "Limón", 10.55, -83.50, 10.50, -83.48, ["Tarpon", "Snook", "Jack Crevalle"], 5],
    ["Lake Arenal", "lake", "Costa Rica", "Guanacaste", 10.50, -84.88, 10.53, -84.82, ["Rainbow Bass (Guapote)", "Machaca"], 4],

    // PANAMA
    ["Gatun Lake", "lake", "Panama", "Colón", 9.18, -79.88, 9.22, -79.82, ["Peacock Bass", "Tarpon", "Snook"], 6],
    ["Piñas Bay", "coastal", "Panama", "Darién", 7.55, -78.18, 7.52, -78.15, ["Black Marlin", "Sailfish", "Yellowfin Tuna", "Roosterfish"], 5],
    ["Pearl Islands", "coastal", "Panama", "Panamá", 8.35, -79.05, 8.30, -79.00, ["Yellowfin Tuna", "Wahoo", "Mahi-Mahi", "Roosterfish"], 5],
    ["Bocas del Toro", "coastal", "Panama", "Bocas del Toro", 9.35, -82.25, 9.32, -82.22, ["Tarpon", "Snook", "Barracuda", "Jack Crevalle"], 5],

    // CUBA
    ["Jardines de la Reina", "coastal", "Cuba", "Camagüey", 21.60, -79.00, 21.55, -78.80, ["Bonefish", "Permit", "Tarpon", "Snook", "Barracuda"], 8],
    ["Isle of Youth", "coastal", "Cuba", "Isla de la Juventud", 21.70, -82.85, 21.65, -82.80, ["Bonefish", "Permit", "Tarpon"], 5],
    ["Cayo Largo", "coastal", "Cuba", "Isla de la Juventud", 21.62, -81.55, 21.60, -81.50, ["Bonefish", "Tarpon", "Barracuda"], 4],
    ["Zapata Swamp", "lake", "Cuba", "Matanzas", 22.33, -81.20, 22.28, -81.15, ["Tarpon", "Snook", "Largemouth Bass"], 5],

    // DOMINICAN REPUBLIC
    ["Punta Cana Coast", "coastal", "Dominican Republic", "La Altagracia", 18.50, -68.38, 18.48, -68.35, ["Blue Marlin", "Sailfish", "Mahi-Mahi", "Wahoo"], 6],
    ["Samaná Bay", "coastal", "Dominican Republic", "Samaná", 19.20, -69.32, 19.18, -69.28, ["Marlin", "Mahi-Mahi", "Wahoo"], 5],

    // BELIZE
    ["Ambergris Caye", "coastal", "Belize", "Belize", 18.00, -87.95, 17.95, -87.92, ["Bonefish", "Permit", "Tarpon", "Barracuda"], 6],
    ["Turneffe Atoll", "coastal", "Belize", "Belize", 17.35, -87.85, 17.30, -87.82, ["Bonefish", "Permit", "Tarpon", "Snapper"], 5],
    ["Placencia", "coastal", "Belize", "Stann Creek", 16.52, -88.37, 16.48, -88.35, ["Permit", "Tarpon", "Snook", "Bonefish"], 5],

    // BAHAMAS
    ["Andros Island", "coastal", "Bahamas", "Andros", 24.70, -78.05, 24.65, -78.00, ["Bonefish", "Permit", "Tarpon", "Barracuda"], 6],
    ["Bimini", "coastal", "Bahamas", "Bimini", 25.73, -79.27, 25.70, -79.25, ["Blue Marlin", "Wahoo", "Mahi-Mahi", "Tuna"], 5],
    ["Exuma Cays", "coastal", "Bahamas", "Exuma", 24.15, -76.50, 24.10, -76.45, ["Bonefish", "Permit", "Grouper", "Snapper"], 5],

    // GUATEMALA
    ["Pacific Coast (Puerto Quetzal)", "coastal", "Guatemala", "Escuintla", 13.92, -90.78, 13.88, -90.75, ["Sailfish", "Marlin", "Mahi-Mahi", "Roosterfish"], 5],
    ["Lake Atitlán", "lake", "Guatemala", "Sololá", 14.68, -91.20, 14.65, -91.15, ["Largemouth Bass", "Cichlid"], 4],
    ["Río Dulce", "river", "Guatemala", "Izabal", 15.65, -88.98, 15.60, -88.95, ["Tarpon", "Snook", "Snapper"], 4],

    // HONDURAS
    ["Roatán Island", "coastal", "Honduras", "Bay Islands", 16.35, -86.52, 16.32, -86.48, ["Mahi-Mahi", "Wahoo", "Barracuda", "Grouper"], 5],
    ["Guanaja Island", "coastal", "Honduras", "Bay Islands", 16.47, -85.90, 16.45, -85.87, ["Wahoo", "Mahi-Mahi", "Tuna", "Barracuda"], 4],
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
