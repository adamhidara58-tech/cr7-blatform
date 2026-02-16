import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface Profile {
  id: string;
  username: string;
  email: string;
  balance: number;
  total_earned: number;
  vip_level: number;
  referral_code: string;
  referred_by: string | null;
  daily_challenges_completed: number;
  daily_challenges_limit: number;
  avatar_url: string | null;
  referral_discount: number;
  created_at: string;
  updated_at: string;
  last_withdrawal_at: string | null;
  role?: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isProfileLoading: boolean;
  signUp: (email: string, password: string, username: string, referralCode?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const queryClient = useQueryClient();

  // Fetch profile using React Query for caching and performance
  const { 
    data: profile, 
    isLoading: isProfileLoading,
    refetch: refreshProfile 
  } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      
      // If profile doesn't exist, we might want to handle it (though trigger should create it)
      return data as Profile | null;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(500 * (attemptIndex + 1), 3000),
  });

  useEffect(() => {
    // Initial session check
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsAuthLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          queryClient.invalidateQueries({ queryKey: ['profile'] });
        }
        
        if (event === 'SIGNED_OUT') {
          setProfileState(null);
          queryClient.clear();
        }
        
        setIsAuthLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [queryClient]);

  // Helper to clear profile state on logout
  const setProfileState = (val: any) => {
    queryClient.setQueryData(['profile', user?.id], val);
  };

  const signUp = async (email: string, password: string, username: string, referralCode?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username,
          referral_code: referralCode || null,
        }
      }
    });
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (!error) {
      // Immediate invalidation to trigger fetch
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile: profile ?? null,
      loading: isAuthLoading,
      isProfileLoading,
      signUp,
      signIn,
      signOut,
      refreshProfile: async () => { await refreshProfile(); }
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
