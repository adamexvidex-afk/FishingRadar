import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function batchDelete(supabaseAdmin: any, table: string, column: string, userId: string) {
  // Delete in batches of 500 to avoid statement timeout
  let deleted = 0;
  while (true) {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select("id")
      .eq(column, userId)
      .limit(500);
    
    if (error) {
      console.error(`[DELETE-ACCOUNT] Error selecting from ${table}.${column}:`, error.message);
      break;
    }
    if (!data || data.length === 0) break;
    
    const ids = data.map((r: any) => r.id);
    const { error: delError } = await supabaseAdmin
      .from(table)
      .delete()
      .in("id", ids);
    
    if (delError) {
      console.error(`[DELETE-ACCOUNT] Error batch deleting from ${table}:`, delError.message);
      break;
    }
    deleted += ids.length;
    console.log(`[DELETE-ACCOUNT] Deleted ${deleted} rows from ${table}`);
    
    if (data.length < 500) break;
  }
  return deleted;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !authUser) throw new Error("Auth failed");

    const userId = authUser.id;
    if (!userId) throw new Error("No user ID");

    console.log("[DELETE-ACCOUNT] Deleting all data for user:", userId);

    // Delete assistant messages via conversation IDs first
    const { data: convos } = await supabaseAdmin
      .from("assistant_conversations")
      .select("id")
      .eq("user_id", userId);

    if (convos && convos.length > 0) {
      const convoIds = convos.map((c: any) => c.id);
      // Delete in chunks of 100 conversation ids
      for (let i = 0; i < convoIds.length; i += 100) {
        const chunk = convoIds.slice(i, i + 100);
        await supabaseAdmin.from("assistant_messages").delete().in("conversation_id", chunk);
      }
    }

    // Tables to delete from (order matters for foreign keys)
    const tables = [
      { table: "comment_likes", column: "user_id" },
      { table: "post_likes", column: "user_id" },
      { table: "post_comments", column: "user_id" },
      { table: "community_posts", column: "user_id" },
      { table: "assistant_conversations", column: "user_id" },
      { table: "group_messages", column: "sender_id" },
      { table: "chat_group_members", column: "user_id" },
      { table: "favorite_groups", column: "user_id" },
      { table: "chat_messages", column: "sender_id" },
      { table: "chat_messages", column: "receiver_id" },
      { table: "notifications", column: "user_id" },
      { table: "notifications", column: "actor_id" },
      { table: "friendships", column: "requester_id" },
      { table: "friendships", column: "addressee_id" },
      { table: "catches", column: "user_id" },
      { table: "push_subscriptions", column: "user_id" },
      { table: "profiles", column: "id" },
    ];

    for (const { table, column } of tables) {
      await batchDelete(supabaseAdmin, table, column, userId);
    }

    // Delete user's storage files
    try {
      const { data: catchFiles } = await supabaseAdmin.storage.from("catch-photos").list(userId);
      if (catchFiles && catchFiles.length > 0) {
        const paths = catchFiles.map((f: any) => `${userId}/${f.name}`);
        await supabaseAdmin.storage.from("catch-photos").remove(paths);
      }
    } catch (e) {
      console.error("[DELETE-ACCOUNT] Storage cleanup error:", e);
    }

    try {
      const { data: avatarFiles } = await supabaseAdmin.storage.from("avatars").list(userId);
      if (avatarFiles && avatarFiles.length > 0) {
        const paths = avatarFiles.map((f: any) => `${userId}/${f.name}`);
        await supabaseAdmin.storage.from("avatars").remove(paths);
      }
    } catch (e) {
      console.error("[DELETE-ACCOUNT] Avatars cleanup error:", e);
    }

    // Delete the auth user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error("[DELETE-ACCOUNT] Error deleting auth user:", deleteError.message);
      throw new Error("Failed to delete account");
    }

    console.log("[DELETE-ACCOUNT] Successfully deleted user:", userId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[DELETE-ACCOUNT] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
