import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AVATAR_STYLES = [
  "rugged outdoorsman with a beard, wearing a fishing cap, warm smile",
  "young athletic guy with sunglasses pushed up on his head, tan skin",
  "middle-aged man with a goatee wearing a camo baseball cap",
  "clean-shaven guy in his 30s with short brown hair, friendly grin",
  "older gentleman with gray stubble and a weathered fishing hat",
  "young man with curly hair and a snapback hat, big smile",
  "fit guy in his 40s with aviator sunglasses and a polo shirt",
  "bearded man with a trucker hat, squinting in the sun",
  "college-age guy with messy hair and a hoodie",
  "stocky man with a buzz cut and sunburn on his cheeks",
  "tall thin man with glasses and a wide-brimmed sun hat",
  "latino man with dark hair and a warm expression, outdoor setting",
  "black man with a fade haircut and fishing vest, confident smile",
  "red-haired man with freckles wearing a henley shirt",
  "asian-american man with a crew cut and athletic build",
  "man in his 50s with salt-and-pepper hair, kind eyes",
  "young blond guy with a backwards cap and tank top",
  "muscular man with a short beard and flannel shirt",
  "skinny guy with longish hair tucked under a beanie",
  "man with a mustache and cowboy hat, southwestern vibe",
  "guy in his 20s with a clean fade and earbuds around his neck",
  "dad-type guy with reading glasses perched on his nose",
  "man with a shaved head and a big friendly grin",
  "guy with a patchy beard and a north face jacket",
  "surfer-looking dude with wavy sun-bleached hair",
  "man with thick eyebrows and a determined expression",
  "heavyset man with a jolly face and fishing shirt",
  "man with a neatly trimmed beard and plaid shirt",
  "young professional type with styled hair, casual outdoor wear",
  "weathered fisherman with deep tan lines and laugh wrinkles",
  "guy with a military-style haircut and outdoor gear",
  "man with round glasses and a bucket hat",
  "athletic build guy in a dri-fit shirt, outdoors",
  "man in his 60s with white hair and a gentle smile",
  "guy with tattoo sleeves and a trucker cap",
  "man with a wide jaw and five o'clock shadow",
  "slim man with a pencil mustache and vintage feel",
  "man with dimples wearing a quarter-zip pullover",
  "broad-shouldered guy with a crew neck and stubble",
  "man with deep-set eyes and an adventure-ready look",
];

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { offset = 0, limit = 5 } = await req.json().catch(() => ({}));

    const apiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get seed users
    const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 100 });
    const seedUsers = (users || [])
      .filter(u => u.email?.endsWith('@seeduser.fishradar.local'))
      .slice(offset, offset + limit);

    if (seedUsers.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No more users to process', updated: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let updated = 0;
    const results: any[] = [];

    for (let i = 0; i < seedUsers.length; i++) {
      const user = seedUsers[i];
      const styleIndex = (offset + i) % AVATAR_STYLES.length;
      const style = AVATAR_STYLES[styleIndex];

      try {
        // Generate avatar with AI
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-image',
            messages: [{
              role: 'user',
              content: `Generate a profile photo portrait of an American man: ${style}. The photo should be a headshot/shoulders-up portrait with natural lighting, slightly blurred outdoor background. Photorealistic style, warm tones. Square format, suitable as a social media profile picture.`
            }],
            modalities: ['image', 'text'],
          }),
        });

        if (!aiResponse.ok) {
          const errText = await aiResponse.text();
          console.error(`AI error for user ${user.email}:`, aiResponse.status, errText);
          results.push({ email: user.email, error: `AI ${aiResponse.status}` });
          // Add delay to avoid rate limiting
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }

        const aiData = await aiResponse.json();
        const imageData = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (!imageData) {
          results.push({ email: user.email, error: 'No image in response' });
          continue;
        }

        // Extract base64 data
        const base64Match = imageData.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
        if (!base64Match) {
          results.push({ email: user.email, error: 'Invalid image format' });
          continue;
        }

        const imageFormat = base64Match[1];
        const base64Data = base64Match[2];
        const imageBytes = base64ToUint8Array(base64Data);

        // Upload to storage
        const filePath = `seed/${user.id}.${imageFormat}`;
        const { error: uploadErr } = await supabase.storage
          .from('avatars')
          .upload(filePath, imageBytes, {
            contentType: `image/${imageFormat}`,
            upsert: true,
          });

        if (uploadErr) {
          results.push({ email: user.email, error: `Upload: ${uploadErr.message}` });
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        const avatarUrl = urlData.publicUrl;

        // Update profile
        const { error: updateErr } = await supabase
          .from('profiles')
          .update({ avatar_url: avatarUrl })
          .eq('id', user.id);

        if (updateErr) {
          results.push({ email: user.email, error: `Profile: ${updateErr.message}` });
          continue;
        }

        updated++;
        results.push({ email: user.email, success: true });

        // Delay between generations to avoid rate limiting
        if (i < seedUsers.length - 1) {
          await new Promise(r => setTimeout(r, 1500));
        }
      } catch (err: any) {
        results.push({ email: user.email, error: err.message });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      updated,
      total_processed: seedUsers.length,
      offset,
      results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    console.error('Error:', e.message);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
