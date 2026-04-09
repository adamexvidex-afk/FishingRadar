import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { conditions } = await req.json().catch(() => ({}));
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let conditionContext = "";
    if (conditions) {
      conditionContext = `\nCurrent conditions: Water temp ${conditions.waterTemp ?? "?"}°F, Air temp ${conditions.airTemp ?? "?"}°F, Pressure ${conditions.pressure ?? "?"}hPa, Moon phase ${conditions.moonPhase ?? "?"}.`;
    }

    const today = new Date().toISOString().slice(0, 10);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are a fishing tips expert. Generate ONE short, practical fishing tip for today (${today}). Consider the season and any conditions provided. Format: Return ONLY a JSON object with "title" (max 5 words, catchy) and "body" (max 25 words, actionable advice). No markdown, no code blocks, just raw JSON.`,
          },
          {
            role: "user",
            content: `Generate today's fishing tip.${conditionContext}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI error");
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    let tip = { title: "Cast Smarter Today", body: "Try switching your lure color based on water clarity for better strikes." };
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.title && parsed.body) tip = parsed;
    } catch { /* use default */ }

    return new Response(JSON.stringify(tip), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("daily-tip error:", e);
    return new Response(JSON.stringify({ 
      title: "Cast Smarter Today", 
      body: "Try switching your lure color based on water clarity for better strikes." 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
