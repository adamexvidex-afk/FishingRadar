import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function isValidBaitId(id: unknown): id is string {
  return typeof id === 'string' && id.length > 0 && id.length <= 100 && /^[a-zA-Z0-9_-]+$/.test(id);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { baitId, nameSi, nameEn, type, force } = await req.json();

    if (!isValidBaitId(baitId)) {
      return new Response(JSON.stringify({ error: "Invalid baitId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Check if already exists
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const filePath = `${baitId}.png`;
    const { data: existing } = await supabaseAdmin.storage
      .from("bait-illustrations")
      .list("", { search: filePath });

    if (!force && existing && existing.some(f => f.name === filePath)) {
      const { data: publicUrl } = supabaseAdmin.storage
        .from("bait-illustrations")
        .getPublicUrl(filePath);
      return new Response(
        JSON.stringify({ success: true, url: publicUrl.publicUrl, cached: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const safeNameEn = (nameEn || '').replace(/[^A-Za-z\s\-()]/g, '');
    const typeLabel = type === 'artificial' ? 'artificial fishing lure/bait' : 'natural fishing bait';

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: `Create a beautiful hand-drawn watercolor illustration of the ${typeLabel} "${safeNameEn}" used in freshwater fishing. Use a soft watercolor style with visible brush strokes, gentle color washes, and an artistic feel. Show it on a clean white background. The illustration should look like it belongs in a vintage fishing field guide book with artistic charm. No text, no labels, no hands, no photographs.`,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI error:", aiRes.status, errText);
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again later" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI generation failed");
    }

    const aiData = await aiRes.json();
    const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error("No image generated");
    }

    const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
    const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    const { error: uploadError } = await supabaseAdmin.storage
      .from("bait-illustrations")
      .upload(filePath, imageBytes, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error("Upload failed");
    }

    const { data: publicUrl } = supabaseAdmin.storage
      .from("bait-illustrations")
      .getPublicUrl(filePath);

    return new Response(
      JSON.stringify({ success: true, url: publicUrl.publicUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
