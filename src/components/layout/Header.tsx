import { useState, useEffect, useCallback, memo } from 'react';
import { Bell, Wallet, LogOut, MessageCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { NotificationsModal } from '@/components/modals/NotificationsModal';
import { SecurityModal } from '@/components/modals/SecurityModal';
import { PrivacyModal } from '@/components/modals/PrivacyModal';
import { supabase } from '@/integrations/supabase/client';
import logoNewWebp from '@/assets/logo-new.webp';

// Updated at: 2026-02-11 11:15:00 - Floating Header with Glass Effect
export const Header = memo(() => {
  const { profile, signOut } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [showBalance, setShowBalance] = useState(() => {
    try {
      const saved = localStorage.getItem('showBalance');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const toggleBalance = useCallback(() => {
    setShowBalance(prev => {
      const newState = !prev;
      localStorage.setItem('showBalance', JSON.stringify(newState));
      return newState;
    });
  }, []);

  useEffect(() => {
    if (!profile?.id) return;

    const checkNotifications = async () => {
      const { data } = await supabase
        .from('transactions')
        .select('id, created_at')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        const lastSeenId = localStorage.getItem(`lastSeenTx_${profile.id}`);
        if (lastSeenId !== data.id) {
          setHasNewNotifications(true);
        }
      }
    };

    checkNotifications();

    const channel = supabase
      .channel(`header-notifications-${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${profile.id}`,
        },
        () => {
          setHasNewNotifications(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const handleOpenNotifications = useCallback(async () => {
    setNotificationsOpen(true);
    setHasNewNotifications(false);
    
    if (profile?.id) {
      const { data } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (data) {
        localStorage.setItem(`lastSeenTx_${profile.id}`, data.id);
      }
    }
  }, [profile?.id]);

  return (
    <>
      {/* Floating Header Container */}
      <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-none px-4 pt-4">
        <header 
          className="max-w-lg mx-auto pointer-events-auto glass-header rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden will-change-transform"
          style={{ transform: 'translateZ(0)' }}
        >
          <div className="flex items-center justify-between px-4 py-2.5 gap-2">
            {/* Logo Section */}
            <motion.div
              className="flex items-center gap-2.5 shrink-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="w-10 h-10 rounded-full bg-[#141419] border border-gold/20 flex items-center justify-center shadow-gold overflow-hidden">
                <img 
                  src={logoNewWebp} 
                  alt="CR7 Logo" 
                  loading="eager"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain" 
                />
              </div>
              <div className="hidden xs:block">
                <h1 className="font-bold text-sm text-gradient-gold leading-none tracking-tight">CR7 ELITE</h1>
                <p className="text-[8px] text-white/40 font-medium">منصة النخبة</p>
              </div>
            </motion.div>

            {/* Actions Section */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {/* Balance Display */}
              <motion.div
                className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 rounded-full px-3 py-1.5 border border-white/5 transition-colors shrink-0"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Wallet className="w-3.5 h-3.5 text-gold" />
                <span className="text-xs font-bold text-gold min-w-[50px]">
                  {showBalance 
                    ? `$${profile ? Number(profile.balance).toLocaleString() : '0'}`
                    : '••••••'}
                </span>
                <button 
                  onClick={toggleBalance}
                  className="p-0.5 hover:bg-white/10 rounded-full transition-colors active:scale-90"
                  aria-label={showBalance ? "Hide balance" : "Show balance"}
                >
                  {showBalance ? (
                    <Eye className="w-3 h-3 text-white/40" />
                  ) : (
                    <EyeOff className="w-3 h-3 text-white/40" />
                  )}
                </button>
              </motion.div>

              <div className="flex items-center gap-1">
                {/* Support */}
                <motion.a
                  href="https://t.me/c7r_support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/5 border border-white/5 hover:border-gold/30 hover:bg-white/10 transition-all shrink-0 active:scale-90"
                  whileTap={{ scale: 0.9 }}
                >
                  <MessageCircle className="w-3.5 h-3.5 text-white/70" />
                </motion.a>

                {/* Notifications */}
                <motion.button
                  onClick={handleOpenNotifications}
                  className="relative p-2 rounded-full bg-white/5 border border-white/5 hover:border-gold/30 hover:bg-white/10 transition-all shrink-0 active:scale-90"
                  whileTap={{ scale: 0.95 }}
                >
                  <Bell className="w-3.5 h-3.5 text-white/70" />
                  {hasNewNotifications && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_8px_#facc15]" />
                  )}
                </motion.button>

                {/* Logout */}
                <motion.button
                  onClick={signOut}
                  className="p-2 rounded-full bg-red-500/5 border border-red-500/10 hover:border-red-500/30 hover:bg-red-500/10 transition-all shrink-0 active:scale-90"
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500/70" />
                </motion.button>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Modals */}
      <NotificationsModal open={notificationsOpen} onOpenChange={setNotificationsOpen} />
      <SecurityModal open={securityOpen} onOpenChange={setNotificationsOpen} />
      <PrivacyModal open={privacyOpen} onOpenChange={setPrivacyOpen} />
    </>
  );
});

Header.displayName = 'Header';
