import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: existing } = await supabase.from("fishing_locations").select("name");
  const existingNames = new Set((existing || []).map((l: any) => l.name.toLowerCase()));

  const locations = [
    // More Alaska
    { name: "Alagnak River", lat: 59.05, lng: -156.25, category: "river", state: "Alaska", species: ["King Salmon","Sockeye Salmon","Rainbow Trout"] },
    { name: "Togiak River", lat: 59.08, lng: -160.35, category: "river", state: "Alaska", species: ["King Salmon","Silver Salmon","Arctic Char"] },

    // More Maine
    { name: "Aziscohos Lake", lat: 44.98, lng: -71.03, category: "lake", state: "Maine", species: ["Brook Trout","Landlocked Salmon"] },
    { name: "Chesuncook Lake", lat: 46.05, lng: -69.42, category: "lake", state: "Maine", species: ["Lake Trout","Brook Trout","Landlocked Salmon"] },

    // Massachusetts
    { name: "Quabbin Reservoir", lat: 42.38, lng: -72.32, category: "reservoir", state: "Massachusetts", species: ["Lake Trout","Landlocked Salmon","Smallmouth Bass"] },
    { name: "Cape Cod Canal", lat: 41.77, lng: -70.50, category: "bay", state: "Massachusetts", species: ["Striped Bass","Bluefish","Tautog"] },
    { name: "Wachusett Reservoir", lat: 42.38, lng: -71.72, category: "reservoir", state: "Massachusetts", species: ["Lake Trout","Landlocked Salmon","Smallmouth Bass"] },
    { name: "Connecticut River MA", lat: 42.10, lng: -72.60, category: "river", state: "Massachusetts", species: ["Smallmouth Bass","Shad","Striped Bass"] },

    // More Michigan
    { name: "Manistee River", lat: 44.25, lng: -86.33, category: "river", state: "Michigan", species: ["Steelhead","Brown Trout","Chinook Salmon"] },
    { name: "Torch Lake MI", lat: 44.97, lng: -85.35, category: "lake", state: "Michigan", species: ["Lake Trout","Smallmouth Bass","Yellow Perch"] },
    { name: "Lake Gogebic", lat: 46.50, lng: -89.58, category: "lake", state: "Michigan", species: ["Walleye","Northern Pike","Smallmouth Bass","Perch"] },
    { name: "Muskegon River", lat: 43.55, lng: -86.02, category: "river", state: "Michigan", species: ["Steelhead","Chinook Salmon","Walleye"] },
    { name: "Crystal Lake MI", lat: 44.68, lng: -86.05, category: "lake", state: "Michigan", species: ["Cisco","Smallmouth Bass","Brown Trout"] },

    // More Minnesota
    { name: "Lake Vermilion MN", lat: 47.85, lng: -92.28, category: "lake", state: "Minnesota", species: ["Walleye","Northern Pike","Muskie","Crappie"] },
    { name: "Boundary Waters MN", lat: 48.08, lng: -91.72, category: "lake", state: "Minnesota", species: ["Walleye","Northern Pike","Smallmouth Bass","Lake Trout"] },
    { name: "Winnibigoshish Lake", lat: 47.42, lng: -94.05, category: "lake", state: "Minnesota", species: ["Walleye","Northern Pike","Perch"] },
    { name: "Cass Lake MN", lat: 47.38, lng: -94.58, category: "lake", state: "Minnesota", species: ["Walleye","Northern Pike","Yellow Perch","Muskie"] },
    { name: "Kabetogama Lake", lat: 48.45, lng: -93.05, category: "lake", state: "Minnesota", species: ["Walleye","Smallmouth Bass","Northern Pike","Crappie"] },

    // More Wisconsin
    { name: "Lac Courte Oreilles", lat: 46.00, lng: -91.48, category: "lake", state: "Wisconsin", species: ["Muskie","Walleye","Largemouth Bass","Panfish"] },
    { name: "Lake Mendota WI", lat: 43.10, lng: -89.42, category: "lake", state: "Wisconsin", species: ["Walleye","Northern Pike","Largemouth Bass","Panfish"] },
    { name: "Sturgeon Bay WI", lat: 44.83, lng: -87.38, category: "bay", state: "Wisconsin", species: ["Smallmouth Bass","Walleye","Northern Pike","Salmon"] },
    { name: "Green Bay WI", lat: 44.58, lng: -87.92, category: "bay", state: "Wisconsin", species: ["Walleye","Northern Pike","Muskie","Yellow Perch"] },
    { name: "Minocqua Chain", lat: 45.88, lng: -89.72, category: "lake", state: "Wisconsin", species: ["Muskie","Walleye","Largemouth Bass"] },

    // More Colorado
    { name: "Lake Granby", lat: 40.15, lng: -105.85, category: "lake", state: "Colorado", species: ["Rainbow Trout","Brown Trout","Kokanee Salmon","Lake Trout"] },
    { name: "Williams Fork Reservoir", lat: 39.97, lng: -106.18, category: "reservoir", state: "Colorado", species: ["Northern Pike","Lake Trout","Rainbow Trout"] },
    { name: "Horsetooth Reservoir", lat: 40.55, lng: -105.17, category: "reservoir", state: "Colorado", species: ["Walleye","Smallmouth Bass","Rainbow Trout"] },
    { name: "Taylor River CO", lat: 38.82, lng: -106.82, category: "river", state: "Colorado", species: ["Brown Trout","Rainbow Trout"] },
    { name: "Arkansas River CO", lat: 38.52, lng: -106.05, category: "river", state: "Colorado", species: ["Brown Trout","Rainbow Trout","Cutthroat Trout"] },

    // More Texas
    { name: "Lake Conroe", lat: 30.38, lng: -95.55, category: "lake", state: "Texas", species: ["Largemouth Bass","Crappie","Catfish","Hybrid Striped Bass"] },
    { name: "Lake Travis TX", lat: 30.42, lng: -97.92, category: "lake", state: "Texas", species: ["Largemouth Bass","Guadalupe Bass","Striped Bass"] },
    { name: "Lake Livingston TX", lat: 30.72, lng: -95.02, category: "lake", state: "Texas", species: ["White Bass","Catfish","Crappie","Largemouth Bass"] },
    { name: "Lake Whitney TX", lat: 31.88, lng: -97.38, category: "lake", state: "Texas", species: ["Striped Bass","Smallmouth Bass","Catfish"] },
    { name: "Caddo Lake TX", lat: 32.72, lng: -94.08, category: "lake", state: "Texas", species: ["Largemouth Bass","Chain Pickerel","Crappie"] },
    { name: "Possum Kingdom Lake", lat: 32.88, lng: -98.52, category: "lake", state: "Texas", species: ["Striped Bass","Largemouth Bass","Crappie"] },

    // More Florida
    { name: "Lake Tohopekaliga", lat: 28.22, lng: -81.38, category: "lake", state: "Florida", species: ["Largemouth Bass","Bluegill","Crappie"] },
    { name: "Rodman Reservoir", lat: 29.48, lng: -81.80, category: "reservoir", state: "Florida", species: ["Largemouth Bass","Crappie","Striped Bass"] },
    { name: "Kissimmee Chain", lat: 28.05, lng: -81.42, category: "lake", state: "Florida", species: ["Largemouth Bass","Crappie","Bluegill"] },
    { name: "Apalachicola Bay FL", lat: 29.68, lng: -85.02, category: "bay", state: "Florida", species: ["Red Drum","Speckled Trout","Flounder"] },
    { name: "Lake Istokpoga", lat: 27.38, lng: -81.27, category: "lake", state: "Florida", species: ["Largemouth Bass","Crappie","Bluegill"] },
    { name: "Banana River FL", lat: 28.32, lng: -80.62, category: "river", state: "Florida", species: ["Red Drum","Speckled Trout","Snook"] },

    // More California
    { name: "Lake Berryessa", lat: 38.60, lng: -122.22, category: "lake", state: "California", species: ["Largemouth Bass","Rainbow Trout","Kokanee Salmon"] },
    { name: "Castaic Lake", lat: 34.52, lng: -118.62, category: "lake", state: "California", species: ["Largemouth Bass","Rainbow Trout","Channel Catfish"] },
    { name: "New Melones Lake", lat: 37.95, lng: -120.53, category: "lake", state: "California", species: ["Largemouth Bass","Rainbow Trout","Crappie"] },
    { name: "Folsom Lake CA", lat: 38.72, lng: -121.15, category: "lake", state: "California", species: ["Rainbow Trout","Largemouth Bass","Channel Catfish"] },
    { name: "Trinity Lake CA", lat: 40.98, lng: -122.72, category: "lake", state: "California", species: ["Largemouth Bass","Smallmouth Bass","Rainbow Trout"] },

    // More Oregon
    { name: "Willamette River", lat: 44.05, lng: -123.08, category: "river", state: "Oregon", species: ["Chinook Salmon","Steelhead","Smallmouth Bass"] },
    { name: "Umpqua River", lat: 43.18, lng: -124.08, category: "river", state: "Oregon", species: ["Steelhead","Chinook Salmon","Smallmouth Bass","Shad"] },
    { name: "Odell Lake OR", lat: 43.57, lng: -121.95, category: "lake", state: "Oregon", species: ["Lake Trout","Kokanee Salmon","Rainbow Trout"] },
    { name: "Wickiup Reservoir", lat: 43.68, lng: -121.70, category: "reservoir", state: "Oregon", species: ["Brown Trout","Kokanee Salmon","Rainbow Trout"] },

    // More Washington
    { name: "Yakima River", lat: 46.58, lng: -120.52, category: "river", state: "Washington", species: ["Rainbow Trout","Smallmouth Bass","Steelhead"] },
    { name: "Lake Washington", lat: 47.63, lng: -122.22, category: "lake", state: "Washington", species: ["Largemouth Bass","Rainbow Trout","Yellow Perch","Sockeye Salmon"] },
    { name: "Rufus Woods Lake", lat: 47.93, lng: -119.15, category: "lake", state: "Washington", species: ["Walleye","Rainbow Trout","Kokanee Salmon"] },
    { name: "Potholes Reservoir", lat: 46.98, lng: -119.32, category: "reservoir", state: "Washington", species: ["Walleye","Rainbow Trout","Largemouth Bass"] },
    { name: "Snake River WA", lat: 46.22, lng: -117.02, category: "river", state: "Washington", species: ["Steelhead","Chinook Salmon","Smallmouth Bass","Sturgeon"] },

    // More Idaho
    { name: "Middle Fork Salmon River", lat: 44.72, lng: -114.98, category: "river", state: "Idaho", species: ["Cutthroat Trout","Steelhead","Bull Trout"] },
    { name: "Priest Lake", lat: 48.55, lng: -116.85, category: "lake", state: "Idaho", species: ["Lake Trout","Kokanee Salmon","Bull Trout"] },
    { name: "Anderson Ranch Reservoir", lat: 43.38, lng: -115.47, category: "reservoir", state: "Idaho", species: ["Kokanee Salmon","Rainbow Trout","Bull Trout"] },
    { name: "Lucky Peak Reservoir", lat: 43.52, lng: -116.05, category: "reservoir", state: "Idaho", species: ["Rainbow Trout","Kokanee Salmon","Smallmouth Bass"] },

    // More Montana
    { name: "Holter Lake MT", lat: 46.85, lng: -111.98, category: "lake", state: "Montana", species: ["Rainbow Trout","Walleye","Yellow Perch"] },
    { name: "Canyon Ferry Lake", lat: 46.65, lng: -111.72, category: "lake", state: "Montana", species: ["Rainbow Trout","Walleye","Yellow Perch"] },
    { name: "Gallatin River", lat: 45.55, lng: -111.18, category: "river", state: "Montana", species: ["Rainbow Trout","Brown Trout","Cutthroat Trout"] },
    { name: "Rock Creek MT", lat: 46.68, lng: -113.62, category: "stream", state: "Montana", species: ["Brown Trout","Rainbow Trout","Bull Trout"] },

    // More Nevada
    { name: "Walker Lake NV", lat: 38.68, lng: -118.72, category: "lake", state: "Nevada", species: ["Lahontan Cutthroat Trout"] },
    { name: "Lahontan Reservoir", lat: 39.47, lng: -119.07, category: "reservoir", state: "Nevada", species: ["Walleye","White Bass","Wipers"] },
    { name: "Wild Horse Reservoir", lat: 41.62, lng: -115.78, category: "reservoir", state: "Nevada", species: ["Rainbow Trout","Brown Trout","Smallmouth Bass"] },

    // More Utah
    { name: "Fish Lake UT", lat: 38.55, lng: -111.72, category: "lake", state: "Utah", species: ["Lake Trout","Rainbow Trout","Splake"] },
    { name: "Jordanelle Reservoir", lat: 40.60, lng: -111.42, category: "reservoir", state: "Utah", species: ["Rainbow Trout","Brown Trout","Smallmouth Bass"] },
    { name: "Deer Creek Reservoir", lat: 40.42, lng: -111.52, category: "reservoir", state: "Utah", species: ["Rainbow Trout","Brown Trout","Walleye"] },
    { name: "Provo River", lat: 40.55, lng: -111.48, category: "river", state: "Utah", species: ["Brown Trout","Rainbow Trout","Cutthroat Trout"] },

    // More Wyoming
    { name: "Glendo Reservoir", lat: 42.50, lng: -105.02, category: "reservoir", state: "Wyoming", species: ["Walleye","Yellow Perch","Channel Catfish"] },
    { name: "Tongue River WY", lat: 44.78, lng: -107.18, category: "river", state: "Wyoming", species: ["Brown Trout","Rainbow Trout"] },
    { name: "Keyhole Reservoir", lat: 44.62, lng: -104.82, category: "reservoir", state: "Wyoming", species: ["Walleye","Smallmouth Bass","Northern Pike"] },

    // More New Mexico
    { name: "Bluewater Lake NM", lat: 35.28, lng: -108.12, category: "lake", state: "New Mexico", species: ["Rainbow Trout","Tiger Muskie","Channel Catfish"] },
    { name: "Eagle Nest Lake", lat: 36.55, lng: -105.28, category: "lake", state: "New Mexico", species: ["Rainbow Trout","Kokanee Salmon","Yellow Perch"] },
    { name: "Rio Grande NM", lat: 35.08, lng: -106.65, category: "river", state: "New Mexico", species: ["Brown Trout","Rainbow Trout","Northern Pike"] },

    // More Arizona
    { name: "Apache Lake AZ", lat: 33.58, lng: -111.28, category: "lake", state: "Arizona", species: ["Largemouth Bass","Walleye","Yellow Bass"] },
    { name: "Canyon Lake AZ", lat: 33.53, lng: -111.42, category: "lake", state: "Arizona", species: ["Rainbow Trout","Largemouth Bass","Walleye"] },
    { name: "Bartlett Lake", lat: 33.82, lng: -111.62, category: "lake", state: "Arizona", species: ["Largemouth Bass","Crappie","Flathead Catfish"] },

    // More South Carolina
    { name: "Lake Keowee", lat: 34.78, lng: -82.88, category: "lake", state: "South Carolina", species: ["Largemouth Bass","Spotted Bass","Striped Bass"] },
    { name: "Lake Wateree", lat: 34.38, lng: -80.70, category: "lake", state: "South Carolina", species: ["Largemouth Bass","Crappie","Channel Catfish"] },

    // More Georgia
    { name: "Lake Sinclair", lat: 33.12, lng: -83.25, category: "lake", state: "Georgia", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Lake Burton GA", lat: 34.82, lng: -83.55, category: "lake", state: "Georgia", species: ["Spotted Bass","Brown Trout","Rainbow Trout"] },

    // More North Carolina
    { name: "Lake James NC", lat: 35.73, lng: -81.90, category: "lake", state: "North Carolina", species: ["Smallmouth Bass","Largemouth Bass","Walleye","Muskie"] },
    { name: "Shearon Harris Lake", lat: 35.63, lng: -78.95, category: "lake", state: "North Carolina", species: ["Largemouth Bass","Crappie","Channel Catfish"] },

    // More Virginia
    { name: "Claytor Lake VA", lat: 37.07, lng: -80.62, category: "lake", state: "Virginia", species: ["Striped Bass","Largemouth Bass","Crappie"] },
    { name: "Philpott Reservoir", lat: 36.78, lng: -80.03, category: "reservoir", state: "Virginia", species: ["Largemouth Bass","Crappie","Walleye"] },
    { name: "Lake Moomaw VA", lat: 37.95, lng: -79.95, category: "lake", state: "Virginia", species: ["Brown Trout","Largemouth Bass","Channel Catfish"] },

    // More Tennessee
    { name: "Cherokee Lake TN", lat: 36.17, lng: -83.55, category: "lake", state: "Tennessee", species: ["Largemouth Bass","Walleye","Crappie"] },
    { name: "Douglas Lake TN", lat: 35.98, lng: -83.42, category: "lake", state: "Tennessee", species: ["Largemouth Bass","Crappie","Walleye"] },
    { name: "Watauga Lake", lat: 36.32, lng: -82.12, category: "lake", state: "Tennessee", species: ["Smallmouth Bass","Walleye","Brown Trout"] },

    // More Kentucky
    { name: "Cave Run Lake", lat: 38.10, lng: -83.55, category: "lake", state: "Kentucky", species: ["Muskie","Largemouth Bass","Crappie"] },
    { name: "Laurel River Lake", lat: 36.98, lng: -84.28, category: "lake", state: "Kentucky", species: ["Rainbow Trout","Largemouth Bass","Crappie"] },

    // More Alabama
    { name: "Pickwick Lake AL", lat: 34.78, lng: -87.78, category: "lake", state: "Alabama", species: ["Smallmouth Bass","Largemouth Bass","Catfish"] },
    { name: "Logan Martin Lake", lat: 33.48, lng: -86.32, category: "lake", state: "Alabama", species: ["Spotted Bass","Largemouth Bass","Crappie"] },

    // More Arkansas
    { name: "Lake Hamilton AR", lat: 34.48, lng: -93.10, category: "lake", state: "Arkansas", species: ["Largemouth Bass","Crappie","Hybrid Striped Bass"] },
    { name: "Norfolk Lake AR", lat: 36.42, lng: -92.22, category: "lake", state: "Arkansas", species: ["Largemouth Bass","Striped Bass","Walleye"] },

    // More Oklahoma
    { name: "Lake Murray OK", lat: 34.05, lng: -97.05, category: "lake", state: "Oklahoma", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Lake Hefner", lat: 35.55, lng: -97.58, category: "lake", state: "Oklahoma", species: ["Walleye","Largemouth Bass","Crappie"] },

    // More Iowa
    { name: "Saylorville Lake", lat: 41.72, lng: -93.68, category: "lake", state: "Iowa", species: ["Walleye","Channel Catfish","White Bass"] },
    { name: "Red Rock Lake IA", lat: 41.38, lng: -93.05, category: "lake", state: "Iowa", species: ["Crappie","Channel Catfish","White Bass"] },

    // More Kansas
    { name: "Clinton Lake KS", lat: 38.92, lng: -95.38, category: "lake", state: "Kansas", species: ["Largemouth Bass","Crappie","Walleye"] },
    { name: "Tuttle Creek Lake", lat: 39.25, lng: -96.58, category: "lake", state: "Kansas", species: ["Walleye","White Bass","Crappie"] },

    // More Nebraska
    { name: "Harlan County Reservoir", lat: 40.08, lng: -99.22, category: "reservoir", state: "Nebraska", species: ["Walleye","White Bass","Channel Catfish","Wipers"] },
    { name: "Sherman Reservoir", lat: 41.28, lng: -98.88, category: "reservoir", state: "Nebraska", species: ["Walleye","White Bass","Largemouth Bass"] },

    // More South Dakota
    { name: "Lake Poinsett", lat: 44.58, lng: -96.72, category: "lake", state: "South Dakota", species: ["Walleye","Northern Pike","Yellow Perch"] },
    { name: "Richmond Lake", lat: 45.38, lng: -98.48, category: "lake", state: "South Dakota", species: ["Walleye","Northern Pike","Yellow Perch"] },

    // More North Dakota
    { name: "Lake Ashtabula", lat: 47.35, lng: -97.92, category: "lake", state: "North Dakota", species: ["Walleye","Northern Pike","White Bass"] },
    { name: "Jamestown Reservoir", lat: 46.88, lng: -98.72, category: "reservoir", state: "North Dakota", species: ["Walleye","Northern Pike","Yellow Perch"] },

    // More Louisiana
    { name: "Lake Claiborne", lat: 32.52, lng: -92.95, category: "lake", state: "Louisiana", species: ["Largemouth Bass","Crappie","Bream"] },
    { name: "Grand Isle LA", lat: 29.23, lng: -90.00, category: "bay", state: "Louisiana", species: ["Red Drum","Speckled Trout","Sheepshead"] },

    // More Mississippi
    { name: "Enid Lake", lat: 34.17, lng: -89.88, category: "lake", state: "Mississippi", species: ["Crappie","Largemouth Bass","Channel Catfish"] },
    { name: "Arkabutla Lake", lat: 34.72, lng: -90.12, category: "lake", state: "Mississippi", species: ["Crappie","Largemouth Bass","Catfish"] },

    // More West Virginia
    { name: "Beech Fork Lake", lat: 38.30, lng: -82.12, category: "lake", state: "West Virginia", species: ["Largemouth Bass","Channel Catfish","Crappie"] },
    { name: "Tygart Lake", lat: 39.10, lng: -79.88, category: "lake", state: "West Virginia", species: ["Walleye","Largemouth Bass","Muskie"] },
  ];

  const newLocations = locations.filter(l => !existingNames.has(l.name.toLowerCase()));

  if (newLocations.length === 0) {
    return new Response(JSON.stringify({ message: "All locations already exist", total: existing?.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let inserted = 0;
  for (let i = 0; i < newLocations.length; i += 50) {
    const batch = newLocations.slice(i, i + 50);
    const { error } = await supabase.from("fishing_locations").insert(batch);
    if (!error) inserted += batch.length;
  }

  const { count } = await supabase.from("fishing_locations").select("*", { count: "exact", head: true });

  return new Response(JSON.stringify({ inserted, total: count }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
