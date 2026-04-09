import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LANGUAGE_NAMES: Record<string, string> = {
  pt: "Portuguese", fr: "French", de: "German", no: "Norwegian",
  sv: "Swedish", fi: "Finnish", da: "Danish", nl: "Dutch",
  it: "Italian", sl: "Slovenian", hr: "Croatian", pl: "Polish",
  ro: "Romanian", cs: "Czech", sk: "Slovak", el: "Greek",
  bg: "Bulgarian", mk: "Macedonian", sq: "Albanian", uk: "Ukrainian",
  by: "Belarusian", lv: "Latvian", lt: "Lithuanian", et: "Estonian",
  ar: "Arabic", hi: "Hindi", ur: "Urdu", ja: "Japanese",
  vi: "Vietnamese", th: "Thai", ko: "Korean", es: "Spanish",
  zh: "Chinese (Simplified)",
};

const BATCH_SIZE = 80;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { language_code } = await req.json();
    if (!language_code || language_code === "en") {
      return new Response(JSON.stringify({ translated: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const langName = LANGUAGE_NAMES[language_code];
    if (!langName) {
      return new Response(JSON.stringify({ error: "Unsupported language" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    // Get all fish
    const { data: allFish } = await sb
      .from("fish_species")
      .select("id, name_en")
      .order("name_en");

    if (!allFish || allFish.length === 0) {
      return new Response(JSON.stringify({ translated: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get existing translations
    const { data: existing } = await sb
      .from("fish_name_translations")
      .select("fish_id")
      .eq("language_code", language_code);

    const existingIds = new Set((existing || []).map((e) => e.fish_id));
    const toTranslate = allFish.filter((f) => !existingIds.has(f.id));

    if (toTranslate.length === 0) {
      return new Response(JSON.stringify({ translated: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let totalTranslated = 0;

    for (let i = 0; i < toTranslate.length; i += BATCH_SIZE) {
      const batch = toTranslate.slice(i, i + BATCH_SIZE);
      const names = batch.map((f) => f.name_en);

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
              content: `You are a fish species name translator. Translate common fish names from English to ${langName}. Return ONLY a JSON array of translated names in the exact same order. If a fish has no common name in ${langName}, keep the English name. No explanations, no markdown.`,
            },
            {
              role: "user",
              content: JSON.stringify(names),
            },
          ],
          temperature: 0.1,
        }),
      });

      if (!aiRes.ok) {
        console.error("AI error:", await aiRes.text());
        continue;
      }

      const aiData = await aiRes.json();
      let text = aiData.choices?.[0]?.message?.content || "";
      text = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

      let translated: string[];
      try {
        translated = JSON.parse(text);
      } catch {
        console.error("Failed to parse:", text.substring(0, 200));
        continue;
      }

      // Ensure correct length
      while (translated.length < batch.length) {
        translated.push(batch[translated.length].name_en);
      }

      const rows = batch.map((f, idx) => ({
        fish_id: f.id,
        language_code,
        translated_name: translated[idx] || f.name_en,
      }));

      const { error } = await sb
        .from("fish_name_translations")
        .upsert(rows, { onConflict: "fish_id,language_code" });

      if (error) {
        console.error("Insert error:", error);
      } else {
        totalTranslated += rows.length;
      }
    }

    return new Response(
      JSON.stringify({ translated: totalTranslated }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
