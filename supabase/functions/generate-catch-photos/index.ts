import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { limit = 5, offset = 0 } = await req.json().catch(() => ({}));

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('Missing LOVABLE_API_KEY');

    // Get posts without photos
    const { data: posts, error: fetchErr } = await supabase
      .from('community_posts')
      .select('id, fish_species, location, catch_weight, catch_length')
      .is('photo_url', null)
      .not('fish_species', 'is', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (fetchErr) throw fetchErr;
    if (!posts || posts.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No posts to process', processed: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results: { id: string; success: boolean; url?: string; error?: string }[] = [];

    for (const post of posts) {
      try {
        const fish = post.fish_species || 'fish';
        const location = (post.location || '').split(',')[0] || 'a lake';
        const weight = post.catch_weight ? `${post.catch_weight} lbs` : '';
        const length = post.catch_length ? `${post.catch_length} inches` : '';

        const sizeDesc = [weight, length].filter(Boolean).join(', ');

        const prompt = `Generate an ultra-realistic photograph of a freshly caught ${fish}${sizeDesc ? ` (${sizeDesc})` : ''}. The fish is being held by a fisherman's hands near ${location}. Natural outdoor lighting, water or lake visible in the background. The photo looks like it was taken with a smartphone camera — authentic, not staged. No text or watermarks.`;

        const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-image',
            messages: [{ role: 'user', content: prompt }],
            modalities: ['image', 'text'],
          }),
        });

        if (!aiRes.ok) {
          const errText = await aiRes.text();
          results.push({ id: post.id, success: false, error: `AI ${aiRes.status}: ${errText.slice(0, 100)}` });
          continue;
        }

        const aiData = await aiRes.json();
        const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (!imageUrl) {
          results.push({ id: post.id, success: false, error: 'No image generated' });
          continue;
        }

        // Extract base64 and upload
        const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
        const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

        const filePath = `catch-${post.id}.png`;
        const { error: uploadErr } = await supabase.storage
          .from('community-photos')
          .upload(filePath, imageBytes, { contentType: 'image/png', upsert: true });

        if (uploadErr) {
          results.push({ id: post.id, success: false, error: uploadErr.message });
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from('community-photos')
          .getPublicUrl(filePath);

        // Update the post with the photo URL
        const { error: updateErr } = await supabase
          .from('community_posts')
          .update({ photo_url: publicUrlData.publicUrl })
          .eq('id', post.id);

        if (updateErr) {
          results.push({ id: post.id, success: false, error: updateErr.message });
          continue;
        }

        results.push({ id: post.id, success: true, url: publicUrlData.publicUrl });
        console.log(`✅ Generated photo for post ${post.id} (${fish})`);
      } catch (e: any) {
        results.push({ id: post.id, success: false, error: e.message });
        console.error(`❌ Failed for post ${post.id}:`, e.message);
      }
    }

    const successCount = results.filter(r => r.success).length;
    return new Response(JSON.stringify({
      success: true,
      processed: results.length,
      succeeded: successCount,
      failed: results.length - successCount,
      results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('Error:', e.message);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
