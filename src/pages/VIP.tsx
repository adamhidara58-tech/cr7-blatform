import { motion } from 'framer-motion';
import { Crown, Zap, Star, Shield, Gift } from 'lucide-react';
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
      {/* User Status Section - NEW */}
      <section className="px-4 pt-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-[2rem] p-5 border border-[#D4AF37]/30 shadow-xl relative overflow-hidden group"
        >
          {/* Decorative Glow */}
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#D4AF37]/10 blur-3xl rounded-full" />
          
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#D4AF37]/20 rounded-xl flex items-center justify-center border border-[#D4AF37]/30">
                  <Crown className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">المستوى الحالي</p>
                  <h2 className="text-white text-lg font-black italic">{currentLevelData.nameAr}</h2>
                </div>
              </div>
              <div className="bg-zinc-950/50 px-3 py-1 rounded-lg border border-white/5">
                <span className="text-[#D4AF37] font-black">VIP {currentVipLevel}</span>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="flex items-center gap-3 bg-zinc-950/40 p-3 rounded-2xl border border-white/5">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <Gift className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex flex-col">
                <p className="text-white text-sm font-bold">تم الحصول على خصم إحالة بقيمة 20 دولار</p>
                <p className="text-[10px] text-zinc-500 font-medium">عرض خاص عبر رابط الإحالة</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Header Section */}
      <section className="px-4 pt-8 pb-2">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="w-6 h-6 text-[#D4AF37]" />
            <h1 className="font-display text-2xl text-white font-black">مستويات العضوية</h1>
          </div>
          <p className="text-zinc-500 text-xs font-bold">استثمر في مستويات VIP لزيادة أرباحك اليومية</p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-4 flex flex-col items-center justify-center border border-white/5 transition-colors hover:border-[#D4AF37]/30">
            <Shield className="w-6 h-6 text-zinc-400 mb-2" />
            <span className="text-xs text-zinc-400 font-bold">دعم أولوي</span>
          </div>
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-4 flex flex-col items-center justify-center border border-white/5 transition-colors hover:border-[#D4AF37]/30">
            <Star className="w-6 h-6 text-zinc-400 mb-2" />
            <span className="text-xs text-zinc-400 font-bold">تحديات حصرية</span>
          </div>
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-4 flex flex-col items-center justify-center border border-white/5 transition-colors hover:border-[#D4AF37]/30">
            <Zap className="w-6 h-6 text-zinc-400 mb-2" />
            <span className="text-xs text-zinc-400 font-bold">مكافآت أكثر</span>
          </div>
        </div>
      </section>

      {/* VIP Cards List */}
      <section className="px-4 pb-12 space-y-2">
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
