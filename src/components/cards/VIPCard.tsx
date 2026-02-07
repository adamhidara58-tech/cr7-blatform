import { motion } from 'framer-motion';
import { Check, Crown, Calendar, TrendingUp, DollarSign, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VIPLevel } from '@/data/mockData';
import React from 'react';

// Import Optimized Large Player Images
import player0 from '@/assets/vip-final/players/vip0_large.png';
import player1 from '@/assets/vip-final/players/vip1_large.png';
import player2 from '@/assets/vip-final/players/vip2_large.png';
import player3 from '@/assets/vip-final/players/vip3_large.png';
import player4 from '@/assets/vip-final/players/vip4_large.png';
import player5 from '@/assets/vip-final/players/vip5_large.png';
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

// Lighting and Crown Colors: From weak to strong/luxurious
const levelStyles: Record<number, { color: string, intensity: string, glow: string, crownColor: string }> = {
  0: { color: 'rgba(255, 255, 255, 0.1)', intensity: 'opacity-20', glow: 'shadow-[0_0_15px_rgba(255,255,255,0.1)]', crownColor: '#A1A1AA' }, // Silver/Zinc
  1: { color: 'rgba(255, 255, 255, 0.2)', intensity: 'opacity-30', glow: 'shadow-[0_0_20px_rgba(255,255,255,0.2)]', crownColor: '#D4AF37' }, // Bronze/Gold
  2: { color: 'rgba(255, 215, 0, 0.3)', intensity: 'opacity-40', glow: 'shadow-[0_0_25px_rgba(212,175,55,0.3)]', crownColor: '#FFD700' }, // Gold
  3: { color: 'rgba(212, 175, 55, 0.4)', intensity: 'opacity-50', glow: 'shadow-[0_0_30px_rgba(184,134,11,0.4)]', crownColor: '#DAA520' }, // Dark Gold
  4: { color: 'rgba(163, 33, 255, 0.4)', intensity: 'opacity-50', glow: 'shadow-[0_0_35px_rgba(163,33,255,0.4)]', crownColor: '#A855F7' }, // Purple Legend
  5: { color: 'rgba(0, 150, 255, 0.5)', intensity: 'opacity-60', glow: 'shadow-[0_0_50px_rgba(0,150,255,0.5)]', crownColor: '#3B82F6' }, // Electric Blue GOAT
};

export const VIPCard = ({ vipLevel, currentLevel, index }: VIPCardProps) => {
  const navigate = useNavigate();
  const isUnlocked = vipLevel.level <= currentLevel;
  const isCurrent = vipLevel.level === currentLevel;
  const style = levelStyles[vipLevel.level] || levelStyles[0];

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
      transition={{ delay: index * 0.1 }}
      onClick={handleAction}
      className={`relative w-full max-w-[500px] mx-auto aspect-[1.1/1] sm:aspect-[1.2/1] rounded-[2.5rem] overflow-hidden border border-white/10 p-4 sm:p-6 flex flex-col mb-8 cursor-pointer transition-all duration-500 hover:scale-[1.02] group ${style.glow}`}
    >
      {/* Background: Stadium Night */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
        style={{ backgroundImage: `url(${stadiumBg})` }}
      />
      <div className="absolute inset-0 z-1 bg-black/50" />
      
      {/* Lighting Gradient */}
      <div 
        className={`absolute inset-0 z-2 ${style.intensity} pointer-events-none`} 
        style={{ background: `radial-gradient(circle at 50% 40%, ${style.color}, transparent 70%)` }} 
      />

      {/* Header Row: Crown & Level Info */}
      <div className="flex justify-between items-start z-20 relative">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Unified Crown Icon based on VIP0 */}
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-black/40 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-md">
            <Crown className="w-7 h-7 sm:w-10 sm:h-10" style={{ color: style.crownColor }} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-white text-xl sm:text-3xl font-black italic tracking-tighter">VIP {vipLevel.level}</h3>
            <span className="text-zinc-400 text-[10px] sm:text-xs font-black uppercase tracking-widest">{vipLevel.nameAr}</span>
          </div>
        </div>

        {/* Action Button */}
        {isCurrent ? (
          <div className="bg-[#FFD700] text-black px-4 py-2 sm:px-6 sm:py-3 rounded-full flex items-center gap-2 font-black text-[10px] sm:text-xs uppercase shadow-lg">
            <Check className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="whitespace-nowrap">تم الفتح</span>
          </div>
        ) : (
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#FFD700] text-black px-4 py-2 sm:px-6 sm:py-3 rounded-full border border-white/20 font-black text-[10px] sm:text-xs uppercase shadow-xl flex items-center gap-2"
          >
            <span className="whitespace-nowrap">
              {!isUnlocked ? (
                <span className="flex items-center gap-1.5">
                  <span>فتح الآن</span>
                  <span className="w-1 h-1 rounded-full bg-black/30" />
                  <span>{vipLevel.referralPrice}</span>
                  <span className="text-[8px] sm:text-[10px] opacity-70">USDT</span>
                </span>
              ) : 'تم الفتح'}
            </span>
          </motion.div>
        )}
      </div>

      {/* Main Content Area: Player & Info Boxes */}
      <div className="flex-1 flex mt-2 sm:mt-4 z-10 items-end justify-between relative overflow-visible">
        {/* Player Image: LARGE, filling the card, VIP5 x2 */}
        <div className="w-[48%] relative flex items-end h-[110%] sm:h-[120%] -mb-4 sm:-mb-6 overflow-visible">
          <motion.img 
            src={players[vipLevel.level]} 
            alt={vipLevel.name}
            className={`w-auto max-w-none object-contain object-bottom drop-shadow-[0_15px_40px_rgba(0,0,0,0.9)] z-30 transition-all duration-500 ${
              vipLevel.level === 5 ? 'h-[160%] sm:h-[180%] scale-125 origin-bottom' : 'h-[130%] sm:h-[145%] scale-110 origin-bottom'
            }`}
            whileHover={{ scale: 1.15 }}
            transition={{ type: "spring", stiffness: 200 }}
          />
        </div>

        {/* Info Boxes: Positioned at bottom right as in the reference image */}
        <div className="w-[50%] grid grid-cols-2 gap-2 sm:gap-3 pb-4 sm:pb-6 z-40" dir="rtl">
          {/* Yield/Return */}
          <div className="bg-zinc-900/60 backdrop-blur-xl rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center border border-white/10 shadow-2xl min-h-[70px] sm:min-h-[90px]">
            <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-400 mb-1" />
            <div className="flex items-center gap-0.5">
              <span className="text-base sm:text-2xl font-black text-white leading-none">%{vipLevel.simpleInterest}</span>
            </div>
            <span className="text-[8px] sm:text-[10px] text-zinc-400 font-bold mt-1 uppercase text-center">العائد</span>
          </div>

          {/* Daily Tasks */}
          <div className="bg-zinc-900/60 backdrop-blur-xl rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center border border-white/10 shadow-2xl min-h-[70px] sm:min-h-[90px]">
            <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-orange-400 mb-1" />
            <span className="text-base sm:text-2xl font-black text-white leading-none">{vipLevel.dailyChallengeLimit}</span>
            <span className="text-[8px] sm:text-[10px] text-zinc-400 font-bold mt-1 uppercase text-center">المهام اليومية</span>
          </div>

          {/* Total Profit (Only for VIP1+) */}
          {vipLevel.level > 0 && (
            <div className="bg-zinc-900/60 backdrop-blur-xl rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center border border-white/10 shadow-2xl min-h-[70px] sm:min-h-[90px]">
              <Coins className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-600 mb-1" />
              <div className="flex flex-col items-center">
                <span className="text-sm sm:text-xl font-black text-white leading-none">{formatNumber(vipLevel.totalProfit).split('.')[0]}</span>
                <span className="text-[8px] sm:text-[10px] font-bold text-yellow-600">USDT</span>
              </div>
              <span className="text-[8px] sm:text-[10px] text-zinc-400 font-bold mt-1 uppercase text-center">إجمالي الربح</span>
            </div>
          )}

          {/* Daily Profit (Only for VIP1+) */}
          {vipLevel.level > 0 && (
            <div className="bg-zinc-900/60 backdrop-blur-xl rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center border border-white/10 shadow-2xl min-h-[70px] sm:min-h-[90px]">
              <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-500 mb-1" />
              <div className="flex flex-col items-center">
                <span className="text-sm sm:text-xl font-black text-white leading-none">{formatNumber(vipLevel.dailyProfit)}</span>
                <span className="text-[8px] sm:text-[10px] font-bold text-yellow-500">USDT</span>
              </div>
              <span className="text-[8px] sm:text-[10px] text-zinc-400 font-bold mt-1 uppercase text-center">الربح اليومي</span>
            </div>
          )}
        </div>
      </div>

      {/* Slow Glow Animation */}
      <motion.div 
        className="absolute inset-0 z-3 pointer-events-none rounded-[2.5rem]"
        animate={{ 
          boxShadow: [
            `inset 0 0 20px ${style.color}`, 
            `inset 0 0 40px ${style.color}`, 
            `inset 0 0 20px ${style.color}`
          ] 
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
};
