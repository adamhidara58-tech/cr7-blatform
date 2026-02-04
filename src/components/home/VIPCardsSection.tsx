import { motion } from 'framer-motion';
import { Crown, Zap } from 'lucide-react';
import { vipLevels } from '@/data/mockData';
import { GoldButton } from '@/components/ui/GoldButton';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Import VIP background images
import bg1 from '@/assets/vip/bg-1-bronze.jpg';
import bg2 from '@/assets/vip/bg-2-silver.jpg';
import bg3 from '@/assets/vip/bg-3-gold.jpg';
import bg4 from '@/assets/vip/bg-4-platinum.jpg';
import bg5 from '@/assets/vip/bg-5-diamond.jpg';

const vipBackgrounds: Record<number, string> = {
  1: bg1,
  2: bg2,
  3: bg3,
  4: bg4,
  5: bg5,
};

const levelColors: Record<number, string> = {
  1: 'from-amber-700 to-amber-800',
  2: 'from-gray-300 to-gray-400',
  3: 'from-yellow-500 to-yellow-600',
  4: 'from-slate-300 to-slate-400',
  5: 'from-cyan-300 to-cyan-500',
};

export const VIPCardsSection = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const currentLevel = profile?.vip_level || 0;
  const referralDiscount = profile?.referral_discount || 0;

  // Only show VIP 1-5 (exclude 0 and 0.5)
  const mainVipLevels = vipLevels.filter(v => v.level >= 1 && v.level <= 5);

  const handleUpgrade = (level: number, price: number) => {
    const discountedPrice = Math.max(0, price - referralDiscount);
    toast({
      title: 'قريباً!',
      description: `سيتم تفعيل نظام الإيداع والترقية إلى VIP ${level}`,
    });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <section className="px-4 mb-8">
      <div className="flex items-center justify-between mb-4">
        <GoldButton variant="outline" size="sm" onClick={() => navigate('/vip')}>
          عرض التفاصيل
        </GoldButton>
        <h3 className="font-display text-xl text-foreground flex items-center gap-2">
          <Crown className="w-5 h-5 text-primary" />
          مستويات VIP
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {mainVipLevels.map((level, index) => {
          const isUnlocked = level.level <= currentLevel;
          const isCurrentLevel = level.level === currentLevel;
          const discountedPrice = Math.max(0, level.price - referralDiscount);
          const hasDiscount = referralDiscount > 0;

          return (
            <motion.div
              key={level.level}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-xl overflow-hidden glass-card border border-border/30 ${
                isCurrentLevel ? 'ring-2 ring-primary' : ''
              }`}
            >
              {/* Background */}
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `url(${vipBackgrounds[level.level]})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-l from-background/95 via-background/80 to-background/60" />

              {/* Content */}
              <div className="relative p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {!isUnlocked && (
                    <GoldButton
                      variant="primary"
                      size="sm"
                      onClick={() => handleUpgrade(level.level, level.price)}
                    >
                      <Zap className="w-3 h-3 ml-1" />
                      {hasDiscount ? (
                        <span className="flex items-center gap-1">
                          <span className="line-through text-xs opacity-60">${formatNumber(level.price)}</span>
                          <span>${formatNumber(discountedPrice)}</span>
                        </span>
                      ) : (
                        <span>${formatNumber(level.price)}</span>
                      )}
                    </GoldButton>
                  )}
                  {isCurrentLevel && (
                    <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                      مستواك الحالي
                    </span>
                  )}
                  {isUnlocked && !isCurrentLevel && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                      مفعّل
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    <h4 className="font-display text-lg text-foreground">
                      VIP {level.level}
                    </h4>
                    <p className="text-xs text-primary">{level.nameAr}</p>
                    <p className="text-[10px] text-muted-foreground">
                      ربح يومي: ${formatNumber(level.dailyProfit)}
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${levelColors[level.level]} flex items-center justify-center shadow-lg`}>
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
