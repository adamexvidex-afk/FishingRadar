import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FISH = [
  // JAPAN
  {
    name_en: "Japanese Amberjack",
    latin_name: "Seriola quinqueradiata",
    category: "saltwater",
    habitat: "Coastal waters around Japan, rocky reefs and open ocean. Migrates along the Japanese coast seasonally.",
    techniques: ["Jigging", "Trolling", "Live bait fishing", "Popping"],
    baits: ["Metal jigs", "Live sardines", "Poppers", "Squid"],
    min_size: "50 cm",
    protection: "Seasonal size limits in some prefectures",
    description: "Known as 'Buri' in Japan, this powerful predator is one of the most prized game fish in Japanese waters. It can reach over 1 meter and 15 kg, offering explosive fights on light tackle."
  },
  {
    name_en: "Japanese Sea Bass",
    latin_name: "Lateolabrax japonicus",
    category: "saltwater",
    habitat: "Estuaries, harbors, river mouths and coastal areas throughout Japan, Korea and China.",
    techniques: ["Lure fishing", "Fly fishing", "Bait fishing"],
    baits: ["Soft plastics", "Minnow lures", "Shrimp", "Sand worms"],
    min_size: "30 cm",
    protection: "None",
    description: "Called 'Suzuki' in Japanese, this sleek predator is the most popular lure-fishing target in Japan. It hunts aggressively around structure and in currents, especially at night."
  },
  {
    name_en: "Red Sea Bream",
    latin_name: "Pagrus major",
    category: "saltwater",
    habitat: "Rocky reefs and sandy bottoms in temperate waters of Japan, Korea, and the western Pacific.",
    techniques: ["Bottom fishing", "Tai-rubber", "Jigging"],
    baits: ["Shrimp", "Tai-rubber jigs", "Cut squid", "Worms"],
    min_size: "20 cm",
    protection: "Size limits vary by prefecture",
    description: "The iconic 'Madai' is considered the king of fish in Japanese cuisine and culture. Its beautiful pink-red coloration and excellent fighting ability make it highly sought after."
  },
  {
    name_en: "Japanese Horse Mackerel",
    latin_name: "Trachurus japonicus",
    category: "saltwater",
    habitat: "Coastal waters and open ocean around Japan, forming large schools near the surface.",
    techniques: ["Sabiki rigs", "Light jigging", "Float fishing"],
    baits: ["Sabiki feathers", "Small jigs", "Krill", "Cut fish"],
    min_size: "15 cm",
    protection: "None",
    description: "Known as 'Aji', this is Japan's most commonly caught recreational fish. Perfect for beginners, it's abundant in harbors and piers and excellent eating as sashimi."
  },
  {
    name_en: "Ayu",
    latin_name: "Plecoglossus altivelis",
    category: "freshwater",
    habitat: "Clear, fast-flowing rivers throughout Japan. Migrates upstream from the sea as juveniles.",
    techniques: ["Tomozuri (decoy fishing)", "Fly fishing", "Drifting"],
    baits: ["Live ayu decoy", "Artificial flies", "Dough balls"],
    min_size: "12 cm",
    protection: "Seasonal fishing permits required; season typically June-October",
    description: "The sweetfish or 'Ayu' is Japan's most beloved freshwater fish, famous for its unique cucumber-like aroma. Traditional 'Tomozuri' fishing using a live decoy ayu is a centuries-old technique."
  },
  {
    name_en: "Japanese Giant Snakehead",
    latin_name: "Channa argus",
    category: "freshwater",
    habitat: "Lakes, ponds, rice paddies and slow rivers in Japan, Korea and China.",
    techniques: ["Topwater lures", "Frog lures", "Soft plastics"],
    baits: ["Frog lures", "Buzzbaits", "Live frogs", "Soft plastic worms"],
    min_size: "None",
    protection: "Invasive species in some areas – check local rules",
    description: "Called 'Raigyo' in Japan, this aggressive predator is a cult favorite among Japanese lure anglers. Known for explosive topwater strikes and powerful fights in weedy cover."
  },
  // SOUTHEAST ASIA
  {
    name_en: "Giant Trevally",
    latin_name: "Caranx ignobilis",
    category: "saltwater",
    habitat: "Coral reefs, channels, lagoons and open ocean throughout the Indo-Pacific region.",
    techniques: ["Popping", "Jigging", "Trolling", "Shore casting"],
    baits: ["Large poppers", "Stick baits", "Metal jigs", "Live baitfish"],
    min_size: "None in most areas",
    protection: "Catch and release encouraged for large specimens",
    description: "The GT is the ultimate tropical shore and reef predator. Growing over 80 kg, it's famous for brutal surface strikes on poppers and is considered one of the world's greatest game fish."
  },
  {
    name_en: "Barramundi",
    latin_name: "Lates calcarifer",
    category: "brackish",
    habitat: "Estuaries, rivers, mangroves and coastal waters from Southeast Asia to Australia.",
    techniques: ["Casting lures", "Trolling", "Bait fishing", "Fly fishing"],
    baits: ["Soft plastics", "Crankbaits", "Live prawns", "Mullet"],
    min_size: "55-60 cm depending on region",
    protection: "Size and bag limits vary by country",
    description: "One of Asia's premier game fish, the Barramundi combines explosive strikes with acrobatic jumps. It can exceed 60 kg and is equally prized for sport and table quality."
  },
  {
    name_en: "Mekong Giant Catfish",
    latin_name: "Pangasianodon gigas",
    category: "freshwater",
    habitat: "The Mekong River basin in Thailand, Laos, Cambodia and Vietnam.",
    techniques: ["Bottom fishing", "Float fishing"],
    baits: ["Dough balls", "Bread paste", "Vegetable baits"],
    min_size: "Protected – catch and release only",
    protection: "Critically endangered – IUCN Red List. Fishing heavily restricted.",
    description: "The world's largest freshwater catfish, capable of reaching 300 kg. Once abundant in the Mekong, it is now critically endangered. Stocked fishing lakes in Thailand offer catch-and-release opportunities."
  },
  {
    name_en: "Siamese Giant Carp",
    latin_name: "Catlocarpio siamensis",
    category: "freshwater",
    habitat: "Large rivers, floodplains and deep pools in the Mekong and Chao Phraya basins.",
    techniques: ["Bottom fishing", "Float fishing"],
    baits: ["Bread paste", "Tapioca", "Fruit", "Corn"],
    min_size: "Protected",
    protection: "Critically endangered – IUCN Red List",
    description: "The largest cyprinid (carp family) fish in the world, growing to over 150 kg. This gentle giant is critically endangered in the wild but available in stocked Thai fishing lakes."
  },
  {
    name_en: "Peacock Bass",
    latin_name: "Cichla ocellaris",
    category: "freshwater",
    habitat: "Reservoirs and lakes in Thailand, Malaysia and Singapore (introduced). Native to South America.",
    techniques: ["Casting lures", "Trolling", "Topwater"],
    baits: ["Crankbaits", "Jerkbaits", "Spinnerbaits", "Topwater plugs"],
    min_size: "None",
    protection: "None – introduced species",
    description: "Introduced to Southeast Asian reservoirs, the Peacock Bass offers explosive topwater action in tropical settings. Known for aggressive strikes and colorful appearance."
  },
  {
    name_en: "Mahseer",
    latin_name: "Tor putitora",
    category: "freshwater",
    habitat: "Fast-flowing rivers and streams in India, Nepal, Thailand and Myanmar.",
    techniques: ["Spinning", "Bait fishing", "Fly fishing"],
    baits: ["Spoons", "Spinners", "Ragi paste", "Live insects"],
    min_size: "Varies by region",
    protection: "Protected in many areas; catch and release encouraged",
    description: "Called the 'Tiger of the River', the Golden Mahseer is South Asia's premier freshwater game fish. It inhabits pristine mountain rivers and fights with incredible power and endurance."
  },
  {
    name_en: "Snakehead Murrel",
    latin_name: "Channa striata",
    category: "freshwater",
    habitat: "Rice paddies, canals, ponds, marshes and slow rivers throughout Southeast Asia and India.",
    techniques: ["Frog lures", "Topwater", "Bait fishing"],
    baits: ["Frog lures", "Buzzbaits", "Live frogs", "Chicken liver"],
    min_size: "None",
    protection: "None",
    description: "The Striped Snakehead is one of the most common and exciting freshwater predators across tropical Asia. Known for savage topwater strikes and ability to breathe air."
  },
  {
    name_en: "Arapaima",
    latin_name: "Arapaima gigas",
    category: "freshwater",
    habitat: "Stocked fishing lakes in Thailand and Malaysia. Native to the Amazon basin.",
    techniques: ["Float fishing", "Lure fishing"],
    baits: ["Live fish", "Dead bait", "Bread", "Pellets"],
    min_size: "Catch and release only in stocked lakes",
    protection: "CITES listed – strict controls on wild populations",
    description: "One of the world's largest freshwater fish, reaching 3 meters and over 200 kg. Available at specialized stocked fishing parks in Thailand, offering a once-in-a-lifetime battle."
  },
  {
    name_en: "Giant Grouper",
    latin_name: "Epinephelus lanceolatus",
    category: "saltwater",
    habitat: "Coral reefs, wrecks and harbors throughout the Indo-Pacific, from East Africa to Oceania.",
    techniques: ["Bottom fishing", "Live bait fishing", "Jigging"],
    baits: ["Live fish", "Squid", "Large cut baits", "Metal jigs"],
    min_size: "Protected in many countries",
    protection: "Vulnerable – IUCN. Protected in many jurisdictions",
    description: "The world's largest reef-dwelling bony fish, growing to 2.7 meters and 400 kg. Found around structure in tropical waters, it is an ambush predator of extraordinary power."
  },
  {
    name_en: "Dogtooth Tuna",
    latin_name: "Gymnosarda unicolor",
    category: "saltwater",
    habitat: "Deep reef drop-offs and offshore pinnacles in the Indo-Pacific.",
    techniques: ["Jigging", "Trolling", "Live bait"],
    baits: ["Speed jigs", "Trolling lures", "Live fusiliers"],
    min_size: "None",
    protection: "None",
    description: "The largest member of the bonito tribe, Dogtooth Tuna reach 130 kg. Known for blistering runs into reef structure, they are one of the most challenging fish to land in tropical waters."
  },
  {
    name_en: "Mangrove Red Snapper",
    latin_name: "Lutjanus argentimaculatus",
    category: "saltwater",
    habitat: "Mangrove estuaries, river mouths, reefs and harbors throughout the Indo-Pacific.",
    techniques: ["Bait fishing", "Lure fishing", "Bottom fishing"],
    baits: ["Live prawns", "Cut fish", "Soft plastics", "Poppers"],
    min_size: "30 cm in most areas",
    protection: "Size limits vary by country",
    description: "A widespread and popular target throughout tropical Asia and Australia. Juveniles inhabit mangroves and estuaries while adults move to offshore reefs. Excellent eating."
  },
  // CHINA & KOREA
  {
    name_en: "Chinese Perch",
    latin_name: "Siniperca chuatsi",
    category: "freshwater",
    habitat: "Rivers, lakes and reservoirs throughout China. Prefers rocky areas with moderate current.",
    techniques: ["Soft plastic fishing", "Live bait", "Jigging"],
    baits: ["Soft plastics", "Live gudgeon", "Grubs", "Small crankbaits"],
    min_size: "25 cm",
    protection: "Seasonal closures in some provinces",
    description: "Known as 'Mandarin Fish' or 'Guiyu', this beautifully patterned predator is one of China's most prized freshwater game fish. Excellent table fish with firm, sweet flesh."
  },
  {
    name_en: "Korean Rockfish",
    latin_name: "Sebastes schlegelii",
    category: "saltwater",
    habitat: "Rocky reefs and kelp beds in Korean, Japanese and Chinese coastal waters.",
    techniques: ["Bottom fishing", "Light jigging", "Float fishing"],
    baits: ["Shrimp", "Cut squid", "Worms", "Small jigs"],
    min_size: "20 cm",
    protection: "Size limits in Korea",
    description: "Called 'Ureok' in Korean, this is one of the most popular recreational fishing targets around the Korean peninsula. Found near rocky structure and excellent for eating."
  },
  {
    name_en: "Snakehead Torpedo",
    latin_name: "Channa marulius",
    category: "freshwater",
    habitat: "Lakes, rivers and canals in India, Thailand, Vietnam and other parts of South and Southeast Asia.",
    techniques: ["Topwater lures", "Live bait", "Frog fishing"],
    baits: ["Frog lures", "Large spoons", "Live fish", "Buzzbaits"],
    min_size: "None",
    protection: "None",
    description: "The Great Snakehead is the largest snakehead species, reaching over 1.5 meters and 30 kg. An apex freshwater predator known for its incredible aggression and surface strikes."
  },
  {
    name_en: "Rohu",
    latin_name: "Labeo rohita",
    category: "freshwater",
    habitat: "Rivers, lakes and reservoirs across India, Bangladesh and Southeast Asia.",
    techniques: ["Float fishing", "Bottom fishing", "Ledgering"],
    baits: ["Bread paste", "Corn", "Dough balls", "Boilies"],
    min_size: "None",
    protection: "None",
    description: "One of India's most important freshwater fish, both commercially and recreationally. Rohu can grow to over 20 kg and is a popular target for bank anglers across South Asia."
  },
  {
    name_en: "Catla",
    latin_name: "Labeo catla",
    category: "freshwater",
    habitat: "Large rivers, lakes and reservoirs in India, Bangladesh, Myanmar and Nepal.",
    techniques: ["Float fishing", "Surface fishing", "Dough bait fishing"],
    baits: ["Bread", "Floating pellets", "Dough balls", "Corn"],
    min_size: "None",
    protection: "None",
    description: "A large Indian carp that can exceed 40 kg. Catla is a surface and mid-water feeder, making it an exciting catch on float tackle. It's one of the 'Big Three' Indian major carps."
  },
  {
    name_en: "Giant Mudfish",
    latin_name: "Clarias batrachus",
    category: "freshwater",
    habitat: "Ponds, rice paddies, swamps and muddy waterways across Southeast Asia and India.",
    techniques: ["Bottom fishing", "Hand lining"],
    baits: ["Worms", "Chicken liver", "Fish guts", "Dough"],
    min_size: "None",
    protection: "None",
    description: "The Walking Catfish is found across tropical Asia. Known for its ability to breathe air and move across land, it's a common and easily caught species in rural waterways."
  },
  {
    name_en: "Hampala Barb",
    latin_name: "Hampala macrolepidota",
    category: "freshwater",
    habitat: "Clear rivers, streams and rapids in Malaysia, Thailand, Indonesia and Borneo.",
    techniques: ["Casting lures", "Spinning", "Fly fishing"],
    baits: ["Small spinners", "Minnow lures", "Spoons", "Flies"],
    min_size: "None",
    protection: "None",
    description: "Known as 'Sebarau' in Malay, this sleek predator is Southeast Asia's answer to the trout. It inhabits clear jungle rivers and strikes aggressively at small lures and flies."
  },
  {
    name_en: "Asian Redtail Catfish",
    latin_name: "Hemibagrus wyckioides",
    category: "freshwater",
    habitat: "Deep pools in large rivers across Thailand, Laos, Vietnam and Cambodia.",
    techniques: ["Bottom fishing", "Live bait fishing"],
    baits: ["Live fish", "Cut fish", "Chicken liver", "Fish paste"],
    min_size: "None",
    protection: "Declining – conservation recommended",
    description: "One of the fiercest freshwater predators in Southeast Asia. Growing to over 80 kg, this catfish is known for incredibly powerful runs and is a bucket-list species for adventurous anglers."
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
