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

const cardStyles: Record<number, { border: string, shadow: string, glow: string, bg: string }> = {
  0: { border: 'border-white/20', shadow: 'shadow-white/5', glow: 'after:bg-white/10', bg: 'bg-zinc-900/80' },
  1: { border: 'border-red-500/30', shadow: 'shadow-red-500/10', glow: 'after:bg-red-500/10', bg: 'bg-red-950/20' },
  2: { border: 'border-yellow-400/40', shadow: 'shadow-yellow-400/10', glow: 'after:bg-yellow-400/10', bg: 'bg-zinc-900/80' },
  3: { border: 'border-yellow-600/50', shadow: 'shadow-yellow-600/20', glow: 'after:bg-yellow-600/15', bg: 'bg-zinc-900/80' },
  4: { border: 'border-purple-500/50', shadow: 'shadow-purple-500/20', glow: 'after:bg-purple-500/20', bg: 'bg-zinc-900/80' },
  5: { border: 'border-blue-400/60', shadow: 'shadow-blue-400/30', glow: 'after:bg-blue-400/30', bg: 'bg-blue-950/30' },
};

export const VIPCard = ({ vipLevel, currentLevel, index }: VIPCardProps) => {
  const navigate = useNavigate();
  const controls = useAnimation();
  const isUnlocked = vipLevel.level <= currentLevel;
  const isCurrent = vipLevel.level === currentLevel;
  const style = cardStyles[vipLevel.level] || cardStyles[0];

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
      className={`relative w-full max-w-md mx-auto aspect-[1.3/1] rounded-[2.5rem] overflow-hidden border-2 ${style.border} ${style.bg} p-5 flex flex-col mb-6 cursor-pointer shadow-2xl ${style.shadow} transition-all duration-500 hover:scale-[1.02] group`}
    >
      {/* FIFA Style Glow Effect */}
      <div className={`absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none ${style.glow} blur-3xl rounded-full scale-150`} />

      {/* Header Row */}
      <div className="flex justify-between items-start z-20">
        <div className="flex items-center gap-3">
          <div className={`w-14 h-14 ${vipLevel.level === 5 ? 'bg-blue-600/20' : 'bg-zinc-800/50'} rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-md`}>
            <Crown className={`w-8 h-8 ${vipLevel.level === 5 ? 'text-yellow-400' : 'text-white'}`} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-white text-2xl font-black italic tracking-tighter">VIP {vipLevel.level}</h3>
            <span className="text-[#D4AF37] text-xs font-black uppercase tracking-widest">{vipLevel.nameAr}</span>
          </div>
        </div>

        {isCurrent ? (
          <div className="bg-[#D4AF37] text-black px-4 py-1.5 rounded-full flex items-center gap-1 font-black text-xs uppercase shadow-lg shadow-yellow-500/20">
            <Check className="w-4 h-4" />
            <span>مستواك الحالي</span>
          </div>
        ) : (
          <div className="bg-zinc-900/80 text-white px-4 py-1.5 rounded-full border border-white/10 font-black text-xs uppercase backdrop-blur-md">
            {!isUnlocked ? `فتح — ${vipLevel.referralPrice} USDT` : 'تم الفتح'}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex mt-2 z-10 items-end">
        {/* Left Side: Player Image */}
        <div className="w-[45%] relative flex items-end h-full">
          <img 
            src={players[vipLevel.level]} 
            alt={vipLevel.name}
            className={`h-[120%] w-auto object-contain object-bottom drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition-transform duration-700 group-hover:scale-110 origin-bottom ${vipLevel.level === 5 ? 'brightness-110 contrast-110' : ''}`}
          />
          {vipLevel.level === 5 && (
            <div className="absolute inset-0 bg-blue-400/10 blur-2xl rounded-full -z-10 animate-pulse" />
          )}
        </div>

        {/* Right Side: Stats Grid */}
        <div className="w-[55%] grid grid-cols-2 gap-2 pb-2">
          {/* Stat 1: Daily Tasks */}
          <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl p-2 flex flex-col items-center justify-center border border-white/5 shadow-inner">
            <Calendar className="w-4 h-4 text-orange-400 mb-0.5" />
            <div className="flex flex-row-reverse items-baseline gap-1">
              <span className="text-lg font-black text-white">{vipLevel.dailyChallengeLimit}</span>
              <span className="text-[9px] text-zinc-400 font-bold">مهمات</span>
            </div>
          </div>

          {/* Stat 2: Simple Interest */}
          <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl p-2 flex flex-col items-center justify-center border border-white/5 shadow-inner">
            <TrendingUp className="w-4 h-4 text-emerald-400 mb-0.5" />
            <div className="flex flex-row-reverse items-baseline gap-1">
              <span className="text-lg font-black text-white">{vipLevel.simpleInterest}%</span>
              <span className="text-[9px] text-zinc-400 font-bold">عائد</span>
            </div>
          </div>

          {/* Stat 3: Daily Profit */}
          <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl p-2 flex flex-col items-center justify-center border border-white/5 shadow-inner col-span-1">
            <DollarSign className="w-4 h-4 text-yellow-500 mb-0.5" />
            <div className="flex flex-col items-center leading-none">
              <span className="text-sm font-black text-white">${formatNumber(vipLevel.dailyProfit)}</span>
              <span className="text-[8px] text-zinc-500 font-bold mt-0.5">الربح اليومي</span>
            </div>
          </div>

          {/* Stat 4: Total Profit */}
          <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl p-2 flex flex-col items-center justify-center border border-white/5 shadow-inner col-span-1">
            <Coins className="w-4 h-4 text-yellow-600 mb-0.5" />
            <div className="flex flex-col items-center leading-none">
              <span className="text-sm font-black text-white">${formatNumber(vipLevel.totalProfit)}</span>
              <span className="text-[8px] text-zinc-500 font-bold mt-0.5">إجمالي الربح</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background Subtle Elements */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
    </motion.div>
  );
};
