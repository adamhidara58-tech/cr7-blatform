import { Home, Trophy, Users, Crown, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { memo, useCallback } from 'react';

interface NavItem {
  icon: React.ElementType;
  label: string;
  labelAr: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: Home, label: 'Home', labelAr: 'الرئيسية', path: '/' },
  { icon: Trophy, label: 'Challenges', labelAr: 'التحديات', path: '/challenges' },
  { icon: Users, label: 'Team', labelAr: 'الفريق', path: '/team' },
  { icon: Crown, label: 'VIP', labelAr: 'VIP', path: '/vip' },
  { icon: User, label: 'Profile', labelAr: 'حسابي', path: '/profile' },
];

const NavButton = memo(({ item, isActive, onClick }: { item: NavItem, isActive: boolean, onClick: (path: string) => void }) => {
  const Icon = item.icon;
  
  return (
    <button
      onClick={() => onClick(item.path)}
      className={`relative flex flex-col items-center justify-center flex-1 outline-none tap-highlight-transparent py-1 ${
        isActive ? 'text-gold' : 'text-white/30'
      }`}
    >
      <div className={`relative p-2 rounded-xl transition-colors duration-300 ${isActive ? 'bg-gold/10' : ''}`}>
        <Icon className="w-5.5 h-5.5" />
        {isActive && (
          <motion.div
            layoutId="activeGlow"
            className="absolute inset-0 bg-gold/20 blur-xl rounded-full"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
      </div>
      <span className={`text-[10px] font-bold mt-1 transition-colors duration-300 ${isActive ? 'text-gold' : ''}`}>
        {item.labelAr}
      </span>
      {isActive && (
        <motion.div
          className="absolute -bottom-1 w-1 h-1 bg-gold rounded-full shadow-[0_0_8px_#D4AF37]"
          layoutId="activeIndicator"
        />
      )}
    </button>
  );
});

NavButton.displayName = 'NavButton';

export const BottomNavigation = memo(() => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  return (
    <nav 
      className="w-full mt-auto glass-header border-t border-white/5 pb-safe pt-2 backdrop-blur-lg"
      style={{ transform: 'translateZ(0)' }}
    >
      <div className="flex items-center justify-around px-2 max-w-lg mx-auto h-16">
        {NAV_ITEMS.map((item) => (
          <NavButton 
            key={item.path} 
            item={item} 
            isActive={location.pathname === item.path} 
            onClick={handleNavigate} 
          />
        ))}
      </div>
    </nav>
  );
});

BottomNavigation.displayName = 'BottomNavigation';
