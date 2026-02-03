import { motion } from 'framer-motion';
import { Crown, Zap, Star, Shield } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { VIPCard } from '@/components/cards/VIPCard';
import { vipLevels, mockUser } from '@/data/mockData';

const VIP = () => {
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
                  VIP {mockUser.vipLevel}
                </p>
                <p className="text-primary-foreground/80 text-sm">
                  {vipLevels[mockUser.vipLevel].nameAr}
                </p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-primary-foreground text-2xl font-bold">
                x{vipLevels[mockUser.vipLevel].rewardMultiplier}
              </p>
              <p className="text-primary-foreground/80 text-xs">مضاعف</p>
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
              currentLevel={mockUser.vipLevel}
              index={index}
            />
          ))}
        </div>
      </section>
    </PageLayout>
  );
};

export default VIP;
