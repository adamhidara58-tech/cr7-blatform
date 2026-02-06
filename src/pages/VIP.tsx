import { motion } from 'framer-motion';
import { Crown, Zap, Star, Shield } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { VIPCard } from '@/components/cards/VIPCard';
import { vipLevels } from '@/data/mockData';
import { useAuth } from '@/hooks/useAuth';

const VIP = () => {
  const { profile } = useAuth();
  const currentVipLevel = profile?.vip_level ?? 0;
  const currentLevelData = vipLevels.find(v => v.level === currentVipLevel) || vipLevels[0];

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
      {/* Header Section */}
      <section className="px-4 pt-6 pb-2">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="w-6 h-6 text-[#D4AF37]" />
            <h1 className="font-display text-2xl text-white font-black">مستويات العضوية</h1>
          </div>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-[#1A1A1A] rounded-2xl p-4 flex flex-col items-center justify-center border border-white/5">
            <Shield className="w-6 h-6 text-zinc-400 mb-2" />
            <span className="text-xs text-zinc-400 font-bold">دعم أولوي</span>
          </div>
          <div className="bg-[#1A1A1A] rounded-2xl p-4 flex flex-col items-center justify-center border border-white/5">
            <Star className="w-6 h-6 text-zinc-400 mb-2" />
            <span className="text-xs text-zinc-400 font-bold">تحديات حصرية</span>
          </div>
          <div className="bg-[#1A1A1A] rounded-2xl p-4 flex flex-col items-center justify-center border border-white/5">
            <Zap className="w-6 h-6 text-zinc-400 mb-2" />
            <span className="text-xs text-zinc-400 font-bold">مكافآت أكثر</span>
          </div>
        </div>
      </section>

      {/* VIP Cards List */}
      <section className="px-4 pb-12 space-y-4">
        {vipLevels.map((level, index) => (
          <VIPCard
            key={level.level}
            vipLevel={level}
            currentLevel={currentVipLevel}
            index={index}
          />
        ))}
      </section>
    </PageLayout>
  );
};

export default VIP;
