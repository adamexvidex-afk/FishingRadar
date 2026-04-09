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
      { name: "Bavaria, Baden-Württemberg", count: 50 },
      { name: "North Rhine-Westphalia, Lower Saxony, Schleswig-Holstein", count: 50 },
      { name: "Brandenburg, Mecklenburg-Vorpommern, Berlin, Saxony", count: 50 },
    ];

    let totalInserted = 0;

    for (const region of regions) {
      const prompt = `Generate exactly ${region.count} real fishing locations in Germany, specifically in: ${region.name}.
Include rivers, lakes, reservoirs, canals, ponds, and Baltic/North Sea coastal spots.
Each must be a real place with accurate coordinates.

Return a JSON array with objects having:
- "name": full name (string)
- "lat": latitude (number, 4+ decimals)
- "lng": longitude (number, 4+ decimals)
- "category": one of "lake","river","reservoir","pond","canal","bay","ocean","stream" (string)
- "species": array of 3-6 fish species commonly caught there (string[])
- "state": German Bundesland name (string)

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
        l.lat >= 47 && l.lat <= 55.5 && l.lng >= 5.5 && l.lng <= 15.5
      );

      for (const l of valid) {
        const { error } = await supabase.from('fishing_locations').insert({
          name: l.name, lat: l.lat, lng: l.lng,
          category: l.category || 'lake', species: l.species || [],
          state: l.state || region.name, country: 'Germany',
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
