import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { batchSize = 3 } = await req.json().catch(() => ({}));
    const limit = Math.min(Math.max(1, batchSize), 5);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { data: fish, error: fetchError } = await supabase
      .from("fish_species")
      .select("id, name_en, latin_name, category")
      .is("image_url", null)
      .order("name_en")
      .limit(limit);

    if (fetchError) throw fetchError;
    if (!fish || fish.length === 0) {
      return new Response(JSON.stringify({ message: "All done", remaining: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = [];
    for (const f of fish) {
      try {
        const safeName = (f.name_en || "").replace(/[^A-Za-z0-9\s'-]/g, "");
        const safeLatin = (f.latin_name || "Unknown").replace(/[^A-Za-z\s.]/g, "");
        const category = f.category || "freshwater";

        const prompt = `Create a realistic scientific illustration of the ${category} fish "${safeLatin}" (${safeName}). Side profile, clean white background, field guide style. Natural coloring, anatomical details. No text or labels.`;

        const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [{ role: "user", content: prompt }],
            modalities: ["image", "text"],
          }),
        });

        if (!aiRes.ok) {
          const errText = await aiRes.text();
          results.push({ name: f.name_en, success: false, error: `AI ${aiRes.status}: ${errText.slice(0, 100)}` });
          if (aiRes.status === 429) {
            await new Promise(r => setTimeout(r, 10000));
            continue;
          }
          continue;
        }

        const aiData = await aiRes.json();
        const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (!imageUrl) {
          results.push({ name: f.name_en, success: false, error: "No image in response" });
          continue;
        }

        const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
        const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

        const safeFileName = f.name_en.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
        const filePath = `${safeFileName}.png`;

        const { error: uploadError } = await supabase.storage
          .from("fish-illustrations")
          .upload(filePath, imageBytes, { contentType: "image/png", upsert: true });

        if (uploadError) {
          results.push({ name: f.name_en, success: false, error: uploadError.message });
          continue;
        }

        const { data: publicUrlData } = supabase.storage.from("fish-illustrations").getPublicUrl(filePath);
        await supabase.from("fish_species").update({ image_url: publicUrlData.publicUrl }).eq("id", f.id);

        results.push({ name: f.name_en, success: true });
      } catch (err) {
        results.push({ name: f.name_en, success: false, error: String(err) });
      }
    }

    const { count } = await supabase
      .from("fish_species")
      .select("*", { count: "exact", head: true })
      .is("image_url", null);

    return new Response(
      JSON.stringify({ processed: results.length, successful: results.filter(r => r.success).length, remaining: count, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
