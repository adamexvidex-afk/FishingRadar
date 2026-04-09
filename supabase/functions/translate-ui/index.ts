import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LANGUAGE_NAMES: Record<string, string> = {
  pt: "Portuguese", fr: "French", de: "German", no: "Norwegian",
  sv: "Swedish", fi: "Finnish", da: "Danish", nl: "Dutch",
  be_nl: "Belgian Dutch (Flemish)", it: "Italian", sl: "Slovenian",
  hr: "Croatian/Serbian/Bosnian", pl: "Polish", ro: "Romanian",
  cs: "Czech", sk: "Slovak", el: "Greek", bg: "Bulgarian",
  mk: "Macedonian", sq: "Albanian", uk: "Ukrainian", by: "Belarusian",
  lv: "Latvian", lt: "Lithuanian", et: "Estonian", ar: "Arabic",
  hi: "Hindi", ur: "Urdu", ja: "Japanese", vi: "Vietnamese",
  th: "Thai", ko: "Korean", es: "Spanish", zh: "Chinese (Simplified)",
};

// English source translations
const EN_TRANSLATIONS = {
  app: { name: "FishingRadar", tagline: "Your companion on the water" },
  nav: { conditions: "Conditions", simulation: "Simulation", catalog: "Fish Catalog", baits: "Baits", assistant: "CastMate AI", detectFish: "Detect Fish", catchLog: "Catch Log", hotspots: "Hot Spots", community: "Community", trends: "Trends", profile: "Profile", login: "Sign in", logout: "Sign out" },
  home: { hero: "Where are you fishing today?", heroSub: "Type your location and get real-time fishing conditions instantly.", searchPlaceholder: "e.g. Potomac River, Lake Como, Loch Lomond...", searchSub: "Type your fishing spot and get real-time conditions, scores & recommendations.", assistantDesc: "Your personal AI fishing guide", useMyLocation: "Use my location", locating: "Finding your location...", locationNotSupported: "Location is not supported by your browser", locationDenied: "Location access was denied. Please enable it in your settings.", cta: "Check conditions", features: "Features", conditionsTitle: "Fishing Conditions", conditionsDesc: "Score 0–100 based on real-time water data, weather, moon phase and more.", simulationTitle: "Fish Movement Simulation", simulationDesc: "Visual simulation of fish behavior based on environmental conditions.", catalogTitle: "Fish Catalog", catalogDesc: "Detailed descriptions, habitat, techniques and baits for freshwater and saltwater species worldwide.", catchLogTitle: "Catch Log", catchLogDesc: "Record catches with photos, location and statistics.", trendsTitle: "Catch Trends", trendsDesc: "Analytics, records & monthly comparisons of your catches.", hotspotsTitle: "Hotspots", hotspotsDesc: "Top fishing locations around the world.", permitsTitle: "Licenses", permitsDesc: "Easy access to fishing license information.", baitsTitle: "Baits & Lures", baitsDesc: "Natural and artificial baits for every species and technique." },
  conditions: { title: "Fishing Conditions", score: "Score", status: { excellent: "Excellent", good: "Good", ok: "OK", poor: "Poor" }, lastUpdate: "Last update", waterTemp: "Water temperature", airTemp: "Air temperature", flow: "Flow rate", waterLevel: "Water level", pressure: "Air pressure", moonPhase: "Moon phase", timeOfDay: "Time of day", bottomType: "Bottom type", bottomTypes: { rocky: "Rocky", sandy: "Sandy", muddy: "Muddy", gravel: "Gravel" }, breakdown: "Impact breakdown", dataWarning: "Live data unavailable. Showing last known data.", selectStation: "Select measuring station" },
  simulation: { title: "Fish Movement Simulation", disclaimer: "This simulation is a model and not a scientific prediction.", parameters: "Simulation parameters", fishCount: "Number of fish", start: "Start", pause: "Pause", reset: "Reset" },
  catalog: { title: "Fish Catalog", search: "Search fish...", habitat: "Habitat", techniques: "Fishing techniques", baits: "Recommended baits", protection: "Season", minSize: "Minimum size", latinName: "Latin name" },
  baitsPage: { title: "Bait Catalog", search: "Search baits...", type: "Type", artificial: "Artificial", natural: "Natural", usage: "Usage", conditions: "Suitable conditions", techniques: "Related techniques", all: "All" },
  catchLog: { title: "Catch Log", addCatch: "Add catch", noCatches: "No catches yet. Add your first one!", fish: "Fish", length: "Length (in)", weight: "Weight (lbs)", location: "Location", water: "Catch location", bait: "Bait", technique: "Technique", date: "Date", notes: "Notes", photo: "Photo", save: "Save", cancel: "Cancel", stats: "Statistics", totalCatches: "Total catches", avgLength: "Average length", bestMonth: "Best month", topBait: "Top bait" },
  hotspots: { title: "Hotspots", description: "Explore top fishing locations around the world — rivers, lakes, reservoirs and more.", descriptionNote: "Coordinates mark key access points, boat ramps, and notable fishing areas.", minCatches: "Min. catches to display", legend: "Legend", low: "Low", high: "High", cat_river: "River", cat_lake: "Lake", cat_reservoir: "Reservoir", cat_stream: "Stream", cat_bay: "Bay", cat_pond: "Pond" },
  permits: { title: "Fishing Licenses", description: "Purchase a fishing license for your state through the official wildlife agency portal.", cta: "Find your state license", note: "Clicking the button opens the Take Me Fishing license lookup tool in a new tab.", info1: "A valid fishing license is required in all US states.", info2: "Licenses are available for daily, annual, or multi-day fishing.", info3: "Requirements vary by state — select your state on the official portal." },
  footer: { dataSources: "Data sources", permits: "Licenses: TakeMeFishing.org", legal: "Legal information", gdpr: "Privacy policy", rights: "All rights reserved." },
  common: { loading: "Loading...", error: "Error", back: "Back", close: "Close", confirm: "Confirm", delete: "Delete", edit: "Edit", save: "Save", cancel: "Cancel", saving: "Saving…" },
  profile: { editTitle: "Edit Profile", manageAccount: "Manage Account", username: "Username", changeName: "Change name", changePhoto: "Click to change photo", saveNewPhoto: "Save new photo", nameUpdated: "Name updated!", photoUpdated: "Photo updated!", profileSaved: "Profile saved! 🎣", dangerZone: "Danger zone", dangerDesc: "Deleting your profile permanently removes all your catches and data.", deleteProfile: "Delete profile", deleteConfirmTitle: "Are you sure?", deleteConfirmDesc: "This action is permanent. All your catches and data will be deleted.", deleting: "Deleting…", profileDeleted: "Profile deleted.", tooShort: "At least 3 characters.", tooLong: "Max 30 characters.", invalidChars: "Only letters, numbers, spaces and _ allowed", taken: "Already taken.", imageTooLarge: "Image too large", imageTooLargeDesc: "Max 5 MB.", setupTitle: "Set up profile", setupDesc: "Choose a username and profile picture.", selectPhoto: "Click to select photo", saveProfile: "Save profile", placeholder: "e.g. fisher123" },
  login: { googleDesc: "Sign in with your Google account to save your catches." },
  settings: { language: "Language", languageDesc: "Choose your preferred language", chooseLanguage: "Choose Language" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { language_code } = await req.json();
    if (!language_code || language_code === "en") {
      return new Response(JSON.stringify(EN_TRANSLATIONS), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const langName = LANGUAGE_NAMES[language_code];
    if (!langName) {
      return new Response(JSON.stringify({ error: "Unsupported language" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Check cache first
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    const { data: cached } = await sb
      .from("ui_translations")
      .select("translations")
      .eq("language_code", language_code)
      .maybeSingle();

    if (cached?.translations) {
      return new Response(JSON.stringify(cached.translations), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Generate translation using AI
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate the given JSON from English to ${langName}. Keep ALL JSON keys exactly the same. Only translate the string values. Keep brand names (FishingRadar, CastMate AI, TakeMeFishing.org) unchanged. Keep emojis. Return ONLY valid JSON, no markdown.`,
          },
          {
            role: "user",
            content: JSON.stringify(EN_TRANSLATIONS),
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI error:", errText);
      return new Response(JSON.stringify({ error: "Translation failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiData = await aiRes.json();
    let translatedText = aiData.choices?.[0]?.message?.content || "";
    
    // Clean markdown code fences if present
    translatedText = translatedText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    
    let translations: Record<string, unknown>;
    try {
      translations = JSON.parse(translatedText);
    } catch {
      console.error("Failed to parse AI response:", translatedText.substring(0, 500));
      return new Response(JSON.stringify({ error: "Invalid translation response" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Cache the translation
    await sb.from("ui_translations").upsert(
      { language_code, translations, updated_at: new Date().toISOString() },
      { onConflict: "language_code" }
    );

    return new Response(JSON.stringify(translations), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
