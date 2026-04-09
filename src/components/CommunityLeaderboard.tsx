import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Fish, Weight, Ruler, Globe, Users, Calendar } from 'lucide-react';
import PremiumCrown from '@/components/PremiumCrown';

interface LeaderEntry {
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  is_premium?: boolean;
  value: number;
}

type Category = 'most' | 'heaviest' | 'longest';
type Scope = 'all' | 'friends';
type TimePeriod = 'week' | 'month' | 'all';

const KG_TO_LB = 2.20462;
const CM_TO_IN = 0.393701;

const CommunityLeaderboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [category, setCategory] = useState<Category>('most');
  const [scope, setScope] = useState<Scope>('all');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');
  const [entries, setEntries] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);

    let sinceDate: string;
    if (timePeriod === 'week') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      sinceDate = d.toISOString().split('T')[0];
    } else if (timePeriod === 'month') {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      sinceDate = d.toISOString().split('T')[0];
    } else {
      sinceDate = '2000-01-01';
    }

    // Fetch friend IDs if scope is friends
    let friendIds: string[] | null = null;
    if (scope === 'friends' && user) {
      const { data: friendships } = await supabase
        .from('friendships')
        .select('requester_id, addressee_id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (friendships) {
        const ids = new Set<string>();
        ids.add(user.id); // include self
        friendships.forEach(f => {
          ids.add(f.requester_id === user.id ? f.addressee_id : f.requester_id);
        });
        friendIds = Array.from(ids);
      }
    }

    const { data: leaderData, error } = await supabase.rpc('get_leaderboard', {
      since_date: sinceDate,
    });

    if (error || !leaderData || leaderData.length === 0) {
      setEntries([]);
      setLoading(false);
      return;
    }

    // Filter by friends if needed
    let filtered = leaderData as any[];
    if (friendIds) {
      filtered = filtered.filter((r: any) => friendIds!.includes(r.user_id));
    }

    const userIds = filtered.map((r: any) => r.user_id);

    if (userIds.length === 0) {
      setEntries([]);
      setLoading(false);
      return;
    }

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, is_premium')
      .in('id', userIds);

    const profileMap: Record<string, { username: string | null; avatar_url: string | null; is_premium?: boolean }> = {};
    profiles?.forEach(p => {
      profileMap[p.id] = { username: p.username, avatar_url: p.avatar_url, is_premium: p.is_premium };
    });

    let ranked: LeaderEntry[] = [];

    if (category === 'most') {
      ranked = filtered
        .map((r: any) => ({
          user_id: r.user_id,
          username: profileMap[r.user_id]?.username ?? null,
          avatar_url: profileMap[r.user_id]?.avatar_url ?? null,
          is_premium: profileMap[r.user_id]?.is_premium,
          value: Number(r.catch_count),
        }))
        .sort((a: LeaderEntry, b: LeaderEntry) => b.value - a.value)
        .slice(0, 10);
    } else if (category === 'heaviest') {
      ranked = filtered
        .filter((r: any) => Number(r.max_weight) > 0)
        .map((r: any) => ({
          user_id: r.user_id,
          username: profileMap[r.user_id]?.username ?? null,
          avatar_url: profileMap[r.user_id]?.avatar_url ?? null,
          is_premium: profileMap[r.user_id]?.is_premium,
          value: Math.round(Number(r.max_weight) * KG_TO_LB * 10) / 10,
        }))
        .sort((a: LeaderEntry, b: LeaderEntry) => b.value - a.value)
        .slice(0, 10);
    } else {
      ranked = filtered
        .filter((r: any) => Number(r.max_length) > 0)
        .map((r: any) => ({
          user_id: r.user_id,
          username: profileMap[r.user_id]?.username ?? null,
          avatar_url: profileMap[r.user_id]?.avatar_url ?? null,
          is_premium: profileMap[r.user_id]?.is_premium,
          value: Math.round(Number(r.max_length) * CM_TO_IN * 10) / 10,
        }))
        .sort((a: LeaderEntry, b: LeaderEntry) => b.value - a.value)
        .slice(0, 10);
    }

    setEntries(ranked);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [category, scope, timePeriod, user]);

  useEffect(() => {
    const channel = supabase
      .channel('leaderboard-catches')
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'catches' },
        () => fetchLeaderboard()
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'catches' },
        () => fetchLeaderboard()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [category, scope, timePeriod, user]);

  const tabs: { key: Category; label: string; icon: React.ReactNode }[] = [
    { key: 'most', label: 'Most Catches', icon: <Fish className="h-4 w-4" /> },
    { key: 'heaviest', label: 'Heaviest', icon: <Weight className="h-4 w-4" /> },
    { key: 'longest', label: 'Longest', icon: <Ruler className="h-4 w-4" /> },
  ];

  const scopeTabs: { key: Scope; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'Everyone', icon: <Globe className="h-4 w-4" /> },
    { key: 'friends', label: 'Friends', icon: <Users className="h-4 w-4" /> },
  ];

  const timeTabs: { key: TimePeriod; label: string }[] = [
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'all', label: 'All Time' },
  ];

  const unitLabel = category === 'most' ? '' : category === 'heaviest' ? ' lb' : ' in';
  const emptyLabel = timePeriod === 'week' ? 'this week' : timePeriod === 'month' ? 'this month' : '';

  return (
    <div className="space-y-4">
      {/* Scope toggle */}
      {user && (
        <div className="flex rounded-lg border border-border bg-muted/50 p-1">
          {scopeTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setScope(tab.key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                scope === tab.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Time period tabs */}
      <div className="flex rounded-lg border border-border bg-muted/50 p-1">
        {timeTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setTimePeriod(tab.key)}
            className={`flex flex-1 items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              timePeriod === tab.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setCategory(tab.key)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              category === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">
          {scope === 'friends'
            ? `No catches from friends ${emptyLabel || 'yet'}. Invite them to fish!`
            : `No catches ${emptyLabel || 'yet'}. Be the first!`}
        </p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => (
            <button
              key={entry.user_id}
              onClick={() => navigate(`/profile/${entry.user_id}`)}
              className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted/50"
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                i === 0 ? 'bg-yellow-500/20 text-yellow-600' :
                i === 1 ? 'bg-gray-300/30 text-gray-500' :
                i === 2 ? 'bg-orange-400/20 text-orange-500' :
                'bg-muted text-muted-foreground'
              }`}>
                {i === 0 ? <Trophy className="h-4 w-4" /> : i + 1}
              </span>

              <Avatar className="h-8 w-8">
                {entry.avatar_url ? <AvatarImage src={entry.avatar_url} /> : null}
                <AvatarFallback>{entry.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
              </Avatar>

              <span className="flex-1 truncate text-sm font-medium text-foreground flex items-center gap-1">
                {entry.username || 'Angler'} <PremiumCrown isPremium={entry.is_premium} />
              </span>

              <span className="text-sm font-semibold text-primary">
                {entry.value}{unitLabel}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityLeaderboard;
