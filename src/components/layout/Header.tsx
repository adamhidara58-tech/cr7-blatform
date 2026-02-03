import { Bell, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { mockUser } from '@/data/mockData';

export const Header = () => {
  return (
    <header className="sticky top-0 z-40 glass border-b border-border">
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
        <div className="flex items-center gap-3">
          {/* Balance */}
          <motion.div
            className="flex items-center gap-1.5 bg-secondary/50 rounded-full px-3 py-1.5"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">
              ${mockUser.balance.toLocaleString()}
            </span>
          </motion.div>

          {/* Notifications */}
          <motion.button
            className="relative p-2 rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Bell className="w-5 h-5 text-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
          </motion.button>
        </div>
      </div>
    </header>
  );
};
