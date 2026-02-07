import { motion, AnimatePresence } from 'framer-motion';
import { Check, Crown, Calendar, TrendingUp, DollarSign, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VIPLevel } from '@/data/mockData';
import React, { useMemo } from 'react';

// Import New Player Images from the final assets folder
import player0 from '@/assets/vip-final/players/vip0.png';
import player1 from '@/assets/vip-final/players/vip1.png';
import player2 from '@/assets/vip-final/players/vip2.png';
import player3 from '@/assets/vip-final/players/vip3.png';
import player4 from '@/assets/vip-final/players/vip4.png';
import player5 from '@/assets/vip-final/players/vip5.png';
import stadiumBg from '@/assets/vip-final/stadium-bg.jpg';

interface VIPCardProps {
  vipLevel: VIPLevel;
  currentLevel: number;
  index: number;
}

const players: Record<number, string> = {
  0: player0,
  1: player1,
  2: player2,
  3: player3,
  4: player4,
  5: player5,
};

// Updated colors as per instructions: Silver (VIP0) -> Gold -> Purple -> Electric Blue (VIP5)
const vipColors: Record<number, { main: string, text: string, shadow: string, glow: string, border: string, particle: string }> = {
  0: { 
    main: 'from-zinc-400 to-zinc-600', 
    text: 'text-zinc-300', 
    shadow: 'shadow-zinc-500/20', 
    glow: 'rgba(200, 200, 200, 0.2)',
    border: 'border-zinc-500/30',
    particle: 'bg-zinc-400/20'
  },
  1: { 
    main: 'from-yellow-600 to-yellow-800', 
    text: 'text-yellow-600', 
    shadow: 'shadow-yellow-600/20', 
    glow: 'rgba(202, 138, 4, 0.2)',
    border: 'border-yellow-600/30',
    particle: 'bg-yellow-600/20'
  },
  2: { 
    main: 'from-[#D4AF37] to-[#FBF5B7]', 
    text: 'text-[#D4AF37]', 
    shadow: 'shadow-[#D4AF37]/30', 
    glow: 'rgba(212, 175, 55, 0.3)',
    border: 'border-[#D4AF37]/40',
    particle: 'bg-[#D4AF37]/30'
  },
  3: { 
    main: 'from-purple-500 to-purple-800', 
    text: 'text-purple-400', 
    shadow: 'shadow-purple-500/30', 
    glow: 'rgba(168, 85, 247, 0.4)',
    border: 'border-purple-500/40',
    particle: 'bg-purple-400/40'
  },
  4: { 
    main: 'from-blue-500 to-indigo-800', 
    text: 'text-blue-400', 
    shadow: 'shadow-blue-500/40', 
    glow: 'rgba(59, 130, 246, 0.5)',
    border: 'border-blue-500/50',
    particle: 'bg-blue-400/40'
  },
  5: { 
    main: 'from-cyan-400 to-blue-600', 
    text: 'text-cyan-400', 
    shadow: 'shadow-cyan-400/50', 
    glow: 'rgba(34, 211, 238, 0.6)',
    border: 'border-cyan-400/60',
    particle: 'bg-cyan-400/50'
  },
};

const Particle = ({ color }: { color: string }) => {
  const randomX = useMemo(() => Math.random() * 100, []);
  const randomY = useMemo(() => Math.random() * 100, []);
  const randomDelay = useMemo(() => Math.random() * 5, []);
  const randomDuration = useMemo(() => 3 + Math.random() * 4, []);

  return (
    <motion.div
      className={`absolute w-1.5 h-1.5 rounded-full ${color} blur-[1px]`}
      initial={{ x: `${randomX}%`, y: "110%", opacity: 0, scale: 0 }}
      animate={{ 
        y: ["110%", "-10%"], 
        opacity: [0, 0.8, 0],
        scale: [0, 1.2, 0],
        x: [`${randomX}%`, `${randomX + (Math.random() * 20 - 10)}%`]
      }}
      transition={{ 
        duration: randomDuration, 
        repeat: Infinity, 
        delay: randomDelay,
        ease: "linear"
      }}
    />
  );
};

export const VIPCard = ({ vipLevel, currentLevel, index }: VIPCardProps) => {
  const navigate = useNavigate();
  const isUnlocked = vipLevel.level <= currentLevel;
  const isCurrent = vipLevel.level === currentLevel;
  const colors = vipColors[vipLevel.level] || vipColors[0];

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) return;
    navigate('/profile', { state: { openDeposit: true } });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Stronger presence for higher levels
  const presenceScale = vipLevel.level >= 3 ? 1.05 : 1;
  const presenceShadow = vipLevel.level >= 3 ? `0 20px 50px -12px ${colors.glow}` : 'none';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: presenceScale }}
      transition={{ 
        delay: index * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }}
      onClick={handleAction}
      style={{ boxShadow: presenceShadow }}
      className={`relative w-full max-w-md mx-auto aspect-[1.2/1] rounded-[2.5rem] overflow-hidden border ${vipLevel.level >= 3 ? 'border-white/20' : 'border-white/10'} p-5 flex flex-col mb-6 cursor-pointer transition-all duration-500 hover:scale-[1.05] group z-10`}
    >
      {/* Background Stadium */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" 
        style={{ backgroundImage: `url(${stadiumBg})` }}
      />
      <div className={`absolute inset-0 z-1 ${vipLevel.level >= 3 ? 'bg-black/40' : 'bg-black/50'}`} />
      
      {/* Level Specific Glow Overlay */}
      <div 
        className="absolute inset-0 z-2 pointer-events-none opacity-60" 
        style={{ background: `radial-gradient(circle at 50% 40%, ${colors.glow}, transparent 70%)` }} 
      />

      {/* Advanced Particles for VIP3-5 */}
      {vipLevel.level >= 3 && (
        <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <Particle key={i} color={colors.particle} />
          ))}
        </div>
      )}

      {/* Header Area */}
      <div className="flex justify-between items-start z-20 relative">
        <div className="flex items-center gap-3">
          {/* Unified Crown Icon */}
          <motion.div 
            whileHover={{ rotate: [0, -10, 10, 0] }}
            className={`w-14 h-14 bg-black/60 rounded-2xl flex items-center justify-center border ${colors.border} backdrop-blur-xl shadow-lg relative overflow-hidden`}
          >
            <Crown className={`w-8 h-8 ${colors.text} relative z-10`} />
            {vipLevel.level >= 4 && (
              <motion.div 
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
              />
            )}
          </motion.div>
          <div className="flex flex-col">
            <h3 className="text-white text-2xl font-black italic tracking-tighter">VIP {vipLevel.level}</h3>
            <span className={`${colors.text} text-[10px] font-black uppercase tracking-widest`}>{vipLevel.nameAr}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="relative">
          {isCurrent ? (
            <div className={`bg-gradient-to-r ${colors.main} text-white px-5 py-2.5 rounded-full flex items-center gap-2 font-black text-[10px] uppercase shadow-lg border border-white/20`}>
              <Check className="w-4 h-4" />
              <span className="whitespace-nowrap">مستواك الحالي</span>
            </div>
          ) : (
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`bg-gradient-to-r ${colors.main} text-white px-5 py-2.5 rounded-full border border-white/20 font-black text-[10px] uppercase shadow-lg transition-all flex items-center gap-2`}
            >
              <span className="whitespace-nowrap">
                {!isUnlocked ? (
                  <span className="flex items-center gap-1.5">
                    <span>فتح الآن</span>
                    <span className="w-1 h-1 rounded-full bg-white/30" />
                    <span>{vipLevel.referralPrice}</span>
                    <span className="text-[8px] opacity-70">USDT</span>
                  </span>
                ) : 'تم الفتح'}
              </span>
            </motion.div>
          )}
          {/* Extra glow for VIP5 */}
          {vipLevel.level === 5 && (
            <div className="absolute -inset-1 bg-cyan-400/20 blur-md rounded-full -z-10 animate-pulse" />
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex mt-4 z-10 items-end justify-between relative">
        {/* Player Image */}
        <div className="w-[45%] relative flex items-end h-full overflow-visible">
          <motion.img 
            src={players[vipLevel.level]} 
            alt={vipLevel.name}
            className={`w-full object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.95)] z-30 transition-all duration-700 h-[115%] scale-110 sm:h-[120%] sm:scale-120`}
            whileHover={{ scale: 1.2, y: -5 }}
            transition={{ type: "spring", stiffness: 200 }}
          />
          {/* Strong appearance effect for high levels */}
          {vipLevel.level >= 4 && (
            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[20%] ${colors.particle} blur-3xl rounded-full -z-10`} />
          )}
        </div>

        {/* Info Boxes Grid */}
        <div className="w-[52%] grid grid-cols-2 gap-2 pb-2 z-40 pr-1" dir="rtl">
          {/* Daily Tasks */}
          <div className="bg-white/5 backdrop-blur-2xl rounded-2xl p-2 flex flex-col items-center justify-center border border-white/10 shadow-xl min-h-[60px] sm:min-h-[70px] hover:bg-white/10 transition-colors">
            <Calendar className={`w-4 h-4 ${colors.text} mb-1`} />
            <span className="text-base sm:text-lg font-black text-white leading-none">{vipLevel.dailyChallengeLimit}</span>
            <span className="text-[7px] sm:text-[8px] text-zinc-400 font-bold mt-1 uppercase text-center">المهام اليومية</span>
          </div>

          {/* Yield/Return */}
          <div className="bg-white/5 backdrop-blur-2xl rounded-2xl p-2 flex flex-col items-center justify-center border border-white/10 shadow-xl min-h-[60px] sm:min-h-[70px] hover:bg-white/10 transition-colors">
            <TrendingUp className="w-4 h-4 text-emerald-400 mb-1" />
            <div className="flex items-center gap-0.5">
              <span className="text-base sm:text-lg font-black text-white leading-none">{vipLevel.simpleInterest}</span>
              <span className="text-xs font-bold text-emerald-400">%</span>
            </div>
            <span className="text-[7px] sm:text-[8px] text-zinc-400 font-bold mt-1 uppercase text-center">العائد</span>
          </div>

          {/* Daily Profit */}
          <div className="bg-white/5 backdrop-blur-2xl rounded-2xl p-2 flex flex-col items-center justify-center border border-white/10 shadow-xl min-h-[60px] sm:min-h-[70px] hover:bg-white/10 transition-colors">
            <DollarSign className="w-4 h-4 text-yellow-500 mb-1" />
            <div className="flex flex-col items-center">
              <span className="text-xs sm:text-sm font-black text-white leading-none">{formatNumber(vipLevel.dailyProfit)}</span>
              <span className="text-[7px] font-bold text-yellow-500 uppercase">USDT</span>
            </div>
            <span className="text-[7px] sm:text-[8px] text-zinc-400 font-bold mt-1 uppercase text-center">الربح اليومي</span>
          </div>

          {/* Total Profit */}
          <div className="bg-white/5 backdrop-blur-2xl rounded-2xl p-2 flex flex-col items-center justify-center border border-white/10 shadow-xl min-h-[60px] sm:min-h-[70px] hover:bg-white/10 transition-colors">
            <Coins className="w-4 h-4 text-yellow-600 mb-1" />
            <div className="flex flex-col items-center">
              <span className="text-xs sm:text-sm font-black text-white leading-none">{formatNumber(vipLevel.totalProfit).split('.')[0]}</span>
              <span className="text-[7px] font-bold text-yellow-600 uppercase">USDT</span>
            </div>
            <span className="text-[7px] sm:text-[8px] text-zinc-400 font-bold mt-1 uppercase text-center">إجمالي الربح</span>
          </div>
        </div>
      </div>

      {/* Level Specific Animated Glow */}
      <motion.div 
        className="absolute inset-0 z-3 pointer-events-none rounded-[2.5rem]"
        animate={{ 
          boxShadow: [
            `inset 0 0 20px ${colors.glow}`, 
            `inset 0 0 50px ${colors.glow}`, 
            `inset 0 0 20px ${colors.glow}`
          ] 
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
};
