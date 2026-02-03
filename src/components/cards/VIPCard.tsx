import { motion } from 'framer-motion';
import { Check, Crown, Zap } from 'lucide-react';
import { VIPLevel } from '@/data/mockData';
import { GoldButton } from '../ui/GoldButton';

interface VIPCardProps {
  vipLevel: VIPLevel;
  currentLevel: number;
  index: number;
}

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative rounded-2xl overflow-hidden ${
        isCurrentLevel ? 'ring-2 ring-primary shadow-glow' : ''
      }`}
    >
      {/* Current Level Badge */}
      {isCurrentLevel && (
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Check className="w-3 h-3" />
            مستواك الحالي
          </div>
        </div>
      )}

      {/* Card Content */}
      <div className="bg-gradient-card border border-border p-5">
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
          <div className="bg-secondary/50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">{vipLevel.dailyChallengeLimit}</p>
            <p className="text-xs text-muted-foreground">تحدي يومي</p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-3 text-center">
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
