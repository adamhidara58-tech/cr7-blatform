import { motion, useAnimation } from 'framer-motion';
import { Check, Crown, Target, TrendingUp, ArrowRight, Star, Percent } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VIPLevel } from '@/data/mockData';
import React from 'react';

// Import New VIP Backgrounds
import bg1 from '@/assets/vip-v2/backgrounds/bg_vip1.png';
import bg2 from '@/assets/vip-v2/backgrounds/bg_vip2.png';
import bg3 from '@/assets/vip-v2/backgrounds/bg_vip3.png';
import bg4 from '@/assets/vip-v2/backgrounds/bg_vip4.png';
import bg5 from '@/assets/vip-v2/backgrounds/bg_vip5.png';

// Import New Player Images
import player1 from '@/assets/vip-v2/players/ronaldo_manutd.png';
import player2 from '@/assets/vip-v2/players/ronaldo_realmadrid.png';
import player3 from '@/assets/vip-v2/players/ronaldo_realmadrid.png'; // Using RM for Juventus as placeholder or similar
import player4 from '@/assets/vip-v2/players/ronaldo_alnassr.png';
import player5 from '@/assets/vip-v2/players/ronaldo_ballondor.png';

interface VIPCardProps {
  vipLevel: VIPLevel;
  currentLevel: number;
  index: number;
  referralDiscount?: number;
}

const backgrounds: Record<number, string> = {
  0: bg1,
  1: bg1,
  2: bg2,
  3: bg3,
  4: bg4,
  5: bg5,
};

const players: Record<number, string> = {
  0: player1,
  1: player1,
  2: player2,
  3: player3,
  4: player4,
  5: player5,
};

const levelStyles: Record<number, { 
  glow: string, 
  border: string, 
  overlay: string, 
  buttonGlow: string
}> = {
  0: { glow: 'shadow-blue-900/20', border: 'border-blue-900/30', overlay: 'bg-blue-950/40', buttonGlow: 'shadow-blue-500/50' },
  1: { glow: 'shadow-blue-500/30', border: 'border-blue-500/30', overlay: 'bg-blue-900/40', buttonGlow: 'shadow-blue-500/60' },
  2: { glow: 'shadow-white/20', border: 'border-slate-200/30', overlay: 'bg-slate-900/50', buttonGlow: 'shadow-white/50' },
  3: { glow: 'shadow-purple-500/30', border: 'border-purple-500/40', overlay: 'bg-purple-950/50', buttonGlow: 'shadow-purple-500/60' },
  4: { glow: 'shadow-red-500/40', border: 'border-red-500/50', overlay: 'bg-red-950/40', buttonGlow: 'shadow-red-500/70' },
  5: { glow: 'shadow-yellow-400/60', border: 'border-yellow-400/80', overlay: 'bg-yellow-950/10', buttonGlow: 'shadow-yellow-400/80' },
};

export const VIPCard = ({ vipLevel, currentLevel }: VIPCardProps) => {
  const navigate = useNavigate();
  const controls = useAnimation();
  const isUnlocked = vipLevel.level <= currentLevel;
  const style = levelStyles[vipLevel.level] || levelStyles[0];

  const handleAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await controls.start({
      scale: [1, 1.02, 1],
      transition: { duration: 0.3 }
    });
    navigate('/profile', { state: { openDeposit: true } });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  // Standard ID-1 Card Size: 85.6mm x 54mm
  // In pixels (approx 96dpi): 324px x 204px
  // We'll use a scale factor to make it look good on screen while maintaining aspect ratio
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      onClick={handleAction}
      className={`relative w-[324px] h-[204px] rounded-[12px] overflow-hidden cursor-pointer border ${style.border} ${style.glow} shadow-xl transition-all duration-500 group bg-black mb-6 mx-auto`}
    >
      {/* Background Image (Stadium Lights) */}
      <img 
        src={backgrounds[vipLevel.level]} 
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-60"
        alt="Stadium Background"
      />
      
      {/* Overlay for readability */}
      <div className={`absolute inset-0 z-[1] ${style.overlay} backdrop-blur-[0.5px]`} />

      {/* Ronaldo Image (No Background) */}
      <div className="absolute left-[-5%] bottom-0 z-[2] h-[110%] w-[50%] flex items-end justify-center pointer-events-none">
        <motion.img 
          loading="eager"
          src={players[vipLevel.level]} 
          alt={vipLevel.name}
          className="h-full w-auto object-contain object-bottom drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] transition-transform duration-500 origin-bottom group-hover:scale-105"
        />
      </div>

      {/* Content Area */}
      <div className="relative z-[3] p-3 ml-auto w-[60%] h-full flex flex-col justify-between text-right">
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 mb-1">
             <p className="text-[10px] font-bold text-yellow-400 italic">
               {vipLevel.clubAr} — {vipLevel.year}
             </p>
             <Crown className="w-3 h-3 text-white" />
          </div>
          <h3 className="font-display text-xl font-black text-white italic tracking-tighter leading-none">
            {vipLevel.name}
          </h3>
          <p className="text-[9px] font-bold text-zinc-300 mt-0.5">
            {vipLevel.nameAr}
          </p>

          {/* Stats Grid - Compact for new size */}
          <div className="grid grid-cols-2 gap-1 w-full mt-2">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg p-1 border border-white/5 flex flex-col items-end">
              <span className="text-[8px] text-zinc-400 font-bold">المهام</span>
              <span className="text-[10px] font-bold text-white">{vipLevel.dailyChallengeLimit}</span>
            </div>
            <div className="bg-black/60 backdrop-blur-sm rounded-lg p-1 border border-white/5 flex flex-col items-end">
              <span className="text-[8px] text-zinc-400 font-bold">الفائدة</span>
              <span className="text-[10px] font-bold text-blue-400">{vipLevel.simpleInterest}%</span>
            </div>
            <div className="bg-black/60 backdrop-blur-sm rounded-lg p-1 border border-white/5 flex flex-col items-end">
              <span className="text-[8px] text-zinc-400 font-bold">الربح اليومي</span>
              <span className="text-[10px] font-bold text-green-400">+{formatNumber(vipLevel.dailyProfit)}</span>
            </div>
            <div className="bg-black/60 backdrop-blur-sm rounded-lg p-1 border border-white/5 flex flex-col items-end">
              <span className="text-[8px] text-zinc-400 font-bold">الإجمالي</span>
              <span className="text-[10px] font-bold text-yellow-400">{formatNumber(vipLevel.totalProfit)}</span>
            </div>
          </div>
        </div>

        {/* Action Button Section */}
        <div className="w-full mt-1">
          {!isUnlocked ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col items-end">
                <span className="text-[7px] text-zinc-500 line-through leading-none">
                  {formatNumber(vipLevel.price)} USDT
                </span>
                <span className="text-xs font-black text-white leading-none">
                  {formatNumber(vipLevel.referralPrice)} USDT
                </span>
              </div>

              <motion.button
                animate={{ 
                  boxShadow: ["0 0 0px rgba(234,179,8,0)", "0 0 10px rgba(234,179,8,0.4)", "0 0 0px rgba(234,179,8,0)"],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className={`flex-1 h-7 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center gap-1 shadow-lg active:scale-95 transition-all relative overflow-hidden`}
                onClick={handleAction}
              >
                <span className="text-[9px] font-black text-black uppercase relative z-10">فتح الآن</span>
                <ArrowRight className="w-3 h-3 text-black relative z-10" />
              </motion.button>
            </div>
          ) : (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg h-7 flex items-center justify-center gap-2 backdrop-blur-md w-full">
              <span className="text-green-400 font-black text-[9px] uppercase">تم التفعيل</span>
              <Check className="w-3 h-3 text-green-500 stroke-[3px]" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
