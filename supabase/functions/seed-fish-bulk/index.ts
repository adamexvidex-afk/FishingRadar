import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { batch = 0, count = 15 } = await req.json().catch(() => ({}));

    const apiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get existing species names to avoid duplicates
    const { data: existing } = await supabase
      .from('fish_species')
      .select('name_en');
    const existingNames = new Set((existing || []).map(e => e.name_en.toLowerCase()));
    const existingCount = existingNames.size;

    // Send a sample of existing names to help AI avoid duplicates
    const sampleNames = Array.from(existingNames).sort(() => Math.random() - 0.5).slice(0, 300).join(', ');

    const categories = [
      'freshwater game fish (bass, trout, salmon, pike, walleye, muskie varieties)',
      'saltwater game fish (tuna, marlin, sailfish, tarpon, wahoo, mahi-mahi)',
      'panfish and sunfish (bluegill, pumpkinseed, redear, green sunfish, longear)',
      'catfish and bullheads (channel, blue, flathead, bullheads, madtoms)',
      'minnows and shiners (golden shiner, fathead minnow, creek chub, dace)',
      'darters (snail darter, rainbow darter, johnny darter, fantail darter)',
      'suckers (white sucker, longnose sucker, hog sucker, redhorse)',
      'sculpins and madtoms (mottled sculpin, slimy sculpin, various madtoms)',
      'marine reef fish (grouper, snapper, triggerfish, parrotfish, wrasse, angelfish)',
      'flatfish (flounder, sole, halibut, plaice, turbot)',
      'sharks and rays (blacktip, nurse, bull shark, stingray, skate)',
      'eels and lampreys (American eel, moray, lamprey species)',
      'herring and shad (American shad, alewife, menhaden, anchovy)',
      'drum and croaker (red drum, black drum, croaker, spot, seatrout)',
      'gobies, blennies, and small marine fish',
    ];
    const focusCategory = categories[batch % categories.length];

    const prompt = `Generate exactly ${count} unique real fish species found in United States waters. 
Focus this batch on: ${focusCategory}
Each MUST be a real species with correct common name and scientific name.
Do NOT include any of these existing species: ${sampleNames}

Return a JSON array of objects with these fields:
- "name_en": common English name (unique, string)
- "latin_name": scientific Latin name (string)
- "description": 2-3 sentences about the fish (string)
- "habitat": habitat description (string)
- "techniques": 2-4 fishing techniques (string array)
- "baits": 2-4 effective baits (string array)
- "min_size": typical size range (string)
- "protection": regulations or "None" (string)
- "category": "freshwater", "saltwater", or "brackish" (string)

Return ONLY the JSON array.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`AI API error: ${response.status} - ${err}`);
    }

    const aiData = await response.json();
    let content = aiData.choices?.[0]?.message?.content || '';
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let species: any[];
    try {
      species = JSON.parse(content);
    } catch (e) {
      throw new Error(`Failed to parse AI response: ${content.substring(0, 300)}`);
    }

    if (!Array.isArray(species)) throw new Error('Response is not an array');

    // Filter out duplicates
    const newSpecies = species.filter(s => s.name_en && !existingNames.has(s.name_en.toLowerCase()));

    // Insert one by one to skip duplicates gracefully
    let inserted = 0;
    for (const s of newSpecies) {
      const { error } = await supabase.from('fish_species').insert({
        name_en: s.name_en,
        latin_name: s.latin_name || null,
        description: s.description || null,
        habitat: s.habitat || null,
        techniques: s.techniques || [],
        baits: s.baits || [],
        min_size: s.min_size || null,
        protection: s.protection || null,
        category: s.category || 'freshwater',
      });
      if (!error) inserted++;
    }

    return new Response(JSON.stringify({
      success: true,
      batch,
      generated: species.length,
      inserted,
      existing_total: existingCount + inserted,
      filtered_duplicates: species.length - newSpecies.length,
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
