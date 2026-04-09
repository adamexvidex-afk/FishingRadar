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

  // Fetch existing names to avoid duplicates
  const { data: existing } = await supabase.from("fishing_locations").select("name");
  const existingNames = new Set((existing || []).map((l: any) => l.name.toLowerCase()));

  const locations = [
    // Alaska
    { name: "Kenai River", lat: 60.53, lng: -151.08, category: "river", state: "Alaska", species: ["King Salmon","Silver Salmon","Rainbow Trout"] },
    { name: "Naknek River", lat: 58.73, lng: -156.99, category: "river", state: "Alaska", species: ["Sockeye Salmon","King Salmon"] },
    { name: "Copper River", lat: 60.72, lng: -144.73, category: "river", state: "Alaska", species: ["King Salmon","Red Salmon"] },
    { name: "Bristol Bay", lat: 58.60, lng: -158.50, category: "bay", state: "Alaska", species: ["Sockeye Salmon","King Salmon"] },
    { name: "Kodiak Island Waters", lat: 57.79, lng: -152.41, category: "bay", state: "Alaska", species: ["Halibut","King Salmon","Rockfish"] },
    { name: "Sitka Sound", lat: 57.05, lng: -135.33, category: "bay", state: "Alaska", species: ["King Salmon","Halibut","Lingcod"] },
    { name: "Kasilof River", lat: 60.38, lng: -151.28, category: "river", state: "Alaska", species: ["King Salmon","Silver Salmon","Steelhead"] },
    { name: "Russian River", lat: 60.48, lng: -149.97, category: "river", state: "Alaska", species: ["Sockeye Salmon","Rainbow Trout"] },
    { name: "Susitna River", lat: 61.56, lng: -150.10, category: "river", state: "Alaska", species: ["King Salmon","Silver Salmon"] },
    { name: "Kvichak River", lat: 59.01, lng: -156.88, category: "river", state: "Alaska", species: ["Sockeye Salmon","Rainbow Trout"] },

    // Maine
    { name: "Moosehead Lake", lat: 45.60, lng: -69.68, category: "lake", state: "Maine", species: ["Lake Trout","Landlocked Salmon","Smallmouth Bass"] },
    { name: "Sebago Lake", lat: 43.84, lng: -70.57, category: "lake", state: "Maine", species: ["Landlocked Salmon","Lake Trout","Smallmouth Bass"] },
    { name: "Penobscot River", lat: 44.80, lng: -68.77, category: "river", state: "Maine", species: ["Atlantic Salmon","Smallmouth Bass","Striped Bass"] },
    { name: "Kennebec River", lat: 44.27, lng: -69.78, category: "river", state: "Maine", species: ["Striped Bass","Smallmouth Bass","Brown Trout"] },
    { name: "Rangeley Lake", lat: 44.85, lng: -70.68, category: "lake", state: "Maine", species: ["Brook Trout","Landlocked Salmon"] },
    { name: "Grand Lake Stream", lat: 45.18, lng: -67.77, category: "stream", state: "Maine", species: ["Landlocked Salmon","Smallmouth Bass"] },

    // Vermont
    { name: "Lake Champlain - VT", lat: 44.53, lng: -73.33, category: "lake", state: "Vermont", species: ["Largemouth Bass","Walleye","Lake Trout","Northern Pike"] },
    { name: "Lake Memphremagog", lat: 44.95, lng: -72.22, category: "lake", state: "Vermont", species: ["Landlocked Salmon","Rainbow Trout","Smallmouth Bass"] },
    { name: "Otter Creek VT", lat: 43.85, lng: -73.12, category: "stream", state: "Vermont", species: ["Brown Trout","Smallmouth Bass"] },
    { name: "Harriman Reservoir", lat: 42.88, lng: -72.87, category: "reservoir", state: "Vermont", species: ["Largemouth Bass","Yellow Perch","Brown Trout"] },

    // New Hampshire
    { name: "Lake Winnipesaukee", lat: 43.57, lng: -71.30, category: "lake", state: "New Hampshire", species: ["Landlocked Salmon","Lake Trout","Smallmouth Bass"] },
    { name: "Connecticut River NH", lat: 43.64, lng: -72.32, category: "river", state: "New Hampshire", species: ["Brown Trout","Rainbow Trout","Smallmouth Bass"] },
    { name: "Squam Lake", lat: 43.76, lng: -71.58, category: "lake", state: "New Hampshire", species: ["Lake Trout","Landlocked Salmon","Rainbow Trout"] },
    { name: "Newfound Lake", lat: 43.65, lng: -71.78, category: "lake", state: "New Hampshire", species: ["Lake Trout","Rainbow Trout","Smallmouth Bass"] },

    // Connecticut
    { name: "Housatonic River CT", lat: 41.78, lng: -73.35, category: "river", state: "Connecticut", species: ["Brown Trout","Smallmouth Bass"] },
    { name: "Connecticut River CT", lat: 41.35, lng: -72.37, category: "river", state: "Connecticut", species: ["Striped Bass","Shad","Largemouth Bass"] },
    { name: "Candlewood Lake", lat: 41.47, lng: -73.53, category: "lake", state: "Connecticut", species: ["Largemouth Bass","Smallmouth Bass","Walleye"] },
    { name: "Lake Lillinonah", lat: 41.42, lng: -73.22, category: "lake", state: "Connecticut", species: ["Largemouth Bass","Walleye","Channel Catfish"] },

    // Rhode Island
    { name: "Narragansett Bay", lat: 41.60, lng: -71.38, category: "bay", state: "Rhode Island", species: ["Striped Bass","Bluefish","Tautog"] },
    { name: "Worden Pond", lat: 41.42, lng: -71.68, category: "pond", state: "Rhode Island", species: ["Largemouth Bass","Chain Pickerel","Yellow Perch"] },

    // Delaware
    { name: "Delaware Bay DE", lat: 38.93, lng: -75.18, category: "bay", state: "Delaware", species: ["Striped Bass","Weakfish","Bluefish"] },
    { name: "Lums Pond", lat: 39.56, lng: -75.73, category: "pond", state: "Delaware", species: ["Largemouth Bass","Channel Catfish","Bluegill"] },
    { name: "Killens Pond", lat: 38.98, lng: -75.53, category: "pond", state: "Delaware", species: ["Largemouth Bass","Crappie","Catfish"] },

    // Maryland
    { name: "Deep Creek Lake MD", lat: 39.51, lng: -79.33, category: "lake", state: "Maryland", species: ["Walleye","Smallmouth Bass","Yellow Perch"] },
    { name: "Potomac River MD", lat: 38.98, lng: -77.12, category: "river", state: "Maryland", species: ["Largemouth Bass","Smallmouth Bass","Channel Catfish"] },
    { name: "Chesapeake Bay MD", lat: 38.50, lng: -76.30, category: "bay", state: "Maryland", species: ["Striped Bass","Blue Crab","Red Drum"] },
    { name: "Liberty Reservoir", lat: 39.42, lng: -76.83, category: "reservoir", state: "Maryland", species: ["Largemouth Bass","Walleye","Tiger Muskie"] },

    // West Virginia
    { name: "New River WV", lat: 37.83, lng: -80.85, category: "river", state: "West Virginia", species: ["Smallmouth Bass","Channel Catfish","Flathead Catfish"] },
    { name: "Greenbrier River", lat: 38.12, lng: -80.33, category: "river", state: "West Virginia", species: ["Smallmouth Bass","Rock Bass","Brown Trout"] },
    { name: "Summersville Lake", lat: 38.22, lng: -80.87, category: "lake", state: "West Virginia", species: ["Smallmouth Bass","Walleye","Muskie"] },
    { name: "Stonewall Jackson Lake", lat: 38.88, lng: -80.42, category: "lake", state: "West Virginia", species: ["Largemouth Bass","Channel Catfish","Crappie"] },
    { name: "Burnsville Lake", lat: 38.85, lng: -80.62, category: "lake", state: "West Virginia", species: ["Walleye","Muskie","Crappie"] },
    { name: "Elk River WV", lat: 38.35, lng: -80.65, category: "river", state: "West Virginia", species: ["Smallmouth Bass","Channel Catfish"] },

    // North Dakota
    { name: "Lake Sakakawea ND", lat: 47.70, lng: -102.60, category: "lake", state: "North Dakota", species: ["Walleye","Northern Pike","Smallmouth Bass"] },
    { name: "Devils Lake ND", lat: 48.07, lng: -99.10, category: "lake", state: "North Dakota", species: ["Walleye","Northern Pike","Yellow Perch"] },
    { name: "Lake Darling", lat: 48.07, lng: -101.57, category: "lake", state: "North Dakota", species: ["Northern Pike","Walleye","Yellow Perch"] },
    { name: "Missouri River ND", lat: 46.82, lng: -100.78, category: "river", state: "North Dakota", species: ["Walleye","Sauger","Channel Catfish"] },
    { name: "Lake Oahe ND", lat: 46.35, lng: -100.42, category: "lake", state: "North Dakota", species: ["Walleye","Northern Pike","Chinook Salmon"] },

    // South Dakota
    { name: "Lake Oahe SD", lat: 44.45, lng: -100.38, category: "lake", state: "South Dakota", species: ["Walleye","Northern Pike","Smallmouth Bass"] },
    { name: "Lake Sharpe", lat: 44.08, lng: -99.68, category: "lake", state: "South Dakota", species: ["Walleye","Channel Catfish","Smallmouth Bass"] },
    { name: "Lake Francis Case", lat: 43.50, lng: -99.28, category: "lake", state: "South Dakota", species: ["Walleye","Channel Catfish","White Bass"] },
    { name: "Big Sioux River", lat: 43.55, lng: -96.73, category: "river", state: "South Dakota", species: ["Channel Catfish","Walleye","Smallmouth Bass"] },
    { name: "Angostura Reservoir", lat: 43.33, lng: -103.45, category: "reservoir", state: "South Dakota", species: ["Walleye","Yellow Perch","Largemouth Bass"] },

    // Nebraska
    { name: "Lake McConaughy", lat: 41.22, lng: -101.95, category: "lake", state: "Nebraska", species: ["Walleye","White Bass","Striped Bass","Channel Catfish"] },
    { name: "Calamus Reservoir", lat: 41.88, lng: -99.58, category: "reservoir", state: "Nebraska", species: ["Walleye","Northern Pike","Largemouth Bass"] },
    { name: "Lewis and Clark Lake NE", lat: 42.85, lng: -97.52, category: "lake", state: "Nebraska", species: ["Walleye","Channel Catfish","White Bass"] },
    { name: "Merritt Reservoir", lat: 42.58, lng: -100.92, category: "reservoir", state: "Nebraska", species: ["Walleye","Muskie","Largemouth Bass"] },
    { name: "Platte River NE", lat: 41.05, lng: -100.73, category: "river", state: "Nebraska", species: ["Channel Catfish","Flathead Catfish","Walleye"] },

    // Kansas
    { name: "Milford Lake", lat: 39.12, lng: -96.92, category: "lake", state: "Kansas", species: ["Walleye","White Bass","Striped Bass","Crappie"] },
    { name: "Perry Lake KS", lat: 39.13, lng: -95.45, category: "lake", state: "Kansas", species: ["Crappie","Largemouth Bass","Walleye"] },
    { name: "Glen Elder Reservoir", lat: 39.48, lng: -98.32, category: "reservoir", state: "Kansas", species: ["Walleye","Wipers","Crappie"] },
    { name: "El Dorado Lake", lat: 37.68, lng: -96.82, category: "lake", state: "Kansas", species: ["Walleye","Largemouth Bass","Crappie"] },
    { name: "Cheney Reservoir", lat: 37.78, lng: -97.82, category: "reservoir", state: "Kansas", species: ["Walleye","White Bass","Crappie","Wipers"] },

    // Iowa
    { name: "Spirit Lake IA", lat: 43.47, lng: -95.10, category: "lake", state: "Iowa", species: ["Walleye","Yellow Bass","Smallmouth Bass"] },
    { name: "West Okoboji Lake", lat: 43.38, lng: -95.17, category: "lake", state: "Iowa", species: ["Walleye","Muskie","Smallmouth Bass"] },
    { name: "Clear Lake IA", lat: 43.08, lng: -93.38, category: "lake", state: "Iowa", species: ["Walleye","Yellow Bass","Channel Catfish"] },
    { name: "Rathbun Lake", lat: 40.82, lng: -92.88, category: "lake", state: "Iowa", species: ["Channel Catfish","Crappie","Walleye"] },
    { name: "Mississippi River IA", lat: 41.58, lng: -90.55, category: "river", state: "Iowa", species: ["Walleye","Sauger","Channel Catfish","Largemouth Bass"] },

    // Oklahoma
    { name: "Grand Lake O' the Cherokees", lat: 36.53, lng: -94.87, category: "lake", state: "Oklahoma", species: ["Largemouth Bass","Crappie","Channel Catfish"] },
    { name: "Lake Texoma OK", lat: 33.82, lng: -96.60, category: "lake", state: "Oklahoma", species: ["Striped Bass","Largemouth Bass","Catfish"] },
    { name: "Broken Bow Lake", lat: 34.18, lng: -94.68, category: "lake", state: "Oklahoma", species: ["Largemouth Bass","Smallmouth Bass","Walleye"] },
    { name: "Lake Eufaula OK", lat: 35.28, lng: -95.38, category: "lake", state: "Oklahoma", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Keystone Lake", lat: 36.15, lng: -96.25, category: "lake", state: "Oklahoma", species: ["Largemouth Bass","Striped Bass","Crappie"] },
    { name: "Lake Tenkiller", lat: 35.60, lng: -94.95, category: "lake", state: "Oklahoma", species: ["Largemouth Bass","Striped Bass","Walleye"] },

    // Arkansas
    { name: "Bull Shoals Lake AR", lat: 36.38, lng: -92.58, category: "lake", state: "Arkansas", species: ["Largemouth Bass","Smallmouth Bass","Walleye"] },
    { name: "Beaver Lake AR", lat: 36.28, lng: -93.88, category: "lake", state: "Arkansas", species: ["Largemouth Bass","Striped Bass","Walleye"] },
    { name: "Lake Ouachita AR", lat: 34.57, lng: -93.22, category: "lake", state: "Arkansas", species: ["Largemouth Bass","Striped Bass","Walleye"] },
    { name: "Greers Ferry Lake", lat: 35.53, lng: -92.15, category: "lake", state: "Arkansas", species: ["Largemouth Bass","Walleye","Hybrid Striped Bass"] },
    { name: "White River AR", lat: 35.68, lng: -91.93, category: "river", state: "Arkansas", species: ["Brown Trout","Rainbow Trout","Cutthroat Trout"] },
    { name: "Little Red River", lat: 35.50, lng: -92.02, category: "river", state: "Arkansas", species: ["Brown Trout","Rainbow Trout"] },

    // Mississippi
    { name: "Ross Barnett Reservoir", lat: 32.42, lng: -90.03, category: "reservoir", state: "Mississippi", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Sardis Lake", lat: 34.42, lng: -89.78, category: "lake", state: "Mississippi", species: ["Largemouth Bass","Crappie","Channel Catfish"] },
    { name: "Grenada Lake", lat: 33.82, lng: -89.78, category: "lake", state: "Mississippi", species: ["Crappie","Largemouth Bass","Catfish"] },
    { name: "Pickwick Lake MS", lat: 34.85, lng: -88.22, category: "lake", state: "Mississippi", species: ["Smallmouth Bass","Largemouth Bass","Crappie"] },
    { name: "Mississippi River MS", lat: 32.30, lng: -90.92, category: "river", state: "Mississippi", species: ["Blue Catfish","Flathead Catfish","Largemouth Bass"] },

    // Louisiana
    { name: "Toledo Bend Reservoir", lat: 31.18, lng: -93.57, category: "reservoir", state: "Louisiana", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Lake D'Arbonne", lat: 32.62, lng: -92.27, category: "lake", state: "Louisiana", species: ["Largemouth Bass","Crappie","Bream"] },
    { name: "Atchafalaya Basin", lat: 30.28, lng: -91.77, category: "river", state: "Louisiana", species: ["Largemouth Bass","Blue Catfish","Crappie"] },
    { name: "Caney Creek Reservoir", lat: 32.12, lng: -93.08, category: "reservoir", state: "Louisiana", species: ["Largemouth Bass","Crappie","Bream"] },
    { name: "Venice LA Offshore", lat: 29.27, lng: -89.35, category: "bay", state: "Louisiana", species: ["Red Drum","Speckled Trout","Tarpon"] },

    // Alabama
    { name: "Lake Guntersville AL", lat: 34.38, lng: -86.28, category: "lake", state: "Alabama", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Wheeler Lake", lat: 34.60, lng: -87.15, category: "lake", state: "Alabama", species: ["Largemouth Bass","Smallmouth Bass","Crappie"] },
    { name: "Lake Eufaula AL", lat: 31.93, lng: -85.13, category: "lake", state: "Alabama", species: ["Largemouth Bass","Hybrid Striped Bass","Crappie"] },
    { name: "Smith Lake AL", lat: 34.08, lng: -87.13, category: "lake", state: "Alabama", species: ["Spotted Bass","Striped Bass","Walleye"] },
    { name: "Mobile-Tensaw Delta", lat: 30.72, lng: -87.93, category: "river", state: "Alabama", species: ["Largemouth Bass","Red Drum","Speckled Trout"] },
    { name: "Weiss Lake", lat: 34.15, lng: -85.82, category: "lake", state: "Alabama", species: ["Crappie","Largemouth Bass","Spotted Bass"] },

    // Tennessee
    { name: "Dale Hollow Lake TN", lat: 36.53, lng: -85.45, category: "lake", state: "Tennessee", species: ["Smallmouth Bass","Walleye","Muskie"] },
    { name: "Center Hill Lake", lat: 36.08, lng: -85.77, category: "lake", state: "Tennessee", species: ["Walleye","Smallmouth Bass","Largemouth Bass"] },
    { name: "Norris Lake", lat: 36.22, lng: -84.08, category: "lake", state: "Tennessee", species: ["Largemouth Bass","Striped Bass","Walleye"] },
    { name: "Reelfoot Lake", lat: 36.37, lng: -89.40, category: "lake", state: "Tennessee", species: ["Crappie","Largemouth Bass","Bluegill"] },
    { name: "Old Hickory Lake", lat: 36.32, lng: -86.42, category: "lake", state: "Tennessee", species: ["Largemouth Bass","Striped Bass","Crappie"] },
    { name: "South Holston Lake", lat: 36.52, lng: -82.05, category: "lake", state: "Tennessee", species: ["Smallmouth Bass","Brown Trout","Walleye"] },

    // Kentucky
    { name: "Lake Cumberland KY", lat: 36.88, lng: -84.98, category: "lake", state: "Kentucky", species: ["Striped Bass","Largemouth Bass","Walleye","Crappie"] },
    { name: "Kentucky Lake", lat: 36.62, lng: -88.07, category: "lake", state: "Kentucky", species: ["Largemouth Bass","Crappie","Channel Catfish"] },
    { name: "Lake Barkley KY", lat: 36.80, lng: -87.93, category: "lake", state: "Kentucky", species: ["Largemouth Bass","Crappie","Sauger"] },
    { name: "Dale Hollow Lake KY", lat: 36.60, lng: -85.42, category: "lake", state: "Kentucky", species: ["Smallmouth Bass","Rainbow Trout","Walleye"] },
    { name: "Green River KY", lat: 37.25, lng: -86.82, category: "river", state: "Kentucky", species: ["Muskie","Smallmouth Bass","Spotted Bass"] },
    { name: "Barren River Lake", lat: 36.88, lng: -86.13, category: "lake", state: "Kentucky", species: ["Largemouth Bass","Crappie","Catfish"] },

    // South Carolina
    { name: "Lake Murray SC", lat: 34.08, lng: -81.25, category: "lake", state: "South Carolina", species: ["Striped Bass","Largemouth Bass","Crappie"] },
    { name: "Santee Cooper Lakes", lat: 33.53, lng: -80.15, category: "lake", state: "South Carolina", species: ["Striped Bass","Largemouth Bass","Catfish","Crappie"] },
    { name: "Lake Hartwell SC", lat: 34.45, lng: -82.85, category: "lake", state: "South Carolina", species: ["Largemouth Bass","Striped Bass","Crappie"] },
    { name: "Lake Jocassee", lat: 34.95, lng: -82.92, category: "lake", state: "South Carolina", species: ["Brown Trout","Rainbow Trout","Smallmouth Bass"] },
    { name: "Winyah Bay", lat: 33.28, lng: -79.25, category: "bay", state: "South Carolina", species: ["Red Drum","Flounder","Speckled Trout"] },

    // Georgia
    { name: "Lake Lanier GA", lat: 34.25, lng: -83.95, category: "lake", state: "Georgia", species: ["Largemouth Bass","Spotted Bass","Striped Bass"] },
    { name: "Lake Seminole GA", lat: 30.78, lng: -84.83, category: "lake", state: "Georgia", species: ["Largemouth Bass","Crappie","Channel Catfish"] },
    { name: "Clarks Hill Lake GA", lat: 33.68, lng: -82.18, category: "lake", state: "Georgia", species: ["Largemouth Bass","Striped Bass","Crappie"] },
    { name: "West Point Lake GA", lat: 33.08, lng: -85.18, category: "lake", state: "Georgia", species: ["Largemouth Bass","Spotted Bass","Crappie"] },
    { name: "Lake Oconee", lat: 33.52, lng: -83.42, category: "lake", state: "Georgia", species: ["Largemouth Bass","Striped Bass","Crappie"] },
    { name: "Altamaha River", lat: 31.32, lng: -81.48, category: "river", state: "Georgia", species: ["Largemouth Bass","Redbreast Sunfish","Catfish"] },

    // Virginia
    { name: "Smith Mountain Lake VA", lat: 37.07, lng: -79.57, category: "lake", state: "Virginia", species: ["Striped Bass","Largemouth Bass","Muskie"] },
    { name: "James River VA", lat: 37.53, lng: -78.87, category: "river", state: "Virginia", species: ["Smallmouth Bass","Muskie","Channel Catfish"] },
    { name: "Lake Anna VA", lat: 38.07, lng: -77.82, category: "lake", state: "Virginia", species: ["Largemouth Bass","Striped Bass","Crappie"] },
    { name: "New River VA", lat: 37.32, lng: -80.62, category: "river", state: "Virginia", species: ["Smallmouth Bass","Muskie","Rock Bass"] },
    { name: "Chesapeake Bay VA", lat: 37.05, lng: -76.08, category: "bay", state: "Virginia", species: ["Striped Bass","Red Drum","Speckled Trout"] },
    { name: "Kerr Reservoir VA", lat: 36.62, lng: -78.38, category: "reservoir", state: "Virginia", species: ["Largemouth Bass","Striped Bass","Crappie"] },

    // North Carolina
    { name: "Lake Norman NC", lat: 35.45, lng: -80.95, category: "lake", state: "North Carolina", species: ["Largemouth Bass","Striped Bass","Crappie"] },
    { name: "Falls Lake NC", lat: 36.03, lng: -78.72, category: "lake", state: "North Carolina", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Jordan Lake NC", lat: 35.72, lng: -79.02, category: "lake", state: "North Carolina", species: ["Largemouth Bass","Striped Bass","Crappie"] },
    { name: "Fontana Lake", lat: 35.42, lng: -83.72, category: "lake", state: "North Carolina", species: ["Smallmouth Bass","Walleye","Muskie"] },
    { name: "Cape Hatteras Surf", lat: 35.22, lng: -75.53, category: "bay", state: "North Carolina", species: ["Red Drum","Bluefish","Striped Bass"] },
    { name: "Nantahala River", lat: 35.32, lng: -83.58, category: "river", state: "North Carolina", species: ["Brown Trout","Rainbow Trout","Brook Trout"] },

    // Indiana
    { name: "Patoka Lake", lat: 38.42, lng: -86.68, category: "lake", state: "Indiana", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Monroe Lake IN", lat: 39.05, lng: -86.53, category: "lake", state: "Indiana", species: ["Largemouth Bass","Crappie","Channel Catfish"] },
    { name: "Brookville Lake", lat: 39.42, lng: -85.02, category: "lake", state: "Indiana", species: ["Walleye","Largemouth Bass","Crappie"] },
    { name: "Mississinewa Lake", lat: 40.72, lng: -85.95, category: "lake", state: "Indiana", species: ["Largemouth Bass","Channel Catfish","Crappie"] },
    { name: "Salamonie Lake", lat: 40.80, lng: -85.62, category: "lake", state: "Indiana", species: ["Walleye","Channel Catfish","Crappie"] },

    // Ohio
    { name: "Lake Erie OH", lat: 41.68, lng: -82.85, category: "lake", state: "Ohio", species: ["Walleye","Yellow Perch","Steelhead","Smallmouth Bass"] },
    { name: "Alum Creek Lake", lat: 40.22, lng: -82.95, category: "lake", state: "Ohio", species: ["Muskie","Largemouth Bass","Crappie"] },
    { name: "Salt Fork Lake", lat: 40.08, lng: -81.48, category: "lake", state: "Ohio", species: ["Muskie","Largemouth Bass","Channel Catfish"] },
    { name: "Mosquito Creek Lake", lat: 41.18, lng: -80.77, category: "lake", state: "Ohio", species: ["Walleye","Crappie","Largemouth Bass"] },
    { name: "Pymatuning Reservoir OH", lat: 41.52, lng: -80.47, category: "reservoir", state: "Ohio", species: ["Walleye","Muskie","Crappie"] },

    // Pennsylvania
    { name: "Lake Erie PA", lat: 42.15, lng: -80.10, category: "lake", state: "Pennsylvania", species: ["Walleye","Steelhead","Smallmouth Bass","Yellow Perch"] },
    { name: "Pymatuning Reservoir PA", lat: 41.55, lng: -80.48, category: "reservoir", state: "Pennsylvania", species: ["Walleye","Muskie","Crappie"] },
    { name: "Raystown Lake", lat: 40.43, lng: -78.03, category: "lake", state: "Pennsylvania", species: ["Striped Bass","Largemouth Bass","Walleye"] },
    { name: "Delaware River PA", lat: 40.83, lng: -75.08, category: "river", state: "Pennsylvania", species: ["Smallmouth Bass","Walleye","Muskie","Shad"] },
    { name: "Susquehanna River", lat: 40.27, lng: -76.88, category: "river", state: "Pennsylvania", species: ["Smallmouth Bass","Walleye","Muskie","Channel Catfish"] },
    { name: "Lake Wallenpaupack", lat: 41.40, lng: -75.17, category: "lake", state: "Pennsylvania", species: ["Walleye","Smallmouth Bass","Largemouth Bass","Striped Bass"] },

    // New Jersey
    { name: "Round Valley Reservoir", lat: 40.62, lng: -74.83, category: "reservoir", state: "New Jersey", species: ["Lake Trout","Brown Trout","Smallmouth Bass"] },
    { name: "Spruce Run Reservoir", lat: 40.65, lng: -74.90, category: "reservoir", state: "New Jersey", species: ["Largemouth Bass","Northern Pike","Hybrid Striped Bass"] },
    { name: "Delaware River NJ", lat: 40.13, lng: -74.85, category: "river", state: "New Jersey", species: ["Smallmouth Bass","Muskie","Walleye","Shad"] },
    { name: "Barnegat Bay", lat: 39.78, lng: -74.13, category: "bay", state: "New Jersey", species: ["Striped Bass","Bluefish","Flounder"] },

    // New York
    { name: "Lake Ontario NY", lat: 43.55, lng: -77.85, category: "lake", state: "New York", species: ["King Salmon","Brown Trout","Smallmouth Bass","Walleye"] },
    { name: "Finger Lakes - Seneca", lat: 42.65, lng: -76.92, category: "lake", state: "New York", species: ["Lake Trout","Rainbow Trout","Largemouth Bass"] },
    { name: "Finger Lakes - Cayuga", lat: 42.75, lng: -76.70, category: "lake", state: "New York", species: ["Lake Trout","Brown Trout","Largemouth Bass"] },
    { name: "St. Lawrence River NY", lat: 44.32, lng: -75.98, category: "river", state: "New York", species: ["Muskie","Smallmouth Bass","Northern Pike","Walleye"] },
    { name: "Montauk Point", lat: 41.07, lng: -71.85, category: "bay", state: "New York", species: ["Striped Bass","Bluefish","Fluke"] },
    { name: "Oneida Lake", lat: 43.18, lng: -75.92, category: "lake", state: "New York", species: ["Walleye","Yellow Perch","Largemouth Bass"] },

    // Nevada
    { name: "Lake Mead NV", lat: 36.15, lng: -114.38, category: "lake", state: "Nevada", species: ["Striped Bass","Largemouth Bass","Channel Catfish"] },
    { name: "Pyramid Lake NV", lat: 40.00, lng: -119.58, category: "lake", state: "Nevada", species: ["Lahontan Cutthroat Trout","Sacramento Perch"] },
    { name: "Lake Mohave", lat: 35.48, lng: -114.58, category: "lake", state: "Nevada", species: ["Striped Bass","Largemouth Bass","Rainbow Trout"] },
    { name: "Rye Patch Reservoir", lat: 40.48, lng: -118.28, category: "reservoir", state: "Nevada", species: ["Walleye","White Bass","Channel Catfish"] },
    { name: "Ruby Lake NV", lat: 40.18, lng: -115.48, category: "lake", state: "Nevada", species: ["Largemouth Bass","Brown Trout","Rainbow Trout"] },

    // Utah
    { name: "Lake Powell UT", lat: 37.08, lng: -111.25, category: "lake", state: "Utah", species: ["Largemouth Bass","Smallmouth Bass","Striped Bass","Walleye"] },
    { name: "Flaming Gorge Reservoir UT", lat: 40.92, lng: -109.42, category: "reservoir", state: "Utah", species: ["Lake Trout","Rainbow Trout","Smallmouth Bass","Kokanee Salmon"] },
    { name: "Strawberry Reservoir", lat: 40.17, lng: -111.17, category: "reservoir", state: "Utah", species: ["Rainbow Trout","Cutthroat Trout","Kokanee Salmon"] },
    { name: "Green River UT", lat: 40.88, lng: -109.52, category: "river", state: "Utah", species: ["Brown Trout","Rainbow Trout","Cutthroat Trout"] },
    { name: "Bear Lake UT", lat: 41.95, lng: -111.32, category: "lake", state: "Utah", species: ["Lake Trout","Bonneville Cisco","Cutthroat Trout"] },

    // Idaho
    { name: "Henry's Fork", lat: 44.43, lng: -111.33, category: "river", state: "Idaho", species: ["Rainbow Trout","Brown Trout","Cutthroat Trout"] },
    { name: "Salmon River ID", lat: 45.18, lng: -114.02, category: "river", state: "Idaho", species: ["Steelhead","Chinook Salmon","Bull Trout"] },
    { name: "Lake Pend Oreille", lat: 48.15, lng: -116.55, category: "lake", state: "Idaho", species: ["Rainbow Trout","Bull Trout","Kokanee Salmon"] },
    { name: "South Fork Snake River", lat: 43.55, lng: -111.58, category: "river", state: "Idaho", species: ["Cutthroat Trout","Brown Trout","Rainbow Trout"] },
    { name: "Dworshak Reservoir", lat: 46.50, lng: -116.03, category: "reservoir", state: "Idaho", species: ["Smallmouth Bass","Kokanee Salmon","Bull Trout"] },
    { name: "Coeur d'Alene Lake", lat: 47.52, lng: -116.78, category: "lake", state: "Idaho", species: ["Chinook Salmon","Largemouth Bass","Northern Pike"] },

    // Montana
    { name: "Flathead Lake MT", lat: 47.88, lng: -114.12, category: "lake", state: "Montana", species: ["Lake Trout","Bull Trout","Yellow Perch"] },
    { name: "Fort Peck Lake", lat: 47.58, lng: -106.72, category: "lake", state: "Montana", species: ["Walleye","Northern Pike","Lake Trout","Smallmouth Bass"] },
    { name: "Missouri River MT", lat: 47.55, lng: -111.42, category: "river", state: "Montana", species: ["Rainbow Trout","Brown Trout","Walleye"] },
    { name: "Bighorn River", lat: 45.62, lng: -107.95, category: "river", state: "Montana", species: ["Brown Trout","Rainbow Trout"] },
    { name: "Madison River", lat: 45.60, lng: -111.52, category: "river", state: "Montana", species: ["Rainbow Trout","Brown Trout"] },
    { name: "Yellowstone River MT", lat: 45.78, lng: -110.55, category: "river", state: "Montana", species: ["Cutthroat Trout","Brown Trout","Rainbow Trout"] },

    // Wyoming
    { name: "Yellowstone Lake WY", lat: 44.42, lng: -110.35, category: "lake", state: "Wyoming", species: ["Cutthroat Trout","Lake Trout"] },
    { name: "North Platte River WY", lat: 42.85, lng: -106.32, category: "river", state: "Wyoming", species: ["Brown Trout","Rainbow Trout","Walleye"] },
    { name: "Boysen Reservoir", lat: 43.42, lng: -108.18, category: "reservoir", state: "Wyoming", species: ["Walleye","Sauger","Perch"] },
    { name: "Flaming Gorge WY", lat: 41.12, lng: -109.58, category: "reservoir", state: "Wyoming", species: ["Lake Trout","Rainbow Trout","Kokanee Salmon"] },
    { name: "Buffalo Bill Reservoir", lat: 44.48, lng: -109.22, category: "reservoir", state: "Wyoming", species: ["Rainbow Trout","Brown Trout","Lake Trout"] },

    // New Mexico
    { name: "Elephant Butte Lake", lat: 33.22, lng: -107.18, category: "lake", state: "New Mexico", species: ["Largemouth Bass","Striped Bass","Walleye","Crappie"] },
    { name: "Navajo Lake NM", lat: 36.78, lng: -107.58, category: "lake", state: "New Mexico", species: ["Largemouth Bass","Northern Pike","Kokanee Salmon"] },
    { name: "San Juan River NM", lat: 36.72, lng: -107.62, category: "river", state: "New Mexico", species: ["Brown Trout","Rainbow Trout"] },
    { name: "Conchas Lake", lat: 35.38, lng: -104.18, category: "lake", state: "New Mexico", species: ["Walleye","Largemouth Bass","Smallmouth Bass"] },
    { name: "Heron Lake", lat: 36.67, lng: -106.73, category: "lake", state: "New Mexico", species: ["Kokanee Salmon","Lake Trout","Rainbow Trout"] },

    // Arizona
    { name: "Lake Powell AZ", lat: 36.93, lng: -111.48, category: "lake", state: "Arizona", species: ["Largemouth Bass","Smallmouth Bass","Striped Bass","Walleye"] },
    { name: "Lake Pleasant", lat: 33.88, lng: -112.28, category: "lake", state: "Arizona", species: ["Largemouth Bass","Striped Bass","Crappie"] },
    { name: "Roosevelt Lake AZ", lat: 33.68, lng: -111.15, category: "lake", state: "Arizona", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Saguaro Lake", lat: 33.57, lng: -111.53, category: "lake", state: "Arizona", species: ["Largemouth Bass","Yellow Bass","Carp"] },
    { name: "Lees Ferry", lat: 36.87, lng: -111.60, category: "river", state: "Arizona", species: ["Rainbow Trout","Brown Trout"] },

    // Hawaii
    { name: "Kona Coast", lat: 19.63, lng: -156.00, category: "bay", state: "Hawaii", species: ["Blue Marlin","Yellowfin Tuna","Mahi Mahi"] },
    { name: "North Shore Oahu", lat: 21.58, lng: -158.10, category: "bay", state: "Hawaii", species: ["Giant Trevally","Bonefish","Mahi Mahi"] },
    { name: "Wahiawa Reservoir", lat: 21.50, lng: -158.03, category: "reservoir", state: "Hawaii", species: ["Largemouth Bass","Peacock Bass","Tucunare"] },
    { name: "Maui Offshore", lat: 20.80, lng: -156.35, category: "bay", state: "Hawaii", species: ["Blue Marlin","Striped Marlin","Ono"] },

    // Additional Texas
    { name: "Sam Rayburn Reservoir", lat: 31.08, lng: -94.15, category: "reservoir", state: "Texas", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Lake Fork TX", lat: 32.80, lng: -95.72, category: "lake", state: "Texas", species: ["Largemouth Bass","Crappie","Channel Catfish"] },
    { name: "Falcon Lake TX", lat: 26.55, lng: -99.15, category: "lake", state: "Texas", species: ["Largemouth Bass","Channel Catfish","Crappie"] },
    { name: "Choke Canyon Reservoir", lat: 28.48, lng: -98.28, category: "reservoir", state: "Texas", species: ["Largemouth Bass","Catfish","Crappie"] },
    { name: "Amistad Reservoir TX", lat: 29.47, lng: -101.05, category: "reservoir", state: "Texas", species: ["Largemouth Bass","Smallmouth Bass","Striped Bass","Catfish"] },
    { name: "O.H. Ivie Reservoir", lat: 31.62, lng: -99.72, category: "reservoir", state: "Texas", species: ["Largemouth Bass","Smallmouth Bass","Crappie"] },

    // Additional Florida
    { name: "Lake Okeechobee FL", lat: 26.95, lng: -80.78, category: "lake", state: "Florida", species: ["Largemouth Bass","Crappie","Bluegill"] },
    { name: "St. Johns River FL", lat: 29.90, lng: -81.58, category: "river", state: "Florida", species: ["Largemouth Bass","Striped Bass","Shad"] },
    { name: "Everglades FL", lat: 25.72, lng: -80.85, category: "river", state: "Florida", species: ["Largemouth Bass","Peacock Bass","Snook"] },
    { name: "Mosquito Lagoon FL", lat: 28.80, lng: -80.73, category: "bay", state: "Florida", species: ["Red Drum","Speckled Trout","Snook"] },
    { name: "Islamorada FL Keys", lat: 24.93, lng: -80.63, category: "bay", state: "Florida", species: ["Tarpon","Bonefish","Permit"] },
    { name: "Tampa Bay FL", lat: 27.65, lng: -82.60, category: "bay", state: "Florida", species: ["Snook","Red Drum","Tarpon"] },

    // Additional California
    { name: "Clear Lake CA", lat: 39.02, lng: -122.78, category: "lake", state: "California", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Sacramento River CA", lat: 40.58, lng: -122.38, category: "river", state: "California", species: ["Chinook Salmon","Steelhead","Striped Bass"] },
    { name: "San Diego Bay", lat: 32.65, lng: -117.15, category: "bay", state: "California", species: ["Halibut","Yellowtail","Spotted Bay Bass"] },
    { name: "Lake Shasta CA", lat: 40.72, lng: -122.32, category: "lake", state: "California", species: ["Rainbow Trout","Largemouth Bass","Spotted Bass"] },
    { name: "Crowley Lake", lat: 37.58, lng: -118.72, category: "lake", state: "California", species: ["Rainbow Trout","Brown Trout","Sacramento Perch"] },
    { name: "Diamond Valley Lake", lat: 33.68, lng: -117.18, category: "lake", state: "California", species: ["Largemouth Bass","Striped Bass","Trout"] },

    // Additional Oregon
    { name: "Deschutes River", lat: 44.72, lng: -121.18, category: "river", state: "Oregon", species: ["Rainbow Trout","Steelhead","Brown Trout"] },
    { name: "Crater Lake Vicinity", lat: 42.95, lng: -122.10, category: "lake", state: "Oregon", species: ["Rainbow Trout","Kokanee Salmon"] },
    { name: "Rogue River", lat: 42.43, lng: -123.33, category: "river", state: "Oregon", species: ["Steelhead","Chinook Salmon","Smallmouth Bass"] },
    { name: "Haystack Reservoir", lat: 44.48, lng: -121.15, category: "reservoir", state: "Oregon", species: ["Rainbow Trout","Kokanee Salmon"] },
    { name: "Detroit Lake OR", lat: 44.72, lng: -122.18, category: "lake", state: "Oregon", species: ["Rainbow Trout","Kokanee Salmon","Largemouth Bass"] },

    // Additional Washington
    { name: "Lake Chelan WA", lat: 47.85, lng: -120.22, category: "lake", state: "Washington", species: ["Chinook Salmon","Lake Trout","Rainbow Trout"] },
    { name: "Columbia River WA", lat: 46.20, lng: -119.22, category: "river", state: "Washington", species: ["Steelhead","Chinook Salmon","Walleye","Sturgeon"] },
    { name: "Puget Sound", lat: 47.60, lng: -122.35, category: "bay", state: "Washington", species: ["Chinook Salmon","Lingcod","Halibut"] },
    { name: "Banks Lake WA", lat: 47.78, lng: -119.08, category: "lake", state: "Washington", species: ["Walleye","Smallmouth Bass","Kokanee Salmon"] },
    { name: "Lake Roosevelt WA", lat: 47.95, lng: -118.98, category: "lake", state: "Washington", species: ["Walleye","Rainbow Trout","Kokanee Salmon"] },

    // Additional Michigan
    { name: "Lake St. Clair MI", lat: 42.45, lng: -82.70, category: "lake", state: "Michigan", species: ["Smallmouth Bass","Muskie","Walleye","Yellow Perch"] },
    { name: "Au Sable River", lat: 44.68, lng: -84.18, category: "river", state: "Michigan", species: ["Brown Trout","Rainbow Trout","Brook Trout"] },
    { name: "Pere Marquette River", lat: 43.95, lng: -86.35, category: "river", state: "Michigan", species: ["Steelhead","Chinook Salmon","Brown Trout"] },
    { name: "Burt Lake MI", lat: 45.45, lng: -84.70, category: "lake", state: "Michigan", species: ["Walleye","Northern Pike","Smallmouth Bass"] },
    { name: "Houghton Lake MI", lat: 44.35, lng: -84.77, category: "lake", state: "Michigan", species: ["Walleye","Northern Pike","Crappie","Bluegill"] },

    // Additional Wisconsin
    { name: "Lake Winnebago WI", lat: 44.00, lng: -88.42, category: "lake", state: "Wisconsin", species: ["Walleye","White Bass","Lake Sturgeon","Yellow Perch"] },
    { name: "Chippewa Flowage", lat: 46.05, lng: -91.35, category: "lake", state: "Wisconsin", species: ["Muskie","Walleye","Largemouth Bass"] },
    { name: "Eagle River Chain", lat: 45.92, lng: -89.25, category: "lake", state: "Wisconsin", species: ["Muskie","Walleye","Smallmouth Bass","Northern Pike"] },
    { name: "Lake Pepin WI", lat: 44.45, lng: -92.18, category: "lake", state: "Wisconsin", species: ["Walleye","Sauger","Smallmouth Bass"] },

    // Additional Minnesota
    { name: "Lake of the Woods MN", lat: 49.00, lng: -94.75, category: "lake", state: "Minnesota", species: ["Walleye","Northern Pike","Sauger","Smallmouth Bass"] },
    { name: "Mille Lacs Lake MN", lat: 46.20, lng: -93.62, category: "lake", state: "Minnesota", species: ["Walleye","Northern Pike","Smallmouth Bass","Muskie"] },
    { name: "Rainy Lake MN", lat: 48.55, lng: -93.15, category: "lake", state: "Minnesota", species: ["Walleye","Northern Pike","Smallmouth Bass","Crappie"] },
    { name: "Upper Red Lake", lat: 48.05, lng: -94.88, category: "lake", state: "Minnesota", species: ["Walleye","Northern Pike","Crappie"] },
    { name: "Leech Lake MN", lat: 47.12, lng: -94.38, category: "lake", state: "Minnesota", species: ["Walleye","Muskie","Northern Pike","Yellow Perch"] },

    // Additional Colorado
    { name: "Blue Mesa Reservoir", lat: 38.47, lng: -107.22, category: "reservoir", state: "Colorado", species: ["Lake Trout","Rainbow Trout","Kokanee Salmon"] },
    { name: "Eleven Mile Reservoir", lat: 38.92, lng: -105.52, category: "reservoir", state: "Colorado", species: ["Rainbow Trout","Northern Pike","Kokanee Salmon","Carp"] },
    { name: "Spinney Mountain Reservoir", lat: 38.98, lng: -105.58, category: "reservoir", state: "Colorado", species: ["Northern Pike","Rainbow Trout","Cutthroat Trout"] },
    { name: "South Platte River CO", lat: 39.42, lng: -105.22, category: "river", state: "Colorado", species: ["Brown Trout","Rainbow Trout"] },
    { name: "Pueblo Reservoir", lat: 38.27, lng: -104.88, category: "reservoir", state: "Colorado", species: ["Walleye","Smallmouth Bass","Largemouth Bass","Wiper"] },
  ];

  const newLocations = locations.filter(l => !existingNames.has(l.name.toLowerCase()));

  if (newLocations.length === 0) {
    return new Response(JSON.stringify({ message: "All locations already exist", total: existing?.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Insert in batches of 50
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
