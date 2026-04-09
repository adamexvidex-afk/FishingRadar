import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const fish = [
  // Mediterranean & Atlantic marine species
  { name_en: "Annular Sea Bream", latin_name: "Diplodus annularis", category: "saltwater", habitat: "Mediterranean, Eastern Atlantic coastal waters", techniques: ["Bottom fishing","Light tackle"], baits: ["Shrimp","Worms","Bread"] },
  { name_en: "Axillary Sea Bream", latin_name: "Pagellus acarne", category: "saltwater", habitat: "Mediterranean, Eastern Atlantic", techniques: ["Bottom fishing"], baits: ["Worms","Shrimp","Squid"] },
  { name_en: "Bogue", latin_name: "Boops boops", category: "saltwater", habitat: "Mediterranean, Eastern Atlantic", techniques: ["Float fishing","Light tackle"], baits: ["Bread","Worms","Shrimp"] },
  { name_en: "Brown Meagre", latin_name: "Sciaena umbra", category: "saltwater", habitat: "Mediterranean, Black Sea", techniques: ["Bottom fishing","Spinning"], baits: ["Shrimp","Crab","Cut fish"] },
  { name_en: "Comber", latin_name: "Serranus cabrilla", category: "saltwater", habitat: "Mediterranean, Eastern Atlantic", techniques: ["Bottom fishing","Light tackle"], baits: ["Worms","Shrimp","Small fish"] },
  { name_en: "Painted Comber", latin_name: "Serranus scriba", category: "saltwater", habitat: "Mediterranean, Eastern Atlantic", techniques: ["Bottom fishing","Jigging"], baits: ["Worms","Shrimp","Cut bait"] },
  { name_en: "Dusky Grouper", latin_name: "Epinephelus marginatus", category: "saltwater", habitat: "Mediterranean, Eastern Atlantic", techniques: ["Bottom fishing","Jigging","Spearfishing"], baits: ["Live bait","Squid","Octopus"] },
  { name_en: "Golden Grouper", latin_name: "Epinephelus costae", category: "saltwater", habitat: "Mediterranean", techniques: ["Bottom fishing","Jigging"], baits: ["Live fish","Squid","Octopus"] },
  { name_en: "White Grouper", latin_name: "Epinephelus aeneus", category: "saltwater", habitat: "Eastern Atlantic, Mediterranean", techniques: ["Bottom fishing","Trolling"], baits: ["Live bait","Squid","Cut fish"] },
  { name_en: "Forkbeard", latin_name: "Phycis phycis", category: "saltwater", habitat: "Mediterranean, Eastern Atlantic", techniques: ["Bottom fishing","Deep sea"], baits: ["Squid","Sardine","Shrimp"] },
  { name_en: "Red Bandfish", latin_name: "Cepola macrophthalma", category: "saltwater", habitat: "Mediterranean, Eastern Atlantic", techniques: ["Bottom fishing"], baits: ["Worms","Small shrimp"] },
  { name_en: "Shi Drum", latin_name: "Umbrina cirrosa", category: "saltwater", habitat: "Mediterranean, Black Sea, Eastern Atlantic", techniques: ["Surf casting","Bottom fishing"], baits: ["Crab","Shrimp","Worms"] },
  { name_en: "European Barracuda", latin_name: "Sphyraena sphyraena", category: "saltwater", habitat: "Mediterranean, Eastern Atlantic", techniques: ["Trolling","Spinning","Casting"], baits: ["Lures","Live bait","Spoons"] },
  { name_en: "Atlantic Bonito", latin_name: "Sarda sarda", category: "saltwater", habitat: "Mediterranean, Atlantic", techniques: ["Trolling","Casting","Jigging"], baits: ["Lures","Live bait","Feathers"] },
  { name_en: "Little Tunny", latin_name: "Euthynnus alletteratus", category: "saltwater", habitat: "Mediterranean, Atlantic", techniques: ["Trolling","Casting","Jigging"], baits: ["Lures","Live bait","Spoons"] },
  { name_en: "Atlantic Horse Mackerel", latin_name: "Trachurus trachurus", category: "saltwater", habitat: "Eastern Atlantic, Mediterranean, North Sea", techniques: ["Float fishing","Jigging","Feathering"], baits: ["Small lures","Feathers","Mackerel strips"] },
  { name_en: "Mediterranean Horse Mackerel", latin_name: "Trachurus mediterraneus", category: "saltwater", habitat: "Mediterranean, Black Sea", techniques: ["Float fishing","Jigging"], baits: ["Small lures","Feathers","Strips"] },
  { name_en: "Salema", latin_name: "Sarpa salpa", category: "saltwater", habitat: "Mediterranean, Eastern Atlantic", techniques: ["Float fishing"], baits: ["Bread","Algae","Dough"] },
  { name_en: "Saddled Sea Bream", latin_name: "Oblada melanura", category: "saltwater", habitat: "Mediterranean, Eastern Atlantic", techniques: ["Float fishing","Light tackle"], baits: ["Bread","Shrimp","Worms"] },
  { name_en: "Red Mullet", latin_name: "Mullus barbatus", category: "saltwater", habitat: "Mediterranean, Black Sea, Eastern Atlantic", techniques: ["Bottom fishing"], baits: ["Worms","Shrimp","Mussel"] },
  { name_en: "Striped Red Mullet", latin_name: "Mullus surmuletus", category: "saltwater", habitat: "Mediterranean, Eastern Atlantic, North Sea", techniques: ["Bottom fishing","Light tackle"], baits: ["Ragworm","Shrimp","Mussel"] },
  { name_en: "Picarel", latin_name: "Spicara smaris", category: "saltwater", habitat: "Mediterranean, Black Sea", techniques: ["Float fishing","Light tackle"], baits: ["Shrimp","Worms","Bread"] },
  { name_en: "Greater Weever", latin_name: "Trachinus draco", category: "saltwater", habitat: "Mediterranean, Eastern Atlantic, North Sea", techniques: ["Bottom fishing"], baits: ["Worms","Shrimp","Sand eel"] },
  { name_en: "Lesser Weever", latin_name: "Echiichthys vipera", category: "saltwater", habitat: "Eastern Atlantic, Mediterranean, North Sea", techniques: ["Bottom fishing"], baits: ["Worms","Shrimp"] },
  { name_en: "Stargazer", latin_name: "Uranoscopus scaber", category: "saltwater", habitat: "Mediterranean, Eastern Atlantic", techniques: ["Bottom fishing"], baits: ["Live bait","Worms","Shrimp"] },
  { name_en: "European Conger", latin_name: "Conger conger", category: "saltwater", habitat: "Eastern Atlantic, Mediterranean, North Sea", techniques: ["Bottom fishing","Wreck fishing"], baits: ["Mackerel","Squid","Fish strips"] },
  { name_en: "Moray Eel", latin_name: "Muraena helena", category: "saltwater", habitat: "Mediterranean, Eastern Atlantic", techniques: ["Bottom fishing","Rock fishing"], baits: ["Fish","Octopus","Squid"] },
  { name_en: "European Hake", latin_name: "Merluccius merluccius", category: "saltwater", habitat: "Eastern Atlantic, Mediterranean", techniques: ["Bottom fishing","Deep sea","Trolling"], baits: ["Sardine","Squid","Shrimp"] },
  { name_en: "Poor Cod", latin_name: "Trisopterus minutus", category: "saltwater", habitat: "Eastern Atlantic, Mediterranean", techniques: ["Bottom fishing","Light tackle"], baits: ["Worms","Shrimp","Small strips"] },
  { name_en: "Pouting", latin_name: "Trisopterus luscus", category: "saltwater", habitat: "Eastern Atlantic, North Sea", techniques: ["Bottom fishing"], baits: ["Worms","Shrimp","Squid"] },
  // 30 done
  { name_en: "Black Scorpionfish", latin_name: "Scorpaena porcus", category: "saltwater", habitat: "Mediterranean, Black Sea, Eastern Atlantic", techniques: ["Bottom fishing","Rock fishing"], baits: ["Shrimp","Worms","Small fish"] },
  { name_en: "Red Scorpionfish", latin_name: "Scorpaena scrofa", category: "saltwater", habitat: "Mediterranean, Eastern Atlantic", techniques: ["Bottom fishing","Rock fishing"], baits: ["Live bait","Shrimp","Cut fish"] },
  { name_en: "European John Dory", latin_name: "Zeus faber", category: "saltwater", habitat: "Eastern Atlantic, Mediterranean", techniques: ["Bottom fishing","Jigging"], baits: ["Live bait","Shrimp","Small fish"] },
  { name_en: "Atlantic Mackerel", latin_name: "Scomber scombrus", category: "saltwater", habitat: "North Atlantic, Mediterranean, North Sea", techniques: ["Feathering","Spinning","Float fishing"], baits: ["Feathers","Lures","Strip bait"] },
  { name_en: "Garfish", latin_name: "Belone belone", category: "saltwater", habitat: "Eastern Atlantic, Mediterranean, Baltic Sea", techniques: ["Float fishing","Spinning"], baits: ["Fish strips","Small lures","Bread"] },
  { name_en: "Thick-lipped Grey Mullet", latin_name: "Chelon labrosus", category: "saltwater", habitat: "Eastern Atlantic, Mediterranean", techniques: ["Float fishing","Fly fishing"], baits: ["Bread","Ragworm","Maggots"] },
  { name_en: "Thin-lipped Grey Mullet", latin_name: "Liza ramada", category: "saltwater", habitat: "Eastern Atlantic, Mediterranean", techniques: ["Float fishing"], baits: ["Bread","Worms","Dough"] },
  { name_en: "Golden Grey Mullet", latin_name: "Liza aurata", category: "saltwater", habitat: "Eastern Atlantic, Mediterranean, Black Sea", techniques: ["Float fishing","Spinning"], baits: ["Bread","Worms","Maggots"] },
  { name_en: "Sand Smelt", latin_name: "Atherina boyeri", category: "saltwater", habitat: "Mediterranean, Black Sea, Eastern Atlantic", techniques: ["Float fishing","Light tackle"], baits: ["Bread","Maggots","Tiny shrimp"] },
  { name_en: "European Anchovy", latin_name: "Engraulis encrasicolus", category: "saltwater", habitat: "Eastern Atlantic, Mediterranean, Black Sea", techniques: ["Cast netting","Sabiki"], baits: ["Plankton","Bread crumbs"] },
  { name_en: "European Pilchard (Sardine)", latin_name: "Sardina pilchardus", category: "saltwater", habitat: "Eastern Atlantic, Mediterranean", techniques: ["Cast netting","Float fishing"], baits: ["Bread","Plankton"] },
  { name_en: "European Sprat", latin_name: "Sprattus sprattus", category: "saltwater", habitat: "Eastern Atlantic, North Sea, Baltic Sea", techniques: ["Cast netting","Light tackle"], baits: ["Bread crumbs","Tiny lures"] },
  { name_en: "Pandora", latin_name: "Pagellus erythrinus", category: "saltwater", habitat: "Mediterranean, Eastern Atlantic", techniques: ["Bottom fishing","Light tackle"], baits: ["Shrimp","Worms","Mussel"] },
  { name_en: "Black Sea Bream (Europe)", latin_name: "Spondyliosoma cantharus", category: "saltwater", habitat: "Eastern Atlantic, Mediterranean", techniques: ["Bottom fishing","Float fishing"], baits: ["Ragworm","Squid","Crab"] },
  { name_en: "Red Porgy", latin_name: "Pagrus pagrus", category: "saltwater", habitat: "Eastern Atlantic, Mediterranean", techniques: ["Bottom fishing","Jigging"], baits: ["Shrimp","Squid","Cut fish"] },
  { name_en: "Zebra Sea Bream", latin_name: "Diplodus cervinus", category: "saltwater", habitat: "Mediterranean, Eastern Atlantic", techniques: ["Bottom fishing","Rock fishing"], baits: ["Sea urchin","Crab","Shrimp"] },
  { name_en: "Sharpsnout Sea Bream", latin_name: "Diplodus puntazzo", category: "saltwater", habitat: "Mediterranean, Eastern Atlantic", techniques: ["Bottom fishing","Float fishing"], baits: ["Sea urchin","Shrimp","Crab"] },
  { name_en: "Two-banded Sea Bream", latin_name: "Diplodus vulgaris", category: "saltwater", habitat: "Mediterranean, Eastern Atlantic", techniques: ["Bottom fishing","Float fishing"], baits: ["Shrimp","Worms","Bread"] },
  { name_en: "White Sea Bream", latin_name: "Diplodus sargus", category: "saltwater", habitat: "Mediterranean, Eastern Atlantic", techniques: ["Bottom fishing","Rock fishing","Surf casting"], baits: ["Sea urchin","Crab","Shrimp","Mussel"] },
  { name_en: "Common Sole", latin_name: "Solea solea", category: "saltwater", habitat: "Eastern Atlantic, Mediterranean, North Sea", techniques: ["Bottom fishing"], baits: ["Ragworm","Lugworm","Shrimp"] },
  // 50 done
  { name_en: "European Plaice", latin_name: "Pleuronectes platessa", category: "saltwater", habitat: "Eastern Atlantic, North Sea, Baltic Sea", techniques: ["Bottom fishing"], baits: ["Ragworm","Lugworm","Mussel"] },
  { name_en: "European Flounder", latin_name: "Platichthys flesus", category: "saltwater", habitat: "Eastern Atlantic, Baltic Sea, Mediterranean", techniques: ["Bottom fishing"], baits: ["Ragworm","Shrimp","Mussel"] },
  { name_en: "Turbot", latin_name: "Scophthalmus maximus", category: "saltwater", habitat: "Eastern Atlantic, Mediterranean, North Sea", techniques: ["Bottom fishing","Trolling"], baits: ["Live bait","Sand eel","Fish strips"] },
  { name_en: "Brill", latin_name: "Scophthalmus rhombus", category: "saltwater", habitat: "Eastern Atlantic, Mediterranean", techniques: ["Bottom fishing"], baits: ["Live bait","Sand eel","Strips"] },
  { name_en: "Megrim", latin_name: "Lepidorhombus whiffiagonis", category: "saltwater", habitat: "Eastern Atlantic", techniques: ["Bottom fishing","Deep sea"], baits: ["Worms","Shrimp","Small fish"] },
  { name_en: "Dab", latin_name: "Limanda limanda", category: "saltwater", habitat: "Eastern Atlantic, North Sea", techniques: ["Bottom fishing"], baits: ["Ragworm","Lugworm","Shrimp"] },
  { name_en: "Lemon Sole", latin_name: "Microstomus kitt", category: "saltwater", habitat: "Eastern Atlantic, North Sea", techniques: ["Bottom fishing"], baits: ["Ragworm","Mussel","Shrimp"] },
  { name_en: "Witch Flounder", latin_name: "Glyptocephalus cynoglossus", category: "saltwater", habitat: "North Atlantic", techniques: ["Bottom fishing","Deep sea"], baits: ["Worms","Small shrimp"] },
  { name_en: "Dover Sole", latin_name: "Solea solea (Channel)", category: "saltwater", habitat: "English Channel, North Sea", techniques: ["Bottom fishing"], baits: ["Ragworm","Lugworm"] },
  { name_en: "Monkfish (Anglerfish)", latin_name: "Lophius piscatorius", category: "saltwater", habitat: "Eastern Atlantic, Mediterranean", techniques: ["Deep sea","Bottom fishing"], baits: ["Fish","Squid","Mackerel"] },
  // 60 done - Now freshwater European species
  { name_en: "Schneider", latin_name: "Alburnoides bipunctatus", category: "freshwater", habitat: "European rivers, Danube basin", techniques: ["Float fishing","Light tackle"], baits: ["Maggots","Worms","Bread"] },
  { name_en: "Bleak", latin_name: "Alburnus alburnus", category: "freshwater", habitat: "European rivers and lakes", techniques: ["Float fishing","Light tackle"], baits: ["Maggots","Bread","Worms"] },
  { name_en: "Gudgeon", latin_name: "Gobio gobio", category: "freshwater", habitat: "European rivers and streams", techniques: ["Float fishing","Light tackle"], baits: ["Maggots","Worms","Bread"] },
  { name_en: "Stone Loach", latin_name: "Barbatula barbatula", category: "freshwater", habitat: "European streams and rivers", techniques: ["Light tackle"], baits: ["Small worms","Maggots"] },
  { name_en: "Spined Loach", latin_name: "Cobitis taenia", category: "freshwater", habitat: "European rivers, slow-flowing waters", techniques: ["Light tackle"], baits: ["Small worms","Maggots"] },
  { name_en: "Weather Loach", latin_name: "Misgurnus fossilis", category: "freshwater", habitat: "European wetlands, floodplains", techniques: ["Light tackle","Bottom fishing"], baits: ["Worms","Maggots"] },
  { name_en: "European Bitterling", latin_name: "Rhodeus amarus", category: "freshwater", habitat: "European rivers and ponds", techniques: ["Micro fishing"], baits: ["Bread","Tiny worms"] },
  { name_en: "Sunbleak", latin_name: "Leucaspius delineatus", category: "freshwater", habitat: "European ponds and slow rivers", techniques: ["Micro fishing","Light tackle"], baits: ["Bread","Maggots"] },
  { name_en: "Minnow", latin_name: "Phoxinus phoxinus", category: "freshwater", habitat: "European streams and rivers", techniques: ["Light tackle","Fly fishing"], baits: ["Maggots","Small flies","Bread"] },
  { name_en: "Dace", latin_name: "Leuciscus leuciscus", category: "freshwater", habitat: "European rivers", techniques: ["Float fishing","Fly fishing","Trotting"], baits: ["Maggots","Bread","Small flies"] },
  // 70 done
  { name_en: "Soufie", latin_name: "Leuciscus souffia", category: "freshwater", habitat: "Alpine rivers, Upper Danube, Rhône", techniques: ["Float fishing","Fly fishing"], baits: ["Small nymphs","Maggots"] },
  { name_en: "Orfe (Golden Ide)", latin_name: "Leuciscus idus (golden)", category: "freshwater", habitat: "European rivers and lakes", techniques: ["Float fishing","Fly fishing"], baits: ["Bread","Worms","Maggots"] },
  { name_en: "Ziege", latin_name: "Pelecus cultratus", category: "freshwater", habitat: "Baltic, Black Sea and Caspian basins", techniques: ["Spinning","Float fishing"], baits: ["Small lures","Insects","Maggots"] },
  { name_en: "Vimba Bream", latin_name: "Vimba vimba", category: "anadromous", habitat: "Baltic Sea, Black Sea rivers", techniques: ["Float fishing","Bottom fishing"], baits: ["Worms","Maggots","Corn"] },
  { name_en: "White-eye Bream", latin_name: "Ballerus sappir", category: "freshwater", habitat: "European rivers, Danube and Volga basins", techniques: ["Float fishing","Bottom fishing"], baits: ["Worms","Maggots","Bread"] },
  { name_en: "Blue Bream", latin_name: "Ballerus ballerus", category: "freshwater", habitat: "European rivers and lakes", techniques: ["Float fishing","Bottom fishing"], baits: ["Worms","Maggots","Bread"] },
  { name_en: "Silver Bream", latin_name: "Blicca bjoerkna", category: "freshwater", habitat: "European rivers and lakes", techniques: ["Float fishing","Bottom fishing"], baits: ["Maggots","Bread","Worms"] },
  { name_en: "Zope", latin_name: "Ballerus ballerus (zope)", category: "freshwater", habitat: "Eastern European rivers", techniques: ["Float fishing"], baits: ["Worms","Bread","Maggots"] },
  { name_en: "Moderlieschen", latin_name: "Leucaspius delineatus (DE)", category: "freshwater", habitat: "Central European ponds", techniques: ["Micro fishing"], baits: ["Bread crumbs","Tiny maggots"] },
  { name_en: "European Mudminnow", latin_name: "Umbra krameri", category: "freshwater", habitat: "Danube basin wetlands", techniques: ["Light tackle"], baits: ["Worms","Larvae"] },
  // 80 done
  { name_en: "Wels Catfish (Trophy)", latin_name: "Silurus glanis (trophy)", category: "freshwater", habitat: "Major European rivers: Po, Ebro, Danube, Rhône", techniques: ["Bottom fishing","Live bait","Clonk fishing","Pellet fishing"], baits: ["Live fish","Pellets","Deadbait","Squid"] },
  { name_en: "European Bullhead", latin_name: "Cottus gobio", category: "freshwater", habitat: "European streams and rivers", techniques: ["Light tackle"], baits: ["Small worms","Larvae"] },
  { name_en: "Alpine Bullhead", latin_name: "Cottus poecilopus", category: "freshwater", habitat: "Alpine and Nordic streams", techniques: ["Light tackle"], baits: ["Larvae","Small worms"] },
  { name_en: "Ruffe", latin_name: "Gymnocephalus cernua", category: "freshwater", habitat: "European rivers and lakes", techniques: ["Float fishing","Light tackle"], baits: ["Worms","Maggots"] },
  { name_en: "Schraetzer", latin_name: "Gymnocephalus schraetser", category: "freshwater", habitat: "Danube basin", techniques: ["Light tackle","Bottom fishing"], baits: ["Worms","Larvae"] },
  { name_en: "Streber", latin_name: "Zingel streber", category: "freshwater", habitat: "Danube basin rivers", techniques: ["Light tackle"], baits: ["Larvae","Small worms"] },
  { name_en: "Zingel", latin_name: "Zingel zingel", category: "freshwater", habitat: "Danube basin", techniques: ["Light tackle","Bottom fishing"], baits: ["Larvae","Worms","Small crayfish"] },
  { name_en: "Perch-Pike (Zander variant)", latin_name: "Sander volgensis (Volga)", category: "freshwater", habitat: "Eastern European rivers, Volga, Don", techniques: ["Spinning","Jigging","Bottom fishing"], baits: ["Soft plastics","Jigs","Live bait"] },
  { name_en: "Three-spined Stickleback", latin_name: "Gasterosteus aculeatus", category: "freshwater", habitat: "European rivers, estuaries, coastal", techniques: ["Micro fishing"], baits: ["Tiny worms","Bread"] },
  { name_en: "Nine-spined Stickleback", latin_name: "Pungitius pungitius", category: "freshwater", habitat: "Northern European freshwaters", techniques: ["Micro fishing"], baits: ["Tiny worms","Bread"] },
  // 90 done
  { name_en: "European Smelt", latin_name: "Osmerus eperlanus", category: "anadromous", habitat: "Baltic Sea, North Sea rivers", techniques: ["Float fishing","Light tackle"], baits: ["Shrimp","Worms","Small fish"] },
  { name_en: "Houting", latin_name: "Coregonus oxyrinchus", category: "anadromous", habitat: "North Sea rivers, Rhine, Elbe", techniques: ["Fly fishing","Float fishing"], baits: ["Small flies","Maggots"] },
  { name_en: "Powan", latin_name: "Coregonus lavaretus (UK)", category: "freshwater", habitat: "Scottish and Welsh deep lakes", techniques: ["Fly fishing","Trolling"], baits: ["Small flies","Nymphs"] },
  { name_en: "Schelly", latin_name: "Coregonus lavaretus (schelly)", category: "freshwater", habitat: "Lake District, England", techniques: ["Fly fishing"], baits: ["Small flies","Nymphs"] },
  { name_en: "Pollan", latin_name: "Coregonus autumnalis", category: "freshwater", habitat: "Irish loughs", techniques: ["Fly fishing","Trolling"], baits: ["Small flies","Nymphs"] },
  { name_en: "Lavaret", latin_name: "Coregonus lavaretus (Alpine)", category: "freshwater", habitat: "Alpine lakes: Geneva, Constance, Annecy", techniques: ["Trolling","Fly fishing"], baits: ["Small spoons","Nymphs","Maggots"] },
  { name_en: "Peled (Pelyad)", latin_name: "Coregonus peled", category: "freshwater", habitat: "Northern European lakes, introduced", techniques: ["Fly fishing","Trolling"], baits: ["Small flies","Nymphs"] },
  { name_en: "Arctic Cisco", latin_name: "Coregonus autumnalis (arctic)", category: "freshwater", habitat: "Northern Scandinavian lakes", techniques: ["Fly fishing","Ice fishing"], baits: ["Small flies","Jigs"] },
  { name_en: "Adriatic Trout", latin_name: "Salmo obtusirostris", category: "freshwater", habitat: "Adriatic rivers: Neretva, Jadro, Krka", techniques: ["Fly fishing","Spinning"], baits: ["Dry flies","Nymphs","Small spinners"] },
  { name_en: "Adriatic Salmon", latin_name: "Salmothymus obtusirostris", category: "freshwater", habitat: "Adriatic basin rivers", techniques: ["Fly fishing"], baits: ["Wet flies","Nymphs"] },
  // 100 done
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
