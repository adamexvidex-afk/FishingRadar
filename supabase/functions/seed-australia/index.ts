import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const apiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const regions = [
      { name: "New South Wales, Australian Capital Territory", count: 50 },
      { name: "Victoria, Tasmania", count: 50 },
      { name: "Queensland", count: 50 },
      { name: "Western Australia, South Australia, Northern Territory", count: 50 },
    ];

    let totalInserted = 0;

    for (const region of regions) {
      const prompt = `Generate exactly ${region.count} real fishing locations in Australia, specifically in: ${region.name}.
Include rivers, lakes, dams, estuaries, coastal spots, reefs, harbors, and rock fishing marks.
Each must be a real place with accurate coordinates.

Return a JSON array with objects having:
- "name": full name (string)
- "lat": latitude (number, 4+ decimals, negative for southern hemisphere)
- "lng": longitude (number, 4+ decimals)
- "category": one of "lake","river","reservoir","pond","bay","ocean","stream","reef" (string)
- "species": array of 3-6 fish species commonly caught there (string[])
- "state": Australian state/territory name (string)

Return ONLY the JSON array, no markdown.`;

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'google/gemini-2.5-flash', messages: [{ role: 'user', content: prompt }], temperature: 0.8 }),
      });

      if (!response.ok) continue;
      const aiData = await response.json();
      let content = aiData.choices?.[0]?.message?.content || '';
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      let locations: any[];
      try { locations = JSON.parse(content); } catch { continue; }
      if (!Array.isArray(locations)) continue;

      const valid = locations.filter(l =>
        l.name && typeof l.lat === 'number' && typeof l.lng === 'number' &&
        l.lat >= -45 && l.lat <= -10 && l.lng >= 110 && l.lng <= 155
      );

      for (const l of valid) {
        const { error } = await supabase.from('fishing_locations').insert({
          name: l.name, lat: l.lat, lng: l.lng,
          category: l.category || 'lake', species: l.species || [],
          state: l.state || region.name, country: 'Australia',
        });
        if (!error) totalInserted++;
      }
    }

    return new Response(JSON.stringify({ success: true, inserted: totalInserted }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
