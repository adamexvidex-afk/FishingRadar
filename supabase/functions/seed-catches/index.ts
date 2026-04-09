import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const fishHabitat: Record<string, { minW: number; maxW: number; minL: number; maxL: number; categories: string[]; baits: string[]; techniques: string[] }> = {
  "Largemouth Bass": { minW: 0.5, maxW: 5, minL: 25, maxL: 65, categories: ["lake","pond","reservoir"], baits: ["Soft Plastic","Crankbait","Spinnerbait","Frog Lure"], techniques: ["Baitcasting","Spinning","Texas rig"] },
  "Smallmouth Bass": { minW: 0.3, maxW: 3.5, minL: 20, maxL: 55, categories: ["river","lake","stream"], baits: ["Jig Head","Curly Tail Grub","Crankbait"], techniques: ["Spinning","Drop shot"] },
  "Striped Bass": { minW: 1, maxW: 20, minL: 30, maxL: 100, categories: ["bay","river"], baits: ["Live Bait Fish","Crankbait","Pilker"], techniques: ["Trolling","Baitcasting"] },
  "Rainbow Trout": { minW: 0.3, maxW: 5, minL: 20, maxL: 65, categories: ["river","stream","lake"], baits: ["Artificial Fly","Spinner","Nymph","Corn"], techniques: ["Fly fishing","Spinning"] },
  "Brown Trout": { minW: 0.3, maxW: 8, minL: 20, maxL: 75, categories: ["river","stream","lake"], baits: ["Streamer","Nymph","Spinner"], techniques: ["Fly fishing","Spinning"] },
  "Walleye": { minW: 0.5, maxW: 6, minL: 25, maxL: 75, categories: ["lake","river","reservoir"], baits: ["Crankbait","Soft Shad","Jig Head"], techniques: ["Trolling","Jigging"] },
  "Northern Pike": { minW: 1, maxW: 15, minL: 40, maxL: 120, categories: ["lake","river","reservoir"], baits: ["Spoon","Soft Shad","Lead Fish"], techniques: ["Spinning","Baitcasting"] },
  "Channel Catfish": { minW: 0.5, maxW: 15, minL: 25, maxL: 90, categories: ["river","lake","pond"], baits: ["Chicken Liver","Earthworm","Dead Bait"], techniques: ["Bottom fishing","Ledgering"] },
  "Crappie": { minW: 0.1, maxW: 1.5, minL: 15, maxL: 38, categories: ["lake","pond","reservoir"], baits: ["Curly Tail Grub","Jig Head","Maggot"], techniques: ["Jigging","Float fishing"] },
  "Bluegill": { minW: 0.05, maxW: 0.8, minL: 10, maxL: 30, categories: ["pond","lake","stream"], baits: ["Earthworm","Corn","Maggot"], techniques: ["Float fishing"] },
  "Common Carp": { minW: 2, maxW: 25, minL: 30, maxL: 100, categories: ["lake","river","pond"], baits: ["Boilie","Corn","Bread","Pellet"], techniques: ["Carp fishing","Feeder fishing"] },
  "Zander": { minW: 0.5, maxW: 10, minL: 30, maxL: 90, categories: ["lake","river","reservoir"], baits: ["Soft Shad","Jig Head"], techniques: ["Vertical fishing","Spinning"] },
  "European Perch": { minW: 0.1, maxW: 2.5, minL: 15, maxL: 50, categories: ["lake","river","pond"], baits: ["Spinner","Soft Plastic","Earthworm"], techniques: ["Spinning","Drop shot"] },
  "Wels Catfish": { minW: 5, maxW: 80, minL: 60, maxL: 200, categories: ["river","lake","reservoir"], baits: ["Dead Bait","Live Bait Fish"], techniques: ["Catfish fishing","Bottom fishing"] },
  "Grayling": { minW: 0.2, maxW: 2, minL: 20, maxL: 50, categories: ["river","stream"], baits: ["Nymph","Artificial Fly"], techniques: ["Fly fishing"] },
  "Redfish": { minW: 1, maxW: 15, minL: 30, maxL: 100, categories: ["bay"], baits: ["Soft Plastic","Spoon"], techniques: ["Spinning","Baitcasting"] },
  "Yellow Perch": { minW: 0.1, maxW: 1, minL: 12, maxL: 35, categories: ["lake","river"], baits: ["Maggot","Earthworm"], techniques: ["Float fishing","Jigging"] },
  "Brook Trout": { minW: 0.1, maxW: 3, minL: 15, maxL: 55, categories: ["stream","river","lake"], baits: ["Artificial Fly","Nymph","Spinner"], techniques: ["Fly fishing","Spinning"] },
  "Lake Trout": { minW: 1, maxW: 20, minL: 30, maxL: 100, categories: ["lake"], baits: ["Spoon","Crankbait"], techniques: ["Trolling","Jigging"] },
  "Atlantic Salmon": { minW: 2, maxW: 15, minL: 40, maxL: 100, categories: ["river"], baits: ["Artificial Fly","Streamer"], techniques: ["Fly fishing"] },
  "Tench": { minW: 0.5, maxW: 5, minL: 25, maxL: 60, categories: ["lake","pond"], baits: ["Corn","Earthworm","Bread"], techniques: ["Float fishing","Feeder fishing"] },
  "Barbel": { minW: 0.5, maxW: 8, minL: 25, maxL: 80, categories: ["river"], baits: ["Pellet","Corn","Boilie"], techniques: ["Feeder fishing","Ledgering"] },
  "Chub": { minW: 0.3, maxW: 4, minL: 20, maxL: 60, categories: ["river","stream"], baits: ["Bread","Cheese","Spinner"], techniques: ["Float fishing","Spinning"] },
  "Marble Trout": { minW: 0.5, maxW: 10, minL: 25, maxL: 90, categories: ["river"], baits: ["Streamer","Nymph"], techniques: ["Fly fishing"] },
};

const allSpecies = Object.keys(fishHabitat);
function rand(min: number, max: number) { return min + Math.random() * (max - min); }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function roundTo(n: number, d: number) { const f = 10 ** d; return Math.round(n * f) / f; }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "seed";
  const batchNum = parseInt(url.searchParams.get("batch") || "0");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const userId = "b88ee2f6-2f0e-4cca-b9e4-cf3ec0690cc0";

  // DELETE action
  if (action === "delete") {
    let deleted = 0;
    for (let i = 0; i < 50; i++) {
      const { data: batch } = await supabase
        .from("catches")
        .select("id")
        .eq("user_id", userId)
        .eq("is_public", true)
        .is("photo_url", null)
        .limit(500);
      if (!batch || batch.length === 0) break;
      await supabase.from("catches").delete().in("id", batch.map(r => r.id));
      deleted += batch.length;
    }
    return new Response(JSON.stringify({ deleted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // SEED action - does 50k per call
  const PER_CALL = 50000;
  const BATCH_SIZE = 1000;

  // Fetch locations
  const allLocations: { name: string; lat: number; lng: number; category: string; species: string[] }[] = [];
  let offset = 0;
  while (true) {
    const { data } = await supabase
      .from("fishing_locations")
      .select("name, lat, lng, category, species")
      .range(offset, offset + 999);
    if (!data || data.length === 0) break;
    allLocations.push(...data.map(d => ({
      name: d.name, lat: d.lat, lng: d.lng,
      category: (d.category || "lake").toLowerCase(),
      species: d.species || [],
    })));
    offset += data.length;
    if (data.length < 1000) break;
  }

  let inserted = 0;
  for (let i = 0; i < PER_CALL; i += BATCH_SIZE) {
    const rows = [];
    for (let j = 0; j < BATCH_SIZE; j++) {
      const loc = pick(allLocations);
      const matching = allSpecies.filter(sp => fishHabitat[sp].categories.includes(loc.category));
      const locSpecies = loc.species.filter(s => allSpecies.includes(s));
      
      let fishName: string;
      if (locSpecies.length > 0 && Math.random() < 0.7) fishName = pick(locSpecies);
      else if (matching.length > 0) fishName = pick(matching);
      else fishName = pick(allSpecies);

      const fish = fishHabitat[fishName];
      if (!fish) continue;

      const latOff = (Math.random() - 0.5) * 0.008;
      const lngOff = (Math.random() - 0.5) * 0.008;
      const daysAgo = Math.floor(Math.random() * 365);
      const date = new Date(); date.setDate(date.getDate() - daysAgo);

      rows.push({
        fish: fishName,
        weight: roundTo(rand(fish.minW, fish.maxW), 2),
        length: roundTo(rand(fish.minL, fish.maxL), 1),
        water: loc.name, bait: pick(fish.baits), technique: pick(fish.techniques),
        catch_date: date.toISOString().split("T")[0],
        location_lat: roundTo(loc.lat + latOff, 5),
        location_lng: roundTo(loc.lng + lngOff, 5),
        user_id: userId, is_public: true, verified: false, notes: "",
      });
    }
    const { error } = await supabase.from("catches").insert(rows);
    if (!error) inserted += rows.length;
  }

  return new Response(
    JSON.stringify({ success: true, batch: batchNum, inserted }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
