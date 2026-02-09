import { motion } from 'framer-motion';
import { Users, Link, Copy, TrendingUp, UserPlus, Gift, CheckCircle, Share2, MessageCircle, ExternalLink } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { StatCard } from '@/components/cards/StatCard';
import { GoldButton } from '@/components/ui/GoldButton';
import { useAuth } from '@/hooks/useAuth';
import { useReferrals } from '@/hooks/useReferrals';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const Team = () => {
  const { profile } = useAuth();
  const { referrals, totalCommission, loading } = useReferrals();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const referralLink = profile ? `${window.location.origin}/auth?ref=${profile.referral_code}` : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: 'تم النسخ! ✓',
      description: 'رابط الإحالة تم نسخه',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      toast({
        title: 'تم النسخ! ✓',
        description: 'رمز الإحالة تم نسخه',
      });
    }
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'CR7 Elite - منصة النخبة',
        text: `انضم إلى منصة CR7 Elite واربح معي! استخدم رمز الإحالة: ${profile?.referral_code}`,
        url: referralLink,
      });
    } else {
      copyToClipboard();
    }
  };

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
            ادعُ أصدقاءك واربح 10% عمولة على كل إيداع
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

          <div className="bg-primary/10 rounded-xl p-3 text-center mb-4">
            <p className="text-xs text-muted-foreground mb-1">كود الدعوة</p>
            <p className="text-xl font-bold text-primary font-mono">
              {profile.referral_code}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <GoldButton variant="outline" size="md" className="w-full" onClick={copyCode}>
              <span className="flex items-center justify-center gap-2">
                <Copy className="w-4 h-4" />
                نسخ الكود
              </span>
            </GoldButton>
            <GoldButton variant="primary" size="md" className="w-full" onClick={shareLink}>
              <span className="flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" />
                مشاركة
              </span>
            </GoldButton>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={UserPlus}
            label="إجمالي الإحالات"
            value={referrals.length}
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
              <span className="text-sm text-muted-foreground">عمولة على كل إيداع</span>
            </div>
            <div className="py-2">
              <p className="text-xs text-muted-foreground text-center">
                كلما أودع صديقك المُحال، تحصل على 10% من قيمة الإيداع تلقائياً!
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Support Section */}
      <section className="px-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#141419] border border-white/5 rounded-2xl p-6 text-center"
        >
          <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-gold" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">الدعم الفني</h3>
          <p className="text-sm text-white/60 mb-6">
            إذا واجهت أي مشكلة لا تتردد في التواصل معنا عبر تيليغرام
          </p>
          
          <div className="space-y-3">
            <div className="flex flex-col gap-2">
              <p className="text-xs text-white/40 text-left px-1">الدعم الخاص:</p>
              <div className="flex items-center gap-2 bg-black/40 p-3 rounded-xl border border-white/5">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText('https://t.me/c7r_support');
                    toast({ title: 'تم النسخ', description: 'تم نسخ رابط الدعم' });
                  }}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4 text-gold" />
                </button>
                <a 
                  href="https://t.me/c7r_support" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 text-sm text-gold font-medium text-left truncate"
                >
                  t.me/c7r_support
                </a>
                <ExternalLink className="w-4 h-4 text-white/20" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-xs text-white/40 text-left px-1">مجموعة تيليغرام:</p>
              <div className="flex items-center gap-2 bg-black/40 p-3 rounded-xl border border-white/5">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText('https://t.me/cr7rsafcd');
                    toast({ title: 'تم النسخ', description: 'تم نسخ رابط المجموعة' });
                  }}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4 text-gold" />
                </button>
                <a 
                  href="https://t.me/cr7rsafcd" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 text-sm text-gold font-medium text-left truncate"
                >
                  t.me/cr7rsafcd
                </a>
                <ExternalLink className="w-4 h-4 text-white/20" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Referrals List */}
      <section className="px-4 pb-6">
        <h3 className="font-display text-lg text-foreground mb-4 text-left">الإحالات الأخيرة</h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : referrals.length === 0 ? (
          <div className="text-center py-8 bg-secondary/30 rounded-2xl">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">لا توجد إحالات حتى الآن</p>
            <p className="text-xs text-muted-foreground mt-1">شارك رمز الإحالة مع أصدقائك!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {referrals.map((referral, index) => (
              <motion.div
                key={referral.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-card border border-border rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm font-semibold text-primary">
                    ${Number(referral.total_commission).toFixed(2)}
                  </span>
                </div>
                
                <div className="text-right">
                  <p className="font-medium text-foreground">مستخدم مُحال</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(referral.created_at).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <GoldButton variant="primary" size="lg" className="w-full mt-6" onClick={shareLink}>
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
