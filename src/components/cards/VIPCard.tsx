import { motion } from 'framer-motion';
import { Check, Crown, Zap } from 'lucide-react';
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

  const levelColors: Record<number, string> = {
    0: 'from-gray-500 to-gray-600',
    1: 'from-amber-700 to-amber-800',
    2: 'from-gray-300 to-gray-400',
    3: 'from-yellow-500 to-yellow-600',
    4: 'from-slate-300 to-slate-400',
    5: 'from-cyan-300 to-cyan-500',
  };

  // Level-specific glow colors
  const glowColors: Record<number, string> = {
    0: 'shadow-[0_0_30px_rgba(100,100,100,0.3)]',
    1: 'shadow-[0_0_30px_rgba(180,100,50,0.4)]',
    2: 'shadow-[0_0_30px_rgba(192,192,192,0.4)]',
    3: 'shadow-[0_0_30px_rgba(212,175,55,0.5)]',
    4: 'shadow-[0_0_30px_rgba(200,200,220,0.5)]',
    5: 'shadow-[0_0_40px_rgba(100,200,255,0.5)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative rounded-2xl overflow-hidden ${glowColors[vipLevel.level]} ${
        isCurrentLevel ? 'ring-2 ring-primary' : ''
      }`}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${vipBackgrounds[vipLevel.level]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Ronaldo Cutout - positioned on the left */}
      <motion.div 
        className="absolute left-0 bottom-0 z-[1] h-full flex items-end"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 + 0.2 }}
      >
        <img 
          src={ronaldoCutout} 
          alt="Cristiano Ronaldo"
          className="h-[85%] w-auto object-contain object-bottom drop-shadow-2xl"
          style={{
            filter: `drop-shadow(0 0 20px rgba(0,0,0,0.5))`,
          }}
        />
      </motion.div>

      {/* Dark Overlay for content readability */}
      <div className="absolute inset-0 bg-gradient-to-l from-background/95 via-background/80 to-transparent z-[2]" />

      {/* Current Level Badge */}
      {isCurrentLevel && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Check className="w-3 h-3" />
            مستواك الحالي
          </div>
        </div>
      )}

      {/* Card Content - positioned on the right */}
      <div className="relative z-[3] p-5 mr-0 ml-auto w-[65%]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${levelColors[vipLevel.level] || 'from-primary to-gold-light'} flex items-center justify-center shadow-lg`}>
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <h3 className="font-display text-xl text-foreground">
                VIP {vipLevel.level}
              </h3>
              <p className="text-sm text-primary font-medium">
                {vipLevel.nameAr}
              </p>
            </div>
          </div>
          
          {vipLevel.price > 0 && (
            <div className="text-left">
              <p className="text-2xl font-bold text-foreground">${vipLevel.price}</p>
              <p className="text-xs text-muted-foreground">USDT</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-secondary/70 backdrop-blur-sm rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">{vipLevel.dailyChallengeLimit}</p>
            <p className="text-xs text-muted-foreground">تحدي يومي</p>
          </div>
          <div className="bg-secondary/70 backdrop-blur-sm rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-primary">x{vipLevel.rewardMultiplier}</p>
            <p className="text-xs text-muted-foreground">مضاعف المكافأة</p>
          </div>
        </div>

        {/* Benefits */}
        <div className="space-y-2 mb-4">
          {vipLevel.benefitsAr.map((benefit, i) => (
            <div key={i} className="flex items-center gap-2 text-right">
              <Check className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm text-muted-foreground">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Action Button */}
        {!isUnlocked && (
          <GoldButton
            variant={isNextLevel ? 'primary' : 'secondary'}
            size="md"
            className="w-full"
          >
            {isNextLevel ? (
              <span className="flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                ترقية الآن
              </span>
            ) : (
              'ترقية'
            )}
          </GoldButton>
        )}
      </div>
    </motion.div>
  );
};
