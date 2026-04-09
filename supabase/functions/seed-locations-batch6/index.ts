import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateLocations() {
  return [
    // ALABAMA
    { name: "Smith Lake – Jasper", lat: 34.07, lng: -87.28, category: "lake", state: "Alabama", species: ["Spotted Bass","Largemouth Bass","Striped Bass"] },
    { name: "Pickwick Lake – AL", lat: 34.79, lng: -87.85, category: "lake", state: "Alabama", species: ["Smallmouth Bass","Largemouth Bass","Catfish"] },
    { name: "Weiss Lake", lat: 34.14, lng: -85.80, category: "lake", state: "Alabama", species: ["Crappie","Largemouth Bass","Catfish"] },
    { name: "Lake Martin", lat: 32.70, lng: -85.90, category: "lake", state: "Alabama", species: ["Largemouth Bass","Spotted Bass","Striped Bass"] },
    { name: "Wheeler Lake", lat: 34.57, lng: -87.08, category: "lake", state: "Alabama", species: ["Largemouth Bass","Smallmouth Bass","Crappie"] },
    { name: "Neely Henry Lake", lat: 33.80, lng: -86.05, category: "lake", state: "Alabama", species: ["Spotted Bass","Largemouth Bass","Crappie"] },
    { name: "Lake Eufaula", lat: 31.95, lng: -85.10, category: "lake", state: "Alabama", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Lay Lake", lat: 33.30, lng: -86.50, category: "lake", state: "Alabama", species: ["Spotted Bass","Largemouth Bass","Striped Bass"] },
    { name: "Mobile Bay – East Shore", lat: 30.53, lng: -87.90, category: "bay", state: "Alabama", species: ["Redfish","Speckled Trout","Flounder"] },
    { name: "Mobile-Tensaw Delta", lat: 30.72, lng: -87.92, category: "river", state: "Alabama", species: ["Largemouth Bass","Crappie","Catfish"] },

    // ALASKA (more)
    { name: "Copper River Delta", lat: 60.43, lng: -145.20, category: "river", state: "Alaska", species: ["Silver Salmon","Sockeye Salmon","Dolly Varden"] },
    { name: "Deep Creek – Ninilchik", lat: 60.00, lng: -151.65, category: "stream", state: "Alaska", species: ["King Salmon","Silver Salmon","Steelhead"] },
    { name: "Susitna River", lat: 62.10, lng: -150.07, category: "river", state: "Alaska", species: ["King Salmon","Silver Salmon","Rainbow Trout"] },
    { name: "Seward Silver Salmon Derby", lat: 60.11, lng: -149.44, category: "bay", state: "Alaska", species: ["Silver Salmon","Halibut","Rockfish"] },
    { name: "Kodiak Island – Buskin River", lat: 57.75, lng: -152.35, category: "river", state: "Alaska", species: ["Silver Salmon","Pink Salmon","Steelhead"] },

    // ARIZONA
    { name: "Lake Powell – Wahweap", lat: 37.00, lng: -111.49, category: "lake", state: "Arizona", species: ["Largemouth Bass","Striped Bass","Walleye"] },
    { name: "Lake Powell – Antelope Point", lat: 36.94, lng: -111.43, category: "lake", state: "Arizona", species: ["Smallmouth Bass","Striped Bass","Crappie"] },
    { name: "Saguaro Lake", lat: 33.57, lng: -111.53, category: "lake", state: "Arizona", species: ["Largemouth Bass","Smallmouth Bass","Carp"] },
    { name: "Canyon Lake – AZ", lat: 33.53, lng: -111.43, category: "lake", state: "Arizona", species: ["Largemouth Bass","Rainbow Trout","Walleye"] },
    { name: "Apache Lake", lat: 33.57, lng: -111.28, category: "lake", state: "Arizona", species: ["Largemouth Bass","Smallmouth Bass","Yellow Bass"] },
    { name: "Bartlett Lake", lat: 33.82, lng: -111.63, category: "lake", state: "Arizona", species: ["Largemouth Bass","Smallmouth Bass","Flathead Catfish"] },
    { name: "Lees Ferry – Colorado River", lat: 36.87, lng: -111.60, category: "river", state: "Arizona", species: ["Rainbow Trout","Brown Trout"] },
    { name: "Lake Pleasant", lat: 33.87, lng: -112.27, category: "lake", state: "Arizona", species: ["Largemouth Bass","Smallmouth Bass","Striped Bass","White Bass"] },
    { name: "Lake Mohave", lat: 35.52, lng: -114.69, category: "lake", state: "Arizona", species: ["Largemouth Bass","Striped Bass","Rainbow Trout"] },
    { name: "Patagonia Lake", lat: 31.49, lng: -110.85, category: "lake", state: "Arizona", species: ["Largemouth Bass","Crappie","Channel Catfish"] },

    // ARKANSAS
    { name: "Bull Shoals Lake", lat: 36.38, lng: -92.58, category: "lake", state: "Arkansas", species: ["Largemouth Bass","Smallmouth Bass","Walleye","Crappie"] },
    { name: "Lake Norfork", lat: 36.25, lng: -92.25, category: "lake", state: "Arkansas", species: ["Largemouth Bass","Striped Bass","Walleye"] },
    { name: "Greers Ferry Lake", lat: 35.50, lng: -92.17, category: "lake", state: "Arkansas", species: ["Largemouth Bass","Walleye","Hybrid Striped Bass"] },
    { name: "Lake Ouachita", lat: 34.58, lng: -93.22, category: "lake", state: "Arkansas", species: ["Largemouth Bass","Striped Bass","Bream"] },
    { name: "White River – Cotter", lat: 36.27, lng: -92.53, category: "river", state: "Arkansas", species: ["Brown Trout","Rainbow Trout","Brook Trout"] },
    { name: "Little Red River", lat: 35.53, lng: -92.10, category: "river", state: "Arkansas", species: ["Brown Trout","Rainbow Trout","Brook Trout"] },
    { name: "Lake DeGray", lat: 34.23, lng: -93.17, category: "lake", state: "Arkansas", species: ["Largemouth Bass","Hybrid Striped Bass","Crappie"] },
    { name: "Millwood Lake", lat: 33.62, lng: -93.93, category: "lake", state: "Arkansas", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Lake Hamilton", lat: 34.47, lng: -93.07, category: "lake", state: "Arkansas", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Beaver Lake – AR", lat: 36.30, lng: -94.02, category: "lake", state: "Arkansas", species: ["Largemouth Bass","Smallmouth Bass","Striped Bass"] },

    // CALIFORNIA
    { name: "Clear Lake – CA", lat: 39.02, lng: -122.77, category: "lake", state: "California", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Lake Berryessa", lat: 38.58, lng: -122.23, category: "lake", state: "California", species: ["Largemouth Bass","Smallmouth Bass","Rainbow Trout"] },
    { name: "Diamond Valley Lake", lat: 33.68, lng: -117.00, category: "lake", state: "California", species: ["Largemouth Bass","Striped Bass","Trout"] },
    { name: "Castaic Lake", lat: 34.55, lng: -118.60, category: "lake", state: "California", species: ["Largemouth Bass","Rainbow Trout","Catfish"] },
    { name: "Don Pedro Reservoir", lat: 37.72, lng: -120.40, category: "reservoir", state: "California", species: ["Largemouth Bass","Smallmouth Bass","King Salmon"] },
    { name: "New Melones Lake", lat: 37.95, lng: -120.53, category: "lake", state: "California", species: ["Largemouth Bass","Smallmouth Bass","Rainbow Trout"] },
    { name: "Lake Perris", lat: 33.80, lng: -117.17, category: "lake", state: "California", species: ["Largemouth Bass","Channel Catfish","Bluegill"] },
    { name: "Sacramento River – Red Bluff", lat: 40.18, lng: -122.24, category: "river", state: "California", species: ["King Salmon","Steelhead","Striped Bass"] },
    { name: "Klamath River – CA", lat: 41.52, lng: -122.38, category: "river", state: "California", species: ["Steelhead","King Salmon","Rainbow Trout"] },
    { name: "San Francisco Bay – Berkeley Flats", lat: 37.87, lng: -122.30, category: "bay", state: "California", species: ["Striped Bass","Halibut","Sturgeon"] },
    { name: "Lake Havasu – CA Side", lat: 34.48, lng: -114.35, category: "lake", state: "California", species: ["Largemouth Bass","Smallmouth Bass","Striped Bass","Redear Sunfish"] },
    { name: "Folsom Lake", lat: 38.72, lng: -121.10, category: "lake", state: "California", species: ["Rainbow Trout","Largemouth Bass","Smallmouth Bass"] },
    { name: "Lake Oroville", lat: 39.55, lng: -121.47, category: "lake", state: "California", species: ["Spotted Bass","King Salmon","Rainbow Trout"] },
    { name: "San Diego Bay", lat: 32.65, lng: -117.13, category: "bay", state: "California", species: ["Halibut","Corvina","Spotted Bay Bass"] },
    { name: "Channel Islands – Anacapa", lat: 34.02, lng: -119.37, category: "bay", state: "California", species: ["Yellowtail","Calico Bass","White Seabass"] },

    // COLORADO
    { name: "Spinney Mountain Reservoir", lat: 38.98, lng: -105.72, category: "reservoir", state: "Colorado", species: ["Rainbow Trout","Brown Trout","Northern Pike"] },
    { name: "Eleven Mile Reservoir", lat: 38.93, lng: -105.53, category: "reservoir", state: "Colorado", species: ["Rainbow Trout","Brown Trout","Northern Pike","Kokanee Salmon"] },
    { name: "Blue Mesa Reservoir", lat: 38.47, lng: -107.22, category: "reservoir", state: "Colorado", species: ["Lake Trout","Brown Trout","Kokanee Salmon","Rainbow Trout"] },
    { name: "Horsetooth Reservoir", lat: 40.55, lng: -105.17, category: "reservoir", state: "Colorado", species: ["Walleye","Smallmouth Bass","Rainbow Trout"] },
    { name: "Pueblo Reservoir", lat: 38.27, lng: -104.82, category: "reservoir", state: "Colorado", species: ["Walleye","Wiper","Largemouth Bass","Rainbow Trout"] },
    { name: "Frying Pan River", lat: 39.30, lng: -106.63, category: "river", state: "Colorado", species: ["Rainbow Trout","Brown Trout","Brook Trout"] },
    { name: "South Platte River – Deckers", lat: 39.22, lng: -105.22, category: "river", state: "Colorado", species: ["Rainbow Trout","Brown Trout"] },
    { name: "Colorado River – Glenwood Canyon", lat: 39.57, lng: -107.32, category: "river", state: "Colorado", species: ["Rainbow Trout","Brown Trout","Whitefish"] },
    { name: "Arkansas River – Buena Vista", lat: 38.84, lng: -106.13, category: "river", state: "Colorado", species: ["Brown Trout","Rainbow Trout"] },
    { name: "Taylor River", lat: 38.73, lng: -106.85, category: "river", state: "Colorado", species: ["Rainbow Trout","Brown Trout","Brook Trout"] },

    // CONNECTICUT (more)
    { name: "Saugatuck Reservoir", lat: 41.22, lng: -73.37, category: "reservoir", state: "Connecticut", species: ["Largemouth Bass","Brown Trout","Bluegill"] },
    { name: "West Hill Pond", lat: 41.87, lng: -73.07, category: "lake", state: "Connecticut", species: ["Largemouth Bass","Brown Trout","Perch"] },
    { name: "Long Island Sound – Norwalk", lat: 41.08, lng: -73.42, category: "bay", state: "Connecticut", species: ["Striped Bass","Bluefish","Blackfish"] },
    { name: "Connecticut River – Haddam", lat: 41.45, lng: -72.50, category: "river", state: "Connecticut", species: ["Striped Bass","Shad","Smallmouth Bass"] },
    { name: "Lake Zoar", lat: 41.38, lng: -73.20, category: "lake", state: "Connecticut", species: ["Largemouth Bass","Walleye","Channel Catfish"] },

    // DELAWARE
    { name: "Delaware Bay – Broadkill Beach", lat: 38.80, lng: -75.20, category: "bay", state: "Delaware", species: ["Weakfish","Striped Bass","Bluefish"] },
    { name: "Indian River Inlet", lat: 38.61, lng: -75.07, category: "bay", state: "Delaware", species: ["Striped Bass","Flounder","Bluefish","Tog"] },
    { name: "Lums Pond", lat: 39.57, lng: -75.73, category: "lake", state: "Delaware", species: ["Largemouth Bass","Catfish","Bluegill"] },
    { name: "Killens Pond", lat: 38.98, lng: -75.53, category: "lake", state: "Delaware", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Delaware Seashore State Park Surf", lat: 38.63, lng: -75.07, category: "beach", state: "Delaware", species: ["Striped Bass","Bluefish","Kingfish","Flounder"] },

    // FLORIDA (more)
    { name: "Indian River Lagoon – Sebastian", lat: 27.82, lng: -80.47, category: "lagoon", state: "Florida", species: ["Redfish","Snook","Seatrout"] },
    { name: "Mosquito Lagoon", lat: 28.78, lng: -80.77, category: "lagoon", state: "Florida", species: ["Redfish","Seatrout","Black Drum"] },
    { name: "Tampa Bay – Gandy Bridge", lat: 27.87, lng: -82.58, category: "bay", state: "Florida", species: ["Snook","Redfish","Seatrout"] },
    { name: "Charlotte Harbor", lat: 26.87, lng: -82.10, category: "bay", state: "Florida", species: ["Snook","Redfish","Tarpon"] },
    { name: "Pine Island Sound", lat: 26.62, lng: -82.17, category: "bay", state: "Florida", species: ["Snook","Redfish","Seatrout","Tarpon"] },
    { name: "Lake Toho – South", lat: 28.15, lng: -81.38, category: "lake", state: "Florida", species: ["Largemouth Bass","Bluegill","Crappie"] },
    { name: "Stick Marsh – Farm 13", lat: 27.75, lng: -80.72, category: "lake", state: "Florida", species: ["Largemouth Bass","Bluegill","Crappie"] },
    { name: "Rodman Reservoir", lat: 29.50, lng: -81.80, category: "reservoir", state: "Florida", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Lake Kissimmee – FL", lat: 27.93, lng: -81.30, category: "lake", state: "Florida", species: ["Largemouth Bass","Crappie","Bluegill"] },
    { name: "Dry Tortugas – Fort Jefferson", lat: 24.63, lng: -82.87, category: "reef", state: "Florida", species: ["Yellowtail Snapper","Grouper","Permit"] },
    { name: "Biscayne Bay – Stiltsville", lat: 25.60, lng: -80.17, category: "bay", state: "Florida", species: ["Bonefish","Permit","Tarpon"] },
    { name: "Homosassa River", lat: 28.80, lng: -82.58, category: "river", state: "Florida", species: ["Redfish","Snook","Tarpon"] },
    { name: "Crystal River – Kings Bay", lat: 28.88, lng: -82.60, category: "river", state: "Florida", species: ["Redfish","Snook","Seatrout"] },
    { name: "Apalachicola Bay", lat: 29.67, lng: -85.02, category: "bay", state: "Florida", species: ["Redfish","Seatrout","Flounder"] },
    { name: "Choctawhatchee Bay", lat: 30.42, lng: -86.20, category: "bay", state: "Florida", species: ["Redfish","Seatrout","Flounder","Pompano"] },

    // GEORGIA
    { name: "Lake Lanier – Brown's Bridge", lat: 34.28, lng: -84.00, category: "lake", state: "Georgia", species: ["Spotted Bass","Largemouth Bass","Striped Bass"] },
    { name: "West Point Lake", lat: 33.00, lng: -85.17, category: "lake", state: "Georgia", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Lake Oconee", lat: 33.55, lng: -83.22, category: "lake", state: "Georgia", species: ["Largemouth Bass","Striped Bass","Crappie"] },
    { name: "Lake Sinclair", lat: 33.12, lng: -83.22, category: "lake", state: "Georgia", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Clarks Hill Lake – GA Side", lat: 33.68, lng: -82.20, category: "lake", state: "Georgia", species: ["Largemouth Bass","Striped Bass","Crappie"] },
    { name: "Altamaha River", lat: 31.55, lng: -81.72, category: "river", state: "Georgia", species: ["Largemouth Bass","Redbreast Sunfish","Catfish"] },
    { name: "Savannah River – Augusta", lat: 33.47, lng: -81.97, category: "river", state: "Georgia", species: ["Largemouth Bass","Striped Bass","Catfish"] },
    { name: "St. Simons Island – GA", lat: 31.15, lng: -81.37, category: "bay", state: "Georgia", species: ["Redfish","Seatrout","Flounder"] },
    { name: "Cumberland Island Sound", lat: 30.83, lng: -81.45, category: "bay", state: "Georgia", species: ["Redfish","Tarpon","Shark"] },
    { name: "Lake Burton", lat: 34.77, lng: -83.55, category: "lake", state: "Georgia", species: ["Largemouth Bass","Brown Trout","Rainbow Trout"] },

    // IDAHO
    { name: "Henry's Fork – Last Chance", lat: 44.55, lng: -111.30, category: "river", state: "Idaho", species: ["Rainbow Trout","Brown Trout","Brook Trout"] },
    { name: "South Fork Boise River", lat: 43.62, lng: -115.50, category: "river", state: "Idaho", species: ["Rainbow Trout","Brown Trout","Bull Trout"] },
    { name: "Silver Creek – ID", lat: 43.43, lng: -114.10, category: "stream", state: "Idaho", species: ["Rainbow Trout","Brown Trout"] },
    { name: "Salmon River – Stanley", lat: 44.22, lng: -114.93, category: "river", state: "Idaho", species: ["Steelhead","Chinook Salmon","Bull Trout"] },
    { name: "Snake River – Hells Canyon", lat: 45.30, lng: -116.70, category: "river", state: "Idaho", species: ["Smallmouth Bass","Steelhead","Sturgeon"] },
    { name: "Lake Pend Oreille", lat: 48.12, lng: -116.55, category: "lake", state: "Idaho", species: ["Rainbow Trout","Bull Trout","Lake Trout","Kokanee"] },
    { name: "Priest Lake – ID", lat: 48.55, lng: -116.87, category: "lake", state: "Idaho", species: ["Lake Trout","Bull Trout","Kokanee"] },
    { name: "CJ Strike Reservoir", lat: 42.95, lng: -115.92, category: "reservoir", state: "Idaho", species: ["Largemouth Bass","Smallmouth Bass","Crappie","Catfish"] },
    { name: "Anderson Ranch Reservoir", lat: 43.35, lng: -115.47, category: "reservoir", state: "Idaho", species: ["Rainbow Trout","Kokanee","Bull Trout"] },
    { name: "Clearwater River – ID", lat: 46.42, lng: -116.78, category: "river", state: "Idaho", species: ["Steelhead","Chinook Salmon","Smallmouth Bass"] },

    // ILLINOIS
    { name: "Rend Lake – IL", lat: 38.05, lng: -88.95, category: "lake", state: "Illinois", species: ["Largemouth Bass","Crappie","Catfish","Bluegill"] },
    { name: "Lake Shelbyville", lat: 39.42, lng: -88.82, category: "lake", state: "Illinois", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Kinkaid Lake", lat: 37.82, lng: -89.43, category: "lake", state: "Illinois", species: ["Largemouth Bass","Bluegill","Catfish","Muskie"] },
    { name: "Lake Clinton", lat: 40.15, lng: -88.97, category: "lake", state: "Illinois", species: ["Largemouth Bass","Crappie","Channel Catfish"] },
    { name: "Fox Chain O'Lakes", lat: 42.40, lng: -88.20, category: "lake", state: "Illinois", species: ["Largemouth Bass","Walleye","Northern Pike","Muskie"] },
    { name: "Mississippi River – Pool 13", lat: 42.05, lng: -90.28, category: "river", state: "Illinois", species: ["Walleye","Sauger","Largemouth Bass","Catfish"] },
    { name: "Lake Springfield – IL", lat: 39.72, lng: -89.63, category: "lake", state: "Illinois", species: ["Largemouth Bass","Crappie","Channel Catfish"] },
    { name: "Forbes Lake", lat: 40.08, lng: -89.58, category: "lake", state: "Illinois", species: ["Largemouth Bass","Bluegill","Channel Catfish"] },
    { name: "Carlyle Lake", lat: 38.62, lng: -89.35, category: "lake", state: "Illinois", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Lake Michigan – Chicago Lakefront", lat: 41.90, lng: -87.60, category: "lake", state: "Illinois", species: ["Chinook Salmon","Coho Salmon","Rainbow Trout","Smallmouth Bass"] },

    // INDIANA
    { name: "Monroe Lake – IN", lat: 39.05, lng: -86.47, category: "lake", state: "Indiana", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Patoka Lake", lat: 38.42, lng: -86.68, category: "lake", state: "Indiana", species: ["Largemouth Bass","Crappie","Walleye"] },
    { name: "Brookville Lake", lat: 39.42, lng: -84.97, category: "lake", state: "Indiana", species: ["Largemouth Bass","Crappie","Walleye","Saugeye"] },
    { name: "Lake Wawasee", lat: 41.38, lng: -85.73, category: "lake", state: "Indiana", species: ["Largemouth Bass","Walleye","Muskie","Bluegill"] },
    { name: "Mississinewa Lake", lat: 40.72, lng: -85.97, category: "lake", state: "Indiana", species: ["Largemouth Bass","Crappie","Walleye"] },
    { name: "Salamonie Lake", lat: 40.80, lng: -85.63, category: "lake", state: "Indiana", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Hardy Lake", lat: 38.82, lng: -85.67, category: "lake", state: "Indiana", species: ["Largemouth Bass","Bluegill","Crappie"] },
    { name: "Sugar Creek – Crawfordsville", lat: 40.05, lng: -86.90, category: "stream", state: "Indiana", species: ["Smallmouth Bass","Rock Bass","Channel Catfish"] },
    { name: "Lake Michigan – Michigan City IN", lat: 41.73, lng: -86.90, category: "lake", state: "Indiana", species: ["Chinook Salmon","Coho Salmon","Steelhead"] },
    { name: "White River – Indianapolis", lat: 39.77, lng: -86.18, category: "river", state: "Indiana", species: ["Smallmouth Bass","Channel Catfish","Flathead Catfish"] },

    // IOWA
    { name: "Spirit Lake – IA", lat: 43.47, lng: -95.10, category: "lake", state: "Iowa", species: ["Walleye","Yellow Perch","Smallmouth Bass","Muskie"] },
    { name: "West Okoboji Lake", lat: 43.37, lng: -95.17, category: "lake", state: "Iowa", species: ["Walleye","Smallmouth Bass","Muskie","Yellow Perch"] },
    { name: "Big Creek Lake – IA", lat: 41.82, lng: -93.70, category: "lake", state: "Iowa", species: ["Largemouth Bass","Crappie","Catfish","Walleye"] },
    { name: "Lake Red Rock", lat: 41.38, lng: -93.02, category: "lake", state: "Iowa", species: ["Walleye","White Bass","Crappie","Catfish"] },
    { name: "Coralville Reservoir", lat: 41.72, lng: -91.57, category: "reservoir", state: "Iowa", species: ["Walleye","Crappie","White Bass"] },
    { name: "Mississippi River – Pool 9", lat: 43.15, lng: -91.18, category: "river", state: "Iowa", species: ["Walleye","Sauger","Largemouth Bass","Catfish"] },
    { name: "Rathbun Lake", lat: 40.82, lng: -92.88, category: "lake", state: "Iowa", species: ["Walleye","Crappie","Channel Catfish"] },
    { name: "Lake Macbride", lat: 41.78, lng: -91.53, category: "lake", state: "Iowa", species: ["Largemouth Bass","Bluegill","Crappie"] },
    { name: "Saylorville Lake", lat: 41.72, lng: -93.67, category: "lake", state: "Iowa", species: ["Walleye","White Bass","Crappie"] },
    { name: "Storm Lake – IA", lat: 42.63, lng: -95.20, category: "lake", state: "Iowa", species: ["Walleye","White Bass","Yellow Perch"] },

    // KANSAS
    { name: "Milford Reservoir", lat: 39.10, lng: -96.88, category: "reservoir", state: "Kansas", species: ["Walleye","White Bass","Crappie","Catfish"] },
    { name: "El Dorado Reservoir", lat: 37.77, lng: -96.77, category: "reservoir", state: "Kansas", species: ["Walleye","Largemouth Bass","White Bass"] },
    { name: "Clinton Reservoir", lat: 38.92, lng: -95.33, category: "reservoir", state: "Kansas", species: ["Largemouth Bass","Crappie","Walleye"] },
    { name: "Cheney Reservoir", lat: 37.73, lng: -97.82, category: "reservoir", state: "Kansas", species: ["Walleye","White Bass","Wiper"] },
    { name: "Glen Elder Reservoir", lat: 39.48, lng: -98.30, category: "reservoir", state: "Kansas", species: ["Walleye","Wiper","Smallmouth Bass"] },
    { name: "Perry Reservoir", lat: 39.17, lng: -95.43, category: "reservoir", state: "Kansas", species: ["Crappie","Walleye","White Bass"] },
    { name: "Pomona Reservoir", lat: 38.67, lng: -95.57, category: "reservoir", state: "Kansas", species: ["Crappie","Largemouth Bass","Catfish"] },
    { name: "Lovewell Reservoir", lat: 39.87, lng: -98.02, category: "reservoir", state: "Kansas", species: ["Walleye","Wiper","White Bass"] },
    { name: "Wilson Reservoir", lat: 38.95, lng: -98.55, category: "reservoir", state: "Kansas", species: ["Largemouth Bass","Striped Bass","Walleye"] },
    { name: "Tuttle Creek Reservoir", lat: 39.27, lng: -96.58, category: "reservoir", state: "Kansas", species: ["Crappie","Walleye","White Bass","Catfish"] },

    // KENTUCKY
    { name: "Lake Barkley", lat: 36.83, lng: -87.90, category: "lake", state: "Kentucky", species: ["Largemouth Bass","Crappie","Catfish","Sauger"] },
    { name: "Dale Hollow Lake – KY", lat: 36.60, lng: -85.35, category: "lake", state: "Kentucky", species: ["Smallmouth Bass","Largemouth Bass","Walleye"] },
    { name: "Barren River Lake", lat: 36.90, lng: -86.12, category: "lake", state: "Kentucky", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Green River Lake", lat: 37.22, lng: -85.28, category: "lake", state: "Kentucky", species: ["Largemouth Bass","Crappie","Muskie"] },
    { name: "Taylorsville Lake", lat: 38.03, lng: -85.28, category: "lake", state: "Kentucky", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Cave Run Lake", lat: 38.12, lng: -83.53, category: "lake", state: "Kentucky", species: ["Muskie","Largemouth Bass","Crappie"] },
    { name: "Nolin River Lake", lat: 37.33, lng: -86.25, category: "lake", state: "Kentucky", species: ["Largemouth Bass","Crappie","Walleye"] },
    { name: "Rough River Lake", lat: 37.60, lng: -86.48, category: "lake", state: "Kentucky", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Dewey Lake – KY", lat: 37.72, lng: -82.75, category: "lake", state: "Kentucky", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Elkhorn Creek", lat: 38.28, lng: -84.78, category: "stream", state: "Kentucky", species: ["Smallmouth Bass","Rock Bass","Longear Sunfish"] },

    // LOUISIANA
    { name: "Toledo Bend Reservoir", lat: 31.22, lng: -93.55, category: "reservoir", state: "Louisiana", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Lake D'Arbonne", lat: 32.60, lng: -92.27, category: "lake", state: "Louisiana", species: ["Largemouth Bass","Crappie","Bream"] },
    { name: "Caney Creek Reservoir", lat: 32.28, lng: -92.72, category: "reservoir", state: "Louisiana", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Lake Claiborne", lat: 32.52, lng: -92.65, category: "lake", state: "Louisiana", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "False River", lat: 30.72, lng: -91.47, category: "lake", state: "Louisiana", species: ["Largemouth Bass","Sac-a-lait","Catfish"] },
    { name: "Lake Verret", lat: 29.90, lng: -91.12, category: "lake", state: "Louisiana", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Venice – Louisiana Offshore", lat: 29.27, lng: -89.35, category: "bay", state: "Louisiana", species: ["Redfish","Speckled Trout","Tuna","Cobia"] },
    { name: "Grand Isle", lat: 29.23, lng: -90.00, category: "bay", state: "Louisiana", species: ["Redfish","Speckled Trout","Flounder","Sheepshead"] },
    { name: "Atchafalaya Basin", lat: 30.28, lng: -91.72, category: "river", state: "Louisiana", species: ["Largemouth Bass","Crappie","Catfish","Bowfin"] },
    { name: "Calcasieu Lake", lat: 29.90, lng: -93.28, category: "lake", state: "Louisiana", species: ["Redfish","Speckled Trout","Flounder"] },

    // MAINE (more)
    { name: "West Grand Lake – ME", lat: 45.22, lng: -67.72, category: "lake", state: "Maine", species: ["Smallmouth Bass","Landlocked Salmon","Lake Trout"] },
    { name: "Aziscohos Lake", lat: 44.97, lng: -71.07, category: "lake", state: "Maine", species: ["Brook Trout","Landlocked Salmon","Lake Trout"] },
    { name: "Chesuncook Lake", lat: 46.05, lng: -69.27, category: "lake", state: "Maine", species: ["Lake Trout","Landlocked Salmon","Brook Trout"] },
    { name: "Mooselookmeguntic Lake", lat: 44.87, lng: -70.77, category: "lake", state: "Maine", species: ["Brook Trout","Landlocked Salmon","Brown Trout"] },
    { name: "Saco River – ME", lat: 43.98, lng: -70.80, category: "river", state: "Maine", species: ["Smallmouth Bass","Brown Trout","Brook Trout"] },

    // MARYLAND
    { name: "Chesapeake Bay – Kent Island", lat: 38.95, lng: -76.35, category: "bay", state: "Maryland", species: ["Striped Bass","Bluefish","White Perch"] },
    { name: "Deep Creek Lake – MD", lat: 39.52, lng: -79.32, category: "lake", state: "Maryland", species: ["Walleye","Largemouth Bass","Yellow Perch"] },
    { name: "Prettyboy Reservoir", lat: 39.63, lng: -76.73, category: "reservoir", state: "Maryland", species: ["Largemouth Bass","Brown Trout","Bluegill"] },
    { name: "Triadelphia Reservoir", lat: 39.18, lng: -76.97, category: "reservoir", state: "Maryland", species: ["Largemouth Bass","Tiger Muskie","Crappie"] },
    { name: "Choptank River", lat: 38.68, lng: -75.95, category: "river", state: "Maryland", species: ["Largemouth Bass","Catfish","Crappie"] },
    { name: "Chesapeake Bay – Point Lookout", lat: 38.05, lng: -76.32, category: "bay", state: "Maryland", species: ["Striped Bass","Bluefish","Croaker"] },
    { name: "Potomac River – Smallmouth Stretch", lat: 39.27, lng: -77.73, category: "river", state: "Maryland", species: ["Smallmouth Bass","Largemouth Bass","Catfish"] },
    { name: "Ocean City MD Offshore", lat: 38.33, lng: -74.57, category: "bay", state: "Maryland", species: ["White Marlin","Yellowfin Tuna","Mahi-Mahi"] },
    { name: "Liberty Reservoir", lat: 39.42, lng: -76.85, category: "reservoir", state: "Maryland", species: ["Largemouth Bass","Brown Trout","Crappie"] },
    { name: "Severn River – MD", lat: 39.02, lng: -76.55, category: "river", state: "Maryland", species: ["Striped Bass","White Perch","Crappie"] },

    // MICHIGAN
    { name: "Lake St. Clair – MI", lat: 42.43, lng: -82.68, category: "lake", state: "Michigan", species: ["Smallmouth Bass","Muskie","Walleye","Yellow Perch"] },
    { name: "Au Sable River – Grayling", lat: 44.66, lng: -84.71, category: "river", state: "Michigan", species: ["Brown Trout","Brook Trout","Rainbow Trout"] },
    { name: "Pere Marquette River", lat: 43.93, lng: -86.18, category: "river", state: "Michigan", species: ["Steelhead","Brown Trout","Chinook Salmon"] },
    { name: "Manistee River", lat: 44.25, lng: -86.25, category: "river", state: "Michigan", species: ["Steelhead","Brown Trout","Chinook Salmon"] },
    { name: "Houghton Lake – MI", lat: 44.32, lng: -84.75, category: "lake", state: "Michigan", species: ["Walleye","Largemouth Bass","Bluegill","Northern Pike"] },
    { name: "Lake Michigan – Ludington", lat: 43.95, lng: -86.47, category: "lake", state: "Michigan", species: ["Chinook Salmon","Lake Trout","Steelhead"] },
    { name: "Torch Lake – MI", lat: 44.95, lng: -85.33, category: "lake", state: "Michigan", species: ["Lake Trout","Smallmouth Bass","Cisco"] },
    { name: "Burt Lake – MI", lat: 45.43, lng: -84.70, category: "lake", state: "Michigan", species: ["Walleye","Smallmouth Bass","Northern Pike"] },
    { name: "Saginaw Bay – MI", lat: 43.87, lng: -83.75, category: "bay", state: "Michigan", species: ["Walleye","Yellow Perch","Channel Catfish"] },
    { name: "Muskegon River – MI", lat: 43.55, lng: -85.87, category: "river", state: "Michigan", species: ["Steelhead","Chinook Salmon","Smallmouth Bass"] },

    // MINNESOTA
    { name: "Mille Lacs Lake", lat: 46.20, lng: -93.62, category: "lake", state: "Minnesota", species: ["Walleye","Smallmouth Bass","Northern Pike","Muskie"] },
    { name: "Lake of the Woods – MN", lat: 49.00, lng: -94.77, category: "lake", state: "Minnesota", species: ["Walleye","Sauger","Northern Pike","Muskie"] },
    { name: "Leech Lake", lat: 47.12, lng: -94.37, category: "lake", state: "Minnesota", species: ["Walleye","Muskie","Northern Pike","Yellow Perch"] },
    { name: "Vermilion Lake", lat: 47.87, lng: -92.28, category: "lake", state: "Minnesota", species: ["Walleye","Smallmouth Bass","Northern Pike","Muskie"] },
    { name: "Rainy Lake – MN", lat: 48.60, lng: -93.17, category: "lake", state: "Minnesota", species: ["Walleye","Smallmouth Bass","Northern Pike","Crappie"] },
    { name: "Lake Minnetonka", lat: 44.93, lng: -93.58, category: "lake", state: "Minnesota", species: ["Largemouth Bass","Muskie","Walleye","Crappie"] },
    { name: "Gull Lake – MN", lat: 46.42, lng: -94.35, category: "lake", state: "Minnesota", species: ["Walleye","Northern Pike","Largemouth Bass"] },
    { name: "Winnibigoshish Lake", lat: 47.43, lng: -94.05, category: "lake", state: "Minnesota", species: ["Walleye","Northern Pike","Yellow Perch"] },
    { name: "Boundary Waters – Basswood Lake", lat: 48.07, lng: -91.55, category: "lake", state: "Minnesota", species: ["Smallmouth Bass","Walleye","Northern Pike","Lake Trout"] },
    { name: "Mississippi River – Red Wing MN", lat: 44.57, lng: -92.53, category: "river", state: "Minnesota", species: ["Walleye","Sauger","Smallmouth Bass","Catfish"] },
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

    // Get existing names
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
