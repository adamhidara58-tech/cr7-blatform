import { motion, AnimatePresence } from 'framer-motion';
import { Users, Link, Copy, TrendingUp, UserPlus, Gift, CheckCircle, Share2, MessageCircle, ExternalLink, Trophy, RotateCw, Play, Info } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { StatCard } from '@/components/cards/StatCard';
import { GoldButton } from '@/components/ui/GoldButton';
import { useAuth } from '@/hooks/useAuth';
import { useReferrals } from '@/hooks/useReferrals';
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Team = () => {
  const { profile } = useAuth();
  const { referrals, totalCommission, loading } = useReferrals();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  // Wheel State
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [wonAmount, setWonAmount] = useState<number | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [availableSpins, setAvailableSpins] = useState(0);
  
  const wheelRef = useRef<HTMLDivElement>(null);
  const rewards = [10, 20, 0.5, 1, 100, 500, 1000, 0.2, 0.9];
  const segmentAngle = 360 / rewards.length;

  useEffect(() => {
    if (profile?.id) {
      // In a real app, we'd fetch this from a 'spins' column or table.
      // For now, we'll simulate it or use a metadata field if available.
      // Since I cannot change DB, I will assume a logic where we check Level 1 VIP2 referrals.
      const fetchSpins = async () => {
        // This is a placeholder for real spin logic
        setAvailableSpins(0); 
      };
      fetchSpins();
    }
  }, [profile?.id]);

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

  const handleSpin = async (demo = false) => {
    if (isSpinning) return;
    
    if (!demo && availableSpins <= 0) {
      toast({
        title: 'لا توجد دورات متاحة',
        description: 'قم بدعوة أصدقاء لترقية حساباتهم إلى VIP2 للحصول على دورات حقيقية.',
        variant: 'destructive'
      });
      return;
    }

    setIsDemo(demo);
    setIsSpinning(true);
    setShowResult(false);

    const extraSpins = 5 + Math.floor(Math.random() * 5); // 5-10 full rotations
    const randomSegment = Math.floor(Math.random() * rewards.length);
    const targetRotation = rotation + (extraSpins * 360) + (randomSegment * segmentAngle);
    
    setRotation(targetRotation);

    setTimeout(async () => {
      setIsSpinning(false);
      const win = rewards[(rewards.length - randomSegment) % rewards.length];
      setWonAmount(win);
      setShowResult(true);

      if (!demo && profile?.id) {
        // Logic to credit real balance
        const { error } = await supabase
          .from('profiles')
          .update({ balance: Number(profile.balance) + win })
          .eq('id', profile.id);
          
        if (!error) {
          toast({
            title: 'مبروك! 🎉',
            description: `تم إضافة $${win} إلى رصيدك بنجاح.`,
          });
          setAvailableSpins(prev => prev - 1);
        }
      }
    }, 4000);
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
            <h1 className="font-display text-2xl text-foreground">نظام الإحالة والنخبة</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            قم ببناء فريقك واربح عمولات ضخمة وجوائز يومية
          </p>
        </motion.div>
      </section>

      {/* Reward Wheel Section */}
      <section className="px-4 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-b from-[#1a1a20] to-[#141419] border border-gold/20 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gold/10 px-4 py-1.5 rounded-full border border-gold/20 mb-3">
              <Trophy className="w-4 h-4 text-gold" />
              <span className="text-xs font-bold text-gold uppercase tracking-wider">عجلة الحظ المجانية</span>
            </div>
            <h2 className="text-xl font-bold text-white">اربح حتى $1,000 مجاناً!</h2>
            <p className="text-xs text-white/40 mt-1">احصل على دورة حقيقية عند ترقية إحالة مستوى 1 إلى VIP2</p>
          </div>

          {/* Wheel Visual */}
          <div className="relative w-64 h-64 mx-auto mb-8">
            {/* Pointer */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20">
              <div className="w-6 h-8 bg-gold clip-path-pointer shadow-lg" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
            </div>
            
            {/* The Wheel */}
            <motion.div
              ref={wheelRef}
              className="w-full h-full rounded-full border-8 border-[#1a1a20] shadow-[0_0_50px_-10px_rgba(212,175,55,0.3)] relative overflow-hidden bg-[#141419]"
              animate={{ rotate: rotation }}
              transition={{ duration: 4, ease: [0.45, 0.05, 0.55, 0.95] }}
            >
              {rewards.map((reward, i) => (
                <div
                  key={i}
                  className="absolute top-0 left-1/2 w-1/2 h-1/2 origin-bottom-left"
                  style={{
                    transform: `rotate(${i * segmentAngle}deg)`,
                    backgroundColor: i % 2 === 0 ? '#1a1a20' : '#141419',
                    borderLeft: '1px solid rgba(212,175,55,0.1)',
                  }}
                >
                  <span 
                    className="absolute top-8 left-4 -rotate-[70deg] text-[10px] font-bold text-gold/80 whitespace-nowrap"
                    style={{ transform: `rotate(${-segmentAngle / 2}deg) translate(20px, 10px)` }}
                  >
                    ${reward}
                  </span>
                </div>
              ))}
              {/* Center Cap */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-gold rounded-full z-10 flex items-center justify-center shadow-lg border-4 border-[#141419]">
                <RotateCw className={`w-5 h-5 text-black ${isSpinning ? 'animate-spin' : ''}`} />
              </div>
            </motion.div>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-xs text-white/60">الدورات المتاحة:</span>
              <span className="bg-gold text-black text-[10px] font-black px-2 py-0.5 rounded-md">{availableSpins}</span>
            </div>
            
            <GoldButton 
              variant="primary" 
              className="w-full h-14 rounded-2xl shadow-gold group relative overflow-hidden"
              onClick={() => handleSpin(false)}
              disabled={isSpinning}
            >
              <span className="flex items-center justify-center gap-2 relative z-10">
                <Play className="w-5 h-5 fill-current" />
                تدوير حقيقي
              </span>
              {isSpinning && <div className="absolute inset-0 bg-black/20 animate-pulse" />}
            </GoldButton>

            <button 
              className="w-full py-3 text-xs font-bold text-white/40 hover:text-gold transition-colors border border-white/5 rounded-xl hover:bg-white/5"
              onClick={() => handleSpin(true)}
              disabled={isSpinning}
            >
              تجربة العجلة (Demo)
            </button>
          </div>

          {/* Result Modal Overlay */}
          <AnimatePresence>
            {showResult && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 text-center"
              >
                <div className="bg-gradient-to-b from-gold/20 to-transparent p-8 rounded-[2rem] border border-gold/30">
                  <Trophy className="w-16 h-16 text-gold mx-auto mb-4 animate-bounce" />
                  <h3 className="text-2xl font-black text-white mb-2">
                    {isDemo ? 'نتيجة تجريبية' : 'مبروك الفوز!'}
                  </h3>
                  <p className="text-4xl font-black text-gradient-gold mb-6">${wonAmount}</p>
                  <GoldButton size="md" onClick={() => setShowResult(false)}>إغلاق</GoldButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Referral Structure Section */}
      <section className="px-4 mb-8">
        <div className="bg-[#141419] border border-white/5 rounded-[2rem] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gold/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-gold" />
            </div>
            <h3 className="text-lg font-bold text-white">هيكل العمولات (3 مستويات)</h3>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { level: '1', rate: '8%', color: 'from-gold to-yellow-600' },
              { level: '2', rate: '3%', color: 'from-gray-300 to-gray-500' },
              { level: '3', rate: '1%', color: 'from-orange-700 to-orange-900' },
            ].map((item) => (
              <div key={item.level} className="bg-black/40 border border-white/5 rounded-2xl p-4 text-center relative overflow-hidden group">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.color}`} />
                <p className="text-[10px] text-white/40 mb-1 uppercase font-bold">مستوى {item.level}</p>
                <p className="text-2xl font-black text-white group-hover:scale-110 transition-transform">{item.rate}</p>
              </div>
            ))}
          </div>

          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex gap-3 items-start">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-200/70 leading-relaxed">
              <p className="font-bold text-blue-300 mb-1">شروط احتساب العمولة:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>تحتسب العمولة من **الإيداعات المكتملة فقط**.</li>
                <li>لا توجد عمولة على الأرباح أو السحوبات.</li>
                <li>يجب أن يكون الإيداع صالحاً وكاملاً ليتم قيد العمولة.</li>
              </ul>
            </div>
          </div>
        </div>
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
