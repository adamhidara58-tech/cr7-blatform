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
      className={`relative flex flex-col items-center justify-center flex-1 outline-none tap-highlight-transparent py-1 transition-all duration-300 active:scale-95 ${
        isActive ? 'text-gold' : 'text-white/30 hover:text-white/50'
      }`}
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
      }}
    >
      <div className={`relative p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-gold/10 scale-110' : 'hover:bg-white/5'}`}>
        <Icon className="w-5.5 h-5.5" />
        {isActive && (
          <motion.div
            layoutId="activeGlow"
            className="absolute inset-0 bg-gold/20 blur-xl rounded-full"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
      </div>
      <span className={`text-[10px] font-bold mt-1 transition-all duration-300 ${isActive ? 'text-gold' : ''}`}>
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
    <div 
      className="fixed bottom-0 left-0 right-0 z-[100] pointer-events-none"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="px-4 pb-4 pt-2">
          <nav 
            className="max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto pointer-events-auto glass-navbar rounded-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.6),0_8px_32px_rgba(0,0,0,0.5)]"
          style={{ 
            transform: 'translateZ(0)',
            willChange: 'transform',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
          }}
        >
          <div className="flex items-center justify-around px-2 h-16">
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
      </div>
    </div>
  );
});

BottomNavigation.displayName = 'BottomNavigation';
