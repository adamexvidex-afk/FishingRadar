import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateLocations() {
  return [
    // Additional diverse locations across all regions

    // MORE ALABAMA
    { name: "Logan Martin Lake", lat: 33.60, lng: -86.30, category: "lake", state: "Alabama", species: ["Spotted Bass","Largemouth Bass","Crappie"] },
    { name: "Lake Guntersville – Goose Pond", lat: 34.42, lng: -86.23, category: "lake", state: "Alabama", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Bankhead Lake", lat: 33.58, lng: -87.28, category: "lake", state: "Alabama", species: ["Spotted Bass","Largemouth Bass","Crappie","Striped Bass"] },
    { name: "Jordan Lake – AL", lat: 32.65, lng: -86.25, category: "lake", state: "Alabama", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Mobile Bay – Dauphin Island", lat: 30.25, lng: -88.08, category: "bay", state: "Alabama", species: ["Redfish","Speckled Trout","Flounder","Pompano"] },

    // MORE CALIFORNIA
    { name: "Lake Shasta – Bridge Bay", lat: 40.77, lng: -122.33, category: "lake", state: "California", species: ["Largemouth Bass","Spotted Bass","Rainbow Trout","Brown Trout"] },
    { name: "Trinity Lake", lat: 40.98, lng: -122.77, category: "lake", state: "California", species: ["Largemouth Bass","Smallmouth Bass","Rainbow Trout"] },
    { name: "Lake Almanor", lat: 40.23, lng: -121.15, category: "lake", state: "California", species: ["Largemouth Bass","Smallmouth Bass","Rainbow Trout","Brown Trout"] },
    { name: "Eagle Lake – CA", lat: 40.63, lng: -120.73, category: "lake", state: "California", species: ["Eagle Lake Rainbow Trout"] },
    { name: "Crowley Lake", lat: 37.58, lng: -118.72, category: "lake", state: "California", species: ["Rainbow Trout","Brown Trout","Sacramento Perch"] },
    { name: "Convict Lake – CA", lat: 37.58, lng: -118.85, category: "lake", state: "California", species: ["Rainbow Trout","Brown Trout","Brook Trout"] },
    { name: "Irvine Lake – CA", lat: 33.78, lng: -117.73, category: "lake", state: "California", species: ["Largemouth Bass","Catfish","Trout"] },
    { name: "San Pablo Reservoir", lat: 37.93, lng: -122.22, category: "reservoir", state: "California", species: ["Rainbow Trout","Largemouth Bass","Catfish"] },
    { name: "Catalina Island – CA", lat: 33.38, lng: -118.42, category: "bay", state: "California", species: ["Yellowtail","Calico Bass","Barracuda","White Seabass"] },
    { name: "Half Moon Bay – CA", lat: 37.47, lng: -122.45, category: "bay", state: "California", species: ["Halibut","Rockfish","Lingcod","Striped Bass"] },

    // MORE COLORADO
    { name: "Williams Fork Reservoir", lat: 39.97, lng: -106.18, category: "reservoir", state: "Colorado", species: ["Northern Pike","Rainbow Trout","Brown Trout","Lake Trout"] },
    { name: "Turquoise Lake", lat: 39.25, lng: -106.35, category: "lake", state: "Colorado", species: ["Lake Trout","Rainbow Trout","Brown Trout"] },
    { name: "John Martin Reservoir", lat: 38.07, lng: -102.93, category: "reservoir", state: "Colorado", species: ["Walleye","Wiper","Crappie","Channel Catfish"] },
    { name: "Chatfield Reservoir", lat: 39.53, lng: -105.07, category: "reservoir", state: "Colorado", species: ["Walleye","Largemouth Bass","Rainbow Trout"] },
    { name: "Cherry Creek Reservoir", lat: 39.63, lng: -104.85, category: "reservoir", state: "Colorado", species: ["Walleye","Largemouth Bass","Wiper"] },

    // MORE FLORIDA
    { name: "Lake Seminole – FL", lat: 30.72, lng: -84.87, category: "lake", state: "Florida", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Lake Istokpoga", lat: 27.40, lng: -81.28, category: "lake", state: "Florida", species: ["Largemouth Bass","Crappie","Bluegill"] },
    { name: "Lake George – FL", lat: 29.28, lng: -81.57, category: "lake", state: "Florida", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Everglades – Lox Marina", lat: 26.35, lng: -80.30, category: "lake", state: "Florida", species: ["Largemouth Bass","Peacock Bass","Bluegill"] },
    { name: "Key West Harbor", lat: 24.55, lng: -81.80, category: "bay", state: "Florida", species: ["Tarpon","Permit","Bonefish","Barracuda"] },
    { name: "Islamorada – FL Keys", lat: 24.92, lng: -80.63, category: "bay", state: "Florida", species: ["Bonefish","Permit","Tarpon","Snook"] },
    { name: "Marathon – FL Keys", lat: 24.73, lng: -81.05, category: "bay", state: "Florida", species: ["Permit","Tarpon","Yellowtail Snapper"] },
    { name: "Fort Myers Beach – FL", lat: 26.45, lng: -81.95, category: "bay", state: "Florida", species: ["Snook","Redfish","Seatrout","Tarpon"] },
    { name: "St. Augustine Inlet – FL", lat: 29.90, lng: -81.28, category: "bay", state: "Florida", species: ["Redfish","Flounder","Seatrout","Sheepshead"] },
    { name: "Destin Pass – FL", lat: 30.38, lng: -86.52, category: "bay", state: "Florida", species: ["Redfish","King Mackerel","Cobia","Mahi-Mahi"] },

    // MORE MICHIGAN
    { name: "Lake Michigan – Frankfort MI", lat: 44.63, lng: -86.23, category: "lake", state: "Michigan", species: ["Chinook Salmon","Steelhead","Lake Trout","Coho Salmon"] },
    { name: "Lake Huron – Oscoda MI", lat: 44.42, lng: -83.33, category: "lake", state: "Michigan", species: ["Walleye","Lake Trout","Steelhead","Chinook Salmon"] },
    { name: "Lake Gogebic", lat: 46.48, lng: -89.58, category: "lake", state: "Michigan", species: ["Walleye","Smallmouth Bass","Northern Pike","Yellow Perch"] },
    { name: "Higgins Lake", lat: 44.48, lng: -84.77, category: "lake", state: "Michigan", species: ["Lake Trout","Smallmouth Bass","Cisco","Yellow Perch"] },
    { name: "Crystal Lake – MI", lat: 44.58, lng: -86.07, category: "lake", state: "Michigan", species: ["Lake Trout","Cisco","Smallmouth Bass"] },

    // MORE MINNESOTA
    { name: "Upper Red Lake", lat: 48.10, lng: -94.78, category: "lake", state: "Minnesota", species: ["Walleye","Northern Pike","Yellow Perch","Crappie"] },
    { name: "Lake Kabetogama", lat: 48.42, lng: -93.00, category: "lake", state: "Minnesota", species: ["Walleye","Smallmouth Bass","Northern Pike","Crappie"] },
    { name: "Cass Lake – MN", lat: 47.38, lng: -94.58, category: "lake", state: "Minnesota", species: ["Walleye","Northern Pike","Muskie","Yellow Perch"] },
    { name: "Lake Bemidji", lat: 47.48, lng: -94.87, category: "lake", state: "Minnesota", species: ["Walleye","Northern Pike","Largemouth Bass","Muskie"] },
    { name: "Otter Tail Lake", lat: 46.38, lng: -95.47, category: "lake", state: "Minnesota", species: ["Walleye","Largemouth Bass","Northern Pike","Bluegill"] },

    // MORE NEW YORK
    { name: "Lake Ontario – Oswego NY", lat: 43.47, lng: -76.50, category: "lake", state: "New York", species: ["Chinook Salmon","Brown Trout","Steelhead","Smallmouth Bass"] },
    { name: "Lake George – NY", lat: 43.42, lng: -73.72, category: "lake", state: "New York", species: ["Lake Trout","Landlocked Salmon","Largemouth Bass","Smallmouth Bass"] },
    { name: "Saranac Lake – NY", lat: 44.32, lng: -74.13, category: "lake", state: "New York", species: ["Lake Trout","Northern Pike","Smallmouth Bass"] },
    { name: "Chautauqua Lake", lat: 42.15, lng: -79.37, category: "lake", state: "New York", species: ["Muskie","Walleye","Largemouth Bass","Crappie"] },
    { name: "Oneida Lake", lat: 43.20, lng: -75.92, category: "lake", state: "New York", species: ["Walleye","Yellow Perch","Largemouth Bass","Smallmouth Bass"] },

    // MORE TEXAS
    { name: "Lake Livingston – TX", lat: 30.70, lng: -95.05, category: "lake", state: "Texas", species: ["White Bass","Catfish","Largemouth Bass","Crappie"] },
    { name: "Caddo Lake", lat: 32.70, lng: -94.12, category: "lake", state: "Texas", species: ["Largemouth Bass","Crappie","Catfish","Chain Pickerel"] },
    { name: "Lake Texoma – TX Side", lat: 33.82, lng: -96.53, category: "lake", state: "Texas", species: ["Striped Bass","Largemouth Bass","Smallmouth Bass","Catfish"] },
    { name: "Lake Whitney", lat: 31.88, lng: -97.38, category: "lake", state: "Texas", species: ["Striped Bass","Largemouth Bass","Smallmouth Bass","Catfish"] },
    { name: "Possum Kingdom Lake", lat: 32.87, lng: -98.48, category: "lake", state: "Texas", species: ["Striped Bass","Largemouth Bass","Crappie","Catfish"] },
    { name: "Lake Buchanan – TX", lat: 30.78, lng: -98.42, category: "lake", state: "Texas", species: ["Striped Bass","Largemouth Bass","Crappie"] },
    { name: "Richland Chambers Reservoir", lat: 31.93, lng: -96.10, category: "reservoir", state: "Texas", species: ["Largemouth Bass","Crappie","Catfish","White Bass"] },
    { name: "Lake Ray Roberts", lat: 33.37, lng: -97.05, category: "lake", state: "Texas", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Sabine Lake – TX", lat: 29.90, lng: -93.87, category: "lake", state: "Texas", species: ["Redfish","Speckled Trout","Flounder"] },
    { name: "Port O'Connor – TX", lat: 28.45, lng: -96.42, category: "bay", state: "Texas", species: ["Redfish","Speckled Trout","Flounder","Black Drum"] },

    // MORE VARIOUS STATES
    { name: "Lake Okeechobee – Roland Martin", lat: 26.95, lng: -80.82, category: "lake", state: "Florida", species: ["Largemouth Bass","Crappie","Bluegill","Catfish"] },
    { name: "Lake Cumberland – Wolf Creek", lat: 36.88, lng: -85.12, category: "lake", state: "Kentucky", species: ["Striped Bass","Walleye","Largemouth Bass","Crappie"] },
    { name: "Center Hill Lake – Hurricane Bridge", lat: 36.10, lng: -85.90, category: "lake", state: "Tennessee", species: ["Smallmouth Bass","Walleye","Crappie"] },
    { name: "Percy Priest Lake", lat: 36.12, lng: -86.58, category: "lake", state: "Tennessee", species: ["Largemouth Bass","Crappie","Striped Bass"] },
    { name: "Tim's Ford Lake", lat: 35.20, lng: -86.28, category: "lake", state: "Tennessee", species: ["Smallmouth Bass","Largemouth Bass","Crappie"] },
    { name: "Norris Lake – TN", lat: 36.32, lng: -83.97, category: "lake", state: "Tennessee", species: ["Largemouth Bass","Smallmouth Bass","Striper","Walleye"] },
    { name: "Lake Hartwell – GA Side", lat: 34.38, lng: -82.82, category: "lake", state: "Georgia", species: ["Largemouth Bass","Spotted Bass","Striped Bass"] },
    { name: "Lake Champlain – Ticonderoga NY", lat: 43.85, lng: -73.38, category: "lake", state: "New York", species: ["Largemouth Bass","Smallmouth Bass","Northern Pike","Lake Trout"] },
    { name: "Lake Champlain – Plattsburgh NY", lat: 44.70, lng: -73.45, category: "lake", state: "New York", species: ["Walleye","Smallmouth Bass","Largemouth Bass","Northern Pike"] },
    { name: "Lake Superior – Apostle Islands WI", lat: 46.92, lng: -90.58, category: "lake", state: "Wisconsin", species: ["Lake Trout","Brook Trout","Brown Trout","Smallmouth Bass"] },

    // ADDITIONAL WEST COAST
    { name: "Columbia River – Astoria OR", lat: 46.18, lng: -123.83, category: "river", state: "Oregon", species: ["Chinook Salmon","Sturgeon","Steelhead","Walleye"] },
    { name: "Willamette River – Portland OR", lat: 45.52, lng: -122.67, category: "river", state: "Oregon", species: ["Chinook Salmon","Steelhead","Sturgeon","Smallmouth Bass"] },
    { name: "Lake Billy Chinook", lat: 44.57, lng: -121.27, category: "lake", state: "Oregon", species: ["Bull Trout","Kokanee","Brown Trout","Smallmouth Bass"] },
    { name: "Prineville Reservoir", lat: 44.13, lng: -120.73, category: "reservoir", state: "Oregon", species: ["Rainbow Trout","Largemouth Bass","Smallmouth Bass"] },
    { name: "Lost Lake – OR", lat: 45.50, lng: -121.82, category: "lake", state: "Oregon", species: ["Rainbow Trout","Brown Trout","Brook Trout"] },

    // ADDITIONAL MIDWEST
    { name: "Lake Sakakawea – Van Hook Arm", lat: 47.83, lng: -102.33, category: "lake", state: "North Dakota", species: ["Walleye","Smallmouth Bass","Northern Pike"] },
    { name: "Lake Michigan – Manistee MI", lat: 44.25, lng: -86.35, category: "lake", state: "Michigan", species: ["Chinook Salmon","Steelhead","Brown Trout","Lake Trout"] },
    { name: "Mississippi River – Pool 4 MN", lat: 44.37, lng: -92.08, category: "river", state: "Minnesota", species: ["Walleye","Sauger","Smallmouth Bass","Catfish"] },
    { name: "Lake Erie – Ashtabula OH", lat: 41.90, lng: -80.80, category: "lake", state: "Ohio", species: ["Walleye","Steelhead","Smallmouth Bass","Yellow Perch"] },
    { name: "Lake Shelbyville – Dam Area", lat: 39.38, lng: -88.78, category: "lake", state: "Illinois", species: ["Crappie","Largemouth Bass","Catfish"] },

    // ADDITIONAL SOUTHEAST
    { name: "Lake Seminole – GA Side", lat: 30.75, lng: -84.83, category: "lake", state: "Georgia", species: ["Largemouth Bass","Crappie","Catfish","Hybrid Striped Bass"] },
    { name: "Lake Blackshear", lat: 31.93, lng: -83.88, category: "lake", state: "Georgia", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Clark Hill Lake – SC Side", lat: 33.72, lng: -82.18, category: "lake", state: "South Carolina", species: ["Largemouth Bass","Striped Bass","Crappie"] },
    { name: "Lake Marion – SC", lat: 33.48, lng: -80.12, category: "lake", state: "South Carolina", species: ["Largemouth Bass","Striped Bass","Catfish","Crappie"] },
    { name: "Lake Wylie – SC/NC", lat: 35.05, lng: -81.02, category: "lake", state: "South Carolina", species: ["Largemouth Bass","Crappie","Catfish"] },

    // ADDITIONAL NORTHEAST
    { name: "Allegheny Reservoir – NY", lat: 42.05, lng: -78.77, category: "reservoir", state: "New York", species: ["Walleye","Smallmouth Bass","Northern Pike","Muskie"] },
    { name: "Seneca Lake – Deep Water", lat: 42.60, lng: -76.90, category: "lake", state: "New York", species: ["Lake Trout","Rainbow Trout","Landlocked Salmon","Brown Trout"] },
    { name: "Cayuga Lake – Ithaca", lat: 42.45, lng: -76.52, category: "lake", state: "New York", species: ["Lake Trout","Rainbow Trout","Smallmouth Bass","Brown Trout"] },
    { name: "Quaker Lake – NY", lat: 42.08, lng: -77.38, category: "lake", state: "New York", species: ["Largemouth Bass","Panfish","Trout"] },
    { name: "Connecticut River – Enfield CT", lat: 41.98, lng: -72.57, category: "river", state: "Connecticut", species: ["Largemouth Bass","Northern Pike","Channel Catfish"] },

    // ADDITIONAL SOUTHWEST
    { name: "Lake Mead – Temple Bar", lat: 36.02, lng: -114.33, category: "lake", state: "Arizona", species: ["Largemouth Bass","Striped Bass","Catfish"] },
    { name: "Lake Havasu – AZ Side", lat: 34.47, lng: -114.33, category: "lake", state: "Arizona", species: ["Largemouth Bass","Smallmouth Bass","Striped Bass","Redear Sunfish"] },
    { name: "Roosevelt Lake – AZ", lat: 33.67, lng: -111.17, category: "lake", state: "Arizona", species: ["Largemouth Bass","Smallmouth Bass","Crappie","Catfish"] },
    { name: "Show Low Lake", lat: 34.22, lng: -110.02, category: "lake", state: "Arizona", species: ["Rainbow Trout","Largemouth Bass","Walleye"] },
    { name: "Fool Hollow Lake", lat: 34.27, lng: -110.02, category: "lake", state: "Arizona", species: ["Rainbow Trout","Largemouth Bass","Catfish"] },

    // ADDITIONAL PLAINS
    { name: "Fort Supply Lake – OK", lat: 36.57, lng: -99.57, category: "lake", state: "Oklahoma", species: ["Walleye","Saugeye","Largemouth Bass"] },
    { name: "Canton Lake – OK", lat: 36.07, lng: -98.58, category: "lake", state: "Oklahoma", species: ["Walleye","Sauger","Largemouth Bass"] },
    { name: "Lake Hefner – OKC", lat: 35.55, lng: -97.58, category: "lake", state: "Oklahoma", species: ["Walleye","Largemouth Bass","Crappie","White Bass"] },
    { name: "Waurika Lake", lat: 34.15, lng: -98.02, category: "lake", state: "Oklahoma", species: ["Largemouth Bass","Crappie","Catfish","Striped Bass"] },
    { name: "Lake Murray – OK", lat: 34.05, lng: -97.07, category: "lake", state: "Oklahoma", species: ["Largemouth Bass","Crappie","Catfish","Smallmouth Bass"] },
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
