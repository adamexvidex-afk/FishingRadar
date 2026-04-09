import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FISH: Array<{
  name_en: string;
  latin_name: string;
  category: string;
  habitat: string;
  description: string;
  techniques: string[];
  baits: string[];
  min_size: string;
  protection: string;
}> = [
  // === AUSTRALIA FRESHWATER ===
  {
    name_en: "Murray Cod",
    latin_name: "Maccullochella peelii",
    category: "freshwater",
    habitat: "Slow-flowing rivers, deep pools, submerged logs and rock structures in the Murray-Darling Basin. Australia's largest freshwater fish.",
    description: "Iconic Australian native reaching over 1m. Ambush predator lurking near structure. Olive-green with mottled pattern. Protected with strict size/bag limits in most states.",
    techniques: ["Casting", "Trolling", "Bait fishing", "Lure fishing"],
    baits: ["Spinnerbaits", "Hard-body lures", "Soft plastics", "Yabbies", "Shrimp"],
    min_size: "55 cm (varies by state)",
    protection: "Closed season Sep-Nov in most states. Strict bag limits."
  },
  {
    name_en: "Australian Bass",
    latin_name: "Percalates novemaculeata",
    category: "freshwater",
    habitat: "Coastal rivers, estuaries and impoundments in eastern Australia from Victoria to Queensland. Prefers clear, flowing water with structure.",
    description: "Popular sportfish prized for its fighting ability on light tackle. Bronze-green coloration. Catadromous - migrates to estuaries to spawn in winter.",
    techniques: ["Fly fishing", "Lure casting", "Surface lures", "Bait fishing"],
    baits: ["Small hard-body lures", "Surface poppers", "Flies", "Worms", "Crickets"],
    min_size: "25 cm",
    protection: "Closed season Jun-Aug in some states."
  },
  {
    name_en: "Golden Perch",
    latin_name: "Macquaria ambigua",
    category: "freshwater",
    habitat: "Turbid inland rivers, lakes and impoundments throughout the Murray-Darling Basin. Tolerates warm water and low oxygen. Also known as Yellowbelly or Callop.",
    description: "Hardy native species with golden-yellow flanks. Strong fighter that can reach 75cm. Responds well to flooding and rising water levels which trigger spawning.",
    techniques: ["Bait fishing", "Lure casting", "Trolling"],
    baits: ["Yabbies", "Shrimp", "Worms", "Spinnerbaits", "Soft plastics"],
    min_size: "30 cm",
    protection: "Bag limit typically 5 per day."
  },
  {
    name_en: "Estuary Perch",
    latin_name: "Percalates colonorum",
    category: "freshwater",
    habitat: "Estuaries, coastal lagoons and lower reaches of rivers in southeastern Australia. Prefers brackish water near structure like fallen trees and rock walls.",
    description: "Closely related to Australian Bass but preferring estuarine habitats. Silver-grey with darker back. Excellent sportfish on light tackle. Less common than Bass.",
    techniques: ["Lure casting", "Bait fishing", "Fly fishing"],
    baits: ["Soft plastics", "Hard-body lures", "Prawns", "Worms"],
    min_size: "27 cm",
    protection: "Protected species in some states. Strict bag limits."
  },
  {
    name_en: "Trout Cod",
    latin_name: "Maccullochella macquariensis",
    category: "freshwater",
    habitat: "Clear, cool-water rivers with rocky substrates in the Murray-Darling system. Critically endangered species found only in a few remnant populations.",
    description: "Smaller relative of Murray Cod with distinctive blue-grey colouration and spotted pattern. Once widespread, now critically endangered. Catch and release only where found.",
    techniques: ["Catch and release only"],
    baits: ["N/A - protected species"],
    min_size: "N/A - fully protected",
    protection: "Fully protected - must be released immediately if caught."
  },
  // === AUSTRALIA SALTWATER ===
  {
    name_en: "Dusky Flathead",
    latin_name: "Platycephalus fuscus",
    category: "saltwater",
    habitat: "Sandy and muddy bottoms in estuaries, bays and coastal waters along Australia's east coast. Ambush predator lying camouflaged on the seabed.",
    description: "Australia's most popular estuary species. Broad, flattened head with upward-facing eyes. Can exceed 1m. Excellent eating. Venomous dorsal spines - handle with care.",
    techniques: ["Soft plastic fishing", "Bait fishing", "Lure casting"],
    baits: ["Soft plastics", "Live bait (mullet, prawns)", "Whitebait", "Squid strips"],
    min_size: "36 cm (varies by state)",
    protection: "Bag limit typically 10. Max size limit in some areas."
  },
  {
    name_en: "Mangrove Jack",
    latin_name: "Lutjanus argentimaculatus",
    category: "saltwater",
    habitat: "Mangrove-lined estuaries, rock bars, bridge pylons and reef structures in tropical and subtropical northern Australia. Ambush predator.",
    description: "Copper-red snapper species renowned for explosive strikes and powerful runs into structure. One of Australia's premier sportfish. Can reach 15kg.",
    techniques: ["Lure casting", "Bait fishing", "Live bait"],
    baits: ["Live mullet", "Prawns", "Hard-body lures", "Soft plastics", "Poppers"],
    min_size: "35 cm",
    protection: "Bag limit 5 per day in most jurisdictions."
  },
  {
    name_en: "Mulloway",
    latin_name: "Argyrosomus japonicus",
    category: "saltwater",
    habitat: "Estuaries, surf beaches, rocky headlands and offshore reefs along Australia's southern and eastern coastline. Also known as Jewfish or Mulloway.",
    description: "Powerful predator reaching over 1.8m and 70kg. Silver with bronze tinge. Feeds mainly at night on mullet and squid. Highly prized table fish and sportfish.",
    techniques: ["Beach fishing", "Estuary fishing", "Lure casting", "Live bait"],
    baits: ["Live mullet", "Squid", "Soft plastics", "Metal lures", "Pilchards"],
    min_size: "45-70 cm (varies by state)",
    protection: "Strict size and bag limits. Some areas catch and release only."
  },
  {
    name_en: "Yellowtail Kingfish",
    latin_name: "Seriola lalandi",
    category: "saltwater",
    habitat: "Temperate coastal waters, rocky reefs, offshore pinnacles and around man-made structures. Found in southern Australia and New Zealand.",
    description: "Powerful pelagic predator with distinctive yellow tail and lateral stripe. Can exceed 50kg. One of the most exciting sportfish in the Southern Hemisphere. Excellent sashimi.",
    techniques: ["Jigging", "Live bait", "Topwater", "Trolling", "Shore casting"],
    baits: ["Live squid", "Live yellowtail", "Metal jigs", "Poppers", "Stickbaits"],
    min_size: "60-65 cm",
    protection: "Bag limit 5 per day."
  },
  {
    name_en: "Australasian Snapper",
    latin_name: "Chrysophrys auratus",
    category: "saltwater",
    habitat: "Coastal reefs, estuaries, harbours and offshore grounds in southern Australia and New Zealand. Aggregates over reef structure and sandy patches.",
    description: "Pink-red body with blue spots when young. Develops distinctive forehead bump with age. Australia and NZ's most popular table fish. Can reach 20kg and 1m.",
    techniques: ["Bottom fishing", "Soft plastic fishing", "Bait fishing", "Jigging"],
    baits: ["Pilchards", "Squid", "Soft plastics", "Jigs", "Prawns"],
    min_size: "28-38 cm (varies by region)",
    protection: "Bag limits typically 6-10 per day."
  },
  {
    name_en: "King George Whiting",
    latin_name: "Sillaginodes punctatus",
    category: "saltwater",
    habitat: "Seagrass beds, sandy flats and shallow coastal waters of southern Australia. Highly prized table fish of South Australia and Victoria.",
    description: "Elongated silver body with golden spots. Considered one of Australia's finest eating fish. Delicate, sweet flesh. Can reach 72cm but typically 30-40cm.",
    techniques: ["Bait fishing", "Drift fishing", "Shore fishing"],
    baits: ["Bass yabbies", "Pipi", "Squid", "Marine worms", "Cockles"],
    min_size: "27 cm",
    protection: "Bag limit 12 per day in SA."
  },
  {
    name_en: "Sand Whiting",
    latin_name: "Sillago ciliata",
    category: "saltwater",
    habitat: "Sandy beaches, sandbars, estuaries and shallow coastal waters along Australia's east coast. Often found in surf zones and tidal flats.",
    description: "Sleek silver fish with golden tinge. Prized for delicate, sweet flesh. Common catch for beach and estuary anglers. Typically 25-40cm.",
    techniques: ["Beach fishing", "Estuary fishing", "Bait fishing"],
    baits: ["Beach worms", "Pipis", "Yabbies", "Prawns", "Squid strips"],
    min_size: "27 cm",
    protection: "Bag limit 20 per day in NSW."
  },
  {
    name_en: "Luderick",
    latin_name: "Girella tricuspidata",
    category: "saltwater",
    habitat: "Rock platforms, breakwalls, estuaries and harbour structures along Australia's east coast. Also known as Blackfish. Herbivorous, feeding on green algae.",
    description: "Dark grey-black body with subtle banding. Primarily herbivorous which makes it unique among sportfish. Requires specialized float fishing techniques. Winter specialist.",
    techniques: ["Float fishing", "Rock fishing"],
    baits: ["Green weed (Enteromorpha)", "Cabbage weed", "Sea lettuce"],
    min_size: "25 cm",
    protection: "Bag limit 20 per day."
  },
  {
    name_en: "Australian Salmon",
    latin_name: "Arripis trutta",
    category: "saltwater",
    habitat: "Surf beaches, rocky headlands and offshore waters of southern Australia. Not a true salmon - unrelated to Atlantic/Pacific salmon species.",
    description: "Silvery-green schooling fish that provides exciting light-tackle fishing from beaches and rocks. Can reach 9kg. Strong fighter but flesh can be oily - best smoked.",
    techniques: ["Beach fishing", "Rock fishing", "Lure casting", "Metal lures"],
    baits: ["Pilchards", "Metal slugs", "Soft plastics", "Squid", "Whitebait"],
    min_size: "21 cm",
    protection: "Bag limit 10-20 per day."
  },
  {
    name_en: "Coral Trout",
    latin_name: "Plectropomus leopardus",
    category: "saltwater",
    habitat: "Coral reefs, particularly the Great Barrier Reef and Coral Sea. Solitary predator inhabiting coral bommies and reef edges in tropical waters.",
    description: "Brilliantly coloured reef fish with red-orange body covered in blue spots. Australia's most prized reef table fish. Can reach 10kg. Excellent sashimi.",
    techniques: ["Reef fishing", "Trolling", "Live bait", "Soft plastics"],
    baits: ["Live bait (hussar, fusilier)", "Soft plastics", "Trolling lures", "Squid"],
    min_size: "38 cm",
    protection: "Bag limit 1-7 depending on zone. GBR zoning applies."
  },
  {
    name_en: "Threadfin Salmon",
    latin_name: "Polydactylus sheridani",
    category: "saltwater",
    habitat: "Tropical estuaries, muddy rivers and coastal waters of northern Australia. Uses thread-like pectoral fin rays to detect prey in turbid water.",
    description: "Highly prized sportfish and table fish of the tropical north. Silver body with distinctive thread-like pectoral fin extensions. Can exceed 1.5m. King threadfin is the premier target.",
    techniques: ["Lure casting", "Bait fishing", "Live bait"],
    baits: ["Live mullet", "Prawns", "Soft plastics", "Hard-body lures"],
    min_size: "60 cm",
    protection: "Strict bag and size limits. No take in some areas."
  },
  // === SHARKS (shore-catchable) ===
  {
    name_en: "Gummy Shark",
    latin_name: "Mustelus antarcticus",
    category: "saltwater",
    habitat: "Coastal bays, estuaries and continental shelf waters of southern Australia. Common on sandy and muddy bottoms. Often caught from piers and beaches.",
    description: "Smooth-skinned shark (no rough denticles) reaching 1.75m. Australia's most popular shark for eating - sold as 'flake' in fish and chip shops. Bronze-grey coloration.",
    techniques: ["Bottom fishing", "Beach fishing", "Pier fishing"],
    baits: ["Squid", "Pilchards", "Fish fillets", "Octopus"],
    min_size: "45 cm (varies by state)",
    protection: "Bag limits apply. Commercial and recreational fishery managed."
  },
  {
    name_en: "Bronze Whaler Shark",
    latin_name: "Carcharhinus brachyurus",
    category: "saltwater",
    habitat: "Temperate coastal waters, surf zones, bays and around river mouths worldwide. Common along southern Australian and New Zealand coastlines. Also called Copper Shark.",
    description: "Large, powerful shark reaching 3.3m. Bronze-olive coloration above, white below. Often caught from beaches during salmon runs. Popular shore-based shark target.",
    techniques: ["Beach fishing", "Shore-based shark fishing", "Boat fishing"],
    baits: ["Whole fish (mullet, salmon)", "Large squid", "Tuna heads", "Bonito"],
    min_size: "No minimum in most areas",
    protection: "Catch and release encouraged. Check local regulations."
  },
  {
    name_en: "School Shark",
    latin_name: "Galeorhinus galeus",
    category: "saltwater",
    habitat: "Temperate coastal waters, bays and shallow continental shelf of southern Australia and New Zealand. Also known as Tope or Soupfin Shark.",
    description: "Slender shark reaching 2m. Grey above, white below. Once heavily fished, now conservation-dependent. Long-lived species. Good eating but population under pressure.",
    techniques: ["Bottom fishing", "Beach fishing", "Pier fishing"],
    baits: ["Squid", "Pilchards", "Fish fillets", "Octopus"],
    min_size: "Varies by state",
    protection: "Conservation-dependent. Strict recreational limits."
  },
  {
    name_en: "Port Jackson Shark",
    latin_name: "Heterodontus portusjacksoni",
    category: "saltwater",
    habitat: "Rocky reefs, kelp beds and caves in temperate waters of southern Australia. Nocturnal bottom-dweller that aggregates in large numbers in winter.",
    description: "Distinctive bullhead shark with harness-like markings and blunt head. Harmless to humans. Crushes sea urchins and shellfish with flat teeth. Often caught accidentally.",
    techniques: ["Bottom fishing"],
    baits: ["Squid", "Shellfish", "Fish pieces"],
    min_size: "N/A",
    protection: "Protected in some states. Release recommended."
  },
  // === NEW ZEALAND ===
  {
    name_en: "Tarakihi",
    latin_name: "Nemadactylus macropterus",
    category: "saltwater",
    habitat: "Rocky and sandy reefs from 10-250m depth around New Zealand. One of NZ's most important commercial and recreational species.",
    description: "Silver-white body with distinctive dark saddle-shaped band behind the head. Excellent eating with firm, white flesh. Can reach 60cm. Found in large schools.",
    techniques: ["Bottom fishing", "Strayline fishing", "Ledger fishing"],
    baits: ["Squid", "Pilchards", "Cut fish", "Shellfish"],
    min_size: "25 cm",
    protection: "Bag limit 20 in most areas."
  },
  {
    name_en: "Kahawai",
    latin_name: "Arripis trutta",
    category: "saltwater",
    habitat: "Coastal waters, harbours, estuaries and surf beaches throughout New Zealand. Schooling pelagic fish. New Zealand's equivalent of Australian Salmon.",
    description: "Silvery-green body with darker spots along the back. Powerful fighter known for spectacular surface feeding frenzies. Excellent smoked. Can reach 60cm and 5kg.",
    techniques: ["Surfcasting", "Spinning", "Fly fishing", "Trolling"],
    baits: ["Metal lures", "Soft plastics", "Pilchards", "Bread", "Flies"],
    min_size: "No minimum",
    protection: "Bag limit 20 in most areas."
  },
  {
    name_en: "Trevally (Silver)",
    latin_name: "Pseudocaranx georgianus",
    category: "saltwater",
    habitat: "Temperate coastal reefs, harbours and estuaries of New Zealand and southern Australia. Schooling species often found around structure.",
    description: "Bright silver body with yellow-tinged fins. Popular target in NZ harbours. Strong fighter for its size. Excellent eating fresh. Can reach 70cm and 6kg.",
    techniques: ["Bait fishing", "Soft plastics", "Jigging", "Shore fishing"],
    baits: ["Squid", "Pilchards", "Soft plastics", "Small jigs"],
    min_size: "25 cm",
    protection: "Bag limit 20 per day."
  },
  {
    name_en: "John Dory",
    latin_name: "Zeus faber",
    category: "saltwater",
    habitat: "Coastal waters and harbours of New Zealand and southern Australia. Solitary ambush predator hovering near structure, wharves and channel markers.",
    description: "Distinctive disc-shaped body with large dark spot ('St Peter's thumbprint') on each side. Extends protrusible jaw to engulf prey. Premium table fish with delicate flesh.",
    techniques: ["Bait fishing", "Soft plastics", "Live bait"],
    baits: ["Live bait (piper, pilchards)", "Soft plastics", "Squid"],
    min_size: "23 cm",
    protection: "Bag limit 20 per day in NZ."
  },
  {
    name_en: "Blue Cod",
    latin_name: "Parapercis colias",
    category: "saltwater",
    habitat: "Rocky reefs and kelp beds around the South Island of New Zealand. Bottom-dwelling species found from shore to 150m depth.",
    description: "Blue-green to grey body with mottled pattern. One of the South Island's most prized eating fish. Territorial and aggressive. Can reach 60cm.",
    techniques: ["Bottom fishing", "Ledger fishing", "Soft plastics"],
    baits: ["Squid", "Paua", "Mussels", "Pilchards", "Soft plastics"],
    min_size: "33 cm",
    protection: "Strict bag limits (2-10 depending on area). Some areas closed."
  },
  {
    name_en: "Hapuku",
    latin_name: "Polyprion oxygeneios",
    category: "saltwater",
    habitat: "Deep rocky reefs, pinnacles and seamounts around New Zealand from 50-400m depth. Also found in southern Australia. Also called Groper.",
    description: "Large, powerful deepwater species reaching 1.8m and 100kg. Dark grey-brown coloration. Premium table fish. Slow-growing and long-lived - can live over 60 years.",
    techniques: ["Deep dropping", "Bottom fishing", "Jigging"],
    baits: ["Squid", "Fish baits", "Large jigs"],
    min_size: "No minimum in most areas",
    protection: "Bag limit 3 combined with Bass Grouper."
  },
  {
    name_en: "Snapper (NZ Pink)",
    latin_name: "Chrysophrys auratus",
    category: "saltwater",
    habitat: "Coastal reefs, harbours, estuaries and offshore grounds around the North Island and upper South Island of New Zealand. NZ's most popular recreational fish.",
    description: "Same species as Australasian Snapper but referred to locally as NZ's favourite fish. Pink-red body developing a prominent forehead bump in large specimens. Can reach 15kg.",
    techniques: ["Strayline fishing", "Soft plastic fishing", "Jigging", "Surfcasting"],
    baits: ["Pilchards", "Squid", "Soft plastics", "Skipjack tuna baits"],
    min_size: "27-30 cm (varies by zone)",
    protection: "Bag limit 7-10 depending on area."
  },
  {
    name_en: "Yellowfin Bream",
    latin_name: "Acanthopagrus australis",
    category: "saltwater",
    habitat: "Estuaries, mangrove creeks, rocky shores and coastal lagoons of eastern Australia from Victoria to Queensland. One of Australia's most commonly caught species.",
    description: "Silver body with distinctive yellow pelvic and anal fins. Hardy and adaptable. Excellent on light tackle. Can reach 4kg. Good eating when fresh.",
    techniques: ["Bait fishing", "Lure fishing", "Soft plastics", "Fly fishing"],
    baits: ["Prawns", "Bread", "Chicken", "Worms", "Small soft plastics", "Flies"],
    min_size: "25 cm",
    protection: "Bag limit 20 per day."
  },
  {
    name_en: "Samsonfish",
    latin_name: "Seriola hippos",
    category: "saltwater",
    habitat: "Temperate reefs and offshore islands of southern Australia, particularly Western Australia. Powerful ambush predator found near reef edges.",
    description: "Massive, heavy-bodied relative of kingfish reaching 1.8m and 60kg. Dark olive body with amber stripe. Brutally powerful fighter. Named for its incredible strength.",
    techniques: ["Jigging", "Live bait", "Topwater", "Popping"],
    baits: ["Metal jigs", "Live bait", "Large poppers", "Stickbaits"],
    min_size: "60 cm",
    protection: "Bag limit 2 per day."
  },
  {
    name_en: "Red Emperor",
    latin_name: "Lutjanus sebae",
    category: "saltwater",
    habitat: "Tropical offshore reefs, shoals and pinnacles in northern Australia. Found from 20-200m depth on coral and rocky substrates.",
    description: "Striking red and white banded fish reaching 1m and 33kg. One of Australia's premier tropical reef fish. Excellent eating with firm, white flesh. Highly valued.",
    techniques: ["Bottom fishing", "Jigging", "Live bait"],
    baits: ["Squid", "Pilchards", "Live bait", "Strip baits"],
    min_size: "40-55 cm (varies by state)",
    protection: "Bag limit 1-5 depending on jurisdiction."
  },
  {
    name_en: "Australian Herring",
    latin_name: "Arripis georgianus",
    category: "saltwater",
    habitat: "Surf beaches, rocky shores and estuaries of southern Australia, particularly Western Australia and South Australia. Schooling pelagic species.",
    description: "Small, silver schooling fish reaching 40cm. Excellent fun on ultra-light tackle. Good bait fish and decent eating when fresh. Not a true herring.",
    techniques: ["Beach fishing", "Rock fishing", "Bait fishing", "Lure fishing"],
    baits: ["Maggots", "Dough baits", "Small metal lures", "Cut bait"],
    min_size: "No minimum",
    protection: "Bag limit 30 per day in WA."
  },
  {
    name_en: "Tailor",
    latin_name: "Pomatomus saltatrix",
    category: "saltwater",
    habitat: "Surf beaches, rocky headlands, estuaries and offshore waters of eastern and southern Australia. Same species as Bluefish (USA). Voracious predator.",
    description: "Silver-blue schooling predator with razor-sharp teeth. Known as Bluefish in USA. Savage strikes and fast runs. Best eating when fresh and bled immediately. Can reach 14kg.",
    techniques: ["Beach fishing", "Rock fishing", "Lure casting", "Trolling"],
    baits: ["Pilchards", "Metal lures", "Poppers", "Soft plastics", "Whitebait"],
    min_size: "30 cm",
    protection: "Bag limit 10-20 per day."
  },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const results: any[] = [];
    for (const fish of FISH) {
      // Check if already exists
      const { data: existing } = await supabase
        .from('fish_species')
        .select('id')
        .eq('name_en', fish.name_en)
        .maybeSingle();

      if (existing) {
        results.push({ name: fish.name_en, status: 'exists', id: existing.id });
        continue;
      }

      const { data, error } = await supabase.from('fish_species').insert({
        name_en: fish.name_en,
        latin_name: fish.latin_name,
        category: fish.category,
        habitat: fish.habitat,
        description: fish.description,
        techniques: fish.techniques,
        baits: fish.baits,
        min_size: fish.min_size,
        protection: fish.protection,
      }).select('id').single();

      results.push({ name: fish.name_en, status: error ? 'error' : 'inserted', id: data?.id, error: error?.message });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
