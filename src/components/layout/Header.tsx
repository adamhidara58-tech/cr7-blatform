import { useState, useEffect, useCallback, memo } from 'react';
import { Bell, Wallet, LogOut, MessageCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { NotificationsModal } from '@/components/modals/NotificationsModal';
import { SecurityModal } from '@/components/modals/SecurityModal';
import { PrivacyModal } from '@/components/modals/PrivacyModal';
import { supabase } from '@/integrations/supabase/client';
import logoNewWebp from '@/assets/logo-new.webp';

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

  // Check for new transactions to show the yellow dot
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

    // Subscribe to new transactions
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
      <header className="sticky top-0 z-40 glass-header border-b border-white/5 w-full will-change-transform" style={{ transform: 'translateZ(0)' }}>
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto gap-2">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3 shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#141419] border border-gold/20 flex items-center justify-center shadow-gold overflow-hidden">
              <img 
                src={logoNewWebp} 
                alt="CR7 Logo" 
                loading="eager"
                width={44}
                height={44}
                decoding="async"
                className="w-full h-full object-cover scale-110 will-change-transform" 
              />
            </div>
            <div className="hidden xs:block">
              <h1 className="font-bold text-base sm:text-lg text-gradient-gold leading-none tracking-tight">CR7 ELITE</h1>
              <p className="text-[9px] sm:text-[11px] text-white/40 font-medium">منصة النخبة</p>
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1">
            {/* Balance */}
            <motion.div
              className="flex items-center gap-1.5 sm:gap-2 bg-[#141419] rounded-full px-3 sm:px-4 py-1.5 border border-white/5 shadow-inner shrink-0"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold" />
              <span className="text-xs sm:text-sm font-bold text-gold min-w-[60px]">
                {showBalance 
                  ? `$${profile ? Number(profile.balance).toLocaleString() : '0'}`
                  : '••••••'}
              </span>
              <button 
                onClick={toggleBalance}
                className="p-1 hover:bg-white/5 rounded-full transition-colors"
                aria-label={showBalance ? "Hide balance" : "Show balance"}
              >
                {showBalance ? (
                  <Eye className="w-3.5 h-3.5 text-white/40" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-white/40" />
                )}
              </button>
            </motion.div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Support Button */}
              <motion.a
                href="https://t.me/c7r_support"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-[#141419] border border-white/5 hover:border-gold/30 transition-all shrink-0"
                whileTap={{ scale: 0.9 }}
              >
                <MessageCircle className="w-4 h-4 text-white/70" />
              </motion.a>

              {/* Notifications */}
              <motion.button
                onClick={handleOpenNotifications}
                className="relative p-2 rounded-full bg-[#141419] border border-white/5 hover:border-gold/30 transition-all shrink-0"
                whileTap={{ scale: 0.95 }}
              >
                <Bell className="w-4 h-4 text-white/70" />
                {hasNewNotifications && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_8px_#facc15]" />
                )}
              </motion.button>

              {/* Logout */}
              <motion.button
                onClick={signOut}
                className="p-2 rounded-full bg-[#141419] border border-red-500/20 hover:border-red-500/30 hover:bg-red-500/5 transition-all shrink-0"
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="w-4 h-4 text-red-500/70" />
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Modals - Lazy loaded via state if possible, but here kept for logic consistency */}
      <NotificationsModal open={notificationsOpen} onOpenChange={setNotificationsOpen} />
      <SecurityModal open={securityOpen} onOpenChange={setSecurityOpen} />
      <PrivacyModal open={privacyOpen} onOpenChange={setPrivacyOpen} />
    </>
  );
});

Header.displayName = 'Header';
