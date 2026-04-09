import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FISH = [
  // EAST AFRICA
  {
    name_en: "Nile Perch",
    latin_name: "Lates niloticus",
    category: "freshwater",
    habitat: "Lake Victoria, Lake Nasser, Nile River system and other large African lakes and rivers.",
    techniques: ["Trolling", "Live bait", "Jigging", "Casting lures"],
    baits: ["Large spoons", "Crankbaits", "Live tilapia", "Cut bait"],
    min_size: "50 cm in most areas",
    protection: "Commercial fishing regulations apply",
    description: "One of the world's largest freshwater fish, the Nile Perch can exceed 200 kg. Lake Victoria and Lake Nasser are legendary destinations for trophy Nile Perch fishing."
  },
  {
    name_en: "Tiger Fish",
    latin_name: "Hydrocynus vittatus",
    category: "freshwater",
    habitat: "Fast-flowing rivers and large lakes across sub-Saharan Africa, especially the Zambezi, Okavango and Lake Kariba.",
    techniques: ["Spinning", "Trolling", "Fly fishing", "Live bait"],
    baits: ["Spoons", "Spinners", "Rapalas", "Live bream"],
    min_size: "None in most areas",
    protection: "Catch and release encouraged for large specimens",
    description: "Africa's most ferocious freshwater predator. With razor-sharp teeth and explosive strikes, the Tiger Fish is often called the 'striped water dog'. A bucket-list species for adventure anglers."
  },
  {
    name_en: "Goliath Tigerfish",
    latin_name: "Hydrocynus goliath",
    category: "freshwater",
    habitat: "Congo River basin, especially rapids and fast-flowing sections.",
    techniques: ["Heavy spinning", "Trolling", "Live bait"],
    baits: ["Large lures", "Live fish", "Heavy spoons"],
    min_size: "None",
    protection: "Remote areas limit fishing pressure",
    description: "The giant cousin of the Tiger Fish, the Goliath can reach 1.5 meters and 50 kg. Found only in the Congo basin, it's one of the most extreme freshwater predators on Earth."
  },
  {
    name_en: "Vundu Catfish",
    latin_name: "Heterobranchus longifilis",
    category: "freshwater",
    habitat: "Large rivers and lakes across tropical Africa, from the Nile to the Zambezi.",
    techniques: ["Bottom fishing", "Live bait", "Night fishing"],
    baits: ["Cut fish", "Chicken liver", "Live bream", "Worms"],
    min_size: "None",
    protection: "None",
    description: "Africa's second-largest catfish, the Vundu can exceed 50 kg. A powerful nocturnal predator found in deep pools, it provides an incredible fight on heavy tackle."
  },
  {
    name_en: "African Sharptooth Catfish",
    latin_name: "Clarias gariepinus",
    category: "freshwater",
    habitat: "Rivers, lakes, dams, ponds and even temporary flood pools across all of Africa.",
    techniques: ["Bottom fishing", "Float fishing", "Night fishing"],
    baits: ["Worms", "Chicken liver", "Cut fish", "Bread dough"],
    min_size: "None",
    protection: "None – very widespread",
    description: "The most widespread freshwater fish in Africa, found in virtually every water body. Can breathe air and survive in minimal water. Grows to over 60 kg in large dams."
  },
  {
    name_en: "Yellowfish",
    latin_name: "Labeobarbus kimberleyensis",
    category: "freshwater",
    habitat: "The Vaal and Orange River systems in South Africa.",
    techniques: ["Fly fishing", "Bait fishing", "Spinning"],
    baits: ["Nymphs", "Dry flies", "Corn", "Bread"],
    min_size: "Catch and release in many areas",
    protection: "Protected in some provinces; catch and release encouraged",
    description: "The Largemouth Yellowfish is South Africa's premier fly-fishing target. Growing to over 20 kg in the Vaal River, it combines the fight of a carp with the speed of a trout."
  },
  {
    name_en: "Tilapia",
    latin_name: "Oreochromis niloticus",
    category: "freshwater",
    habitat: "Lakes, rivers, dams and ponds throughout Africa. Introduced worldwide.",
    techniques: ["Float fishing", "Bottom fishing", "Fly fishing"],
    baits: ["Worms", "Bread", "Corn", "Small flies"],
    min_size: "None in most areas",
    protection: "None – very abundant",
    description: "The Nile Tilapia is Africa's most abundant freshwater fish and one of the world's most important food fish. Fun to catch on light tackle and excellent eating."
  },
  // SOUTHERN AFRICA
  {
    name_en: "Garrick",
    latin_name: "Lichia amia",
    category: "saltwater",
    habitat: "Surf zone, estuaries and nearshore waters along the coasts of South Africa and Namibia.",
    techniques: ["Surf fishing", "Spinning", "Live bait", "Fly fishing"],
    baits: ["Live mullet", "Spoons", "Plugs", "Sardines"],
    min_size: "70 cm in South Africa",
    protection: "Strict bag and size limits; catch and release encouraged",
    description: "Also called Leervis, the Garrick is South Africa's most exciting surf predator. Known for blistering runs and spectacular jumps, it's a prized catch from the shore."
  },
  {
    name_en: "Kob",
    latin_name: "Argyrosomus japonicus",
    category: "saltwater",
    habitat: "Sandy beaches, estuaries and shallow coastal waters of South Africa, Namibia and Mozambique.",
    techniques: ["Surf fishing", "Bait fishing", "Lure fishing"],
    baits: ["Sardines", "Squid", "Shad", "Soft plastics"],
    min_size: "60 cm in South Africa",
    protection: "Strict bag and size limits",
    description: "The Dusky Kob is South Africa's most popular surf-fishing target. Growing to over 70 kg, it patrols the surf zone and estuaries, providing powerful fights for shore anglers."
  },
  {
    name_en: "Spotted Grunter",
    latin_name: "Pomadasys commersonnii",
    category: "saltwater",
    habitat: "Estuaries, tidal flats and shallow coastal waters of southern and eastern Africa.",
    techniques: ["Light tackle", "Fly fishing", "Bait fishing"],
    baits: ["Sand prawns", "Mud prawns", "Crab", "Flies"],
    min_size: "40 cm in South Africa",
    protection: "Bag and size limits apply",
    description: "A favorite flats and estuary fish in South Africa, the Spotted Grunter feeds on crustaceans in shallow water. Excellent on fly tackle and light spinning gear."
  },
  {
    name_en: "Snoek",
    latin_name: "Thyrsites atun",
    category: "saltwater",
    habitat: "Cold waters off the coast of South Africa, Namibia, and southern Australia/New Zealand.",
    techniques: ["Trolling", "Handlining", "Jigging"],
    baits: ["Shad", "Spoons", "Red-eye lures", "Cut bait"],
    min_size: "None",
    protection: "Commercial quotas; recreational bag limits",
    description: "An iconic South African game fish that arrives in massive shoals during winter. Known for its razor-sharp teeth and voracious feeding, it's a staple of Cape Town fishing culture."
  },
  // WEST AFRICA
  {
    name_en: "African Barracuda",
    latin_name: "Sphyraena afra",
    category: "saltwater",
    habitat: "Tropical and subtropical coastal waters of West Africa from Senegal to Angola.",
    techniques: ["Trolling", "Casting", "Jigging"],
    baits: ["Metal lures", "Plugs", "Live bait", "Spoons"],
    min_size: "None",
    protection: "None",
    description: "The Guinean Barracuda is West Africa's largest barracuda species, reaching over 2 meters. A fierce predator found near reefs and rocky structure, offering spectacular fights."
  },
  {
    name_en: "African Pompano",
    latin_name: "Alectis ciliaris",
    category: "saltwater",
    habitat: "Tropical reefs, wrecks and offshore structure along African coasts.",
    techniques: ["Jigging", "Bottom fishing", "Trolling"],
    baits: ["Metal jigs", "Live bait", "Cut squid", "Crabs"],
    min_size: "None",
    protection: "None",
    description: "A beautiful and powerful game fish found on tropical reefs. Known for its diamond-shaped body and long trailing filaments as a juvenile. Excellent table fish."
  },
  {
    name_en: "Giant African Threadfin",
    latin_name: "Polydactylus quadrifilis",
    category: "saltwater",
    habitat: "Surf zones, estuaries and river mouths along the West African coast.",
    techniques: ["Surf casting", "Bait fishing", "Bottom fishing"],
    baits: ["Shrimp", "Cut fish", "Crab", "Squid"],
    min_size: "None",
    protection: "None",
    description: "One of West Africa's premier surf fish, the Giant Threadfin can exceed 100 kg. Found in the turbulent surf zone, it uses its thread-like pectoral fin rays to detect prey in sandy bottoms."
  },
  {
    name_en: "West African Ladyfish",
    latin_name: "Elops senegalensis",
    category: "saltwater",
    habitat: "Coastal lagoons, estuaries and mangrove channels along the West African coast.",
    techniques: ["Light spinning", "Fly fishing", "Live bait"],
    baits: ["Small lures", "Flies", "Shrimp", "Small fish"],
    min_size: "None",
    protection: "None",
    description: "A miniature tarpon relative that provides acrobatic fun on light tackle. Found in coastal lagoons and estuaries, it jumps repeatedly when hooked."
  },
  // EAST AFRICAN COAST
  {
    name_en: "Sailfish",
    latin_name: "Istiophorus platypterus",
    category: "saltwater",
    habitat: "Open ocean waters off the East African coast, especially Kenya, Tanzania and Mozambique.",
    techniques: ["Trolling", "Live bait", "Pitch bait"],
    baits: ["Trolling lures", "Live bonito", "Strip baits", "Ballyhoo"],
    min_size: "Tag and release in most areas",
    protection: "Catch and release strongly encouraged",
    description: "The Indian Ocean Sailfish is the fastest fish in the sea. The East African coast, particularly the Mozambique Channel, offers world-class sailfish action year-round."
  },
  {
    name_en: "Mozambique Tilapia",
    latin_name: "Oreochromis mossambicus",
    category: "freshwater",
    habitat: "Coastal rivers, estuaries, and dams in East and Southern Africa.",
    techniques: ["Float fishing", "Bait fishing", "Fly fishing"],
    baits: ["Worms", "Bread", "Small flies", "Corn"],
    min_size: "None",
    protection: "None – very abundant",
    description: "A hardy tilapia species native to East Africa that tolerates salt water. Widely introduced globally, it's a reliable catch in dams and rivers across Southern Africa."
  },
  {
    name_en: "Zambezi Shark",
    latin_name: "Carcharhinus leucas",
    category: "saltwater",
    habitat: "Coastal waters, estuaries and even freshwater rivers in East and Southern Africa.",
    techniques: ["Heavy bait fishing", "Shore fishing", "Boat fishing"],
    baits: ["Large cut baits", "Whole fish", "Shark baits"],
    min_size: "Tag and release recommended",
    protection: "Near Threatened – IUCN. Catch and release encouraged",
    description: "Known elsewhere as the Bull Shark, the Zambezi is the only shark regularly found in fresh water. It enters rivers and lakes, making it unique among sharks and a legendary catch."
  },
  {
    name_en: "Bream (Kariba)",
    latin_name: "Pharyngochromis acuticeps",
    category: "freshwater",
    habitat: "Lake Kariba, Zambezi system and other southern African lakes and rivers.",
    techniques: ["Float fishing", "Light spinning", "Fly fishing"],
    baits: ["Worms", "Small flies", "Bread", "Insects"],
    min_size: "None",
    protection: "None",
    description: "A common and popular freshwater fish in southern African lakes and dams. While small, bream are fun on light tackle and abundant in warm waters."
  },
  {
    name_en: "Electric Catfish",
    latin_name: "Malapterurus electricus",
    category: "freshwater",
    habitat: "Slow-moving rivers and lakes across tropical Africa, from the Nile to West Africa.",
    techniques: ["Bottom fishing", "Night fishing"],
    baits: ["Worms", "Cut fish", "Liver"],
    min_size: "None",
    protection: "None",
    description: "A unique African catfish capable of generating electric shocks up to 350 volts. Handle with extreme care! Found in murky waters across tropical Africa."
  },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: existing } = await supabase.from('fish_species').select('name_en');
    const existingNames = new Set((existing || []).map((e: any) => e.name_en.toLowerCase()));

    const newFish = FISH.filter(f => !existingNames.has(f.name_en.toLowerCase()));

    let inserted = 0;
    for (const f of newFish) {
      const { error } = await supabase.from('fish_species').insert({
        name_en: f.name_en,
        latin_name: f.latin_name,
        description: f.description,
        habitat: f.habitat,
        techniques: f.techniques,
        baits: f.baits,
        min_size: f.min_size,
        protection: f.protection,
        category: f.category,
      });
      if (!error) inserted++;
    }

    return new Response(JSON.stringify({
      success: true,
      inserted,
      skipped: FISH.length - newFish.length,
      total_in_batch: FISH.length,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
