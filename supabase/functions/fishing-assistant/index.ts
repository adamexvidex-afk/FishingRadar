import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "npm:stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the FishingRadar AI assistant — an expert on freshwater and saltwater fishing across the United States and worldwide.

RULES:
- You answer EXCLUSIVELY questions about fishing, fish species, fishing gear, techniques, baits, fishing waters, licenses, fishing regulations, and related topics.
- If the user asks anything NOT related to fishing, politely decline and explain that you specialize only in fishing.
- You respond in the language the user asks the question in (English, Spanish, Chinese, etc.).
- Be friendly, knowledgeable, and concise. Use specific, actionable advice.
- When recommending baits or techniques, consider US fishing practices and the user's local conditions.
- Never make up regulations — if you're not sure, clearly say so.
- When a user sends an image of a fish, identify the species by examining its physical characteristics (body shape, fin structure, coloring, markings, mouth shape, scale pattern). Provide:
  1. Common name and scientific name
  2. **Estimated size** — Based on visual proportions, body depth, and any context clues in the image, provide an estimated length range in inches and estimated weight range in pounds (e.g., "Estimated size: ~14-16 inches, ~1.5-2.5 lbs"). Always note this is a visual estimate.
  3. Typical habitat and notable features
  4. If you're not 100% certain, give your best identification with a confidence level and mention similar-looking species.`;

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

    // Inline subscription check (avoids internal HTTP call issues)
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Authentication failed" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userEmail = claimsData.claims.email as string;

    // Admin bypass
    const adminEmail = Deno.env.get("ADMIN_EMAIL") ?? "";
    let isSubscribed = adminEmail && adminEmail === userEmail;

    if (!isSubscribed && userEmail) {
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (stripeKey) {
        const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
        const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
        if (customers.data.length > 0) {
          const subs = await stripe.subscriptions.list({ customer: customers.data[0].id, status: "active", limit: 1 });
          isSubscribed = subs.data.length > 0;
        }
      }
    }

    if (!isSubscribed) {
      return new Response(JSON.stringify({ error: "Subscription required" }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, conditions } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let systemContent = SYSTEM_PROMPT;
    if (conditions) {
      systemContent += `\n\nCURRENT FISHING CONDITIONS (use when recommending baits and techniques):
- Water temperature: ${conditions.waterTemp ?? 'no data'}°F
- Air temperature: ${conditions.airTemp ?? 'no data'}°F
- Flow rate: ${conditions.flow ?? 'no data'} cfs
- Water level: ${conditions.waterLevel ?? 'no data'} ft
- Air pressure: ${conditions.pressure ?? 'no data'} hPa
- Humidity: ${conditions.humidity ?? 'no data'}%
- Moon phase: ${conditions.moonPhase ?? 'no data'} (illumination: ${conditions.moonIllumination ?? 'no data'}%)
- Station: ${conditions.hydroStation ?? 'no data'}
Use this data when recommending baits, techniques, and target species.`;
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Process messages - convert any with image content to multimodal format
    const processedMessages = messages.slice(-20).map((msg: any) => {
      // If message has imageUrl, convert to multimodal content
      if (msg.imageUrl) {
        return {
          role: msg.role,
          content: [
            { type: "text", text: msg.content || "What fish is this? Please identify it." },
            { type: "image_url", image_url: { url: msg.imageUrl } },
          ],
        };
      }
      return { role: msg.role, content: msg.content };
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemContent },
          ...processedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests, please try again in a few seconds." }), {
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
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("fishing-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
