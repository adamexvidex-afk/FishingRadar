import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateLocations() {
  // Generate additional US fishing locations to reach 1000+
  return [
    // More TEXAS
    { name: "Lake O' the Pines", lat: 32.75, lng: -94.50, category: "lake", state: "Texas", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Lake Livingston", lat: 30.80, lng: -95.10, category: "lake", state: "Texas", species: ["White Bass","Catfish","Crappie"] },
    { name: "Richland-Chambers Reservoir", lat: 31.95, lng: -96.12, category: "reservoir", state: "Texas", species: ["Largemouth Bass","White Bass","Catfish"] },
    { name: "Lake Travis", lat: 30.42, lng: -97.95, category: "lake", state: "Texas", species: ["Largemouth Bass","Striped Bass","Guadalupe Bass"] },
    { name: "Lake Conroe", lat: 30.42, lng: -95.58, category: "lake", state: "Texas", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Lake Sam Rayburn – East", lat: 30.77, lng: -94.02, category: "lake", state: "Texas", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Nueces River", lat: 28.50, lng: -97.75, category: "river", state: "Texas", species: ["Largemouth Bass","Catfish"] },
    { name: "Sabine Pass", lat: 29.73, lng: -93.87, category: "pass", state: "Texas", species: ["Red Drum","Spotted Seatrout","Flounder"] },
    { name: "Baffin Bay", lat: 27.30, lng: -97.40, category: "bay", state: "Texas", species: ["Spotted Seatrout","Red Drum","Black Drum"] },
    { name: "Matagorda Bay", lat: 28.60, lng: -96.30, category: "bay", state: "Texas", species: ["Red Drum","Spotted Seatrout","Flounder"] },
    // More FLORIDA
    { name: "Lake George – FL", lat: 29.28, lng: -81.58, category: "lake", state: "Florida", species: ["Largemouth Bass","Crappie","Bluegill"] },
    { name: "Homosassa River", lat: 28.78, lng: -82.62, category: "river", state: "Florida", species: ["Snook","Red Drum","Tarpon"] },
    { name: "Crystal River – FL", lat: 28.90, lng: -82.60, category: "river", state: "Florida", species: ["Snook","Red Drum","Tarpon","Sheepshead"] },
    { name: "St. Lucie Inlet", lat: 27.17, lng: -80.15, category: "inlet", state: "Florida", species: ["Snook","Tarpon","Jack Crevalle"] },
    { name: "Sebastian Inlet", lat: 27.86, lng: -80.45, category: "inlet", state: "Florida", species: ["Snook","Red Drum","Flounder","Bluefish"] },
    { name: "Suwannee River – FL", lat: 29.30, lng: -83.17, category: "river", state: "Florida", species: ["Largemouth Bass","Striped Bass","Sturgeon"] },
    { name: "Withlacoochee River – FL", lat: 28.95, lng: -82.30, category: "river", state: "Florida", species: ["Largemouth Bass","Catfish","Bluegill"] },
    { name: "Pensacola Bay", lat: 30.37, lng: -87.22, category: "bay", state: "Florida", species: ["Red Drum","Spotted Seatrout","Flounder","Cobia"] },
    { name: "Destin Pass", lat: 30.39, lng: -86.52, category: "pass", state: "Florida", species: ["Red Snapper","Cobia","King Mackerel"] },
    { name: "Pine Island Sound", lat: 26.62, lng: -82.17, category: "sound", state: "Florida", species: ["Snook","Red Drum","Spotted Seatrout","Tarpon"] },
    // More CALIFORNIA
    { name: "Sacramento–San Joaquin Delta", lat: 38.05, lng: -121.75, category: "delta", state: "California", species: ["Largemouth Bass","Striped Bass","Sturgeon"] },
    { name: "Lake Shasta", lat: 40.78, lng: -122.37, category: "lake", state: "California", species: ["Rainbow Trout","Brown Trout","Largemouth Bass","Spotted Bass"] },
    { name: "Lake Oroville", lat: 39.55, lng: -121.47, category: "lake", state: "California", species: ["Spotted Bass","King Salmon","Rainbow Trout"] },
    { name: "Castaic Lake", lat: 34.53, lng: -118.62, category: "lake", state: "California", species: ["Largemouth Bass","Striped Bass","Trout"] },
    { name: "Diamond Valley Lake", lat: 33.68, lng: -117.18, category: "lake", state: "California", species: ["Largemouth Bass","Striped Bass","Trout"] },
    { name: "Lake Perris", lat: 33.82, lng: -117.17, category: "lake", state: "California", species: ["Largemouth Bass","Spotted Bass","Channel Catfish"] },
    { name: "New Melones Reservoir", lat: 37.93, lng: -120.53, category: "reservoir", state: "California", species: ["Rainbow Trout","Largemouth Bass","Crappie"] },
    { name: "Don Pedro Reservoir", lat: 37.72, lng: -120.42, category: "reservoir", state: "California", species: ["King Salmon","Rainbow Trout","Largemouth Bass"] },
    { name: "Trinity Lake", lat: 40.93, lng: -122.73, category: "lake", state: "California", species: ["Smallmouth Bass","Largemouth Bass","Rainbow Trout"] },
    { name: "Fall River – CA", lat: 41.00, lng: -121.42, category: "river", state: "California", species: ["Rainbow Trout","Brown Trout"] },
    // More WASHINGTON
    { name: "Columbia River – Hanford Reach", lat: 46.65, lng: -119.55, category: "river", state: "Washington", species: ["Chinook Salmon","Steelhead","Walleye","Smallmouth Bass"] },
    { name: "Snake River – WA", lat: 46.22, lng: -117.05, category: "river", state: "Washington", species: ["Steelhead","Chinook Salmon","Smallmouth Bass"] },
    { name: "Banks Lake", lat: 47.75, lng: -119.10, category: "lake", state: "Washington", species: ["Walleye","Smallmouth Bass","Largemouth Bass","Perch"] },
    { name: "Lake Roosevelt", lat: 48.00, lng: -118.98, category: "lake", state: "Washington", species: ["Walleye","Rainbow Trout","Kokanee"] },
    { name: "Rufus Woods Lake", lat: 47.97, lng: -119.52, category: "lake", state: "Washington", species: ["Rainbow Trout","Walleye","Kokanee"] },
    // More OREGON
    { name: "Rogue River – Lower", lat: 42.43, lng: -124.40, category: "river", state: "Oregon", species: ["Chinook Salmon","Steelhead","Striped Bass"] },
    { name: "Wilson River", lat: 45.48, lng: -123.68, category: "river", state: "Oregon", species: ["Steelhead","Chinook Salmon","Coho Salmon"] },
    { name: "Sandy River", lat: 45.53, lng: -122.38, category: "river", state: "Oregon", species: ["Steelhead","Coho Salmon","Chinook Salmon"] },
    { name: "Paulina Lake", lat: 43.72, lng: -121.27, category: "lake", state: "Oregon", species: ["Brown Trout","Rainbow Trout","Kokanee"] },
    { name: "East Lake", lat: 43.72, lng: -121.20, category: "lake", state: "Oregon", species: ["Brown Trout","Rainbow Trout","Atlantic Salmon"] },
    // More MICHIGAN
    { name: "Little Manistee River", lat: 44.22, lng: -86.10, category: "river", state: "Michigan", species: ["Steelhead","Chinook Salmon","Brown Trout"] },
    { name: "Muskegon River", lat: 43.33, lng: -85.90, category: "river", state: "Michigan", species: ["Steelhead","Chinook Salmon","Brown Trout","Walleye"] },
    { name: "Thunder Bay – MI", lat: 45.00, lng: -83.42, category: "bay", state: "Michigan", species: ["Walleye","Lake Trout","Smallmouth Bass"] },
    { name: "Grand Traverse Bay", lat: 44.77, lng: -85.58, category: "bay", state: "Michigan", species: ["Lake Trout","Cisco","Smallmouth Bass"] },
    { name: "Saginaw Bay", lat: 43.85, lng: -83.80, category: "bay", state: "Michigan", species: ["Walleye","Yellow Perch","Smallmouth Bass"] },
    // More MINNESOTA
    { name: "Lake Kabetogama", lat: 48.42, lng: -93.02, category: "lake", state: "Minnesota", species: ["Walleye","Smallmouth Bass","Northern Pike","Crappie"] },
    { name: "Lake Winnibigoshish – East", lat: 47.40, lng: -93.93, category: "lake", state: "Minnesota", species: ["Walleye","Northern Pike","Yellow Perch"] },
    { name: "Cass Lake", lat: 47.40, lng: -94.55, category: "lake", state: "Minnesota", species: ["Walleye","Northern Pike","Yellow Perch","Muskie"] },
    { name: "Lake Minnetonka", lat: 44.93, lng: -93.58, category: "lake", state: "Minnesota", species: ["Muskie","Largemouth Bass","Walleye","Northern Pike"] },
    { name: "Gull Lake – MN", lat: 46.42, lng: -94.35, category: "lake", state: "Minnesota", species: ["Walleye","Northern Pike","Largemouth Bass"] },
    // More WISCONSIN
    { name: "Lake Mendota", lat: 43.10, lng: -89.42, category: "lake", state: "Wisconsin", species: ["Walleye","Largemouth Bass","Northern Pike","Panfish"] },
    { name: "Green Bay – WI", lat: 44.53, lng: -88.00, category: "bay", state: "Wisconsin", species: ["Walleye","Smallmouth Bass","Northern Pike","Yellow Perch"] },
    { name: "Lake Wissota", lat: 44.92, lng: -91.30, category: "lake", state: "Wisconsin", species: ["Muskie","Walleye","Largemouth Bass"] },
    { name: "Hayward Lakes", lat: 46.02, lng: -91.48, category: "lake", state: "Wisconsin", species: ["Muskie","Walleye","Northern Pike","Largemouth Bass"] },
    { name: "Lac Courte Oreilles", lat: 46.03, lng: -91.50, category: "lake", state: "Wisconsin", species: ["Muskie","Walleye","Largemouth Bass","Crappie"] },
    // More NORTH CAROLINA
    { name: "Lake Gaston", lat: 36.52, lng: -77.92, category: "lake", state: "North Carolina", species: ["Largemouth Bass","Striped Bass","Crappie","Catfish"] },
    { name: "Jordan Lake", lat: 35.72, lng: -79.05, category: "lake", state: "North Carolina", species: ["Largemouth Bass","Crappie","Catfish","Striped Bass"] },
    { name: "Falls Lake", lat: 36.02, lng: -78.72, category: "lake", state: "North Carolina", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Tuckasegee River", lat: 35.35, lng: -83.25, category: "river", state: "North Carolina", species: ["Brown Trout","Rainbow Trout","Smallmouth Bass"] },
    { name: "Watauga River – NC", lat: 36.22, lng: -81.68, category: "river", state: "North Carolina", species: ["Brown Trout","Rainbow Trout","Brook Trout"] },
    // More SOUTH CAROLINA  
    { name: "Lake Hartwell", lat: 34.45, lng: -82.83, category: "lake", state: "South Carolina", species: ["Largemouth Bass","Striped Bass","Crappie"] },
    { name: "Lake Wateree", lat: 34.37, lng: -80.70, category: "lake", state: "South Carolina", species: ["Largemouth Bass","Catfish","Crappie"] },
    { name: "Lake Moultrie", lat: 33.30, lng: -80.10, category: "lake", state: "South Carolina", species: ["Largemouth Bass","Striped Bass","Catfish","Crappie"] },
    // More GEORGIA
    { name: "Lake Oconee", lat: 33.55, lng: -83.27, category: "lake", state: "Georgia", species: ["Largemouth Bass","Striped Bass","Crappie"] },
    { name: "Lake Sinclair", lat: 33.15, lng: -83.27, category: "lake", state: "Georgia", species: ["Largemouth Bass","Crappie","Catfish"] },
    { name: "Clarks Hill Lake", lat: 33.70, lng: -82.20, category: "lake", state: "Georgia", species: ["Largemouth Bass","Striped Bass","Crappie","Catfish"] },
    { name: "West Point Lake", lat: 33.00, lng: -85.17, category: "lake", state: "Georgia", species: ["Largemouth Bass","Crappie","Catfish"] },
    // More ALABAMA
    { name: "Lewis Smith Lake", lat: 34.10, lng: -87.13, category: "lake", state: "Alabama", species: ["Spotted Bass","Largemouth Bass","Striped Bass"] },
    { name: "Lake Martin", lat: 32.75, lng: -85.95, category: "lake", state: "Alabama", species: ["Spotted Bass","Largemouth Bass","Striped Bass","Crappie"] },
    { name: "Weiss Lake", lat: 34.13, lng: -85.78, category: "lake", state: "Alabama", species: ["Largemouth Bass","Crappie","Spotted Bass"] },
    // More TENNESSEE
    { name: "Center Hill Lake", lat: 36.12, lng: -85.67, category: "lake", state: "Tennessee", species: ["Smallmouth Bass","Walleye","Muskie"] },
    { name: "Watts Bar Lake", lat: 35.65, lng: -84.73, category: "lake", state: "Tennessee", species: ["Largemouth Bass","Sauger","Crappie","Catfish"] },
    { name: "Fort Loudoun Lake", lat: 35.80, lng: -84.22, category: "lake", state: "Tennessee", species: ["Largemouth Bass","Sauger","Crappie"] },
    { name: "Hiwassee River", lat: 35.17, lng: -84.58, category: "river", state: "Tennessee", species: ["Brown Trout","Rainbow Trout"] },
    { name: "Caney Fork River", lat: 36.13, lng: -85.65, category: "river", state: "Tennessee", species: ["Brown Trout","Rainbow Trout"] },
    // More COLORADO
    { name: "Williams Fork Reservoir", lat: 39.97, lng: -106.17, category: "reservoir", state: "Colorado", species: ["Northern Pike","Rainbow Trout","Lake Trout"] },
    { name: "Stagecoach Reservoir", lat: 40.27, lng: -106.82, category: "reservoir", state: "Colorado", species: ["Northern Pike","Rainbow Trout"] },
    { name: "Taylor River", lat: 38.82, lng: -106.83, category: "river", state: "Colorado", species: ["Rainbow Trout","Brown Trout"] },
    { name: "Eagle River – CO", lat: 39.63, lng: -106.63, category: "river", state: "Colorado", species: ["Rainbow Trout","Brown Trout"] },
    { name: "Rio Grande – CO", lat: 37.67, lng: -106.42, category: "river", state: "Colorado", species: ["Brown Trout","Rainbow Trout"] },
    // More MONTANA
    { name: "Big Hole River", lat: 45.70, lng: -113.12, category: "river", state: "Montana", species: ["Brown Trout","Rainbow Trout","Arctic Grayling"] },
    { name: "Smith River – MT", lat: 46.87, lng: -111.10, category: "river", state: "Montana", species: ["Brown Trout","Rainbow Trout"] },
    { name: "Blackfoot River", lat: 47.03, lng: -113.28, category: "river", state: "Montana", species: ["Rainbow Trout","Brown Trout","Cutthroat Trout","Bull Trout"] },
    { name: "Ruby River", lat: 45.37, lng: -112.12, category: "river", state: "Montana", species: ["Brown Trout","Rainbow Trout"] },
    { name: "Stillwater River – MT", lat: 45.63, lng: -109.77, category: "river", state: "Montana", species: ["Rainbow Trout","Cutthroat Trout","Brown Trout"] },
    // More IDAHO
    { name: "South Fork Boise River", lat: 43.55, lng: -115.43, category: "river", state: "Idaho", species: ["Rainbow Trout","Bull Trout","Mountain Whitefish"] },
    { name: "St. Joe River", lat: 47.30, lng: -116.38, category: "river", state: "Idaho", species: ["Cutthroat Trout","Bull Trout"] },
    { name: "Clearwater River – ID", lat: 46.42, lng: -116.78, category: "river", state: "Idaho", species: ["Steelhead","Chinook Salmon","Smallmouth Bass"] },
    { name: "Priest Lake", lat: 48.47, lng: -116.87, category: "lake", state: "Idaho", species: ["Lake Trout","Cutthroat Trout","Kokanee"] },
    // More WYOMING
    { name: "Miracle Mile – North Platte", lat: 42.12, lng: -106.75, category: "river", state: "Wyoming", species: ["Brown Trout","Rainbow Trout","Walleye"] },
    { name: "Buffalo Bill Reservoir", lat: 44.50, lng: -109.18, category: "reservoir", state: "Wyoming", species: ["Rainbow Trout","Brown Trout","Lake Trout"] },
    { name: "Tongue River – WY", lat: 44.85, lng: -107.23, category: "river", state: "Wyoming", species: ["Brown Trout","Rainbow Trout"] },
    // More ALASKA
    { name: "Naknek River", lat: 58.73, lng: -157.00, category: "river", state: "Alaska", species: ["King Salmon","Sockeye Salmon","Rainbow Trout"] },
    { name: "Alagnak River", lat: 58.92, lng: -155.88, category: "river", state: "Alaska", species: ["Sockeye Salmon","Rainbow Trout","Arctic Char"] },
    { name: "Nushagak River", lat: 59.35, lng: -158.72, category: "river", state: "Alaska", species: ["King Salmon","Chum Salmon","Rainbow Trout"] },
    { name: "Gulkana River", lat: 62.28, lng: -145.38, category: "river", state: "Alaska", species: ["Sockeye Salmon","King Salmon","Grayling"] },
    { name: "Talkeetna River", lat: 62.32, lng: -150.10, category: "river", state: "Alaska", species: ["Silver Salmon","Rainbow Trout","Dolly Varden"] },
    { name: "Susitna River", lat: 62.07, lng: -150.12, category: "river", state: "Alaska", species: ["King Salmon","Silver Salmon","Rainbow Trout"] },
    // More OHIO
    { name: "Alum Creek – OH", lat: 40.17, lng: -82.95, category: "stream", state: "Ohio", species: ["Muskie","Largemouth Bass","Crappie"] },
    { name: "Salt Fork Lake", lat: 40.10, lng: -81.52, category: "lake", state: "Ohio", species: ["Muskie","Largemouth Bass","Crappie","Catfish"] },
    { name: "Mosquito Creek Lake", lat: 41.28, lng: -80.77, category: "lake", state: "Ohio", species: ["Walleye","Muskie","Crappie","Largemouth Bass"] },
    { name: "Berlin Reservoir", lat: 41.02, lng: -81.00, category: "reservoir", state: "Ohio", species: ["Walleye","Crappie","Largemouth Bass"] },
    // More INDIANA
    { name: "Brookville Reservoir", lat: 39.43, lng: -85.00, category: "reservoir", state: "Indiana", species: ["Walleye","Saugeye","Crappie","Largemouth Bass"] },
    { name: "Lake Wawasee", lat: 41.38, lng: -85.73, category: "lake", state: "Indiana", species: ["Walleye","Largemouth Bass","Bluegill","Crappie"] },
    // More ILLINOIS
    { name: "Carlyle Lake", lat: 38.62, lng: -89.33, category: "lake", state: "Illinois", species: ["Largemouth Bass","Crappie","Catfish","White Bass"] },
    { name: "Lake of Egypt", lat: 37.65, lng: -89.08, category: "lake", state: "Illinois", species: ["Largemouth Bass","Channel Catfish","Crappie"] },
    // More MISSOURI
    { name: "Lake of the Ozarks", lat: 38.12, lng: -92.65, category: "lake", state: "Missouri", species: ["Largemouth Bass","Crappie","Catfish","White Bass"] },
    { name: "Truman Reservoir", lat: 38.25, lng: -93.55, category: "reservoir", state: "Missouri", species: ["Crappie","Largemouth Bass","Catfish","White Bass"] },
    { name: "Meramec River", lat: 38.42, lng: -90.72, category: "river", state: "Missouri", species: ["Smallmouth Bass","Largemouth Bass","Catfish"] },
    // More KENTUCKY
    { name: "Barren River Lake", lat: 36.87, lng: -86.10, category: "lake", state: "Kentucky", species: ["Largemouth Bass","Crappie","Walleye"] },
    { name: "Laurel River Lake", lat: 36.95, lng: -84.30, category: "lake", state: "Kentucky", species: ["Rainbow Trout","Walleye","Largemouth Bass"] },
    { name: "Rough River Lake", lat: 37.60, lng: -86.48, category: "lake", state: "Kentucky", species: ["Largemouth Bass","Crappie","Catfish"] },
    // More ARKANSAS
    { name: "Greers Ferry Lake", lat: 35.50, lng: -92.12, category: "lake", state: "Arkansas", species: ["Walleye","Largemouth Bass","Striped Bass","Crappie"] },
    { name: "DeGray Lake", lat: 34.23, lng: -93.12, category: "lake", state: "Arkansas", species: ["Largemouth Bass","Hybrid Striped Bass","Crappie"] },
    { name: "Lake Ouachita", lat: 34.55, lng: -93.37, category: "lake", state: "Arkansas", species: ["Largemouth Bass","Striped Bass","Walleye","Crappie"] },
    // More OKLAHOMA
    { name: "Lake Eufaula – OK", lat: 35.30, lng: -95.37, category: "lake", state: "Oklahoma", species: ["Largemouth Bass","Crappie","Catfish","Hybrid Striped Bass"] },
    { name: "Sardis Lake – OK", lat: 34.62, lng: -95.37, category: "lake", state: "Oklahoma", species: ["Largemouth Bass","Crappie","Catfish"] },
    // More LOUISIANA
    { name: "False River", lat: 30.72, lng: -91.35, category: "lake", state: "Louisiana", species: ["Largemouth Bass","Crappie","Bream"] },
    { name: "Calcasieu Lake", lat: 29.90, lng: -93.30, category: "lake", state: "Louisiana", species: ["Red Drum","Spotted Seatrout","Flounder"] },
    { name: "Sabine Lake", lat: 29.90, lng: -93.82, category: "lake", state: "Louisiana", species: ["Red Drum","Spotted Seatrout","Flounder"] },
    // More MISSISSIPPI
    { name: "Grenada Lake", lat: 33.83, lng: -89.73, category: "lake", state: "Mississippi", species: ["Crappie","Largemouth Bass","Catfish"] },
    { name: "Enid Lake", lat: 34.17, lng: -89.87, category: "lake", state: "Mississippi", species: ["Crappie","Largemouth Bass","Catfish"] },
    // CONNECTICUT
    { name: "Long Island Sound – CT Shore", lat: 41.15, lng: -72.90, category: "sound", state: "Connecticut", species: ["Striped Bass","Bluefish","Fluke","Blackfish"] },
    // DELAWARE
    { name: "Delaware Bay", lat: 38.95, lng: -75.20, category: "bay", state: "Delaware", species: ["Striped Bass","Weakfish","Bluefish","Flounder"] },
    { name: "Indian River Inlet – DE", lat: 38.61, lng: -75.07, category: "inlet", state: "Delaware", species: ["Striped Bass","Flounder","Tog","Bluefish"] },
    // More NEW YORK
    { name: "Lake George – NY", lat: 43.45, lng: -73.70, category: "lake", state: "New York", species: ["Lake Trout","Landlocked Salmon","Largemouth Bass","Smallmouth Bass"] },
    { name: "Saranac Lake", lat: 44.32, lng: -74.13, category: "lake", state: "New York", species: ["Lake Trout","Northern Pike","Smallmouth Bass"] },
    { name: "Oneida Lake", lat: 43.20, lng: -75.88, category: "lake", state: "New York", species: ["Walleye","Yellow Perch","Smallmouth Bass","Largemouth Bass"] },
    // More PENNSYLVANIA
    { name: "Raystown Lake", lat: 40.42, lng: -78.02, category: "lake", state: "Pennsylvania", species: ["Striped Bass","Largemouth Bass","Smallmouth Bass","Walleye"] },
    { name: "Allegheny Reservoir", lat: 41.83, lng: -78.80, category: "reservoir", state: "Pennsylvania", species: ["Walleye","Smallmouth Bass","Muskie","Northern Pike"] },
    // NEBRASKA
    { name: "Merritt Reservoir", lat: 42.42, lng: -100.90, category: "reservoir", state: "Nebraska", species: ["Walleye","Muskie","Largemouth Bass"] },
    // SOUTH DAKOTA
    { name: "Lake Francis Case", lat: 43.48, lng: -99.15, category: "lake", state: "South Dakota", species: ["Walleye","Smallmouth Bass","Northern Pike"] },
    // NORTH DAKOTA
    { name: "Lake Darling", lat: 48.05, lng: -101.58, category: "lake", state: "North Dakota", species: ["Walleye","Northern Pike","Yellow Perch"] },
    // NEW MEXICO
    { name: "Cochiti Lake", lat: 35.62, lng: -106.33, category: "lake", state: "New Mexico", species: ["Northern Pike","Smallmouth Bass","Largemouth Bass"] },
    { name: "Navajo Lake – NM", lat: 36.80, lng: -107.62, category: "lake", state: "New Mexico", species: ["Largemouth Bass","Northern Pike","Kokanee","Channel Catfish"] },
    // ARIZONA
    { name: "Lake Havasu", lat: 34.50, lng: -114.37, category: "lake", state: "Arizona", species: ["Largemouth Bass","Striped Bass","Smallmouth Bass","Redear Sunfish"] },
    { name: "Saguaro Lake", lat: 33.57, lng: -111.52, category: "lake", state: "Arizona", species: ["Largemouth Bass","Yellow Bass","Channel Catfish"] },
    { name: "Canyon Lake – AZ", lat: 33.53, lng: -111.43, category: "lake", state: "Arizona", species: ["Rainbow Trout","Largemouth Bass","Walleye"] },
    // UTAH
    { name: "Bear Lake – UT", lat: 41.95, lng: -111.32, category: "lake", state: "Utah", species: ["Bonneville Cutthroat","Lake Trout","Cisco"] },
    { name: "Fish Lake – UT", lat: 38.55, lng: -111.70, category: "lake", state: "Utah", species: ["Rainbow Trout","Splake","Yellow Perch"] },
    // NEVADA
    { name: "Lahontan Reservoir", lat: 39.47, lng: -119.07, category: "reservoir", state: "Nevada", species: ["Walleye","White Bass","Largemouth Bass"] },
    { name: "Ruby Lake", lat: 40.20, lng: -115.48, category: "lake", state: "Nevada", species: ["Largemouth Bass","Rainbow Trout"] },
    // More VIRGINIA
    { name: "Philpott Lake", lat: 36.78, lng: -80.03, category: "lake", state: "Virginia", species: ["Smallmouth Bass","Largemouth Bass","Crappie"] },
    { name: "Kerr Lake – VA", lat: 36.60, lng: -78.38, category: "lake", state: "Virginia", species: ["Largemouth Bass","Striped Bass","Crappie","Catfish"] },
    // WEST VIRGINIA
    { name: "Summersville Lake", lat: 38.22, lng: -80.87, category: "lake", state: "West Virginia", species: ["Smallmouth Bass","Walleye","Rock Bass"] },
    { name: "Burnsville Lake", lat: 38.85, lng: -80.63, category: "lake", state: "West Virginia", species: ["Largemouth Bass","Muskie","Crappie"] },
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
      JSON.stringify({ success: true, total_new: newLocations.length, inserted, existing_count: existingNames.size }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
