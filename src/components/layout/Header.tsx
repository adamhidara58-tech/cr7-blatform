import { useState } from 'react';
import { Bell, Wallet, LogOut, Shield, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { NotificationsModal } from '@/components/modals/NotificationsModal';
import { SecurityModal } from '@/components/modals/SecurityModal';
import { PrivacyModal } from '@/components/modals/PrivacyModal';

export const Header = () => {
  const { profile, signOut } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 glass-header border-b border-border/50 w-full">
        <div className="flex items-center justify-between px-3 py-3 max-w-lg mx-auto gap-2">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2 shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
              <span className="font-display text-base sm:text-lg text-primary-foreground">CR7</span>
            </div>
            <div className="hidden xs:block">
              <h1 className="font-display text-base sm:text-lg text-gradient-gold leading-none">CR7 ELITE</h1>
              <p className="text-[8px] sm:text-[10px] text-muted-foreground">منصة النخبة</p>
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1">
            {/* Balance */}
            <motion.div
              className="flex items-center gap-1 sm:gap-1.5 glass-card rounded-full px-2.5 sm:px-3 py-1.5 border border-border/30 shrink-0"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              <span className="text-xs sm:text-sm font-semibold text-primary">
                ${profile ? Number(profile.balance).toLocaleString() : '0'}
              </span>
            </motion.div>

            <div className="flex items-center gap-1 sm:gap-1.5">
              {/* Privacy */}
              <motion.button
                onClick={() => setPrivacyOpen(true)}
                className="p-1.5 sm:p-2 rounded-full glass-card border border-border/30 hover:border-primary/50 transition-colors shrink-0"
                whileTap={{ scale: 0.95 }}
              >
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground" />
              </motion.button>

              {/* Security */}
              <motion.button
                onClick={() => setSecurityOpen(true)}
                className="p-1.5 sm:p-2 rounded-full glass-card border border-border/30 hover:border-primary/50 transition-colors shrink-0"
                whileTap={{ scale: 0.95 }}
              >
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground" />
              </motion.button>

              {/* Notifications */}
              <motion.button
                onClick={() => setNotificationsOpen(true)}
                className="relative p-1.5 sm:p-2 rounded-full glass-card border border-border/30 hover:border-primary/50 transition-colors shrink-0"
                whileTap={{ scale: 0.95 }}
              >
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
              </motion.button>

              {/* Logout */}
              <motion.button
                onClick={signOut}
                className="p-1.5 sm:p-2 rounded-full glass-card border border-border/30 hover:border-destructive/50 hover:bg-destructive/10 transition-colors shrink-0"
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground" />
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <NotificationsModal open={notificationsOpen} onOpenChange={setNotificationsOpen} />
      <SecurityModal open={securityOpen} onOpenChange={setSecurityOpen} />
      <PrivacyModal open={privacyOpen} onOpenChange={setPrivacyOpen} />
    </>
  );
};
