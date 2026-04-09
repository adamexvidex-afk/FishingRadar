import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { batchSize = 10 } = await req.json().catch(() => ({}));

    // Find species missing description
    const { data: species, error: fetchErr } = await supabase
      .from('fish_species')
      .select('id, name_en, latin_name, habitat, category, techniques, baits')
      .or('description.is.null,description.eq.')
      .limit(batchSize);

    if (fetchErr) throw fetchErr;
    if (!species || species.length === 0) {
      return new Response(JSON.stringify({ message: 'All species have descriptions', remaining: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not set');

    const results: { name: string; status: string }[] = [];

    for (const fish of species) {
      try {
        const prompt = `You are a fisheries biologist. For the fish species "${fish.name_en}"${fish.latin_name ? ` (${fish.latin_name})` : ''}, provide a concise JSON object with these fields:
- "description": 1-2 sentence species description for anglers (habitat, size, distinguishing features, fishing relevance)

Category: ${fish.category || 'freshwater'}
Known habitat: ${fish.habitat || 'unknown'}

Return ONLY valid JSON, no markdown, no code fences.`;

        const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
          }),
        });

        if (!aiResp.ok) {
          results.push({ name: fish.name_en, status: `AI error: ${aiResp.status}` });
          continue;
        }

        const aiData = await aiResp.json();
        const raw = aiData.choices?.[0]?.message?.content || '';
        const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        const parsed = JSON.parse(cleaned);

        const description = parsed.description;
        if (!description) {
          results.push({ name: fish.name_en, status: 'No description in AI response' });
          continue;
        }

        const { error: updateErr } = await supabase
          .from('fish_species')
          .update({ description })
          .eq('id', fish.id);

        if (updateErr) {
          results.push({ name: fish.name_en, status: `DB error: ${updateErr.message}` });
        } else {
          results.push({ name: fish.name_en, status: 'ok' });
        }
      } catch (e) {
        results.push({ name: fish.name_en, status: `Error: ${e.message}` });
      }
    }

    // Count remaining
    const { count } = await supabase
      .from('fish_species')
      .select('id', { count: 'exact', head: true })
      .or('description.is.null,description.eq.');

    return new Response(JSON.stringify({ results, remaining: count || 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
