import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SEED_USERS = [
  'Jake Thompson', 'Mike Rodriguez', 'Sarah Mitchell', 'Chris Anderson', 'Emily Davis',
  'Brandon Lee', 'Jessica Martinez', 'Tyler Wilson', 'Amanda Clark', 'Ryan Baker',
  'Ashley Johnson', 'Cody Nelson', 'Megan Wright', 'Dustin Harris', 'Brittany Young',
  'Travis King', 'Samantha Scott', 'Kyle Green', 'Lauren Hall', 'Derek Adams',
  'Kayla Turner', 'Nathan Phillips', 'Haley Campbell', 'Justin Parker', 'Rachel Evans',
  'Austin Edwards', 'Stephanie Collins', 'Brent Stewart', 'Chelsea Morris', 'Shane Rogers',
  'Tiffany Reed', 'Zach Cook', 'Nicole Morgan', 'Hunter Bell', 'Amber Murphy',
  'Blake Bailey', 'Courtney Rivera', 'Dalton Cooper', 'Heather Richardson', 'Grant Cox',
];

const FISH_SPECIES = [
  'Largemouth Bass', 'Smallmouth Bass', 'Bluegill', 'Channel Catfish', 'Crappie',
  'Walleye', 'Rainbow Trout', 'Brown Trout', 'Northern Pike', 'Muskie',
  'Striped Bass', 'Redfish', 'Yellow Perch', 'Flathead Catfish', 'Common Carp',
];

const BAITS = [
  'Worm', 'Crankbait', 'Spinnerbait', 'Jig', 'Soft Plastic', 'Topwater',
  'Live Minnow', 'PowerBait', 'Buzzbait', 'Swim Jig', 'Texas Rig', 'Drop Shot',
];

const TECHNIQUES = [
  'Casting', 'Trolling', 'Fly Fishing', 'Bottom Fishing', 'Jigging', 'Spinning',
];

const WATERS = [
  { name: 'Lake Okeechobee', state: 'Florida' },
  { name: 'Lake Fork', state: 'Texas' },
  { name: 'Dale Hollow Lake', state: 'Tennessee' },
  { name: 'Kentucky Lake', state: 'Kentucky' },
  { name: 'Lake Erie', state: 'Ohio' },
  { name: 'Table Rock Lake', state: 'Missouri' },
  { name: 'Lake Champlain', state: 'Vermont' },
  { name: 'Sam Rayburn Reservoir', state: 'Texas' },
  { name: 'Lake Guntersville', state: 'Alabama' },
  { name: 'Mille Lacs Lake', state: 'Minnesota' },
  { name: 'Chesapeake Bay', state: 'Maryland' },
  { name: 'Clear Lake', state: 'California' },
  { name: 'Lake St. Clair', state: 'Michigan' },
  { name: 'Green River', state: 'Utah' },
  { name: 'Columbia River', state: 'Oregon' },
  { name: 'Pickwick Lake', state: 'Alabama' },
  { name: 'Lake Seminole', state: 'Georgia' },
  { name: 'Devils Lake', state: 'North Dakota' },
  { name: 'Susquehanna River', state: 'Pennsylvania' },
  { name: 'Lake Havasu', state: 'Arizona' },
];

const POST_TEMPLATES = [
  "Just pulled this beauty out of {water}! {fish} on a {bait}. What a fight!",
  "Morning session at {water} paid off big time. {fish} hit the {bait} hard.",
  "Personal best {fish} today at {water}! {weight} lbs, caught on {bait}.",
  "Beautiful day on {water}. Landed a solid {fish} using {technique}.",
  "First time fishing {water} and already hooked a nice {fish}!",
  "Sunset bite was on fire at {water}. {fish} were stacked up!",
  "Caught and released this gorgeous {fish} at {water}. {technique} for the win.",
  "The {bait} has been absolute money lately. Another solid {fish} from {water}.",
  "After a slow morning, finally connected with a {fish} at {water}. Worth the wait!",
  "Weekend trip to {water} was a success. Multiple {fish} on {bait}.",
  "Can't believe the size of this {fish}! {water} never disappoints.",
  "Tight lines at {water} today. {fish} on {technique} — doesn't get better than this.",
  "Early bird gets the {fish}! Dawn patrol at {water} 🎣",
  "My buddy said {water} was dead this time of year… proved him wrong with this {fish}!",
  "New PB {fish} from {water}! {weight} lbs on a {bait}. Still shaking!",
];

const COMMENT_TEMPLATES = [
  "Nice catch! 🔥", "That's a hog! What depth were you fishing?",
  "Awesome! I need to get out to {water} soon.", "Beast mode! 💪",
  "What line were you using?", "Solid fish! Love that spot.",
  "Jealous! I've been striking out lately.", "That's a beauty right there!",
  "Tight lines! 🎣", "How's the water temp been out there?",
  "Man, I gotta try that {bait}.", "Great catch! What time did you hook it?",
  "That's a tank! Congrats!", "Love fishing {water}. Great spot.",
  "Added to my bucket list! 🐟", "That color pattern is incredible!",
];

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randRange(min: number, max: number): number { return +(min + Math.random() * (max - min)).toFixed(1); }

function getSizeForFish(fish: string): { weight: number; length: number } {
  const sizes: Record<string, { wMin: number; wMax: number; lMin: number; lMax: number }> = {
    'Largemouth Bass': { wMin: 1.5, wMax: 10, lMin: 12, lMax: 24 },
    'Smallmouth Bass': { wMin: 1, wMax: 6, lMin: 10, lMax: 20 },
    'Bluegill': { wMin: 0.2, wMax: 1.5, lMin: 5, lMax: 11 },
    'Channel Catfish': { wMin: 2, wMax: 25, lMin: 14, lMax: 36 },
    'Crappie': { wMin: 0.3, wMax: 3, lMin: 7, lMax: 16 },
    'Walleye': { wMin: 1.5, wMax: 12, lMin: 14, lMax: 30 },
    'Rainbow Trout': { wMin: 1, wMax: 8, lMin: 10, lMax: 26 },
    'Brown Trout': { wMin: 1, wMax: 12, lMin: 10, lMax: 28 },
    'Northern Pike': { wMin: 3, wMax: 20, lMin: 20, lMax: 40 },
    'Muskie': { wMin: 5, wMax: 30, lMin: 28, lMax: 50 },
    'Striped Bass': { wMin: 3, wMax: 30, lMin: 18, lMax: 40 },
    'Redfish': { wMin: 2, wMax: 15, lMin: 16, lMax: 34 },
    'Yellow Perch': { wMin: 0.3, wMax: 2, lMin: 6, lMax: 14 },
    'Flathead Catfish': { wMin: 5, wMax: 50, lMin: 20, lMax: 48 },
    'Common Carp': { wMin: 3, wMax: 25, lMin: 16, lMax: 36 },
  };
  const s = sizes[fish] || { wMin: 1, wMax: 10, lMin: 10, lMax: 24 };
  return { weight: randRange(s.wMin, s.wMax), length: randRange(s.lMin, s.lMax) };
}

function recentDate(): string {
  const daysAgo = Math.floor(Math.random() * Math.random() * 90);
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(Math.floor(5 + Math.random() * 14), Math.floor(Math.random() * 60));
  return d.toISOString();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // --- 1. Create auth users + profiles ---
    const userIds: string[] = [];
    
    for (const name of SEED_USERS) {
      const slug = name.toLowerCase().replace(/\s+/g, '.');
      const email = `${slug}@seeduser.fishradar.local`;
      
      // Create auth user via admin API
      const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
        email,
        password: `SeedPass_${slug}_2026!`,
        email_confirm: true,
        user_metadata: { full_name: name },
      });

      if (authErr) {
        // User might already exist, try to find them
        const { data: listData } = await supabase.auth.admin.listUsers();
        const existing = listData?.users?.find(u => u.email === email);
        if (existing) {
          userIds.push(existing.id);
          continue;
        }
        console.error(`Auth user error for ${name}:`, authErr.message);
        continue;
      }

      const userId = authUser.user.id;
      userIds.push(userId);

      // Update profile with username
      await supabase.from('profiles').update({ username: name }).eq('id', userId);
    }

    if (userIds.length === 0) throw new Error('No users created');

    // --- 2. Create community posts (80) ---
    const posts: any[] = [];
    const postIds: string[] = [];
    for (let i = 0; i < 80; i++) {
      const userId = rand(userIds);
      const fish = rand(FISH_SPECIES);
      const bait = rand(BAITS);
      const technique = rand(TECHNIQUES);
      const water = rand(WATERS);
      const { weight, length } = getSizeForFish(fish);
      const template = rand(POST_TEMPLATES);
      const content = template
        .replace(/{fish}/g, fish)
        .replace(/{bait}/g, bait)
        .replace(/{technique}/g, technique)
        .replace(/{water}/g, water.name)
        .replace(/{weight}/g, String(weight));

      const postId = crypto.randomUUID();
      postIds.push(postId);
      const created = recentDate();

      posts.push({
        id: postId,
        user_id: userId,
        content,
        fish_species: fish,
        location: `${water.name}, ${water.state}`,
        catch_weight: weight,
        catch_length: length,
        catch_bait: bait,
        created_at: created,
        updated_at: created,
      });
    }

    for (let i = 0; i < posts.length; i += 25) {
      const { error } = await supabase.from('community_posts').insert(posts.slice(i, i + 25));
      if (error) console.error(`Posts chunk error:`, error.message);
    }

    // --- 3. Create catches (80) ---
    const catches: any[] = [];
    for (let i = 0; i < 80; i++) {
      const userId = rand(userIds);
      const fish = rand(FISH_SPECIES);
      const bait = rand(BAITS);
      const technique = rand(TECHNIQUES);
      const water = rand(WATERS);
      const { weight, length } = getSizeForFish(fish);
      const daysAgo = Math.floor(Math.random() * Math.random() * 90);
      const catchDate = new Date();
      catchDate.setDate(catchDate.getDate() - daysAgo);

      catches.push({
        user_id: userId,
        fish,
        weight,
        length,
        bait,
        technique,
        water: `${water.name}, ${water.state}`,
        catch_date: catchDate.toISOString().split('T')[0],
        is_public: Math.random() > 0.15,
        verified: true,
        notes: '',
        created_at: recentDate(),
      });
    }

    for (let i = 0; i < catches.length; i += 25) {
      const { error } = await supabase.from('catches').insert(catches.slice(i, i + 25));
      if (error) console.error(`Catches chunk error:`, error.message);
    }

    // --- 4. Create comments (60) ---
    const comments: any[] = [];
    for (let i = 0; i < 60; i++) {
      const postId = rand(postIds);
      const userId = rand(userIds);
      const post = posts.find(p => p.id === postId);
      const template = rand(COMMENT_TEMPLATES);
      const content = template
        .replace(/{water}/g, post?.location?.split(',')[0] || 'the lake')
        .replace(/{bait}/g, post?.catch_bait || 'that bait');

      const postDate = new Date(post?.created_at || Date.now());
      const commentDate = new Date(postDate.getTime() + Math.random() * 3 * 86400000);
      if (commentDate > new Date()) commentDate.setTime(Date.now() - Math.random() * 3600000);

      comments.push({
        post_id: postId,
        user_id: userId,
        content,
        created_at: commentDate.toISOString(),
      });
    }

    for (let i = 0; i < comments.length; i += 25) {
      const { error } = await supabase.from('post_comments').insert(comments.slice(i, i + 25));
      if (error) console.error(`Comments chunk error:`, error.message);
    }

    // --- 5. Add likes ---
    const likes: any[] = [];
    const likeSet = new Set<string>();
    for (let i = 0; i < 150; i++) {
      const postId = rand(postIds);
      const userId = rand(userIds);
      const key = `${postId}-${userId}`;
      if (likeSet.has(key)) continue;
      likeSet.add(key);
      likes.push({ post_id: postId, user_id: userId });
    }

    for (let i = 0; i < likes.length; i += 25) {
      const { error } = await supabase.from('post_likes').insert(likes.slice(i, i + 25));
      if (error) console.error(`Likes chunk error:`, error.message);
    }

    return new Response(JSON.stringify({
      success: true,
      users: userIds.length,
      posts: posts.length,
      catches: catches.length,
      comments: comments.length,
      likes: likes.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    console.error('Seed error:', e.message);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
