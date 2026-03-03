import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export type AdminRole = 'super_admin' | 'admin' | 'staff' | null;

interface AdminAuthContextType {
  user: User | null;
  role: AdminRole;
  loading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  canManageUsers: boolean;
  canManageFinances: boolean;
  canManageSettings: boolean;
  canManageRoles: boolean;
  canDeleteLogs: boolean;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AdminRole>(null);
  const [loading, setLoading] = useState(true);

  const checkRole = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .in('role', ['super_admin', 'admin', 'staff'])
      .order('role')
      .limit(1)
      .maybeSingle();

    if (data) {
      setRole(data.role as AdminRole);
    } else {
      setRole(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await checkRole(session.user.id);
      }
      setLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await checkRole(session.user.id);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isSuperAdmin = role === 'super_admin';
  const isAdmin = role === 'admin' || isSuperAdmin;
  const isStaff = role === 'staff' || isAdmin;

  return (
    <AdminAuthContext.Provider value={{
      user,
      role,
      loading,
      isAuthenticated: !!role,
      isSuperAdmin,
      isAdmin,
      isStaff,
      canManageUsers: isAdmin,
      canManageFinances: isAdmin,
      canManageSettings: isAdmin,
      canManageRoles: isSuperAdmin,
      canDeleteLogs: isSuperAdmin,
      signOut: async () => {
        await supabase.auth.signOut();
        setUser(null);
        setRole(null);
      },
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};
