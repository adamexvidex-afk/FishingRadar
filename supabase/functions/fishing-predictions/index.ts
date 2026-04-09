import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Validate JWT - require authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Server-side subscription check
    const subRes = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/check-subscription`, {
      headers: { Authorization: authHeader },
    });
    const subData = await subRes.json();
    if (!subData.subscribed) {
      return new Response(JSON.stringify({ error: "Subscription required" }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    // Input validation - cap lengths to prevent prompt injection
    const location = String(body.location ?? "").slice(0, 200);
    const fish = Array.isArray(body.fish) ? body.fish.slice(0, 10).map((f: unknown) => String(f).slice(0, 100)) : [];
    const conditions = body.conditions && typeof body.conditions === "object" ? body.conditions : {};
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert fishing guide AI. Given real-time water and weather conditions for a specific location, provide precise fishing predictions for each target fish species.

IMPORTANT: Return predictions by calling the provide_predictions tool. Base your predictions on the actual conditions data provided. Be specific and practical.

Guidelines for predictions:
- Depth: Give specific range in meters based on water temp and species behavior
- Lure/Bait: Recommend the single best option given current conditions
- Time: Give a specific 1-2 hour window today based on light, temp, and species feeding patterns
- Zone: Describe the specific water feature or area to target (e.g., "slow pools near submerged rocks", "deep channel bends", "weed edges in 2-3m water")
- Confidence: Rate 1-5 based on how favorable conditions are for this species`;

    const userPrompt = `Location: ${location}
Fish species to predict: ${fish.join(", ")}

Current conditions:
- Water temperature: ${conditions.waterTemp ?? "unknown"}°C
- Air temperature: ${conditions.airTemp ?? "unknown"}°C
- Water flow: ${conditions.flow ?? "unknown"} cfs
- Water level: ${conditions.waterLevel ?? "unknown"} ft
- Pressure: ${conditions.pressure ?? "unknown"} hPa
- Humidity: ${conditions.humidity ?? "unknown"}%
- Moon phase: ${conditions.moonPhase ?? "unknown"} (${conditions.moonIllumination ?? "?"}% illumination)
- Current time: ${new Date().toISOString()}

Provide specific fishing predictions for each species.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_predictions",
              description: "Return structured fishing predictions for each fish species",
              parameters: {
                type: "object",
                properties: {
                  predictions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        fish: { type: "string", description: "Fish species name" },
                        bestDepth: { type: "string", description: "Optimal depth range, e.g. '1.2–2m'" },
                        bestLure: { type: "string", description: "Best lure or bait recommendation" },
                        bestTime: { type: "string", description: "Best fishing time window today, e.g. '17:30–19:00'" },
                        bestZone: { type: "string", description: "Best zone/area description" },
                        confidence: { type: "number", description: "Confidence rating 1-5" },
                        tip: { type: "string", description: "One short pro tip for this species in these conditions" },
                      },
                      required: ["fish", "bestDepth", "bestLure", "bestTime", "bestZone", "confidence"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["predictions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "provide_predictions" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI prediction failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "No predictions returned" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const predictions = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(predictions), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("prediction error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
