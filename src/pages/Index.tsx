import { motion } from 'framer-motion';
import { Crown, Trophy, Wallet, TrendingUp, Target, Users, ChevronLeft, Copy, Share2 } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { StatCard } from '@/components/cards/StatCard';
import { ChallengeCard } from '@/components/cards/ChallengeCard';
import { GoldButton } from '@/components/ui/GoldButton';
import { FakeWithdrawals } from '@/components/home/FakeWithdrawals';
import { PlatformStatsCard } from '@/components/home/PlatformStatsCard';
import { mockChallenges } from '@/data/mockData';
import { useAuth } from '@/hooks/useAuth';
import { useReferrals } from '@/hooks/useReferrals';
import { useToast } from '@/hooks/use-toast';
import { vipLevels } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import heroBg from '@/assets/hero-bg.jpg';

const Index = () => {
  const { profile, loading } = useAuth();
  const { count: referralCount } = useReferrals();
  const { toast } = useToast();
  const navigate = useNavigate();
  const featuredChallenges = mockChallenges.slice(0, 3);

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

  const handleStartChallenge = () => {
    navigate('/challenges');
  };

  const handleViewAllChallenges = () => {
    navigate('/challenges');
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
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        
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
              استمر في التحديات واربح المزيد
            </p>
          </motion.div>

          {/* VIP Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <div className="bg-gradient-gold rounded-full px-6 py-2 shadow-gold flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary-foreground" />
              <span className="font-bold text-primary-foreground">
                VIP {profile.vip_level} - {currentVipLevel.nameAr}
              </span>
            </div>
          </motion.div>

          {/* Referral Code Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="bg-secondary/50 rounded-2xl p-4 mb-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-2">
                <button 
                  onClick={shareReferralLink}
                  className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors"
                >
                  <Share2 className="w-4 h-4 text-primary" />
                </button>
                <button 
                  onClick={copyReferralCode}
                  className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors"
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
            className="bg-secondary/50 rounded-2xl p-4 mb-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">التحديات اليومية</span>
              <span className="text-sm font-semibold text-foreground">
                {profile.daily_challenges_completed}/{profile.daily_challenges_limit}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-gold rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(profile.daily_challenges_completed / profile.daily_challenges_limit) * 100}%` }}
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
        <PlatformStatsCard />
      </section>

      {/* Live Withdrawals - Fake Data */}
      <section className="px-4 mb-8">
        <FakeWithdrawals />
      </section>

      {/* Featured Challenges */}
      <section className="px-4 mb-8">
        <div className="flex items-center justify-between mb-4">
          <GoldButton variant="outline" size="sm" onClick={handleViewAllChallenges}>
            <span className="flex items-center gap-1">
              عرض الكل
              <ChevronLeft className="w-4 h-4" />
            </span>
          </GoldButton>
          <h3 className="font-display text-xl text-foreground flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            التحديات المميزة
          </h3>
        </div>

        <div className="space-y-3">
          {featuredChallenges.map((challenge, index) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              userVipLevel={profile.vip_level}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* CTA Button */}
      <section className="px-4 pb-6">
        <GoldButton variant="primary" size="lg" className="w-full" onClick={handleStartChallenge}>
          <span className="flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5" />
            ابدأ تحدي جديد
          </span>
        </GoldButton>
      </section>
    </PageLayout>
  );
};

export default Index;
