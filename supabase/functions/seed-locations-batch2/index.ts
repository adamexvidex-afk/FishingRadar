import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateLocations() {
  return [
    // MAINE
    { name: "Moosehead Lake", lat: 45.60, lng: -69.67, category: "lake", state: "Maine", species: ["Lake Trout","Landlocked Salmon","Brook Trout"] },
    { name: "Rangeley Lake", lat: 44.95, lng: -70.66, category: "lake", state: "Maine", species: ["Brook Trout","Landlocked Salmon","Brown Trout"] },
    { name: "Sebago Lake", lat: 43.85, lng: -70.56, category: "lake", state: "Maine", species: ["Landlocked Salmon","Lake Trout","Smallmouth Bass"] },
    { name: "Penobscot River – West Branch", lat: 45.89, lng: -69.00, category: "river", state: "Maine", species: ["Brook Trout","Landlocked Salmon"] },
    { name: "Rapid River", lat: 44.80, lng: -70.87, category: "river", state: "Maine", species: ["Brook Trout","Landlocked Salmon"] },
    { name: "Grand Lake Stream", lat: 45.18, lng: -67.77, category: "stream", state: "Maine", species: ["Landlocked Salmon","Smallmouth Bass"] },
    { name: "Aroostook River", lat: 46.68, lng: -67.88, category: "river", state: "Maine", species: ["Brook Trout","Smallmouth Bass"] },
    { name: "Kennebago River", lat: 45.05, lng: -70.83, category: "river", state: "Maine", species: ["Brook Trout"] },
    // NEW HAMPSHIRE
    { name: "Lake Winnipesaukee", lat: 43.60, lng: -71.31, category: "lake", state: "New Hampshire", species: ["Landlocked Salmon","Lake Trout","Smallmouth Bass"] },
    { name: "Squam Lake", lat: 43.76, lng: -71.56, category: "lake", state: "New Hampshire", species: ["Lake Trout","Landlocked Salmon","Rainbow Trout"] },
    { name: "Connecticut River – NH Section", lat: 44.87, lng: -71.59, category: "river", state: "New Hampshire", species: ["Rainbow Trout","Brown Trout","Smallmouth Bass"] },
    { name: "Androscoggin River – NH", lat: 44.39, lng: -71.17, category: "river", state: "New Hampshire", species: ["Rainbow Trout","Brook Trout","Brown Trout"] },
    // VERMONT
    { name: "Lake Memphremagog", lat: 44.95, lng: -72.20, category: "lake", state: "Vermont", species: ["Landlocked Salmon","Lake Trout","Walleye"] },
    { name: "Battenkill River", lat: 43.10, lng: -73.20, category: "river", state: "Vermont", species: ["Brown Trout","Brook Trout","Rainbow Trout"] },
    { name: "Dog River", lat: 44.20, lng: -72.60, category: "river", state: "Vermont", species: ["Brown Trout","Rainbow Trout"] },
    { name: "Otter Creek", lat: 43.60, lng: -73.15, category: "river", state: "Vermont", species: ["Smallmouth Bass","Northern Pike","Walleye"] },
    // MASSACHUSETTS
    { name: "Quabbin Reservoir", lat: 42.38, lng: -72.32, category: "reservoir", state: "Massachusetts", species: ["Lake Trout","Landlocked Salmon","Smallmouth Bass"] },
    { name: "Cape Cod Canal", lat: 41.74, lng: -70.56, category: "canal", state: "Massachusetts", species: ["Striped Bass","Bluefish","Tautog"] },
    { name: "Wachusett Reservoir", lat: 42.39, lng: -71.73, category: "reservoir", state: "Massachusetts", species: ["Lake Trout","Largemouth Bass","Smallmouth Bass"] },
    { name: "Deerfield River", lat: 42.63, lng: -72.89, category: "river", state: "Massachusetts", species: ["Brown Trout","Rainbow Trout"] },
    // RHODE ISLAND
    { name: "Narragansett Bay", lat: 41.63, lng: -71.35, category: "bay", state: "Rhode Island", species: ["Striped Bass","Bluefish","Tautog","Scup"] },
    { name: "Block Island", lat: 41.17, lng: -71.58, category: "island", state: "Rhode Island", species: ["Striped Bass","Fluke","Bluefish"] },
    // NEW YORK
    { name: "Finger Lakes – Cayuga", lat: 42.65, lng: -76.70, category: "lake", state: "New York", species: ["Lake Trout","Rainbow Trout","Brown Trout"] },
    { name: "Finger Lakes – Seneca", lat: 42.65, lng: -76.91, category: "lake", state: "New York", species: ["Lake Trout","Rainbow Trout","Landlocked Salmon"] },
    { name: "St. Lawrence River", lat: 44.35, lng: -75.97, category: "river", state: "New York", species: ["Smallmouth Bass","Muskie","Northern Pike","Walleye"] },
    { name: "Montauk Point", lat: 41.07, lng: -71.86, category: "point", state: "New York", species: ["Striped Bass","Bluefish","Fluke","False Albacore"] },
    { name: "Salmon River – Pulaski", lat: 43.57, lng: -76.12, category: "river", state: "New York", species: ["Chinook Salmon","Coho Salmon","Steelhead","Brown Trout"] },
    { name: "Niagara River", lat: 43.05, lng: -79.01, category: "river", state: "New York", species: ["Smallmouth Bass","Steelhead","Walleye","Muskie"] },
    { name: "Ausable River – NY", lat: 44.41, lng: -73.57, category: "river", state: "New York", species: ["Brown Trout","Rainbow Trout","Brook Trout"] },
    { name: "Delaware River – Upper NY", lat: 41.95, lng: -75.10, category: "river", state: "New York", species: ["Brown Trout","Rainbow Trout","Smallmouth Bass"] },
    { name: "Lake Ontario – Henderson Harbor", lat: 43.85, lng: -76.17, category: "lake", state: "New York", species: ["Smallmouth Bass","Walleye","Lake Trout"] },
    // NEW JERSEY
    { name: "Round Valley Reservoir", lat: 40.63, lng: -74.84, category: "reservoir", state: "New Jersey", species: ["Lake Trout","Brown Trout","Smallmouth Bass"] },
    { name: "Spruce Run Reservoir", lat: 40.66, lng: -74.92, category: "reservoir", state: "New Jersey", species: ["Largemouth Bass","Hybrid Striped Bass","Trout"] },
    { name: "Island Beach State Park", lat: 39.80, lng: -74.09, category: "beach", state: "New Jersey", species: ["Striped Bass","Bluefish","Summer Flounder"] },
    { name: "Manasquan River", lat: 40.13, lng: -74.14, category: "river", state: "New Jersey", species: ["Striped Bass","Weakfish","Fluke"] },
    // PENNSYLVANIA
    { name: "Penns Creek", lat: 40.87, lng: -77.10, category: "stream", state: "Pennsylvania", species: ["Brown Trout","Rainbow Trout","Brook Trout"] },
    { name: "Spring Creek – PA", lat: 40.90, lng: -77.80, category: "stream", state: "Pennsylvania", species: ["Brown Trout","Rainbow Trout"] },
    { name: "Lake Erie – Presque Isle", lat: 42.15, lng: -80.12, category: "lake", state: "Pennsylvania", species: ["Steelhead","Smallmouth Bass","Walleye","Yellow Perch"] },
    { name: "Pine Creek – PA Grand Canyon", lat: 41.58, lng: -77.45, category: "stream", state: "Pennsylvania", species: ["Brown Trout","Rainbow Trout","Smallmouth Bass"] },
    { name: "Youghiogheny River", lat: 39.87, lng: -79.47, category: "river", state: "Pennsylvania", species: ["Smallmouth Bass","Brown Trout","Rainbow Trout"] },
    { name: "Pymatuning Reservoir", lat: 41.55, lng: -80.48, category: "reservoir", state: "Pennsylvania", species: ["Walleye","Muskie","Crappie","Largemouth Bass"] },
    // MARYLAND
    { name: "Chesapeake Bay – Kent Island", lat: 38.95, lng: -76.33, category: "bay", state: "Maryland", species: ["Striped Bass","Bluefish","Red Drum"] },
    { name: "Deep Creek Lake", lat: 39.52, lng: -79.32, category: "lake", state: "Maryland", species: ["Walleye","Smallmouth Bass","Yellow Perch"] },
    { name: "Gunpowder Falls", lat: 39.48, lng: -76.58, category: "river", state: "Maryland", species: ["Brown Trout","Rainbow Trout"] },
    { name: "Savage River", lat: 39.53, lng: -79.10, category: "river", state: "Maryland", species: ["Brown Trout","Rainbow Trout","Brook Trout"] },
    // VIRGINIA
    { name: "Smith Mountain Lake", lat: 37.07, lng: -79.55, category: "lake", state: "Virginia", species: ["Striped Bass","Largemouth Bass","Smallmouth Bass","Muskie"] },
    { name: "New River – VA", lat: 37.26, lng: -80.85, category: "river", state: "Virginia", species: ["Smallmouth Bass","Muskie","Rock Bass"] },
    { name: "Rapidan River", lat: 38.32, lng: -78.30, category: "river", state: "Virginia", species: ["Brook Trout","Brown Trout","Rainbow Trout"] },
    { name: "Mossy Creek", lat: 38.32, lng: -79.11, category: "stream", state: "Virginia", species: ["Brown Trout","Rainbow Trout"] },
    { name: "Lake Anna", lat: 38.05, lng: -77.80, category: "lake", state: "Virginia", species: ["Largemouth Bass","Striped Bass","Crappie"] },
    { name: "Virginia Beach Pier", lat: 36.83, lng: -75.97, category: "pier", state: "Virginia", species: ["Red Drum","Cobia","Flounder","Bluefish"] },
    // WEST VIRGINIA
    { name: "New River – WV", lat: 37.95, lng: -80.90, category: "river", state: "West Virginia", species: ["Smallmouth Bass","Rock Bass","Channel Catfish"] },
    { name: "Cranberry River", lat: 38.20, lng: -80.35, category: "river", state: "West Virginia", species: ["Brook Trout","Brown Trout"] },
    { name: "Stonewall Jackson Lake", lat: 38.93, lng: -80.42, category: "lake", state: "West Virginia", species: ["Largemouth Bass","Channel Catfish","Crappie"] },
    { name: "Elk River – WV", lat: 38.47, lng: -80.55, category: "river", state: "West Virginia", species: ["Smallmouth Bass","Muskie","Walleye"] },
    // NORTH CAROLINA
    { name: "Lake Norman", lat: 35.50, lng: -80.93, category: "lake", state: "North Carolina", species: ["Largemouth Bass","Striped Bass","Catfish"] },
    { name: "Outer Banks – Hatteras", lat: 35.22, lng: -75.63, category: "beach", state: "North Carolina", species: ["Red Drum","Bluefish","Flounder","Cobia"] },
    { name: "Davidson River", lat: 35.27, lng: -82.70, category: "river", state: "North Carolina", species: ["Brown Trout","Rainbow Trout","Brook Trout"] },
    { name: "Nantahala River", lat: 35.33, lng: -83.58, category: "river", state: "North Carolina", species: ["Brown Trout","Rainbow Trout"] },
    { name: "Lake Mattamuskeet", lat: 35.47, lng: -76.18, category: "lake", state: "North Carolina", species: ["Largemouth Bass","Catfish"] },
    { name: "Pamlico Sound", lat: 35.30, lng: -76.00, category: "sound", state: "North Carolina", species: ["Red Drum","Spotted Seatrout","Flounder"] },
    // SOUTH CAROLINA
    { name: "Lake Murray", lat: 34.08, lng: -81.30, category: "lake", state: "South Carolina", species: ["Striped Bass","Largemouth Bass","Crappie"] },
    { name: "Santee Cooper Lakes", lat: 33.55, lng: -80.15, category: "lake", state: "South Carolina", species: ["Striped Bass","Largemouth Bass","Blue Catfish","Crappie"] },
    { name: "Lake Jocassee", lat: 35.00, lng: -82.93, category: "lake", state: "South Carolina", species: ["Brown Trout","Rainbow Trout","Smallmouth Bass"] },
    { name: "Charleston Harbor", lat: 32.77, lng: -79.92, category: "harbor", state: "South Carolina", species: ["Red Drum","Spotted Seatrout","Flounder","Sheepshead"] },
    // GEORGIA
    { name: "Lake Lanier", lat: 34.25, lng: -83.95, category: "lake", state: "Georgia", species: ["Spotted Bass","Striped Bass","Largemouth Bass"] },
    { name: "Lake Seminole", lat: 30.75, lng: -84.85, category: "lake", state: "Georgia", species: ["Largemouth Bass","Hybrid Striped Bass","Crappie"] },
    { name: "Altamaha River", lat: 31.58, lng: -81.60, category: "river", state: "Georgia", species: ["Striped Bass","Channel Catfish","Largemouth Bass"] },
    { name: "Toccoa River", lat: 34.82, lng: -84.22, category: "river", state: "Georgia", species: ["Brown Trout","Rainbow Trout"] },
    // FLORIDA
    { name: "Mosquito Lagoon", lat: 28.82, lng: -80.78, category: "lagoon", state: "Florida", species: ["Red Drum","Spotted Seatrout","Snook"] },
    { name: "Everglades – Flamingo", lat: 25.14, lng: -80.92, category: "estuary", state: "Florida", species: ["Snook","Tarpon","Red Drum","Mangrove Snapper"] },
    { name: "Lake Toho", lat: 28.18, lng: -81.37, category: "lake", state: "Florida", species: ["Largemouth Bass","Bluegill","Crappie"] },
    { name: "Indian River Lagoon", lat: 27.85, lng: -80.45, category: "lagoon", state: "Florida", species: ["Snook","Red Drum","Spotted Seatrout","Tarpon"] },
    { name: "Biscayne Bay", lat: 25.60, lng: -80.20, category: "bay", state: "Florida", species: ["Bonefish","Tarpon","Permit","Snook"] },
    { name: "Tampa Bay", lat: 27.70, lng: -82.55, category: "bay", state: "Florida", species: ["Snook","Red Drum","Spotted Seatrout","Tarpon"] },
    { name: "Apalachicola River", lat: 29.73, lng: -85.03, category: "river", state: "Florida", species: ["Striped Bass","Largemouth Bass","Channel Catfish"] },
    { name: "Lake Kissimmee", lat: 27.98, lng: -81.17, category: "lake", state: "Florida", species: ["Largemouth Bass","Crappie","Bluegill"] },
    { name: "Choctawhatchee Bay", lat: 30.38, lng: -86.35, category: "bay", state: "Florida", species: ["Red Drum","Spotted Seatrout","Flounder"] },
    { name: "Florida Keys – Islamorada", lat: 24.90, lng: -80.63, category: "keys", state: "Florida", species: ["Tarpon","Bonefish","Permit","Snapper"] },
    { name: "Dry Tortugas", lat: 24.63, lng: -82.87, category: "reef", state: "Florida", species: ["Mutton Snapper","Yellowtail Snapper","Grouper","Permit"] },
    // ALABAMA
    { name: "Lake Guntersville", lat: 34.40, lng: -86.22, category: "lake", state: "Alabama", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Wheeler Lake", lat: 34.65, lng: -87.00, category: "lake", state: "Alabama", species: ["Smallmouth Bass","Largemouth Bass","Crappie"] },
    { name: "Mobile Delta", lat: 30.73, lng: -88.03, category: "delta", state: "Alabama", species: ["Red Drum","Spotted Seatrout","Largemouth Bass"] },
    { name: "Pickwick Lake – AL", lat: 34.77, lng: -87.67, category: "lake", state: "Alabama", species: ["Smallmouth Bass","Largemouth Bass","Crappie","Catfish"] },
    // MISSISSIPPI
    { name: "Ross Barnett Reservoir", lat: 32.42, lng: -89.90, category: "reservoir", state: "Mississippi", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Sardis Lake", lat: 34.42, lng: -89.80, category: "lake", state: "Mississippi", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Mississippi Sound", lat: 30.30, lng: -89.00, category: "sound", state: "Mississippi", species: ["Red Drum","Spotted Seatrout","Flounder"] },
    // LOUISIANA
    { name: "Toledo Bend – LA Side", lat: 31.15, lng: -93.57, category: "reservoir", state: "Louisiana", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Lake Pontchartrain", lat: 30.20, lng: -90.10, category: "lake", state: "Louisiana", species: ["Spotted Seatrout","Red Drum","Flounder"] },
    { name: "Atchafalaya Basin", lat: 30.30, lng: -91.65, category: "basin", state: "Louisiana", species: ["Largemouth Bass","Blue Catfish","Crappie","Bowfin"] },
    { name: "Grand Isle", lat: 29.24, lng: -89.96, category: "island", state: "Louisiana", species: ["Red Drum","Spotted Seatrout","Cobia","Tarpon"] },
    { name: "Venice – Louisiana", lat: 29.28, lng: -89.35, category: "marsh", state: "Louisiana", species: ["Red Drum","Spotted Seatrout","Yellowfin Tuna","Red Snapper"] },
    // TENNESSEE
    { name: "Dale Hollow Lake", lat: 36.58, lng: -85.42, category: "lake", state: "Tennessee", species: ["Smallmouth Bass","Walleye","Muskie","Trout"] },
    { name: "Cherokee Lake", lat: 36.20, lng: -83.50, category: "lake", state: "Tennessee", species: ["Largemouth Bass","Crappie","Walleye"] },
    { name: "Norris Lake", lat: 36.28, lng: -84.08, category: "lake", state: "Tennessee", species: ["Striped Bass","Largemouth Bass","Walleye"] },
    { name: "South Holston River", lat: 36.50, lng: -82.12, category: "river", state: "Tennessee", species: ["Brown Trout","Rainbow Trout"] },
    { name: "Clinch River – TN", lat: 36.27, lng: -84.15, category: "river", state: "Tennessee", species: ["Brown Trout","Rainbow Trout","Muskie"] },
    { name: "Pickwick Lake – TN", lat: 35.05, lng: -88.22, category: "lake", state: "Tennessee", species: ["Smallmouth Bass","Largemouth Bass","Sauger"] },
    // KENTUCKY
    { name: "Kentucky Lake", lat: 36.73, lng: -88.07, category: "lake", state: "Kentucky", species: ["Largemouth Bass","Crappie","Sauger","Catfish"] },
    { name: "Lake Cumberland", lat: 36.92, lng: -84.95, category: "lake", state: "Kentucky", species: ["Striped Bass","Walleye","Smallmouth Bass"] },
    { name: "Elkhorn Creek", lat: 38.25, lng: -84.80, category: "stream", state: "Kentucky", species: ["Smallmouth Bass","Spotted Bass","Rock Bass"] },
    { name: "Green River – KY", lat: 37.25, lng: -86.55, category: "river", state: "Kentucky", species: ["Muskie","Smallmouth Bass","Spotted Bass"] },
    // OHIO
    { name: "Lake Erie – Western Basin", lat: 41.55, lng: -83.10, category: "lake", state: "Ohio", species: ["Walleye","Yellow Perch","Smallmouth Bass","Steelhead"] },
    { name: "Alum Creek Reservoir", lat: 40.17, lng: -82.97, category: "reservoir", state: "Ohio", species: ["Muskie","Largemouth Bass","Crappie","Saugeye"] },
    { name: "Rocky River", lat: 41.42, lng: -81.85, category: "river", state: "Ohio", species: ["Steelhead","Smallmouth Bass"] },
    { name: "Mad River – OH", lat: 39.97, lng: -83.87, category: "river", state: "Ohio", species: ["Brown Trout","Rainbow Trout","Smallmouth Bass"] },
    // MICHIGAN
    { name: "Au Sable River – MI", lat: 44.62, lng: -84.15, category: "river", state: "Michigan", species: ["Brown Trout","Brook Trout","Rainbow Trout"] },
    { name: "Pere Marquette River", lat: 43.93, lng: -86.18, category: "river", state: "Michigan", species: ["Steelhead","Chinook Salmon","Brown Trout"] },
    { name: "Manistee River", lat: 44.38, lng: -86.08, category: "river", state: "Michigan", species: ["Steelhead","Chinook Salmon","Brown Trout"] },
    { name: "Burt Lake", lat: 45.48, lng: -84.68, category: "lake", state: "Michigan", species: ["Walleye","Smallmouth Bass","Northern Pike"] },
    { name: "Houghton Lake", lat: 44.33, lng: -84.75, category: "lake", state: "Michigan", species: ["Walleye","Largemouth Bass","Bluegill"] },
    { name: "Lake St. Clair", lat: 42.45, lng: -82.67, category: "lake", state: "Michigan", species: ["Smallmouth Bass","Muskie","Walleye","Yellow Perch"] },
    { name: "Lake Michigan – Grand Haven", lat: 43.06, lng: -86.27, category: "lake", state: "Michigan", species: ["Chinook Salmon","Steelhead","Lake Trout","Brown Trout"] },
    // INDIANA
    { name: "Patoka Lake", lat: 38.42, lng: -86.63, category: "lake", state: "Indiana", species: ["Largemouth Bass","Crappie","Channel Catfish"] },
    { name: "Monroe Lake", lat: 39.08, lng: -86.47, category: "lake", state: "Indiana", species: ["Largemouth Bass","Crappie","Channel Catfish"] },
    { name: "Tippecanoe River", lat: 40.87, lng: -86.37, category: "river", state: "Indiana", species: ["Smallmouth Bass","Rock Bass","Channel Catfish"] },
    // ILLINOIS
    { name: "Kinkaid Lake", lat: 37.82, lng: -89.42, category: "lake", state: "Illinois", species: ["Largemouth Bass","Muskie","Crappie"] },
    { name: "Lake Shelbyville", lat: 39.38, lng: -88.80, category: "lake", state: "Illinois", species: ["Largemouth Bass","Crappie","Walleye"] },
    { name: "Rend Lake", lat: 38.08, lng: -88.97, category: "lake", state: "Illinois", species: ["Largemouth Bass","Crappie","Bluegill"] },
    // WISCONSIN
    { name: "Lake Winnebago", lat: 44.00, lng: -88.40, category: "lake", state: "Wisconsin", species: ["Walleye","White Bass","Lake Sturgeon"] },
    { name: "Chippewa Flowage", lat: 46.00, lng: -91.28, category: "lake", state: "Wisconsin", species: ["Muskie","Walleye","Largemouth Bass"] },
    { name: "Bois Brule River", lat: 46.57, lng: -91.60, category: "river", state: "Wisconsin", species: ["Steelhead","Brook Trout","Brown Trout"] },
    { name: "Wolf River – WI", lat: 44.72, lng: -88.98, category: "river", state: "Wisconsin", species: ["Smallmouth Bass","Walleye","Sturgeon"] },
    // MINNESOTA
    { name: "Boundary Waters – Basswood", lat: 48.07, lng: -91.55, category: "lake", state: "Minnesota", species: ["Smallmouth Bass","Walleye","Northern Pike","Lake Trout"] },
    { name: "Lake Vermilion", lat: 47.90, lng: -92.37, category: "lake", state: "Minnesota", species: ["Walleye","Muskie","Northern Pike","Smallmouth Bass"] },
    { name: "Lake of the Woods", lat: 49.00, lng: -94.67, category: "lake", state: "Minnesota", species: ["Walleye","Sauger","Northern Pike","Smallmouth Bass"] },
    { name: "Rainy River", lat: 48.78, lng: -94.60, category: "river", state: "Minnesota", species: ["Walleye","Sauger","Sturgeon","Channel Catfish"] },
    { name: "Leech Lake", lat: 47.13, lng: -94.37, category: "lake", state: "Minnesota", species: ["Walleye","Muskie","Northern Pike","Yellow Perch"] },
    { name: "Lake Winnibigoshish", lat: 47.43, lng: -94.05, category: "lake", state: "Minnesota", species: ["Walleye","Northern Pike","Yellow Perch"] },
    // IOWA
    { name: "Spirit Lake", lat: 43.47, lng: -95.10, category: "lake", state: "Iowa", species: ["Walleye","Yellow Bass","Largemouth Bass","Bluegill"] },
    { name: "West Okoboji Lake", lat: 43.38, lng: -95.17, category: "lake", state: "Iowa", species: ["Walleye","Smallmouth Bass","Muskie"] },
    { name: "Upper Iowa River", lat: 43.30, lng: -91.63, category: "river", state: "Iowa", species: ["Smallmouth Bass","Brown Trout","Rainbow Trout"] },
    // MISSOURI
    { name: "Bull Shoals Lake – MO", lat: 36.58, lng: -92.58, category: "lake", state: "Missouri", species: ["Largemouth Bass","White Bass","Walleye","Crappie"] },
    { name: "Stockton Lake", lat: 37.63, lng: -93.77, category: "lake", state: "Missouri", species: ["Walleye","Largemouth Bass","Crappie"] },
    { name: "Eleven Point River", lat: 36.62, lng: -91.20, category: "river", state: "Missouri", species: ["Smallmouth Bass","Rainbow Trout","Goggle-eye"] },
    { name: "Current River", lat: 37.13, lng: -91.40, category: "river", state: "Missouri", species: ["Smallmouth Bass","Largemouth Bass","Goggle-eye"] },
    // NORTH DAKOTA
    { name: "Lake Sakakawea", lat: 47.83, lng: -102.63, category: "lake", state: "North Dakota", species: ["Walleye","Northern Pike","Smallmouth Bass","Chinook Salmon"] },
    { name: "Devils Lake", lat: 48.07, lng: -99.08, category: "lake", state: "North Dakota", species: ["Walleye","Northern Pike","Yellow Perch","White Bass"] },
    // SOUTH DAKOTA
    { name: "Lake Oahe", lat: 44.67, lng: -100.40, category: "lake", state: "South Dakota", species: ["Walleye","Smallmouth Bass","Northern Pike","Chinook Salmon"] },
    { name: "Lake Sharpe", lat: 44.10, lng: -99.50, category: "lake", state: "South Dakota", species: ["Walleye","Smallmouth Bass","Channel Catfish"] },
    // NEBRASKA
    { name: "Lake McConaughy", lat: 41.22, lng: -101.95, category: "lake", state: "Nebraska", species: ["Walleye","White Bass","Striped Bass","Channel Catfish"] },
    { name: "Calamus Reservoir", lat: 41.83, lng: -99.33, category: "reservoir", state: "Nebraska", species: ["Walleye","Northern Pike","Largemouth Bass"] },
    // KANSAS
    { name: "Milford Reservoir", lat: 39.12, lng: -96.92, category: "reservoir", state: "Kansas", species: ["Walleye","White Bass","Crappie","Striped Bass"] },
    { name: "El Dorado Reservoir", lat: 37.78, lng: -96.82, category: "reservoir", state: "Kansas", species: ["Walleye","Striped Bass","Crappie"] },
    // TEXAS
    { name: "Lake Fork", lat: 32.87, lng: -95.57, category: "lake", state: "Texas", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Falcon Lake", lat: 26.58, lng: -99.17, category: "lake", state: "Texas", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Galveston Bay", lat: 29.50, lng: -94.88, category: "bay", state: "Texas", species: ["Red Drum","Spotted Seatrout","Flounder","Sheepshead"] },
    { name: "Port Aransas", lat: 27.83, lng: -97.05, category: "jetty", state: "Texas", species: ["Red Drum","Spotted Seatrout","Tarpon","King Mackerel"] },
    { name: "Guadalupe River – TX", lat: 29.85, lng: -98.35, category: "river", state: "Texas", species: ["Guadalupe Bass","Largemouth Bass","Channel Catfish"] },
    { name: "Caddo Lake", lat: 32.72, lng: -94.07, category: "lake", state: "Texas", species: ["Largemouth Bass","Crappie","Chain Pickerel","Bowfin"] },
    { name: "Lake Amistad", lat: 29.47, lng: -101.10, category: "lake", state: "Texas", species: ["Largemouth Bass","Striped Bass","Channel Catfish"] },
    { name: "Choke Canyon Reservoir", lat: 28.47, lng: -98.33, category: "reservoir", state: "Texas", species: ["Largemouth Bass","Crappie","Catfish"] },
    // OKLAHOMA
    { name: "Grand Lake O' the Cherokees", lat: 36.50, lng: -95.00, category: "lake", state: "Oklahoma", species: ["Largemouth Bass","Crappie","Catfish","Hybrid Striped Bass"] },
    { name: "Broken Bow Lake", lat: 34.12, lng: -94.67, category: "lake", state: "Oklahoma", species: ["Largemouth Bass","Smallmouth Bass","Brown Trout"] },
    { name: "Lower Illinois River – OK", lat: 35.88, lng: -94.83, category: "river", state: "Oklahoma", species: ["Smallmouth Bass","Spotted Bass","Largemouth Bass"] },
    // ARKANSAS
    { name: "Bull Shoals Lake – AR", lat: 36.37, lng: -92.55, category: "lake", state: "Arkansas", species: ["Largemouth Bass","Striped Bass","Walleye","Crappie"] },
    { name: "White River – AR", lat: 36.42, lng: -92.55, category: "river", state: "Arkansas", species: ["Brown Trout","Rainbow Trout","Cutthroat Trout"] },
    { name: "Norfork Lake", lat: 36.38, lng: -92.22, category: "lake", state: "Arkansas", species: ["Striped Bass","Largemouth Bass","Walleye"] },
    { name: "Little Red River", lat: 35.52, lng: -92.18, category: "river", state: "Arkansas", species: ["Brown Trout","Rainbow Trout"] },
    { name: "Beaver Lake", lat: 36.28, lng: -93.90, category: "lake", state: "Arkansas", species: ["Largemouth Bass","Striped Bass","Walleye"] },
    // COLORADO
    { name: "Arkansas River – CO", lat: 38.53, lng: -106.05, category: "river", state: "Colorado", species: ["Brown Trout","Rainbow Trout"] },
    { name: "Blue River – CO", lat: 39.52, lng: -106.05, category: "river", state: "Colorado", species: ["Rainbow Trout","Brown Trout","Brook Trout"] },
    { name: "Spinney Mountain Reservoir", lat: 38.98, lng: -105.82, category: "reservoir", state: "Colorado", species: ["Northern Pike","Rainbow Trout","Cutthroat Trout"] },
    { name: "Eleven Mile Reservoir", lat: 38.95, lng: -105.47, category: "reservoir", state: "Colorado", species: ["Rainbow Trout","Northern Pike","Kokanee Salmon"] },
    { name: "Roaring Fork River", lat: 39.18, lng: -106.82, category: "river", state: "Colorado", species: ["Rainbow Trout","Brown Trout"] },
    // WYOMING
    { name: "North Platte River – WY", lat: 42.75, lng: -106.32, category: "river", state: "Wyoming", species: ["Brown Trout","Rainbow Trout","Walleye"] },
    { name: "Bighorn River – WY", lat: 44.55, lng: -108.05, category: "river", state: "Wyoming", species: ["Brown Trout","Rainbow Trout"] },
    { name: "Flaming Gorge Reservoir", lat: 41.10, lng: -109.52, category: "reservoir", state: "Wyoming", species: ["Lake Trout","Rainbow Trout","Smallmouth Bass","Kokanee"] },
    { name: "Wind River – WY", lat: 43.58, lng: -109.82, category: "river", state: "Wyoming", species: ["Cutthroat Trout","Brown Trout","Rainbow Trout"] },
    // MONTANA
    { name: "Missouri River – MT", lat: 47.50, lng: -111.30, category: "river", state: "Montana", species: ["Rainbow Trout","Brown Trout","Walleye"] },
    { name: "Bighorn River – MT", lat: 45.78, lng: -107.93, category: "river", state: "Montana", species: ["Brown Trout","Rainbow Trout"] },
    { name: "Rock Creek – MT", lat: 46.63, lng: -113.68, category: "stream", state: "Montana", species: ["Brown Trout","Rainbow Trout","Cutthroat Trout","Bull Trout"] },
    { name: "Bitterroot River", lat: 46.68, lng: -114.00, category: "river", state: "Montana", species: ["Rainbow Trout","Brown Trout","Cutthroat Trout"] },
    { name: "Madison River", lat: 45.33, lng: -111.50, category: "river", state: "Montana", species: ["Brown Trout","Rainbow Trout"] },
    { name: "Gallatin River", lat: 45.50, lng: -111.17, category: "river", state: "Montana", species: ["Rainbow Trout","Brown Trout","Cutthroat Trout"] },
    { name: "Fort Peck Reservoir", lat: 47.62, lng: -106.92, category: "reservoir", state: "Montana", species: ["Walleye","Northern Pike","Lake Trout","Chinook Salmon"] },
    // IDAHO
    { name: "Henry's Fork – ID", lat: 44.42, lng: -111.37, category: "river", state: "Idaho", species: ["Rainbow Trout","Brown Trout","Cutthroat Trout"] },
    { name: "Silver Creek – ID", lat: 43.33, lng: -114.10, category: "stream", state: "Idaho", species: ["Brown Trout","Rainbow Trout"] },
    { name: "Salmon River – ID", lat: 45.18, lng: -113.90, category: "river", state: "Idaho", species: ["Steelhead","Chinook Salmon","Cutthroat Trout"] },
    { name: "Lake Pend Oreille", lat: 48.15, lng: -116.53, category: "lake", state: "Idaho", species: ["Kamloops Rainbow","Lake Trout","Bull Trout"] },
    { name: "Coeur d'Alene Lake", lat: 47.58, lng: -116.77, category: "lake", state: "Idaho", species: ["Chinook Salmon","Cutthroat Trout","Northern Pike"] },
    // UTAH
    { name: "Green River – Below Flaming Gorge", lat: 40.92, lng: -109.42, category: "river", state: "Utah", species: ["Brown Trout","Rainbow Trout","Cutthroat Trout"] },
    { name: "Strawberry Reservoir", lat: 40.17, lng: -111.15, category: "reservoir", state: "Utah", species: ["Cutthroat Trout","Rainbow Trout","Kokanee Salmon"] },
    { name: "Lake Powell", lat: 37.07, lng: -111.25, category: "reservoir", state: "Utah", species: ["Striped Bass","Largemouth Bass","Smallmouth Bass","Walleye"] },
    // NEVADA
    { name: "Pyramid Lake", lat: 40.00, lng: -119.50, category: "lake", state: "Nevada", species: ["Lahontan Cutthroat Trout","Sacramento Perch"] },
    { name: "Lake Mead", lat: 36.08, lng: -114.58, category: "reservoir", state: "Nevada", species: ["Striped Bass","Largemouth Bass","Channel Catfish"] },
    // ARIZONA
    { name: "Lake Pleasant", lat: 33.87, lng: -112.27, category: "lake", state: "Arizona", species: ["Largemouth Bass","Striped Bass","White Bass"] },
    { name: "Roosevelt Lake", lat: 33.67, lng: -111.15, category: "lake", state: "Arizona", species: ["Largemouth Bass","Crappie","Smallmouth Bass"] },
    { name: "Lee's Ferry – Colorado River", lat: 36.87, lng: -111.60, category: "river", state: "Arizona", species: ["Rainbow Trout","Brown Trout"] },
    // NEW MEXICO
    { name: "San Juan River – NM", lat: 36.80, lng: -108.42, category: "river", state: "New Mexico", species: ["Rainbow Trout","Brown Trout"] },
    { name: "Elephant Butte Reservoir", lat: 33.15, lng: -107.18, category: "reservoir", state: "New Mexico", species: ["Largemouth Bass","Striped Bass","Walleye","Catfish"] },
    // WASHINGTON
    { name: "Yakima River", lat: 46.98, lng: -120.55, category: "river", state: "Washington", species: ["Rainbow Trout","Brown Trout","Smallmouth Bass"] },
    { name: "Lake Chelan", lat: 47.87, lng: -120.17, category: "lake", state: "Washington", species: ["Lake Trout","Chinook Salmon","Rainbow Trout"] },
    { name: "Puget Sound – San Juan Islands", lat: 48.52, lng: -123.02, category: "sound", state: "Washington", species: ["Chinook Salmon","Halibut","Lingcod"] },
    { name: "Olympic Peninsula Rivers", lat: 47.77, lng: -124.30, category: "river", state: "Washington", species: ["Steelhead","Chinook Salmon","Coho Salmon"] },
    // OREGON
    { name: "Rogue River", lat: 42.43, lng: -124.42, category: "river", state: "Oregon", species: ["Steelhead","Chinook Salmon","Smallmouth Bass"] },
    { name: "Umpqua River", lat: 43.67, lng: -123.87, category: "river", state: "Oregon", species: ["Steelhead","Chinook Salmon","Smallmouth Bass"] },
    { name: "Williamson River", lat: 42.62, lng: -121.88, category: "river", state: "Oregon", species: ["Rainbow Trout","Brown Trout"] },
    { name: "Crane Prairie Reservoir", lat: 43.78, lng: -121.78, category: "reservoir", state: "Oregon", species: ["Rainbow Trout","Brook Trout","Largemouth Bass"] },
    // CALIFORNIA
    { name: "Clear Lake – CA", lat: 39.00, lng: -122.77, category: "lake", state: "California", species: ["Largemouth Bass","Crappie","Channel Catfish"] },
    { name: "San Francisco Bay", lat: 37.62, lng: -122.37, category: "bay", state: "California", species: ["Striped Bass","Halibut","Sturgeon","Leopard Shark"] },
    { name: "Owens River", lat: 37.37, lng: -118.62, category: "river", state: "California", species: ["Brown Trout","Rainbow Trout"] },
    { name: "McCloud River", lat: 41.00, lng: -122.12, category: "river", state: "California", species: ["Rainbow Trout","Brown Trout","Brook Trout"] },
    { name: "Hot Creek", lat: 37.67, lng: -118.83, category: "stream", state: "California", species: ["Brown Trout","Rainbow Trout"] },
    { name: "Crowley Lake", lat: 37.55, lng: -118.72, category: "lake", state: "California", species: ["Brown Trout","Rainbow Trout","Sacramento Perch"] },
    { name: "San Diego Bay – Shelter Island", lat: 32.72, lng: -117.23, category: "bay", state: "California", species: ["Yellowtail","Halibut","Bass","Bonito"] },
    { name: "Catalina Island", lat: 33.38, lng: -118.42, category: "island", state: "California", species: ["Yellowtail","White Seabass","Calico Bass","Barracuda"] },
    // ALASKA (more)
    { name: "Copper River – AK", lat: 60.97, lng: -145.42, category: "river", state: "Alaska", species: ["King Salmon","Red Salmon","Silver Salmon"] },
    { name: "Kodiak Island", lat: 57.78, lng: -152.40, category: "island", state: "Alaska", species: ["Halibut","King Salmon","Silver Salmon","Lingcod"] },
    { name: "Prince of Wales Island", lat: 55.53, lng: -132.90, category: "island", state: "Alaska", species: ["King Salmon","Halibut","Steelhead"] },
    { name: "Ketchikan – Southeast AK", lat: 55.34, lng: -131.63, category: "bay", state: "Alaska", species: ["King Salmon","Halibut","Lingcod"] },
    { name: "Kvichak River", lat: 59.32, lng: -156.92, category: "river", state: "Alaska", species: ["Sockeye Salmon","Rainbow Trout","Arctic Char"] },
    // HAWAII (more)
    { name: "Kona Coast – Deep Sea", lat: 19.64, lng: -156.02, category: "offshore", state: "Hawaii", species: ["Blue Marlin","Yellowfin Tuna","Mahi-Mahi","Ono"] },
    { name: "Kaneohe Bay", lat: 21.45, lng: -157.80, category: "bay", state: "Hawaii", species: ["Bonefish","Giant Trevally","Papio"] },
    { name: "North Shore – Oahu", lat: 21.58, lng: -158.10, category: "shore", state: "Hawaii", species: ["Giant Trevally","Bonefish","Mahi-Mahi"] },
  ];
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

    const { data: existing } = await supabase.from("fishing_locations").select("name");
    const existingNames = new Set((existing || []).map((l: any) => l.name.toLowerCase()));

    const allLocations = generateLocations();
    const newLocations = allLocations.filter(l => !existingNames.has(l.name.toLowerCase()));

    let inserted = 0;
    const batchSize = 50;
    for (let i = 0; i < newLocations.length; i += batchSize) {
      const batch = newLocations.slice(i, i + batchSize);
      const { error } = await supabase.from("fishing_locations").insert(batch);
      if (!error) inserted += batch.length;
    }

    return new Response(
      JSON.stringify({ success: true, total_new: newLocations.length, inserted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
