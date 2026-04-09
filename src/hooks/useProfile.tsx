import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  is_premium?: boolean;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const getFallbackProfile = (): Profile | null => {
    if (!user) return null;
    return {
      id: user.id,
      username:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        null,
      avatar_url:
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        null,
    };
  };

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, is_premium')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
    }

    if (data) {
      setProfile(data as Profile);
      setLoading(false);
      return;
    }

    const fallback = getFallbackProfile();
    if (!fallback) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const { data: created, error: createError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          username: fallback.username,
          avatar_url: fallback.avatar_url,
        },
        { onConflict: 'id' }
      )
      .select('id, username, avatar_url, is_premium')
      .maybeSingle();

    if (createError) {
      console.error('Error creating fallback profile:', createError);
    }

    setProfile((created as Profile | null) ?? fallback);
    setLoading(false);
  };

  useEffect(() => {
    void fetchProfile();
  }, [user]);

  return { profile, loading, refetch: fetchProfile };
};
