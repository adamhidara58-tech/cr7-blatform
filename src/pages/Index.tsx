import { motion } from 'framer-motion';
import { Crown, Trophy, Wallet, TrendingUp, Target, Users, Star, ChevronLeft } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { StatCard } from '@/components/cards/StatCard';
import { ChallengeCard } from '@/components/cards/ChallengeCard';
import { GoldButton } from '@/components/ui/GoldButton';
import { mockUser, mockChallenges, stats } from '@/data/mockData';
import heroBg from '@/assets/hero-bg.jpg';

const Index = () => {
  const featuredChallenges = mockChallenges.slice(0, 3);

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
              مرحباً، {mockUser.username}
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
                VIP {mockUser.vipLevel} - ذهبي
              </span>
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
                {mockUser.dailyChallengesCompleted}/{mockUser.dailyChallengesLimit}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-gold rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(mockUser.dailyChallengesCompleted / mockUser.dailyChallengesLimit) * 100}%` }}
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
            value={`$${mockUser.balance.toLocaleString()}`}
            index={0}
            variant="gold"
          />
          <StatCard
            icon={TrendingUp}
            label="إجمالي الأرباح"
            value={`$${mockUser.totalEarned.toLocaleString()}`}
            index={1}
          />
          <StatCard
            icon={Target}
            label="تحديات مكتملة"
            value="156"
            subValue="هذا الشهر"
            index={2}
          />
          <StatCard
            icon={Users}
            label="الإحالات النشطة"
            value="24"
            subValue="فريقك"
            index={3}
          />
        </div>
      </section>

      {/* Featured Challenges */}
      <section className="px-4 mb-8">
        <div className="flex items-center justify-between mb-4">
          <GoldButton variant="outline" size="sm">
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
              userVipLevel={mockUser.vipLevel}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* Quick Stats Banner */}
      <section className="px-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gradient-card border border-border rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <Star className="w-6 h-6 text-primary" />
            <h3 className="font-display text-lg text-foreground">إحصائيات المنصة</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gradient-gold">
                {stats.totalUsers.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">عضو نشط</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gradient-gold">
                ${(stats.totalPaid / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-muted-foreground">إجمالي المدفوعات</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA Button */}
      <section className="px-4 pb-6">
        <GoldButton variant="primary" size="lg" className="w-full">
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
