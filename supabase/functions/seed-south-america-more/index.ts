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
    // ARGENTINA
    ["Paraná River (Rosario)", "river", "Argentina", "Santa Fe", -32.95, -60.65, -33.10, -60.60, ["Dorado", "Surubí", "Pacú", "Sábalo"], 12],
    ["Paraná River (Corrientes)", "river", "Argentina", "Corrientes", -27.47, -58.83, -27.55, -58.78, ["Dorado", "Surubí", "Pacú"], 10],
    ["Río de la Plata", "river", "Argentina", "Buenos Aires", -34.60, -58.40, -34.70, -57.50, ["Dorado", "Pejerrey", "Corvina"], 15],
    ["Limay River", "river", "Argentina", "Neuquén", -38.95, -68.10, -39.20, -68.30, ["Rainbow Trout", "Brown Trout", "Brook Trout"], 10],
    ["Lake Nahuel Huapi", "lake", "Argentina", "Río Negro", -41.05, -71.50, -41.15, -71.30, ["Brown Trout", "Rainbow Trout", "Lake Trout"], 10],
    ["Lake Traful", "lake", "Argentina", "Neuquén", -40.65, -71.35, -40.68, -71.28, ["Brown Trout", "Rainbow Trout", "Brook Trout"], 6],
    ["Chimehuin River", "river", "Argentina", "Neuquén", -39.90, -71.10, -40.10, -71.15, ["Brown Trout", "Rainbow Trout"], 8],
    ["Malleo River", "river", "Argentina", "Neuquén", -39.60, -71.15, -39.70, -71.20, ["Brown Trout", "Rainbow Trout"], 6],
    ["Collón Curá River", "river", "Argentina", "Neuquén", -39.90, -70.60, -40.05, -70.50, ["Brown Trout", "Rainbow Trout"], 6],
    ["Lago Strobel", "lake", "Argentina", "Santa Cruz", -48.60, -71.10, -48.65, -71.00, ["Rainbow Trout", "Brook Trout"], 5],
    ["Río Grande (Tierra del Fuego)", "river", "Argentina", "Tierra del Fuego", -53.80, -68.50, -53.70, -68.20, ["Sea-Run Brown Trout", "Brown Trout"], 8],
    ["Iberá Wetlands", "lake", "Argentina", "Corrientes", -28.50, -57.20, -28.60, -57.00, ["Dorado", "Surubí", "Pacú", "Piranha"], 8],

    // CHILE
    ["Futaleufú River", "river", "Chile", "Los Lagos", -43.18, -71.86, -43.25, -71.80, ["Rainbow Trout", "Brown Trout", "King Salmon"], 8],
    ["Baker River", "river", "Chile", "Aysén", -47.18, -72.10, -47.80, -73.10, ["Rainbow Trout", "Brown Trout", "Chinook Salmon"], 10],
    ["Lake Llanquihue", "lake", "Chile", "Los Lagos", -41.10, -72.75, -41.20, -72.65, ["Rainbow Trout", "Brown Trout"], 6],
    ["Lake Villarrica", "lake", "Chile", "Araucanía", -39.25, -72.10, -39.30, -72.00, ["Rainbow Trout", "Brown Trout"], 6],
    ["Petrohué River", "river", "Chile", "Los Lagos", -41.12, -72.28, -41.20, -72.20, ["Rainbow Trout", "Brown Trout", "King Salmon"], 6],
    ["Simpson River", "river", "Chile", "Aysén", -45.60, -72.10, -45.70, -72.15, ["Rainbow Trout", "Brown Trout"], 5],
    ["Palena River", "river", "Chile", "Los Lagos", -43.60, -72.10, -43.80, -72.40, ["Rainbow Trout", "Brown Trout", "Chinook Salmon"], 6],
    ["Aysén Fjords Coast", "coastal", "Chile", "Aysén", -45.40, -73.10, -45.50, -73.20, ["Chinook Salmon", "Robalo", "Congrio"], 5],

    // PERU
    ["Amazon River (Iquitos)", "river", "Peru", "Loreto", -3.75, -73.25, -3.80, -73.15, ["Arapaima", "Peacock Bass", "Piranha", "Catfish"], 10],
    ["Ucayali River", "river", "Peru", "Ucayali", -8.38, -74.53, -8.50, -74.45, ["Arapaima", "Dorado", "Catfish"], 8],
    ["Marañón River", "river", "Peru", "Loreto", -4.45, -77.50, -4.60, -77.20, ["Arapaima", "Peacock Bass", "Piranha"], 8],
    ["Lake Titicaca", "lake", "Peru", "Puno", -15.80, -69.95, -15.90, -69.80, ["Trout", "Ispi", "Carachi"], 8],
    ["Mantaro River", "river", "Peru", "Junín", -12.50, -75.20, -12.00, -75.10, ["Rainbow Trout", "Brown Trout"], 6],

    // COLOMBIA
    ["Amazon River (Leticia)", "river", "Colombia", "Amazonas", -4.20, -69.93, -4.25, -69.85, ["Arapaima", "Peacock Bass", "Piranha", "Catfish"], 8],
    ["Magdalena River", "river", "Colombia", "Santander", 7.10, -73.13, 6.50, -73.70, ["Bocachico", "Catfish", "Dorado"], 12],
    ["Cauca River", "river", "Colombia", "Valle del Cauca", 3.45, -76.52, 3.20, -76.50, ["Catfish", "Bocachico", "Tilapia"], 8],
    ["Lake Calima", "reservoir", "Colombia", "Valle del Cauca", 3.93, -76.52, 3.95, -76.48, ["Rainbow Trout", "Largemouth Bass"], 4],
    ["San Andrés Island", "coastal", "Colombia", "San Andrés", 12.55, -81.70, 12.53, -81.68, ["Marlin", "Wahoo", "Mahi-Mahi", "Tuna"], 5],
    ["Pacific Coast (Bahía Solano)", "coastal", "Colombia", "Chocó", 6.22, -77.40, 6.18, -77.38, ["Marlin", "Sailfish", "Roosterfish", "Snapper"], 5],

    // VENEZUELA
    ["Orinoco River", "river", "Venezuela", "Bolívar", 8.35, -62.65, 8.20, -62.50, ["Peacock Bass", "Payara", "Piranha", "Catfish"], 12],
    ["Caura River", "river", "Venezuela", "Bolívar", 7.10, -64.90, 6.80, -64.70, ["Peacock Bass", "Payara", "Piranha"], 8],
    ["Guri Reservoir", "reservoir", "Venezuela", "Bolívar", 7.75, -62.98, 7.65, -62.85, ["Peacock Bass", "Payara", "Catfish"], 8],
    ["Los Roques", "coastal", "Venezuela", "Dependencias Federales", 11.85, -66.75, 11.80, -66.65, ["Bonefish", "Permit", "Tarpon", "Barracuda"], 6],

    // ECUADOR
    ["Galápagos Coast", "coastal", "Ecuador", "Galápagos", -0.95, -89.62, -0.98, -89.58, ["Yellowfin Tuna", "Wahoo", "Mahi-Mahi", "Marlin"], 6],
    ["Napo River", "river", "Ecuador", "Napo", -0.47, -76.98, -0.50, -76.80, ["Arapaima", "Peacock Bass", "Catfish"], 6],
    ["Pacific Coast (Manta)", "coastal", "Ecuador", "Manabí", -0.95, -80.73, -0.98, -80.70, ["Marlin", "Sailfish", "Tuna", "Dorado"], 5],

    // URUGUAY
    ["Río Negro (Uruguay)", "river", "Uruguay", "Durazno", -32.80, -56.50, -33.00, -56.30, ["Dorado", "Surubí", "Tararira"], 8],
    ["Rincón del Bonete Dam", "reservoir", "Uruguay", "Durazno", -32.80, -56.35, -32.85, -56.25, ["Dorado", "Tararira", "Catfish"], 5],
    ["Uruguay River", "river", "Uruguay", "Paysandú", -32.32, -58.07, -32.50, -58.00, ["Dorado", "Surubí", "Sábalo"], 8],

    // PARAGUAY
    ["Paraguay River (Asunción)", "river", "Paraguay", "Central", -25.28, -57.63, -25.35, -57.58, ["Dorado", "Surubí", "Pacú"], 8],
    ["Pilcomayo River", "river", "Paraguay", "Boquerón", -22.35, -59.95, -22.50, -60.05, ["Dorado", "Catfish", "Pacú"], 6],

    // GUYANA / SURINAME
    ["Essequibo River", "river", "Guyana", "Essequibo", 4.80, -58.70, 4.50, -58.50, ["Arapaima", "Peacock Bass", "Piranha", "Lukanani"], 8],
    ["Rupununi River", "river", "Guyana", "Upper Takutu", 3.80, -59.30, 3.50, -59.20, ["Arapaima", "Peacock Bass", "Piranha"], 6],
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
