import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CountryConfig {
  country: string;
  regions: string;
  count: number;
  latRange: [number, number];
  lngRange: [number, number];
}

const COUNTRIES: CountryConfig[] = [
  { country: "New Zealand", regions: "North Island (Auckland, Waikato, Bay of Plenty, Wellington, Hawke's Bay, Taranaki, Northland), South Island (Canterbury, Otago, Southland, West Coast, Nelson, Marlborough)", count: 60, latRange: [-47.5, -34], lngRange: [166, 179] },
  { country: "South Africa", regions: "Western Cape, Eastern Cape, KwaZulu-Natal, Limpopo, Mpumalanga, Gauteng, Free State, North West, Northern Cape", count: 50, latRange: [-35, -22], lngRange: [16, 33] },
  { country: "Argentina", regions: "Buenos Aires, Patagonia, Tierra del Fuego, Corrientes, Misiones, Entre Ríos, Neuquén, Río Negro, Chubut, Mendoza", count: 50, latRange: [-55, -22], lngRange: [-73, -53] },
  { country: "Mexico", regions: "Baja California, Sonora, Sinaloa, Veracruz, Quintana Roo, Yucatán, Oaxaca, Jalisco, Guerrero, Chiapas", count: 50, latRange: [14, 33], lngRange: [-118, -86] },
  { country: "Thailand", regions: "Krabi, Phuket, Surat Thani, Chiang Mai, Chiang Rai, Kanchanaburi, Ranong, Nakhon Si Thammarat, Trat, Rayong", count: 40, latRange: [5, 21], lngRange: [97, 106] },
  { country: "Chile", regions: "Valparaíso, Los Lagos, Aysén, Magallanes, Biobío, Araucanía, Atacama, Coquimbo", count: 40, latRange: [-56, -17], lngRange: [-76, -66] },
  { country: "Ireland", regions: "Galway, Kerry, Cork, Donegal, Mayo, Clare, Connemara, Wexford, Waterford", count: 40, latRange: [51, 55.5], lngRange: [-10.5, -5.5] },
  { country: "Costa Rica", regions: "Guanacaste, Puntarenas, Limón, San José, Alajuela", count: 30, latRange: [8, 11.5], lngRange: [-86, -82.5] },
  { country: "Panama", regions: "Bocas del Toro, Chiriquí, Veraguas, Los Santos, Colón, Darién", count: 30, latRange: [7, 9.7], lngRange: [-83, -77] },
  { country: "Kenya", regions: "Mombasa, Lamu, Malindi, Lake Victoria, Lake Turkana, Naivasha, Nakuru", count: 30, latRange: [-5, 5], lngRange: [33, 42] },
  { country: "Tanzania", regions: "Zanzibar, Dar es Salaam, Mafia Island, Lake Victoria, Lake Tanganyika, Rufiji Delta", count: 30, latRange: [-12, -1], lngRange: [29, 41] },
  { country: "Venezuela", regions: "Margarita Island, Los Roques, Mérida, Bolívar, Zulia, Anzoátegui, Sucre", count: 30, latRange: [0.5, 12.5], lngRange: [-73, -59.5] },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { batch = 0 } = await req.json().catch(() => ({}));
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const apiKey = Deno.env.get('LOVABLE_API_KEY')!;

    // Process 1 country per call to stay within timeout
    const start = batch;
    const slice = COUNTRIES.slice(start, start + 1);
    if (slice.length === 0) {

      return new Response(JSON.stringify({ done: true, message: 'All batches complete' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results: any[] = [];

    for (const cfg of slice) {
      const prompt = `Generate exactly ${cfg.count} real fishing locations in ${cfg.country}, specifically across: ${cfg.regions}.
Include a diverse mix of rivers, lakes, reservoirs, dams, estuaries, coastal spots, reefs, harbors, fjords, streams, ponds, and canals as appropriate.
Each MUST be a real, well-known fishing spot with accurate GPS coordinates placed ON or directly adjacent to the water body.
Do NOT generate fictional places. Do NOT cluster multiple points along a single line.
Spread locations evenly across all the listed regions.

Return a JSON array with objects having:
- "name": the real name of the spot (string, no numbered suffixes)
- "lat": latitude (number, 4+ decimal places)
- "lng": longitude (number, 4+ decimal places)
- "category": one of "lake","river","reservoir","pond","canal","bay","ocean","stream","reef","fjord","estuary","dam" (string)
- "species": array of 3-6 fish species commonly caught there (string[])
- "state": region/province/state name (string)

Return ONLY the JSON array, no markdown, no explanation.`;

      try {
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'google/gemini-2.5-flash', messages: [{ role: 'user', content: prompt }], temperature: 0.7 }),
        });

        if (!response.ok) { results.push({ country: cfg.country, error: `AI ${response.status}` }); continue; }

        const aiData = await response.json();
        let content = aiData.choices?.[0]?.message?.content || '';
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        let locations: any[];
        try { locations = JSON.parse(content); } catch { results.push({ country: cfg.country, error: 'JSON parse' }); continue; }
        if (!Array.isArray(locations)) { results.push({ country: cfg.country, error: 'Not array' }); continue; }

        const [minLat, maxLat] = cfg.latRange;
        const [minLng, maxLng] = cfg.lngRange;

        const valid = locations.filter(l =>
          l.name && typeof l.lat === 'number' && typeof l.lng === 'number' &&
          l.lat >= minLat && l.lat <= maxLat && l.lng >= minLng && l.lng <= maxLng &&
          !l.name.match(/- \d+$/)
        );

        const rows = valid.map(l => ({
          name: l.name, lat: l.lat, lng: l.lng,
          category: l.category || 'lake', species: l.species || [],
          state: l.state || '', country: cfg.country,
        }));

        if (rows.length > 0) {
          const { error } = await supabase.from('fishing_locations').insert(rows);
          results.push({ country: cfg.country, inserted: error ? 0 : rows.length, error: error?.message });
        } else {
          results.push({ country: cfg.country, inserted: 0, error: 'No valid locations' });
        }
      } catch (e: any) {
        results.push({ country: cfg.country, error: e.message });
      }
    }

    return new Response(JSON.stringify({ batch, nextBatch: start + 1 < COUNTRIES.length ? batch + 1 : null, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
