import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useRevenueCat } from '@/hooks/useRevenueCat';

interface AuthCtx {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isPremium: boolean;
  subscriptionLoading: boolean;
  subscriptionEnd: string | null;
  checkSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
  isPremium: false,
  subscriptionLoading: true,
  subscriptionEnd: null,
  checkSubscription: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbPremium, setDbPremium] = useState(false);
  const [dbPremiumLoaded, setDbPremiumLoaded] = useState(false);

  const {
    isPremium: rcPremium,
    subscriptionEnd: rcSubEnd,
    loading: rcLoading,
    refreshCustomerInfo,
    logoutRevenueCat,
    isNative,
  } = useRevenueCat();

  const checkSubscription = useCallback(async () => {
    await refreshCustomerInfo();
  }, [refreshCustomerInfo]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setDbPremium(false);
      setDbPremiumLoaded(true);
      return;
    }

    supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        setDbPremium(!!data?.is_premium);
        setDbPremiumLoaded(true);
      });
  }, [session]);

  useEffect(() => {
    if (session) {
      refreshCustomerInfo();
    }
  }, [session, refreshCustomerInfo]);

  const signOut = async () => {
    try {
      await logoutRevenueCat();
    } catch (err) {
      console.error('[Auth] RevenueCat logout error:', err);
    }

    await supabase.auth.signOut();

    setSession(null);
    setDbPremium(false);
    setDbPremiumLoaded(true);
  };

  const isPremium = isNative ? rcPremium : (rcPremium || dbPremium);
  const subscriptionLoading = isNative ? rcLoading : (rcLoading && !dbPremiumLoaded);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signOut,
        isPremium,
        subscriptionLoading,
        subscriptionEnd: rcSubEnd,
        checkSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);