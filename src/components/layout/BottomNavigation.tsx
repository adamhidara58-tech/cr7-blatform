import { Home, Trophy, Users, Crown, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface NavItem {
  icon: React.ElementType;
  label: string;
  labelAr: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Home', labelAr: 'الرئيسية', path: '/' },
  { icon: Trophy, label: 'Challenges', labelAr: 'التحديات', path: '/challenges' },
  { icon: Users, label: 'Team', labelAr: 'الفريق', path: '/team' },
  { icon: Crown, label: 'VIP', labelAr: 'VIP', path: '/vip' },
  { icon: User, label: 'Profile', labelAr: 'حسابي', path: '/profile' },
];

export const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav border-t border-border/50 safe-area-bottom">
      <div className="flex items-center justify-around py-3 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all duration-300 min-w-[64px] ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              whileTap={{ scale: 0.9 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/15 rounded-2xl border border-primary/30"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                className={`w-5 h-5 mb-1 transition-all duration-300 relative z-10 ${
                  isActive ? 'text-primary' : ''
                }`}
              />
              <span className={`text-[10px] font-medium relative z-10 ${isActive ? 'text-primary' : ''}`}>
                {item.labelAr}
              </span>
              {isActive && (
                <motion.div
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-gradient-gold rounded-full"
                  layoutId="activeDot"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};
