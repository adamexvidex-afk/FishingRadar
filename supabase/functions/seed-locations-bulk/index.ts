import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { country, regions, count = 40, latRange, lngRange } = await req.json();
    
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const apiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const prompt = `Generate exactly ${count} real fishing locations in ${country}, specifically in: ${regions}.
Include rivers, lakes, reservoirs, coastal spots, streams, ponds, canals.
Each must be a real place with accurate coordinates.

Return a JSON array. Each object: "name" (string), "lat" (number), "lng" (number), "category" (string: lake/river/reservoir/pond/canal/bay/ocean/stream), "species" (string[] of 3-5 fish), "state" (string: region name).
Return ONLY the JSON array.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'google/gemini-2.5-flash', messages: [{ role: 'user', content: prompt }], temperature: 0.8 }),
    });

    if (!response.ok) throw new Error(`AI error: ${response.status}`);

    const aiData = await response.json();
    let content = aiData.choices?.[0]?.message?.content || '';
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const locations = JSON.parse(content);
    if (!Array.isArray(locations)) throw new Error('Not array');

    const [minLat, maxLat] = latRange;
    const [minLng, maxLng] = lngRange;
    
    const rows = locations
      .filter(l => l.name && typeof l.lat === 'number' && typeof l.lng === 'number' &&
        l.lat >= minLat && l.lat <= maxLat && l.lng >= minLng && l.lng <= maxLng)
      .map(l => ({
        name: l.name, lat: l.lat, lng: l.lng,
        category: l.category || 'lake', species: l.species || [],
        state: l.state || regions, country,
      }));

    let inserted = 0;
    if (rows.length > 0) {
      const { error, count: cnt } = await supabase.from('fishing_locations').insert(rows);
      inserted = error ? 0 : rows.length;
      if (error) throw new Error(`Insert: ${error.message}`);
    }

    return new Response(JSON.stringify({ success: true, country, regions, inserted }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
