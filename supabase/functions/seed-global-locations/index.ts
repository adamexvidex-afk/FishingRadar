import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// All WMO member countries grouped by region for batch processing
const REGIONS: Record<string, string[]> = {
  'Europe': [
    'Norway','Sweden','Finland','Denmark','Iceland','United Kingdom','Ireland','France','Spain','Portugal',
    'Italy','Germany','Austria','Switzerland','Belgium','Netherlands','Luxembourg','Poland','Czech Republic',
    'Slovakia','Hungary','Romania','Bulgaria','Greece','Croatia','Slovenia','Serbia','Montenegro','Bosnia and Herzegovina',
    'North Macedonia','Albania','Estonia','Latvia','Lithuania','Ukraine','Belarus','Moldova','Malta','Cyprus',
  ],
  'Asia': [
    'Japan','South Korea','China','Taiwan','Thailand','Vietnam','Philippines','Indonesia','Malaysia','India',
    'Sri Lanka','Pakistan','Bangladesh','Nepal','Myanmar','Cambodia','Laos','Mongolia','Kazakhstan','Uzbekistan',
    'Turkmenistan','Kyrgyzstan','Tajikistan','Iran','Iraq','Turkey','Georgia','Armenia','Azerbaijan',
  ],
  'Africa': [
    'South Africa','Kenya','Tanzania','Uganda','Ethiopia','Nigeria','Ghana','Cameroon','Senegal','Morocco',
    'Egypt','Tunisia','Algeria','Mozambique','Madagascar','Zambia','Zimbabwe','Botswana','Namibia','Angola',
    'Democratic Republic of Congo','Republic of Congo','Gabon','Ivory Coast','Mali',
  ],
  'South America': [
    'Brazil','Argentina','Chile','Colombia','Peru','Ecuador','Venezuela','Bolivia','Paraguay','Uruguay',
    'Guyana','Suriname',
  ],
  'Central America & Caribbean': [
    'Mexico','Costa Rica','Panama','Guatemala','Honduras','Belize','Nicaragua','El Salvador',
    'Cuba','Jamaica','Dominican Republic','Trinidad and Tobago','Bahamas','Barbados',
  ],
  'Oceania': [
    'Australia','New Zealand','Papua New Guinea','Fiji','Samoa','Tonga','Vanuatu',
  ],
  'Canada': ['Canada'],
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { region = 'Europe', batch = 0, count = 50 } = await req.json().catch(() => ({}));
    
    const apiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const countries = REGIONS[region];
    if (!countries) {
      return new Response(JSON.stringify({ error: `Unknown region: ${region}. Available: ${Object.keys(REGIONS).join(', ')}` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Pick 2-3 countries per batch
    const startIdx = (batch * 3) % countries.length;
    const batchCountries = [
      countries[startIdx],
      countries[(startIdx + 1) % countries.length],
      countries[(startIdx + 2) % countries.length],
    ].filter((v, i, a) => a.indexOf(v) === i);

    const prompt = `Generate exactly ${count} unique real fishing locations in: ${batchCountries.join(', ')}.

Each location MUST be a real, existing place with accurate GPS coordinates. Include a diverse mix of:
- Lakes, rivers, reservoirs
- Coastal fishing spots, harbors, piers
- Famous fishing destinations
- Lesser-known local favorites

Return a JSON array with exactly ${count} objects:
- "name": full name of the water body or fishing spot (string, in English)
- "lat": latitude (number, 4+ decimal places)
- "lng": longitude (number, 4+ decimal places)
- "category": one of "lake", "river", "reservoir", "pond", "creek", "bay", "ocean", "pier", "stream", "fjord", "canal" (string)
- "species": array of 3-6 fish species commonly caught there, in English (string[])
- "state": region/province/county within the country (string)
- "country": country name (string)

IMPORTANT: Return ONLY the JSON array, no markdown, no explanation. All coordinates must be real-world accurate.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`AI API error: ${response.status} - ${err}`);
    }

    const aiData = await response.json();
    let content = aiData.choices?.[0]?.message?.content || '';
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let locations: any[];
    try {
      locations = JSON.parse(content);
    } catch (e) {
      throw new Error(`Failed to parse AI response: ${content.substring(0, 200)}`);
    }

    if (!Array.isArray(locations)) throw new Error('Response is not an array');

    // Validate
    const valid = locations.filter(l => 
      l.name && typeof l.lat === 'number' && typeof l.lng === 'number' &&
      l.lat >= -90 && l.lat <= 90 && l.lng >= -180 && l.lng <= 180
    );

    // Insert in chunks
    let inserted = 0;
    for (let i = 0; i < valid.length; i += 50) {
      const chunk = valid.slice(i, i + 50).map(l => ({
        name: l.name,
        lat: l.lat,
        lng: l.lng,
        category: l.category || 'lake',
        species: l.species || [],
        state: l.state || null,
        country: l.country || batchCountries[0],
      }));

      const { error } = await supabase.from('fishing_locations').insert(chunk);
      if (error) {
        console.error(`Chunk insert error:`, error.message);
      } else {
        inserted += chunk.length;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      region,
      batch,
      countries: batchCountries,
      generated: locations.length,
      valid: valid.length,
      inserted,
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
