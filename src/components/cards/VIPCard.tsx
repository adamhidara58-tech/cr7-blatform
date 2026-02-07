import { motion } from 'framer-motion';
import { Check, Crown, Calendar, TrendingUp, DollarSign, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VIPLevel } from '@/data/mockData';
import React, { useMemo } from 'react';

// Import New Player Images
import player0 from '@/assets/vip-final/players/vip0.png';
import player1 from '@/assets/vip-final/players/vip1_new.png'; // Updated image for VIP1
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

const vipColors: Record<number, { 
  main: string, 
  text: string, 
  glow: string, 
  border: string, 
  particle: string,
  depth: string,
  shine: boolean
}> = {
  0: { 
    main: 'from-zinc-500 to-zinc-700', 
    text: 'text-zinc-400', 
    glow: 'rgba(100, 100, 100, 0.1)', 
    border: 'border-zinc-600/20', 
    particle: 'bg-zinc-500/10',
    depth: 'shadow-none',
    shine: false
  },
  1: { 
    main: 'from-zinc-400 to-zinc-600', 
    text: 'text-zinc-300', 
    glow: 'rgba(200, 200, 200, 0.15)', 
    border: 'border-zinc-400/30', 
    particle: 'bg-zinc-400/15',
    depth: 'shadow-lg',
    shine: false
  },
  2: { 
    main: 'from-[#D4AF37] to-[#FBF5B7]', 
    text: 'text-[#D4AF37]', 
    glow: 'rgba(212, 175, 55, 0.25)', 
    border: 'border-[#D4AF37]/40', 
    particle: 'bg-[#D4AF37]/20',
    depth: 'shadow-[0_0_15px_rgba(212,175,55,0.2)]',
    shine: true
  },
  3: { 
    main: 'from-purple-500 to-purple-800', 
    text: 'text-purple-400', 
    glow: 'rgba(168, 85, 247, 0.35)', 
    border: 'border-purple-500/50', 
    particle: 'bg-purple-400/30',
    depth: 'shadow-[0_0_25px_rgba(168,85,247,0.3)]',
    shine: true
  },
  4: { 
    main: 'from-blue-600 to-indigo-900', 
    text: 'text-blue-400', 
    glow: 'rgba(59, 130, 246, 0.45)', 
    border: 'border-blue-500/60', 
    particle: 'bg-blue-400/40',
    depth: 'shadow-[0_0_35px_rgba(59,130,246,0.4)]',
    shine: true
  },
  5: { 
    main: 'from-cyan-400 via-blue-500 to-indigo-600', 
    text: 'text-cyan-300', 
    glow: 'rgba(34, 211, 238, 0.6)', 
    border: 'border-cyan-400/70', 
    particle: 'bg-white/50',
    depth: 'shadow-[0_0_50px_rgba(34,211,238,0.5)]',
    shine: true
  },
};

const Particle = ({ color, level }: { color: string, level: number }) => {
  const randomX = useMemo(() => Math.random() * 100, []);
  const randomDelay = useMemo(() => Math.random() * 5, []);
  const randomDuration = useMemo(() => (level === 5 ? 4 : 6) + Math.random() * 4, [level]);

  return (
    <motion.div
      className={`absolute w-1 h-1 rounded-full ${color} blur-[0.5px]`}
      initial={{ x: `${randomX}%`, y: "110%", opacity: 0 }}
      animate={{ y: ["110%", "-10%"], opacity: [0, 0.8, 0], scale: [0, 1.2, 0] }}
      transition={{ duration: randomDuration, repeat: Infinity, delay: randomDelay, ease: "linear" }}
    />
  );
};

const LightSweep = () => (
  <motion.div
    className="absolute inset-0 z-[3] pointer-events-none"
    initial={{ x: '-100%' }}
    animate={{ x: '200%' }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
    style={{
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
      width: '50%'
    }}
  />
);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={vipLevel.level >= 3 ? { y: -5, scale: 1.01 } : {}}
      transition={{ delay: index * 0.1 }}
      onClick={handleAction}
      className={`relative w-full max-w-md mx-auto aspect-[1.15/1] rounded-[2rem] overflow-hidden border border-white/10 p-4 flex flex-col mb-6 cursor-pointer group ${colors.depth} bg-zinc-950 transition-all duration-500`}
    >
      {/* Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" 
        style={{ 
          backgroundImage: `url(${stadiumBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }} 
      />
      <div className="absolute inset-0 z-[1] bg-black/60" />
      
      {/* Level-based Glow */}
      <div className="absolute inset-0 z-[2] opacity-40" style={{ background: `radial-gradient(circle at 50% 40%, ${colors.glow}, transparent 70%)` }} />

      {/* Light Sweep for VIP2+ */}
      {colors.shine && <LightSweep />}

      {/* Particles for VIP3-5 */}
      {vipLevel.level >= 3 && (
        <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
          {[...Array(vipLevel.level === 5 ? 15 : 8)].map((_, i) => (
            <Particle key={i} color={colors.particle} level={vipLevel.level} />
          ))}
        </div>
      )}

      {/* Header Area */}
      <div className="flex justify-between items-start z-30 relative mb-2">
        <div className="flex items-center gap-2.5">
          <div className={`w-12 h-12 bg-black/70 rounded-xl flex items-center justify-center border ${colors.border} backdrop-blur-xl shadow-lg`}>
            <Crown className={`w-7 h-7 ${colors.text}`} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-white text-xl font-black italic tracking-tighter leading-none">VIP {vipLevel.level}</h3>
            <span className={`${colors.text} text-[9px] font-black uppercase tracking-widest mt-1`}>{vipLevel.nameAr}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0">
          {isCurrent ? (
            <div className={`bg-gradient-to-r ${colors.main} text-white px-4 py-2 rounded-full flex items-center gap-1.5 font-black text-[9px] uppercase border border-white/20 shadow-lg`}>
              <Check className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">مستواك الحالي</span>
            </div>
          ) : (
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`bg-gradient-to-r ${colors.main} text-white px-4 py-2 rounded-full border border-white/20 font-black text-[9px] uppercase shadow-lg transition-all flex items-center gap-1.5`}
            >
              <span className="whitespace-nowrap">
                {!isUnlocked ? (
                  <span className="flex items-center gap-1">
                    <span>فتح الآن</span>
                    <span className="w-0.5 h-0.5 rounded-full bg-white/30" />
                    <span>{vipLevel.referralPrice}</span>
                    <span className="text-[7px] opacity-70">USDT</span>
                  </span>
                ) : 'تم الفتح'}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative z-10">
        {/* Player Image - Independent Layer, Above BG, Below Stats */}
        <div className="absolute left-0 bottom-0 w-[50%] h-[120%] flex items-end z-[15] pointer-events-none">
          <motion.img 
            src={players[vipLevel.level]} 
            alt={vipLevel.name}
            className="w-full h-full object-contain object-bottom drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] transition-all duration-700 group-hover:scale-105 origin-bottom"
          />
        </div>

        {/* Info Boxes Grid - Centered Vertically on the Right */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[52%] grid grid-cols-2 gap-1.5 z-20" dir="rtl">
          {/* Daily Tasks */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-2xl p-1.5 flex flex-col items-center justify-center border border-white/20 shadow-xl h-[70px] transition-colors hover:bg-white/15">
            <Calendar className={`w-3.5 h-3.5 ${colors.text} mb-1`} />
            <span className="text-sm font-black text-white leading-none">{vipLevel.dailyChallengeLimit}</span>
            <span className="text-[7px] text-zinc-300 font-bold mt-1 uppercase text-center">المهام اليومية</span>
          </div>

          {/* Yield/Return */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-2xl p-1.5 flex flex-col items-center justify-center border border-white/20 shadow-xl h-[70px] transition-colors hover:bg-white/15">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400 mb-1" />
            <div className="flex items-center gap-0.5">
              <span className="text-sm font-black text-white leading-none">{vipLevel.simpleInterest}</span>
              <span className="text-[10px] font-bold text-emerald-400">%</span>
            </div>
            <span className="text-[7px] text-zinc-300 font-bold mt-1 uppercase text-center">العائد</span>
          </div>

          {/* Daily Profit */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-2xl p-1.5 flex flex-col items-center justify-center border border-white/20 shadow-xl h-[70px] transition-colors hover:bg-white/15">
            <DollarSign className="w-3.5 h-3.5 text-yellow-500 mb-1" />
            <div className="flex flex-col items-center leading-none">
              <span className="text-[11px] font-black text-white">{formatNumber(vipLevel.dailyProfit)}</span>
              <span className="text-[6px] font-bold text-yellow-500 uppercase mt-0.5">USDT</span>
            </div>
            <span className="text-[7px] text-zinc-300 font-bold mt-1 uppercase text-center">الربح اليومي</span>
          </div>

          {/* Total Profit */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-2xl p-1.5 flex flex-col items-center justify-center border border-white/20 shadow-xl h-[70px] transition-colors hover:bg-white/15">
            <Coins className="w-3.5 h-3.5 text-yellow-600 mb-1" />
            <div className="flex flex-col items-center leading-none">
              <span className="text-[11px] font-black text-white">{formatNumber(vipLevel.totalProfit).split('.')[0]}</span>
              <span className="text-[6px] font-bold text-yellow-600 uppercase mt-0.5">USDT</span>
            </div>
            <span className="text-[7px] text-zinc-300 font-bold mt-1 uppercase text-center">إجمالي الربح</span>
          </div>
        </div>
      </div>

      {/* Animated Glow Border */}
      <motion.div 
        className="absolute inset-0 z-[5] pointer-events-none rounded-[2rem]"
        animate={{ 
          boxShadow: [
            `inset 0 0 15px ${colors.glow}`, 
            `inset 0 0 30px ${colors.glow}`, 
            `inset 0 0 15px ${colors.glow}`
          ] 
        }}
        transition={{ duration: vipLevel.level === 5 ? 2 : 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
};
