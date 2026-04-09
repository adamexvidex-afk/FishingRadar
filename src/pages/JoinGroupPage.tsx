import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Users, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const JoinGroupPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code');

  const [status, setStatus] = useState<'loading' | 'joining' | 'success' | 'error' | 'already'>('loading');
  const [groupName, setGroupName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      // Store intent and redirect to login
      localStorage.setItem('fr_join_group_code', code || '');
      navigate('/login', { replace: true });
      return;
    }
    if (!code) {
      setStatus('error');
      setErrorMsg('Invalid invite link');
      return;
    }

    const joinViaCode = async () => {
      setStatus('joining');

      // Find group by invite code
      const { data: group, error: groupErr } = await (supabase
        .from('chat_groups')
        .select('*') as any)
        .eq('invite_code', code)
        .maybeSingle();

      if (groupErr || !group) {
        setStatus('error');
        setErrorMsg('Group not found or invalid invite link');
        return;
      }

      setGroupName(group.name);

      // Check if already a member
      const { data: existing } = await supabase
        .from('chat_group_members')
        .select('id, status')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        if (existing.status === 'accepted') {
          setStatus('already');
        } else {
          // Accept pending invite
          await supabase.from('chat_group_members').update({ status: 'accepted' }).eq('id', existing.id);
          setStatus('success');
        }
        return;
      }

      // Join as new member
      const { error: joinErr } = await supabase.from('chat_group_members').insert({
        group_id: group.id,
        user_id: user.id,
        role: 'member',
        status: 'accepted',
      });

      if (joinErr) {
        setStatus('error');
        setErrorMsg('Failed to join group');
      } else {
        setStatus('success');
      }
    };

    joinViaCode();
  }, [user, authLoading, code, navigate]);

  const goToChat = () => navigate('/community');

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center space-y-4">
      {(status === 'loading' || status === 'joining') && (
        <>
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Joining group...</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Joined {groupName}!</h2>
          <p className="text-sm text-muted-foreground">You're now a member of this group.</p>
          <Button className="rounded-xl gap-2" onClick={goToChat}>
            <Users className="h-4 w-4" /> Open Chat
          </Button>
        </>
      )}

      {status === 'already' && (
        <>
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Already a member!</h2>
          <p className="text-sm text-muted-foreground">You're already in {groupName}.</p>
          <Button className="rounded-xl gap-2" onClick={goToChat}>
            <Users className="h-4 w-4" /> Open Chat
          </Button>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Couldn't join</h2>
          <p className="text-sm text-muted-foreground">{errorMsg}</p>
          <Button variant="outline" className="rounded-xl" onClick={() => navigate('/')}>Go Home</Button>
        </>
      )}
    </div>
  );
};

export default JoinGroupPage;
