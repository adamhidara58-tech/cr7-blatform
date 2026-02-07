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
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-header border-t border-white/5 pb-safe pt-2">
      <div className="flex items-center justify-around px-2 max-w-lg mx-auto h-16 sm:h-14">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center justify-center flex-1 transition-colors duration-200 ${
                isActive ? 'text-gold' : 'text-white/30'
              }`}
              whileTap={{ scale: 0.9 }}
            >
              <div className={`relative p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-gold/10' : ''}`}>
                <Icon
                  className={`w-5 h-5 sm:w-5.5 sm:h-5.5 transition-colors duration-200 ${
                    isActive ? 'text-gold' : ''
                  }`}
                />
                {isActive && (
                  <motion.div
                    layoutId="activeGlow"
                    className="absolute inset-0 bg-gold/20 blur-lg rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
              <span className={`text-[9px] font-bold mt-1 transition-colors duration-200 ${isActive ? 'text-gold' : ''}`}>
                {item.labelAr}
              </span>
              {isActive && (
                <motion.div
                  className="absolute -bottom-1 w-1 h-1 bg-gold rounded-full shadow-[0_0_6px_#D4AF37]"
                  layoutId="activeIndicator"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};
