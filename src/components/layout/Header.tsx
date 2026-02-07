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
      <header className="fixed top-3 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-24px)] max-w-sm mx-auto">
        <div className="glass-header border border-white/5 rounded-2xl backdrop-blur-md">
          <div className="flex items-center justify-between px-4 py-3 gap-2">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-3 shrink-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#141419] border border-gold/20 flex items-center justify-center shadow-gold overflow-hidden flex-shrink-0">
                <img src={logoNew} alt="CR7 Logo" className="w-full h-full object-cover scale-110" loading="eager" />
              </div>
              <div className="hidden xs:block">
                <h1 className="font-bold text-sm sm:text-base text-gradient-gold leading-none tracking-tight">CR7 ELITE</h1>
                <p className="text-[8px] sm:text-[10px] text-white/40 font-medium">منصة النخبة</p>
              </div>
            </motion.div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-1">
              {/* Balance */}
              <motion.div
                className="flex items-center gap-1 sm:gap-1.5 bg-[#141419] rounded-full px-2.5 sm:px-3 py-1.5 border border-white/5 shadow-inner shrink-0"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold flex-shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold text-gold whitespace-nowrap">
                  ${profile ? Number(profile.balance).toLocaleString() : '0'}
                </span>
              </motion.div>

              <div className="flex items-center gap-1 sm:gap-1">
                {/* Privacy */}
                <motion.button
                  onClick={() => setPrivacyOpen(true)}
                  className="p-1.5 sm:p-2 rounded-lg bg-[#141419] border border-white/5 hover:border-gold/30 active:scale-95 transition-all shrink-0 duration-200"
                  whileTap={{ scale: 0.95 }}
                >
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70" />
                </motion.button>

                {/* Security */}
                <motion.button
                  onClick={() => setSecurityOpen(true)}
                  className="p-1.5 sm:p-2 rounded-lg bg-[#141419] border border-white/5 hover:border-gold/30 active:scale-95 transition-all shrink-0 duration-200"
                  whileTap={{ scale: 0.95 }}
                >
                  <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70" />
                </motion.button>

                {/* Notifications */}
                <motion.button
                  onClick={() => setNotificationsOpen(true)}
                  className="relative p-1.5 sm:p-2 rounded-lg bg-[#141419] border border-white/5 hover:border-gold/30 active:scale-95 transition-all shrink-0 duration-200"
                  whileTap={{ scale: 0.95 }}
                >
                  <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70" />
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-gold rounded-full animate-pulse shadow-[0_0_6px_#D4AF37]" />
                </motion.button>

                {/* Logout */}
                <motion.button
                  onClick={signOut}
                  className="p-1.5 sm:p-2 rounded-lg bg-[#141419] border border-white/5 hover:border-red-500/30 hover:bg-red-500/5 active:scale-95 transition-all shrink-0 duration-200"
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16 sm:h-14" />

      {/* Modals */}
      <NotificationsModal open={notificationsOpen} onOpenChange={setNotificationsOpen} />
      <SecurityModal open={securityOpen} onOpenChange={setSecurityOpen} />
      <PrivacyModal open={privacyOpen} onOpenChange={setPrivacyOpen} />
    </>
  );
};
