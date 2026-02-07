import { motion } from 'framer-motion';
import { Check, Crown, Calendar, TrendingUp, DollarSign, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VIPLevel } from '@/data/mockData';
import React from 'react';

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

// Lighting effects for each level as per instructions
const lightingStyles: Record<number, { color: string, intensity: string, glow: string }> = {
  0: { color: 'rgba(255, 255, 255, 0.15)', intensity: 'opacity-20', glow: 'shadow-[0_0_15px_rgba(255,255,255,0.1)]' },
  1: { color: 'rgba(255, 255, 255, 0.3)', intensity: 'opacity-30', glow: 'shadow-[0_0_20px_rgba(255,255,255,0.2)]' },
  2: { color: 'rgba(255, 215, 0, 0.4)', intensity: 'opacity-40', glow: 'shadow-[0_0_25px_rgba(212,175,55,0.3)]' },
  3: { color: 'rgba(212, 175, 55, 0.5)', intensity: 'opacity-50', glow: 'shadow-[0_0_30px_rgba(184,134,11,0.4)]' },
  4: { color: 'rgba(163, 33, 255, 0.5)', intensity: 'opacity-50', glow: 'shadow-[0_0_35px_rgba(163,33,255,0.4)]' },
  5: { color: 'rgba(0, 150, 255, 0.6)', intensity: 'opacity-60', glow: 'shadow-[0_0_50px_rgba(0,150,255,0.5)]' },
};

export const VIPCard = ({ vipLevel, currentLevel, index }: VIPCardProps) => {
  const navigate = useNavigate();
  const isUnlocked = vipLevel.level <= currentLevel;
  const isCurrent = vipLevel.level === currentLevel;
  const lighting = lightingStyles[vipLevel.level] || lightingStyles[0];

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
      className={`relative w-full max-w-md mx-auto aspect-[1.2/1] rounded-[2.5rem] overflow-hidden border border-white/10 p-5 flex flex-col mb-6 cursor-pointer transition-all duration-500 hover:scale-[1.02] group ${lighting.glow}`}
    >
      {/* 4️⃣ Background: Stadium Night with FIFA Style */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
        style={{ backgroundImage: `url(${stadiumBg})` }}
      />
      <div className="absolute inset-0 z-1 bg-black/40" />
      
      {/* Lighting Gradient Overlay */}
      <div 
        className={`absolute inset-0 z-2 ${lighting.intensity} pointer-events-none`} 
        style={{ background: `radial-gradient(circle at 50% 40%, ${lighting.color}, transparent 70%)` }} 
      />

      {/* 2️⃣ VIP Crown Icon: Consistent across all cards based on VIP0 */}
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

        {/* 6️⃣ "Open Now" Button: Golden Yellow, Luxurious Design */}
        {isCurrent ? (
          <div className="bg-gradient-to-r from-[#D4AF37] to-[#FBF5B7] text-black px-5 py-2.5 rounded-full flex items-center gap-2 font-black text-xs uppercase shadow-[0_0_20px_rgba(212,175,55,0.4)] border border-[#D4AF37]">
            <Check className="w-4 h-4" />
            <span className="whitespace-nowrap">مستواك الحالي</span>
          </div>
        ) : (
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#FFD700] text-black px-5 py-2.5 rounded-full border border-white/20 font-black text-xs uppercase shadow-[0_0_15px_rgba(255,215,0,0.4)] hover:shadow-[0_0_25px_rgba(255,215,0,0.6)] transition-all flex items-center gap-2"
          >
            <span className="whitespace-nowrap">
              {!isUnlocked ? (
                <span className="flex items-center gap-1.5">
                  <span>فتح الآن</span>
                  <span className="w-1 h-1 rounded-full bg-black/30" />
                  <span>{vipLevel.referralPrice}</span>
                  <span className="text-[10px] opacity-70">USDT</span>
                </span>
              ) : 'تم الفتح'}
            </span>
          </motion.div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex mt-4 z-10 items-end justify-between relative">
        {/* 1️⃣ Player Image: PNG, No Background, High Quality, Large but not touching edges */}
        <div className="w-[45%] relative flex items-end h-full overflow-visible">
          <motion.img 
            src={players[vipLevel.level]} 
            alt={vipLevel.name}
            className={`w-full object-contain object-bottom drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-30 transition-all duration-500 ${
              vipLevel.level === 5 ? 'h-[110%] scale-110' : 'h-[105%] scale-105'
            }`}
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
        </div>

        {/* 3️⃣ Info Boxes: Glass effect, Rounded corners, Light shadow, RTL Alignment */}
        {/* Adjusted width and padding to ensure they stay inside the card */}
        <div className="w-[52%] grid grid-cols-2 gap-2 pb-4 z-40 pr-1" dir="rtl">
          {/* Daily Tasks */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 flex flex-col items-center justify-center border border-white/10 shadow-sm min-h-[65px]">
            <Calendar className="w-4 h-4 text-orange-400 mb-1" />
            <span className="text-lg font-black text-white leading-none">{vipLevel.dailyChallengeLimit}</span>
            <span className="text-[8px] text-zinc-300 font-bold mt-1 uppercase text-center">المهام اليومية</span>
          </div>

          {/* Yield/Return */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 flex flex-col items-center justify-center border border-white/10 shadow-sm min-h-[65px]">
            <TrendingUp className="w-4 h-4 text-emerald-400 mb-1" />
            <div className="flex items-center gap-0.5">
              <span className="text-lg font-black text-white leading-none">{vipLevel.simpleInterest}</span>
              <span className="text-xs font-bold text-emerald-400">%</span>
            </div>
            <span className="text-[8px] text-zinc-300 font-bold mt-1 uppercase text-center">العائد</span>
          </div>

          {/* Daily Profit - Restored Decimals */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 flex flex-col items-center justify-center border border-white/10 shadow-sm min-h-[65px]">
            <DollarSign className="w-4 h-4 text-yellow-500 mb-1" />
            <div className="flex flex-col items-center">
              <span className="text-sm font-black text-white leading-none">{formatNumber(vipLevel.dailyProfit)}</span>
              <span className="text-[8px] font-bold text-yellow-500">USDT</span>
            </div>
            <span className="text-[8px] text-zinc-300 font-bold mt-1 uppercase text-center">الربح اليومي</span>
          </div>

          {/* Total Profit - Restored Decimals */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 flex flex-col items-center justify-center border border-white/10 shadow-sm min-h-[65px]">
            <Coins className="w-4 h-4 text-yellow-600 mb-1" />
            <div className="flex flex-col items-center">
              <span className="text-sm font-black text-white leading-none">{formatNumber(vipLevel.totalProfit).split('.')[0]}</span>
              <span className="text-[8px] font-bold text-yellow-600">USDT</span>
            </div>
            <span className="text-[8px] text-zinc-300 font-bold mt-1 uppercase text-center">إجمالي الربح</span>
          </div>
        </div>
      </div>

      {/* 5️⃣ Animation: Slow Glow */}
      <motion.div 
        className="absolute inset-0 z-3 pointer-events-none rounded-[2.5rem]"
        animate={{ 
          boxShadow: [
            `inset 0 0 20px ${lighting.color}`, 
            `inset 0 0 40px ${lighting.color}`, 
            `inset 0 0 20px ${lighting.color}`
          ] 
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
};
