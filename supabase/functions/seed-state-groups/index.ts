import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function genCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let c = "";
  for (let i = 0; i < 8; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

const STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming"
];

// Fishing messages templates - will randomly combine
const MESSAGES = [
  "Anyone been out this week? The bite has been great! 🎣",
  "Just landed a nice bass at the lake today, couldn't believe the size!",
  "Water temps are rising, time to switch to topwater lures 💪",
  "Who's heading out this weekend? Looking for a fishing buddy",
  "The crappie have been hitting like crazy near the dam",
  "Caught my PB today! 6.5 lb largemouth, what a fight! 🐟",
  "New to the area, where are the best spots around here?",
  "Tight lines everyone! Had an amazing day on the water today",
  "Morning bite was insane, 15 fish before 9am",
  "Anyone tried the new soft plastics from Berkley? They're fire 🔥",
  "River levels are perfect right now, get out there!",
  "Walleye are stacking up near the points, use jigs tipped with minnows",
  "Beautiful sunrise on the lake this morning. Fish weren't biting but who cares 😂",
  "Pro tip: switch to fluorocarbon in clear water, makes a huge difference",
  "The catfish bite has been off the charts this month",
  "Fly fishing season is officially here! Can't wait to hit the streams",
  "Just got my new rod setup, can't wait to test it out this weekend",
  "Trout stocking happened yesterday, the ponds are loaded!",
  "Does anyone fish at night here? The bass go crazy after dark",
  "Share your best catches from this month! Let's see those trophies 🏆",
  "Weather looks perfect for the next few days, time to hit the water",
  "That cold front pushed the fish deep, try drop shots around 15-20ft",
  "Found a honey hole yesterday, 20+ fish in 2 hours!",
  "Reminder: catch and release keeps our fisheries healthy 🙏",
  "The bluegill spawn is on! Great time to take kids fishing",
  "Anyone else love night fishing? The peace and quiet is unmatched",
  "Just upgraded to braided line, what a difference in sensitivity",
  "Pike are crushing swimbaits near the weed edges right now",
  "Early morning is the best time, get there before sunrise",
  "Had a great day mentoring a new angler today. Pass it on! 🎣",
  "Smallmouth are on fire in the rivers right now",
  "Check the regulations before you head out, they just updated!",
  "The stripers are running! Who's been on the water?",
  "Lost a monster today... the one that got away 😤",
  "Kayak fishing is the way to go for these backwater spots",
  "Ice is finally out! Open water season begins 🎉",
  "Topwater blowups at sunset are the best thing in fishing",
  "Caught and released a beautiful rainbow trout today 🌈",
  "The perch are schooling up, drop your jigs and hang on!",
  "Nothing beats fresh fried fish from your own catch 🍳",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Get all seed users (non-real users - ones without auth entries typically have seeded profiles)
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("id, username")
    .not("username", "is", null)
    .order("created_at", { ascending: true })
    .limit(40);

  if (!allProfiles || allProfiles.length < 5) {
    return new Response(JSON.stringify({ error: "Not enough seed users" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }

  const seedUsers = allProfiles;
  let groupsCreated = 0;
  let messagesCreated = 0;

  for (const state of STATES) {
    const groupName = `${state} Fishing`;

    // Check if group already exists
    const { data: existing } = await supabase
      .from("chat_groups")
      .select("id")
      .eq("name", groupName)
      .maybeSingle();

    if (existing) continue;

    // Pick a random seed user as creator
    const creatorIdx = Math.floor(Math.random() * seedUsers.length);
    const creator = seedUsers[creatorIdx];

    // Create the group
    const { data: group, error: groupErr } = await supabase
      .from("chat_groups")
      .insert({
        name: groupName,
        creator_id: creator.id,
        is_public: true,
        invite_code: genCode(),
      })
      .select()
      .single();

    if (groupErr || !group) {
      console.error(`Failed to create group ${groupName}:`, groupErr);
      continue;
    }
    groupsCreated++;

    // Add 8-20 random members (including creator as leader)
    const memberCount = 8 + Math.floor(Math.random() * 13);
    const shuffled = [...seedUsers].sort(() => Math.random() - 0.5);
    const members = shuffled.slice(0, memberCount);

    // Ensure creator is in the list
    if (!members.find(m => m.id === creator.id)) {
      members[0] = creator;
    }

    const memberInserts = members.map(m => ({
      group_id: group.id,
      user_id: m.id,
      role: m.id === creator.id ? "leader" : "member",
      status: "accepted",
    }));

    await supabase.from("chat_group_members").insert(memberInserts);

    // Add 5-15 messages from random members, spread over last 7 days
    const msgCount = 5 + Math.floor(Math.random() * 11);
    const now = Date.now();
    const shuffledMsgs = [...MESSAGES].sort(() => Math.random() - 0.5);

    const msgInserts = [];
    for (let i = 0; i < msgCount; i++) {
      const sender = members[Math.floor(Math.random() * members.length)];
      const hoursAgo = Math.floor(Math.random() * 168); // last 7 days
      const ts = new Date(now - hoursAgo * 3600000).toISOString();

      msgInserts.push({
        group_id: group.id,
        sender_id: sender.id,
        content: shuffledMsgs[i % shuffledMsgs.length],
        created_at: ts,
      });
    }

    await supabase.from("group_messages").insert(msgInserts);
    messagesCreated += msgCount;
  }

  return new Response(
    JSON.stringify({ success: true, groupsCreated, messagesCreated }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
