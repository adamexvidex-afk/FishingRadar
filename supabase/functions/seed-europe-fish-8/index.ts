import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const fish = [
  // French freshwater
  { name_en: "Toxostome", latin_name: "Parachondrostoma toxostoma", category: "freshwater", habitat: "French rivers: Rhône, Garonne, Loire", techniques: ["Float fishing"], baits: ["Bread","Worms","Maggots"] },
  { name_en: "Vandoise (French Dace)", latin_name: "Leuciscus burdigalensis", category: "freshwater", habitat: "French Atlantic rivers", techniques: ["Float fishing","Fly fishing"], baits: ["Maggots","Small flies"] },
  { name_en: "Goujon (French Gudgeon)", latin_name: "Gobio occitaniae", category: "freshwater", habitat: "Southern French rivers", techniques: ["Float fishing","Light tackle"], baits: ["Worms","Maggots"] },
  { name_en: "Blageon", latin_name: "Telestes souffia", category: "freshwater", habitat: "Rhône basin, Alpine rivers", techniques: ["Float fishing","Fly fishing"], baits: ["Nymphs","Maggots"] },
  { name_en: "Spirlin", latin_name: "Alburnoides bipunctatus (FR)", category: "freshwater", habitat: "French rivers", techniques: ["Float fishing","Light tackle"], baits: ["Maggots","Bread"] },
  { name_en: "Chabot (French Bullhead)", latin_name: "Cottus gobio (FR)", category: "freshwater", habitat: "French streams", techniques: ["Light tackle"], baits: ["Worms","Larvae"] },
  { name_en: "Loach (French)", latin_name: "Barbatula quignardi", category: "freshwater", habitat: "Southern French streams", techniques: ["Light tackle"], baits: ["Small worms"] },
  { name_en: "Sofie", latin_name: "Parachondrostoma toxostoma (sofie)", category: "freshwater", habitat: "Rhône and Danube basins", techniques: ["Float fishing"], baits: ["Bread","Worms"] },
  // German / Austrian freshwater
  { name_en: "Nerfling", latin_name: "Leuciscus idus (DE)", category: "freshwater", habitat: "German and Austrian rivers", techniques: ["Float fishing","Fly fishing"], baits: ["Bread","Worms","Flies"] },
  { name_en: "Hasel (German Dace)", latin_name: "Leuciscus leuciscus (DE)", category: "freshwater", habitat: "German rivers and streams", techniques: ["Float fishing","Fly fishing"], baits: ["Maggots","Bread","Flies"] },
  // 210 done
  { name_en: "Aland", latin_name: "Leuciscus idus (Aland)", category: "freshwater", habitat: "German and Scandinavian rivers", techniques: ["Float fishing","Fly fishing","Spinning"], baits: ["Bread","Worms","Small lures"] },
  { name_en: "Rapfen (German)", latin_name: "Leuciscus aspius (DE)", category: "freshwater", habitat: "German rivers: Rhine, Elbe, Danube", techniques: ["Spinning","Fly fishing","Casting"], baits: ["Small lures","Streamers","Topwater"] },
  { name_en: "Döbel (German Chub)", latin_name: "Squalius cephalus (DE)", category: "freshwater", habitat: "German rivers", techniques: ["Spinning","Float fishing","Fly fishing"], baits: ["Bread","Cherry","Worms","Small lures"] },
  { name_en: "Quappe (German Burbot)", latin_name: "Lota lota (DE)", category: "freshwater", habitat: "German rivers and lakes", techniques: ["Bottom fishing","Night fishing"], baits: ["Worms","Dead fish","Liver"] },
  { name_en: "Aalrutte (Austrian Burbot)", latin_name: "Lota lota (AT)", category: "freshwater", habitat: "Austrian Alpine lakes and rivers", techniques: ["Bottom fishing","Night fishing"], baits: ["Worms","Dead fish"] },
  // Polish / Czech freshwater
  { name_en: "Sandacz (Polish Zander)", latin_name: "Sander lucioperca (PL)", category: "freshwater", habitat: "Polish rivers: Vistula, Oder, Bug", techniques: ["Spinning","Jigging","Bottom fishing"], baits: ["Soft plastics","Jigs","Live bait"] },
  { name_en: "Sum (Polish Catfish)", latin_name: "Silurus glanis (PL)", category: "freshwater", habitat: "Polish rivers: Vistula, Bug, Narew", techniques: ["Bottom fishing","Live bait"], baits: ["Live fish","Dead bait","Pellets"] },
  { name_en: "Szczupak (Polish Pike)", latin_name: "Esox lucius (PL)", category: "freshwater", habitat: "Polish rivers and lakes", techniques: ["Spinning","Trolling","Dead baiting"], baits: ["Spoons","Plugs","Dead bait"] },
  { name_en: "Candát (Czech Zander)", latin_name: "Sander lucioperca (CZ)", category: "freshwater", habitat: "Czech rivers: Vltava, Labe, Morava", techniques: ["Spinning","Jigging"], baits: ["Soft plastics","Jigs","Live bait"] },
  { name_en: "Sumec (Czech Catfish)", latin_name: "Silurus glanis (CZ)", category: "freshwater", habitat: "Czech rivers: Dyje, Morava", techniques: ["Bottom fishing","Live bait"], baits: ["Dead fish","Pellets","Liver"] },
  // 220 done
  // Hungarian freshwater
  { name_en: "Harcsa (Hungarian Catfish)", latin_name: "Silurus glanis (HU)", category: "freshwater", habitat: "Hungarian rivers: Danube, Tisza", techniques: ["Bottom fishing","Live bait","Clonk fishing"], baits: ["Live fish","Dead bait","Pellets"] },
  { name_en: "Süllő (Hungarian Zander)", latin_name: "Sander lucioperca (HU)", category: "freshwater", habitat: "Hungarian Danube, Lake Balaton, Tisza", techniques: ["Spinning","Jigging","Bottom fishing"], baits: ["Soft plastics","Jigs","Live bait"] },
  { name_en: "Csuka (Hungarian Pike)", latin_name: "Esox lucius (HU)", category: "freshwater", habitat: "Hungarian rivers and lakes", techniques: ["Spinning","Trolling"], baits: ["Spoons","Plugs","Live bait"] },
  { name_en: "Fogas (Balaton Pikeperch)", latin_name: "Sander lucioperca (Balaton)", category: "freshwater", habitat: "Lake Balaton, Hungary", techniques: ["Trolling","Jigging","Bottom fishing"], baits: ["Live bait","Jigs","Spoons"] },
  { name_en: "Kecsege (Hungarian Sterlet)", latin_name: "Acipenser ruthenus (HU)", category: "freshwater", habitat: "Hungarian Danube", techniques: ["Bottom fishing"], baits: ["Worms","Shrimp","Cut fish"] },
  // Croatian / Slovenian freshwater
  { name_en: "Soška Postrv (Marble Trout SI)", latin_name: "Salmo marmoratus (SI)", category: "freshwater", habitat: "Soča River, Slovenia", techniques: ["Fly fishing","Spinning"], baits: ["Streamers","Nymphs","Small spinners"] },
  { name_en: "Potočna Postrv (Brown Trout SI)", latin_name: "Salmo trutta (SI)", category: "freshwater", habitat: "Slovenian streams and rivers", techniques: ["Fly fishing","Spinning"], baits: ["Flies","Nymphs","Spinners"] },
  { name_en: "Lipljen (Grayling SI)", latin_name: "Thymallus thymallus (SI)", category: "freshwater", habitat: "Slovenian Alpine rivers", techniques: ["Fly fishing"], baits: ["Dry flies","Nymphs"] },
  { name_en: "Šaran (Croatian Carp)", latin_name: "Cyprinus carpio (HR)", category: "freshwater", habitat: "Croatian rivers and lakes", techniques: ["Bottom fishing","Float fishing","Boilie fishing"], baits: ["Corn","Boilies","Bread"] },
  { name_en: "Smuđ (Croatian Zander)", latin_name: "Sander lucioperca (HR)", category: "freshwater", habitat: "Croatian Danube, Drava, Sava", techniques: ["Spinning","Jigging"], baits: ["Soft plastics","Jigs","Live bait"] },
  // 230 done
  // Nordic freshwater additions
  { name_en: "Harr (Swedish Grayling)", latin_name: "Thymallus thymallus (SE)", category: "freshwater", habitat: "Swedish rivers and streams", techniques: ["Fly fishing"], baits: ["Dry flies","Nymphs"] },
  { name_en: "Gädda (Swedish Pike)", latin_name: "Esox lucius (SE)", category: "freshwater", habitat: "Swedish lakes and Baltic archipelago", techniques: ["Spinning","Fly fishing","Trolling"], baits: ["Spoons","Jerkbaits","Flies"] },
  { name_en: "Gös (Swedish Zander)", latin_name: "Sander lucioperca (SE)", category: "freshwater", habitat: "Swedish lakes: Mälaren, Hjälmaren, Vänern", techniques: ["Spinning","Jigging","Trolling"], baits: ["Soft plastics","Jigs","Crankbaits"] },
  { name_en: "Abborre (Swedish Perch)", latin_name: "Perca fluviatilis (SE)", category: "freshwater", habitat: "Swedish lakes and rivers", techniques: ["Spinning","Drop shot","Float fishing"], baits: ["Jigs","Worms","Maggots"] },
  { name_en: "Lake (Swedish Burbot)", latin_name: "Lota lota (SE)", category: "freshwater", habitat: "Swedish lakes, especially Norrland", techniques: ["Night fishing","Ice fishing"], baits: ["Worms","Dead fish","Liver"] },
  { name_en: "Sik (Swedish Whitefish)", latin_name: "Coregonus lavaretus (SE)", category: "freshwater", habitat: "Swedish lakes and rivers", techniques: ["Fly fishing","Trolling","Ice fishing"], baits: ["Small flies","Jigs","Maggots"] },
  { name_en: "Röding (Swedish Charr)", latin_name: "Salvelinus alpinus (SE)", category: "freshwater", habitat: "Swedish mountain lakes", techniques: ["Trolling","Fly fishing","Ice fishing"], baits: ["Spoons","Flies","Jigs"] },
  { name_en: "Hauki (Finnish Pike)", latin_name: "Esox lucius (FI)", category: "freshwater", habitat: "Finnish lakes and Baltic coast", techniques: ["Spinning","Trolling","Fly fishing"], baits: ["Spoons","Jerkbaits","Flies"] },
  { name_en: "Kuha (Finnish Zander)", latin_name: "Sander lucioperca (FI)", category: "freshwater", habitat: "Finnish lakes", techniques: ["Jigging","Spinning","Trolling"], baits: ["Jigs","Soft plastics","Crankbaits"] },
  { name_en: "Ahven (Finnish Perch)", latin_name: "Perca fluviatilis (FI)", category: "freshwater", habitat: "Finnish lakes and rivers", techniques: ["Spinning","Drop shot","Ice fishing"], baits: ["Jigs","Worms","Small lures"] },
  // 240 done
  { name_en: "Taimen (Finnish)", latin_name: "Hucho taimen (FI)", category: "freshwater", habitat: "Northern Finnish rivers (rare)", techniques: ["Fly fishing","Spinning"], baits: ["Large streamers","Spoons"] },
  { name_en: "Made (Finnish Burbot)", latin_name: "Lota lota (FI)", category: "freshwater", habitat: "Finnish lakes and rivers", techniques: ["Night fishing","Ice fishing"], baits: ["Worms","Dead fish","Liver"] },
  { name_en: "Lohi (Finnish Salmon)", latin_name: "Salmo salar (FI)", category: "anadromous", habitat: "Finnish rivers: Tornionjoki, Tenojoki", techniques: ["Fly fishing","Spinning"], baits: ["Flies","Spoons","Wobblers"] },
  // Mediterranean freshwater
  { name_en: "Valencia Toothcarp", latin_name: "Valencia hispanica", category: "freshwater", habitat: "Spanish Mediterranean coast", techniques: ["Protected species"], baits: [] },
  { name_en: "Greek Toothcarp", latin_name: "Valencia letourneuxi", category: "freshwater", habitat: "Western Greece", techniques: ["Protected species"], baits: [] },
  { name_en: "Skadar Bleak", latin_name: "Alburnus scoranza", category: "freshwater", habitat: "Lake Skadar, Montenegro/Albania", techniques: ["Float fishing"], baits: ["Bread","Maggots"] },
  { name_en: "Prespa Bleak", latin_name: "Alburnus belvica", category: "freshwater", habitat: "Lake Prespa, North Macedonia", techniques: ["Float fishing"], baits: ["Bread","Maggots"] },
  { name_en: "Dalmatian Nase", latin_name: "Chondrostoma knerii", category: "freshwater", habitat: "Dalmatian rivers", techniques: ["Float fishing"], baits: ["Bread","Worms"] },
  { name_en: "Adriatic Dace", latin_name: "Squalius svallize", category: "freshwater", habitat: "Adriatic rivers: Neretva", techniques: ["Float fishing","Fly fishing"], baits: ["Bread","Small flies"] },
  { name_en: "Neretva Nase", latin_name: "Chondrostoma knerii (Neretva)", category: "freshwater", habitat: "Neretva River, Bosnia/Croatia", techniques: ["Float fishing"], baits: ["Bread","Worms"] },
  // 250 done
  // More Mediterranean saltwater
  { name_en: "Common Stingray (Med)", latin_name: "Dasyatis pastinaca (Med)", category: "saltwater", habitat: "Mediterranean coasts", techniques: ["Bottom fishing","Surf casting"], baits: ["Squid","Fish","Crab"] },
  { name_en: "Striped Sea Bream", latin_name: "Lithognathus mormyrus", category: "saltwater", habitat: "Mediterranean, Eastern Atlantic", techniques: ["Surf casting","Bottom fishing"], baits: ["Worms","Shrimp","Crab"] },
  { name_en: "Marbled Spinefoot", latin_name: "Siganus rivulatus", category: "saltwater", habitat: "Eastern Mediterranean (Lessepsian)", techniques: ["Float fishing","Light tackle"], baits: ["Bread","Algae"] },
  { name_en: "Dusky Spinefoot", latin_name: "Siganus luridus", category: "saltwater", habitat: "Eastern Mediterranean (Lessepsian)", techniques: ["Float fishing","Light tackle"], baits: ["Bread","Algae"] },
  { name_en: "Narrow-barred Spanish Mackerel (Med)", latin_name: "Scomberomorus commerson (Med)", category: "saltwater", habitat: "Eastern Mediterranean (invasive)", techniques: ["Trolling","Casting"], baits: ["Lures","Live bait"] },
  { name_en: "Common Pandora", latin_name: "Pagellus erythrinus (common)", category: "saltwater", habitat: "Mediterranean coasts", techniques: ["Bottom fishing","Light tackle"], baits: ["Shrimp","Worms","Squid"] },
  { name_en: "Large-eye Dentex", latin_name: "Dentex macrophthalmus", category: "saltwater", habitat: "Mediterranean, Eastern Atlantic", techniques: ["Bottom fishing","Jigging"], baits: ["Squid","Shrimp","Live bait"] },
  { name_en: "Pink Dentex", latin_name: "Dentex gibbosus", category: "saltwater", habitat: "Mediterranean, Eastern Atlantic", techniques: ["Bottom fishing","Jigging"], baits: ["Live bait","Squid","Shrimp"] },
  { name_en: "Yellowmouth Barracuda", latin_name: "Sphyraena viridensis", category: "saltwater", habitat: "Mediterranean, Macaronesian islands", techniques: ["Spinning","Trolling","Casting"], baits: ["Lures","Live bait","Poppers"] },
  { name_en: "European Flying Fish", latin_name: "Cheilopogon heterurus", category: "saltwater", habitat: "Mediterranean, Eastern Atlantic", techniques: ["Not typically angled"], baits: [] },
  // 260 done
  // British Isles freshwater
  { name_en: "Grayling (British)", latin_name: "Thymallus thymallus (UK)", category: "freshwater", habitat: "English and Welsh chalk streams", techniques: ["Fly fishing","Trotting"], baits: ["Nymphs","Dry flies","Maggots"] },
  { name_en: "Barbel (British)", latin_name: "Barbus barbus (UK)", category: "freshwater", habitat: "English rivers: Trent, Severn, Hampshire Avon", techniques: ["Feeder fishing","Rolling meat","Float fishing"], baits: ["Pellets","Hemp","Luncheon meat","Corn"] },
  { name_en: "Chub (British)", latin_name: "Squalius cephalus (UK)", category: "freshwater", habitat: "English rivers", techniques: ["Float fishing","Spinning","Fly fishing"], baits: ["Bread","Cheese","Slugs","Worms"] },
  { name_en: "Perch (British)", latin_name: "Perca fluviatilis (UK)", category: "freshwater", habitat: "English rivers and lakes", techniques: ["Spinning","Float fishing","Drop shot"], baits: ["Worms","Maggots","Small lures"] },
  { name_en: "Crucian Carp (British)", latin_name: "Carassius carassius (UK)", category: "freshwater", habitat: "English ponds and small lakes", techniques: ["Float fishing","Lift method"], baits: ["Bread","Sweetcorn","Maggots"] },
  { name_en: "Golden Rudd", latin_name: "Scardinius erythrophthalmus (golden)", category: "freshwater", habitat: "British and Irish ponds", techniques: ["Float fishing"], baits: ["Bread","Maggots","Sweetcorn"] },
  { name_en: "Bream (British)", latin_name: "Abramis brama (UK)", category: "freshwater", habitat: "English rivers and lakes", techniques: ["Feeder fishing","Float fishing"], baits: ["Worms","Maggots","Sweetcorn"] },
  { name_en: "Tench (British)", latin_name: "Tinca tinca (UK)", category: "freshwater", habitat: "English lakes and ponds", techniques: ["Float fishing","Feeder fishing","Lift method"], baits: ["Sweetcorn","Bread","Worms","Maggots"] },
  { name_en: "Gudgeon (British)", latin_name: "Gobio gobio (UK)", category: "freshwater", habitat: "English rivers and streams", techniques: ["Float fishing"], baits: ["Maggots","Worms","Pinkie"] },
  { name_en: "Stone Loach (British)", latin_name: "Barbatula barbatula (UK)", category: "freshwater", habitat: "English streams", techniques: ["Micro fishing"], baits: ["Small worms"] },
  // 270 done
  // Eastern European species
  { name_en: "Don Ruffe", latin_name: "Gymnocephalus acerina", category: "freshwater", habitat: "Don and Dnieper rivers", techniques: ["Bottom fishing"], baits: ["Worms","Maggots"] },
  { name_en: "Amur Pike", latin_name: "Esox reichertii", category: "freshwater", habitat: "Amur basin (introduced in parts of Europe)", techniques: ["Spinning","Trolling"], baits: ["Spoons","Plugs","Live bait"] },
  { name_en: "Belica", latin_name: "Leucaspius delineatus (Balkans)", category: "freshwater", habitat: "Balkan rivers and ponds", techniques: ["Micro fishing"], baits: ["Bread crumbs","Tiny maggots"] },
  { name_en: "Danube Gudgeon", latin_name: "Gobio obtusirostris", category: "freshwater", habitat: "Danube and tributaries", techniques: ["Float fishing","Light tackle"], baits: ["Worms","Maggots"] },
  { name_en: "Danube Roach", latin_name: "Rutilus virgo (roach)", category: "freshwater", habitat: "Danube basin", techniques: ["Float fishing"], baits: ["Maggots","Bread","Worms"] },
  { name_en: "Sichel", latin_name: "Pelecus cultratus (sichel)", category: "freshwater", habitat: "Danube, Volga, Baltic rivers", techniques: ["Spinning","Fly fishing"], baits: ["Small lures","Streamers"] },
  { name_en: "European Weatherfish", latin_name: "Misgurnus fossilis (EU)", category: "freshwater", habitat: "European floodplains and marshes", techniques: ["Light tackle"], baits: ["Worms"] },
  { name_en: "Spiny Loach", latin_name: "Cobitis elongatoides", category: "freshwater", habitat: "Central European rivers", techniques: ["Micro fishing"], baits: ["Tiny worms"] },
  { name_en: "Golden Loach", latin_name: "Sabanejewia baltica", category: "freshwater", habitat: "Baltic basin rivers", techniques: ["Micro fishing"], baits: ["Small worms"] },
  { name_en: "Italian Goby", latin_name: "Padogobius nigricans", category: "freshwater", habitat: "Italian streams", techniques: ["Micro fishing"], baits: ["Small worms","Larvae"] },
  // 280 done
  // More species to reach 300
  { name_en: "Alver (Swedish Bleak)", latin_name: "Alburnus alburnus (SE)", category: "freshwater", habitat: "Swedish rivers and lakes", techniques: ["Float fishing","Light tackle"], baits: ["Maggots","Bread"] },
  { name_en: "Mört (Swedish Roach)", latin_name: "Rutilus rutilus (SE)", category: "freshwater", habitat: "Swedish lakes and rivers", techniques: ["Float fishing","Ice fishing"], baits: ["Maggots","Bread","Worms"] },
  { name_en: "Braxen (Swedish Bream)", latin_name: "Abramis brama (SE)", category: "freshwater", habitat: "Swedish lakes", techniques: ["Float fishing","Feeder fishing"], baits: ["Worms","Maggots","Corn"] },
  { name_en: "Sarv (Swedish Rudd)", latin_name: "Scardinius erythrophthalmus (SE)", category: "freshwater", habitat: "Swedish lakes and ponds", techniques: ["Float fishing"], baits: ["Bread","Maggots"] },
  { name_en: "Sutare (Swedish Tench)", latin_name: "Tinca tinca (SE)", category: "freshwater", habitat: "Swedish lakes", techniques: ["Float fishing","Bottom fishing"], baits: ["Worms","Corn","Bread"] },
  { name_en: "Ruda (Swedish Crucian Carp)", latin_name: "Carassius carassius (SE)", category: "freshwater", habitat: "Swedish ponds and small lakes", techniques: ["Float fishing"], baits: ["Bread","Worms","Maggots"] },
  { name_en: "Löja (Swedish Vendace)", latin_name: "Coregonus albula (SE)", category: "freshwater", habitat: "Swedish lakes, especially Norrland", techniques: ["Ice fishing","Light tackle"], baits: ["Small jigs","Maggots"] },
  { name_en: "Nors (Swedish Smelt)", latin_name: "Osmerus eperlanus (SE)", category: "anadromous", habitat: "Swedish Baltic coast", techniques: ["Light tackle","Float fishing"], baits: ["Shrimp","Worms"] },
  { name_en: "Ål (Swedish Eel)", latin_name: "Anguilla anguilla (SE)", category: "freshwater", habitat: "Swedish rivers and coast", techniques: ["Bottom fishing","Night fishing"], baits: ["Worms","Dead fish"] },
  { name_en: "Mal (Swedish Catfish)", latin_name: "Silurus glanis (SE)", category: "freshwater", habitat: "Southern Swedish rivers: Emån, Helgeån", techniques: ["Bottom fishing","Live bait"], baits: ["Live fish","Dead bait","Worms"] },
  // 290 done
  { name_en: "Stør (Norwegian Sturgeon)", latin_name: "Acipenser sturio (NO)", category: "anadromous", habitat: "Norwegian fjords (extremely rare)", techniques: ["Protected species"], baits: [] },
  { name_en: "Laks (Norwegian Salmon)", latin_name: "Salmo salar (NO)", category: "anadromous", habitat: "Norwegian rivers: Alta, Tana, Gaula, Namsen", techniques: ["Fly fishing","Spinning"], baits: ["Salmon flies","Spoons","Wobblers"] },
  { name_en: "Sjøørret (Norwegian Sea Trout)", latin_name: "Salmo trutta (NO sea)", category: "anadromous", habitat: "Norwegian coast and rivers", techniques: ["Fly fishing","Spinning","Float fishing"], baits: ["Flies","Spoons","Shrimp"] },
  { name_en: "Ørret (Norwegian Brown Trout)", latin_name: "Salmo trutta (NO)", category: "freshwater", habitat: "Norwegian rivers and mountain lakes", techniques: ["Fly fishing","Spinning"], baits: ["Flies","Worms","Spoons"] },
  { name_en: "Røye (Norwegian Charr)", latin_name: "Salvelinus alpinus (NO)", category: "freshwater", habitat: "Norwegian mountain lakes", techniques: ["Fly fishing","Spinning","Trolling"], baits: ["Flies","Spoons","Worms"] },
  { name_en: "Harr (Norwegian Grayling)", latin_name: "Thymallus thymallus (NO)", category: "freshwater", habitat: "Norwegian rivers", techniques: ["Fly fishing"], baits: ["Dry flies","Nymphs"] },
  { name_en: "Gjedde (Norwegian Pike)", latin_name: "Esox lucius (NO)", category: "freshwater", habitat: "Norwegian lakes and rivers", techniques: ["Spinning","Fly fishing","Trolling"], baits: ["Spoons","Jerkbaits","Flies"] },
  { name_en: "Abbor (Norwegian Perch)", latin_name: "Perca fluviatilis (NO)", category: "freshwater", habitat: "Norwegian lakes", techniques: ["Spinning","Float fishing","Drop shot"], baits: ["Jigs","Worms","Small lures"] },
  { name_en: "Sørv (Norwegian Rudd)", latin_name: "Scardinius erythrophthalmus (NO)", category: "freshwater", habitat: "Southern Norwegian lakes", techniques: ["Float fishing"], baits: ["Bread","Maggots","Worms"] },
  { name_en: "Mort (Norwegian Roach)", latin_name: "Rutilus rutilus (NO)", category: "freshwater", habitat: "Norwegian lakes and rivers", techniques: ["Float fishing","Ice fishing"], baits: ["Maggots","Bread","Worms"] },
  // 300 done
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
