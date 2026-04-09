import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateLocations() {
  return [
    // TENNESSEE
    { name: "Cherokee Lake – TN", lat: 36.17, lng: -83.35, category: "lake", state: "Tennessee", species: ["Largemouth Bass","Crappie","Walleye","Catfish"] },
    { name: "Douglas Lake", lat: 36.00, lng: -83.35, category: "lake", state: "Tennessee", species: ["Largemouth Bass","Crappie","Walleye"] },
    { name: "Fort Loudoun Lake", lat: 35.80, lng: -84.15, category: "lake", state: "Tennessee", species: ["Largemouth Bass","Striped Bass","Crappie"] },
    { name: "Watts Bar Lake", lat: 35.70, lng: -84.62, category: "lake", state: "Tennessee", species: ["Largemouth Bass","Crappie","Sauger","Catfish"] },
    { name: "Chickamauga Lake", lat: 35.20, lng: -85.12, category: "lake", state: "Tennessee", species: ["Largemouth Bass","Smallmouth Bass","Crappie","Catfish"] },
    { name: "Nickajack Lake", lat: 35.00, lng: -85.55, category: "lake", state: "Tennessee", species: ["Largemouth Bass","Smallmouth Bass","Catfish","Sauger"] },
    { name: "Dale Hollow Lake – TN Side", lat: 36.53, lng: -85.47, category: "lake", state: "Tennessee", species: ["Smallmouth Bass","Largemouth Bass","Walleye","Muskie"] },
    { name: "Center Hill Lake", lat: 36.07, lng: -85.80, category: "lake", state: "Tennessee", species: ["Largemouth Bass","Smallmouth Bass","Walleye","Crappie"] },
    { name: "Old Hickory Lake", lat: 36.32, lng: -86.42, category: "lake", state: "Tennessee", species: ["Largemouth Bass","Crappie","Striped Bass","Catfish"] },
    { name: "Reelfoot Lake", lat: 36.35, lng: -89.37, category: "lake", state: "Tennessee", species: ["Crappie","Largemouth Bass","Bluegill","Catfish"] },
    { name: "South Holston River", lat: 36.52, lng: -82.08, category: "river", state: "Tennessee", species: ["Brown Trout","Rainbow Trout"] },
    { name: "Clinch River – TN", lat: 36.12, lng: -83.72, category: "river", state: "Tennessee", species: ["Brown Trout","Rainbow Trout","Smallmouth Bass"] },
    { name: "Caney Fork River", lat: 36.10, lng: -85.83, category: "river", state: "Tennessee", species: ["Brown Trout","Rainbow Trout"] },
    { name: "Hiwassee River – TN", lat: 35.18, lng: -84.55, category: "river", state: "Tennessee", species: ["Brown Trout","Rainbow Trout"] },
    { name: "Elk River – TN", lat: 35.08, lng: -86.78, category: "river", state: "Tennessee", species: ["Smallmouth Bass","Rock Bass","Sunfish"] },

    // TEXAS
    { name: "Lake Fork", lat: 32.78, lng: -95.55, category: "lake", state: "Texas", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Sam Rayburn Reservoir", lat: 31.07, lng: -94.12, category: "reservoir", state: "Texas", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Toledo Bend – TX Side", lat: 31.18, lng: -93.55, category: "reservoir", state: "Texas", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Lake Amistad", lat: 29.45, lng: -101.07, category: "lake", state: "Texas", species: ["Largemouth Bass","Smallmouth Bass","Striped Bass","Catfish"] },
    { name: "Falcon Lake – TX", lat: 26.55, lng: -99.18, category: "lake", state: "Texas", species: ["Largemouth Bass","Catfish","Striped Bass"] },
    { name: "Lake O.H. Ivie", lat: 31.57, lng: -99.72, category: "lake", state: "Texas", species: ["Largemouth Bass","Smallmouth Bass","Crappie","Catfish"] },
    { name: "Lake Travis", lat: 30.42, lng: -97.92, category: "lake", state: "Texas", species: ["Largemouth Bass","Guadalupe Bass","Striped Bass"] },
    { name: "Lake Conroe", lat: 30.38, lng: -95.57, category: "lake", state: "Texas", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Choke Canyon Reservoir", lat: 28.48, lng: -98.32, category: "reservoir", state: "Texas", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Lake LBJ", lat: 30.55, lng: -98.37, category: "lake", state: "Texas", species: ["Largemouth Bass","Striped Bass","Crappie"] },
    { name: "Galveston Bay – TX", lat: 29.37, lng: -94.80, category: "bay", state: "Texas", species: ["Redfish","Speckled Trout","Flounder","Sheepshead"] },
    { name: "Laguna Madre – Lower TX", lat: 26.60, lng: -97.35, category: "lagoon", state: "Texas", species: ["Redfish","Speckled Trout","Snook","Tarpon"] },
    { name: "Matagorda Bay", lat: 28.50, lng: -96.00, category: "bay", state: "Texas", species: ["Redfish","Speckled Trout","Flounder","Black Drum"] },
    { name: "Port Aransas Jetties", lat: 27.83, lng: -97.05, category: "bay", state: "Texas", species: ["Redfish","Tarpon","Kingfish","Jack Crevalle"] },
    { name: "Guadalupe River – TX", lat: 29.72, lng: -98.12, category: "river", state: "Texas", species: ["Guadalupe Bass","Largemouth Bass","Rio Grande Cichlid"] },

    // UTAH
    { name: "Lake Powell – UT Side", lat: 37.18, lng: -110.95, category: "lake", state: "Utah", species: ["Largemouth Bass","Smallmouth Bass","Striped Bass","Walleye"] },
    { name: "Flaming Gorge Reservoir", lat: 40.92, lng: -109.42, category: "reservoir", state: "Utah", species: ["Lake Trout","Rainbow Trout","Kokanee","Smallmouth Bass"] },
    { name: "Strawberry Reservoir", lat: 40.17, lng: -111.15, category: "reservoir", state: "Utah", species: ["Rainbow Trout","Cutthroat Trout","Kokanee"] },
    { name: "Fish Lake – UT", lat: 38.55, lng: -111.72, category: "lake", state: "Utah", species: ["Lake Trout","Rainbow Trout","Splake"] },
    { name: "Jordanelle Reservoir", lat: 40.60, lng: -111.42, category: "reservoir", state: "Utah", species: ["Rainbow Trout","Brown Trout","Smallmouth Bass"] },
    { name: "Deer Creek Reservoir", lat: 40.40, lng: -111.52, category: "reservoir", state: "Utah", species: ["Rainbow Trout","Brown Trout","Walleye"] },
    { name: "Starvation Reservoir", lat: 40.20, lng: -110.45, category: "reservoir", state: "Utah", species: ["Walleye","Yellow Perch","Rainbow Trout"] },
    { name: "Pineview Reservoir", lat: 41.25, lng: -111.80, category: "reservoir", state: "Utah", species: ["Tiger Muskie","Largemouth Bass","Yellow Perch"] },
    { name: "Provo River – UT", lat: 40.55, lng: -111.50, category: "river", state: "Utah", species: ["Brown Trout","Rainbow Trout","Whitefish"] },
    { name: "Green River – Below Flaming Gorge", lat: 40.90, lng: -109.43, category: "river", state: "Utah", species: ["Brown Trout","Rainbow Trout","Whitefish"] },

    // VERMONT (more)
    { name: "Lake Willoughby", lat: 44.72, lng: -72.07, category: "lake", state: "Vermont", species: ["Lake Trout","Rainbow Trout","Landlocked Salmon"] },
    { name: "Lake Champlain – Burlington VT", lat: 44.48, lng: -73.23, category: "lake", state: "Vermont", species: ["Largemouth Bass","Smallmouth Bass","Walleye","Lake Trout"] },
    { name: "Lamoille River", lat: 44.67, lng: -72.82, category: "river", state: "Vermont", species: ["Brown Trout","Rainbow Trout","Smallmouth Bass"] },
    { name: "White River – VT", lat: 43.77, lng: -72.32, category: "river", state: "Vermont", species: ["Brown Trout","Rainbow Trout","Brook Trout"] },
    { name: "Harriman Reservoir", lat: 42.85, lng: -72.87, category: "reservoir", state: "Vermont", species: ["Lake Trout","Rainbow Trout","Smallmouth Bass"] },

    // VIRGINIA
    { name: "Smith Mountain Lake", lat: 37.05, lng: -79.57, category: "lake", state: "Virginia", species: ["Largemouth Bass","Striped Bass","Muskie","Crappie"] },
    { name: "Lake Gaston – VA Side", lat: 36.53, lng: -77.90, category: "lake", state: "Virginia", species: ["Largemouth Bass","Striped Bass","Crappie"] },
    { name: "Buggs Island Lake (Kerr)", lat: 36.62, lng: -78.33, category: "lake", state: "Virginia", species: ["Largemouth Bass","Striped Bass","Crappie","Catfish"] },
    { name: "Claytor Lake", lat: 37.07, lng: -80.63, category: "lake", state: "Virginia", species: ["Largemouth Bass","Smallmouth Bass","Muskie","Crappie"] },
    { name: "Lake Anna", lat: 38.07, lng: -77.83, category: "lake", state: "Virginia", species: ["Largemouth Bass","Striped Bass","Crappie"] },
    { name: "James River – Richmond VA", lat: 37.53, lng: -77.43, category: "river", state: "Virginia", species: ["Smallmouth Bass","Largemouth Bass","Blue Catfish","Shad"] },
    { name: "New River – VA", lat: 37.33, lng: -80.70, category: "river", state: "Virginia", species: ["Smallmouth Bass","Muskie","Walleye","Rock Bass"] },
    { name: "Shenandoah River – South Fork", lat: 38.45, lng: -78.52, category: "river", state: "Virginia", species: ["Smallmouth Bass","Redbreast Sunfish","Channel Catfish"] },
    { name: "Jackson River – VA", lat: 37.85, lng: -79.92, category: "river", state: "Virginia", species: ["Brown Trout","Rainbow Trout"] },
    { name: "Chesapeake Bay Bridge-Tunnel", lat: 37.03, lng: -76.08, category: "bay", state: "Virginia", species: ["Striped Bass","Red Drum","Cobia","Flounder"] },
    { name: "Virginia Beach – Offshore", lat: 36.72, lng: -75.73, category: "bay", state: "Virginia", species: ["Bluefin Tuna","Yellowfin Tuna","Blue Marlin","Mahi-Mahi"] },
    { name: "Back Bay – VA", lat: 36.58, lng: -75.97, category: "bay", state: "Virginia", species: ["Largemouth Bass","Crappie","Catfish"] },

    // WASHINGTON
    { name: "Columbia River – Hanford Reach", lat: 46.63, lng: -119.52, category: "river", state: "Washington", species: ["Chinook Salmon","Steelhead","Walleye","Smallmouth Bass"] },
    { name: "Yakima River", lat: 46.60, lng: -120.50, category: "river", state: "Washington", species: ["Rainbow Trout","Smallmouth Bass","Steelhead"] },
    { name: "Banks Lake – WA", lat: 47.70, lng: -119.10, category: "lake", state: "Washington", species: ["Walleye","Smallmouth Bass","Largemouth Bass","Rainbow Trout"] },
    { name: "Lake Chelan – WA", lat: 47.87, lng: -120.17, category: "lake", state: "Washington", species: ["Lake Trout","Chinook Salmon","Rainbow Trout","Kokanee"] },
    { name: "Potholes Reservoir", lat: 46.97, lng: -119.33, category: "reservoir", state: "Washington", species: ["Walleye","Largemouth Bass","Rainbow Trout","Crappie"] },
    { name: "Lake Roosevelt", lat: 47.97, lng: -118.87, category: "lake", state: "Washington", species: ["Walleye","Rainbow Trout","Kokanee","Smallmouth Bass"] },
    { name: "Puget Sound – San Juan Islands", lat: 48.52, lng: -123.00, category: "bay", state: "Washington", species: ["Chinook Salmon","Lingcod","Halibut","Rockfish"] },
    { name: "Neah Bay – WA", lat: 48.37, lng: -124.62, category: "bay", state: "Washington", species: ["Halibut","Chinook Salmon","Lingcod"] },
    { name: "Westport – WA", lat: 46.90, lng: -124.12, category: "bay", state: "Washington", species: ["Halibut","Chinook Salmon","Albacore Tuna","Lingcod"] },
    { name: "Sol Duc River", lat: 48.00, lng: -124.27, category: "river", state: "Washington", species: ["Steelhead","Chinook Salmon","Coho Salmon"] },
    { name: "Skagit River – WA", lat: 48.45, lng: -121.77, category: "river", state: "Washington", species: ["Steelhead","Chinook Salmon","Bull Trout"] },
    { name: "Green River – WA", lat: 47.30, lng: -122.28, category: "river", state: "Washington", species: ["Steelhead","Chinook Salmon","Coho Salmon"] },

    // WEST VIRGINIA
    { name: "New River – WV", lat: 38.07, lng: -81.07, category: "river", state: "West Virginia", species: ["Smallmouth Bass","Rock Bass","Channel Catfish","Flathead Catfish"] },
    { name: "Elk River – WV", lat: 38.37, lng: -80.85, category: "river", state: "West Virginia", species: ["Smallmouth Bass","Muskie","Rock Bass"] },
    { name: "Greenbrier River", lat: 37.82, lng: -80.43, category: "river", state: "West Virginia", species: ["Smallmouth Bass","Rock Bass","Channel Catfish"] },
    { name: "South Branch Potomac", lat: 39.03, lng: -79.00, category: "river", state: "West Virginia", species: ["Smallmouth Bass","Channel Catfish","Trout"] },
    { name: "Cranberry River", lat: 38.33, lng: -80.47, category: "river", state: "West Virginia", species: ["Brook Trout","Brown Trout","Rainbow Trout"] },
    { name: "Stonewall Jackson Lake", lat: 38.87, lng: -80.37, category: "lake", state: "West Virginia", species: ["Largemouth Bass","Crappie","Channel Catfish"] },
    { name: "Burnsville Lake", lat: 38.83, lng: -80.63, category: "lake", state: "West Virginia", species: ["Largemouth Bass","Crappie","Muskie"] },
    { name: "Summersville Lake", lat: 38.23, lng: -80.87, category: "lake", state: "West Virginia", species: ["Smallmouth Bass","Largemouth Bass","Walleye","Rock Bass"] },
    { name: "Kanawha River", lat: 38.35, lng: -81.63, category: "river", state: "West Virginia", species: ["Sauger","Smallmouth Bass","Channel Catfish"] },
    { name: "Ohio River – Point Pleasant WV", lat: 38.85, lng: -82.13, category: "river", state: "West Virginia", species: ["Sauger","Largemouth Bass","Channel Catfish","Hybrid Striped Bass"] },

    // WISCONSIN
    { name: "Lake Winnebago", lat: 43.95, lng: -88.45, category: "lake", state: "Wisconsin", species: ["Walleye","White Bass","Lake Sturgeon","Yellow Perch"] },
    { name: "Lake Mendota – WI", lat: 43.10, lng: -89.42, category: "lake", state: "Wisconsin", species: ["Muskie","Largemouth Bass","Walleye","Panfish"] },
    { name: "Green Bay – WI", lat: 44.57, lng: -87.92, category: "bay", state: "Wisconsin", species: ["Walleye","Smallmouth Bass","Northern Pike","Yellow Perch"] },
    { name: "Lake Michigan – Door County WI", lat: 45.05, lng: -87.12, category: "lake", state: "Wisconsin", species: ["Smallmouth Bass","Chinook Salmon","Lake Trout","Brown Trout"] },
    { name: "Chippewa Flowage", lat: 46.02, lng: -91.28, category: "lake", state: "Wisconsin", species: ["Muskie","Walleye","Largemouth Bass","Crappie"] },
    { name: "Lac Courte Oreilles", lat: 45.88, lng: -91.43, category: "lake", state: "Wisconsin", species: ["Muskie","Walleye","Largemouth Bass","Bluegill"] },
    { name: "Eagle Lake – WI", lat: 45.90, lng: -89.25, category: "lake", state: "Wisconsin", species: ["Muskie","Walleye","Largemouth Bass"] },
    { name: "Wolf River – WI", lat: 44.75, lng: -88.82, category: "river", state: "Wisconsin", species: ["Walleye","Sturgeon","Smallmouth Bass"] },
    { name: "Wisconsin River – Wausau", lat: 44.95, lng: -89.63, category: "river", state: "Wisconsin", species: ["Walleye","Muskie","Smallmouth Bass"] },
    { name: "Peshtigo River", lat: 45.12, lng: -87.75, category: "river", state: "Wisconsin", species: ["Smallmouth Bass","Walleye","Brown Trout"] },
    { name: "Lake Geneva – WI", lat: 42.58, lng: -88.43, category: "lake", state: "Wisconsin", species: ["Largemouth Bass","Smallmouth Bass","Lake Trout","Cisco"] },
    { name: "Castle Rock Flowage", lat: 44.07, lng: -89.93, category: "lake", state: "Wisconsin", species: ["Walleye","Largemouth Bass","Northern Pike"] },

    // WYOMING
    { name: "North Platte River – Grey Reef", lat: 42.82, lng: -106.58, category: "river", state: "Wyoming", species: ["Rainbow Trout","Brown Trout","Walleye"] },
    { name: "Yellowstone River – YNP", lat: 44.72, lng: -110.43, category: "river", state: "Wyoming", species: ["Cutthroat Trout","Rainbow Trout","Brown Trout"] },
    { name: "Snake River – Jackson Hole", lat: 43.48, lng: -110.77, category: "river", state: "Wyoming", species: ["Snake River Cutthroat Trout","Brown Trout","Rainbow Trout"] },
    { name: "Green River – Below Fontenelle", lat: 42.03, lng: -110.07, category: "river", state: "Wyoming", species: ["Brown Trout","Rainbow Trout","Cutthroat Trout"] },
    { name: "Bighorn River – Thermopolis", lat: 43.65, lng: -108.20, category: "river", state: "Wyoming", species: ["Rainbow Trout","Brown Trout","Walleye"] },
    { name: "Boysen Reservoir", lat: 43.37, lng: -108.18, category: "reservoir", state: "Wyoming", species: ["Walleye","Sauger","Yellow Perch","Ling"] },
    { name: "Buffalo Bill Reservoir", lat: 44.50, lng: -109.18, category: "reservoir", state: "Wyoming", species: ["Lake Trout","Rainbow Trout","Brown Trout"] },
    { name: "Glendo Reservoir", lat: 42.50, lng: -105.03, category: "reservoir", state: "Wyoming", species: ["Walleye","Yellow Perch","Channel Catfish"] },
    { name: "Keyhole Reservoir", lat: 44.37, lng: -104.78, category: "reservoir", state: "Wyoming", species: ["Walleye","Northern Pike","Smallmouth Bass"] },
    { name: "Yellowstone Lake – WY", lat: 44.47, lng: -110.35, category: "lake", state: "Wyoming", species: ["Cutthroat Trout","Lake Trout"] },

    // HAWAII (more)
    { name: "Kona Coast – Keauhou", lat: 19.56, lng: -155.97, category: "bay", state: "Hawaii", species: ["Blue Marlin","Yellowfin Tuna","Mahi-Mahi","Ono"] },
    { name: "Maui – Lahaina Coast", lat: 20.87, lng: -156.68, category: "bay", state: "Hawaii", species: ["Blue Marlin","Ono","Mahi-Mahi"] },
    { name: "Oahu – North Shore", lat: 21.58, lng: -158.10, category: "bay", state: "Hawaii", species: ["Giant Trevally","Bonefish","Papio"] },
    { name: "Kauai – Na Pali Coast", lat: 22.17, lng: -159.65, category: "bay", state: "Hawaii", species: ["Yellowfin Tuna","Mahi-Mahi","Ono"] },
    { name: "Big Island – Hilo Bay", lat: 19.73, lng: -155.07, category: "bay", state: "Hawaii", species: ["Giant Trevally","Mahi-Mahi","Ono"] },
  ];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const locations = generateLocations();

    const { data: existing } = await supabase
      .from("fishing_locations")
      .select("name");
    const existingNames = new Set((existing || []).map((l: any) => l.name));

    const newLocations = locations.filter(l => !existingNames.has(l.name));

    let inserted = 0;
    for (let i = 0; i < newLocations.length; i += 100) {
      const batch = newLocations.slice(i, i + 100);
      const { error } = await supabase.from("fishing_locations").insert(batch);
      if (error) throw new Error(`Batch ${i}: ${error.message}`);
      inserted += batch.length;
    }

    return new Response(
      JSON.stringify({ success: true, inserted, skipped: locations.length - newLocations.length, total_in_batch: locations.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
