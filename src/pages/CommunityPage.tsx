import { useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import CommunityChat from '@/components/CommunityChat';
import CommunityLeaderboard from '@/components/CommunityLeaderboard';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { quickProfanityCheck } from '@/lib/moderation';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Heart, MessageCircle, Send, Image as ImageIcon, MapPin, Fish, Search,
  UserPlus, UserCheck, Users, Clock, Trash2, X, ChevronDown, Loader2,
  Bell, Reply, Check,
} from 'lucide-react';
import PremiumCrown from '@/components/PremiumCrown';
import { formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

// ── Types ──
interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  is_premium?: boolean;
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  photo_url: string | null;
  location: string | null;
  fish_species: string | null;
  created_at: string;
  profiles?: Profile;
  likes_count: number;
  comments_count: number;
  user_liked: boolean;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  parent_id: string | null;
  created_at: string;
  profiles?: Profile;
  likes_count: number;
  user_liked: boolean;
  replies?: Comment[];
}

interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
  requester_profile?: Profile;
  addressee_profile?: Profile;
}

interface Notification {
  id: string;
  user_id: string;
  type: string;
  actor_id: string;
  post_id: string | null;
  group_id: string | null;
  read: boolean;
  created_at: string;
  actor_profile?: Profile;
}

type Tab = 'feed' | 'search' | 'friends' | 'chat' | 'top';

// ── Image optimization helper ──
function getThumbnailUrl(url: string, width = 600): string {
  // Supabase storage public URL → render endpoint for on-the-fly resizing
  if (url.includes('/storage/v1/object/public/')) {
    return url.replace('/storage/v1/object/public/', `/storage/v1/render/image/public/`) + `?width=${width}&resize=contain&quality=75`;
  }
  return url;
}

// ── Component ──
const CommunityPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('feed');
  const [chatTargetId, setChatTargetId] = useState<string | null>(null);
  const [chatTargetName, setChatTargetName] = useState<string | null>(null);
  const [chatTargetAvatar, setChatTargetAvatar] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedSearch, setFeedSearch] = useState('');

  // New post state
  const [newContent, setNewContent] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newSpecies, setNewSpecies] = useState('');
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [showCompose, setShowCompose] = useState(false);

  // Comments
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [commentPhoto, setCommentPhoto] = useState<Record<string, File | null>>({});
  const [commentPhotoPreview, setCommentPhotoPreview] = useState<Record<string, string | null>>({});
  const [replyingTo, setReplyingTo] = useState<Record<string, { commentId: string; username: string } | null>>({});
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());

  // Friends
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [friendSearch, setFriendSearch] = useState('');
  const [loadingFriends, setLoadingFriends] = useState(true);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<Notification | null>(null);
  const [processingInvite, setProcessingInvite] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Unread chat messages
  const [hasUnreadChats, setHasUnreadChats] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // ── Fetch notifications ──
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (data && data.length > 0) {
      const actorIds = [...new Set(data.map(n => n.actor_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, is_premium')
        .in('id', actorIds);
      const pMap: Record<string, Profile> = {};
      (profiles || []).forEach(p => { pMap[p.id] = p; });
      setNotifications(data.map(n => ({ ...n, actor_profile: pMap[n.actor_id] })));
    } else {
      setNotifications([]);
    }
  }, [user]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // ── Check unread chats ──
  const checkUnreadChats = useCallback(async () => {
    if (!user) return;
    const { count } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('read', false);
    setHasUnreadChats((count || 0) > 0);
  }, [user]);

  useEffect(() => { checkUnreadChats(); }, [checkUnreadChats]);

  const markAllRead = async () => {
    if (!user || unreadCount === 0) return;
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const createNotification = async (targetUserId: string, type: string, postId?: string) => {
    if (!user || targetUserId === user.id) return;
    await supabase.from('notifications').insert({
      user_id: targetUserId,
      type,
      actor_id: user.id,
      post_id: postId || null,
    });
  };

  const getNotificationText = (n: Notification) => {
    const name = n.actor_profile?.username || 'Someone';
    switch (n.type) {
      case 'like': return `${name} liked your post`;
      case 'comment_like': return `${name} liked your comment`;
      case 'comment': return `${name} commented on your post`;
      case 'reply': return `${name} replied to your comment`;
      case 'friend_request': return `${name} sent you a friend request`;
      case 'friend_accept': return `${name} accepted your friend request`;
      case 'group_invite': return `${name} invited you to a group`;
      default: return `${name} interacted with you`;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': case 'comment_like': return '❤️';
      case 'comment': return '💬';
      case 'reply': return '↩️';
      case 'friend_request': return '🤝';
      case 'friend_accept': return '🎉';
      case 'group_invite': return '👥';
      default: return '🔔';
    }
  };

  const respondGroupInvite = async (notificationId: string, groupId: string, accept: boolean) => {
    if (!user) return false;

    setProcessingInvite(true);
    try {
      if (accept) {
        const { error: acceptError } = await supabase
          .from('chat_group_members')
          .update({ status: 'accepted' })
          .eq('group_id', groupId)
          .eq('user_id', user.id);

        if (acceptError) throw acceptError;
        toast.success('Joined group! 🎉');
      } else {
        const { error: declineError } = await supabase
          .from('chat_group_members')
          .delete()
          .eq('group_id', groupId)
          .eq('user_id', user.id);

        if (declineError) throw declineError;
        toast.success('Invite declined');
      }

      const { error: notificationError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (notificationError) throw notificationError;

      await fetchNotifications();
      return true;
    } catch (error) {
      console.error('Failed to respond to group invite:', error);
      toast.error('Could not process group invite');
      return false;
    } finally {
      setProcessingInvite(false);
    }
  };

  // ── Fetch posts ──
  const fetchPosts = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: postsData } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!postsData) { setLoading(false); return; }

    const userIds = [...new Set(postsData.map(p => p.user_id))];
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, is_premium')
      .in('id', userIds);

    const profileMap: Record<string, Profile> = {};
    (profilesData || []).forEach(p => { profileMap[p.id] = p; });

    const postIds = postsData.map(p => p.id);
    const { data: likesData } = await supabase
      .from('post_likes')
      .select('post_id, user_id')
      .in('post_id', postIds);

    const { data: commentsData } = await supabase
      .from('post_comments')
      .select('post_id')
      .in('post_id', postIds);

    const likeCounts: Record<string, number> = {};
    const userLikes: Set<string> = new Set();
    (likesData || []).forEach(l => {
      likeCounts[l.post_id] = (likeCounts[l.post_id] || 0) + 1;
      if (l.user_id === user.id) userLikes.add(l.post_id);
    });

    const commentCounts: Record<string, number> = {};
    (commentsData || []).forEach(c => {
      commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1;
    });

    const enriched: Post[] = postsData.map(p => ({
      ...p,
      profiles: profileMap[p.user_id],
      likes_count: likeCounts[p.id] || 0,
      comments_count: commentCounts[p.id] || 0,
      user_liked: userLikes.has(p.id),
    }));

    setPosts(enriched);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // ── Realtime ──
  useEffect(() => {
    const channel = supabase
      .channel('community-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, () => fetchPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, () => fetchPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => fetchNotifications())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, () => checkUnreadChats())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchPosts, fetchNotifications, checkUnreadChats]);

  // ── Content moderation ──
  const moderateContent = async (text: string): Promise<{ allowed: boolean; reason: string }> => {
    // Fast client-side check first
    const blocked = quickProfanityCheck(text);
    if (blocked) {
      return { allowed: false, reason: 'Content contains inappropriate language' };
    }
    // Then AI moderation
    try {
      const { data, error } = await supabase.functions.invoke('moderate-content', {
        body: { content: text },
      });
      if (error) return { allowed: true, reason: '' };
      return { allowed: data.allowed !== false, reason: data.reason || '' };
    } catch {
      return { allowed: true, reason: '' };
    }
  };

  // ── Create post ──
  const handleCreatePost = async () => {
    if (!user || !newContent.trim()) return;
    setPosting(true);

    const modResult = await moderateContent(newContent.trim());
    if (!modResult.allowed) {
      toast.error(`Post blocked: ${modResult.reason || 'Content violates community guidelines'}`, { duration: 5000 });
      setPosting(false);
      return;
    }

    let photoUrl: string | null = null;
    if (newPhoto) {
      const ext = newPhoto.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('catch-photos')
        .upload(path, newPhoto, { contentType: newPhoto.type, upsert: true });
      if (!upErr) {
        const { data } = await supabase.storage.from('catch-photos').createSignedUrl(path, 60 * 60 * 24 * 365);
        photoUrl = data?.signedUrl || null;
      }
    }

    const { error } = await supabase.from('community_posts').insert({
      user_id: user.id,
      content: newContent.trim(),
      photo_url: photoUrl,
      location: newLocation.trim() || null,
      fish_species: newSpecies.trim() || null,
    });

    if (error) { toast.error('Failed to create post'); }
    else {
      setNewContent('');
      setNewLocation('');
      setNewSpecies('');
      setNewPhoto(null);
      setPhotoPreview(null);
      setShowCompose(false);
      toast.success('Post shared! 🎣');
    }
    setPosting(false);
  };

  // ── Like / Unlike ──
  const toggleLike = async (postId: string, liked: boolean) => {
    if (!user) return;
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, user_liked: !liked, likes_count: p.likes_count + (liked ? -1 : 1) }
        : p
    ));

    if (liked) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
      // Send notification to post owner
      const post = posts.find(p => p.id === postId);
      if (post) createNotification(post.user_id, 'like', postId);
    }
  };

  // ── Comments ──
  const loadComments = async (postId: string) => {
    setLoadingComments(prev => new Set(prev).add(postId));
    const { data } = await supabase
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(c => c.user_id))];
      const commentIds = data.map(c => c.id);

      const [{ data: profiles }, { data: likesData }] = await Promise.all([
        supabase.from('profiles').select('id, username, avatar_url, is_premium').in('id', userIds),
        supabase.from('comment_likes').select('comment_id, user_id').in('comment_id', commentIds),
      ]);

      const pMap: Record<string, Profile> = {};
      (profiles || []).forEach(p => { pMap[p.id] = p; });

      const clCounts: Record<string, number> = {};
      const clUserLiked: Set<string> = new Set();
      (likesData || []).forEach((l: any) => {
        clCounts[l.comment_id] = (clCounts[l.comment_id] || 0) + 1;
        if (l.user_id === user?.id) clUserLiked.add(l.comment_id);
      });

      const allComments = data.map(c => ({
        ...c,
        profiles: pMap[c.user_id],
        likes_count: clCounts[c.id] || 0,
        user_liked: clUserLiked.has(c.id),
        replies: [] as Comment[],
      }));

      // Build tree: top-level + nested replies
      const commentById: Record<string, Comment> = {};
      allComments.forEach(c => { commentById[c.id] = c; });
      const topLevel: Comment[] = [];
      allComments.forEach(c => {
        if (c.parent_id && commentById[c.parent_id]) {
          commentById[c.parent_id].replies = [...(commentById[c.parent_id].replies || []), c];
        } else {
          topLevel.push(c);
        }
      });

      setCommentsMap(prev => ({ ...prev, [postId]: topLevel }));
    } else {
      setCommentsMap(prev => ({ ...prev, [postId]: [] }));
    }
    setLoadingComments(prev => { const n = new Set(prev); n.delete(postId); return n; });
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const n = new Set(prev);
      if (n.has(postId)) n.delete(postId);
      else { n.add(postId); if (!commentsMap[postId]) loadComments(postId); }
      return n;
    });
  };

  const toggleCommentLike = async (commentId: string, postId: string, liked: boolean) => {
    if (!user) return;

    // Helper to find a comment's owner recursively
    const findCommentOwner = (comments: Comment[]): string | null => {
      for (const c of comments) {
        if (c.id === commentId) return c.user_id;
        if (c.replies) {
          const found = findCommentOwner(c.replies);
          if (found) return found;
        }
      }
      return null;
    };

    const commentOwnerId = findCommentOwner(commentsMap[postId] || []);

    // Recursively update comment likes in nested tree
    const updateLike = (comments: Comment[]): Comment[] =>
      comments.map(c => {
        if (c.id === commentId) {
          return { ...c, user_liked: !liked, likes_count: c.likes_count + (liked ? -1 : 1) };
        }
        if (c.replies && c.replies.length > 0) {
          return { ...c, replies: updateLike(c.replies) };
        }
        return c;
      });

    setCommentsMap(prev => ({
      ...prev,
      [postId]: updateLike(prev[postId] || []),
    }));

    if (liked) {
      await supabase.from('comment_likes').delete().eq('comment_id', commentId).eq('user_id', user.id);
    } else {
      await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: user.id });
      // Notify comment/reply owner
      if (commentOwnerId) {
        await createNotification(commentOwnerId, 'comment_like', postId);
      }
    }
  };

  const handleCommentPhotoSelect = (postId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCommentPhoto(prev => ({ ...prev, [postId]: file }));
      const reader = new FileReader();
      reader.onload = () => setCommentPhotoPreview(prev => ({ ...prev, [postId]: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const submitComment = async (postId: string) => {
    const hasText = commentText[postId]?.trim();
    const hasPhoto = commentPhoto[postId];
    if (!user || (!hasText && !hasPhoto)) return;

    if (hasText) {
      const modResult = await moderateContent(commentText[postId].trim());
      if (!modResult.allowed) {
        toast.error(`Comment blocked: ${modResult.reason || 'Content violates community guidelines'}`, { duration: 5000 });
        return;
      }
    }

    let imageUrl: string | null = null;
    if (hasPhoto) {
      const file = commentPhoto[postId]!;
      const ext = file.name.split('.').pop();
      const path = `${user.id}/comment-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('catch-photos')
        .upload(path, file, { contentType: file.type, upsert: true });
      if (!upErr) {
        const { data } = await supabase.storage.from('catch-photos').createSignedUrl(path, 60 * 60 * 24 * 365);
        imageUrl = data?.signedUrl || null;
      }
    }

    const parentId = replyingTo[postId]?.commentId || null;

    const { error } = await supabase.from('post_comments').insert({
      post_id: postId,
      user_id: user.id,
      content: hasText ? commentText[postId].trim() : (imageUrl ? '📷' : ''),
      image_url: imageUrl,
      parent_id: parentId,
    });
    if (!error) {
      setCommentText(prev => ({ ...prev, [postId]: '' }));
      setCommentPhoto(prev => ({ ...prev, [postId]: null }));
      setCommentPhotoPreview(prev => ({ ...prev, [postId]: null }));
      setReplyingTo(prev => ({ ...prev, [postId]: null }));
      loadComments(postId);
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p
      ));
      const post = posts.find(p => p.id === postId);
      if (post) createNotification(post.user_id, 'comment', postId);
      // Notify the comment author if this is a reply
      if (parentId) {
        const allComments = commentsMap[postId] || [];
        const findComment = (comments: Comment[]): Comment | undefined => {
          for (const c of comments) {
            if (c.id === parentId) return c;
            const found = findComment(c.replies || []);
            if (found) return found;
          }
          return undefined;
        };
        const parentComment = findComment(allComments);
        if (parentComment) createNotification(parentComment.user_id, 'reply', postId);
      }
    }
  };

  const deletePost = async (postId: string) => {
    await supabase.from('community_posts').delete().eq('id', postId);
    setPosts(prev => prev.filter(p => p.id !== postId));
    toast.success('Post deleted');
  };

  const deleteComment = async (commentId: string, postId: string) => {
    await supabase.from('post_comments').delete().eq('id', commentId);
    setCommentsMap(prev => ({
      ...prev,
      [postId]: (prev[postId] || []).filter(c => c.id !== commentId),
    }));
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, comments_count: Math.max(0, p.comments_count - 1) } : p
    ));
    toast.success('Comment deleted');
  };

  const fetchFriends = useCallback(async () => {
    if (!user) return;
    setLoadingFriends(true);

    const { data: friendData } = await supabase
      .from('friendships')
      .select('*')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    if (friendData) {
      const otherIds = friendData.map(f =>
        f.requester_id === user.id ? f.addressee_id : f.requester_id
      );
      if (otherIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, is_premium')
          .in('id', otherIds);
        const pMap: Record<string, Profile> = {};
        (profiles || []).forEach(p => { pMap[p.id] = p; });

        setFriendships(friendData.map(f => ({
          ...f,
          requester_profile: pMap[f.requester_id],
          addressee_profile: pMap[f.addressee_id],
        })));
      } else {
        setFriendships([]);
      }
    }

    const { data: allP } = await supabase.from('profiles').select('id, username, avatar_url, is_premium');
    setAllProfiles((allP || []).filter(p => p.id !== user.id));
    setLoadingFriends(false);
  }, [user]);

  useEffect(() => { if (tab === 'friends' || tab === 'search') fetchFriends(); }, [tab, fetchFriends]);

  const sendFriendRequest = async (targetId: string) => {
    if (!user) return;
    const { error } = await supabase.from('friendships').insert({
      requester_id: user.id,
      addressee_id: targetId,
    });
    if (error) toast.error('Could not send request');
    else {
      toast.success('Friend request sent! 🤝');
      createNotification(targetId, 'friend_request');
      fetchFriends();
    }
  };

  const respondFriendRequest = async (friendshipId: string, accept: boolean) => {
    const friendship = friendships.find(f => f.id === friendshipId);
    if (accept) {
      await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId);
      toast.success('Friend added! 🎉');
      if (friendship) createNotification(friendship.requester_id, 'friend_accept');
    } else {
      await supabase.from('friendships').delete().eq('id', friendshipId);
    }
    fetchFriends();
  };

  const removeFriend = async (friendshipId: string) => {
    await supabase.from('friendships').delete().eq('id', friendshipId);
    toast.success('Friend removed');
    fetchFriends();
  };

  const getFriendshipStatus = (targetId: string) => {
    return friendships.find(
      f => (f.requester_id === targetId || f.addressee_id === targetId)
    );
  };

  // ── Photo handling ──
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPhoto(file);
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // ── Double-tap to like ──
  const DoubleTapLike = ({ onDoubleTap, children, className = '' }: { onDoubleTap: () => void; children: ReactNode; className?: string }) => {
    const lastTap = useRef(0);
    const [showHeart, setShowHeart] = useState(false);
    const handleTap = () => {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        onDoubleTap();
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 800);
      }
      lastTap.current = now;
    };
    return (
      <div onClick={handleTap} className={`relative select-none ${className}`}>
        {children}
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <Heart className="h-12 w-12 text-red-500 fill-current animate-ping" />
          </div>
        )}
      </div>
    );
  };

  // ── Render helpers ──
  const ProfileAvatar = ({ p, size = 'sm', clickable = true }: { p?: Profile; size?: 'sm' | 'md'; clickable?: boolean }) => {
    const avatar = (
      <Avatar className={size === 'md' ? 'h-10 w-10' : 'h-8 w-8'}>
        {p?.avatar_url ? <AvatarImage src={p.avatar_url} /> : null}
        <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
          {p?.username?.[0]?.toUpperCase() || '?'}
        </AvatarFallback>
      </Avatar>
    );
    if (clickable && p?.id) {
      return (
        <button onClick={() => navigate(`/profile/${p.id}`)} className="flex-shrink-0">
          {avatar}
        </button>
      );
    }
    return avatar;
  };

  const pendingRequests = friendships.filter(
    f => f.addressee_id === user?.id && f.status === 'pending'
  );
  const acceptedFriends = friendships.filter(f => f.status === 'accepted');
  const searchedProfiles = friendSearch.trim()
    ? allProfiles.filter(p =>
        (p.username || '').toLowerCase().includes(friendSearch.toLowerCase()) &&
        !getFriendshipStatus(p.id)
      )
    : [];

  return (
    <div className="container mx-auto px-4 py-6 lg:py-10 max-w-2xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground lg:text-3xl flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            Community
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Share your catches, connect with anglers
          </p>
        </div>

        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) markAllRead(); }}
            className="relative rounded-xl p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-12 z-50 w-80 max-h-96 overflow-y-auto rounded-2xl border border-border bg-card shadow-xl">
                <div className="sticky top-0 bg-card border-b border-border px-4 py-3 flex items-center justify-between rounded-t-2xl">
                  <h3 className="text-sm font-bold text-foreground">Notifications</h3>
                  {notifications.length > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-primary hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <div className="text-3xl mb-2">🔔</div>
                    <p className="text-xs text-muted-foreground">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map(n => {
                      const handleNotificationClick = () => {
                        if (n.type === 'group_invite' && n.group_id) {
                          setShowNotifications(false);
                          setSelectedInvite(n);
                          return;
                        }

                        setShowNotifications(false);
                        if (n.type === 'friend_request' || n.type === 'friend_accept') {
                          navigate(`/profile/${n.actor_id}`);
                        } else if (n.post_id) {
                          setTab('feed');
                          setExpandedComments(prev => {
                            const next = new Set(prev);
                            next.add(n.post_id!);
                            if (!commentsMap[n.post_id!]) loadComments(n.post_id!);
                            return next;
                          });
                          setTimeout(() => {
                            const el = document.getElementById(`post-${n.post_id}`);
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }, 200);
                        }
                      };
                      return (
                        <div
                          key={n.id}
                          onClick={handleNotificationClick}
                          className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors w-full text-left hover:bg-muted/50 ${
                            !n.read ? 'bg-primary/5' : ''
                          }`}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {n.actor_profile?.avatar_url ? (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={n.actor_profile.avatar_url} />
                                <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                                  {n.actor_profile?.username?.[0]?.toUpperCase() || '?'}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="h-8 w-8 flex items-center justify-center rounded-full bg-muted text-sm">
                                {getNotificationIcon(n.type)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-foreground">
                              {getNotificationText(n)}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          {!n.read && (
                            <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl bg-muted/50 p-1">
        {(['feed', 'search', 'chat', 'top', 'friends'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); if (t === 'chat') { setHasUnreadChats(false); setChatTargetId(null); } }}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
              tab === t
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'feed' ? '📰 Feed' : t === 'search' ? '🔍 Search' : t === 'chat' ? (
              <span className="relative inline-flex items-center gap-0.5">
                💬 Chat
                {hasUnreadChats && (
                  <span className="absolute -top-1 -right-2.5 h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                )}
              </span>
            ) : t === 'top' ? '🏆 Top' : `👥 Friends${pendingRequests.length > 0 ? ` (${pendingRequests.length})` : ''}`}
          </button>
        ))}
      </div>

      {/* ═══════════ FEED TAB ═══════════ */}
      {tab === 'feed' && (
        <div className="space-y-4">
          {!showCompose && (
            <Button
              onClick={() => setShowCompose(true)}
              className="w-full gap-2 rounded-2xl h-12 text-sm font-bold shadow-md"
            >
              <Send className="h-4 w-4" />
              Create Post
            </Button>
          )}
          {showCompose && (
            <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-start gap-3">
                <ProfileAvatar p={profile || undefined} size="md" />
                <div className="flex-1">
                  <Textarea
                    placeholder="Share your fishing story..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="min-h-[80px] border-0 bg-transparent p-0 text-sm resize-none focus-visible:ring-0 placeholder:text-muted-foreground/60"
                    maxLength={1000}
                  />
                </div>
              </div>

              {photoPreview && (
                <div className="relative">
                  <img src={photoPreview} alt="Preview" className="rounded-xl max-h-48 object-cover" />
                  <button
                    onClick={() => { setNewPhoto(null); setPhotoPreview(null); }}
                    className="absolute top-2 right-2 rounded-full bg-background/80 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-1.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    placeholder="Location"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="bg-transparent text-xs w-24 focus:outline-none placeholder:text-muted-foreground/60"
                    maxLength={100}
                  />
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-1.5">
                  <Fish className="h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    placeholder="Species"
                    value={newSpecies}
                    onChange={(e) => setNewSpecies(e.target.value)}
                    className="bg-transparent text-xs w-24 focus:outline-none placeholder:text-muted-foreground/60"
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <div className="flex gap-1">
                  <label className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                    <ImageIcon className="h-4 w-4" />
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setShowCompose(false); setNewContent(''); setNewPhoto(null); setPhotoPreview(null); }}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    disabled={!newContent.trim() || posting}
                    onClick={handleCreatePost}
                    className="gap-1.5"
                  >
                    {posting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    Post
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Posts feed */}
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full" />
              </div>
            ))
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">🎣</div>
              <h3 className="text-lg font-bold text-foreground">No posts yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Be the first to share your catch!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} id={`post-${post.id}`} className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                  <div className="flex items-center gap-3">
                    <ProfileAvatar p={post.profiles} size="md" />
                    <div>
                      <button
                        onClick={() => navigate(`/profile/${post.user_id}`)}
                        className="text-sm font-bold text-foreground hover:text-primary transition-colors text-left flex items-center gap-1"
                      >
                        {post.profiles?.username || 'Angler'} <PremiumCrown isPremium={(post.profiles as any)?.is_premium} />
                      </button>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        {post.location && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="h-3 w-3" /> {post.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {post.user_id === user?.id && (
                    <button
                      onClick={() => deletePost(post.id)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <DoubleTapLike onDoubleTap={() => { if (!post.user_liked) toggleLike(post.id, false); }}>
                <div className="px-4 pb-2">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{post.content}</p>
                  {post.fish_species && (
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      <Fish className="h-3 w-3" /> {post.fish_species}
                    </span>
                  )}
                  {/* Catch stats card */}
                  {((post as any).catch_length > 0 || (post as any).catch_weight > 0) && (
                    <div className="mt-2 rounded-xl bg-muted/50 border border-border/50 p-3 space-y-1">
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground">
                        {post.fish_species && (
                          <span className="flex items-center gap-1">🐟 {post.fish_species}</span>
                        )}
                        {(post as any).catch_length > 0 && (
                          <span className="flex items-center gap-1">📏 {((post as any).catch_length / 2.54).toFixed(1)} in</span>
                        )}
                        {(post as any).catch_weight > 0 && (
                          <span className="flex items-center gap-1">⚖️ {((post as any).catch_weight * 2.205).toFixed(1)} lb</span>
                        )}
                        {(post as any).catch_bait && (
                          <span className="flex items-center gap-1">🪤 {(post as any).catch_bait}</span>
                        )}
                        {(post as any).catch_water_temp != null && (post as any).catch_water_temp > 0 && (
                          <span className="flex items-center gap-1">🌡 Water: {(post as any).catch_water_temp}°F</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {post.photo_url && (
                  <div className="px-4 pb-3">
                    <img
                      src={getThumbnailUrl(post.photo_url, 600)}
                      alt="Catch"
                      className="rounded-xl w-full max-h-80 object-cover cursor-pointer"
                      loading="lazy"
                      onClick={(e) => { e.stopPropagation(); setLightboxUrl(post.photo_url!); }}
                    />
                  </div>
                )}
                </DoubleTapLike>

                <div className="flex items-center gap-1 border-t border-border px-2 py-1.5">
                  <button
                    onClick={() => toggleLike(post.id, post.user_liked)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      post.user_liked
                        ? 'text-red-500 bg-red-500/10'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${post.user_liked ? 'fill-current' : ''}`} />
                    {post.likes_count > 0 && post.likes_count}
                  </button>
                  <button
                    onClick={() => toggleComments(post.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      expandedComments.has(post.id)
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <MessageCircle className="h-4 w-4" />
                    {post.comments_count > 0 && post.comments_count}
                  </button>
                </div>

                {expandedComments.has(post.id) && (
                  <div className="border-t border-border bg-muted/20 px-4 py-3 space-y-3">
                    {loadingComments.has(post.id) ? (
                      <div className="flex justify-center py-2"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
                    ) : (
                      <>
                        {(commentsMap[post.id] || []).map((c) => {
                          const renderComment = (comment: Comment, isReply = false) => (
                            <div key={comment.id} className={`flex gap-2 group ${isReply ? 'ml-8' : ''}`}>
                              <ProfileAvatar p={comment.profiles} />
                              <div className="flex-1">
                                <DoubleTapLike onDoubleTap={() => { if (!comment.user_liked) toggleCommentLike(comment.id, post.id, false); }}>
                                  <div className="rounded-xl bg-card p-2.5">
                                    <div className="flex items-center justify-between">
                                      <button
                                        onClick={() => navigate(`/profile/${comment.user_id}`)}
                                        className="text-xs font-bold text-foreground hover:text-primary transition-colors flex items-center gap-0.5"
                                      >
                                        {comment.profiles?.username || 'Angler'} <PremiumCrown isPremium={(comment.profiles as any)?.is_premium} className="h-3 w-3" />
                                      </button>
                                      {comment.user_id === user?.id && (
                                        <button
                                          onClick={() => deleteComment(comment.id, post.id)}
                                          className="opacity-0 group-hover:opacity-100 rounded p-0.5 text-muted-foreground hover:text-destructive transition-all"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      )}
                                    </div>
                                    {comment.content && comment.content !== '📷' && (
                                      <p className="text-xs text-foreground mt-0.5">{comment.content}</p>
                                    )}
                                    {comment.image_url && (
                                      <img
                                        src={comment.image_url}
                                        alt="Comment image"
                                        className="mt-1.5 rounded-lg max-h-48 object-cover cursor-pointer"
                                        loading="lazy"
                                        onClick={() => window.open(comment.image_url!, '_blank')}
                                      />
                                    )}
                                  </div>
                                </DoubleTapLike>
                                <div className="flex items-center gap-2 mt-0.5 px-1">
                                  <button
                                    onClick={() => toggleCommentLike(comment.id, post.id, comment.user_liked)}
                                    className={`flex items-center gap-1 text-[10px] font-medium transition-colors ${
                                      comment.user_liked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                  >
                                    <Heart className={`h-3 w-3 ${comment.user_liked ? 'fill-current' : ''}`} />
                                    {comment.likes_count > 0 && comment.likes_count}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setReplyingTo(prev => ({ ...prev, [post.id]: { commentId: comment.id, username: comment.profiles?.username || 'Angler' } }));
                                      setCommentText(prev => ({ ...prev, [post.id]: '' }));
                                    }}
                                    className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    <Reply className="h-3 w-3" />
                                    Reply
                                  </button>
                                  <span className="text-[10px] text-muted-foreground">
                                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                          const renderWithReplies = (comment: Comment, depth = 0): React.ReactNode => (
                            <div key={comment.id} className="space-y-2">
                              {renderComment(comment, depth > 0)}
                              {(comment.replies || []).map(r => renderWithReplies(r, depth + 1))}
                            </div>
                          );
                          return renderWithReplies(c);
                        })}
                        {replyingTo[post.id] && (
                          <div className="ml-10 flex items-center gap-1.5 text-[10px] text-primary">
                            <Reply className="h-3 w-3" />
                            <span>Replying to <strong>{replyingTo[post.id]!.username}</strong></span>
                            <button
                              onClick={() => setReplyingTo(prev => ({ ...prev, [post.id]: null }))}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                        {commentPhotoPreview[post.id] && (
                          <div className="relative ml-10">
                            <img src={commentPhotoPreview[post.id]!} alt="Preview" className="rounded-lg max-h-32 object-cover" />
                            <button
                              onClick={() => { setCommentPhoto(prev => ({ ...prev, [post.id]: null })); setCommentPhotoPreview(prev => ({ ...prev, [post.id]: null })); }}
                              className="absolute top-1 right-1 rounded-full bg-background/80 p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <ProfileAvatar p={profile || undefined} />
                          <div className="flex-1 flex gap-1.5">
                            <Input
                              placeholder={replyingTo[post.id] ? `Reply to ${replyingTo[post.id]!.username}...` : 'Write a comment...'}
                              value={commentText[post.id] || ''}
                              onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                              onKeyDown={(e) => { if (e.key === 'Enter') submitComment(post.id); }}
                              className="h-8 text-xs rounded-lg bg-card"
                              maxLength={500}
                            />
                            <label className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors flex-shrink-0">
                              <ImageIcon className="h-3.5 w-3.5" />
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCommentPhotoSelect(post.id, e)} />
                            </label>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 flex-shrink-0"
                              disabled={!commentText[post.id]?.trim() && !commentPhoto[post.id]}
                              onClick={() => submitComment(post.id)}
                            >
                              <Send className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ═══════════ SEARCH TAB ═══════════ */}
      {tab === 'search' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts by content, species, or location..."
              value={feedSearch}
              onChange={(e) => setFeedSearch(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-muted/50 border-0"
              autoFocus
            />
          </div>

          {feedSearch.trim() ? (
            (() => {
              const q = feedSearch.toLowerCase();
              const peopleResults = allProfiles.filter(p =>
                (p.username || '').toLowerCase().includes(q)
              );
              const postResults = posts.filter(p =>
                p.content.toLowerCase().includes(q) ||
                (p.fish_species || '').toLowerCase().includes(q) ||
                (p.location || '').toLowerCase().includes(q) ||
                (p.profiles?.username || '').toLowerCase().includes(q)
              );
              const noResults = peopleResults.length === 0 && postResults.length === 0;

              return noResults ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-2">🔍</div>
                  <h3 className="text-sm font-bold text-foreground">No results found</h3>
                  <p className="text-xs text-muted-foreground mt-1">Try different keywords</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {peopleResults.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        👥 People ({peopleResults.length})
                      </h3>
                      <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
                        {peopleResults.slice(0, 10).map((p) => {
                          const existing = getFriendshipStatus(p.id);
                          const isFriend = existing?.status === 'accepted';
                          const isPending = existing?.status === 'pending';
                          return (
                            <div key={p.id} className="flex items-center justify-between px-4 py-3">
                              <div className="flex items-center gap-3">
                                <ProfileAvatar p={p} size="md" />
                                <p className="text-sm font-medium text-foreground">{p.username || 'Angler'}</p>
                              </div>
                              {isFriend ? (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <UserCheck className="h-3.5 w-3.5 text-green-500" /> Friends
                                </span>
                              ) : isPending ? (
                                <span className="text-xs text-muted-foreground">Pending...</span>
                              ) : (
                                <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => sendFriendRequest(p.id)}>
                                  <UserPlus className="h-3.5 w-3.5" /> Add
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {postResults.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        📰 Posts ({postResults.length})
                      </h3>
                      <div className="space-y-3">
                        {postResults.map((post) => (
                          <div key={post.id} className="rounded-2xl border border-border bg-card p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <ProfileAvatar p={post.profiles} />
                              <div>
                                <p className="text-xs font-bold text-foreground flex items-center gap-0.5">{post.profiles?.username || 'Angler'} <PremiumCrown isPremium={(post.profiles as any)?.is_premium} className="h-3 w-3" /></p>
                                <p className="text-[10px] text-muted-foreground">
                                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-foreground line-clamp-3">{post.content}</p>
                            {post.photo_url && (
                              <img src={getThumbnailUrl(post.photo_url, 400)} alt="Catch" className="mt-2 rounded-xl w-full max-h-48 object-cover cursor-pointer" loading="lazy" onClick={() => setLightboxUrl(post.photo_url!)} />
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              {post.fish_species && <span className="flex items-center gap-1"><Fish className="h-3 w-3" /> {post.fish_species}</span>}
                              {post.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {post.location}</span>}
                              <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {post.likes_count}</span>
                              <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {post.comments_count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-2">🔍</div>
              <h3 className="text-sm font-bold text-foreground">Search the community</h3>
              <p className="text-xs text-muted-foreground mt-1">Find anglers, posts by species, location, or username</p>
            </div>
          )}
        </div>
      )}

      {tab === 'chat' && (
        <CommunityChat
          initialChatUserId={chatTargetId}
          initialChatUsername={chatTargetName}
          initialChatAvatar={chatTargetAvatar}
          key={chatTargetId || 'default'}
        />
      )}

      {/* ═══════════ TOP TAB ═══════════ */}
      {tab === 'top' && <CommunityLeaderboard />}

      {/* ═══════════ FRIENDS TAB ═══════════ */}
      {tab === 'friends' && (
        <div className="space-y-5">
          <div>
            <div className="relative">
              <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search anglers by username..."
                value={friendSearch}
                onChange={(e) => setFriendSearch(e.target.value)}
                className="pl-10 h-10 rounded-xl bg-muted/50 border-0"
              />
            </div>
            {searchedProfiles.length > 0 && (
              <div className="mt-2 rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
                {searchedProfiles.slice(0, 8).map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ProfileAvatar p={p} size="md" />
                      <p className="text-sm font-medium text-foreground">{p.username || 'Angler'}</p>
                    </div>
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => sendFriendRequest(p.id)}>
                      <UserPlus className="h-3.5 w-3.5" /> Add
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {pendingRequests.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Pending Requests ({pendingRequests.length})
              </h3>
              <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
                {pendingRequests.map((f) => {
                  const requesterProfile = f.requester_profile;
                  return (
                    <div key={f.id} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProfileAvatar p={requesterProfile} size="md" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {requesterProfile?.username || 'Angler'}
                          </p>
                          <p className="text-xs text-muted-foreground">wants to be friends</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <Button size="sm" className="text-xs h-7" onClick={() => respondFriendRequest(f.id, true)}>
                          Accept
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => respondFriendRequest(f.id, false)}>
                          Decline
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Friends ({acceptedFriends.length})
            </h3>
            {loadingFriends ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            ) : acceptedFriends.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border border-dashed border-border">
                <div className="text-4xl mb-2">🤝</div>
                <h3 className="text-sm font-bold text-foreground">No friends yet</h3>
                <p className="text-xs text-muted-foreground mt-1">Search for anglers above to connect!</p>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
                {acceptedFriends.map((f) => {
                  const friendProfile = f.requester_id === user?.id ? f.addressee_profile : f.requester_profile;
                  return (
                    <div key={f.id} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProfileAvatar p={friendProfile} size="md" />
                        <div>
                          <p className="text-sm font-bold text-foreground">{friendProfile?.username || 'Angler'}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <UserCheck className="h-3 w-3 text-green-500" /> Friends
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                          onClick={() => {
                            const friendId = f.requester_id === user?.id ? f.addressee_id : f.requester_id;
                            setChatTargetId(friendId);
                            setChatTargetName(friendProfile?.username || null);
                            setChatTargetAvatar(friendProfile?.avatar_url || null);
                            setTab('chat');
                          }}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs text-muted-foreground"
                          onClick={() => removeFriend(f.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <Dialog
        open={!!selectedInvite}
        onOpenChange={(open) => {
          if (!open) setSelectedInvite(null);
        }}
      >
        <DialogContent className="max-w-sm rounded-2xl border border-border bg-card p-0">
          <VisuallyHidden><DialogTitle>Group Invite</DialogTitle></VisuallyHidden>
          <VisuallyHidden><DialogDescription>Accept or decline the group invitation</DialogDescription></VisuallyHidden>
          {selectedInvite && (
            <div className="space-y-4 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  👥
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Group invite</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selectedInvite.actor_profile?.username || 'Someone'} invited you to join their group.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  disabled={processingInvite || !selectedInvite.group_id}
                  onClick={async () => {
                    if (!selectedInvite.group_id) return;
                    const ok = await respondGroupInvite(selectedInvite.id, selectedInvite.group_id, false);
                    if (ok) setSelectedInvite(null);
                  }}
                >
                  Decline
                </Button>
                <Button
                  type="button"
                  className="rounded-xl gap-2"
                  disabled={processingInvite || !selectedInvite.group_id}
                  onClick={async () => {
                    if (!selectedInvite.group_id) return;
                    const ok = await respondGroupInvite(selectedInvite.id, selectedInvite.group_id, true);
                    if (ok) setSelectedInvite(null);
                  }}
                >
                  {processingInvite && <Loader2 className="h-4 w-4 animate-spin" />}
                  Accept
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!lightboxUrl} onOpenChange={() => setLightboxUrl(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none shadow-2xl flex items-center justify-center [&>button]:text-white [&>button]:hover:bg-white/20">
          <VisuallyHidden><DialogTitle>Image</DialogTitle></VisuallyHidden>
          <VisuallyHidden><DialogDescription>Full size image view</DialogDescription></VisuallyHidden>
          {lightboxUrl && (
            <img
              src={lightboxUrl}
              alt="Full size"
              className="max-w-full max-h-[90vh] object-contain rounded-lg cursor-zoom-out animate-in fade-in zoom-in-95 duration-200"
              onClick={() => setLightboxUrl(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunityPage;
