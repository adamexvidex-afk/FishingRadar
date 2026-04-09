import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Fish {
  name_en: string;
  latin_name: string;
  category: string;
  habitat: string;
  techniques: string[];
  baits: string[];
  description: string;
}

// European Fish – Batch 3: Saltwater & Coastal species
const europeanFish: Fish[] = [
  // ─── COD FAMILY ───
  { name_en: "Atlantic Cod", latin_name: "Gadus morhua", category: "saltwater", habitat: "North Atlantic, North Sea, Baltic", techniques: ["Bottom fishing","Jigging","Trolling"], baits: ["Lugworm","Ragworm","Mackerel strip","Pirks","Shads"], description: "Europe's most commercially important fish historically. Deep-water predator of cold Atlantic waters." },
  { name_en: "Pollack", latin_name: "Pollachius pollachius", category: "saltwater", habitat: "Atlantic European coasts, wrecks, reefs", techniques: ["Spinning","Trolling","Wreck fishing","Fly fishing"], baits: ["Shads","Plugs","Feathers","Live sandeel"], description: "Powerful predator found around wrecks and reefs. Green-gold flanks. Excellent sport on light tackle." },
  { name_en: "Coalfish (Saithe)", latin_name: "Pollachius virens", category: "saltwater", habitat: "North Atlantic, North Sea, Norwegian coast", techniques: ["Jigging","Spinning","Feathering"], baits: ["Pirks","Shads","Feathers","Mackerel strip"], description: "Dark-backed relative of pollack. Abundant around Scandinavian coasts. Fast-growing predator." },
  { name_en: "Whiting", latin_name: "Merlangius merlangus", category: "saltwater", habitat: "North Sea, Atlantic European shelf", techniques: ["Bottom fishing","Feathering"], baits: ["Ragworm","Lugworm","Fish strip","Squid"], description: "Common North Sea fish. Slender cod relative with dark spot at pectoral fin base." },
  { name_en: "Haddock", latin_name: "Melanogrammus aeglefinus", category: "saltwater", habitat: "North Atlantic, North Sea", techniques: ["Bottom fishing","Jigging"], baits: ["Lugworm","Mussel","Squid","Clam"], description: "Important food fish with distinctive dark lateral line and 'thumbprint' mark behind gill." },
  { name_en: "Ling", latin_name: "Molva molva", category: "saltwater", habitat: "Deep Atlantic wrecks and rocky reefs", techniques: ["Wreck fishing","Bottom fishing"], baits: ["Mackerel fillet","Squid","Pirks","Large shads"], description: "Large elongated cod relative found on deep wrecks. Can exceed 30kg." },
  { name_en: "Tusk (Torsk)", latin_name: "Brosme brosme", category: "saltwater", habitat: "Deep rocky bottoms of North Atlantic", techniques: ["Deep-sea fishing","Bottom fishing"], baits: ["Cut fish","Squid","Mussel"], description: "Deep-water cod relative found off Norwegian coast. Single dorsal fin. Good eating." },
  { name_en: "Poor Cod", latin_name: "Trisopterus minutus", category: "saltwater", habitat: "European Atlantic and Mediterranean coasts", techniques: ["Light bottom fishing"], baits: ["Ragworm","Small strips"], description: "Small cod relative common in European waters. Often caught as bycatch." },
  { name_en: "Pouting (Bib)", latin_name: "Trisopterus luscus", category: "saltwater", habitat: "Atlantic European coasts, wrecks", techniques: ["Bottom fishing","Feathering"], baits: ["Ragworm","Squid","Fish strip"], description: "Coppery cod relative with chin barbel. Common around wrecks and piers." },

  // ─── FLATFISH ───
  { name_en: "European Plaice", latin_name: "Pleuronectes platessa", category: "saltwater", habitat: "North Sea, Atlantic European sandy bottoms", techniques: ["Bottom fishing","Drifting"], baits: ["Ragworm","Lugworm","Squid","Mussel","Razorfish"], description: "Orange-spotted flatfish. Europe's most popular flatfish for anglers. Sandy bottom specialist." },
  { name_en: "European Flounder", latin_name: "Platichthys flesus", category: "saltwater", habitat: "Estuaries, harbors, rivers across Europe", techniques: ["Bottom fishing","Float fishing"], baits: ["Ragworm","Lugworm","Peeler crab","Fish strip"], description: "Flatfish entering fresh water. Common in European estuaries. Hardy and adaptable." },
  { name_en: "Dover Sole", latin_name: "Solea solea", category: "saltwater", habitat: "Atlantic and Mediterranean sandy bottoms", techniques: ["Night fishing","Bottom fishing"], baits: ["Ragworm","Lugworm","Small worms"], description: "Premium eating fish of European coasts. Nocturnal feeder on sandy bottoms." },
  { name_en: "Lemon Sole", latin_name: "Microstomus kitt", category: "saltwater", habitat: "North Sea and Atlantic rocky-sandy mixed ground", techniques: ["Bottom fishing","Drifting"], baits: ["Ragworm","Lugworm","Mussel"], description: "Oval-shaped flatfish despite the name not a true sole. Yellowish-brown with marbled pattern." },
  { name_en: "Dab", latin_name: "Limanda limanda", category: "saltwater", habitat: "North Sea and Atlantic sandy bottoms", techniques: ["Bottom fishing","Drifting"], baits: ["Ragworm","Lugworm","Fish strip"], description: "Common small flatfish of European sandy shores. Rough skin distinguishes from plaice." },
  { name_en: "Turbot", latin_name: "Scophthalmus maximus", category: "saltwater", habitat: "Atlantic and Mediterranean sandy-gravel bottoms", techniques: ["Bottom fishing","Drifting","Live baiting"], baits: ["Live sandeel","Ragworm","Mackerel strip","Small live fish"], description: "Premier European flatfish. Diamond-shaped, scaleless with bony tubercles. Prized table fish." },
  { name_en: "Brill", latin_name: "Scophthalmus rhombus", category: "saltwater", habitat: "Atlantic and Mediterranean sandy bottoms", techniques: ["Bottom fishing","Drifting"], baits: ["Sandeel","Ragworm","Fish strip","Small live fish"], description: "Similar to turbot but smoother with spots. Oval shape. Fine eating fish." },
  { name_en: "Megrim", latin_name: "Lepidorhombus whiffiagonis", category: "saltwater", habitat: "Atlantic European deep water", techniques: ["Deep bottom fishing"], baits: ["Fish strip","Worms"], description: "Deep-water flatfish of Atlantic European shelf. Commercial importance in Spain." },
  { name_en: "Atlantic Halibut", latin_name: "Hippoglossus hippoglossus", category: "saltwater", habitat: "Deep North Atlantic waters, Norwegian coast", techniques: ["Deep-sea fishing","Drift fishing"], baits: ["Large fish baits","Coalfish","Herring","Large shads"], description: "Largest Atlantic flatfish, exceeding 200kg. Powerful fighter. Norway is premier destination." },
  { name_en: "Witch Flounder", latin_name: "Glyptocephalus cynoglossus", category: "saltwater", habitat: "Deep Atlantic European waters", techniques: ["Deep bottom fishing"], baits: ["Worms","Small fish strips"], description: "Deep-water flatfish found on muddy bottoms of Northeast Atlantic." },
  { name_en: "Topknot", latin_name: "Zeugopterus punctatus", category: "saltwater", habitat: "Rocky Atlantic European coasts", techniques: ["Not typically targeted"], baits: ["Small worms"], description: "Small flatfish living on vertical rock faces. Unusual habitat for a flatfish." },

  // ─── SEA BASS & BREAMS ───
  { name_en: "European Sea Bass", latin_name: "Dicentrarchus labrax", category: "saltwater", habitat: "Atlantic and Mediterranean coasts", techniques: ["Spinning","Fly fishing","Bait fishing","Surface lures"], baits: ["Plugs","Soft plastics","Ragworm","Live sandeel","Mackerel strip","Surface lures"], description: "Europe's premier saltwater sport fish. Silver predator of surf, estuaries and rocky shores." },
  { name_en: "Spotted Sea Bass", latin_name: "Dicentrarchus punctatus", category: "saltwater", habitat: "Mediterranean and southern Atlantic coasts", techniques: ["Spinning","Bait fishing"], baits: ["Worms","Shrimp","Small lures"], description: "Spotted relative of European bass. Found in warmer southern European waters." },
  { name_en: "Gilthead Sea Bream", latin_name: "Sparus aurata", category: "saltwater", habitat: "Mediterranean and warm Atlantic coasts", techniques: ["Bottom fishing","Float fishing"], baits: ["Bread","Shrimp","Mussels","Ragworm","Crab"], description: "Premium Mediterranean fish with golden bar between eyes. Powerful jaws crush shellfish." },
  { name_en: "Black Sea Bream", latin_name: "Spondyliosoma cantharus", category: "saltwater", habitat: "Atlantic and Mediterranean rocky coasts", techniques: ["Bottom fishing","Float fishing","Spinning"], baits: ["Ragworm","Squid","Fish strip","Small lures"], description: "Deep-bodied bream of European coasts. Males guard nests. Good sport fish." },
  { name_en: "Red Sea Bream (Pandora)", latin_name: "Pagellus erythrinus", category: "saltwater", habitat: "Mediterranean and warm Atlantic", techniques: ["Bottom fishing","Jigging"], baits: ["Shrimp","Squid","Worms","Small fish"], description: "Pink-red bream of southern European waters. Important sport and commercial fish." },
  { name_en: "Common Dentex", latin_name: "Dentex dentex", category: "saltwater", habitat: "Mediterranean rocky reefs", techniques: ["Spinning","Jigging","Trolling","Live baiting"], baits: ["Live fish","Jigs","Plugs","Soft plastics"], description: "Powerful predatory bream of the Mediterranean. Top sport fish reaching 15kg. Aggressive hunter." },
  { name_en: "White Sea Bream", latin_name: "Diplodus sargus", category: "saltwater", habitat: "Mediterranean and warm Atlantic rocky shores", techniques: ["Float fishing","Bottom fishing","Spinning"], baits: ["Bread","Sea urchin","Shrimp","Crab","Worms"], description: "Distinctive black band on tail. Common Mediterranean shore fish. Popular target for rock fishing." },
  { name_en: "Two-banded Sea Bream", latin_name: "Diplodus vulgaris", category: "saltwater", habitat: "Mediterranean rocky coasts", techniques: ["Float fishing","Bottom fishing"], baits: ["Bread","Shrimp","Worms"], description: "Two dark vertical bands distinguish this common Mediterranean bream." },
  { name_en: "Sharpsnout Sea Bream", latin_name: "Diplodus puntazzo", category: "saltwater", habitat: "Mediterranean rocky and seagrass habitats", techniques: ["Float fishing","Bottom fishing"], baits: ["Bread","Sea urchin","Worms"], description: "Pointed-snout bream with vertical dark bars. Strong fighter for its size." },
  { name_en: "Annular Sea Bream", latin_name: "Diplodus annularis", category: "saltwater", habitat: "Mediterranean seagrass meadows", techniques: ["Float fishing","Light tackle"], baits: ["Bread","Shrimp","Small worms"], description: "Small bream with golden ring on caudal peduncle. Very common in Mediterranean." },
  { name_en: "Zebra Sea Bream", latin_name: "Diplodus cervinus", category: "saltwater", habitat: "Mediterranean and warm Atlantic rocky reefs", techniques: ["Bottom fishing","Float fishing"], baits: ["Sea urchin","Shrimp","Crab"], description: "Striking zebra-striped bream of deeper Mediterranean reefs." },
  { name_en: "Bogue", latin_name: "Boops boops", category: "saltwater", habitat: "Mediterranean and Atlantic European coasts", techniques: ["Float fishing","Light tackle"], baits: ["Bread","Maggots","Shrimp"], description: "Elongated bream with golden lateral stripes. Abundant schooling fish." },
  { name_en: "Salema", latin_name: "Sarpa salpa", category: "saltwater", habitat: "Mediterranean rocky shores with algae", techniques: ["Float fishing"], baits: ["Bread","Dough","Algae"], description: "Golden-striped herbivorous bream. Known to cause hallucinations if eaten in certain seasons." },
  { name_en: "Red Porgy", latin_name: "Pagrus pagrus", category: "saltwater", habitat: "Mediterranean and warm Atlantic deep reefs", techniques: ["Bottom fishing","Jigging"], baits: ["Squid","Shrimp","Cut fish","Jigs"], description: "Pink-red fish of deeper Mediterranean waters. Excellent eating. Important commercial species." },
  { name_en: "Axillary Sea Bream", latin_name: "Pagellus acarne", category: "saltwater", habitat: "Mediterranean and Atlantic", techniques: ["Bottom fishing"], baits: ["Worms","Squid","Shrimp"], description: "Small bream with distinctive dark spot at pectoral fin base." },
  { name_en: "Blackspot Sea Bream", latin_name: "Pagellus bogaraveo", category: "saltwater", habitat: "Atlantic European deep waters", techniques: ["Deep bottom fishing"], baits: ["Squid","Shrimp","Worms"], description: "Deep-water bream with dark spot above gill opening. Important in Azores fishery." },

  // ─── WRASSE ───
  { name_en: "Ballan Wrasse", latin_name: "Labrus bergylta", category: "saltwater", habitat: "Atlantic European rocky coasts", techniques: ["Float fishing","Spinning"], baits: ["Ragworm","Crab","Limpet","Hard-back crab","Prawn"], description: "Europe's largest wrasse, reaching 4kg+. Incredibly variable colors from green to red to spotted." },
  { name_en: "Cuckoo Wrasse", latin_name: "Labrus mixtus", category: "saltwater", habitat: "Atlantic and Mediterranean rocky reefs", techniques: ["Bottom fishing","Float fishing"], baits: ["Ragworm","Worms","Small crab"], description: "Stunningly colorful. Males are blue and orange, females pinkish. Dramatic sex change." },
  { name_en: "Goldsinny Wrasse", latin_name: "Ctenolabrus rupestris", category: "saltwater", habitat: "Atlantic European rocky shores", techniques: ["Light float fishing"], baits: ["Ragworm","Small worms"], description: "Small reddish-brown wrasse with dark spot on caudal peduncle. Common on Atlantic coasts." },
  { name_en: "Rock Cook Wrasse", latin_name: "Centrolabrus exoletus", category: "saltwater", habitat: "Atlantic European kelp forests", techniques: ["Light float fishing"], baits: ["Ragworm","Small crab"], description: "Small wrasse of kelp forests. Variable colors with distinctive banding." },
  { name_en: "Mediterranean Rainbow Wrasse", latin_name: "Coris julis", category: "saltwater", habitat: "Mediterranean rocky and seagrass habitats", techniques: ["Light tackle","Float fishing"], baits: ["Worms","Small shrimp"], description: "Brilliantly colored small wrasse. Males have orange zigzag stripe. Very common in Med." },
  { name_en: "Ornate Wrasse", latin_name: "Thalassoma pavo", category: "saltwater", habitat: "Mediterranean and warm Atlantic rocky reefs", techniques: ["Light tackle"], baits: ["Worms","Small shrimp"], description: "Green and blue patterned wrasse of warm Mediterranean waters. Males spectacularly colored." },
  { name_en: "Brown Wrasse", latin_name: "Labrus merula", category: "saltwater", habitat: "Mediterranean rocky reefs", techniques: ["Float fishing","Bottom fishing"], baits: ["Worms","Crab","Shrimp"], description: "Large Mediterranean wrasse. Dark brown to greenish. Can reach 2kg." },
  { name_en: "Five-spotted Wrasse", latin_name: "Symphodus roissali", category: "saltwater", habitat: "Mediterranean seagrass and rocky habitats", techniques: ["Light tackle"], baits: ["Small worms"], description: "Small wrasse with five dark spots. Common in Mediterranean shallow waters." },
  { name_en: "Grey Wrasse", latin_name: "Symphodus cinereus", category: "saltwater", habitat: "Mediterranean rocky shores", techniques: ["Light tackle"], baits: ["Small worms","Bread"], description: "Small grey wrasse of Mediterranean coastline." },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let inserted = 0;
    const batch = 100;
    for (let i = 0; i < europeanFish.length; i += batch) {
      const chunk = europeanFish.slice(i, i + batch);
      for (const f of chunk) {
        const { error } = await supabase.from("fish_species").insert({ ...f, protection: null, min_size: null });
        if (!error) inserted++;
        else if (!error.message.includes("duplicate")) console.error("Insert error:", error.message);
      }
    }

    return new Response(JSON.stringify({ success: true, inserted, total: europeanFish.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
