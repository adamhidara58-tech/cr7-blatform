import React, { useState } from 'react';
import { Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, ArrowDownCircle, Settings, History, LogOut,
  Menu, X, ShieldCheck, Trophy, Star, Loader2, UserCog, Wallet,
  ChevronLeft, ChevronRight, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAdminAuth, AdminRole } from '@/hooks/useAdminAuth';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  roles: AdminRole[];
  badge?: number;
}

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, loading, isAuthenticated, isSuperAdmin, isAdmin, signOut } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060608] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
    toast.info('تم تسجيل الخروج');
    navigate('/admin/login');
  };

  const navItems: NavItem[] = [
    { name: 'نظرة عامة', path: '/admin', icon: LayoutDashboard, roles: ['super_admin', 'admin', 'staff'] },
    { name: 'المستخدمين', path: '/admin/users', icon: Users, roles: ['super_admin', 'admin', 'staff'] },
    { name: 'المالية', path: '/admin/withdrawals', icon: Wallet, roles: ['super_admin', 'admin', 'staff'] },
    { name: 'VIP', path: '/admin/vip', icon: Star, roles: ['super_admin', 'admin'] },
    { name: 'التحديات', path: '/admin/challenges', icon: Trophy, roles: ['super_admin', 'admin'] },
    { name: 'السجلات', path: '/admin/logs', icon: History, roles: ['super_admin', 'admin'] },
    { name: 'الأدوار', path: '/admin/roles', icon: UserCog, roles: ['super_admin'] },
    { name: 'الإعدادات', path: '/admin/settings', icon: Settings, roles: ['super_admin', 'admin'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(role));

  const roleLabel: Record<string, string> = {
    super_admin: 'مدير أعلى',
    admin: 'مدير',
    staff: 'موظف',
  };

  const roleBadgeColor: Record<string, string> = {
    super_admin: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    admin: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    staff: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {/* Logo */}
      <div className={cn("flex items-center gap-3 p-5 border-b border-white/[0.06]", collapsed && !mobile && "justify-center px-3")}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
          <ShieldCheck className="w-5 h-5 text-black" />
        </div>
        {(!collapsed || mobile) && (
          <div className="min-w-0">
            <h1 className="font-display text-lg font-bold text-white leading-none tracking-tight">CR7 ADMIN</h1>
            <span className={cn("text-[10px] px-1.5 py-0.5 rounded border mt-1 inline-block", roleBadgeColor[role || ''])}>
              {roleLabel[role || '']}
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => mobile && setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200',
                collapsed && !mobile && "justify-center px-2"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="admin-nav-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full"
                />
              )}
              <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-primary")} />
              {(!collapsed || mobile) && (
                <span className="text-sm font-medium truncate">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/[0.06]">
        {(!collapsed || mobile) && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
          </div>
        )}
        <Button 
          variant="ghost" 
          className={cn(
            "w-full gap-3 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10",
            collapsed && !mobile ? "justify-center px-2" : "justify-start"
          )}
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {(!collapsed || mobile) && <span className="text-sm">خروج</span>}
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#060608] text-foreground flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden md:flex flex-col border-r border-white/[0.06] bg-[#0a0a0e] transition-all duration-300 shrink-0",
          collapsed ? "w-[68px]" : "w-60"
        )}
        dir="ltr"
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute bottom-20 -right-3 w-6 h-6 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors z-10 hidden md:flex"
          style={{ left: collapsed ? '53px' : '227px' }}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-white/[0.06] bg-[#0a0a0e]/80 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden text-zinc-400" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <h2 className="text-sm font-medium text-zinc-300 hidden md:block">
              {filteredNav.find(n => n.path === location.pathname)?.name || 'لوحة التحكم'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-200">
              <Bell className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0e] border-r border-white/[0.06] flex flex-col md:hidden"
              dir="ltr"
            >
              <div className="absolute top-4 right-4">
                <Button variant="ghost" size="icon" className="text-zinc-400" onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
