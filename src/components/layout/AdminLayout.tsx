import React, { useState, useEffect } from 'react';
import { Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ArrowDownCircle, 
  Settings, 
  History, 
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Trophy,
  Star,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Check if user has admin role
        const { data: roleData, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (error) {
          console.error('Role check error:', error);
          setIsAdmin(session.user.email === 'fhncis12@gmail.com');
        } else {
          setIsAdmin(!!roleData || session.user.email === 'fhncis12@gmail.com');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
        return;
      }
      
      if (session?.user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .maybeSingle();
        
        setIsAdmin(!!roleData || session.user.email === 'fhncis12@gmail.com');
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.info('تم تسجيل الخروج من لوحة التحكم');
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'إدارة المستخدمين', path: '/admin/users', icon: Users },
    { name: 'طلبات السحب', path: '/admin/withdrawals', icon: ArrowDownCircle },
    { name: 'باقات VIP', path: '/admin/vip', icon: Star },
    { name: 'التحديات', path: '/admin/challenges', icon: Trophy },
    { name: 'سجل النشاطات', path: '/admin/logs', icon: History },
    { name: 'الإعدادات', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground flex overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border/50 bg-card/50 backdrop-blur-xl" dir="ltr">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
            <ShieldCheck className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-lg text-gradient-gold leading-none">CR7 ADMIN</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">لوحة التحكم</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border/50">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5" />
            <span>تسجيل الخروج</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border/50 bg-card/50 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-gradient-gold">CR7 ADMIN</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border/50 p-6 md:hidden"
              dir="ltr"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="font-display text-gradient-gold">CR7 ADMIN</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      location.pathname === item.path
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 mt-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-5 h-5" />
                  <span>تسجيل الخروج</span>
                </Button>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
