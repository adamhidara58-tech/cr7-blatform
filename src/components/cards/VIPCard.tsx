import { motion, useAnimation } from 'framer-motion';
import { Check, Crown, Calendar, TrendingUp, DollarSign, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VIPLevel } from '@/data/mockData';
import React from 'react';

// Import Player Images
import player0 from '@/assets/vip-v2/players/ronaldo_manutd.png';
import player1 from '@/assets/vip-v2/players/ronaldo_manutd.png';
import player2 from '@/assets/vip-v2/players/ronaldo_realmadrid.png';
import player3 from '@/assets/vip-v2/players/ronaldo_realmadrid.png';
import player4 from '@/assets/vip-v2/players/ronaldo_alnassr.png';
import player5 from '@/assets/vip-v2/players/ronaldo_ballondor.png';

interface VIPCardProps {
  vipLevel: VIPLevel;
  currentLevel: number;
  index: number;
  referralDiscount?: number;
}

const players: Record<number, string> = {
  0: player0,
  1: player1,
  2: player2,
  3: player3,
  4: player4,
  5: player5,
};

export const VIPCard = ({ vipLevel, currentLevel }: VIPCardProps) => {
  const navigate = useNavigate();
  const controls = useAnimation();
  const isUnlocked = vipLevel.level <= currentLevel;
  const isCurrent = vipLevel.level === currentLevel;

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
      onClick={handleAction}
      className="relative w-full max-w-md mx-auto aspect-[1.2/1] rounded-[2rem] overflow-hidden border-2 border-[#D4AF37] bg-black p-4 flex flex-col mb-6 cursor-pointer"
    >
      {/* Header Row */}
      <div className="flex justify-between items-start z-20">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-[#262626] rounded-2xl flex items-center justify-center border border-white/5">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-white text-2xl font-black">VIP {vipLevel.level}</h3>
            <span className="text-[#D4AF37] text-sm font-bold">{vipLevel.nameAr.split(' — ')[1] || vipLevel.nameAr}</span>
          </div>
        </div>

        {isCurrent ? (
          <div className="bg-[#D4AF37] text-black px-4 py-1.5 rounded-full flex items-center gap-1 font-bold text-sm">
            <Check className="w-4 h-4" />
            <span>مستواك الحالي</span>
          </div>
        ) : (
          <div className="bg-[#262626] text-white px-4 py-1.5 rounded-full border border-white/10 font-bold text-sm">
            {!isUnlocked ? `فتح — ${vipLevel.referralPrice} USDT` : 'تم الفتح'}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex mt-4 z-10">
        {/* Left Side: Player Image */}
        <div className="w-[45%] relative flex items-end">
          <img 
            src={players[vipLevel.level]} 
            alt={vipLevel.name}
            className="h-[110%] w-auto object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
          />
        </div>

        {/* Right Side: Stats Grid */}
        <div className="w-[55%] grid grid-cols-2 gap-2">
          {/* Stat 1: Daily Tasks */}
          <div className="bg-[#1A1A1A] rounded-2xl p-3 flex flex-col items-center justify-center border border-white/5">
            <Calendar className="w-5 h-5 text-orange-400 mb-1" />
            <span className="text-xl font-black text-white">{vipLevel.dailyChallengeLimit}</span>
            <span className="text-[10px] text-zinc-500 font-bold">مهمات يومية</span>
          </div>

          {/* Stat 2: Simple Interest */}
          <div className="bg-[#1A1A1A] rounded-2xl p-3 flex flex-col items-center justify-center border border-white/5">
            <TrendingUp className="w-5 h-5 text-emerald-400 mb-1" />
            <span className="text-xl font-black text-white">{vipLevel.simpleInterest}</span>
            <span className="text-[10px] text-zinc-500 font-bold">مصلحة بسيطة</span>
          </div>

          {/* Stat 3: Daily Profit */}
          <div className="bg-[#1A1A1A] rounded-2xl p-3 flex flex-col items-center justify-center border border-white/5">
            <DollarSign className="w-5 h-5 text-yellow-500 mb-1" />
            <span className="text-lg font-black text-white">{formatNumber(vipLevel.dailyProfit)}</span>
            <span className="text-[10px] text-zinc-500 font-bold">الربح اليومي</span>
          </div>

          {/* Stat 4: Total Profit */}
          <div className="bg-[#1A1A1A] rounded-2xl p-3 flex flex-col items-center justify-center border border-white/5">
            <Coins className="w-5 h-5 text-yellow-600 mb-1" />
            <span className="text-lg font-black text-white">{formatNumber(vipLevel.totalProfit)}</span>
            <span className="text-[10px] text-zinc-500 font-bold">إجمالي الربح</span>
          </div>
        </div>
      </div>

      {/* Background Subtle Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
    </motion.div>
  );
};
