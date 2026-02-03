import { motion } from 'framer-motion';
import { Crown, Zap, Star, Shield, Gift, Percent } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { VIPCard } from '@/components/cards/VIPCard';
import { vipLevels } from '@/data/mockData';
import { useAuth } from '@/hooks/useAuth';

const VIP = () => {
  const { profile } = useAuth();
  const currentVipLevel = profile?.vip_level ?? 0;
  const currentLevel = vipLevels.find(v => v.level === currentVipLevel) || vipLevels[0];
  const referralDiscount = profile?.referral_discount ?? 0;

  if (!profile) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Header */}
      <section className="px-4 pt-6 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="w-6 h-6 text-primary" />
            <h1 className="font-display text-2xl text-foreground">عضوية VIP</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            ارتقِ بمستواك واربح المزيد
          </p>
        </motion.div>

        {/* Referral Discount Banner */}
        {referralDiscount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
            className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-4 mb-4 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">
                    خصم إحالة!
                  </p>
                  <p className="text-white/80 text-sm">
                    لديك خصم ${referralDiscount.toFixed(0)} على جميع العروض
                  </p>
                </div>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                  <Percent className="w-4 h-4 text-white" />
                  <span className="text-white font-bold">${referralDiscount.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Current Level Highlight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-gold rounded-2xl p-4 mb-6 shadow-gold"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary-foreground/20 rounded-full p-2">
                <Crown className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-primary-foreground font-bold text-lg">
                  {currentVipLevel === 0.5 ? 'VIP تجريبي' : `VIP ${currentVipLevel}`}
                </p>
                <p className="text-primary-foreground/80 text-sm">
                  {currentLevel.nameAr}
                </p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-primary-foreground text-2xl font-bold">
                {currentLevel.dailyProfit.toFixed(2)}
              </p>
              <p className="text-primary-foreground/80 text-xs">USDT يومياً</p>
            </div>
          </div>
        </motion.div>

        {/* Benefits Overview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <div className="bg-secondary/50 rounded-xl p-3 text-center">
            <Zap className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">مكافآت أكثر</p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-3 text-center">
            <Star className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">تحديات حصرية</p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-3 text-center">
            <Shield className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">دعم أولوي</p>
          </div>
        </motion.div>
      </section>

      {/* VIP Levels */}
      <section className="px-4 pb-6">
        <h2 className="font-display text-lg text-foreground mb-4 text-right">مستويات العضوية</h2>
        <div className="space-y-4">
          {vipLevels.map((level, index) => (
            <VIPCard
              key={level.level}
              vipLevel={level}
              currentLevel={currentVipLevel}
              index={index}
              referralDiscount={referralDiscount}
            />
          ))}
        </div>
      </section>
    </PageLayout>
  );
};

export default VIP;
