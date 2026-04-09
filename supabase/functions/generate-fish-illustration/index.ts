import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation helpers
function isValidFishId(id: unknown): id is string {
  return typeof id === 'string' && id.length > 0 && id.length <= 100 && /^[a-zA-Z0-9čšžćđČŠŽĆĐ _-]+$/.test(id);
}

function isValidLatinName(name: unknown): name is string {
  return typeof name === 'string' && name.length > 0 && name.length <= 100 && /^[A-Za-z\s.]+$/.test(name);
}

function isValidDisplayName(name: unknown): name is string {
  return typeof name === 'string' && name.length <= 100;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Authenticate the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { fishId, nameSi, nameEn, latin } = await req.json();

    // Validate inputs
    if (!isValidFishId(fishId)) {
      return new Response(JSON.stringify({ error: "Invalid fishId format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!isValidLatinName(latin)) {
      return new Response(JSON.stringify({ error: "Invalid latin name format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (nameEn && !isValidDisplayName(nameEn)) {
      return new Response(JSON.stringify({ error: "Invalid English name format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (nameSi && !isValidDisplayName(nameSi)) {
      return new Response(JSON.stringify({ error: "Invalid Slovenian name format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("Server configuration error");
    }

    // Sanitize names for prompt (strip any remaining special chars)
    const safeLatin = latin.replace(/[^A-Za-z\s.]/g, '');
    const safeNameEn = (nameEn || '').replace(/[^A-Za-z\s-]/g, '');
    const safeNameSi = (nameSi || '').replace(/[^A-Za-zčšžćđČŠŽĆĐ\s-]/g, '');

    // Generate illustration
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
            content: `Create a beautiful, realistic scientific illustration of the freshwater fish species "${safeLatin}" (${safeNameEn}/${safeNameSi}). The fish should be depicted in a side profile view against a clean white background, in the style of a field guide or encyclopedia illustration. Show natural coloring and anatomical details clearly. No text or labels.`,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!aiRes.ok) {
      throw new Error(`AI generation failed`);
    }

    const aiData = await aiRes.json();
    const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error("No image generated");
    }

    // Extract base64 data
    const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
    const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    // Upload to storage using service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Sanitize fishId for storage key
    const safeId = fishId
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-zA-Z0-9_-]/g, "-");
    const filePath = `${safeId}.png`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("fish-illustrations")
      .upload(filePath, imageBytes, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Upload failed`);
    }

    const { data: publicUrl } = supabaseAdmin.storage
      .from("fish-illustrations")
      .getPublicUrl(filePath);

    return new Response(
      JSON.stringify({ success: true, url: publicUrl.publicUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
