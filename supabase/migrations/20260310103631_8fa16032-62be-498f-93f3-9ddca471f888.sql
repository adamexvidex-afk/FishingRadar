
-- Community posts
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  photo_url TEXT,
  location TEXT,
  fish_species TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read posts" ON public.community_posts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own posts" ON public.community_posts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON public.community_posts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON public.community_posts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Post likes
CREATE TABLE public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read likes" ON public.post_likes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own likes" ON public.post_likes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes" ON public.post_likes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Post comments
CREATE TABLE public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read comments" ON public.post_comments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own comments" ON public.post_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.post_comments
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Friendships
CREATE TABLE public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  addressee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own friendships" ON public.friendships
  FOR SELECT TO authenticated USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can send friend requests" ON public.friendships
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update friendships addressed to them" ON public.friendships
  FOR UPDATE TO authenticated USING (auth.uid() = addressee_id);

CREATE POLICY "Users can delete own friendships" ON public.friendships
  FOR DELETE TO authenticated USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Make profiles readable by all authenticated users (for community)
CREATE POLICY "Authenticated users can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- Enable realtime for community
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;
