import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const fish = [
  // Scandinavian & Nordic species
  { name_en: "Cisco (European)", latin_name: "Coregonus albula (Nordic)", category: "freshwater", habitat: "Scandinavian and Baltic lakes", techniques: ["Ice fishing","Fly fishing"], baits: ["Small jigs","Flies","Maggots"] },
  { name_en: "Charr (Scandinavian)", latin_name: "Salvelinus alpinus (Nordic)", category: "freshwater", habitat: "Norwegian and Swedish mountain lakes", techniques: ["Fly fishing","Spinning","Trolling"], baits: ["Spoons","Flies","Worms"] },
  { name_en: "Ferox Trout", latin_name: "Salmo trutta (ferox)", category: "freshwater", habitat: "Deep Scottish and Irish loughs", techniques: ["Trolling","Deadbaiting"], baits: ["Dead fish","Large spoons","Plugs"] },
  { name_en: "Gillaroo", latin_name: "Salmo stomachicus", category: "freshwater", habitat: "Irish loughs, especially Lough Melvin", techniques: ["Fly fishing"], baits: ["Wet flies","Nymphs","Bumbles"] },
  { name_en: "Sonaghan", latin_name: "Salmo nigripinnis", category: "freshwater", habitat: "Lough Melvin, Ireland", techniques: ["Fly fishing"], baits: ["Wet flies","Nymphs"] },
  { name_en: "Sevan Trout", latin_name: "Salmo ischchan", category: "freshwater", habitat: "Lake Sevan, Armenia/Caucasus", techniques: ["Fly fishing","Spinning"], baits: ["Spoons","Nymphs","Worms"] },
  { name_en: "Ohrid Trout", latin_name: "Salmo letnica", category: "freshwater", habitat: "Lake Ohrid, North Macedonia/Albania", techniques: ["Fly fishing","Trolling","Spinning"], baits: ["Spoons","Flies","Worms"] },
  { name_en: "Prespa Trout", latin_name: "Salmo peristericus", category: "freshwater", habitat: "Lake Prespa, North Macedonia/Greece", techniques: ["Fly fishing","Spinning"], baits: ["Flies","Small spoons"] },
  { name_en: "Softmouth Trout", latin_name: "Salmo obtusirostris (soft)", category: "freshwater", habitat: "Adriatic basin: Neretva, Vrljika", techniques: ["Fly fishing"], baits: ["Nymphs","Dry flies"] },
  { name_en: "Danube Trout", latin_name: "Salmo labrax", category: "freshwater", habitat: "Danube tributaries, Black Sea basin", techniques: ["Fly fishing","Spinning"], baits: ["Spinners","Flies","Worms"] },
  // 110 done
  { name_en: "Caspian Trout", latin_name: "Salmo caspius", category: "anadromous", habitat: "Caspian Sea and tributaries", techniques: ["Fly fishing","Spinning"], baits: ["Spoons","Streamers","Worms"] },
  { name_en: "Black Sea Trout", latin_name: "Salmo labrax (Black Sea)", category: "anadromous", habitat: "Black Sea rivers, Caucasus", techniques: ["Fly fishing","Spinning"], baits: ["Streamers","Spoons","Worms"] },
  { name_en: "Alpine Charr", latin_name: "Salvelinus umbla", category: "freshwater", habitat: "Deep Alpine lakes: Geneva, Constance", techniques: ["Trolling","Deep fishing","Fly fishing"], baits: ["Spoons","Nymphs","Small jigs"] },
  { name_en: "Brook Lamprey", latin_name: "Lampetra planeri", category: "freshwater", habitat: "European streams", techniques: ["Not typically angled"], baits: [] },
  { name_en: "River Lamprey", latin_name: "Lampetra fluviatilis", category: "anadromous", habitat: "European rivers, Baltic Sea", techniques: ["Not typically angled"], baits: [] },
  { name_en: "Sea Lamprey", latin_name: "Petromyzon marinus", category: "anadromous", habitat: "Atlantic rivers of Europe", techniques: ["Not typically angled"], baits: [] },
  // Sturgeons
  { name_en: "European Sturgeon", latin_name: "Acipenser sturio", category: "anadromous", habitat: "Atlantic rivers, critically endangered", techniques: ["Protected species"], baits: [] },
  { name_en: "Adriatic Sturgeon", latin_name: "Acipenser naccarii", category: "anadromous", habitat: "Adriatic rivers: Po, Adige", techniques: ["Protected species"], baits: [] },
  { name_en: "Russian Sturgeon", latin_name: "Acipenser gueldenstaedtii", category: "anadromous", habitat: "Black Sea, Caspian Sea rivers", techniques: ["Bottom fishing (where legal)"], baits: ["Worms","Cut fish"] },
  { name_en: "Ship Sturgeon", latin_name: "Acipenser nudiventris", category: "anadromous", habitat: "Caspian and Aral Sea basins", techniques: ["Protected species"], baits: [] },
  // 120 done
  { name_en: "Stellate Sturgeon", latin_name: "Acipenser stellatus", category: "anadromous", habitat: "Black Sea, Caspian Sea, Azov Sea rivers", techniques: ["Protected species"], baits: [] },
  { name_en: "Starry Sturgeon", latin_name: "Acipenser stellatus (starry)", category: "anadromous", habitat: "Danube, Volga, Ural rivers", techniques: ["Protected species"], baits: [] },
  // Iberian endemics
  { name_en: "Iberian Nase", latin_name: "Pseudochondrostoma polylepis", category: "freshwater", habitat: "Iberian rivers: Tagus, Guadiana, Douro", techniques: ["Float fishing"], baits: ["Bread","Worms","Maggots"] },
  { name_en: "Iberian Chub", latin_name: "Squalius pyrenaicus", category: "freshwater", habitat: "Iberian rivers", techniques: ["Float fishing","Spinning"], baits: ["Worms","Bread","Small lures"] },
  { name_en: "Iberian Loach", latin_name: "Cobitis paludica", category: "freshwater", habitat: "Iberian rivers and streams", techniques: ["Light tackle"], baits: ["Small worms"] },
  { name_en: "Calandino", latin_name: "Squalius alburnoides", category: "freshwater", habitat: "Iberian rivers", techniques: ["Micro fishing"], baits: ["Bread","Maggots"] },
  { name_en: "Pardilla", latin_name: "Iberochondrostoma lemmingii", category: "freshwater", habitat: "Iberian rivers: Guadiana, Guadalquivir", techniques: ["Light tackle"], baits: ["Bread","Maggots"] },
  { name_en: "Spanish Toothcarp", latin_name: "Aphanius iberus", category: "freshwater", habitat: "Spanish Mediterranean coastal lagoons", techniques: ["Protected species"], baits: [] },
  // Italian endemics
  { name_en: "Italian Bleak", latin_name: "Alburnus arborella", category: "freshwater", habitat: "Italian rivers and lakes", techniques: ["Float fishing","Light tackle"], baits: ["Maggots","Bread"] },
  { name_en: "Italian Chub", latin_name: "Squalius squalus", category: "freshwater", habitat: "Italian rivers", techniques: ["Float fishing","Spinning"], baits: ["Worms","Bread","Small lures"] },
  // 130 done
  { name_en: "Pigo", latin_name: "Rutilus pigus", category: "freshwater", habitat: "Northern Italian lakes and rivers", techniques: ["Float fishing","Bottom fishing"], baits: ["Worms","Bread","Corn"] },
  { name_en: "Savetta", latin_name: "Chondrostoma soetta", category: "freshwater", habitat: "Po River basin, Italy", techniques: ["Float fishing"], baits: ["Bread","Worms","Algae"] },
  { name_en: "Padanian Goby", latin_name: "Padogobius bonelli", category: "freshwater", habitat: "Italian rivers and streams", techniques: ["Micro fishing"], baits: ["Small worms","Larvae"] },
  { name_en: "Italian Roach", latin_name: "Rutilus aula", category: "freshwater", habitat: "Italian lakes", techniques: ["Float fishing"], baits: ["Maggots","Bread","Worms"] },
  { name_en: "Carpione del Garda", latin_name: "Salmo carpio", category: "freshwater", habitat: "Lake Garda, Italy", techniques: ["Trolling","Deep fishing"], baits: ["Small spoons","Nymphs"] },
  // Balkan & Greek endemics
  { name_en: "Greek Barbel", latin_name: "Barbus albanicus", category: "freshwater", habitat: "Greek and Albanian rivers", techniques: ["Bottom fishing","Float fishing"], baits: ["Worms","Corn","Bread"] },
  { name_en: "Dalmatian Barbelgudgeon", latin_name: "Aulopyge huegelii", category: "freshwater", habitat: "Dalmatian rivers: Cetina, Krka", techniques: ["Light tackle"], baits: ["Worms","Larvae"] },
  { name_en: "Minnow Nase", latin_name: "Pseudochondrostoma genei", category: "freshwater", habitat: "Italian rivers", techniques: ["Light tackle"], baits: ["Bread","Worms"] },
  { name_en: "Macedonian Shad", latin_name: "Alosa macedonica", category: "freshwater", habitat: "Lake Volvi, Greece", techniques: ["Light tackle","Fly fishing"], baits: ["Small flies","Tiny lures"] },
  { name_en: "Allis Shad", latin_name: "Alosa alosa", category: "anadromous", habitat: "Atlantic rivers of Europe", techniques: ["Fly fishing","Spinning"], baits: ["Shad darts","Small spoons","Flies"] },
  // 140 done
  { name_en: "Twaite Shad", latin_name: "Alosa fallax", category: "anadromous", habitat: "Atlantic and Mediterranean rivers", techniques: ["Fly fishing","Spinning"], baits: ["Small spoons","Flies","Shad darts"] },
  { name_en: "Pontic Shad", latin_name: "Alosa immaculata", category: "anadromous", habitat: "Black Sea, Danube River", techniques: ["Spinning","Float fishing"], baits: ["Small lures","Spoons"] },
  { name_en: "Caspian Shad", latin_name: "Alosa braschnikowi", category: "anadromous", habitat: "Caspian Sea and rivers", techniques: ["Spinning"], baits: ["Small spoons","Jigs"] },
  { name_en: "Agone", latin_name: "Alosa agone", category: "freshwater", habitat: "Italian lakes: Como, Garda, Iseo", techniques: ["Light tackle","Trolling"], baits: ["Tiny spoons","Flies"] },
  // Black Sea species
  { name_en: "Black Sea Turbot", latin_name: "Scophthalmus maeoticus", category: "saltwater", habitat: "Black Sea", techniques: ["Bottom fishing","Trolling"], baits: ["Live bait","Fish strips","Shrimp"] },
  { name_en: "Black Sea Whiting", latin_name: "Merlangius merlangus euxinus", category: "saltwater", habitat: "Black Sea", techniques: ["Bottom fishing","Jigging"], baits: ["Shrimp","Worms","Small fish"] },
  { name_en: "Knout Goby", latin_name: "Mesogobius batrachocephalus", category: "saltwater", habitat: "Black Sea, Sea of Azov", techniques: ["Bottom fishing"], baits: ["Worms","Shrimp","Mussel"] },
  { name_en: "Round Goby", latin_name: "Neogobius melanostomus", category: "freshwater", habitat: "Black Sea, Baltic Sea, Danube", techniques: ["Bottom fishing","Light tackle"], baits: ["Worms","Shrimp","Mussel"] },
  { name_en: "Monkey Goby", latin_name: "Neogobius fluviatilis", category: "freshwater", habitat: "Black Sea basin rivers", techniques: ["Bottom fishing"], baits: ["Worms","Shrimp"] },
  { name_en: "Black Sea Sprat", latin_name: "Sprattus sprattus phalericus", category: "saltwater", habitat: "Black Sea", techniques: ["Light tackle","Sabiki"], baits: ["Tiny lures","Bread crumbs"] },
  // 150 done
  // More saltwater Atlantic/Nordic
  { name_en: "Pollack", latin_name: "Pollachius pollachius", category: "saltwater", habitat: "Eastern Atlantic, English Channel", techniques: ["Spinning","Jigging","Trolling"], baits: ["Lures","Live bait","Feathers"] },
  { name_en: "Saithe (Coalfish)", latin_name: "Pollachius virens", category: "saltwater", habitat: "North Atlantic, North Sea, Norwegian coast", techniques: ["Jigging","Spinning","Feathering"], baits: ["Pilkers","Lures","Feathers"] },
  { name_en: "Ling", latin_name: "Molva molva", category: "saltwater", habitat: "North Atlantic, Norwegian coast", techniques: ["Deep sea","Bottom fishing","Wreck fishing"], baits: ["Mackerel","Squid","Fish strips"] },
  { name_en: "Blue Ling", latin_name: "Molva dypterygia", category: "saltwater", habitat: "Deep North Atlantic", techniques: ["Deep sea fishing"], baits: ["Mackerel","Squid"] },
  { name_en: "Tusk (Cusk)", latin_name: "Brosme brosme", category: "saltwater", habitat: "North Atlantic, Norwegian coast", techniques: ["Deep sea","Bottom fishing"], baits: ["Mackerel","Squid","Herring"] },
  { name_en: "Norway Haddock (Redfish)", latin_name: "Sebastes norvegicus", category: "saltwater", habitat: "North Atlantic, Norwegian coast", techniques: ["Deep sea fishing"], baits: ["Shrimp","Cut fish","Jigs"] },
  { name_en: "Wolf-fish", latin_name: "Anarhichas lupus", category: "saltwater", habitat: "North Atlantic, Norwegian coast, Iceland", techniques: ["Bottom fishing","Deep sea"], baits: ["Crab","Mussel","Fish"] },
  { name_en: "Spotted Wolf-fish", latin_name: "Anarhichas minor", category: "saltwater", habitat: "North Atlantic, Arctic waters", techniques: ["Deep sea fishing"], baits: ["Crab","Mussel","Shrimp"] },
  { name_en: "Lumpsucker", latin_name: "Cyclopterus lumpus", category: "saltwater", habitat: "North Atlantic, Baltic Sea", techniques: ["Bottom fishing"], baits: ["Worms","Shrimp","Mussel"] },
  { name_en: "Halibut (Atlantic)", latin_name: "Hippoglossus hippoglossus", category: "saltwater", habitat: "North Atlantic, Norwegian coast", techniques: ["Deep sea","Bottom fishing","Trolling"], baits: ["Live coalfish","Mackerel","Large jigs"] },
  // 160 done
  { name_en: "Greenland Halibut", latin_name: "Reinhardtius hippoglossoides", category: "saltwater", habitat: "North Atlantic, Arctic waters", techniques: ["Deep sea fishing"], baits: ["Fish strips","Squid","Shrimp"] },
  { name_en: "Torsk", latin_name: "Brosme brosme (Nordic)", category: "saltwater", habitat: "Norwegian fjords, North Sea", techniques: ["Deep sea","Wreck fishing"], baits: ["Mackerel","Herring","Squid"] },
  { name_en: "Haddock", latin_name: "Melanogrammus aeglefinus", category: "saltwater", habitat: "North Atlantic, North Sea", techniques: ["Bottom fishing","Wreck fishing"], baits: ["Ragworm","Mussel","Squid","Mackerel"] },
  { name_en: "Whiting", latin_name: "Merlangius merlangus", category: "saltwater", habitat: "Eastern Atlantic, North Sea", techniques: ["Bottom fishing","Float fishing"], baits: ["Ragworm","Lugworm","Fish strips"] },
  { name_en: "Norway Pout", latin_name: "Trisopterus esmarkii", category: "saltwater", habitat: "North Sea, Norwegian coast", techniques: ["Light tackle","Feathering"], baits: ["Small jigs","Shrimp"] },
  { name_en: "Cuckoo Wrasse", latin_name: "Labrus mixtus", category: "saltwater", habitat: "Eastern Atlantic, Mediterranean", techniques: ["Rock fishing","Light tackle"], baits: ["Ragworm","Shrimp","Crab"] },
  { name_en: "Ballan Wrasse", latin_name: "Labrus bergylta", category: "saltwater", habitat: "Eastern Atlantic, British Isles", techniques: ["Rock fishing","Float fishing"], baits: ["Ragworm","Crab","Limpet"] },
  { name_en: "Corkwing Wrasse", latin_name: "Symphodus melops", category: "saltwater", habitat: "Eastern Atlantic", techniques: ["Light tackle","Rock fishing"], baits: ["Ragworm","Shrimp"] },
  { name_en: "Goldsinny Wrasse", latin_name: "Ctenolabrus rupestris", category: "saltwater", habitat: "Eastern Atlantic, Scandinavia", techniques: ["Micro fishing","Light tackle"], baits: ["Ragworm","Small shrimp"] },
  { name_en: "Tub Gurnard", latin_name: "Chelidonichthys lucerna", category: "saltwater", habitat: "Eastern Atlantic, Mediterranean", techniques: ["Bottom fishing"], baits: ["Fish strips","Squid","Ragworm"] },
  // 170 done
  { name_en: "Grey Gurnard", latin_name: "Eutrigla gurnardus", category: "saltwater", habitat: "Eastern Atlantic, North Sea", techniques: ["Bottom fishing"], baits: ["Ragworm","Fish strips","Shrimp"] },
  { name_en: "Red Gurnard", latin_name: "Aspitrigla cuculus", category: "saltwater", habitat: "Eastern Atlantic, Mediterranean", techniques: ["Bottom fishing"], baits: ["Worms","Shrimp","Fish strips"] },
  { name_en: "Streaked Gurnard", latin_name: "Chelidonichthys lastoviza", category: "saltwater", habitat: "Mediterranean, Eastern Atlantic", techniques: ["Bottom fishing"], baits: ["Shrimp","Worms","Cut bait"] },
  { name_en: "Smoothhound Shark", latin_name: "Mustelus mustelus", category: "saltwater", habitat: "Eastern Atlantic, Mediterranean", techniques: ["Bottom fishing","Surf casting"], baits: ["Crab","Squid","Fish"] },
  { name_en: "Starry Smoothhound", latin_name: "Mustelus asterias", category: "saltwater", habitat: "Eastern Atlantic, English Channel", techniques: ["Bottom fishing"], baits: ["Crab","Squid","Fish strips"] },
  { name_en: "Bull Huss (Nursehound)", latin_name: "Scyliorhinus stellaris", category: "saltwater", habitat: "Eastern Atlantic, Mediterranean", techniques: ["Bottom fishing"], baits: ["Mackerel","Squid","Fish"] },
  { name_en: "Lesser Spotted Catshark", latin_name: "Scyliorhinus canicula", category: "saltwater", habitat: "Eastern Atlantic, Mediterranean", techniques: ["Bottom fishing"], baits: ["Fish strips","Squid","Worms"] },
  { name_en: "Tope Shark", latin_name: "Galeorhinus galeus", category: "saltwater", habitat: "Eastern Atlantic, Mediterranean", techniques: ["Bottom fishing","Float fishing"], baits: ["Mackerel","Fish","Squid"] },
  { name_en: "Blue Shark (Atlantic)", latin_name: "Prionace glauca (Atlantic)", category: "saltwater", habitat: "North Atlantic, Mediterranean", techniques: ["Shark fishing","Trolling"], baits: ["Mackerel","Chum","Squid"] },
  { name_en: "Porbeagle Shark", latin_name: "Lamna nasus", category: "saltwater", habitat: "North Atlantic", techniques: ["Shark fishing","Trolling"], baits: ["Mackerel","Pollack","Herring"] },
  // 180 done
  { name_en: "Spurdog", latin_name: "Squalus acanthias", category: "saltwater", habitat: "Eastern Atlantic, North Sea", techniques: ["Bottom fishing","Wreck fishing"], baits: ["Mackerel","Fish strips","Squid"] },
  { name_en: "Thornback Ray", latin_name: "Raja clavata", category: "saltwater", habitat: "Eastern Atlantic, North Sea, Mediterranean", techniques: ["Bottom fishing"], baits: ["Sand eel","Herring","Squid"] },
  { name_en: "Blonde Ray", latin_name: "Raja brachyura", category: "saltwater", habitat: "Eastern Atlantic", techniques: ["Bottom fishing"], baits: ["Mackerel","Sand eel","Squid"] },
  { name_en: "Small-eyed Ray", latin_name: "Raja microocellata", category: "saltwater", habitat: "Eastern Atlantic, English Channel", techniques: ["Bottom fishing"], baits: ["Sand eel","Fish strips"] },
  { name_en: "Spotted Ray", latin_name: "Raja montagui", category: "saltwater", habitat: "Eastern Atlantic", techniques: ["Bottom fishing"], baits: ["Sand eel","Shrimp","Squid"] },
  { name_en: "Undulate Ray", latin_name: "Raja undulata", category: "saltwater", habitat: "Eastern Atlantic, English Channel", techniques: ["Bottom fishing"], baits: ["Sand eel","Fish","Squid"] },
  { name_en: "Common Stingray", latin_name: "Dasyatis pastinaca", category: "saltwater", habitat: "Eastern Atlantic, Mediterranean", techniques: ["Bottom fishing"], baits: ["Fish","Squid","Crab"] },
  { name_en: "Eagle Ray", latin_name: "Myliobatis aquila", category: "saltwater", habitat: "Eastern Atlantic, Mediterranean", techniques: ["Bottom fishing"], baits: ["Crab","Fish","Shrimp"] },
  { name_en: "Electric Ray", latin_name: "Torpedo marmorata", category: "saltwater", habitat: "Eastern Atlantic, Mediterranean", techniques: ["Bottom fishing (bycatch)"], baits: ["Fish","Shrimp"] },
  { name_en: "Cuttlefish", latin_name: "Sepia officinalis", category: "saltwater", habitat: "Eastern Atlantic, Mediterranean", techniques: ["Eging","Jigging"], baits: ["EGI lures","Shrimp","Fish strips"] },
  // 190 done
  { name_en: "Common Octopus", latin_name: "Octopus vulgaris", category: "saltwater", habitat: "Eastern Atlantic, Mediterranean", techniques: ["Jigging","Bottom fishing"], baits: ["Crab","White jigs","Fish"] },
  { name_en: "European Squid", latin_name: "Loligo vulgaris", category: "saltwater", habitat: "Eastern Atlantic, Mediterranean", techniques: ["Eging","Jigging"], baits: ["EGI lures","Shrimp imitations"] },
  // Central European freshwater additions
  { name_en: "Waxdick Sturgeon", latin_name: "Acipenser gueldenstaedtii (Danube)", category: "anadromous", habitat: "Danube River, Black Sea", techniques: ["Bottom fishing (where legal)"], baits: ["Worms","Cut fish"] },
  { name_en: "Barbel (Danube)", latin_name: "Barbus barbus (Danube)", category: "freshwater", habitat: "Danube and tributaries", techniques: ["Bottom fishing","Float fishing","Feeder fishing"], baits: ["Pellets","Corn","Worms","Cheese"] },
  { name_en: "Cactus Roach", latin_name: "Rutilus virgo", category: "freshwater", habitat: "Danube basin", techniques: ["Float fishing"], baits: ["Maggots","Bread","Worms"] },
  { name_en: "Danube Bleak", latin_name: "Chalcalburnus chalcoides", category: "freshwater", habitat: "Danube, Black Sea rivers", techniques: ["Float fishing","Light tackle"], baits: ["Maggots","Bread"] },
  { name_en: "European Catfish (Small)", latin_name: "Silurus glanis (juvenile)", category: "freshwater", habitat: "European rivers and lakes", techniques: ["Bottom fishing","Float fishing"], baits: ["Worms","Liver","Dead bait"] },
  { name_en: "Sabre Carp", latin_name: "Pelecus cultratus (sabre)", category: "freshwater", habitat: "Danube, Volga, Baltic rivers", techniques: ["Spinning","Float fishing"], baits: ["Small lures","Insects"] },
  { name_en: "Whitefin Gudgeon", latin_name: "Romanogobio vladykovi", category: "freshwater", habitat: "Danube basin", techniques: ["Micro fishing"], baits: ["Small worms","Maggots"] },
  { name_en: "Kessler's Gudgeon", latin_name: "Romanogobio kesslerii", category: "freshwater", habitat: "Danube basin rivers", techniques: ["Micro fishing"], baits: ["Worms","Maggots"] },
  // 200 done
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  let inserted = 0;
  for (const f of fish) {
    const { error } = await supabase.from("fish_species").insert({
      name_en: f.name_en,
      latin_name: f.latin_name,
      category: f.category,
      habitat: f.habitat,
      techniques: f.techniques,
      baits: f.baits,
      description: null,
      protection: null,
      min_size: null,
    });
    if (!error) inserted++;
    else if (!error.message.includes("duplicate")) console.error(f.name_en, error.message);
  }

  return new Response(JSON.stringify({ inserted, total: fish.length }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
