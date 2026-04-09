import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
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

    const { catches } = await req.json();

    if (!catches || !Array.isArray(catches)) {
      return new Response(JSON.stringify({ error: "catches array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build a summary of the user's catches
    const totalCatches = catches.length;
    const speciesMap: Record<string, number> = {};
    const baitMap: Record<string, number> = {};
    const monthMap: Record<string, number> = {};
    let totalLength = 0;
    let totalWeight = 0;
    let maxLength = 0;
    let maxWeight = 0;
    let maxLengthFish = "";
    let maxWeightFish = "";

    for (const c of catches) {
      speciesMap[c.fish] = (speciesMap[c.fish] || 0) + 1;
      if (c.bait) baitMap[c.bait] = (baitMap[c.bait] || 0) + 1;
      const month = c.catch_date?.slice(0, 7);
      if (month) monthMap[month] = (monthMap[month] || 0) + 1;
      totalLength += c.length || 0;
      totalWeight += c.weight || 0;
      if ((c.length || 0) > maxLength) { maxLength = c.length; maxLengthFish = c.fish; }
      if ((c.weight || 0) > maxWeight) { maxWeight = c.weight; maxWeightFish = c.fish; }
    }

    const topSpecies = Object.entries(speciesMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topBaits = Object.entries(baitMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const avgLengthIn = totalCatches > 0 ? (totalLength / totalCatches / 2.54).toFixed(1) : 0;
    const avgWeightLb = totalCatches > 0 ? (totalWeight / totalCatches * 2.205).toFixed(2) : 0;
    const maxLengthIn = (maxLength / 2.54).toFixed(1);
    const maxWeightLb = (maxWeight * 2.205).toFixed(1);

    const summary = `Fishing catch data summary:
- Total catches: ${totalCatches}
- Species caught: ${Object.keys(speciesMap).length} unique species
- Top species: ${topSpecies.map(([name, count]) => `${name} (${count})`).join(", ")}
- Top baits: ${topBaits.map(([name, count]) => `${name} (${count})`).join(", ")}
- Average length: ${avgLengthIn} in, Average weight: ${avgWeightLb} lb
- Longest catch: ${maxLengthIn} in (${maxLengthFish})
- Heaviest catch: ${maxWeightLb} lb (${maxWeightFish})
- Monthly activity: ${Object.entries(monthMap).sort().map(([m, c]) => `${m}: ${c}`).join(", ")}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are FishingRadar's AI coach. Analyze the angler's catch data and provide a SHORT, encouraging analysis (max 3-4 sentences). All measurements are in US units (inches, pounds). Include:
1. A positive observation about their fishing (e.g. "Great job!" or "Impressive diversity!")
2. One specific actionable tip based on their data
3. A motivational closing line

Keep it personal, warm, and specific to their data. Use fishing emoji sparingly (🎣🐟🏆). Do NOT use markdown headers or bullet points. Write in a natural, conversational paragraph style.`,
          },
          { role: "user", content: summary },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI service error");
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "Keep fishing and logging your catches! 🎣";

    return new Response(JSON.stringify({ analysis: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("catch-analysis error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
