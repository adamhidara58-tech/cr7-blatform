import { motion, useAnimation } from 'framer-motion';
import { Check, Crown, Calendar, TrendingUp, DollarSign, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VIPLevel } from '@/data/mockData';
import React from 'react';

// Import New Player Images
import player0 from '@/assets/vip-v3/players/vip0.png';
import player1 from '@/assets/vip-v3/players/vip1.png';
import player2 from '@/assets/vip-v3/players/vip2.png';
import player3 from '@/assets/vip-v3/players/vip3.png';
import player4 from '@/assets/vip-v3/players/vip4.png';
import player5 from '@/assets/vip-v3/players/vip5.png';

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

// FIFA Stadium backgrounds with night atmosphere
const stadiumBackgrounds: Record<number, string> = {
  0: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  1: 'linear-gradient(135deg, #2d1b1b 0%, #3d1a1a 50%, #4a0e0e 100%)',
  2: 'linear-gradient(135deg, #2d2417 0%, #3d3020 50%, #4a3a1a 100%)',
  3: 'linear-gradient(135deg, #3d2d1b 0%, #4d3d2b 50%, #5a4a3a 100%)',
  4: 'linear-gradient(135deg, #2d1b3d 0%, #3d1a4a 50%, #4a0e5a 100%)',
  5: 'linear-gradient(135deg, #1a2d3d 0%, #1a3d4d 50%, #0e4a5a 100%)',
};

// Spotlight lighting effects for each level
const spotlightStyles: Record<number, { color: string, intensity: string }> = {
  0: { color: 'rgba(255, 255, 255, 0.3)', intensity: 'opacity-30' },
  1: { color: 'rgba(255, 100, 100, 0.4)', intensity: 'opacity-40' },
  2: { color: 'rgba(255, 215, 0, 0.35)', intensity: 'opacity-35' },
  3: { color: 'rgba(255, 200, 0, 0.4)', intensity: 'opacity-40' },
  4: { color: 'rgba(200, 100, 255, 0.4)', intensity: 'opacity-40' },
  5: { color: 'rgba(100, 200, 255, 0.5)', intensity: 'opacity-50' },
};

export const VIPCard = ({ vipLevel, currentLevel, index }: VIPCardProps) => {
  const navigate = useNavigate();
  const controls = useAnimation();
  const isUnlocked = vipLevel.level <= currentLevel;
  const isCurrent = vipLevel.level === currentLevel;
  const spotlight = spotlightStyles[vipLevel.level] || spotlightStyles[0];

  const handleAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) return;
    await controls.start({
      scale: [1, 1.02, 1],
      transition: { duration: 0.3 }
    });
    navigate('/profile', { state: { openDeposit: true } });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={handleAction}
      className="relative w-full max-w-md mx-auto aspect-[1.2/1] rounded-[2.5rem] overflow-hidden border-2 border-[#D4AF37]/40 p-5 flex flex-col mb-6 cursor-pointer shadow-2xl transition-all duration-500 hover:scale-[1.02] group"
      style={{ background: stadiumBackgrounds[vipLevel.level] }}
    >
      {/* FIFA Stadium Night Atmosphere - Spotlight Effect */}
      <div className={`absolute inset-0 ${spotlight.intensity} pointer-events-none`} style={{ background: `radial-gradient(ellipse 60% 80% at 50% 30%, ${spotlight.color}, transparent)` }} />
      
      {/* Additional depth layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60 pointer-events-none" />

      {/* Header Row */}
      <div className="flex justify-between items-start z-20 relative">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-black/40 rounded-2xl flex items-center justify-center border border-[#D4AF37]/30 backdrop-blur-md">
            <Crown className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-white text-2xl font-black italic tracking-tighter">VIP {vipLevel.level}</h3>
            <span className="text-[#D4AF37] text-xs font-black uppercase tracking-widest">{vipLevel.nameAr}</span>
          </div>
        </div>

        {isCurrent ? (
          <div className="bg-[#D4AF37] text-black px-4 py-2 rounded-lg flex items-center gap-1 font-black text-xs uppercase shadow-lg shadow-yellow-500/30 border border-[#D4AF37]">
            <Check className="w-4 h-4" />
            <span>مستواك الحالي</span>
          </div>
        ) : (
          <div className="bg-black/50 text-white px-4 py-2 rounded-lg border border-[#D4AF37]/40 font-black text-xs uppercase backdrop-blur-md hover:bg-black/70 transition-colors">
            {!isUnlocked ? `فتح — ${vipLevel.referralPrice} USDT` : 'تم الفتح'}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex mt-4 z-10 items-end justify-between">
        {/* Left Side: Player Image - SCALED UP */}
        <div className="w-[50%] relative flex items-end h-full -ml-8">
          <img 
            src={players[vipLevel.level]} 
            alt={vipLevel.name}
            className="h-[140%] w-auto object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)] transition-transform duration-700 group-hover:scale-105 origin-bottom"
          />
        </div>

        {/* Right Side: Stats Grid - FIXED SPACING */}
        <div className="w-[50%] grid grid-cols-2 gap-2 pr-2">
          {/* Stat 1: Daily Tasks */}
          <div className="bg-black/50 backdrop-blur-md rounded-xl p-2.5 flex flex-col items-center justify-center border border-white/10 shadow-inner">
            <Calendar className="w-4 h-4 text-orange-400 mb-1" />
            <span className="text-base font-black text-white">{vipLevel.dailyChallengeLimit}</span>
            <span className="text-[8px] text-zinc-300 font-bold mt-0.5">مهمات</span>
          </div>

          {/* Stat 2: Simple Interest */}
          <div className="bg-black/50 backdrop-blur-md rounded-xl p-2.5 flex flex-col items-center justify-center border border-white/10 shadow-inner">
            <TrendingUp className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="text-base font-black text-white">{vipLevel.simpleInterest}%</span>
            <span className="text-[8px] text-zinc-300 font-bold mt-0.5">عائد</span>
          </div>

          {/* Stat 3: Daily Profit */}
          <div className="bg-black/50 backdrop-blur-md rounded-xl p-2.5 flex flex-col items-center justify-center border border-white/10 shadow-inner">
            <DollarSign className="w-3.5 h-3.5 text-yellow-500 mb-1" />
            <div className="flex flex-col items-center leading-tight">
              <span className="text-sm font-black text-white">${formatNumber(vipLevel.dailyProfit)}</span>
              <span className="text-[7px] text-zinc-400 font-bold mt-0.5">يومي</span>
            </div>
          </div>

          {/* Stat 4: Total Profit */}
          <div className="bg-black/50 backdrop-blur-md rounded-xl p-2.5 flex flex-col items-center justify-center border border-white/10 shadow-inner">
            <Coins className="w-3.5 h-3.5 text-yellow-600 mb-1" />
            <div className="flex flex-col items-center leading-tight">
              <span className="text-sm font-black text-white">${formatNumber(vipLevel.totalProfit)}</span>
              <span className="text-[7px] text-zinc-400 font-bold mt-0.5">إجمالي</span>
            </div>
          </div>
        </div>
      </div>

      {/* Vignette effect for depth */}
      <div className="absolute inset-0 rounded-[2.5rem] shadow-inset pointer-events-none" style={{ boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)' }} />
    </motion.div>
  );
};
