import { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { moderateMessage } from '@/lib/moderation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft, Send, Image as ImageIcon, X, Loader2, Camera, Settings,
  Users, LogOut, Crown, UserPlus, Pencil, Check, Link2, Copy,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import PremiumCrown from '@/components/PremiumCrown';

interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  is_premium?: boolean;
}

interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
}

interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  status: string;
  created_at: string;
  profile?: Profile;
}

interface Group {
  id: string;
  name: string;
  avatar_url: string | null;
  creator_id: string;
  created_at: string;
  invite_code?: string | null;
}

interface GroupChatProps {
  group: Group;
  onBack: () => void;
  onGroupLeft: () => void;
}

const GroupChat = ({ group, onBack, onGroupLeft }: GroupChatProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [profileMap, setProfileMap] = useState<Record<string, Profile>>({});
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [chatImage, setChatImage] = useState<File | null>(null);
  const [chatImagePreview, setChatImagePreview] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(group.name);
  const [showAddMember, setShowAddMember] = useState(false);
  const [friends, setFriends] = useState<Profile[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isLeader = group.creator_id === user?.id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMembers = useCallback(async () => {
    const { data } = await supabase
      .from('chat_group_members')
      .select('*')
      .eq('group_id', group.id);

    if (data && data.length > 0) {
      const userIds = data.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, is_premium')
        .in('id', userIds);
      const pMap: Record<string, Profile> = {};
      (profiles || []).forEach(p => { pMap[p.id] = p; });
      setProfileMap(prev => ({ ...prev, ...pMap }));
      setMembers(data.map(m => ({ ...m, profile: pMap[m.user_id] })));
    } else {
      setMembers([]);
    }
  }, [group.id]);

  const fetchMessages = useCallback(async () => {
    setLoadingMessages(true);
    const { data } = await supabase
      .from('group_messages')
      .select('*')
      .eq('group_id', group.id)
      .order('created_at', { ascending: true })
      .limit(200);

    if (data && data.length > 0) {
      const senderIds = [...new Set(data.map(m => m.sender_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, is_premium')
        .in('id', senderIds);
      const pMap: Record<string, Profile> = {};
      (profiles || []).forEach(p => { pMap[p.id] = p; });
      setProfileMap(prev => ({ ...prev, ...pMap }));
      setMessages(data);
    } else {
      setMessages([]);
    }
    setLoadingMessages(false);
    setTimeout(scrollToBottom, 100);
  }, [group.id]);

  useEffect(() => { fetchMembers(); fetchMessages(); }, [fetchMembers, fetchMessages]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel(`group-${group.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'group_messages',
        filter: `group_id=eq.${group.id}`,
      }, async (payload) => {
        const msg = payload.new as GroupMessage;
        // Fetch sender profile if not cached
        if (!profileMap[msg.sender_id]) {
          const { data } = await supabase
            .from('profiles')
            .select('id, username, avatar_url, is_premium')
            .eq('id', msg.sender_id)
            .maybeSingle();
          if (data) setProfileMap(prev => ({ ...prev, [data.id]: data }));
        }
        setMessages(prev => [...prev, msg]);
        setTimeout(scrollToBottom, 100);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [group.id, profileMap]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setChatImage(file);
      const reader = new FileReader();
      reader.onload = () => setChatImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const sendMessage = async () => {
    if (!user || (!messageText.trim() && !chatImage)) return;
    setSending(true);

    // Moderate text content before sending
    if (messageText.trim()) {
      const modResult = await moderateMessage(messageText.trim());
      if (!modResult.allowed) {
        toast.error(modResult.reason || 'Your message contains inappropriate content');
        setSending(false);
        return;
      }
    }

    let imageUrl: string | null = null;
    if (chatImage) {
      const ext = chatImage.name.split('.').pop();
      const path = `${user.id}/group-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('catch-photos')
        .upload(path, chatImage, { contentType: chatImage.type, upsert: true });
      if (!upErr) {
        const { data } = await supabase.storage.from('catch-photos').createSignedUrl(path, 60 * 60 * 24 * 365);
        imageUrl = data?.signedUrl || null;
      }
    }

    await supabase.from('group_messages').insert({
      group_id: group.id,
      sender_id: user.id,
      content: messageText.trim() || null,
      image_url: imageUrl,
    });

    setMessageText('');
    setChatImage(null);
    setChatImagePreview(null);
    setSending(false);
  };

  const leaveGroup = async () => {
    if (!user) return;
    await supabase
      .from('chat_group_members')
      .delete()
      .eq('group_id', group.id)
      .eq('user_id', user.id);
    toast.success('Left group');
    onGroupLeft();
  };

  const updateGroupName = async () => {
    if (!newName.trim()) return;
    await supabase.from('chat_groups').update({ name: newName.trim() }).eq('id', group.id);
    toast.success('Group name updated');
    setEditingName(false);
  };

  const updateGroupAvatar = async (file: File) => {
    if (!user) return;
    const ext = file.name.split('.').pop();
    const path = `group-${group.id}.${ext}`;
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { contentType: file.type, upsert: true });
    if (!error) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      await supabase.from('chat_groups').update({ avatar_url: data.publicUrl }).eq('id', group.id);
      toast.success('Group avatar updated');
    }
  };

  const fetchFriends = useCallback(async () => {
    if (!user) return;
    const { data: friendships } = await supabase
      .from('friendships')
      .select('*')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq('status', 'accepted');

    if (!friendships) return;
    const friendIds = friendships.map(f =>
      f.requester_id === user.id ? f.addressee_id : f.requester_id
    );
    // Filter out existing members
    const memberIds = new Set(members.map(m => m.user_id));
    const availableIds = friendIds.filter(id => !memberIds.has(id));

    if (availableIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, is_premium')
        .in('id', availableIds);
      setFriends(profiles || []);
    } else {
      setFriends([]);
    }
  }, [user, members]);

  const addMember = async (userId: string) => {
    if (!user) return;
    const { error } = await supabase.from('chat_group_members').insert({
      group_id: group.id,
      user_id: userId,
      role: 'member',
      status: 'pending',
    });
    if (error) {
      toast.error('Failed to add member');
      return;
    }
    // Send notification
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'group_invite',
      actor_id: user.id,
      group_id: group.id,
    });
    toast.success('Invite sent!');
    setFriends(prev => prev.filter(f => f.id !== userId));
    fetchMembers();
  };

  const removeMember = async (userId: string) => {
    await supabase
      .from('chat_group_members')
      .delete()
      .eq('group_id', group.id)
      .eq('user_id', userId);
    toast.success('Member removed');
    fetchMembers();
  };

  const acceptedMembers = members.filter(m => m.status === 'accepted');
  const pendingMembers = members.filter(m => m.status === 'pending');

  // ── Group info panel ──
  if (showInfo) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <button onClick={() => setShowInfo(false)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h3 className="text-sm font-bold text-foreground">Group Info</h3>
        </div>

        {/* Group avatar & name */}
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              {group.avatar_url ? <AvatarImage src={group.avatar_url} /> : null}
              <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">
                {group.name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isLeader && (
              <label className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1.5 cursor-pointer hover:bg-primary/90 transition-colors">
                <Pencil className="h-3 w-3 text-primary-foreground" />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && updateGroupAvatar(e.target.files[0])} />
              </label>
            )}
          </div>
          {editingName ? (
            <div className="flex items-center gap-2">
              <Input value={newName} onChange={e => setNewName(e.target.value)} className="h-8 text-sm w-40" />
              <Button size="sm" className="h-8 w-8 p-0" onClick={updateGroupName}><Check className="h-3.5 w-3.5" /></Button>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => { setEditingName(false); setNewName(group.name); }}><X className="h-3.5 w-3.5" /></Button>
            </div>
          ) : (
            <button onClick={() => isLeader && setEditingName(true)} className="text-lg font-bold text-foreground flex items-center gap-1.5">
              {group.name}
              {isLeader && <Pencil className="h-3.5 w-3.5 text-muted-foreground" />}
            </button>
          )}
          <p className="text-xs text-muted-foreground">{acceptedMembers.length} members</p>
        </div>

        {/* Add member button */}
        {isLeader && (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 rounded-xl"
            onClick={() => { setShowAddMember(!showAddMember); if (!showAddMember) fetchFriends(); }}
          >
            <UserPlus className="h-4 w-4" /> Add Member
          </Button>
        )}

        {/* Add member list */}
        {showAddMember && (
          <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden max-h-48 overflow-y-auto">
            {friends.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No friends to add</p>
            ) : friends.map(f => (
              <div key={f.id} className="flex items-center gap-3 px-3 py-2">
                <Avatar className="h-8 w-8">
                  {f.avatar_url ? <AvatarImage src={f.avatar_url} /> : null}
                  <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">{f.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                </Avatar>
                <span className="flex-1 text-sm font-medium text-foreground truncate">{f.username || 'Angler'}</span>
                <Button size="sm" className="h-7 text-xs rounded-lg" onClick={() => addMember(f.id)}>Invite</Button>
              </div>
            ))}
          </div>
        )}

        {/* Members list */}
        <div>
          <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Members</h4>
          <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
            {acceptedMembers.map(m => (
              <div key={m.id} className="flex items-center gap-3 px-3 py-2.5">
                <button onClick={() => navigate(`/profile/${m.user_id}`)} className="flex-shrink-0">
                  <Avatar className="h-9 w-9">
                    {m.profile?.avatar_url ? <AvatarImage src={m.profile.avatar_url} /> : null}
                    <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">{m.profile?.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                  </Avatar>
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate flex items-center gap-1">{m.profile?.username || 'Angler'} <PremiumCrown isPremium={m.profile?.is_premium} /></p>
                  {m.role === 'leader' && (
                    <p className="text-[10px] text-primary flex items-center gap-0.5"><Crown className="h-2.5 w-2.5" /> Leader</p>
                  )}
                </div>
                {isLeader && m.user_id !== user?.id && (
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => removeMember(m.user_id)}>Remove</Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pending members */}
        {pendingMembers.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Pending</h4>
            <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
              {pendingMembers.map(m => (
                <div key={m.id} className="flex items-center gap-3 px-3 py-2.5">
                  <Avatar className="h-9 w-9">
                    {m.profile?.avatar_url ? <AvatarImage src={m.profile.avatar_url} /> : null}
                    <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">{m.profile?.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-sm text-muted-foreground truncate">{m.profile?.username || 'Angler'}</span>
                  <span className="text-[10px] text-muted-foreground">Invited</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invite link */}
        {group.invite_code && (
          <div>
            <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Invite Link</h4>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5">
              <Link2 className="h-4 w-4 text-primary flex-shrink-0" />
              <p className="text-xs text-muted-foreground truncate flex-1">{`${window.location.origin}/join-group?code=${group.invite_code}`}</p>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/join-group?code=${group.invite_code}`);
                  toast.success('Link copied!');
                }}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Leave group */}
        <Button variant="outline" className="w-full gap-2 rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10" onClick={leaveGroup}>
          <LogOut className="h-4 w-4" /> Leave Group
        </Button>
      </div>
    );
  }

  // ── Chat view ──
  return (
    <>
      <div className="flex flex-col h-[calc(100vh-280px)] min-h-[400px]">
        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-border mb-3">
          <button onClick={onBack} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Avatar className="h-9 w-9">
            {group.avatar_url ? <AvatarImage src={group.avatar_url} /> : null}
            <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">{group.name[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{group.name}</p>
            <p className="text-[10px] text-muted-foreground">{acceptedMembers.length} members</p>
          </div>
          <button onClick={() => setShowInfo(true)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors">
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loadingMessages ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-2">👋</div>
              <p className="text-sm text-muted-foreground">Start the conversation!</p>
            </div>
          ) : (
            messages.map(m => {
              const isMine = m.sender_id === user?.id;
              const sender = profileMap[m.sender_id];
              return (
                <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} gap-1.5`}>
                  {!isMine && (
                    <button onClick={() => navigate(`/profile/${m.sender_id}`)} className="flex-shrink-0 self-end">
                      <Avatar className="h-6 w-6">
                        {sender?.avatar_url ? <AvatarImage src={sender.avatar_url} /> : null}
                        <AvatarFallback className="bg-primary/10 text-[8px] font-bold text-primary">{sender?.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                      </Avatar>
                    </button>
                  )}
                  <div className={`max-w-[70%] rounded-2xl px-3.5 py-2 ${
                    isMine ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted text-foreground rounded-bl-md'
                  }`}>
                    {!isMine && (
                      <p className={`text-[10px] font-semibold mb-0.5 flex items-center gap-0.5 ${isMine ? 'text-primary-foreground/70' : 'text-primary'}`}>
                        {sender?.username || 'Angler'} <PremiumCrown isPremium={sender?.is_premium} className="h-2.5 w-2.5" />
                      </p>
                    )}
                    {m.image_url && (
                      <img
                        src={m.image_url}
                        alt="Shared"
                        className="rounded-lg max-h-52 object-cover mb-1.5 cursor-pointer"
                        loading="lazy"
                        onClick={() => setLightboxUrl(m.image_url!)}
                      />
                    )}
                    {m.content && <p className="text-sm whitespace-pre-wrap">{m.content}</p>}
                    <p className={`text-[10px] mt-0.5 ${isMine ? 'text-primary-foreground/60 text-right' : 'text-muted-foreground'}`}>
                      {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Image preview */}
        {chatImagePreview && (
          <div className="relative mt-2">
            <img src={chatImagePreview} alt="Preview" className="rounded-xl max-h-32 object-cover" />
            <button onClick={() => { setChatImage(null); setChatImagePreview(null); }} className="absolute top-1 right-1 rounded-full bg-background/80 p-0.5">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Input */}
        <div className="flex items-center gap-2 pt-3 border-t border-border mt-2">
          <label className="flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <ImageIcon className="h-4.5 w-4.5" />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          </label>
          <label className="flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <Camera className="h-4.5 w-4.5" />
            <input type="file" accept="image/*" capture className="hidden" onChange={handleImageSelect} />
          </label>
          <Input
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            className="h-9 text-sm rounded-xl bg-muted/50 border-0"
            maxLength={2000}
          />
          <Button
            size="sm"
            className="h-9 w-9 p-0 rounded-xl flex-shrink-0"
            disabled={(!messageText.trim() && !chatImage) || sending}
            onClick={sendMessage}
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <Dialog open={!!lightboxUrl} onOpenChange={() => setLightboxUrl(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-2 bg-black/90 border-none flex items-center justify-center">
          <VisuallyHidden><DialogTitle>Image</DialogTitle></VisuallyHidden>
          <VisuallyHidden><DialogDescription>Full size image</DialogDescription></VisuallyHidden>
          {lightboxUrl && <img src={lightboxUrl} alt="Full size" className="max-w-full max-h-[85vh] object-contain rounded-lg" />}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GroupChat;
