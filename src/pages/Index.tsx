import { motion } from 'framer-motion';
import { Crown, Wallet, TrendingUp, Target, Users, Copy, Share2 } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { StatCard } from '@/components/cards/StatCard';
import { useAuth } from '@/hooks/useAuth';
import { useReferrals } from '@/hooks/useReferrals';
import { useToast } from '@/hooks/use-toast';
import { vipLevels } from '@/data/mockData';
import heroBg from '@/assets/hero-bg.jpg';
import React, { Suspense, lazy } from 'react';

// Lazy load heavy components for better initial load speed
const VIPCardsSection = lazy(() => import('@/components/home/VIPCardsSection').then(module => ({ default: module.VIPCardsSection })));
const PlatformStatsCard = lazy(() => import('@/components/home/PlatformStatsCard').then(module => ({ default: module.PlatformStatsCard })));
const FakeWithdrawals = lazy(() => import('@/components/home/FakeWithdrawals').then(module => ({ default: module.FakeWithdrawals })));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-smooth-spin" />
  </div>
);

const Index = () => {
  const { profile, loading } = useAuth();
  const { count: referralCount } = useReferrals();
  const { toast } = useToast();

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      toast({
        title: 'تم النسخ! ✓',
        description: 'رمز الإحالة تم نسخه',
      });
    }
  };

  const shareReferralLink = () => {
    if (profile?.referral_code) {
      const link = `${window.location.origin}/auth?ref=${profile.referral_code}`;
      navigator.clipboard.writeText(link);
      toast({
        title: 'تم النسخ! ✓',
        description: 'رابط الإحالة تم نسخه',
      });
    }
  };

  if (loading || !profile) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-smooth-spin" />
        </div>
      </PageLayout>
    );
  }

  const currentVipLevel = vipLevels.find(v => v.level === profile.vip_level) || vipLevels[0];

  return (
    <PageLayout>
      {/* Hero Section - Optimized */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
        
        <div className="relative px-4 sm:px-5 pt-6 sm:pt-8 pb-8 sm:pb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6 sm:mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-black text-gradient-gold mb-2 tracking-tight">
              مرحباً، {profile.username}
            </h2>
            <p className="text-white/40 text-xs sm:text-sm font-medium">
              استمر في التحديات واربح المزيد مع الدون
            </p>
          </motion.div>

          {/* VIP Badge - Optimized */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex justify-center mb-6 sm:mb-8"
          >
            <div className="bg-gradient-gold rounded-full px-6 sm:px-8 py-2 sm:py-2.5 shadow-[0_4px_12px_-3px_rgba(212,175,55,0.25)] flex items-center gap-2 sm:gap-2.5 group hover:scale-105 transition-transform duration-300">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-black flex-shrink-0" />
              <span className="font-black text-black text-xs sm:text-sm uppercase tracking-tight">
                VIP {profile.vip_level} - {currentVipLevel.nameAr}
              </span>
            </div>
          </motion.div>

          {/* Referral Code Section - Optimized */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-5 border border-white/5 shadow-lg"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex gap-2">
                <button 
                  onClick={shareReferralLink}
                  className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/5 border border-white/5 hover:border-gold/30 active:scale-95 transition-all duration-200 text-gold"
                >
                  <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button 
                  onClick={copyReferralCode}
                  className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/5 border border-white/5 hover:border-gold/30 active:scale-95 transition-all duration-200 text-gold"
                >
                  <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-white/30">رمز الإحالة الخاص بك</span>
            </div>
            <div className="text-center">
              <div className="bg-black/20 rounded-xl sm:rounded-2xl py-2.5 sm:py-3 border border-white/5 mb-2 sm:mb-3">
                <span className="text-xl sm:text-2xl font-black text-gradient-gold tracking-[0.2em]">
                  {profile.referral_code}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-medium text-white/40">
                احصل على <span className="text-gold font-bold">10% عمولة</span> من كل إيداع يقوم به صديقك!
              </p>
            </div>
          </motion.div>

          {/* Progress Bar - Optimized */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-3 sm:mb-4 border border-white/5"
          >
            <div className="flex items-center justify-between mb-2.5 sm:mb-3">
              <span className="text-[10px] sm:text-xs font-bold text-white/30">التحديات اليومية</span>
              <span className="text-xs sm:text-sm font-black text-white">
                {profile.daily_challenges_completed}/2
              </span>
            </div>
            <div className="h-2 sm:h-2.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
              <motion.div
                className="h-full bg-gradient-gold rounded-full shadow-[0_0_8px_rgba(212,175,55,0.4)]"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((profile.daily_challenges_completed / 2) * 100, 100)}%` }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                style={{ willChange: 'width' }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Grid - Optimized */}
      <section className="px-4 mb-8 sm:mb-10">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <StatCard
            icon={Wallet}
            label="رصيدك الحالي"
            value={`$${Number(profile.balance).toLocaleString()}`}
            index={0}
            variant="gold"
          />
          <StatCard
            icon={TrendingUp}
            label="إجمالي الأرباح"
            value={`$${Number(profile.total_earned).toLocaleString()}`}
            index={1}
          />
          <StatCard
            icon={Target}
            label="مستوى VIP"
            value={`VIP ${profile.vip_level}`}
            subValue={currentVipLevel.nameAr}
            index={2}
          />
          <StatCard
            icon={Users}
            label="الإحالات النشطة"
            value={referralCount.toString()}
            subValue="فريقك"
            index={3}
          />
        </div>
      </section>

      {/* Platform Stats */}
      <section className="px-4 mb-8 sm:mb-10">
        <Suspense fallback={<LoadingSpinner />}>
          <PlatformStatsCard />
        </Suspense>
      </section>

      {/* Live Withdrawals */}
      <section className="px-4 mb-8 sm:mb-10">
        <Suspense fallback={<LoadingSpinner />}>
          <FakeWithdrawals />
        </Suspense>
      </section>

      {/* VIP Cards Section */}
      <Suspense fallback={<LoadingSpinner />}>
        <VIPCardsSection />
      </Suspense>
    </PageLayout>
  );
};

export default Index;
