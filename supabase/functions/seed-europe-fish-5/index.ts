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

// European Fish – Batch 5: Scandinavian, Mediterranean endemic, remaining species
const europeanFish: Fish[] = [
  // ─── SCANDINAVIAN / NORDIC SPECIALTIES ───
  { name_en: "European Cisco", latin_name: "Coregonus albula", category: "freshwater", habitat: "Deep cold lakes of Scandinavia and Baltic region", techniques: ["Ice fishing","Fly fishing","Trolling"], baits: ["Tiny jigs","Small flies","Maggots"], description: "Small pelagic whitefish of northern lakes. Important food fish in Scandinavia." },
  { name_en: "Muikku (Vendace)", latin_name: "Coregonus albula (Finnish)", category: "freshwater", habitat: "Finnish and Swedish lakes", techniques: ["Net fishing","Ice fishing"], baits: ["Small jigs","Maggots"], description: "Finnish name for vendace. Culturally important fish in Finnish cuisine." },
  { name_en: "Sik (Whitefish)", latin_name: "Coregonus lavaretus (Nordic)", category: "freshwater", habitat: "Scandinavian lakes and rivers", techniques: ["Fly fishing","Trolling","Ice fishing"], baits: ["Nymphs","Small spoons","Ice jigs"], description: "Nordic whitefish. Multiple local forms across Scandinavian lakes." },
  { name_en: "Harr (Grayling)", latin_name: "Thymallus thymallus (Nordic)", category: "freshwater", habitat: "Clean Scandinavian rivers", techniques: ["Fly fishing","Spinning"], baits: ["Dry flies","Nymphs","Small spinners"], description: "Scandinavian name for European grayling. Iconic fly fishing target in Nordic rivers." },
  { name_en: "Lake Char (Röding)", latin_name: "Salvelinus alpinus (Nordic)", category: "freshwater", habitat: "Cold deep lakes of Scandinavia", techniques: ["Trolling","Ice fishing","Fly fishing"], baits: ["Spoons","Ice jigs","Streamers"], description: "Scandinavian Arctic char. Many distinct local populations in isolated lakes." },
  { name_en: "Sea-run Brown Trout", latin_name: "Salmo trutta (sea-run Nordic)", category: "anadromous", habitat: "Scandinavian and Baltic coastal rivers", techniques: ["Fly fishing","Spinning","Trolling"], baits: ["Sea trout flies","Spoons","Coastal spinners"], description: "Nordic sea trout. Major sport fishery in Danish, Swedish and Finnish coastal waters." },
  { name_en: "Baltic Herring", latin_name: "Clupea harengus membras", category: "saltwater", habitat: "Baltic Sea", techniques: ["Float fishing","Sabiki rigs","Net fishing"], baits: ["Small jigs","Sabiki rigs"], description: "Small subspecies of Atlantic herring in Baltic. Fundamental to Baltic ecosystem." },
  { name_en: "Sprat", latin_name: "Sprattus sprattus", category: "saltwater", habitat: "North Sea, Baltic, Atlantic European coasts", techniques: ["Not typically targeted by anglers"], baits: ["N/A"], description: "Tiny schooling fish. Important commercial and forage species across European seas." },
  { name_en: "Three-bearded Rockling", latin_name: "Gaidropsarus vulgaris", category: "saltwater", habitat: "Atlantic European rocky shores", techniques: ["Rock fishing"], baits: ["Ragworm","Small fish strip"], description: "Elongated nocturnal fish of Atlantic rocky shores. Three barbels on head." },
  { name_en: "Shore Rockling", latin_name: "Gaidropsarus mediterraneus", category: "saltwater", habitat: "Atlantic and Mediterranean rocky coasts", techniques: ["Rock fishing"], baits: ["Small worms"], description: "Small rockling found under rocks in tidal zone." },
  { name_en: "Five-bearded Rockling", latin_name: "Ciliata mustela", category: "saltwater", habitat: "Northeast Atlantic rocky shores", techniques: ["Rock fishing","Micro fishing"], baits: ["Small worms","Tiny baits"], description: "Small rockling with five barbels. Common in rockpools." },
  { name_en: "Norwegian Redfish", latin_name: "Sebastes norvegicus", category: "saltwater", habitat: "Deep North Atlantic waters, Norwegian fjords", techniques: ["Deep-sea fishing","Jigging"], baits: ["Pirks","Cut bait","Shrimp"], description: "Golden-red deepwater scorpionfish. Slow-growing, long-lived. Important Norwegian fishery." },
  { name_en: "Wolffish", latin_name: "Anarhichas lupus", category: "saltwater", habitat: "North Atlantic deep rocky bottoms", techniques: ["Bottom fishing"], baits: ["Crab","Shellfish","Cut bait"], description: "Fearsome-looking deep-water fish with powerful crushing teeth. Eats sea urchins and crabs." },
  { name_en: "Spotted Wolffish", latin_name: "Anarhichas minor", category: "saltwater", habitat: "Deep North Atlantic", techniques: ["Deep-sea fishing"], baits: ["Shellfish","Cut bait"], description: "Spotted relative of Atlantic wolffish. Found in deeper northern waters." },
  { name_en: "Lumpsucker (Lumpfish)", latin_name: "Cyclopterus lumpus", category: "saltwater", habitat: "North Atlantic rocky coasts", techniques: ["Not typically targeted"], baits: ["N/A"], description: "Round, bumpy fish with suction disc. Males guard eggs. Roe used as caviar substitute." },
  { name_en: "Butterfish (Gunnel)", latin_name: "Pholis gunnellus", category: "saltwater", habitat: "North Atlantic rocky shores", techniques: ["Micro fishing","Rock pooling"], baits: ["Small worms"], description: "Slippery elongated fish found under rocks. Row of distinctive spots along base of dorsal fin." },

  // ─── MEDITERRANEAN ENDEMIC ───
  { name_en: "Dentex (Common)", latin_name: "Dentex dentex", category: "saltwater", habitat: "Mediterranean rocky reefs and drop-offs", techniques: ["Jigging","Live baiting","Trolling"], baits: ["Large jigs","Live fish","Plugs"], description: "Top Mediterranean predator. Canine teeth for catching fish. Powerful runs." },
  { name_en: "Pink Dentex", latin_name: "Dentex gibbosus", category: "saltwater", habitat: "Mediterranean deep rocky habitats", techniques: ["Deep jigging","Bottom fishing"], baits: ["Jigs","Cut bait","Squid"], description: "Pink-hued dentex of deeper Mediterranean waters." },
  { name_en: "Large-eye Dentex", latin_name: "Dentex macrophthalmus", category: "saltwater", habitat: "Mediterranean deep waters", techniques: ["Deep jigging"], baits: ["Deep jigs","Cut bait"], description: "Large-eyed species adapted to deeper Mediterranean habitats." },
  { name_en: "Meagre", latin_name: "Argyrosomus regius", category: "saltwater", habitat: "Mediterranean and warm Atlantic", techniques: ["Spinning","Bottom fishing","Live baiting","Trolling"], baits: ["Soft plastics","Live fish","Squid","Metal jigs"], description: "Europe's largest sciaenid reaching 50kg+. Produces drumming sounds. Premier sport fish." },
  { name_en: "Brown Meagre", latin_name: "Sciaena umbra", category: "saltwater", habitat: "Mediterranean rocky caves and reefs", techniques: ["Bottom fishing","Night fishing"], baits: ["Worms","Shrimp","Squid"], description: "Dark-bodied corvina of Mediterranean caves. Produces sounds. Protected in many areas." },
  { name_en: "Shi Drum", latin_name: "Umbrina cirrosa", category: "saltwater", habitat: "Mediterranean sandy and rocky coasts", techniques: ["Bottom fishing","Spinning"], baits: ["Worms","Shrimp","Crab","Small fish"], description: "Attractive drum fish with chin barbel. Good sport on light tackle." },
  { name_en: "Striped Red Mullet", latin_name: "Mullus surmuletus", category: "saltwater", habitat: "Mediterranean and Atlantic coasts", techniques: ["Bottom fishing","Float fishing"], baits: ["Ragworm","Shrimp"], description: "Striped variety of red mullet. Two barbels probe substrate for invertebrates." },
  { name_en: "Damselfish", latin_name: "Chromis chromis", category: "saltwater", habitat: "Mediterranean rocky reefs", techniques: ["Light tackle"], baits: ["Bread","Tiny baits"], description: "Small dark fish abundant on Mediterranean reefs. Juveniles are electric blue." },
  { name_en: "Mediterranean Cardinalfish", latin_name: "Apogon imberbis", category: "saltwater", habitat: "Mediterranean rocky caves", techniques: ["Not typically targeted"], baits: ["N/A"], description: "Small red nocturnal fish of Mediterranean caves. Male broods eggs in mouth." },
  { name_en: "European Flying Fish", latin_name: "Exocoetus volitans", category: "saltwater", habitat: "Mediterranean and warm Atlantic surface", techniques: ["Not typically targeted"], baits: ["N/A"], description: "Glides above water surface on enlarged pectoral fins. Occasionally enters Mediterranean." },
  { name_en: "Greater Forkbeard", latin_name: "Phycis blennoides", category: "saltwater", habitat: "Mediterranean and Atlantic deep waters", techniques: ["Bottom fishing"], baits: ["Squid","Cut fish"], description: "Deep-water species of Mediterranean and Atlantic." },
  { name_en: "Pandora (Common)", latin_name: "Pagellus erythrinus", category: "saltwater", habitat: "Mediterranean and warm Atlantic", techniques: ["Bottom fishing","Jigging"], baits: ["Shrimp","Squid","Worms","Small jigs"], description: "Pink-red sea bream. Important target for Mediterranean boat anglers." },
  { name_en: "Picarel", latin_name: "Spicara smaris", category: "saltwater", habitat: "Mediterranean seagrass and sandy bottoms", techniques: ["Float fishing","Light tackle"], baits: ["Bread","Tiny worms","Maggots"], description: "Small schooling fish common in Mediterranean. Changes sex from female to male." },
  { name_en: "Mediterranean Sand Smelt", latin_name: "Atherina hepsetus", category: "saltwater", habitat: "Mediterranean coastal waters", techniques: ["Float fishing","Light tackle"], baits: ["Bread","Tiny maggots","Small shrimp"], description: "Small silvery schooling fish. Popular baitfish and light tackle target." },
  { name_en: "Big-scale Sand Smelt", latin_name: "Atherina boyeri", category: "saltwater", habitat: "Mediterranean lagoons and estuaries", techniques: ["Light float fishing"], baits: ["Bread","Tiny baits"], description: "Euryhaline sand smelt found in lagoons and brackish water across Mediterranean." },

  // ─── ADDITIONAL FRESHWATER ───
  { name_en: "Coregonus (Alpine Whitefish)", latin_name: "Coregonus wartmanni", category: "freshwater", habitat: "Lake Constance and Alpine lakes", techniques: ["Trolling","Fly fishing"], baits: ["Small nymphs","Tiny spoons"], description: "Blaufelchen of Lake Constance. Pelagic whitefish. Important commercial fishery." },
  { name_en: "Felchen", latin_name: "Coregonus sp. (Swiss)", category: "freshwater", habitat: "Swiss Alpine lakes", techniques: ["Trolling","Fly fishing"], baits: ["Nymphs","Small spoons","Maggots"], description: "Swiss whitefish complex. Multiple species and forms in different lakes." },
  { name_en: "Renke", latin_name: "Coregonus sp. (Bavarian)", category: "freshwater", habitat: "Bavarian Alpine lakes (Starnberger See, Ammersee)", techniques: ["Trolling","Vertical fishing"], baits: ["Small nymphs","Jigs","Maggots"], description: "Bavarian name for Alpine whitefish. Traditional fishery in southern German lakes." },
  { name_en: "Lavaret", latin_name: "Coregonus lavaretus (French)", category: "freshwater", habitat: "Lake Bourget and Lake Annecy, France", techniques: ["Trolling","Fly fishing"], baits: ["Small nymphs","Tiny spoons"], description: "French Alpine whitefish. Important sport and commercial fish in Savoyard lakes." },
  { name_en: "Lake Trout (Italian)", latin_name: "Salmo trutta (Lago di Garda)", category: "freshwater", habitat: "Large Italian lakes (Garda, Como, Maggiore)", techniques: ["Trolling","Spinning"], baits: ["Spoons","Plugs","Streamers"], description: "Italian lacustrine brown trout. Can grow very large in deep alpine lakes." },
  { name_en: "Carpione del Garda", latin_name: "Salmo carpio", category: "freshwater", habitat: "Lake Garda, Italy", techniques: ["Protected - not fished"], baits: ["N/A"], description: "Endemic salmonid of Lake Garda. Critically endangered. Unique deep-spawning behavior." },
  { name_en: "Trota Marmorata", latin_name: "Salmo marmoratus (Italian)", category: "freshwater", habitat: "Adriatic rivers of northern Italy and Slovenia", techniques: ["Fly fishing","Spinning"], baits: ["Large streamers","Spoons","Plugs"], description: "Italian name for marble trout. Trophy fish of Alpine rivers. Can exceed 20kg." },
  { name_en: "Temolo (Italian Grayling)", latin_name: "Thymallus thymallus (Italian)", category: "freshwater", habitat: "Northern Italian rivers", techniques: ["Fly fishing"], baits: ["Dry flies","Nymphs"], description: "Italian grayling population. Found in clean Alpine rivers of northern Italy." },
  { name_en: "Trota Fario", latin_name: "Salmo trutta fario (Italian)", category: "freshwater", habitat: "Italian mountain streams", techniques: ["Fly fishing","Spinning"], baits: ["Nymphs","Small spinners","Dry flies"], description: "Italian native brown trout. Beautiful spotted pattern adapted to Apennine streams." },
  { name_en: "Persico Reale", latin_name: "Perca fluviatilis (Italian)", category: "freshwater", habitat: "Italian lakes and rivers", techniques: ["Spinning","Drop shot","Float fishing"], baits: ["Worms","Small spinners","Soft plastics"], description: "Italian perch. Important sport fish in lakes like Como, Garda and Maggiore." },
  { name_en: "Luccio (Italian Pike)", latin_name: "Esox cisalpinus", category: "freshwater", habitat: "Italian freshwaters", techniques: ["Spinning","Dead baiting","Fly fishing"], baits: ["Plugs","Spoons","Dead bait","Streamers"], description: "Southern European pike, recently recognized as separate species from northern pike." },
  { name_en: "Cisalpine Pike", latin_name: "Esox cisalpinus", category: "freshwater", habitat: "Italian and southern Alpine freshwaters", techniques: ["Spinning","Live baiting","Dead baiting"], baits: ["Plugs","Spoons","Jerkbaits","Dead fish"], description: "Endemic pike of southern Europe. Genetically distinct from Esox lucius." },
  { name_en: "Spanish Trout", latin_name: "Salmo trutta (Iberian)", category: "freshwater", habitat: "Mountain streams of Spain and Portugal", techniques: ["Fly fishing","Spinning"], baits: ["Nymphs","Dry flies","Small spinners"], description: "Iberian brown trout populations. Adapted to Mediterranean climate with seasonal drought." },
  { name_en: "Iberian Nase", latin_name: "Pseudochondrostoma polylepis", category: "freshwater", habitat: "Rivers of Spain and Portugal", techniques: ["Float fishing"], baits: ["Bread","Worms"], description: "Endemic nase of Iberian rivers. Important part of native fish communities." },
  { name_en: "Iberian Gudgeon", latin_name: "Gobio lozanoi", category: "freshwater", habitat: "Iberian Peninsula rivers", techniques: ["Float fishing","Micro fishing"], baits: ["Maggots","Small worms"], description: "Endemic gudgeon of Spanish rivers." },
  { name_en: "Squalius valentinus", latin_name: "Squalius valentinus", category: "freshwater", habitat: "Eastern Spanish rivers", techniques: ["Float fishing"], baits: ["Bread","Worms"], description: "Endemic chub of Valencia region rivers." },
  { name_en: "Ebro Barbel", latin_name: "Luciobarbus graellsii", category: "freshwater", habitat: "Ebro River basin, Spain", techniques: ["Float fishing","Ledgering"], baits: ["Bread","Worms","Corn","Boilies"], description: "Large barbel of the Ebro system. Popular sport fish reaching 8kg+." },
  { name_en: "Portuguese Barbel", latin_name: "Luciobarbus bocagei", category: "freshwater", habitat: "Rivers of central Portugal", techniques: ["Float fishing","Ledgering"], baits: ["Bread","Worms","Corn"], description: "Endemic barbel of Portuguese river systems." },
  { name_en: "Comizo Barbel", latin_name: "Luciobarbus comizo", category: "freshwater", habitat: "Guadiana and Tagus basins", techniques: ["Float fishing","Ledgering"], baits: ["Bread","Corn","Worms","Boilies"], description: "Iberian barbel reaching large sizes. Distinctive elongated snout." },
  { name_en: "Danube Roach", latin_name: "Rutilus virgo", category: "freshwater", habitat: "Danube River system", techniques: ["Float fishing","Feeder fishing"], baits: ["Maggots","Bread","Worms"], description: "Large roach of the Danube basin. Can exceed 1kg." },
  { name_en: "Black Sea Roach", latin_name: "Rutilus frisii", category: "freshwater", habitat: "Rivers draining to Black and Caspian Seas", techniques: ["Float fishing"], baits: ["Bread","Worms","Maggots"], description: "Large migratory roach of Black Sea rivers." },
  { name_en: "Danube Bleak", latin_name: "Chalcalburnus chalcoides", category: "freshwater", habitat: "Black Sea and Caspian river systems", techniques: ["Float fishing"], baits: ["Tiny baits","Maggots"], description: "Larger relative of common bleak found in eastern European rivers." },
  { name_en: "Adriatic Dace", latin_name: "Squalius svallize", category: "freshwater", habitat: "Adriatic basin rivers", techniques: ["Float fishing"], baits: ["Bread","Worms"], description: "Endemic dace of Adriatic draining rivers." },
  { name_en: "Greek Dace", latin_name: "Squalius keadicus", category: "freshwater", habitat: "Rivers of southern Greece", techniques: ["Float fishing"], baits: ["Bread","Worms"], description: "Endemic dace of Peloponnese rivers." },
  { name_en: "Volga Pike-perch", latin_name: "Sander volgensis", category: "freshwater", habitat: "Danube and Volga river systems", techniques: ["Spinning","Jigging"], baits: ["Soft plastics","Jigs","Small fish"], description: "Smaller pike-perch species. More gregarious than common zander." },
  { name_en: "Sunfish (Pumpkinseed)", latin_name: "Lepomis gibbosus", category: "freshwater", habitat: "Lakes and ponds across Western Europe (invasive)", techniques: ["Float fishing","Fly fishing","Micro fishing"], baits: ["Small worms","Bread","Tiny flies","Maggots"], description: "North American invasive sunfish now widespread in European still waters. Colorful and bold." },
  { name_en: "Largemouth Bass (European pop.)", latin_name: "Micropterus salmoides", category: "freshwater", habitat: "Spanish, Italian and French lakes (introduced)", techniques: ["Spinning","Baitcasting","Fly fishing"], baits: ["Soft plastics","Crankbaits","Spinnerbaits","Topwater"], description: "Introduced American bass. Established in Spain (Ebro), Italy and southern France." },
  { name_en: "Rainbow Trout (European stocked)", latin_name: "Oncorhynchus mykiss", category: "freshwater", habitat: "Stocked rivers and lakes across Europe", techniques: ["Fly fishing","Spinning","Bait fishing"], baits: ["PowerBait","Spinners","Flies","Worms"], description: "Widely stocked American trout across Europe. Self-sustaining populations rare." },
  { name_en: "Brook Trout (European pop.)", latin_name: "Salvelinus fontinalis", category: "freshwater", habitat: "Mountain streams of Alps, Pyrenees, Scandinavia", techniques: ["Fly fishing","Spinning"], baits: ["Small flies","Nymphs","Spinners","Worms"], description: "Introduced American char established in many European mountain streams." },

  // ─── REMAINING MARINE ───
  { name_en: "Sea Lamprey (European)", latin_name: "Petromyzon marinus", category: "anadromous", habitat: "Atlantic European rivers", techniques: ["Not typically targeted"], baits: ["N/A"], description: "Ancient jawless fish parasitizing other fish. Important historically as food for royalty." },
  { name_en: "Sand Goby", latin_name: "Pomatoschistus minutus", category: "saltwater", habitat: "European coastal sandy bottoms", techniques: ["Micro fishing"], baits: ["Tiny worms"], description: "Very small goby of European sandy coasts. Important prey for larger fish." },
  { name_en: "Rock Goby", latin_name: "Gobius paganellus", category: "saltwater", habitat: "Atlantic and Mediterranean rocky shores", techniques: ["Micro fishing","Rock pooling"], baits: ["Small worms"], description: "Common goby of European rockpools. Territorial bottom dweller." },
  { name_en: "Giant Goby", latin_name: "Gobius cobitis", category: "saltwater", habitat: "Atlantic and Mediterranean rocky coasts", techniques: ["Rock fishing"], baits: ["Worms","Small crab"], description: "Europe's largest goby reaching 27cm. Found in shallow rocky habitats." },
  { name_en: "Black Goby", latin_name: "Gobius niger", category: "saltwater", habitat: "European estuaries and coastal lagoons", techniques: ["Light float fishing","Micro fishing"], baits: ["Small worms","Maggots"], description: "Dark-colored goby common in European estuaries and ports." },
  { name_en: "Dragonet", latin_name: "Callionymus lyra", category: "saltwater", habitat: "Atlantic and Mediterranean sandy bottoms", techniques: ["Not typically targeted"], baits: ["Small worms"], description: "Males are spectacularly colorful with elongated dorsal fin. Sandy bottom dweller." },
  { name_en: "European Anchovy", latin_name: "Engraulis encrasicolus", category: "saltwater", habitat: "Mediterranean and Atlantic European coasts", techniques: ["Not typically targeted by anglers"], baits: ["N/A"], description: "Small schooling fish. Commercially vital in Mediterranean. Important baitfish." },
  { name_en: "European Pilchard (Sardine)", latin_name: "Sardina pilchardus", category: "saltwater", habitat: "Atlantic and Mediterranean", techniques: ["Float fishing","Sabiki rigs"], baits: ["Bread","Sabiki rigs"], description: "Iconic Mediterranean fish. Important commercially. Good bait for larger predators." },
  { name_en: "Atlantic Herring", latin_name: "Clupea harengus", category: "saltwater", habitat: "North Sea, Baltic, North Atlantic", techniques: ["Sabiki rigs","Float fishing"], baits: ["Sabiki rigs","Small feathers"], description: "One of the most important fish in European maritime history. Vast schools in North Sea." },
  { name_en: "Catalan Barbel", latin_name: "Barbus haasi", category: "freshwater", habitat: "Rivers of Catalonia, Spain", techniques: ["Float fishing"], baits: ["Worms","Bread"], description: "Small endemic barbel of northeastern Spanish rivers." },
  { name_en: "Alpine Charr (Saibling)", latin_name: "Salvelinus alpinus (Alpine)", category: "freshwater", habitat: "Deep cold Alpine lakes", techniques: ["Trolling","Ice fishing"], baits: ["Small spoons","Jigs"], description: "Alpine lake populations of Arctic char. Many unique forms in individual lakes." },
  { name_en: "Adriatic Sturgeon", latin_name: "Acipenser naccarii", category: "anadromous", habitat: "Po River and Adriatic rivers", techniques: ["Protected - not fished"], baits: ["N/A"], description: "Critically endangered sturgeon of Adriatic rivers. Captive breeding programs ongoing." },
  { name_en: "Danube Streber", latin_name: "Zingel streber", category: "freshwater", habitat: "Fast-flowing Danube tributaries with gravel", techniques: ["Not typically targeted"], baits: ["Small invertebrates"], description: "Small bottom-dwelling percid. Important indicator of clean gravel-bottom rivers." },
  { name_en: "Rhône Streber", latin_name: "Zingel asper", category: "freshwater", habitat: "Rhône River system, France", techniques: ["Not targeted - protected"], baits: ["N/A"], description: "Critically endangered percid endemic to the Rhône. One of Europe's rarest freshwater fish." },
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
