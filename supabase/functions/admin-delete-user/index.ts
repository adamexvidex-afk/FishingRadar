import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { user_ids } = await req.json();
    if (!user_ids || !Array.isArray(user_ids)) throw new Error("Missing user_ids array");

    const results: any[] = [];

    for (const uid of user_ids) {
      console.log(`Deleting ${uid}...`);

      // Delete assistant messages
      const { data: convos } = await supabaseAdmin.from("assistant_conversations").select("id").eq("user_id", uid);
      if (convos?.length) {
        await supabaseAdmin.from("assistant_messages").delete().in("conversation_id", convos.map((c: any) => c.id));
      }

      const tables = [
        ["comment_likes", "user_id"], ["post_likes", "user_id"], ["post_comments", "user_id"],
        ["community_posts", "user_id"], ["assistant_conversations", "user_id"],
        ["group_messages", "sender_id"], ["chat_group_members", "user_id"],
        ["favorite_groups", "user_id"], ["chat_messages", "sender_id"], ["chat_messages", "receiver_id"],
        ["notifications", "user_id"], ["notifications", "actor_id"],
        ["friendships", "requester_id"], ["friendships", "addressee_id"],
        ["catches", "user_id"], ["push_subscriptions", "user_id"], ["profiles", "id"],
      ];

      for (const [table, col] of tables) {
        const { error } = await supabaseAdmin.from(table).delete().eq(col, uid);
        if (error) console.error(`  ${table}.${col}: ${error.message}`);
      }

      const { error } = await supabaseAdmin.auth.admin.deleteUser(uid);
      results.push({ uid, success: !error, error: error?.message });
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
