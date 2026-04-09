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

// European Fish – Batch 4: More saltwater, sharks, rays, Mediterranean species
const europeanFish: Fish[] = [
  // ─── MACKEREL & TUNA ───
  { name_en: "Atlantic Mackerel", latin_name: "Scomber scombrus", category: "saltwater", habitat: "North Atlantic and Mediterranean", techniques: ["Feathering","Spinning","Float fishing","Trolling"], baits: ["Feathers","Small spinners","Strip baits","Sabiki rigs"], description: "Fast schooling predator. One of Europe's most caught sea fish. Superb eating fresh." },
  { name_en: "Spanish Mackerel (European)", latin_name: "Scomber colias", category: "saltwater", habitat: "Mediterranean and warm Atlantic", techniques: ["Feathering","Spinning","Trolling"], baits: ["Feathers","Small lures","Strip baits"], description: "Also called chub mackerel. Rounder body with spots below lateral line." },
  { name_en: "Atlantic Bonito", latin_name: "Sarda sarda", category: "saltwater", habitat: "Mediterranean and Atlantic European coasts", techniques: ["Trolling","Spinning","Live baiting"], baits: ["Small fish","Feathers","Plugs","Metal lures"], description: "Fast tuna relative with oblique stripes on back. Powerful fighter on light tackle." },
  { name_en: "Bluefin Tuna", latin_name: "Thunnus thynnus", category: "saltwater", habitat: "Mediterranean and Atlantic", techniques: ["Trolling","Live baiting","Spinning","Popping"], baits: ["Live mackerel","Sardines","Large lures","Poppers"], description: "Giant of European seas reaching 600kg+. Mediterranean is key breeding ground." },
  { name_en: "Albacore Tuna", latin_name: "Thunnus alalunga", category: "saltwater", habitat: "Atlantic European waters, Bay of Biscay", techniques: ["Trolling","Jigging","Live baiting"], baits: ["Feathers","Cedar plugs","Live bait fish"], description: "Long-finned tuna found in warmer European Atlantic waters." },
  { name_en: "Little Tunny", latin_name: "Euthynnus alletteratus", category: "saltwater", habitat: "Mediterranean and warm Atlantic", techniques: ["Trolling","Spinning","Jigging"], baits: ["Small lures","Feathers","Live bait"], description: "Small tuna common in Mediterranean. Wavy pattern on back. Fast and aggressive." },
  { name_en: "Atlantic Bluefin (Mediterranean)", latin_name: "Thunnus thynnus (Med. pop.)", category: "saltwater", habitat: "Mediterranean Sea", techniques: ["Trolling","Popping","Jigging"], baits: ["Large poppers","Stickbaits","Live bait"], description: "Mediterranean population is crucial breeding stock. Catch and release increasingly practiced." },

  // ─── MULLET ───
  { name_en: "Thick-lipped Grey Mullet", latin_name: "Chelon labrosus", category: "saltwater", habitat: "Atlantic and Mediterranean harbors, estuaries", techniques: ["Float fishing","Fly fishing","Spinning"], baits: ["Bread","Maggots","Ragworm","Small flies","Madeira cake"], description: "One of Europe's most challenging sport fish. Incredibly wary. Thick upper lip." },
  { name_en: "Thin-lipped Grey Mullet", latin_name: "Chelon ramada", category: "saltwater", habitat: "Atlantic and Mediterranean estuaries", techniques: ["Float fishing","Fly fishing"], baits: ["Bread","Maggots","Tiny baits"], description: "Slimmer and more silvery than thick-lipped. Enters fresh water more readily." },
  { name_en: "Golden Grey Mullet", latin_name: "Chelon auratus", category: "saltwater", habitat: "Atlantic and Mediterranean coasts", techniques: ["Float fishing"], baits: ["Bread","Maggots","Small worms"], description: "Golden cheek patches distinguish this mullet. Common in surf zones and harbors." },
  { name_en: "Flathead Grey Mullet", latin_name: "Mugil cephalus", category: "saltwater", habitat: "Mediterranean and warm Atlantic", techniques: ["Float fishing","Net fishing"], baits: ["Bread","Dough","Algae"], description: "Largest European mullet species. Flat head and robust body. Jumps frequently." },

  // ─── SHARKS ───
  { name_en: "Blue Shark", latin_name: "Prionace glauca", category: "saltwater", habitat: "Open Atlantic European waters", techniques: ["Shark fishing","Drift fishing"], baits: ["Mackerel","Rubby dubby","Whole fish"], description: "Most common European pelagic shark. Elegant blue predator. Popular catch-and-release target." },
  { name_en: "Porbeagle Shark", latin_name: "Lamna nasus", category: "saltwater", habitat: "North Atlantic, North Sea, Irish waters", techniques: ["Shark fishing","Drift fishing"], baits: ["Whole mackerel","Rubby dubby","Fish fillets"], description: "Powerful cold-water shark. Stocky body with conical snout. Protected in EU waters." },
  { name_en: "Shortfin Mako Shark", latin_name: "Isurus oxyrinchus", category: "saltwater", habitat: "Atlantic European deep waters", techniques: ["Shark fishing","Trolling"], baits: ["Whole fish","Large lures"], description: "Fastest shark species. Found in warmer Atlantic European waters. Endangered." },
  { name_en: "Thresher Shark", latin_name: "Alopias vulpinus", category: "saltwater", habitat: "Atlantic and Mediterranean", techniques: ["Shark fishing"], baits: ["Whole mackerel","Fish baits"], description: "Distinctive long tail used to stun prey. Spectacular leaps when hooked." },
  { name_en: "Tope Shark", latin_name: "Galeorhinus galeus", category: "saltwater", habitat: "Atlantic European coasts", techniques: ["Bottom fishing","Drift fishing"], baits: ["Mackerel","Fish baits","Squid"], description: "Sleek coastal shark. Popular UK catch-and-release species. Can reach 30kg." },
  { name_en: "Spurdog", latin_name: "Squalus acanthias", category: "saltwater", habitat: "North Atlantic and North Sea", techniques: ["Bottom fishing","Drift fishing"], baits: ["Mackerel","Fish strip","Squid"], description: "Small shark with dorsal spines. Once abundant, now critically endangered in NE Atlantic." },
  { name_en: "Lesser Spotted Catshark", latin_name: "Scyliorhinus canicula", category: "saltwater", habitat: "Atlantic and Mediterranean coasts", techniques: ["Bottom fishing"], baits: ["Fish strip","Squid","Ragworm","Mackerel"], description: "Europe's most common small shark. Sandy-spotted pattern. Common catch from boats and shore." },
  { name_en: "Greater Spotted Catshark", latin_name: "Scyliorhinus stellaris", category: "saltwater", habitat: "Atlantic and Mediterranean rocky reefs", techniques: ["Bottom fishing"], baits: ["Mackerel","Squid","Whole fish"], description: "Larger relative of lesser spotted. Bigger spots. Nocturnal reef predator." },
  { name_en: "Smooth-hound", latin_name: "Mustelus mustelus", category: "saltwater", habitat: "Atlantic European coasts", techniques: ["Bottom fishing","Beach casting"], baits: ["Peeler crab","Hermit crab","Ragworm","Squid"], description: "Crab-crushing shark of European coasts. Smooth teeth for shell crushing. Popular UK species." },
  { name_en: "Starry Smooth-hound", latin_name: "Mustelus asterias", category: "saltwater", habitat: "Northeast Atlantic coasts", techniques: ["Bottom fishing","Beach casting"], baits: ["Crab","Ragworm","Squid"], description: "White-spotted smooth-hound. Common on UK and northern European coasts." },
  { name_en: "Angel Shark", latin_name: "Squatina squatina", category: "saltwater", habitat: "Atlantic and Mediterranean (very rare)", techniques: ["Protected - not fished"], baits: ["N/A"], description: "Critically endangered flat shark. Once common, now one of Europe's rarest fish." },

  // ─── RAYS & SKATES ───
  { name_en: "Thornback Ray", latin_name: "Raja clavata", category: "saltwater", habitat: "Atlantic and Mediterranean sandy/muddy bottoms", techniques: ["Bottom fishing","Beach casting"], baits: ["Ragworm","Squid","Herring","Mackerel","Peeler crab"], description: "Europe's most common ray. Thorny back and tail. Popular shore and boat target." },
  { name_en: "Spotted Ray", latin_name: "Raja montagui", category: "saltwater", habitat: "Northeast Atlantic sandy bottoms", techniques: ["Bottom fishing"], baits: ["Ragworm","Squid","Fish strip"], description: "Small ray with dark spots on upper surface. Common in UK and Irish waters." },
  { name_en: "Small-eyed Ray", latin_name: "Raja microocellata", category: "saltwater", habitat: "Southwest UK and Atlantic French coasts", techniques: ["Bottom fishing","Beach casting"], baits: ["Ragworm","Sandeel","Fish strip"], description: "Restricted range ray. Sandy coloring with wavy lines. Found on clean sand." },
  { name_en: "Undulate Ray", latin_name: "Raja undulata", category: "saltwater", habitat: "Atlantic European coasts", techniques: ["Bottom fishing"], baits: ["Squid","Ragworm","Fish strip"], description: "Beautiful wavy patterned ray. Protected in many areas due to declining numbers." },
  { name_en: "Blonde Ray", latin_name: "Raja brachyura", category: "saltwater", habitat: "Atlantic European sandy bottoms", techniques: ["Bottom fishing","Beach casting"], baits: ["Mackerel","Squid","Sandeel","Ragworm"], description: "Large ray with numerous small spots extending to wing margins. Can exceed 15kg." },
  { name_en: "Common Skate", latin_name: "Dipturus batis", category: "saltwater", habitat: "Deep Atlantic European waters", techniques: ["Bottom fishing"], baits: ["Large fish baits","Mackerel","Coalfish"], description: "Largest European ray reaching 100kg+. Now split into two species. Critically endangered." },
  { name_en: "Cuckoo Ray", latin_name: "Leucoraja naevus", category: "saltwater", habitat: "Atlantic European shelf waters", techniques: ["Bottom fishing"], baits: ["Ragworm","Squid","Fish strip"], description: "Attractive ray with distinctive eyespot markings on wings. Common on mixed ground." },
  { name_en: "Electric Ray (Torpedo)", latin_name: "Torpedo marmorata", category: "saltwater", habitat: "Mediterranean and Atlantic sandy bottoms", techniques: ["Not typically targeted"], baits: ["N/A"], description: "Ray capable of producing electric shocks up to 200 volts. Marbled pattern." },
  { name_en: "Common Stingray", latin_name: "Dasyatis pastinaca", category: "saltwater", habitat: "Mediterranean and Atlantic shallow waters", techniques: ["Bottom fishing"], baits: ["Ragworm","Fish strip","Squid"], description: "Venomous barbed tail. Found on sandy bottoms of warmer European waters." },
  { name_en: "Eagle Ray", latin_name: "Myliobatis aquila", category: "saltwater", habitat: "Mediterranean and warm Atlantic", techniques: ["Bottom fishing"], baits: ["Crab","Shellfish","Squid"], description: "Elegant ray with pointed wings. Powerful swimmer often seen in schools." },

  // ─── GARFISH & NEEDLEFISH ───
  { name_en: "Garfish", latin_name: "Belone belone", category: "saltwater", habitat: "Atlantic and Mediterranean surface waters", techniques: ["Float fishing","Spinning","Fly fishing"], baits: ["Strip bait","Small spinners","Mackerel strip","Flies"], description: "Long-beaked surface predator with green bones. Fast and acrobatic when hooked." },
  { name_en: "Short-beaked Garfish", latin_name: "Belone svetovidovi", category: "saltwater", habitat: "Mediterranean Sea", techniques: ["Float fishing","Spinning"], baits: ["Small strip baits","Lures"], description: "Mediterranean garfish species with shorter beak." },

  // ─── GURNARD ───
  { name_en: "Tub Gurnard", latin_name: "Chelidonichthys lucerna", category: "saltwater", habitat: "Atlantic and Mediterranean sandy/muddy bottoms", techniques: ["Bottom fishing","Drifting"], baits: ["Ragworm","Squid","Fish strip","Mackerel"], description: "Largest European gurnard. Spectacular blue pectoral fin edges. Walks on sea floor with fin rays." },
  { name_en: "Red Gurnard", latin_name: "Chelidonichthys cuculus", category: "saltwater", habitat: "Atlantic and Mediterranean", techniques: ["Bottom fishing"], baits: ["Ragworm","Squid","Strip bait"], description: "Bright red gurnard with distinctive croaking sounds. Common on mixed ground." },
  { name_en: "Grey Gurnard", latin_name: "Eutrigla gurnardus", category: "saltwater", habitat: "North Sea and Atlantic coasts", techniques: ["Bottom fishing"], baits: ["Ragworm","Fish strip","Squid"], description: "Most common gurnard in northern European waters. Grey with white spots." },
  { name_en: "Streaked Gurnard", latin_name: "Chelidonichthys lastoviza", category: "saltwater", habitat: "Mediterranean and warm Atlantic", techniques: ["Bottom fishing"], baits: ["Worms","Squid","Shrimp"], description: "Striped gurnard of southern European waters." },

  // ─── JOHN DORY & SUNFISH ───
  { name_en: "John Dory", latin_name: "Zeus faber", category: "saltwater", habitat: "Atlantic and Mediterranean", techniques: ["Bottom fishing","Jigging"], baits: ["Live small fish","Squid","Fish strip"], description: "Distinctive compressed body with large dark spot. Stalks prey with extendable mouth. Excellent eating." },
  { name_en: "Ocean Sunfish", latin_name: "Mola mola", category: "saltwater", habitat: "Atlantic and Mediterranean open waters", techniques: ["Not targeted"], baits: ["N/A"], description: "Largest bony fish in European waters. Bizarre truncated shape. Feeds on jellyfish." },

  // ─── CONGER & MORAY ───
  { name_en: "Conger Eel", latin_name: "Conger conger", category: "saltwater", habitat: "Atlantic and Mediterranean wrecks, rocky reefs", techniques: ["Wreck fishing","Rock fishing","Night fishing"], baits: ["Mackerel fillet","Squid","Whole fish","Cuttlefish"], description: "Massive marine eel reaching 3m and 60kg. Powerful jaws. Lurks in wrecks and crevices." },
  { name_en: "Mediterranean Moray", latin_name: "Muraena helena", category: "saltwater", habitat: "Mediterranean rocky reefs and crevices", techniques: ["Rock fishing","Night fishing"], baits: ["Squid","Fish","Octopus"], description: "Iconic Mediterranean predator. Dark with golden marbling. Sharp teeth. Nocturnal hunter." },
  { name_en: "Fangtooth Moray", latin_name: "Enchelycore anatina", category: "saltwater", habitat: "Mediterranean and warm Atlantic rocky reefs", techniques: ["Not typically targeted"], baits: ["N/A"], description: "Striking yellow and brown moray with protruding teeth. Found in deeper rocky habitats." },

  // ─── GROUPER ───
  { name_en: "Dusky Grouper", latin_name: "Epinephelus marginatus", category: "saltwater", habitat: "Mediterranean rocky reefs", techniques: ["Bottom fishing","Jigging","Spearfishing"], baits: ["Live fish","Squid","Large jigs","Cut bait"], description: "Iconic Mediterranean reef predator. Large, territorial, long-lived. Protected in many areas." },
  { name_en: "White Grouper", latin_name: "Epinephelus aeneus", category: "saltwater", habitat: "Mediterranean and warm Atlantic", techniques: ["Bottom fishing","Jigging"], baits: ["Live fish","Squid","Cut bait"], description: "Large grouper of southern Mediterranean. Important commercial species." },
  { name_en: "Goldblotch Grouper", latin_name: "Epinephelus costae", category: "saltwater", habitat: "Mediterranean rocky reefs", techniques: ["Bottom fishing","Jigging"], baits: ["Live fish","Squid"], description: "Golden-spotted grouper of Mediterranean deep reefs." },

  // ─── MISC MARINE ───
  { name_en: "Greater Weever", latin_name: "Trachinus draco", category: "saltwater", habitat: "Atlantic and Mediterranean sandy bottoms", techniques: ["Bottom fishing"], baits: ["Ragworm","Fish strip"], description: "Venomous dorsal spines cause extremely painful stings. Buried in sand. Handle with extreme care." },
  { name_en: "Lesser Weever", latin_name: "Echiichthys vipera", category: "saltwater", habitat: "European sandy beaches and shallows", techniques: ["Not typically targeted"], baits: ["N/A"], description: "Small venomous fish buried in shallow sand. Most common cause of fish stings in Europe." },
  { name_en: "Red Scorpionfish", latin_name: "Scorpaena scrofa", category: "saltwater", habitat: "Mediterranean rocky reefs", techniques: ["Bottom fishing","Jigging"], baits: ["Fish strip","Squid","Shrimp","Worms"], description: "Large venomous scorpionfish. Masters of camouflage. Prized for bouillabaisse." },
  { name_en: "Black Scorpionfish", latin_name: "Scorpaena porcus", category: "saltwater", habitat: "Mediterranean and Atlantic rocky habitats", techniques: ["Bottom fishing"], baits: ["Worms","Shrimp","Small fish"], description: "Smaller scorpionfish. Excellent camouflage on rocky bottoms. Venomous spines." },
  { name_en: "European Barracuda", latin_name: "Sphyraena sphyraena", category: "saltwater", habitat: "Mediterranean and warm Atlantic", techniques: ["Spinning","Trolling","Live baiting"], baits: ["Plugs","Metal lures","Live small fish","Soft plastics"], description: "European barracuda. Smaller than tropical species but fast and aggressive predator." },
  { name_en: "Greater Amberjack", latin_name: "Seriola dumerili", category: "saltwater", habitat: "Mediterranean and warm Atlantic", techniques: ["Jigging","Live baiting","Trolling","Popping"], baits: ["Large jigs","Live bait fish","Poppers","Stickbaits"], description: "Powerful pelagic predator. Europe's best light-tackle gamefish. Brutal runs and endurance." },
  { name_en: "Leerfish (Garrick)", latin_name: "Lichia amia", category: "saltwater", habitat: "Mediterranean and warm Atlantic", techniques: ["Spinning","Trolling","Live baiting"], baits: ["Plugs","Live mullet","Metal lures","Poppers"], description: "Fast, powerful jack species. Spectacular surface strikes. Premier Mediterranean sport fish." },
  { name_en: "Pilot Fish", latin_name: "Naucrates ductor", category: "saltwater", habitat: "Mediterranean and Atlantic open water", techniques: ["Not typically targeted"], baits: ["Small lures"], description: "Follows large sharks and ocean sunfish. Distinctive dark vertical bands." },
  { name_en: "Atlantic Horse Mackerel", latin_name: "Trachurus trachurus", category: "saltwater", habitat: "Atlantic and Mediterranean", techniques: ["Feathering","Float fishing","Jigging"], baits: ["Feathers","Small jigs","Fish strips","Maggots"], description: "Also called scad. Abundant schooling fish. Important forage and commercial species." },
  { name_en: "Mediterranean Horse Mackerel", latin_name: "Trachurus mediterraneus", category: "saltwater", habitat: "Mediterranean Sea", techniques: ["Feathering","Light tackle"], baits: ["Feathers","Small jigs"], description: "Mediterranean counterpart of Atlantic horse mackerel." },
  { name_en: "Bluefish (European)", latin_name: "Pomatomus saltatrix", category: "saltwater", habitat: "Mediterranean and warm Atlantic", techniques: ["Spinning","Trolling","Shore casting"], baits: ["Metal lures","Plugs","Live fish","Cut bait"], description: "Aggressive pelagic predator. Sharp teeth, voracious feeder. Can reach 10kg+ in Mediterranean." },
  { name_en: "Swordfish", latin_name: "Xiphias gladius", category: "saltwater", habitat: "Mediterranean and Atlantic", techniques: ["Deep trolling","Drift fishing","Night fishing"], baits: ["Squid","Mackerel","Specialized deep baits"], description: "Magnificent billfish of European waters. Mediterranean is important breeding area." },
  { name_en: "Atlantic Sailfish", latin_name: "Istiophorus albicans", category: "saltwater", habitat: "Warm Atlantic, rare in European waters", techniques: ["Trolling","Live baiting"], baits: ["Live bait fish","Large lures"], description: "Occasionally found in European Atlantic. Spectacular dorsal sail and speed." },
  { name_en: "Cuttlefish", latin_name: "Sepia officinalis", category: "saltwater", habitat: "Mediterranean and Atlantic coastal waters", techniques: ["Squid jig","Eging","Float fishing"], baits: ["Squid jigs","EGI lures","Live prawns"], description: "Not a fish but widely targeted by European anglers. Ink defense. Masters of camouflage." },
  { name_en: "European Squid", latin_name: "Loligo vulgaris", category: "saltwater", habitat: "Atlantic and Mediterranean", techniques: ["Eging","Squid jigging","Night fishing"], baits: ["Squid jigs (EGI)","Luminous lures"], description: "Popular eging target. Night fishing with lights very productive. Important bait species." },
  { name_en: "Common Octopus", latin_name: "Octopus vulgaris", category: "saltwater", habitat: "Mediterranean and Atlantic rocky habitats", techniques: ["Octopus pot","Shore fishing"], baits: ["Crab","White lures","Fish"], description: "Intelligent cephalopod widely caught in Mediterranean. Traditional pot fishing." },
  { name_en: "Sea Trout (Mediterranean)", latin_name: "Salmo trutta (Med. anadromous)", category: "anadromous", habitat: "Mediterranean rivers and coast", techniques: ["Fly fishing","Spinning"], baits: ["Flies","Spinners","Spoons"], description: "Mediterranean population of sea trout. Found in Adriatic and Tyrrhenian river systems." },
  { name_en: "European Hake", latin_name: "Merluccius merluccius", category: "saltwater", habitat: "Atlantic and Mediterranean deep waters", techniques: ["Bottom fishing","Jigging"], baits: ["Sardine","Squid","Fish strip"], description: "Important commercial fish of European seas. Large mouth, silver body. Deep water predator." },
  { name_en: "Forkbeard", latin_name: "Phycis phycis", category: "saltwater", habitat: "Mediterranean and Atlantic rocky reefs", techniques: ["Bottom fishing"], baits: ["Squid","Cut fish","Shrimp"], description: "Deep-bodied fish with long pelvic fin rays. Found on rocky reefs and wrecks." },
  { name_en: "Comber", latin_name: "Serranus cabrilla", category: "saltwater", habitat: "Mediterranean and Atlantic rocky reefs", techniques: ["Light bottom fishing","Float fishing"], baits: ["Worms","Shrimp","Small fish strip"], description: "Small colorful seabass relative with vertical bars. Simultaneous hermaphrodite." },
  { name_en: "Painted Comber", latin_name: "Serranus scriba", category: "saltwater", habitat: "Mediterranean rocky reefs and seagrass", techniques: ["Light tackle","Float fishing"], baits: ["Worms","Small shrimp"], description: "Beautifully marked small predator. Blue 'writing' marks on head gave it the name 'scriba'." },
  { name_en: "Red Mullet", latin_name: "Mullus barbatus", category: "saltwater", habitat: "Mediterranean and Atlantic sandy/muddy bottoms", techniques: ["Bottom fishing","Float fishing"], baits: ["Ragworm","Small worms","Shrimp"], description: "Two barbels under chin probe sand for food. Valued table fish. Turns red when caught." },
  { name_en: "Surmullet", latin_name: "Mullus surmuletus", category: "saltwater", habitat: "Mediterranean and Atlantic coasts", techniques: ["Bottom fishing","Float fishing"], baits: ["Ragworm","Shrimp","Small worms"], description: "Striped red mullet. Prized in Mediterranean cuisine. Two sensory barbels under chin." },
  { name_en: "European Seabass (Shore)", latin_name: "Dicentrarchus labrax", category: "saltwater", habitat: "Atlantic surf zones, rocky shores, estuaries", techniques: ["Surface lure fishing","Float fishing","Spinning"], baits: ["Surface plugs","Soft plastics","Live prawn","Sandeel"], description: "Shore-caught bass from surf, rocks and estuaries. Premier European shore sport fish." },
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
