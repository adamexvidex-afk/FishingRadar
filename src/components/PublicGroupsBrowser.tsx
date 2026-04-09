import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Users, Globe, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface PublicGroup {
  id: string;
  name: string;
  avatar_url: string | null;
  creator_id: string;
  created_at: string;
  member_count?: number;
  is_member?: boolean;
}

interface PublicGroupsBrowserProps {
  onGroupJoined?: () => void;
  onOpenGroup?: (group: PublicGroup) => void;
}

const PublicGroupsBrowser = ({ onGroupJoined, onOpenGroup }: PublicGroupsBrowserProps) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<PublicGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const fetchPublicGroups = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: publicGroups } = await (supabase
      .from('chat_groups')
      .select('*') as any)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!publicGroups || publicGroups.length === 0) {
      setGroups([]);
      setLoading(false);
      return;
    }

    const groupIds = publicGroups.map(g => g.id);

    // Get member counts
    const { data: memberships } = await supabase
      .from('chat_group_members')
      .select('group_id, user_id, status')
      .in('group_id', groupIds)
      .eq('status', 'accepted');

    const countMap: Record<string, number> = {};
    const userMemberOf = new Set<string>();
    (memberships || []).forEach(m => {
      countMap[m.group_id] = (countMap[m.group_id] || 0) + 1;
      if (m.user_id === user.id) userMemberOf.add(m.group_id);
    });

    setGroups(publicGroups.map(g => ({
      ...g,
      member_count: countMap[g.id] || 0,
      is_member: userMemberOf.has(g.id),
    })));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchPublicGroups(); }, [fetchPublicGroups]);

  const joinGroup = async (groupId: string) => {
    if (!user) return;
    setJoiningId(groupId);

    const { error } = await supabase.from('chat_group_members').insert({
      group_id: groupId,
      user_id: user.id,
      role: 'member',
      status: 'accepted',
    });

    if (error) {
      if (error.code === '23505') {
        toast.info('You\'re already in this group');
      } else {
        toast.error('Failed to join group');
      }
    } else {
      toast.success('Joined group! 🎉');
      setGroups(prev => prev.map(g => g.id === groupId ? { ...g, is_member: true, member_count: (g.member_count || 0) + 1 } : g));
      onGroupJoined?.();
    }
    setJoiningId(null);
  };

  const filtered = groups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Globe className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Public Groups</h3>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search groups..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 rounded-xl"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-2">🌍</div>
          <p className="text-sm text-muted-foreground">{search ? 'No groups found' : 'No public groups yet'}</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
          {filtered.map(g => (
            <div
              key={g.id}
              className="flex items-center gap-3 px-4 py-3"
            >
              <button onClick={() => g.is_member && onOpenGroup?.(g)} className="flex-shrink-0">
                <Avatar className="h-11 w-11">
                  {g.avatar_url ? <AvatarImage src={g.avatar_url} /> : null}
                  <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                    <Users className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{g.name}</p>
                <p className="text-[10px] text-muted-foreground">{g.member_count} member{g.member_count !== 1 ? 's' : ''}</p>
              </div>
              {g.is_member ? (
                <Button size="sm" variant="outline" className="h-8 text-xs rounded-lg gap-1" disabled>
                  <Check className="h-3 w-3" /> Joined
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="h-8 text-xs rounded-lg"
                  disabled={joiningId === g.id}
                  onClick={() => joinGroup(g.id)}
                >
                  {joiningId === g.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Join'}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicGroupsBrowser;
