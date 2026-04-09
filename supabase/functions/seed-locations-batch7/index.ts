import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateLocations() {
  return [
    // MISSISSIPPI
    { name: "Ross Barnett Reservoir", lat: 32.43, lng: -89.97, category: "reservoir", state: "Mississippi", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Sardis Lake", lat: 34.40, lng: -89.78, category: "lake", state: "Mississippi", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Enid Lake", lat: 34.15, lng: -89.88, category: "lake", state: "Mississippi", species: ["Crappie","Largemouth Bass","Catfish"] },
    { name: "Grenada Lake", lat: 33.83, lng: -89.73, category: "lake", state: "Mississippi", species: ["Crappie","Largemouth Bass","Catfish"] },
    { name: "Pickwick Lake – MS", lat: 34.82, lng: -88.27, category: "lake", state: "Mississippi", species: ["Smallmouth Bass","Largemouth Bass","Crappie"] },
    { name: "Arkabutla Lake", lat: 34.73, lng: -90.12, category: "lake", state: "Mississippi", species: ["Crappie","Largemouth Bass","Catfish"] },
    { name: "Mississippi River – Vicksburg", lat: 32.35, lng: -90.88, category: "river", state: "Mississippi", species: ["Blue Catfish","Flathead Catfish","Largemouth Bass"] },
    { name: "Horn Island – MS", lat: 30.25, lng: -88.67, category: "bay", state: "Mississippi", species: ["Redfish","Speckled Trout","Flounder"] },
    { name: "Cat Island – MS", lat: 30.22, lng: -89.08, category: "bay", state: "Mississippi", species: ["Redfish","Speckled Trout","Cobia"] },
    { name: "Lake Washington – MS", lat: 33.07, lng: -91.07, category: "lake", state: "Mississippi", species: ["Largemouth Bass","Crappie","Bream"] },

    // MISSOURI
    { name: "Table Rock Lake", lat: 36.60, lng: -93.32, category: "lake", state: "Missouri", species: ["Largemouth Bass","Smallmouth Bass","White Bass","Crappie"] },
    { name: "Lake of the Ozarks – Grand Glaize", lat: 38.12, lng: -92.62, category: "lake", state: "Missouri", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Stockton Lake", lat: 37.67, lng: -93.78, category: "lake", state: "Missouri", species: ["Walleye","Largemouth Bass","Crappie"] },
    { name: "Pomme de Terre Lake", lat: 37.88, lng: -93.32, category: "lake", state: "Missouri", species: ["Muskie","Largemouth Bass","Crappie"] },
    { name: "Mark Twain Lake", lat: 39.52, lng: -91.73, category: "lake", state: "Missouri", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Truman Lake", lat: 38.28, lng: -93.42, category: "lake", state: "Missouri", species: ["Crappie","Largemouth Bass","Catfish","Paddlefish"] },
    { name: "Bennett Spring – Current River", lat: 37.72, lng: -92.85, category: "river", state: "Missouri", species: ["Rainbow Trout","Brown Trout"] },
    { name: "Eleven Point River – MO", lat: 36.72, lng: -91.38, category: "river", state: "Missouri", species: ["Smallmouth Bass","Rainbow Trout","Brown Trout"] },
    { name: "Lake Taneycomo", lat: 36.63, lng: -93.22, category: "lake", state: "Missouri", species: ["Rainbow Trout","Brown Trout"] },
    { name: "Meramec River", lat: 38.32, lng: -90.82, category: "river", state: "Missouri", species: ["Smallmouth Bass","Largemouth Bass","Channel Catfish"] },

    // MONTANA
    { name: "Missouri River – Craig", lat: 46.98, lng: -112.07, category: "river", state: "Montana", species: ["Rainbow Trout","Brown Trout","Whitefish"] },
    { name: "Bighorn River – Fort Smith", lat: 45.30, lng: -107.92, category: "river", state: "Montana", species: ["Rainbow Trout","Brown Trout"] },
    { name: "Madison River – Ennis", lat: 45.35, lng: -111.73, category: "river", state: "Montana", species: ["Rainbow Trout","Brown Trout"] },
    { name: "Yellowstone River – Livingston", lat: 45.67, lng: -110.57, category: "river", state: "Montana", species: ["Rainbow Trout","Brown Trout","Cutthroat Trout"] },
    { name: "Gallatin River", lat: 45.50, lng: -111.23, category: "river", state: "Montana", species: ["Rainbow Trout","Brown Trout","Whitefish"] },
    { name: "Rock Creek – MT", lat: 46.58, lng: -113.52, category: "stream", state: "Montana", species: ["Rainbow Trout","Brown Trout","Bull Trout"] },
    { name: "Bitterroot River", lat: 46.60, lng: -114.08, category: "river", state: "Montana", species: ["Rainbow Trout","Brown Trout","Bull Trout"] },
    { name: "Fort Peck Reservoir", lat: 47.60, lng: -106.57, category: "reservoir", state: "Montana", species: ["Walleye","Northern Pike","Lake Trout","Smallmouth Bass"] },
    { name: "Flathead Lake", lat: 47.87, lng: -114.15, category: "lake", state: "Montana", species: ["Lake Trout","Bull Trout","Yellow Perch","Whitefish"] },
    { name: "Clark Fork River – Missoula", lat: 46.87, lng: -114.00, category: "river", state: "Montana", species: ["Rainbow Trout","Brown Trout","Bull Trout"] },

    // NEBRASKA
    { name: "Lake McConaughy", lat: 41.22, lng: -101.95, category: "lake", state: "Nebraska", species: ["Walleye","White Bass","Wiper","Channel Catfish"] },
    { name: "Calamus Reservoir", lat: 41.90, lng: -99.43, category: "reservoir", state: "Nebraska", species: ["Walleye","White Bass","Northern Pike"] },
    { name: "Lewis and Clark Lake", lat: 42.87, lng: -97.53, category: "lake", state: "Nebraska", species: ["Walleye","Smallmouth Bass","Channel Catfish"] },
    { name: "Merritt Reservoir", lat: 42.48, lng: -100.92, category: "reservoir", state: "Nebraska", species: ["Walleye","Muskie","Largemouth Bass"] },
    { name: "Sherman Reservoir", lat: 41.05, lng: -99.03, category: "reservoir", state: "Nebraska", species: ["Walleye","White Bass","Wiper"] },
    { name: "Harlan County Reservoir", lat: 40.07, lng: -99.18, category: "reservoir", state: "Nebraska", species: ["Walleye","Wiper","White Bass","Crappie"] },
    { name: "Medicine Creek Reservoir", lat: 40.52, lng: -100.35, category: "reservoir", state: "Nebraska", species: ["Walleye","Largemouth Bass","Wiper"] },
    { name: "Branched Oak Lake", lat: 40.97, lng: -96.85, category: "lake", state: "Nebraska", species: ["Walleye","Wiper","Largemouth Bass"] },
    { name: "Platte River – Kearney", lat: 40.70, lng: -99.08, category: "river", state: "Nebraska", species: ["Channel Catfish","Flathead Catfish","Walleye"] },
    { name: "Sandhill Lakes – Valentine NWR", lat: 42.52, lng: -100.55, category: "lake", state: "Nebraska", species: ["Largemouth Bass","Bluegill","Northern Pike"] },

    // NEVADA
    { name: "Lake Mead – Boulder Basin", lat: 36.02, lng: -114.75, category: "lake", state: "Nevada", species: ["Largemouth Bass","Striped Bass","Catfish"] },
    { name: "Lake Mead – Overton Arm", lat: 36.40, lng: -114.40, category: "lake", state: "Nevada", species: ["Striped Bass","Largemouth Bass","Catfish"] },
    { name: "Pyramid Lake – NV", lat: 40.00, lng: -119.55, category: "lake", state: "Nevada", species: ["Lahontan Cutthroat Trout","Sacramento Perch"] },
    { name: "Ruby Lake NWR", lat: 40.20, lng: -115.48, category: "lake", state: "Nevada", species: ["Largemouth Bass","Rainbow Trout","Brown Trout"] },
    { name: "Rye Patch Reservoir", lat: 40.47, lng: -118.30, category: "reservoir", state: "Nevada", species: ["Walleye","Channel Catfish","White Bass"] },
    { name: "Lahontan Reservoir", lat: 39.47, lng: -119.00, category: "reservoir", state: "Nevada", species: ["Walleye","White Bass","Wiper"] },
    { name: "Wildhorse Reservoir", lat: 41.63, lng: -115.78, category: "reservoir", state: "Nevada", species: ["Rainbow Trout","Brown Trout","Smallmouth Bass"] },
    { name: "South Fork Reservoir", lat: 40.50, lng: -115.90, category: "reservoir", state: "Nevada", species: ["Rainbow Trout","Brown Trout","Largemouth Bass"] },
    { name: "Colorado River – Laughlin", lat: 35.17, lng: -114.57, category: "river", state: "Nevada", species: ["Largemouth Bass","Striped Bass","Catfish"] },
    { name: "Walker Lake – NV", lat: 38.72, lng: -118.72, category: "lake", state: "Nevada", species: ["Lahontan Cutthroat Trout"] },

    // NEW HAMPSHIRE (more)
    { name: "Lake Sunapee – NH", lat: 43.38, lng: -72.05, category: "lake", state: "New Hampshire", species: ["Lake Trout","Landlocked Salmon","Rainbow Trout"] },
    { name: "Newfound Lake", lat: 43.63, lng: -71.78, category: "lake", state: "New Hampshire", species: ["Lake Trout","Smallmouth Bass","Rainbow Trout"] },
    { name: "Connecticut River – Pittsburg NH", lat: 45.07, lng: -71.35, category: "river", state: "New Hampshire", species: ["Rainbow Trout","Brown Trout","Landlocked Salmon"] },
    { name: "Lake Umbagog", lat: 44.82, lng: -71.07, category: "lake", state: "New Hampshire", species: ["Landlocked Salmon","Smallmouth Bass","Northern Pike"] },
    { name: "First Connecticut Lake", lat: 45.08, lng: -71.30, category: "lake", state: "New Hampshire", species: ["Landlocked Salmon","Lake Trout","Rainbow Trout"] },

    // NEW MEXICO
    { name: "Elephant Butte Lake", lat: 33.22, lng: -107.18, category: "lake", state: "New Mexico", species: ["Largemouth Bass","Smallmouth Bass","Walleye","Striped Bass"] },
    { name: "Navajo Lake – NM", lat: 36.80, lng: -107.60, category: "lake", state: "New Mexico", species: ["Largemouth Bass","Smallmouth Bass","Northern Pike","Kokanee"] },
    { name: "Conchas Lake", lat: 35.40, lng: -104.18, category: "lake", state: "New Mexico", species: ["Walleye","Smallmouth Bass","Largemouth Bass","Crappie"] },
    { name: "San Juan River – Quality Waters", lat: 36.80, lng: -107.65, category: "river", state: "New Mexico", species: ["Rainbow Trout","Brown Trout"] },
    { name: "Heron Lake", lat: 36.67, lng: -106.72, category: "lake", state: "New Mexico", species: ["Kokanee Salmon","Lake Trout","Rainbow Trout"] },
    { name: "Eagle Nest Lake", lat: 36.55, lng: -105.27, category: "lake", state: "New Mexico", species: ["Rainbow Trout","Kokanee Salmon","Yellow Perch"] },
    { name: "Pecos River – NM", lat: 35.57, lng: -105.67, category: "river", state: "New Mexico", species: ["Brown Trout","Rainbow Trout"] },
    { name: "Rio Grande – NM", lat: 36.40, lng: -105.58, category: "river", state: "New Mexico", species: ["Brown Trout","Rainbow Trout","Northern Pike"] },
    { name: "Caballo Lake", lat: 32.90, lng: -107.30, category: "lake", state: "New Mexico", species: ["Largemouth Bass","White Bass","Walleye"] },
    { name: "Ute Lake", lat: 35.37, lng: -103.45, category: "lake", state: "New Mexico", species: ["Walleye","Largemouth Bass","Smallmouth Bass","Channel Catfish"] },

    // NORTH CAROLINA
    { name: "Lake Norman", lat: 35.50, lng: -80.90, category: "lake", state: "North Carolina", species: ["Largemouth Bass","Striped Bass","Catfish"] },
    { name: "Falls Lake – NC", lat: 36.00, lng: -78.68, category: "lake", state: "North Carolina", species: ["Largemouth Bass","Crappie","Catfish","Striped Bass"] },
    { name: "Jordan Lake – NC", lat: 35.73, lng: -79.02, category: "lake", state: "North Carolina", species: ["Largemouth Bass","Crappie","Striped Bass","Catfish"] },
    { name: "Lake James", lat: 35.73, lng: -81.87, category: "lake", state: "North Carolina", species: ["Smallmouth Bass","Largemouth Bass","Muskie"] },
    { name: "High Rock Lake", lat: 35.60, lng: -80.22, category: "lake", state: "North Carolina", species: ["Largemouth Bass","Crappie","Catfish","Striped Bass"] },
    { name: "Kerr Lake – NC Side", lat: 36.45, lng: -78.38, category: "lake", state: "North Carolina", species: ["Largemouth Bass","Striped Bass","Crappie"] },
    { name: "Fontana Lake", lat: 35.42, lng: -83.72, category: "lake", state: "North Carolina", species: ["Smallmouth Bass","Walleye","Muskie"] },
    { name: "Nantahala River", lat: 35.33, lng: -83.57, category: "river", state: "North Carolina", species: ["Brown Trout","Rainbow Trout","Brook Trout"] },
    { name: "Davidson River", lat: 35.27, lng: -82.72, category: "river", state: "North Carolina", species: ["Brown Trout","Rainbow Trout","Brook Trout"] },
    { name: "Outer Banks – Hatteras", lat: 35.22, lng: -75.63, category: "bay", state: "North Carolina", species: ["Red Drum","Bluefish","Flounder","Cobia"] },
    { name: "Pamlico Sound", lat: 35.30, lng: -75.90, category: "bay", state: "North Carolina", species: ["Red Drum","Speckled Trout","Flounder"] },
    { name: "Lake Mattamuskeet", lat: 35.47, lng: -76.17, category: "lake", state: "North Carolina", species: ["Largemouth Bass","Crappie","Catfish"] },

    // NORTH DAKOTA
    { name: "Lake Sakakawea", lat: 47.75, lng: -102.57, category: "lake", state: "North Dakota", species: ["Walleye","Smallmouth Bass","Northern Pike","Chinook Salmon"] },
    { name: "Devils Lake – ND", lat: 48.05, lng: -99.00, category: "lake", state: "North Dakota", species: ["Walleye","Northern Pike","Yellow Perch","White Bass"] },
    { name: "Lake Oahe – ND", lat: 46.50, lng: -100.70, category: "lake", state: "North Dakota", species: ["Walleye","Smallmouth Bass","Northern Pike","Chinook Salmon"] },
    { name: "Lake Darling", lat: 48.50, lng: -100.87, category: "lake", state: "North Dakota", species: ["Walleye","Northern Pike","Yellow Perch"] },
    { name: "Garrison Dam Tailrace", lat: 47.50, lng: -101.43, category: "river", state: "North Dakota", species: ["Walleye","Sauger","Rainbow Trout","Chinook Salmon"] },
    { name: "Missouri River – Bismarck ND", lat: 46.80, lng: -100.78, category: "river", state: "North Dakota", species: ["Walleye","Sauger","Channel Catfish","Smallmouth Bass"] },
    { name: "Stump Lake", lat: 47.88, lng: -98.43, category: "lake", state: "North Dakota", species: ["Walleye","Northern Pike","Yellow Perch"] },
    { name: "Nelson Lake – ND", lat: 47.40, lng: -101.23, category: "lake", state: "North Dakota", species: ["Walleye","Northern Pike","Largemouth Bass"] },
    { name: "Lake Ashtabula", lat: 47.03, lng: -97.82, category: "lake", state: "North Dakota", species: ["Walleye","Northern Pike","Crappie"] },
    { name: "Jamestown Reservoir", lat: 46.92, lng: -98.70, category: "reservoir", state: "North Dakota", species: ["Walleye","Northern Pike","Yellow Perch"] },

    // OHIO
    { name: "Lake Erie – Western Basin", lat: 41.52, lng: -83.00, category: "lake", state: "Ohio", species: ["Walleye","Yellow Perch","Smallmouth Bass","Steelhead"] },
    { name: "Lake Erie – Central Basin", lat: 41.65, lng: -81.72, category: "lake", state: "Ohio", species: ["Walleye","Steelhead","Smallmouth Bass","Yellow Perch"] },
    { name: "Mosquito Lake – OH", lat: 41.18, lng: -80.75, category: "lake", state: "Ohio", species: ["Walleye","Crappie","Muskie","Largemouth Bass"] },
    { name: "Berlin Reservoir", lat: 41.02, lng: -81.00, category: "reservoir", state: "Ohio", species: ["Walleye","Muskie","Crappie","Largemouth Bass"] },
    { name: "Piedmont Lake", lat: 40.15, lng: -81.22, category: "lake", state: "Ohio", species: ["Muskie","Largemouth Bass","Crappie"] },
    { name: "Salt Fork Lake", lat: 40.12, lng: -81.52, category: "lake", state: "Ohio", species: ["Muskie","Largemouth Bass","Saugeye"] },
    { name: "Alum Creek Lake", lat: 40.20, lng: -82.95, category: "lake", state: "Ohio", species: ["Muskie","Saugeye","Largemouth Bass","Crappie"] },
    { name: "Indian Lake – OH", lat: 40.47, lng: -83.63, category: "lake", state: "Ohio", species: ["Saugeye","Crappie","Channel Catfish"] },
    { name: "Rocky River – OH", lat: 41.42, lng: -81.85, category: "river", state: "Ohio", species: ["Steelhead","Smallmouth Bass"] },
    { name: "Mad River – OH", lat: 39.95, lng: -83.80, category: "river", state: "Ohio", species: ["Brown Trout","Smallmouth Bass","Rock Bass"] },

    // OKLAHOMA
    { name: "Lake Texoma – OK Side", lat: 33.87, lng: -96.57, category: "lake", state: "Oklahoma", species: ["Striped Bass","Largemouth Bass","Smallmouth Bass","Catfish"] },
    { name: "Grand Lake – OK", lat: 36.55, lng: -94.78, category: "lake", state: "Oklahoma", species: ["Largemouth Bass","Crappie","Catfish","Paddlefish"] },
    { name: "Lake Eufaula – OK", lat: 35.28, lng: -95.38, category: "lake", state: "Oklahoma", species: ["Largemouth Bass","Crappie","Catfish","Hybrid Striped Bass"] },
    { name: "Broken Bow Lake", lat: 34.15, lng: -94.65, category: "lake", state: "Oklahoma", species: ["Largemouth Bass","Smallmouth Bass","Catfish"] },
    { name: "Lake Tenkiller", lat: 35.60, lng: -94.97, category: "lake", state: "Oklahoma", species: ["Largemouth Bass","Smallmouth Bass","Striped Bass"] },
    { name: "Fort Gibson Lake", lat: 35.87, lng: -95.22, category: "lake", state: "Oklahoma", species: ["Largemouth Bass","Crappie","Catfish","Hybrid Striped Bass"] },
    { name: "Keystone Lake", lat: 36.18, lng: -96.23, category: "lake", state: "Oklahoma", species: ["Largemouth Bass","Hybrid Striped Bass","Crappie","Catfish"] },
    { name: "Robert S. Kerr Reservoir", lat: 35.42, lng: -94.82, category: "reservoir", state: "Oklahoma", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Mountain Fork River – Lower", lat: 34.12, lng: -94.60, category: "river", state: "Oklahoma", species: ["Rainbow Trout","Brown Trout"] },
    { name: "Illinois River – Tahlequah", lat: 35.92, lng: -94.97, category: "river", state: "Oklahoma", species: ["Smallmouth Bass","Largemouth Bass","Spotted Bass"] },

    // OREGON
    { name: "Deschutes River – Warm Springs", lat: 44.77, lng: -121.22, category: "river", state: "Oregon", species: ["Rainbow Trout (Redsides)","Steelhead","Brown Trout"] },
    { name: "Williamson River", lat: 42.58, lng: -121.80, category: "river", state: "Oregon", species: ["Rainbow Trout","Brown Trout","Brook Trout"] },
    { name: "Rogue River – Holy Water", lat: 42.43, lng: -123.35, category: "river", state: "Oregon", species: ["Steelhead","Chinook Salmon","Smallmouth Bass"] },
    { name: "Umpqua River – North Fork", lat: 43.38, lng: -122.85, category: "river", state: "Oregon", species: ["Steelhead","Chinook Salmon","Smallmouth Bass"] },
    { name: "Diamond Lake – OR", lat: 43.17, lng: -122.15, category: "lake", state: "Oregon", species: ["Rainbow Trout","Brook Trout"] },
    { name: "Crane Prairie Reservoir", lat: 43.78, lng: -121.75, category: "reservoir", state: "Oregon", species: ["Rainbow Trout","Brook Trout","Largemouth Bass"] },
    { name: "Wickiup Reservoir", lat: 43.68, lng: -121.78, category: "reservoir", state: "Oregon", species: ["Brown Trout","Kokanee","Rainbow Trout"] },
    { name: "Haystack Reservoir", lat: 44.50, lng: -121.13, category: "reservoir", state: "Oregon", species: ["Rainbow Trout","Kokanee"] },
    { name: "Tillamook Bay", lat: 45.48, lng: -123.88, category: "bay", state: "Oregon", species: ["Chinook Salmon","Lingcod","Dungeness Crab"] },
    { name: "Depoe Bay – OR", lat: 44.80, lng: -124.07, category: "bay", state: "Oregon", species: ["Lingcod","Rockfish","Halibut","Chinook Salmon"] },

    // PENNSYLVANIA
    { name: "Lake Erie – Presque Isle", lat: 42.15, lng: -80.10, category: "lake", state: "Pennsylvania", species: ["Walleye","Steelhead","Smallmouth Bass","Yellow Perch"] },
    { name: "Pymatuning Reservoir", lat: 41.53, lng: -80.47, category: "reservoir", state: "Pennsylvania", species: ["Walleye","Muskie","Crappie","Largemouth Bass"] },
    { name: "Raystown Lake", lat: 40.40, lng: -78.03, category: "lake", state: "Pennsylvania", species: ["Striped Bass","Largemouth Bass","Smallmouth Bass","Crappie"] },
    { name: "Lake Wallenpaupack", lat: 41.38, lng: -75.20, category: "lake", state: "Pennsylvania", species: ["Walleye","Smallmouth Bass","Striped Bass","Largemouth Bass"] },
    { name: "Pine Creek – PA Grand Canyon", lat: 41.55, lng: -77.47, category: "stream", state: "Pennsylvania", species: ["Brown Trout","Brook Trout","Rainbow Trout"] },
    { name: "Penns Creek", lat: 40.85, lng: -77.15, category: "stream", state: "Pennsylvania", species: ["Brown Trout","Rainbow Trout"] },
    { name: "Susquehanna River – Harrisburg", lat: 40.27, lng: -76.88, category: "river", state: "Pennsylvania", species: ["Smallmouth Bass","Channel Catfish","Muskie","Walleye"] },
    { name: "Delaware River – Upper", lat: 41.23, lng: -74.98, category: "river", state: "Pennsylvania", species: ["Smallmouth Bass","American Shad","Walleye"] },
    { name: "Allegheny River – Warren", lat: 41.83, lng: -79.15, category: "river", state: "Pennsylvania", species: ["Walleye","Muskie","Smallmouth Bass"] },
    { name: "Elk Creek – PA Steelhead", lat: 42.10, lng: -80.38, category: "stream", state: "Pennsylvania", species: ["Steelhead","Brown Trout"] },

    // SOUTH CAROLINA
    { name: "Lake Murray – SC", lat: 34.08, lng: -81.25, category: "lake", state: "South Carolina", species: ["Striped Bass","Largemouth Bass","Crappie","Catfish"] },
    { name: "Lake Hartwell – SC Side", lat: 34.45, lng: -82.88, category: "lake", state: "South Carolina", species: ["Largemouth Bass","Striped Bass","Crappie"] },
    { name: "Lake Jocassee", lat: 35.00, lng: -82.93, category: "lake", state: "South Carolina", species: ["Brown Trout","Rainbow Trout","Smallmouth Bass"] },
    { name: "Lake Keowee", lat: 34.85, lng: -82.88, category: "lake", state: "South Carolina", species: ["Largemouth Bass","Spotted Bass","Striped Bass"] },
    { name: "Santee Cooper Lakes – Marion", lat: 33.48, lng: -80.02, category: "lake", state: "South Carolina", species: ["Largemouth Bass","Striped Bass","Crappie","Catfish"] },
    { name: "Santee Cooper Lakes – Moultrie", lat: 33.28, lng: -80.02, category: "lake", state: "South Carolina", species: ["Striped Bass","Catfish","Largemouth Bass","Crappie"] },
    { name: "Lake Wateree", lat: 34.35, lng: -80.72, category: "lake", state: "South Carolina", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Chattooga River – SC", lat: 34.88, lng: -83.17, category: "river", state: "South Carolina", species: ["Brown Trout","Rainbow Trout","Brook Trout"] },
    { name: "Charleston Harbor – SC", lat: 32.77, lng: -79.90, category: "bay", state: "South Carolina", species: ["Redfish","Flounder","Seatrout","Sheepshead"] },
    { name: "Hilton Head Island – SC", lat: 32.18, lng: -80.72, category: "bay", state: "South Carolina", species: ["Redfish","Flounder","Cobia","Tarpon"] },

    // SOUTH DAKOTA
    { name: "Lake Oahe – SD", lat: 44.50, lng: -100.42, category: "lake", state: "South Dakota", species: ["Walleye","Smallmouth Bass","Northern Pike","Chinook Salmon"] },
    { name: "Lake Sharpe", lat: 44.10, lng: -99.35, category: "lake", state: "South Dakota", species: ["Walleye","Smallmouth Bass","Northern Pike"] },
    { name: "Lake Francis Case", lat: 43.50, lng: -99.15, category: "lake", state: "South Dakota", species: ["Walleye","Smallmouth Bass","Channel Catfish"] },
    { name: "Lake Poinsett", lat: 44.57, lng: -96.68, category: "lake", state: "South Dakota", species: ["Walleye","Northern Pike","Yellow Perch"] },
    { name: "Lake Thompson", lat: 44.08, lng: -97.45, category: "lake", state: "South Dakota", species: ["Walleye","Northern Pike","Yellow Perch"] },
    { name: "Richmond Lake", lat: 45.33, lng: -98.32, category: "lake", state: "South Dakota", species: ["Walleye","Northern Pike","Yellow Perch","Largemouth Bass"] },
    { name: "Angostura Reservoir", lat: 43.33, lng: -103.43, category: "reservoir", state: "South Dakota", species: ["Walleye","Yellow Perch","Smallmouth Bass"] },
    { name: "Pactola Reservoir", lat: 44.07, lng: -103.48, category: "reservoir", state: "South Dakota", species: ["Rainbow Trout","Brown Trout","Lake Trout"] },
    { name: "Missouri River – Chamberlain SD", lat: 43.80, lng: -99.32, category: "river", state: "South Dakota", species: ["Walleye","Sauger","Channel Catfish","Smallmouth Bass"] },
    { name: "Big Sioux River – SD", lat: 43.55, lng: -96.73, category: "river", state: "South Dakota", species: ["Walleye","Channel Catfish","Smallmouth Bass"] },
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
