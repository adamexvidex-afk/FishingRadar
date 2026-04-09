import { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { moderateMessage } from '@/lib/moderation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft, Send, Image as ImageIcon, X, Loader2, Check, CheckCheck, Camera, Users, Plus, Link2, Star,
} from 'lucide-react';
import PremiumCrown from '@/components/PremiumCrown';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import GroupChat from '@/components/GroupChat';
import CreateGroupDialog from '@/components/CreateGroupDialog';
import PublicGroupsBrowser from '@/components/PublicGroupsBrowser';

interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  is_premium?: boolean;
}

interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string | null;
  image_url: string | null;
  read: boolean;
  created_at: string;
}

interface Conversation {
  friendId: string;
  profile: Profile;
  lastMessage?: ChatMessage;
  unreadCount: number;
}

interface GroupItem {
  id: string;
  name: string;
  avatar_url: string | null;
  creator_id: string;
  created_at: string;
  invite_code?: string | null;
  lastMessageTime?: string;
}

interface CommunityChatProps {
  initialChatUserId?: string | null;
  initialChatUsername?: string | null;
  initialChatAvatar?: string | null;
}

const CommunityChat = ({ initialChatUserId, initialChatUsername, initialChatAvatar }: CommunityChatProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<string | null>(initialChatUserId || null);
  const [activeChatProfile, setActiveChatProfile] = useState<Profile | null>(
    initialChatUserId ? { id: initialChatUserId, username: initialChatUsername || null, avatar_url: initialChatAvatar || null } : null
  );
  const [activeGroup, setActiveGroup] = useState<GroupItem | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [chatImage, setChatImage] = useState<File | null>(null);
  const [chatImagePreview, setChatImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [favoriteGroupIds, setFavoriteGroupIds] = useState<Set<string>>(new Set());

  // Fetch favorite groups
  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('favorite_groups')
      .select('group_id')
      .eq('user_id', user.id);
    setFavoriteGroupIds(new Set((data || []).map(r => (r as any).group_id)));
  }, [user]);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const toggleFavorite = async (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    if (favoriteGroupIds.has(groupId)) {
      setFavoriteGroupIds(prev => { const n = new Set(prev); n.delete(groupId); return n; });
      await (supabase.from('favorite_groups') as any).delete().eq('user_id', user.id).eq('group_id', groupId);
    } else {
      setFavoriteGroupIds(prev => new Set(prev).add(groupId));
      await (supabase.from('favorite_groups') as any).insert({ user_id: user.id, group_id: groupId });
    }
  };

  const handleJoinByCode = async () => {
    if (!user || !joinCode.trim()) return;
    setJoining(true);
    // Extract code from full URL or raw code
    let code = joinCode.trim();
    const match = code.match(/[?&]code=([A-Za-z0-9]+)/);
    if (match) code = match[1];

    const { data: group, error: groupErr } = await (supabase
      .from('chat_groups')
      .select('*') as any)
      .eq('invite_code', code)
      .maybeSingle();

    if (groupErr || !group) {
      toast.error('Group not found – check your invite link');
      setJoining(false);
      return;
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from('chat_group_members')
      .select('id, status')
      .eq('group_id', group.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      if (existing.status === 'accepted') {
        toast.info(`Already a member of ${group.name}`);
      } else {
        await supabase.from('chat_group_members').update({ status: 'accepted' }).eq('id', existing.id);
        toast.success(`Joined ${group.name}!`);
      }
    } else {
      const { error } = await supabase.from('chat_group_members').insert({
        group_id: group.id,
        user_id: user.id,
        role: 'member',
        status: 'accepted',
      });
      if (error) {
        toast.error('Failed to join group');
      } else {
        toast.success(`Joined ${group.name}! 🎉`);
      }
    }
    setJoinCode('');
    setJoining(false);
    fetchConversations();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch conversation list
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: friendships } = await supabase
      .from('friendships')
      .select('*')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq('status', 'accepted');

    if (!friendships || friendships.length === 0) {
      setConversations([]);
    } else {
      const friendIds = friendships.map(f =>
        f.requester_id === user.id ? f.addressee_id : f.requester_id
      );
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, is_premium')
        .in('id', friendIds);

      const profileMap: Record<string, Profile> = {};
      (profiles || []).forEach(p => { profileMap[p.id] = p; });

      const { data: allMessages } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      const convMap: Record<string, { lastMessage?: ChatMessage; unreadCount: number }> = {};
      friendIds.forEach(fid => { convMap[fid] = { unreadCount: 0 }; });

      (allMessages || []).forEach(m => {
        const friendId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
        if (!convMap[friendId]) return;
        if (!convMap[friendId].lastMessage) convMap[friendId].lastMessage = m;
        if (m.receiver_id === user.id && !m.read) convMap[friendId].unreadCount++;
      });

      const convos: Conversation[] = friendIds
        .filter(fid => profileMap[fid])
        .map(fid => ({
          friendId: fid,
          profile: profileMap[fid],
          lastMessage: convMap[fid]?.lastMessage,
          unreadCount: convMap[fid]?.unreadCount || 0,
        }))
        .sort((a, b) => {
          const aTime = a.lastMessage?.created_at || '0';
          const bTime = b.lastMessage?.created_at || '0';
          return bTime.localeCompare(aTime);
        });

      setConversations(convos);
    }

    // Fetch groups
    const { data: memberRows } = await supabase
      .from('chat_group_members')
      .select('group_id')
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    if (memberRows && memberRows.length > 0) {
      const groupIds = memberRows.map(r => r.group_id);
      const { data: groupsData } = await supabase
        .from('chat_groups')
        .select('*')
        .in('id', groupIds);
      setGroups((groupsData || []) as GroupItem[]);
    } else {
      setGroups([]);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // Fetch messages for active DM chat
  const fetchMessages = useCallback(async () => {
    if (!user || !activeChat) return;
    setLoadingMessages(true);

    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${activeChat}),and(sender_id.eq.${activeChat},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })
      .limit(100);

    setMessages(data || []);
    setLoadingMessages(false);

    await supabase
      .from('chat_messages')
      .update({ read: true })
      .eq('sender_id', activeChat)
      .eq('receiver_id', user.id)
      .eq('read', false);

    setTimeout(scrollToBottom, 100);
  }, [user, activeChat]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // Realtime messages
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('chat-realtime')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'chat_messages',
      }, (payload) => {
        const msg = payload.new as ChatMessage;
        if (
          (msg.sender_id === user.id && msg.receiver_id === activeChat) ||
          (msg.sender_id === activeChat && msg.receiver_id === user.id)
        ) {
          setMessages(prev => [...prev, msg]);
          setTimeout(scrollToBottom, 100);
          if (msg.sender_id === activeChat) {
            supabase.from('chat_messages').update({ read: true }).eq('id', msg.id);
          }
        }
        fetchConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, activeChat, fetchConversations]);

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
    if (!user || !activeChat || (!messageText.trim() && !chatImage)) return;
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
      const path = `${user.id}/chat-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('catch-photos')
        .upload(path, chatImage, { contentType: chatImage.type, upsert: true });
      if (!upErr) {
        const { data } = await supabase.storage.from('catch-photos').createSignedUrl(path, 60 * 60 * 24 * 365);
        imageUrl = data?.signedUrl || null;
      }
    }

    await supabase.from('chat_messages').insert({
      sender_id: user.id,
      receiver_id: activeChat,
      content: messageText.trim() || null,
      image_url: imageUrl,
    });

    setMessageText('');
    setChatImage(null);
    setChatImagePreview(null);
    setSending(false);
  };

  const openChat = (friendId: string, profile: Profile) => {
    setActiveChat(friendId);
    setActiveChatProfile(profile);
    setActiveGroup(null);
  };

  const openGroup = (group: GroupItem) => {
    setActiveGroup(group);
    setActiveChat(null);
    setActiveChatProfile(null);
  };

  // ── Group chat active ──
  if (activeGroup) {
    return (
      <GroupChat
        group={activeGroup}
        onBack={() => { setActiveGroup(null); fetchConversations(); }}
        onGroupLeft={() => { setActiveGroup(null); fetchConversations(); }}
      />
    );
  }

  // ── Conversation list ──
  if (!activeChat) {
    return (
      <div className="space-y-3">
        {/* Create group button */}
        <Button
          variant="outline"
          className="w-full gap-2 rounded-2xl h-11 text-sm font-bold"
          onClick={() => setShowCreateGroup(true)}
        >
          <Plus className="h-4 w-4" />
          <Users className="h-4 w-4" />
          Create Group
        </Button>

        {/* Join group by invite link */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Paste invite link or code..."
              value={joinCode}
              onChange={e => setJoinCode(e.target.value)}
              className="rounded-2xl pl-9 h-11 text-sm"
              onKeyDown={e => e.key === 'Enter' && handleJoinByCode()}
            />
          </div>
          <Button
            size="sm"
            className="h-11 rounded-2xl px-4 gap-1.5"
            disabled={!joinCode.trim() || joining}
            onClick={handleJoinByCode}
          >
            {joining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
            Join
          </Button>
        </div>

        <CreateGroupDialog
          open={showCreateGroup}
          onClose={() => setShowCreateGroup(false)}
          onCreated={() => fetchConversations()}
        />

        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          ))
        ) : (
          <>
            {/* Groups */}
            {groups.length > 0 && (
              <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
                {[...groups].sort((a, b) => {
                  const aFav = favoriteGroupIds.has(a.id) ? 0 : 1;
                  const bFav = favoriteGroupIds.has(b.id) ? 0 : 1;
                  return aFav - bFav;
                }).map(g => (
                  <button
                    key={g.id}
                    onClick={() => openGroup(g)}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-12 w-12">
                      {g.avatar_url ? <AvatarImage src={g.avatar_url} /> : null}
                      <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                        <Users className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">{g.name}</p>
                      <p className="text-xs text-muted-foreground">Group</p>
                    </div>
                    <div
                      role="button"
                      onClick={(e) => toggleFavorite(g.id, e)}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Star className={`h-4 w-4 ${favoriteGroupIds.has(g.id) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* DM Conversations */}
            {conversations.length === 0 && groups.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">💬</div>
                <h3 className="text-lg font-bold text-foreground">No conversations</h3>
                <p className="text-sm text-muted-foreground mt-1">Add friends to start chatting!</p>
              </div>
            ) : conversations.length > 0 && (
              <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
                {conversations.map(conv => (
                  <button
                    key={conv.friendId}
                    onClick={() => openChat(conv.friendId, conv.profile)}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        {conv.profile.avatar_url ? <AvatarImage src={conv.profile.avatar_url} /> : null}
                        <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                          {conv.profile.username?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-foreground flex items-center gap-1">{conv.profile.username || 'Angler'} <PremiumCrown isPremium={conv.profile.is_premium} /></p>
                        {conv.lastMessage && (
                          <p className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(conv.lastMessage.created_at), { addSuffix: true })}
                          </p>
                        )}
                      </div>
                      {conv.lastMessage && (
                        <p className={`text-xs truncate mt-0.5 ${conv.unreadCount > 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                          {conv.lastMessage.sender_id === user?.id ? 'You: ' : ''}
                          {conv.lastMessage.image_url && !conv.lastMessage.content ? '📷 Photo' : conv.lastMessage.content || '📷 Photo'}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Public Groups Browser */}
            <PublicGroupsBrowser
              onGroupJoined={() => fetchConversations()}
              onOpenGroup={(g) => openGroup(g as GroupItem)}
            />
          </>
        )}
      </div>
    );
  }

  // ── Active DM chat ──
  return (
    <>
    <div className="flex flex-col h-[calc(100vh-280px)] min-h-[400px]">
      <div className="flex items-center gap-3 pb-3 border-b border-border mb-3">
        <button
          onClick={() => { setActiveChat(null); setActiveChatProfile(null); setMessages([]); }}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button onClick={() => navigate(`/profile/${activeChat}`)} className="flex-shrink-0">
          <Avatar className="h-9 w-9">
            {activeChatProfile?.avatar_url ? <AvatarImage src={activeChatProfile.avatar_url} /> : null}
            <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
              {activeChatProfile?.username?.[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
        </button>
        <button onClick={() => navigate(`/profile/${activeChat}`)} className="text-sm font-bold text-foreground hover:text-primary transition-colors">
          {activeChatProfile?.username || 'Angler'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {loadingMessages ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">👋</div>
            <p className="text-sm text-muted-foreground">Say hello!</p>
          </div>
        ) : (
          messages.map(m => {
            const isMine = m.sender_id === user?.id;
            return (
              <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${
                  isMine
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted text-foreground rounded-bl-md'
                }`}>
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
                  <div className={`flex items-center gap-1 mt-0.5 ${isMine ? 'justify-end' : ''}`}>
                    <p className={`text-[10px] ${isMine ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                      {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                    </p>
                    {isMine && (
                      m.read
                        ? <CheckCheck className="h-3 w-3 text-primary-foreground/60" />
                        : <Check className="h-3 w-3 text-primary-foreground/60" />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {chatImagePreview && (
        <div className="relative mt-2">
          <img src={chatImagePreview} alt="Preview" className="rounded-xl max-h-32 object-cover" />
          <button
            onClick={() => { setChatImage(null); setChatImagePreview(null); }}
            className="absolute top-1 right-1 rounded-full bg-background/80 p-0.5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

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
        {lightboxUrl && (
          <img src={lightboxUrl} alt="Full size" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
        )}
      </DialogContent>
    </Dialog>
    </>
  );
};

export default CommunityChat;
