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

// European Fish – Batch 2: Pike, Catfish, Sturgeon, Eels, more Cyprinids
const europeanFish: Fish[] = [
  // ─── PIKE ───
  { name_en: "Northern Pike (European)", latin_name: "Esox lucius", category: "freshwater", habitat: "Weedy lakes, rivers, canals across Europe", techniques: ["Spinning","Dead baiting","Fly fishing","Trolling"], baits: ["Spoons","Plugs","Dead bait fish","Large streamers","Jerkbaits"], description: "Top European freshwater predator. Ambush hunter with elongated body and duck-bill snout." },
  { name_en: "Amur Pike", latin_name: "Esox reichertii", category: "freshwater", habitat: "Eastern European rivers (introduced)", techniques: ["Spinning"], baits: ["Spoons","Plugs","Soft plastics"], description: "Asian pike sometimes found in eastern European waters. Spotted pattern differs from northern pike." },

  // ─── CATFISH ───
  { name_en: "Wels Catfish", latin_name: "Silurus glanis", category: "freshwater", habitat: "Large rivers, lakes, reservoirs across Europe", techniques: ["Ledgering","Clonk fishing","Lure fishing","Live baiting"], baits: ["Large dead bait","Live bait","Leeches","Large lures","Worms"], description: "Europe's largest freshwater fish, exceeding 2.7m and 130kg. Ancient predator of European rivers." },
  { name_en: "Aristotle's Catfish", latin_name: "Silurus aristotelis", category: "freshwater", habitat: "Rivers of Greece (Acheloos, Pinios)", techniques: ["Ledgering","Bait fishing"], baits: ["Worms","Dead bait","Leeches"], description: "Endemic Greek catfish. Smaller than wels. Named after Aristotle who first described it." },
  { name_en: "Black Bullhead", latin_name: "Ameiurus melas", category: "freshwater", habitat: "Slow waters across Western Europe (introduced)", techniques: ["Ledgering","Float fishing"], baits: ["Worms","Meat","Bread"], description: "North American catfish widely established in European waters. Nocturnal feeder." },
  { name_en: "Channel Catfish (European pop.)", latin_name: "Ictalurus punctatus", category: "freshwater", habitat: "Stocked lakes in Western Europe", techniques: ["Ledgering","Float fishing"], baits: ["Worms","Meat","Pellets","Cheese"], description: "Introduced American catfish in some European waters. Popular in stocked fisheries." },

  // ─── STURGEON ───
  { name_en: "European Sturgeon", latin_name: "Acipenser sturio", category: "anadromous", habitat: "Atlantic European rivers and coastal waters", techniques: ["Protected - not fished"], baits: ["N/A"], description: "Critically endangered. Once common in European rivers. Reintroduction programs in France and Germany." },
  { name_en: "Sterlet", latin_name: "Acipenser ruthenus", category: "freshwater", habitat: "Danube, Volga and other large rivers", techniques: ["Ledgering"], baits: ["Worms","Small fish","Shrimp"], description: "Smallest European sturgeon. Still found in Danube system. Protected but some fishing allowed." },
  { name_en: "Beluga Sturgeon", latin_name: "Huso huso", category: "anadromous", habitat: "Caspian, Black, and Adriatic Sea basins", techniques: ["Protected - not fished"], baits: ["N/A"], description: "World's largest freshwater fish, historically reaching 1,500kg. Critically endangered. Source of beluga caviar." },
  { name_en: "Russian Sturgeon", latin_name: "Acipenser gueldenstaedtii", category: "anadromous", habitat: "Black, Azov, and Caspian Sea rivers", techniques: ["Protected in most areas"], baits: ["Worms","Shrimp"], description: "Important caviar species. Danube population critically endangered." },
  { name_en: "Stellate Sturgeon", latin_name: "Acipenser stellatus", category: "anadromous", habitat: "Black, Azov, and Caspian Sea rivers", techniques: ["Protected - not fished"], baits: ["N/A"], description: "Star-shaped bony plates. One of the most valued caviar-producing sturgeons." },
  { name_en: "Ship Sturgeon", latin_name: "Acipenser nudiventris", category: "anadromous", habitat: "Caspian and Aral Sea drainages", techniques: ["Protected - not fished"], baits: ["N/A"], description: "Rare sturgeon of Central Asian and Eastern European waters. Critically endangered." },
  { name_en: "Adriatic Sturgeon", latin_name: "Acipenser naccarii", category: "anadromous", habitat: "Northern Adriatic rivers (Po, Adige)", techniques: ["Protected - not fished"], baits: ["N/A"], description: "Endemic to Adriatic basin. Critically endangered with captive breeding programs." },

  // ─── EELS & LAMPREY ───
  { name_en: "European Eel", latin_name: "Anguilla anguilla", category: "anadromous", habitat: "Rivers, lakes, estuaries across Europe", techniques: ["Ledgering","Float fishing"], baits: ["Worms","Dead bait","Maggots"], description: "Mysterious catadromous fish breeding in the Sargasso Sea. Critically endangered. Incredible migration." },
  { name_en: "Sea Lamprey", latin_name: "Petromyzon marinus", category: "anadromous", habitat: "Atlantic European rivers and coastal waters", techniques: ["Not typically targeted"], baits: ["N/A"], description: "Parasitic jawless fish. Attaches to host fish with sucker mouth. Ancient lineage predating dinosaurs." },
  { name_en: "River Lamprey", latin_name: "Lampetra fluviatilis", category: "anadromous", habitat: "Rivers of Northern and Western Europe", techniques: ["Not typically targeted"], baits: ["N/A"], description: "Smaller anadromous lamprey. Important food source historically. Protected in many countries." },
  { name_en: "Brook Lamprey", latin_name: "Lampetra planeri", category: "freshwater", habitat: "Clean streams across Europe", techniques: ["Not targeted"], baits: ["N/A"], description: "Non-parasitic lamprey spending entire life in streams. Adults do not feed. Indicator of clean water." },

  // ─── MORE CYPRINIDS ───
  { name_en: "Chub", latin_name: "Squalius cephalus", category: "freshwater", habitat: "Rivers and streams across Europe", techniques: ["Float fishing","Spinning","Fly fishing","Ledgering"], baits: ["Bread","Cheese","Slugs","Spinners","Dry flies","Worms"], description: "Versatile river fish with large mouth. Eats almost anything. Popular all-year-round target." },
  { name_en: "Italian Chub", latin_name: "Squalius squalus", category: "freshwater", habitat: "Rivers of Italy and surrounding areas", techniques: ["Float fishing","Spinning"], baits: ["Bread","Worms","Small spinners"], description: "Mediterranean chub species. Common in Italian river systems." },
  { name_en: "Iberian Chub", latin_name: "Squalius pyrenaicus", category: "freshwater", habitat: "Rivers of Spain and Portugal", techniques: ["Float fishing"], baits: ["Bread","Worms","Insects"], description: "Endemic chub of the Iberian Peninsula. Adapted to Mediterranean climate rivers." },
  { name_en: "Cavedano", latin_name: "Squalius squalus", category: "freshwater", habitat: "Italian and Adriatic basin rivers", techniques: ["Float fishing","Fly fishing"], baits: ["Bread","Insects","Small spinners"], description: "Italian name for the Southern European chub. Abundant in Italian freshwaters." },
  { name_en: "Soufie", latin_name: "Telestes souffia", category: "freshwater", habitat: "Alpine and sub-Alpine streams", techniques: ["Float fishing","Fly fishing"], baits: ["Nymphs","Small maggots"], description: "Small rheophilic cyprinid of clean Alpine streams. Dark lateral band." },
  { name_en: "Common Carp (European)", latin_name: "Cyprinus carpio", category: "freshwater", habitat: "Lakes, rivers, ponds across all of Europe", techniques: ["Carp fishing","Float fishing","Feeder fishing","Surface fishing"], baits: ["Boilies","Corn","Bread","Pellets","Tiger nuts","Worms"], description: "Europe's most widely distributed large freshwater fish. Specimen hunting is hugely popular." },
  { name_en: "Wels Catfish (small)", latin_name: "Silurus glanis (juvenile)", category: "freshwater", habitat: "European rivers during growth phase", techniques: ["Ledgering","Float fishing"], baits: ["Worms","Dead bait","Maggots"], description: "Young wels catfish up to 1m. More commonly encountered than giant specimens." },

  // ─── GOBIES (European freshwater) ───
  { name_en: "Round Goby", latin_name: "Neogobius melanostomus", category: "freshwater", habitat: "Rivers, canals, harbors across Europe (invasive)", techniques: ["Drop shot","Float fishing"], baits: ["Worms","Small soft plastics"], description: "Invasive Ponto-Caspian goby spreading rapidly through European waterways. Aggressive bottom dweller." },
  { name_en: "Monkey Goby", latin_name: "Neogobius fluviatilis", category: "freshwater", habitat: "Black Sea drainages, Danube", techniques: ["Float fishing"], baits: ["Worms","Small baits"], description: "Bottom-dwelling goby of Danube and Black Sea tributaries." },
  { name_en: "Tubenose Goby", latin_name: "Proterorhinus marmoratus", category: "freshwater", habitat: "Danube and Black Sea rivers", techniques: ["Micro fishing"], baits: ["Small worms"], description: "Small goby with tubular nostrils. Native to Ponto-Caspian region, spreading westward." },
  { name_en: "Bighead Goby", latin_name: "Ponticola kessleri", category: "freshwater", habitat: "Danube River system", techniques: ["Float fishing","Drop shot"], baits: ["Worms","Small crabs"], description: "Largest European freshwater goby. Invasive in upper Danube." },

  // ─── STICKLEBACK ───
  { name_en: "Three-spined Stickleback", latin_name: "Gasterosteus aculeatus", category: "freshwater", habitat: "Streams, ponds, coastal waters across Europe", techniques: ["Micro fishing"], baits: ["Tiny worms","Micro baits"], description: "Tiny armored fish found almost everywhere in Europe. Males build nests and guard eggs." },
  { name_en: "Nine-spined Stickleback", latin_name: "Pungitius pungitius", category: "freshwater", habitat: "Weedy ponds and ditches across Northern Europe", techniques: ["Micro fishing"], baits: ["Tiny worms"], description: "Smaller and more secretive than three-spined. Found in vegetated still waters." },
  { name_en: "Fifteen-spined Stickleback", latin_name: "Spinachia spinachia", category: "saltwater", habitat: "Coastal waters of Northern Europe", techniques: ["Micro fishing"], baits: ["Tiny marine worms"], description: "Largest stickleback, found in seaweed along European coasts." },

  // ─── BURBOT ───
  { name_en: "Burbot", latin_name: "Lota lota", category: "freshwater", habitat: "Deep cold rivers and lakes of Northern Europe", techniques: ["Ledgering","Ice fishing","Night fishing"], baits: ["Dead bait","Worms","Fish strips","Liver"], description: "Only freshwater cod. Nocturnal and cold-loving. Breeds under ice in winter. Mottled skin." },

  // ─── SHAD ───
  { name_en: "Allis Shad", latin_name: "Alosa alosa", category: "anadromous", habitat: "Atlantic European rivers", techniques: ["Fly fishing","Spinning"], baits: ["Small spoons","Shad darts","Flies"], description: "Large anadromous herring entering European rivers to spawn. Rare and protected in most countries." },
  { name_en: "Twaite Shad", latin_name: "Alosa fallax", category: "anadromous", habitat: "European Atlantic and Mediterranean rivers", techniques: ["Fly fishing","Spinning"], baits: ["Small spoons","Flies","Shad darts"], description: "Smaller relative of allis shad. Series of dark spots along flank. Protected in many areas." },
  { name_en: "Pontic Shad", latin_name: "Alosa immaculata", category: "anadromous", habitat: "Black Sea and Danube River", techniques: ["Net fishing","Spinning"], baits: ["Small spoons","Flies"], description: "Commercially important shad of the Black Sea entering the Danube to spawn." },
  { name_en: "Caspian Shad", latin_name: "Alosa caspia", category: "anadromous", habitat: "Caspian Sea and tributary rivers", techniques: ["Net fishing"], baits: ["Small spoons"], description: "Important commercial species of the Caspian Sea." },
  { name_en: "Agone", latin_name: "Alosa agone", category: "freshwater", habitat: "Large Italian lakes (Como, Garda, Maggiore)", techniques: ["Net fishing","Trolling"], baits: ["Small spoons","Tiny flies"], description: "Landlocked shad of northern Italian lakes. Important local food fish." },

  // ─── BULLHEAD / SCULPIN ───
  { name_en: "Bullhead (European)", latin_name: "Cottus gobio", category: "freshwater", habitat: "Clean stony streams across Europe", techniques: ["Micro fishing"], baits: ["Small worms"], description: "Small bottom-dwelling sculpin of clean European streams. Large flattened head. Indicator of water quality." },
  { name_en: "Alpine Bullhead", latin_name: "Cottus poecilopus", category: "freshwater", habitat: "Cold mountain streams of Scandinavia and Alps", techniques: ["Micro fishing"], baits: ["Small worms"], description: "Cold-water sculpin of alpine and boreal streams. Spotted pectoral fins." },
  { name_en: "Siberian Sculpin", latin_name: "Cottus poecilopus", category: "freshwater", habitat: "Northern European cold streams", techniques: ["Micro fishing"], baits: ["Tiny invertebrates"], description: "Northern sculpin species found in Fennoscandia. Adapted to very cold water." },

  // ─── MISC FRESHWATER ───
  { name_en: "Wels Catfish (Ebro)", latin_name: "Silurus glanis (Ebro)", category: "freshwater", habitat: "River Ebro, Spain", techniques: ["Clonk fishing","Spinning","Ledgering"], baits: ["Large lures","Live bait","Dead bait","Pellets"], description: "Ebro River population known for enormous specimens exceeding 100kg. Premier catfish destination." },
  { name_en: "Common Nase", latin_name: "Chondrostoma nasus", category: "freshwater", habitat: "Fast-flowing rivers of Central Europe", techniques: ["Float fishing","Fly fishing"], baits: ["Bread","Algae paste","Small nymphs"], description: "Herbivorous cyprinid scraping algae from rocks with its specialized mouth." },
  { name_en: "Italian Nase", latin_name: "Protochondrostoma genei", category: "freshwater", habitat: "Rivers of the Po basin, Italy", techniques: ["Float fishing"], baits: ["Bread","Small worms"], description: "Endemic nase of Italian river systems." },
  { name_en: "Minnow Nase", latin_name: "Parachondrostoma miegii", category: "freshwater", habitat: "Iberian Peninsula rivers", techniques: ["Micro fishing"], baits: ["Tiny bread","Small worms"], description: "Small nase species of Spanish rivers." },
  { name_en: "Sabrefish", latin_name: "Pelecus cultratus", category: "freshwater", habitat: "Large rivers and lakes of Eastern Europe", techniques: ["Spinning","Fly fishing"], baits: ["Small spinners","Flies","Maggots"], description: "Surface-feeding predatory cyprinid with upturned mouth. Fast, agile hunter of small fish." },
  { name_en: "European Mudminnow", latin_name: "Umbra krameri", category: "freshwater", habitat: "Danube floodplains, marshy habitats", techniques: ["Not typically targeted"], baits: ["Small worms"], description: "Rare and protected species of lowland marshes. Can breathe atmospheric air. Endangered." },
  { name_en: "Sofie", latin_name: "Parachondrostoma toxostoma", category: "freshwater", habitat: "Rivers of France and Iberian Peninsula", techniques: ["Float fishing"], baits: ["Bread","Algae","Maggots"], description: "Southern European nase relative. Bottom-feeding herbivore of clean rivers." },
  { name_en: "Spirlin", latin_name: "Alburnoides bipunctatus", category: "freshwater", habitat: "Fast-flowing streams of Central Europe", techniques: ["Micro fishing","Float fishing"], baits: ["Tiny maggots","Small flies"], description: "Small shoaling cyprinid of clean gravel-bottom streams." },
  { name_en: "Zahnte", latin_name: "Vimba elongata", category: "freshwater", habitat: "Danube River tributaries", techniques: ["Float fishing"], baits: ["Worms","Maggots"], description: "Elongated vimba species of the Danube system." },
  { name_en: "Sichel", latin_name: "Pelecus cultratus", category: "freshwater", habitat: "Danube and other large Eastern European rivers", techniques: ["Spinning","Fly fishing"], baits: ["Flies","Small spinners"], description: "German name for sabrefish. Distinctive knife-like body shape." },
  { name_en: "Rapfen", latin_name: "Leuciscus aspius", category: "freshwater", habitat: "Large European rivers from Rhine to Ural", techniques: ["Spinning","Fly fishing","Surface lures"], baits: ["Spinners","Plugs","Surface lures","Streamers"], description: "German/Austrian name for asp. Surface-hunting predatory cyprinid." },
  { name_en: "Lake Minnow", latin_name: "Phoxinus percnurus", category: "freshwater", habitat: "Boggy ponds and lake margins", techniques: ["Micro fishing"], baits: ["Tiny worms"], description: "Rare European minnow tolerant of acidic, oxygen-poor water." },
  { name_en: "Blageon", latin_name: "Telestes souffia", category: "freshwater", habitat: "Southern French and Alpine streams", techniques: ["Float fishing"], baits: ["Small maggots","Nymphs"], description: "French name for soufie. Small cyprinid of clean mountain streams." },
  { name_en: "Toxostome", latin_name: "Parachondrostoma toxostoma", category: "freshwater", habitat: "Southern French rivers", techniques: ["Float fishing"], baits: ["Bread","Algae"], description: "French nase species. Herbivorous bottom feeder." },
  { name_en: "Freshwater Blenny", latin_name: "Salaria fluviatilis", category: "freshwater", habitat: "Mediterranean rivers and lakes", techniques: ["Micro fishing"], baits: ["Small worms","Tiny insects"], description: "Only European freshwater blenny. Found in Mediterranean basin rivers." },
  { name_en: "Valencia Toothcarp", latin_name: "Valencia hispanica", category: "freshwater", habitat: "Coastal wetlands of eastern Spain", techniques: ["Not targeted - protected"], baits: ["N/A"], description: "Critically endangered killifish endemic to Spanish coastal marshes." },
  { name_en: "Corfu Toothcarp", latin_name: "Valencia letourneuxi", category: "freshwater", habitat: "Springs and streams of western Greece and Albania", techniques: ["Not targeted - protected"], baits: ["N/A"], description: "Endangered killifish of the Ionian region." },
  { name_en: "Spanish Minnowcarp", latin_name: "Anaecypris hispanica", category: "freshwater", habitat: "Guadiana River basin, Spain/Portugal", techniques: ["Not targeted - protected"], baits: ["N/A"], description: "Critically endangered endemic cyprinid of the Iberian Peninsula." },
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
