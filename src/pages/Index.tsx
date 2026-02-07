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
    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PageLayout>
    );
  }

  const currentVipLevel = vipLevels.find(v => v.level === profile.vip_level) || vipLevels[0];

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
        
        <div className="relative px-4 pt-6 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6"
          >
            <h2 className="font-display text-3xl text-gradient-gold mb-2">
              مرحباً، {profile.username}
            </h2>
            <p className="text-muted-foreground text-sm">
              استمر في التحديات واربح المزيد مع الدون
            </p>
          </motion.div>

          {/* VIP Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <div className="bg-gradient-gold rounded-full px-6 py-2 shadow-gold glow-gold flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary-foreground" />
              <span className="font-bold text-primary-foreground uppercase tracking-tight">
                VIP {profile.vip_level} - {currentVipLevel.nameAr}
              </span>
            </div>
          </motion.div>

          {/* Referral Code Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="glass-section rounded-2xl p-4 mb-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-2">
                <button 
                  onClick={shareReferralLink}
                  className="p-2 rounded-xl glass-card border border-border/30 hover:border-primary/50 transition-colors"
                >
                  <Share2 className="w-4 h-4 text-primary" />
                </button>
                <button 
                  onClick={copyReferralCode}
                  className="p-2 rounded-xl glass-card border border-border/30 hover:border-primary/50 transition-colors"
                >
                  <Copy className="w-4 h-4 text-primary" />
                </button>
              </div>
              <span className="text-xs text-muted-foreground">رمز الإحالة الخاص بك</span>
            </div>
            <div className="text-center">
              <span className="text-lg font-bold text-gradient-gold tracking-wider">
                {profile.referral_code}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                احصل على 10% عمولة من كل إيداع يقوم به صديقك!
              </p>
            </div>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-section rounded-2xl p-4 mb-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">التحديات اليومية</span>
              <span className="text-sm font-semibold text-foreground">
                {profile.daily_challenges_completed}/2
              </span>
            </div>
            <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-gold rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((profile.daily_challenges_completed / 2) * 100, 100)}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="px-4 mb-8">
        <div className="grid grid-cols-2 gap-3">
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

      {/* Platform Stats - Fake Data */}
      <section className="px-4 mb-8">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-display text-lg text-foreground mb-4 text-right"
        >
          إحصائيات المنصة
        </motion.h3>
        <Suspense fallback={<LoadingSpinner />}>
          <PlatformStatsCard />
        </Suspense>
      </section>

      {/* Live Withdrawals - Fake Data */}
      <section className="px-4 mb-8">
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
