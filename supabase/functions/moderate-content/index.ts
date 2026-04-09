// Content moderation edge function
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
    const { content } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return new Response(
        JSON.stringify({ allowed: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Limit content length for moderation
    const text = content.slice(0, 2000);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      // If no API key, allow content (fail open) but log warning
      console.warn("LOVABLE_API_KEY not configured, skipping moderation");
      return new Response(
        JSON.stringify({ allowed: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
            content: `You are a content moderation system for a fishing community app. Your job is to detect harmful content.

Flag content that contains:
- Racism, racial slurs, or racial discrimination
- Homophobia, transphobia, or anti-LGBTQ+ language
- Sexism or misogyny
- Hate speech targeting any group (religion, ethnicity, nationality, disability)
- Violent threats or encouragement of violence
- Severe bullying or harassment
- Slurs or derogatory terms for any group

Do NOT flag:
- Normal fishing discussions, even if they mention killing/catching fish
- Mild profanity not directed at a group
- Disagreements or debates about fishing techniques
- Competitive banter between anglers

Respond with ONLY a JSON object, nothing else:
{"flagged": true/false, "reason": "brief reason if flagged, empty string if not"}`,
          },
          {
            role: "user",
            content: `Moderate this content:\n\n"${text}"`,
          },
        ],
        temperature: 0,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      // Fail open on other errors
      console.error("Moderation API error:", response.status);
      return new Response(
        JSON.stringify({ allowed: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content || "";

    // Parse AI response
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return new Response(
          JSON.stringify({
            allowed: !result.flagged,
            reason: result.reason || "",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch {
      // If parsing fails, allow content
    }

    return new Response(
      JSON.stringify({ allowed: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Moderation error:", error);
    return new Response(
      JSON.stringify({ allowed: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
