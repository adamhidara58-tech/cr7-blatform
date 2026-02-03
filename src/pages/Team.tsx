import { motion } from 'framer-motion';
import { Users, Link, Copy, TrendingUp, UserPlus, Gift, CheckCircle } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { StatCard } from '@/components/cards/StatCard';
import { GoldButton } from '@/components/ui/GoldButton';
import { mockUser, mockReferrals } from '@/data/mockData';
import { useState } from 'react';

const Team = () => {
  const [copied, setCopied] = useState(false);
  const referralLink = `https://cr7elite.com/join/${mockUser.invitationCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalCommission = mockReferrals.reduce((sum, r) => sum + r.totalCommission, 0);

  return (
    <PageLayout>
      {/* Header */}
      <section className="px-4 pt-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="w-6 h-6 text-primary" />
            <h1 className="font-display text-2xl text-foreground">فريقي</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            ادعُ أصدقاءك واربح عمولات
          </p>
        </motion.div>
      </section>

      {/* Referral Link Card */}
      <section className="px-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-card border border-primary/30 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Link className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">رابط الدعوة الخاص بك</h3>
          </div>
          
          <div className="bg-secondary/50 rounded-xl p-3 mb-4 flex items-center justify-between gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={copyToClipboard}
              className="flex items-center gap-1 text-primary"
            >
              {copied ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </motion.button>
            <p className="text-sm text-muted-foreground truncate flex-1 text-left" dir="ltr">
              {referralLink}
            </p>
          </div>

          <div className="bg-primary/10 rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">كود الدعوة</p>
            <p className="text-xl font-bold text-primary font-mono">
              {mockUser.invitationCode}
            </p>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={UserPlus}
            label="إجمالي الإحالات"
            value={mockReferrals.length}
            index={0}
          />
          <StatCard
            icon={TrendingUp}
            label="إجمالي العمولات"
            value={`$${totalCommission.toFixed(2)}`}
            index={1}
            variant="gold"
          />
        </div>
      </section>

      {/* Commission Rates */}
      <section className="px-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-card border border-border rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">نسب العمولات</h3>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-primary font-bold">10%</span>
              <span className="text-sm text-muted-foreground">المستوى الأول</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-primary font-bold">5%</span>
              <span className="text-sm text-muted-foreground">المستوى الثاني</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-primary font-bold">2%</span>
              <span className="text-sm text-muted-foreground">المستوى الثالث</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Referrals List */}
      <section className="px-4 pb-6">
        <h3 className="font-display text-lg text-foreground mb-4 text-right">الإحالات الأخيرة</h3>
        
        <div className="space-y-3">
          {mockReferrals.map((referral, index) => (
            <motion.div
              key={referral.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-card border border-border rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${referral.isActive ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                <span className="text-sm font-semibold text-primary">
                  ${referral.totalCommission.toFixed(2)}
                </span>
              </div>
              
              <div className="text-right">
                <p className="font-medium text-foreground">{referral.username}</p>
                <p className="text-xs text-muted-foreground">
                  مستوى {referral.level} • {new Date(referral.joinedAt).toLocaleDateString('ar-SA')}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <GoldButton variant="primary" size="lg" className="w-full mt-6">
          <span className="flex items-center justify-center gap-2">
            <UserPlus className="w-5 h-5" />
            دعوة المزيد
          </span>
        </GoldButton>
      </section>
    </PageLayout>
  );
};

export default Team;
