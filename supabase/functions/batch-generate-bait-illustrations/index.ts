import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const email = claimsData.claims.email as string;
    if (email !== ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { baits } = await req.json();

    if (!Array.isArray(baits) || baits.length === 0) {
      return new Response(JSON.stringify({ error: "baits array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check which already exist
    const { data: existingFiles } = await supabaseAdmin.storage
      .from("bait-illustrations")
      .list("", { limit: 500 });

    let allFiles = existingFiles || [];
    if (allFiles.length === 500) {
      const { data: more } = await supabaseAdmin.storage
        .from("bait-illustrations")
        .list("", { limit: 500, offset: 500 });
      if (more) allFiles = [...allFiles, ...more];
    }

    const existingSet = new Set(allFiles.map((f) => f.name.replace(".png", "")));

    const toGenerate = baits.filter((b: any) => !existingSet.has(b.id));
    const results: { id: string; status: string; url?: string }[] = [];

    for (const bait of toGenerate) {
      try {
        const safeNameEn = (bait.nameEn || "").replace(/[^A-Za-z\s\-()]/g, "");
        const typeLabel = bait.type === "artificial" ? "artificial fishing lure/bait" : "natural fishing bait";

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
          const status = aiRes.status;
          console.error(`AI error for ${bait.id}: ${status}`);
          if (status === 429 || status === 402) {
            results.push({ id: bait.id, status: `error-${status}` });
            // Stop on rate limit / payment issues
            break;
          }
          results.push({ id: bait.id, status: "error" });
          continue;
        }

        const aiData = await aiRes.json();
        const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (!imageUrl) {
          results.push({ id: bait.id, status: "no-image" });
          continue;
        }

        const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
        const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

        const filePath = `${bait.id}.png`;
        const { error: uploadError } = await supabaseAdmin.storage
          .from("bait-illustrations")
          .upload(filePath, imageBytes, { contentType: "image/png", upsert: true });

        if (uploadError) {
          results.push({ id: bait.id, status: "upload-error" });
          continue;
        }

        const { data: publicUrl } = supabaseAdmin.storage
          .from("bait-illustrations")
          .getPublicUrl(filePath);

        results.push({ id: bait.id, status: "ok", url: publicUrl.publicUrl });
        console.log(`Generated: ${bait.id}`);
      } catch (e) {
        console.error(`Error generating ${bait.id}:`, e);
        results.push({ id: bait.id, status: "error" });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        generated: results.filter((r) => r.status === "ok").length,
        skipped: baits.length - toGenerate.length,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Batch error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
