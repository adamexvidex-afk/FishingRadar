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

// European Freshwater Fish – Batch 1: Cyprinids, Salmonids, Perch family
const europeanFish: Fish[] = [
  // ─── CYPRINIDS (Carp family) ───
  { name_en: "Common Barbel", latin_name: "Barbus barbus", category: "freshwater", habitat: "Fast-flowing European rivers with gravel bottoms", techniques: ["Ledgering","Float fishing","Feeder fishing"], baits: ["Hemp seed","Luncheon meat","Pellets","Maggots"], description: "Powerful bottom-feeder of European rivers. Bronze flanks with barbels around mouth. Excellent sport fish." },
  { name_en: "Mediterranean Barbel", latin_name: "Barbus meridionalis", category: "freshwater", habitat: "Southern European streams and rivers", techniques: ["Float fishing","Ledgering"], baits: ["Worms","Maggots","Bread"], description: "Smaller barbel species found in Mediterranean drainages. Spotted pattern on body." },
  { name_en: "Iberian Barbel", latin_name: "Luciobarbus comizo", category: "freshwater", habitat: "Rivers of the Iberian Peninsula", techniques: ["Float fishing","Ledgering"], baits: ["Bread","Worms","Corn"], description: "Large barbel endemic to Spanish and Portuguese rivers. Can exceed 10kg." },
  { name_en: "Italian Barbel", latin_name: "Barbus plebejus", category: "freshwater", habitat: "Rivers and streams of northern Italy", techniques: ["Float fishing","Ledgering"], baits: ["Maggots","Worms","Cheese paste"], description: "Native barbel of Italian river systems. Important sport fish in Po basin." },
  { name_en: "Nase", latin_name: "Chondrostoma nasus", category: "freshwater", habitat: "Fast-flowing rivers of Central Europe", techniques: ["Float fishing","Fly fishing"], baits: ["Bread","Algae imitations","Small nymphs"], description: "Herbivorous cyprinid with distinctive underslung mouth. Feeds on algae from rocks." },
  { name_en: "French Nase", latin_name: "Parachondrostoma toxostoma", category: "freshwater", habitat: "Rivers of southern France", techniques: ["Float fishing"], baits: ["Bread","Algae","Small maggots"], description: "Endemic to French river systems. Similar to common nase but smaller." },
  { name_en: "Sneep", latin_name: "Chondrostoma nasus", category: "freshwater", habitat: "Dutch and Belgian rivers", techniques: ["Float fishing"], baits: ["Bread","Small worms"], description: "Rare in northwestern Europe. Protected in many countries." },
  { name_en: "Vimba Bream", latin_name: "Vimba vimba", category: "freshwater", habitat: "Rivers and brackish waters of Eastern Europe", techniques: ["Float fishing","Ledgering"], baits: ["Worms","Maggots","Bread"], description: "Anadromous cyprinid migrating from Baltic Sea into rivers. Dark coloring during spawning." },
  { name_en: "White Bream", latin_name: "Blicca bjoerkna", category: "freshwater", habitat: "Slow-flowing rivers and lakes across Europe", techniques: ["Float fishing","Feeder fishing"], baits: ["Maggots","Bread","Worms"], description: "Often confused with common bream but smaller with reddish pectoral fins." },
  { name_en: "Common Bream", latin_name: "Abramis brama", category: "freshwater", habitat: "Lowland lakes and slow rivers across Europe", techniques: ["Feeder fishing","Float fishing","Ledgering"], baits: ["Worms","Maggots","Sweetcorn","Bread"], description: "Deep-bodied cyprinid common in European lowland waters. Excellent match fishing target." },
  { name_en: "Danube Bream", latin_name: "Ballerus sapa", category: "freshwater", habitat: "Large rivers of Eastern Europe and Danube basin", techniques: ["Float fishing","Ledgering"], baits: ["Worms","Maggots"], description: "Elongated bream of the Danube system. Silvery with long anal fin." },
  { name_en: "Blue Bream", latin_name: "Ballerus ballerus", category: "freshwater", habitat: "Large rivers of Eastern Europe", techniques: ["Float fishing","Ledgering"], baits: ["Worms","Maggots","Bread"], description: "Also called zope. Found in large rivers from Rhine to Ural." },
  { name_en: "Ide", latin_name: "Leuciscus idus", category: "freshwater", habitat: "Rivers and lakes of Northern and Central Europe", techniques: ["Float fishing","Spinning","Fly fishing"], baits: ["Bread","Worms","Small spinners","Dry flies"], description: "Attractive silvery fish turning golden with age. Popular target in Scandinavian countries." },
  { name_en: "Golden Orfe", latin_name: "Leuciscus idus (golden)", category: "freshwater", habitat: "Ornamental ponds and lakes across Europe", techniques: ["Float fishing","Fly fishing"], baits: ["Bread","Flies","Small worms"], description: "Golden variety of the ide. Popular ornamental and sport fish." },
  { name_en: "Dace", latin_name: "Leuciscus leuciscus", category: "freshwater", habitat: "Clean flowing rivers across Europe", techniques: ["Float fishing","Fly fishing","Trotting"], baits: ["Maggots","Bread","Small dry flies","Casters"], description: "Fast-water cyprinid of European rivers. Silvery with slightly forked tail. Popular winter target." },
  { name_en: "Soufie", latin_name: "Telestes souffia", category: "freshwater", habitat: "Mountain streams of Central and Southern Europe", techniques: ["Float fishing","Fly fishing"], baits: ["Small nymphs","Maggots"], description: "Small cyprinid of clean mountain streams. Dark lateral stripe on silvery body." },
  { name_en: "Riffle Minnow", latin_name: "Alburnoides bipunctatus", category: "freshwater", habitat: "Fast-flowing streams across Europe", techniques: ["Float fishing","Fly fishing"], baits: ["Tiny maggots","Small nymphs"], description: "Small shoaling fish of European streams. Double row of dark spots along lateral line." },
  { name_en: "Schneider", latin_name: "Alburnoides bipunctatus", category: "freshwater", habitat: "Clean flowing streams of Central Europe", techniques: ["Micro fishing","Float fishing"], baits: ["Tiny baits","Maggots"], description: "Small cyprinid found in gravelly streams. Important indicator of water quality." },
  { name_en: "Bleak", latin_name: "Alburnus alburnus", category: "freshwater", habitat: "Lakes and rivers throughout Europe", techniques: ["Float fishing","Fly fishing"], baits: ["Tiny maggots","Bread","Small flies"], description: "Small silvery shoaling fish. Historically used for pearl essence from scales." },
  { name_en: "Sunbleak", latin_name: "Leucaspius delineatus", category: "freshwater", habitat: "Still waters and ponds across Europe", techniques: ["Micro fishing","Float fishing"], baits: ["Tiny maggots","Bread"], description: "Very small cyprinid of European ponds. Incomplete lateral line distinguishes it." },
  { name_en: "Asp", latin_name: "Leuciscus aspius", category: "freshwater", habitat: "Large rivers of Central and Eastern Europe", techniques: ["Spinning","Fly fishing","Lure fishing"], baits: ["Small fish","Spinners","Streamers","Plugs"], description: "Europe's largest predatory cyprinid. Explosive surface strikes on baitfish. Can exceed 10kg." },
  { name_en: "Roach", latin_name: "Rutilus rutilus", category: "freshwater", habitat: "Lakes, rivers, canals across Europe", techniques: ["Float fishing","Feeder fishing","Pole fishing"], baits: ["Maggots","Bread","Hemp","Casters"], description: "One of Europe's most widespread and popular coarse fish. Red fins and silver body." },
  { name_en: "Rudd", latin_name: "Scardinius erythrophthalmus", category: "freshwater", habitat: "Weedy lakes and ponds across Europe", techniques: ["Float fishing","Fly fishing"], baits: ["Bread","Maggots","Small dry flies","Sweetcorn"], description: "Golden-bodied cyprinid with vivid red fins. Surface feeder in weedy waters." },
  { name_en: "Italian Rudd", latin_name: "Scardinius hesperidicus", category: "freshwater", habitat: "Northern Italian lakes", techniques: ["Float fishing"], baits: ["Bread","Maggots","Corn"], description: "Endemic rudd of Italian lakes. Similar to common rudd but genetically distinct." },
  { name_en: "Greek Rudd", latin_name: "Scardinius graecus", category: "freshwater", habitat: "Lake Yliki, Greece", techniques: ["Float fishing"], baits: ["Bread","Worms"], description: "Critically endangered rudd endemic to a single Greek lake." },
  { name_en: "Tench", latin_name: "Tinca tinca", category: "freshwater", habitat: "Weedy lakes, ponds, slow rivers", techniques: ["Float fishing","Ledgering","Feeder fishing"], baits: ["Worms","Bread","Sweetcorn","Maggots","Pellets"], description: "Green-gold cyprinid with tiny barbels. Slimy skin. Prized European coarse fish, fights hard." },
  { name_en: "Golden Tench", latin_name: "Tinca tinca (golden)", category: "freshwater", habitat: "Ornamental ponds and lakes", techniques: ["Float fishing"], baits: ["Worms","Bread","Sweetcorn"], description: "Golden ornamental variety of tench. Increasingly found in wild waters." },
  { name_en: "Crucian Carp", latin_name: "Carassius carassius", category: "freshwater", habitat: "Weedy ponds, small lakes across Europe", techniques: ["Float fishing","Pole fishing"], baits: ["Bread","Maggots","Worms","Sweetcorn"], description: "Deep-bodied golden carp. Remarkably hardy, surviving low oxygen. True crucians are increasingly rare." },
  { name_en: "Prussian Carp", latin_name: "Carassius gibelio", category: "freshwater", habitat: "Lakes and rivers, especially Eastern Europe", techniques: ["Float fishing","Feeder fishing"], baits: ["Bread","Worms","Maggots","Corn"], description: "Invasive relative of goldfish spreading across Europe. Reproduces by gynogenesis." },
  { name_en: "F1 Carp", latin_name: "Cyprinus carpio × Carassius", category: "freshwater", habitat: "Commercial fisheries across UK and Europe", techniques: ["Float fishing","Feeder fishing","Pole fishing"], baits: ["Pellets","Maggots","Corn","Bread"], description: "Hybrid between common carp and crucian. Fast-growing, popular in commercial fisheries." },
  { name_en: "Mirror Carp", latin_name: "Cyprinus carpio (mirror)", category: "freshwater", habitat: "Lakes, rivers, reservoirs across Europe", techniques: ["Carp fishing","Ledgering","Surface fishing"], baits: ["Boilies","Pellets","Sweetcorn","Tiger nuts","Bread"], description: "Scaled variant of common carp with irregular large scales. Prized specimen fish in Europe." },
  { name_en: "Leather Carp", latin_name: "Cyprinus carpio (leather)", category: "freshwater", habitat: "European lakes and reservoirs", techniques: ["Carp fishing","Ledgering"], baits: ["Boilies","Pellets","Sweetcorn","Tiger nuts"], description: "Scaleless variant of common carp. Smooth skin. Rare and highly prized by anglers." },
  { name_en: "Linear Carp", latin_name: "Cyprinus carpio (linear)", category: "freshwater", habitat: "European lakes and fisheries", techniques: ["Carp fishing","Ledgering"], baits: ["Boilies","Pellets","Pop-ups","Sweetcorn"], description: "Mirror carp variant with scales in a line along the lateral line only." },
  { name_en: "Grass Carp", latin_name: "Ctenopharyngodon idella", category: "freshwater", habitat: "Lakes and rivers across Europe (introduced)", techniques: ["Float fishing","Surface fishing"], baits: ["Bread","Corn","Cherry tomatoes","Reed stems"], description: "Large herbivorous fish introduced for weed control. Can exceed 30kg in Europe." },
  { name_en: "Silver Carp", latin_name: "Hypophthalmichthys molitrix", category: "freshwater", habitat: "Large rivers and reservoirs of Eastern Europe", techniques: ["Float fishing","Feeder fishing"], baits: ["Bread","Phytoplankton-based baits","Technoplankton"], description: "Filter-feeding Asian carp established in Danube system. Famous for jumping when disturbed." },
  { name_en: "Bighead Carp", latin_name: "Hypophthalmichthys nobilis", category: "freshwater", habitat: "Large rivers of Eastern and Central Europe", techniques: ["Float fishing"], baits: ["Specialized plankton baits","Bread"], description: "Large-headed filter feeder established in Eastern European waters." },
  { name_en: "Topmouth Gudgeon", latin_name: "Pseudorasbora parva", category: "freshwater", habitat: "Ponds and small lakes across Europe (invasive)", techniques: ["Micro fishing"], baits: ["Tiny maggots","Bread"], description: "Small invasive species from Asia spreading through European waters. Carrier of parasites." },
  { name_en: "Gudgeon", latin_name: "Gobio gobio", category: "freshwater", habitat: "Gravel-bottomed rivers and streams across Europe", techniques: ["Float fishing","Trotting"], baits: ["Maggots","Small worms","Bread"], description: "Small bottom-dwelling cyprinid with barbels. Popular first fish for beginners." },
  { name_en: "Danube Gudgeon", latin_name: "Gobio obtusirostris", category: "freshwater", habitat: "Rivers of the Danube drainage", techniques: ["Float fishing"], baits: ["Maggots","Small worms"], description: "Gudgeon species native to the Danube watershed. Blunt snout distinguishes it." },
  { name_en: "Stone Loach", latin_name: "Barbatula barbatula", category: "freshwater", habitat: "Clean streams across Europe", techniques: ["Micro fishing"], baits: ["Tiny worms","Maggots"], description: "Small bottom-dwelling fish of clean European streams. Six barbels around mouth." },
  { name_en: "Spined Loach", latin_name: "Cobitis taenia", category: "freshwater", habitat: "Sandy-bottomed rivers and streams", techniques: ["Micro fishing"], baits: ["Tiny worms"], description: "Small loach with erectile spine below each eye. Secretive bottom dweller." },
  { name_en: "Weatherfish", latin_name: "Misgurnus fossilis", category: "freshwater", habitat: "Muddy ditches and floodplains of Central Europe", techniques: ["Micro fishing"], baits: ["Small worms"], description: "Eel-like loach sensitive to barometric pressure. Protected in many countries." },
  { name_en: "Minnow", latin_name: "Phoxinus phoxinus", category: "freshwater", habitat: "Clean streams and rivers across Europe", techniques: ["Micro fishing","Fly fishing"], baits: ["Tiny maggots","Small dry flies"], description: "Tiny schooling fish of clean European waters. Males become colorful in breeding season." },
  { name_en: "Swamp Minnow", latin_name: "Phoxinus percnurus", category: "freshwater", habitat: "Boggy ponds of Eastern Europe", techniques: ["Micro fishing"], baits: ["Tiny worms","Bread"], description: "Rare minnow of acidic, oxygen-poor waters. Endangered in Western Europe." },
  { name_en: "Moderlieschen", latin_name: "Leucaspius delineatus", category: "freshwater", habitat: "Still and slow waters of Central Europe", techniques: ["Micro fishing"], baits: ["Tiny maggots"], description: "Belica or sunbleak. Very small surface-dwelling cyprinid." },
  { name_en: "Bitterling", latin_name: "Rhodeus amarus", category: "freshwater", habitat: "Still waters with freshwater mussels", techniques: ["Micro fishing"], baits: ["Tiny bread","Maggots"], description: "Tiny iridescent fish that lays eggs inside freshwater mussels. Protected species." },
  { name_en: "Ziege", latin_name: "Pelecus cultratus", category: "freshwater", habitat: "Large rivers and lakes of Eastern Europe", techniques: ["Spinning","Fly fishing"], baits: ["Small spinners","Flies","Streamer flies"], description: "Sabre-shaped predatory cyprinid. Surface feeder with upturned mouth. Fast swimmer." },

  // ─── SALMONIDS ───
  { name_en: "Atlantic Salmon", latin_name: "Salmo salar", category: "anadromous", habitat: "North Atlantic rivers and coastal waters", techniques: ["Fly fishing","Spinning"], baits: ["Salmon flies","Spoons","Spinners","Worms"], description: "King of European game fish. Migrates from ocean to natal rivers to spawn. Legendary sport fish." },
  { name_en: "Baltic Salmon", latin_name: "Salmo salar (Baltic)", category: "anadromous", habitat: "Baltic Sea rivers", techniques: ["Trolling","Spinning","Fly fishing"], baits: ["Spoons","Plugs","Flies"], description: "Baltic population of Atlantic salmon. Important fishery in Scandinavian rivers." },
  { name_en: "Danube Salmon (Huchen)", latin_name: "Hucho hucho", category: "freshwater", habitat: "Fast-flowing Danube tributaries", techniques: ["Spinning","Fly fishing"], baits: ["Large streamers","Plugs","Spoons","Dead bait"], description: "Europe's largest salmonid, exceeding 30kg. Rare and protected. Apex predator of alpine rivers." },
  { name_en: "Brown Trout (European)", latin_name: "Salmo trutta fario", category: "freshwater", habitat: "Streams, rivers, lakes across Europe", techniques: ["Fly fishing","Spinning","Bait fishing"], baits: ["Nymphs","Dry flies","Spinners","Worms"], description: "Native European trout. Highly variable in color and size depending on habitat." },
  { name_en: "Sea Trout", latin_name: "Salmo trutta trutta", category: "anadromous", habitat: "Coastal waters and rivers of Europe", techniques: ["Fly fishing","Spinning","Trolling"], baits: ["Sea trout flies","Spoons","Sandeel imitations"], description: "Anadromous form of brown trout. Silvery ocean-going fish returning to rivers to spawn." },
  { name_en: "Lake Trout (European)", latin_name: "Salmo trutta lacustris", category: "freshwater", habitat: "Large alpine lakes of Europe", techniques: ["Trolling","Spinning","Fly fishing"], baits: ["Spoons","Plugs","Streamers"], description: "Lacustrine form of brown trout in deep alpine lakes. Can grow very large." },
  { name_en: "Marble Trout", latin_name: "Salmo marmoratus", category: "freshwater", habitat: "Rivers of the Adriatic drainage (Slovenia, Italy)", techniques: ["Fly fishing","Spinning"], baits: ["Large streamers","Nymphs","Spinners"], description: "Endemic to Adriatic rivers. Distinctive marble pattern. Can exceed 25kg. Slovenia's iconic fish." },
  { name_en: "Adriatic Trout", latin_name: "Salmo obtusirostris", category: "freshwater", habitat: "Rivers of Croatia, Bosnia, Montenegro", techniques: ["Fly fishing"], baits: ["Dry flies","Nymphs","Small streamers"], description: "Rare softmouth trout of Adriatic rivers. Endangered and protected." },
  { name_en: "Ohrid Trout", latin_name: "Salmo letnica", category: "freshwater", habitat: "Lake Ohrid, North Macedonia/Albania", techniques: ["Fly fishing","Trolling"], baits: ["Streamers","Spoons","Small fish"], description: "Endemic trout of ancient Lake Ohrid. Important local food and sport fish." },
  { name_en: "Sevan Trout", latin_name: "Salmo ischchan", category: "freshwater", habitat: "Lake Sevan, Armenia", techniques: ["Fly fishing","Spinning"], baits: ["Spoons","Flies","Worms"], description: "Endemic trout of Lake Sevan. Several morphs exist. Endangered." },
  { name_en: "Carpathian Brook Trout", latin_name: "Salvelinus fontinalis (European pop.)", category: "freshwater", habitat: "Mountain streams of Central Europe (introduced)", techniques: ["Fly fishing","Spinning"], baits: ["Small nymphs","Dry flies","Spinners"], description: "Introduced from North America to European mountain streams. Naturalized in many areas." },
  { name_en: "Arctic Char (European)", latin_name: "Salvelinus alpinus", category: "freshwater", habitat: "Cold lakes of Scandinavia, Alps, Iceland, UK", techniques: ["Fly fishing","Spinning","Trolling"], baits: ["Spoons","Flies","Worms","Small fish"], description: "Northernmost freshwater fish. Found in deep cold lakes. Spectacular spawning colors." },
  { name_en: "European Grayling", latin_name: "Thymallus thymallus", category: "freshwater", habitat: "Clean rivers across Europe", techniques: ["Fly fishing","Float fishing","Trotting"], baits: ["Nymphs","Dry flies","Maggots","Worms"], description: "The 'lady of the stream' with spectacular sail-like dorsal fin. Thyme-scented when fresh." },
  { name_en: "Danube Grayling", latin_name: "Thymallus thymallus (Danube pop.)", category: "freshwater", habitat: "Upper Danube tributaries", techniques: ["Fly fishing"], baits: ["Small nymphs","Dry flies"], description: "Large grayling population of Danube tributaries. Some of Europe's finest grayling fishing." },
  { name_en: "European Whitefish", latin_name: "Coregonus lavaretus", category: "freshwater", habitat: "Deep cold lakes of Northern and Alpine Europe", techniques: ["Fly fishing","Trolling","Ice fishing"], baits: ["Small nymphs","Maggots","Tiny jigs"], description: "Complex of whitefish species in European lakes. Important commercial and sport fish." },
  { name_en: "Vendace", latin_name: "Coregonus albula", category: "freshwater", habitat: "Cold, deep lakes of Northern Europe", techniques: ["Net fishing","Ice fishing"], baits: ["Tiny jigs","Maggots"], description: "Small pelagic whitefish of Scandinavian and British lakes. Important forage species." },
  { name_en: "Powan", latin_name: "Coregonus lavaretus (British)", category: "freshwater", habitat: "Loch Lomond and Loch Eck, Scotland", techniques: ["Fly fishing"], baits: ["Small nymphs","Tiny flies"], description: "British population of European whitefish. Rare and protected." },
  { name_en: "Schelly", latin_name: "Coregonus lavaretus (English)", category: "freshwater", habitat: "Lake District, England", techniques: ["Fly fishing"], baits: ["Small nymphs"], description: "English lake whitefish. Found only in a few Lake District waters. Very rare." },
  { name_en: "Gwyniad", latin_name: "Coregonus pennantii", category: "freshwater", habitat: "Llyn Tegid (Bala Lake), Wales", techniques: ["Fly fishing"], baits: ["Small nymphs"], description: "Whitefish endemic to a single Welsh lake. Protected under UK law." },
  { name_en: "Pollan", latin_name: "Coregonus pollan", category: "freshwater", habitat: "Lough Neagh and other Irish lakes", techniques: ["Net fishing","Fly fishing"], baits: ["Small nymphs","Tiny flies"], description: "Irish whitefish found in several large lakes. Important commercial fish in Lough Neagh." },
  { name_en: "Peled", latin_name: "Coregonus peled", category: "freshwater", habitat: "Lakes of Finland and Northern Russia", techniques: ["Ice fishing","Fly fishing"], baits: ["Small jigs","Maggots"], description: "Fast-growing whitefish introduced to many European lakes for aquaculture." },
  { name_en: "European Smelt", latin_name: "Osmerus eperlanus", category: "anadromous", habitat: "Estuaries and coastal rivers of Northern Europe", techniques: ["Float fishing","Pier fishing"], baits: ["Small fish strips","Maggots","Shrimp"], description: "Small anadromous fish smelling of cucumber. Important forage and commercial species." },

  // ─── PERCH FAMILY ───
  { name_en: "European Perch", latin_name: "Perca fluviatilis", category: "freshwater", habitat: "Lakes, rivers, canals across Europe", techniques: ["Spinning","Drop shot","Float fishing","Fly fishing"], baits: ["Worms","Spinners","Soft plastics","Jigs","Maggots"], description: "Iconic striped predator. Bold dark bars on green-gold body. Europe's most popular predatory fish." },
  { name_en: "Zander", latin_name: "Sander lucioperca", category: "freshwater", habitat: "Large rivers, lakes, reservoirs across Europe", techniques: ["Spinning","Jigging","Dead baiting","Drop shot"], baits: ["Soft plastics","Jigs","Dead bait fish","Plugs"], description: "Europe's premier predatory fish. Ghost-like eyes for hunting in murky water. Excellent eating." },
  { name_en: "Volga Zander", latin_name: "Sander volgensis", category: "freshwater", habitat: "Rivers of Eastern Europe, Danube basin", techniques: ["Spinning","Jigging"], baits: ["Soft plastics","Jigs","Small fish"], description: "Smaller zander species of Eastern European rivers. More gregarious than common zander." },
  { name_en: "Streber", latin_name: "Zingel streber", category: "freshwater", habitat: "Fast-flowing Danube tributaries", techniques: ["Not typically targeted"], baits: ["Small invertebrates"], description: "Small bottom-dwelling percid of Danube system. Endangered and protected." },
  { name_en: "Zingel", latin_name: "Zingel zingel", category: "freshwater", habitat: "Danube and its tributaries", techniques: ["Not typically targeted"], baits: ["Small invertebrates"], description: "Larger relative of streber. Nocturnal bottom dweller of Danube system. Very rare." },
  { name_en: "Ruffe", latin_name: "Gymnocephalus cernua", category: "freshwater", habitat: "Lakes and slow rivers across Northern Europe", techniques: ["Float fishing","Drop shot"], baits: ["Worms","Maggots","Tiny jigs"], description: "Small spiny perch-like fish. Slimy with large head. Often caught as bycatch." },
  { name_en: "Schraetzer", latin_name: "Gymnocephalus schraetser", category: "freshwater", habitat: "Danube River system", techniques: ["Not typically targeted"], baits: ["Small invertebrates"], description: "Elongated ruffe relative endemic to the Danube. Very rare and protected." },
  { name_en: "Don Ruffe", latin_name: "Gymnocephalus acerina", category: "freshwater", habitat: "Rivers draining to Black Sea", techniques: ["Float fishing"], baits: ["Small worms"], description: "Eastern European ruffe species. Found in Don, Dnieper and other Black Sea drainages." },
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
