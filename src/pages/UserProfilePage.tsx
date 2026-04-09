import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft, UserPlus, UserCheck, Clock, Heart, MessageCircle, Fish, MapPin, Ruler, Weight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import PremiumCrown from '@/components/PremiumCrown';

interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  is_premium?: boolean;
}

interface Post {
  id: string;
  content: string;
  photo_url: string | null;
  location: string | null;
  fish_species: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
}

interface PublicCatch {
  id: string;
  fish: string;
  length: number;
  weight: number;
  water: string | null;
  bait: string | null;
  catch_date: string;
  photo_url: string | null;
}

const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [publicCatches, setPublicCatches] = useState<PublicCatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [friendshipStatus, setFriendshipStatus] = useState<string | null>(null);
  const [friendshipId, setFriendshipId] = useState<string | null>(null);
  const [isIncomingRequest, setIsIncomingRequest] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'catches'>('posts');

  const isOwnProfile = userId === user?.id;

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, is_premium')
      .eq('id', userId)
      .single();

    if (profileData) setProfile(profileData);

    // Fetch user's posts
    const { data: postsData } = await supabase
      .from('community_posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (postsData) {
      const postIds = postsData.map(p => p.id);
      const [{ data: likes }, { data: comments }] = await Promise.all([
        supabase.from('post_likes').select('post_id').in('post_id', postIds),
        supabase.from('post_comments').select('post_id').in('post_id', postIds),
      ]);

      const likeCounts: Record<string, number> = {};
      (likes || []).forEach(l => { likeCounts[l.post_id] = (likeCounts[l.post_id] || 0) + 1; });
      const commentCounts: Record<string, number> = {};
      (comments || []).forEach(c => { commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1; });

      setPosts(postsData.map(p => ({
        ...p,
        likes_count: likeCounts[p.id] || 0,
        comments_count: commentCounts[p.id] || 0,
      })));
    }

    // Fetch public catches
    const { data: catchesData } = await supabase
      .from('catches')
      .select('id, fish, length, weight, water, bait, catch_date, photo_url')
      .eq('user_id', userId)
      .eq('is_public', true)
      .order('catch_date', { ascending: false })
      .limit(50);

    if (catchesData) {
      setPublicCatches(catchesData.map(c => ({
        ...c,
        length: Number(c.length),
        weight: Number(c.weight),
      })));
    }

    // Check friendship
    if (user && userId !== user.id) {
      const { data: friendship } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${user.id})`)
        .maybeSingle();

      if (friendship) {
        setFriendshipStatus(friendship.status);
        setFriendshipId(friendship.id);
        setIsIncomingRequest(friendship.requester_id === userId && friendship.addressee_id === user.id);
      }
    }

    setLoading(false);
  }, [userId, user]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const sendFriendRequest = async () => {
    if (!user || !userId) return;
    const { error } = await supabase.from('friendships').insert({
      requester_id: user.id,
      addressee_id: userId,
    });
    if (!error) {
      toast.success('Friend request sent! 🤝');
      // Send notification
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'friend_request',
        actor_id: user.id,
      });
      setFriendshipStatus('pending');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl text-center py-20">
        <p className="text-muted-foreground">User not found</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 lg:py-10 max-w-2xl">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Profile header */}
      <div className="rounded-2xl border border-border bg-card p-6 mb-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            {profile.avatar_url ? <AvatarImage src={profile.avatar_url} /> : null}
            <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">
              {profile.username?.[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-foreground flex items-center gap-1.5">
              {profile.username || 'Angler'} <PremiumCrown isPremium={profile.is_premium} className="h-4 w-4" />
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </p>
            {!isOwnProfile && (
              <div className="mt-3">
                {friendshipStatus === 'accepted' ? (
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <UserCheck className="h-4 w-4 text-green-500" /> Friends
                  </span>
                ) : friendshipStatus === 'pending' && isIncomingRequest ? (
                  <Button size="sm" className="gap-1.5" onClick={async () => {
                    if (!friendshipId) return;
                    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId);
                    setFriendshipStatus('accepted');
                    toast.success('Friend added! 🎉');
                    if (user && userId) {
                      await supabase.from('notifications').insert({ user_id: userId, type: 'friend_accept', actor_id: user.id });
                    }
                  }}>
                    <UserCheck className="h-4 w-4" /> Accept Friend
                  </Button>
                ) : friendshipStatus === 'pending' ? (
                  <span className="text-sm text-muted-foreground">Request pending...</span>
                ) : (
                  <Button size="sm" className="gap-1.5" onClick={sendFriendRequest}>
                    <UserPlus className="h-4 w-4" /> Add Friend
                  </Button>
                )}
              </div>
            )}
            {isOwnProfile && (
              <Button size="sm" variant="outline" className="mt-3" onClick={() => navigate('/profile-edit')}>
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-colors ${
            activeTab === 'posts' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Posts ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab('catches')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-colors ${
            activeTab === 'catches' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Catches ({publicCatches.length})
        </button>
      </div>

      {activeTab === 'posts' && (
        <>
          {posts.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-border">
              <div className="text-4xl mb-2">🎣</div>
              <p className="text-sm text-muted-foreground">No posts yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map(post => (
                <div key={post.id} className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{post.content}</p>
                  {post.photo_url && (
                    <img src={post.photo_url} alt="Catch" className="mt-2 rounded-xl w-full max-h-64 object-cover" loading="lazy" />
                  )}
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                    {post.fish_species && <span className="flex items-center gap-1"><Fish className="h-3 w-3" /> {post.fish_species}</span>}
                    {post.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {post.location}</span>}
                    <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {post.likes_count}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {post.comments_count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'catches' && (
        <>
          {publicCatches.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-border">
              <div className="text-4xl mb-2">🐟</div>
              <p className="text-sm text-muted-foreground">No public catches yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {publicCatches.map(c => (
                <div key={c.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-start gap-3">
                    {c.photo_url && (
                      <img src={c.photo_url} alt={c.fish} className="h-14 w-14 rounded-lg object-cover border border-border shrink-0" loading="lazy" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate">{c.fish}</h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground mt-0.5">
                        {c.length > 0 && <span className="flex items-center gap-1"><Ruler className="h-3 w-3" /> {(c.length / 2.54).toFixed(1)} in</span>}
                        {c.weight > 0 && <span className="flex items-center gap-1"><Weight className="h-3 w-3" /> {(c.weight * 2.205).toFixed(1)} lb</span>}
                        {c.water && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.water}</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{c.catch_date}</span>
                        {c.bait && <span>· {c.bait}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserProfilePage;
