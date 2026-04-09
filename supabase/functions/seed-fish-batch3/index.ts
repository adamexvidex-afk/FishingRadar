import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateFish() {
  const fish: any[] = [];
  
  // Tropical reef fish
  const tropicalReef = [
    "Queen Angelfish","French Angelfish","Rock Beauty","Blue Tang","Sergeant Major","Bicolor Damselfish",
    "Yellowtail Damselfish","Indigo Hamlet","Butter Hamlet","Blue Hamlet","Nassau Grouper Juvenile",
    "Trumpetfish","Cornetfish","Bandtail Puffer","Sharpnose Puffer","Smooth Trunkfish","Scrawled Cowfish",
    "Spotted Moray","Green Moray","Purplemouth Moray","Chain Moray","Spotted Eagle Ray","Southern Stingray",
    "Yellow Stingray","Atlantic Torpedo Ray","Spotted Drum","Jackknife Fish","High Hat","Tobaccofish",
    "Harlequin Bass","Chalk Bass","Peppermint Bass","Fairy Basslet","Royal Gramma","Blackcap Basslet",
    "Yellowhead Jawfish","Dusky Jawfish","Spotted Jawfish","Sand Tilefish","Yellow Goby","Neon Goby",
    "Cleaning Goby","Rusty Goby","Sharknose Goby","Goldspot Goby","Bridled Goby","Dash Goby",
    "Hovering Goby","Yellowline Goby","Tiger Goby","Pallid Goby","Banner Goby","Orangespotted Goby",
    "Masked Goby","Glass Goby","Leopard Goby","Barsnout Goby","Seminole Goby","Peppermint Goby",
    "Colon Goby","Spotlight Goby","Yellownose Goby","Broadstripe Goby","Shortstripe Goby","Tusked Goby",
    "Island Goby","Crested Goby","Lyre Goby","Ember Goby","Blue Chromis","Brown Chromis","Sunshine Chromis",
    "Purple Reeffish","Cocoa Damselfish","Threespot Damselfish","Dusky Damselfish","Longfin Damselfish",
    "Beaugregory","Night Sergeant","Bluehead Wrasse","Yellowhead Wrasse","Clown Wrasse","Slippery Dick",
    "Puddingwife","Hogfish","Spanish Hogfish","Creole Wrasse","Rainbow Wrasse","Blackear Wrasse",
    "Painted Wrasse","Greenband Wrasse","Dwarf Wrasse","Rosy Razorfish","Pearly Razorfish","Green Razorfish",
    "Princess Parrotfish","Queen Parrotfish","Stoplight Parrotfish","Rainbow Parrotfish","Midnight Parrotfish",
    "Blue Parrotfish","Redband Parrotfish","Striped Parrotfish","Redtail Parrotfish","Bucktooth Parrotfish",
    "Yellowtail Parrotfish","Greenblotch Parrotfish","Redlip Blenny","Diamond Blenny","Sailfin Blenny",
    "Arrow Blenny","Roughhead Blenny","Downy Blenny","Hairy Blenny","Seaweed Blenny","Molly Miller",
    "Crested Blenny","Banded Blenny","Marbled Blenny","Pikeblenny","Bluethroat Pikeblenny",
    "Yellowface Pikeblenny","Quillfin Blenny","Barred Blenny","Palehead Blenny","Pearl Blenny",
    "Dwarf Blenny","Key Blenny","Goldline Blenny","Tessellated Blenny","Banner Blenny","Coral Blenny",
    "Blennius Blenny","Saddled Blenny","Spotcheek Blenny","Spinyhead Blenny","Glass Blenny",
    "Rosy Blenny","Mimic Blenny","Orangeside Triggerfish","Sargassum Triggerfish","Rough Triggerfish",
    "Black Durgon","Scrawled Filefish","Slender Filefish","Orangespotted Filefish","Whitespotted Filefish",
    "Pygmy Filefish","Planehead Filefish","Fringed Filefish","Unicorn Filefish","Dotterel Filefish",
    "Honeycomb Cowfish","Buffalo Trunkfish","Spotted Trunkfish","Boxfish","Striped Burrfish",
    "Web Burrfish","Porcupinefish","Balloonfish","Bridled Burrfish","Spotted Burrfish",
    "Bandtail Searobin","Spotted Searobin","Northern Searobin","Flying Gurnard","Bighead Searobin",
    "Leopard Searobin","Shortfin Searobin","Bluespotted Searobin","Barred Searobin","Streamer Searobin",
  ];

  // Deep-sea and pelagic species
  const deepSea = [
    "Lanternfish","Viperfish","Dragonfish","Hatchetfish","Bristlemouth",
    "Fangtooth","Black Swallower","Barreleye","Grenadier","Orange Roughy",
    "Patagonian Toothfish","Antarctic Icefish","Sablefish","Escolar","Oilfish",
    "Dealfish","Oarfish","Ribbonfish","Cutlassfish","Hairtail",
    "Snake Mackerel","Gemfish","Butterfish","Silver Dory","Mirror Dory",
    "Oreo Dory","Alfonsino","Roughy","Slickhead","Tube-eye",
    "Threadfin","Dragonet","Stargazer","Atlantic Midshipman","Plainfin Midshipman",
    "Toadfish","Oyster Toadfish","Gulf Toadfish","Clingfish","Lumpfish",
    "Lumpsucker","Pacific Spiny Lumpsucker","Snailfish","Tadpole Snailfish","Sea Snail",
  ];

  // Pacific reef and coastal
  const pacificCoastal = [
    "Garibaldi","Opaleye","Halfmoon","Kelp Bass","Barred Sand Bass",
    "Spotted Sand Bass","Giant Sea Bass","Black Sea Bass","Kelp Greenling","Rock Greenling",
    "Painted Greenling","Whitespotted Greenling","Masked Greenling","Longspine Combfish",
    "Shortspine Combfish","Pacific Staghorn Sculpin","Buffalo Sculpin","Red Irish Lord",
    "Brown Irish Lord","Cabezon","Pacific Sculpin","Great Sculpin","Yellow Sculpin",
    "Sailfin Sculpin","Longfin Sculpin","Tidepool Sculpin","Fluffy Sculpin","Padded Sculpin",
    "Roughback Sculpin","Slim Sculpin","Sharpnose Sculpin","Marbled Sculpin","Riffle Sculpin",
    "Prickly Sculpin","Coastrange Sculpin","Slimy Sculpin","Torrent Sculpin","Reticulate Sculpin",
    "Shorthead Sculpin","Bear Lake Sculpin","Mottled Sculpin","Deepwater Sculpin","Fourhorn Sculpin",
    "Spoonhead Sculpin","Spinyhead Sculpin","Arctic Sculpin","Myoxocephalus Sculpin",
    "Pacific Ocean Perch","Canary Rockfish","Yellowtail Rockfish","Widow Rockfish","Bocaccio",
    "Chilipepper","Cowcod","Vermilion Rockfish","Copper Rockfish","Quillback Rockfish",
    "Brown Rockfish","Grass Rockfish","Black Rockfish","Blue Rockfish","Olive Rockfish",
    "Yelloweye Rockfish","China Rockfish","Gopher Rockfish","Kelp Rockfish","Treefish",
    "Tiger Rockfish","Rosethorn Rockfish","Starry Rockfish","Honeycomb Rockfish","Speckled Rockfish",
    "Aurora Rockfish","Blackgill Rockfish","Shortraker Rockfish","Rougheye Rockfish","Longspine Thornyhead",
    "Shortspine Thornyhead","Splitnose Rockfish","Halfbanded Rockfish","Swordspine Rockfish",
    "Pink Rockfish","Greenstriped Rockfish","Greenspotted Rockfish","Harlequin Rockfish",
    "Stripetail Rockfish","Pygmy Rockfish","Puget Sound Rockfish","Redstripe Rockfish",
    "Silvergray Rockfish","Darkblotched Rockfish","Squarespot Rockfish","Calico Rockfish",
  ];

  // Worldwide freshwater species
  const worldFreshwater = [
    "European Catfish","Zander","Asp","Ide","Rudd","Tench","Crucian Carp","Silver Bream",
    "White Bream","Bitterling","Gudgeon","Minnow","Dace","Nase","Vimba","Sichel",
    "Schneider","Spirlin","Soufie","Toxostome","Barbel","Mediterranean Barbel",
    "Ebro Barbel","Comizo Barbel","Iberian Barbel","Danube Salmon","Adriatic Salmon",
    "Softmouth Trout","Marble Trout","Ohrid Trout","Sevan Trout","Caspian Trout",
    "Aral Trout","Issyk-Kul Trout","Tibetan Snowtrout","Chinese Paddlefish","Chinese Sturgeon",
    "Kaluga Sturgeon","Beluga Sturgeon","Russian Sturgeon","Stellate Sturgeon","Ship Sturgeon",
    "Persian Sturgeon","Adriatic Sturgeon","Siberian Sturgeon","Amur Sturgeon","Sterlet",
    "Japanese Eel","European Eel","Giant Mottled Eel","Longfin Eel","Shortfin Eel",
    "Glass Eel","Conger Eel","Garden Eel","Snake Eel","Worm Eel",
    "Amazon Catfish","Redtail Catfish","Tiger Shovelnose","Piraiba","Jau",
    "Jundia","Pintado","Cachara","Dourada","Jaú",
    "Pimelodus Catfish","Oxydoras niger","Megalodoras uranoscopus","Pterodoras granulosus",
    "Hemisorubim platyrhynchos","Sorubim lima","Pseudoplatystoma fasciatum",
    "Phractocephalus hemioliopterus","Brachyplatystoma filamentosum","Brachyplatystoma rousseauxii",
    "Giant Snakehead","Striped Snakehead","Bullseye Snakehead","Asian Swamp Eel",
    "Walking Catfish","Clarias Catfish","Pangasius Catfish","Mekong Giant Catfish",
    "Giant Freshwater Stingray","Freshwater Sawfish","Ganges Shark","Bull Shark (freshwater)",
    "River Shark","Sawback Angelshark","Freshwater Needlefish","Freshwater Pipefish",
    "Freshwater Seahorse","Freshwater Pufferfish","Freshwater Sole","Freshwater Flounder",
    "Freshwater Drum (African)","Freshwater Butterfish","Freshwater Herring","Freshwater Sardine",
    "Freshwater Anchovy","Threadfin Shad","Gizzard Shad","American Shad","Hickory Shad",
    "Alewife","Blueback Herring","Skipjack Herring","Alabama Shad","River Herring",
    "Twaite Shad","Allis Shad","Pontic Shad","Caspian Shad","Agone",
    "Smelt (Rainbow)","Smelt (Pond)","Smelt (Delta)","Smelt (Night)","Eulachon",
    "Capelin","Sand Lance","Pacific Sand Lance","Atlantic Silverside","Inland Silverside",
    "Brook Silverside","Tidewater Silverside","Key Silverside","Reef Silverside",
    "Hardhead Silverside","California Grunion","Jacksmelt","Topsmelt",
  ];

  // Sharks and rays
  const sharksRays = [
    "Great White Shark","Tiger Shark","Hammerhead Shark","Bull Shark","Blacktip Shark",
    "Spinner Shark","Lemon Shark","Nurse Shark","Mako Shark","Thresher Shark",
    "Blue Shark","Porbeagle Shark","Dusky Shark","Sandbar Shark","Silky Shark",
    "Oceanic Whitetip","Caribbean Reef Shark","Blacktip Reef Shark","Whitetip Reef Shark",
    "Gray Reef Shark","Galapagos Shark","Bronze Whaler","Night Shark","Bignose Shark",
    "Finetooth Shark","Atlantic Sharpnose","Bonnethead Shark","Scalloped Hammerhead",
    "Great Hammerhead","Smooth Hammerhead","Winghead Shark","Scoophead Shark",
    "Leopard Shark","Sevengill Shark","Sixgill Shark","Horn Shark","Swell Shark",
    "Cat Shark","Chain Catshark","Roughskin Dogfish","Spiny Dogfish","Smooth Dogfish",
    "Atlantic Angel Shark","Pacific Angel Shark","Sawshark","Goblin Shark",
    "Megamouth Shark","Basking Shark","Whale Shark","Greenland Shark","Cookie-cutter Shark",
    "Cownose Ray","Bat Ray","Butterfly Ray","Devil Ray","Manta Ray",
    "Mobula Ray","Electric Ray","Lesser Electric Ray","Atlantic Torpedo","Pacific Torpedo",
    "Round Stingray","Atlantic Stingray","Bluntnose Stingray","Roughtail Stingray",
    "Pelagic Stingray","Longnose Skate","Big Skate","Clearnose Skate","Winter Skate",
    "Little Skate","Barndoor Skate","Thorny Skate","Roundnose Skate","Starry Skate",
    "California Skate","Sandpaper Skate","Longtail Skate","Brier Skate",
    "Guitarfish","Shovelnose Guitarfish","Thornback Guitarfish","Bowmouth Guitarfish",
  ];

  const categories: Record<string, { category: string; habitat: string; techniques: string[]; baits: string[] }> = {
    tropical: { category: "saltwater", habitat: "Tropical coral reefs and coastal waters", techniques: ["Light tackle","Fly fishing","Spearfishing"], baits: ["Small jigs","Live shrimp","Cut bait"] },
    deep: { category: "saltwater", habitat: "Deep ocean waters worldwide", techniques: ["Deep dropping","Bottom fishing"], baits: ["Squid","Cut bait","Glow jigs"] },
    pacific: { category: "saltwater", habitat: "Pacific coast rocky reefs and kelp beds", techniques: ["Jigging","Bottom fishing","Casting"], baits: ["Live bait","Swimbaits","Jigs"] },
    freshwater: { category: "freshwater", habitat: "Rivers, lakes and streams worldwide", techniques: ["Spinning","Fly fishing","Bait fishing"], baits: ["Worms","Small lures","Live bait"] },
    shark: { category: "saltwater", habitat: "Coastal and pelagic waters", techniques: ["Shark fishing","Heavy tackle","Drift fishing"], baits: ["Live bait","Cut bait","Chum"] },
  };

  const addGroup = (names: string[], cat: string) => {
    const info = categories[cat];
    for (const name of names) {
      fish.push({
        name_en: name,
        latin_name: null,
        category: info.category,
        habitat: info.habitat,
        techniques: info.techniques,
        baits: info.baits,
        description: `${name} — found in ${info.habitat.toLowerCase()}.`,
      });
    }
  };

  addGroup(tropicalReef, "tropical");
  addGroup(deepSea, "deep");
  addGroup(pacificCoastal, "pacific");
  addGroup(worldFreshwater, "freshwater");
  addGroup(sharksRays, "shark");

  return fish;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: existing } = await supabase.from("fish_species").select("name_en");
    const existingNames = new Set((existing || []).map((f: any) => f.name_en.toLowerCase()));

    const allFish = generateFish();
    const newFish = allFish.filter(f => !existingNames.has(f.name_en.toLowerCase()));

    let inserted = 0;
    const batchSize = 50;
    for (let i = 0; i < newFish.length; i += batchSize) {
      const batch = newFish.slice(i, i + batchSize);
      const { error } = await supabase.from("fish_species").insert(batch);
      if (!error) inserted += batch.length;
    }

    return new Response(
      JSON.stringify({ success: true, total_new: newFish.length, inserted, existing_count: existingNames.size }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
