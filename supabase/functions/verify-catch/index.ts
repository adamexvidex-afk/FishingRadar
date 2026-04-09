import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { catch_id, photo_url, claimed_species, claimed_length_in, claimed_weight_lb } = await req.json();

    if (!catch_id || !photo_url || !claimed_species) {
      return new Response(
        JSON.stringify({ error: "catch_id, photo_url, and claimed_species are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify catch belongs to user
    const { data: catchData, error: catchError } = await supabase
      .from("catches")
      .select("id, user_id")
      .eq("id", catch_id)
      .single();

    if (catchError || !catchData || catchData.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Catch not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Use AI vision to analyze the photo
    const sizeContext = claimed_length_in || claimed_weight_lb
      ? `\nThe angler claims: ${claimed_length_in ? `length ${claimed_length_in} inches` : ''}${claimed_length_in && claimed_weight_lb ? ', ' : ''}${claimed_weight_lb ? `weight ${claimed_weight_lb} lb` : ''}.`
      : '';

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a fish species identification and catch verification expert. Analyze fishing catch photos to verify authenticity.

Your job:
1. Determine if the image shows a real fish (not AI-generated, not a toy, not a screenshot)
2. Identify the fish species in the photo
3. Compare with the claimed species
4. Estimate approximate size from the photo if possible
5. If the angler claims a specific size, verify if it's realistic for the species AND consistent with the photo. Flag obviously fake sizes (e.g. a bluegill at 100 inches is impossible — world record is ~16 inches).

IMPORTANT: If claimed size vastly exceeds the world record for the species, set is_real_fish to false and species_match to false regardless of the photo.

Respond ONLY with a JSON object (no markdown):
{
  "is_real_fish": true/false,
  "detected_species": "species name or null",
  "species_match": true/false,
  "confidence": 0.0-1.0,
  "estimated_length_inches": number or null,
  "size_plausible": true/false,
  "reason": "brief explanation"
}`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `The angler claims this is a "${claimed_species}".${sizeContext} Analyze this catch photo and verify it.`,
              },
              {
                type: "image_url",
                image_url: { url: photo_url },
              },
            ],
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      throw new Error("AI service error");
    }

    const aiResult = await aiResponse.json();
    const rawContent = aiResult.choices?.[0]?.message?.content || "";

    // Parse JSON from AI response (strip markdown fences if present)
    let verification: any;
    try {
      const cleaned = rawContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      verification = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", rawContent);
      verification = {
        is_real_fish: false,
        detected_species: null,
        species_match: false,
        confidence: 0,
        size_plausible: false,
        reason: "Could not analyze photo",
      };
    }

    const isVerified =
      verification.is_real_fish === true &&
      verification.species_match === true &&
      (verification.confidence ?? 0) >= 0.6 &&
      verification.size_plausible !== false;

    // Update catch record using service role for reliability
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await adminClient
      .from("catches")
      .update({
        verified: isVerified,
        verification_result: verification,
      })
      .eq("id", catch_id);

    return new Response(
      JSON.stringify({ verified: isVerified, result: verification }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("verify-catch error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
