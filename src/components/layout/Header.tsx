import { useState } from 'react';
import { Bell, Wallet, LogOut, Shield, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { NotificationsModal } from '@/components/modals/NotificationsModal';
import { SecurityModal } from '@/components/modals/SecurityModal';
import { PrivacyModal } from '@/components/modals/PrivacyModal';
import logoNew from '@/assets/logo-new.png';

export const Header = () => {
  const { profile, signOut } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 glass-header border-b border-white/5 w-full">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto gap-2">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3 shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#141419] border border-gold/20 flex items-center justify-center shadow-gold overflow-hidden">
              <img src={logoNew} alt="CR7 Logo" className="w-full h-full object-cover scale-110" />
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
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold" />
              <span className="text-xs sm:text-sm font-bold text-gold">
                ${profile ? Number(profile.balance).toLocaleString() : '0'}
              </span>
            </motion.div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Privacy */}
              <motion.button
                onClick={() => setPrivacyOpen(true)}
                className="p-2 rounded-full bg-[#141419] border border-white/5 hover:border-gold/30 transition-all shrink-0"
                whileTap={{ scale: 0.95 }}
              >
                <Eye className="w-4 h-4 text-white/70" />
              </motion.button>

              {/* Security */}
              <motion.button
                onClick={() => setSecurityOpen(true)}
                className="p-2 rounded-full bg-[#141419] border border-white/5 hover:border-gold/30 transition-all shrink-0"
                whileTap={{ scale: 0.95 }}
              >
                <Shield className="w-4 h-4 text-white/70" />
              </motion.button>

              {/* Notifications */}
              <motion.button
                onClick={() => setNotificationsOpen(true)}
                className="relative p-2 rounded-full bg-[#141419] border border-white/5 hover:border-gold/30 transition-all shrink-0"
                whileTap={{ scale: 0.95 }}
              >
                <Bell className="w-4 h-4 text-white/70" />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-gold rounded-full animate-pulse shadow-[0_0_8px_#D4AF37]" />
              </motion.button>

              {/* Logout */}
              <motion.button
                onClick={signOut}
                className="p-2 rounded-full bg-[#141419] border border-white/5 hover:border-red-500/30 hover:bg-red-500/5 transition-all shrink-0"
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="w-4 h-4 text-white/70" />
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
