import { motion } from 'framer-motion';
import { Crown, Zap, TrendingUp, Calendar, Percent, DollarSign } from 'lucide-react';
import { VIPLevel } from '@/data/mockData';
import { GoldButton } from '../ui/GoldButton';

// Import VIP background images
import bg0 from '@/assets/vip/bg-0-rookie.jpg';
import bg1 from '@/assets/vip/bg-1-bronze.jpg';
import bg2 from '@/assets/vip/bg-2-silver.jpg';
import bg3 from '@/assets/vip/bg-3-gold.jpg';
import bg4 from '@/assets/vip/bg-4-platinum.jpg';
import bg5 from '@/assets/vip/bg-5-diamond.jpg';
import ronaldoCutout from '@/assets/vip/ronaldo-transparent.png';

interface VIPCardProps {
  vipLevel: VIPLevel;
  currentLevel: number;
  index: number;
}

const vipBackgrounds: Record<number, string> = {
  0: bg0,
  1: bg1,
  2: bg2,
  3: bg3,
  4: bg4,
  5: bg5,
};

export const VIPCard = ({ vipLevel, currentLevel, index }: VIPCardProps) => {
  const isCurrentLevel = vipLevel.level === currentLevel;
  const isUnlocked = vipLevel.level <= currentLevel;
  const isNextLevel = vipLevel.level === currentLevel + 1;

  // Level-specific gradient colors for badges
  const levelGradients: Record<number, string> = {
    0: 'from-gray-600 to-gray-700',
    1: 'from-amber-600 to-amber-800',
    2: 'from-slate-400 to-slate-500',
    3: 'from-yellow-500 to-amber-600',
    4: 'from-slate-300 to-blue-300',
    5: 'from-cyan-400 to-blue-500',
  };

  // Level-specific glow/border colors
  const glowColors: Record<number, string> = {
    0: 'border-gray-600/30',
    1: 'border-amber-600/40',
    2: 'border-slate-400/40',
    3: 'border-yellow-500/50',
    4: 'border-slate-300/50',
    5: 'border-cyan-400/60',
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={`relative rounded-3xl overflow-hidden border-2 ${glowColors[vipLevel.level]} ${
        isCurrentLevel ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
      }`}
    >
      {/* Background Image with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={vipBackgrounds[vipLevel.level]} 
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-background/70 to-background/95" />
      </div>

      {/* Ronaldo Cutout - Left side */}
      <motion.div 
        className="absolute left-0 bottom-0 z-[1] h-full flex items-end pointer-events-none"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: index * 0.08 + 0.2 }}
      >
        <img 
          src={ronaldoCutout} 
          alt="Cristiano Ronaldo"
          className="h-[90%] w-auto object-contain object-bottom drop-shadow-2xl"
        />
      </motion.div>

      {/* Current Level Badge */}
      {isCurrentLevel && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 right-4 z-10"
        >
          <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
            ✓ مستواك الحالي
          </div>
        </motion.div>
      )}

      {/* Card Content - Right side */}
      <div className="relative z-[3] p-6 ml-auto w-[70%] min-h-[320px] flex flex-col">
        {/* Header with VIP Badge */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${levelGradients[vipLevel.level]} flex items-center justify-center shadow-xl`}>
              <Crown className="w-7 h-7 text-white" />
            </div>
            <div className="text-right">
              <h3 className="font-display text-2xl font-bold text-foreground">
                VIP {vipLevel.level}
              </h3>
              <p className="text-sm text-primary font-semibold">
                {vipLevel.nameAr}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid - Premium Design */}
        <div className="grid grid-cols-2 gap-3 mb-5 flex-1">
          {/* Daily Tasks */}
          <div className="bg-background/60 backdrop-blur-md rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">مهمات يومية</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{vipLevel.dailyTasks}</p>
          </div>

          {/* Simple Interest */}
          <div className="bg-background/60 backdrop-blur-md rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">مصلحة بسيطة</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatNumber(vipLevel.simpleInterest)}</p>
          </div>

          {/* Daily Profit */}
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-md rounded-2xl p-4 border border-primary/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary/80">الربح اليومي</span>
            </div>
            <p className="text-xl font-bold text-primary">{formatNumber(vipLevel.dailyProfit)}</p>
            <span className="text-xs text-primary/70">USDT</span>
          </div>

          {/* Total Profit */}
          <div className="bg-gradient-to-br from-accent/20 to-accent/5 backdrop-blur-md rounded-2xl p-4 border border-accent/30">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-accent" />
              <span className="text-xs text-accent/80">إجمالي الربح</span>
            </div>
            <p className="text-xl font-bold text-accent">{formatNumber(vipLevel.totalProfit)}</p>
            <span className="text-xs text-accent/70">USDT</span>
          </div>
        </div>

        {/* Action Button */}
        {!isUnlocked && vipLevel.price > 0 && (
          <GoldButton
            variant={isNextLevel ? 'primary' : 'secondary'}
            size="lg"
            className="w-full shadow-lg"
          >
            <span className="flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" />
              فتح بـ {formatNumber(vipLevel.price)} USDT
            </span>
          </GoldButton>
        )}

        {isUnlocked && !isCurrentLevel && (
          <div className="bg-muted/50 rounded-xl py-3 text-center">
            <span className="text-sm text-muted-foreground">✓ مفعّل</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
