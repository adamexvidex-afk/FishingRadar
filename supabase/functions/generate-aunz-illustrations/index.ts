import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { offset = 0, limit = 5 } = await req.json().catch(() => ({}));
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const apiKey = Deno.env.get('LOVABLE_API_KEY')!;

    // Get fish without illustrations
    const { data: fish, error: fetchErr } = await supabase
      .from('fish_species')
      .select('id, name_en, latin_name, category, habitat')
      .is('image_url', null)
      .order('name_en')
      .range(offset, offset + limit - 1);

    if (fetchErr) throw new Error(fetchErr.message);
    if (!fish || fish.length === 0) {
      return new Response(JSON.stringify({ done: true, message: 'No more fish without illustrations' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results: any[] = [];

    for (const f of fish) {
      try {
        const prompt = `Scientific illustration of a ${f.name_en} (${f.latin_name || ''}). Highly detailed naturalist fish illustration in the style of a field guide or encyclopedia plate. Side view showing full body, accurate proportions, fins, scales, and coloration. Clean white background. Watercolor and ink scientific illustration style. Anatomically accurate.`;

        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-image',
            messages: [{ role: 'user', content: prompt }],
            modalities: ['image', 'text'],
          }),
        });

        if (!response.ok) {
          results.push({ name: f.name_en, status: 'ai_error', code: response.status });
          continue;
        }

        const aiData = await response.json();
        const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (!imageUrl) {
          results.push({ name: f.name_en, status: 'no_image' });
          continue;
        }

        // Decode base64 and upload to storage
        const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
        const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        
        const fileName = `${f.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;

        const { error: uploadErr } = await supabase.storage
          .from('fish-illustrations')
          .upload(fileName, imageBytes, { contentType: 'image/png', upsert: true });

        if (uploadErr) {
          results.push({ name: f.name_en, status: 'upload_error', error: uploadErr.message });
          continue;
        }

        const { data: { publicUrl } } = supabase.storage.from('fish-illustrations').getPublicUrl(fileName);

        const { error: updateErr } = await supabase
          .from('fish_species')
          .update({ image_url: publicUrl })
          .eq('id', f.id);

        results.push({ name: f.name_en, status: updateErr ? 'db_error' : 'success', url: publicUrl });
      } catch (e: any) {
        results.push({ name: f.name_en, status: 'error', error: e.message });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      results, 
      nextOffset: offset + limit,
      remaining: fish.length === limit 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
