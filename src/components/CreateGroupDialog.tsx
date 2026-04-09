import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Check, Users, Loader2, Globe, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

interface CreateGroupDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

const CreateGroupDialog = ({ open, onClose, onCreated }: CreateGroupDialogProps) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [friends, setFriends] = useState<Profile[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchFriends = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data: friendships } = await supabase
      .from('friendships')
      .select('*')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq('status', 'accepted');

    if (!friendships || friendships.length === 0) {
      setFriends([]);
      setLoading(false);
      return;
    }
    const friendIds = friendships.map(f =>
      f.requester_id === user.id ? f.addressee_id : f.requester_id
    );
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, is_premium')
      .in('id', friendIds);
    setFriends(profiles || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { if (open) { fetchFriends(); setName(''); setSelectedIds(new Set()); setIsPublic(false); } }, [open, fetchFriends]);

  const toggleFriend = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const createGroup = async () => {
    if (!user || !name.trim()) return;
    // Public groups don't require selecting friends
    if (!isPublic && selectedIds.size === 0) return;
    setCreating(true);

    const inviteCode = generateInviteCode();

    const { data: group, error } = await supabase
      .from('chat_groups')
      .insert({
        name: name.trim(),
        creator_id: user.id,
        is_public: isPublic,
        invite_code: inviteCode,
      } as any)
      .select()
      .single();

    if (error || !group) {
      toast.error('Failed to create group');
      setCreating(false);
      return;
    }

    // Add creator as accepted leader
    await supabase.from('chat_group_members').insert({
      group_id: group.id,
      user_id: user.id,
      role: 'leader',
      status: 'accepted',
    });

    // Add selected friends as pending members
    if (selectedIds.size > 0) {
      const memberInserts = [...selectedIds].map(friendId => ({
        group_id: group.id,
        user_id: friendId,
        role: 'member' as const,
        status: 'pending' as const,
      }));
      await supabase.from('chat_group_members').insert(memberInserts);

      for (const friendId of selectedIds) {
        await supabase.from('notifications').insert({
          user_id: friendId,
          type: 'group_invite',
          actor_id: user.id,
          group_id: group.id,
        });
      }
    }

    toast.success('Group created! 🎉');
    setCreating(false);
    onCreated();
    onClose();
  };

  const canCreate = name.trim() && (isPublic || selectedIds.size > 0);

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm rounded-2xl">
        <VisuallyHidden><DialogTitle>Create Group</DialogTitle></VisuallyHidden>
        <VisuallyHidden><DialogDescription>Create a new group chat</DialogDescription></VisuallyHidden>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Create Group</h3>
          </div>

          <Input
            placeholder="Group name..."
            value={name}
            onChange={e => setName(e.target.value)}
            className="rounded-xl"
            maxLength={50}
          />

          {/* Public / Private toggle */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2.5">
            <div className="flex items-center gap-2">
              {isPublic ? <Globe className="h-4 w-4 text-primary" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
              <div>
                <p className="text-sm font-medium text-foreground">{isPublic ? 'Public' : 'Private'}</p>
                <p className="text-[10px] text-muted-foreground">{isPublic ? 'Anyone can find & join' : 'Invite only'}</p>
              </div>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase mb-2">
              {isPublic ? 'Invite friends (optional)' : 'Select friends to invite'}
            </p>
            <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden max-h-60 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
              ) : friends.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No friends yet</p>
              ) : friends.map(f => (
                <button
                  key={f.id}
                  onClick={() => toggleFriend(f.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 w-full text-left transition-colors ${
                    selectedIds.has(f.id) ? 'bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                >
                  <Avatar className="h-9 w-9">
                    {f.avatar_url ? <AvatarImage src={f.avatar_url} /> : null}
                    <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">{f.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-sm font-medium text-foreground truncate">{f.username || 'Angler'}</span>
                  {selectedIds.has(f.id) && (
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <Button
            className="w-full rounded-xl gap-2"
            disabled={!canCreate || creating}
            onClick={createGroup}
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
            Create {isPublic ? 'Public' : 'Private'} Group
            {selectedIds.size > 0 ? ` (${selectedIds.size} invited)` : ''}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog;
