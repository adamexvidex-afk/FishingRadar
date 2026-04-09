import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 100 });
    const seedUsers = (users || []).filter(u => u.email?.endsWith('@seeduser.fishradar.local'));

    let updated = 0;
    for (let i = 0; i < seedUsers.length; i++) {
      const user = seedUsers[i];
      // Use randomuser.me male portraits (0-99 available)
      const portraitIndex = i % 100;
      const avatarUrl = `https://randomuser.me/api/portraits/men/${portraitIndex}.jpg`;

      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);

      if (error) {
        console.error(`Avatar error for ${user.email}:`, error.message);
      } else {
        updated++;
      }
    }

    return new Response(JSON.stringify({ success: true, updated }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
