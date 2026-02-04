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
      <header className="sticky top-0 z-40 glass-header border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
              <span className="font-display text-lg text-primary-foreground">CR7</span>
            </div>
            <div>
              <h1 className="font-display text-lg text-gradient-gold leading-none">CR7 ELITE</h1>
              <p className="text-[10px] text-muted-foreground">منصة النخبة</p>
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Balance */}
            <motion.div
              className="flex items-center gap-1.5 glass-card rounded-full px-3 py-1.5 border border-border/30"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                ${profile ? Number(profile.balance).toLocaleString() : '0'}
              </span>
            </motion.div>

            {/* Privacy */}
            <motion.button
              onClick={() => setPrivacyOpen(true)}
              className="p-2 rounded-full glass-card border border-border/30 hover:border-primary/50 transition-colors"
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <Eye className="w-4 h-4 text-foreground" />
            </motion.button>

            {/* Security */}
            <motion.button
              onClick={() => setSecurityOpen(true)}
              className="p-2 rounded-full glass-card border border-border/30 hover:border-primary/50 transition-colors"
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Shield className="w-4 h-4 text-foreground" />
            </motion.button>

            {/* Notifications */}
            <motion.button
              onClick={() => setNotificationsOpen(true)}
              className="relative p-2 rounded-full glass-card border border-border/30 hover:border-primary/50 transition-colors"
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <Bell className="w-4 h-4 text-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
            </motion.button>

            {/* Logout */}
            <motion.button
              onClick={signOut}
              className="p-2 rounded-full glass-card border border-border/30 hover:border-destructive/50 hover:bg-destructive/10 transition-colors"
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <LogOut className="w-4 h-4 text-foreground" />
            </motion.button>
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
