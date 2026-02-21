import { motion, AnimatePresence } from 'framer-motion';
import { Users, Link, Copy, TrendingUp, UserPlus, CheckCircle, Share2, MessageCircle, ExternalLink, Trophy, RotateCw, Play, Info, Zap, Star } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { StatCard } from '@/components/cards/StatCard';
import { GoldButton } from '@/components/ui/GoldButton';
import { useAuth } from '@/hooks/useAuth';
import { useReferrals } from '@/hooks/useReferrals';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// --- Constants & Types ---
const REWARDS = [
  { value: 10, color: '#D4AF37', label: '$10' },
  { value: 20, color: '#1a1a20', label: '$20' },
  { value: 0.5, color: '#D4AF37', label: '$0.5' },
  { value: 1, color: '#1a1a20', label: '$1' },
  { value: 100, color: '#D4AF37', label: '$100' },
  { value: 500, color: '#1a1a20', label: '$500' },
  { value: 1000, color: '#FFD700', label: '$1000', special: true },
  { value: 0.2, color: '#1a1a20', label: '$0.2' },
  { value: 0.9, color: '#D4AF37', label: '$0.9' },
];

const WINNERS_MOCK = [
  { name: 'أحمد س.', prize: 100, time: 'منذ دقيقتين' },
  { name: 'ياسين م.', prize: 20, time: 'منذ 5 دقائق' },
  { name: 'سارة ك.', prize: 500, time: 'منذ 12 دقيقة' },
  { name: 'محمد ع.', prize: 1000, time: 'منذ ساعة' },
  { name: 'عمر ف.', prize: 10, time: 'منذ ساعة' },
];

const SPIN_DURATION = 4500; // ms
const segmentAngle = 360 / REWARDS.length;

const Team = () => {
  const { profile } = useAuth();
  const { referrals, totalCommission, levelStats, loading } = useReferrals();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  // Wheel State
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [wonAmount, setWonAmount] = useState<number | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [availableSpins, setAvailableSpins] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [winFlash, setWinFlash] = useState(false);
  
  const spinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (profile?.id) {
      const fetchSpins = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('available_spins')
          .eq('id', profile.id)
          .single();
        if (data) setAvailableSpins(data.available_spins ?? 0);
      };
      fetchSpins();

      // Listen for realtime updates to spins
      const channel = supabase
        .channel('spins-update')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profile.id}`,
        }, (payload: any) => {
          if (payload.new?.available_spins !== undefined) {
            setAvailableSpins(payload.new.available_spins);
          }
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [profile?.id]);

  const referralLink = useMemo(() => 
    profile ? `${window.location.origin}/auth?ref=${profile.referral_code}` : '', 
  [profile]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({ title: 'تم النسخ! ✓', description: 'رابط الإحالة تم نسخه' });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CR7 ELITE',
          text: 'انضم إلي في منصة النخبة وابدأ الربح اليوم!',
          url: referralLink,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      copyToClipboard();
    }
  };

  const handleSpin = useCallback(async (demo = false) => {
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
    setWinFlash(false);

    const extraSpins = 8 + Math.floor(Math.random() * 5);
    const randomSegment = Math.floor(Math.random() * REWARDS.length);
    const targetRotation = rotation + (extraSpins * 360) + (360 - (randomSegment * segmentAngle));
    
    // Vibration for mobile
    if ('vibrate' in navigator) navigator.vibrate(50);

    // Use requestAnimationFrame to ensure the browser applies the new rotation
    requestAnimationFrame(() => {
      setRotation(targetRotation);
    });

    spinTimeoutRef.current = setTimeout(async () => {
      setIsSpinning(false);
      const win = REWARDS[randomSegment].value;
      setWonAmount(win);
      setWinFlash(true);

      // Brief flash then show result
      setTimeout(() => {
        setWinFlash(false);
        setShowResult(true);
      }, 600);

      if (!demo && profile?.id) {
        const { error } = await supabase
          .from('profiles')
          .update({ balance: Number(profile.balance) + win })
          .eq('id', profile.id);
          
        if (!error) {
          await supabase
            .from('profiles')
            .update({ available_spins: Math.max(0, availableSpins - 1) })
            .eq('id', profile.id);
          setAvailableSpins(prev => Math.max(0, prev - 1));
        }
      }
    }, SPIN_DURATION);
  }, [isSpinning, availableSpins, rotation, profile, toast]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    };
  }, []);

  if (!profile) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Winners Ticker */}
      <div className="bg-gold/10 border-y border-gold/20 py-2 overflow-hidden whitespace-nowrap relative z-10">
        <motion.div 
          className="flex gap-8 items-center"
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {[...WINNERS_MOCK, ...WINNERS_MOCK].map((w, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-gold/80">
              <Star className="w-3 h-3 fill-gold" />
              <span>{w.name} ربح ${w.prize}</span>
              <span className="text-white/30 font-normal">{w.time}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Header */}
      <section className="px-4 pt-8 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center p-3 bg-gold/10 rounded-2xl border border-gold/20 mb-4">
            <Trophy className="w-8 h-8 text-gold animate-pulse" />
          </div>
          <h1 className="font-black text-3xl text-gradient-gold tracking-tight mb-2">نادي النخبة</h1>
          <p className="text-sm text-white/40 max-w-[250px] mx-auto leading-relaxed">
            استمتع بأفضل نظام مكافآت وعمولات في العالم العربي
          </p>
        </motion.div>
      </section>

      {/* Main Wheel Card */}
      <section className="px-4 mb-10">
        <div className="relative bg-[#141419] border border-white/5 rounded-[3rem] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/8 rounded-full blur-[80px] pointer-events-none" />
          
          {/* Info Button */}
          <button 
            onClick={() => setShowInfo(true)}
            className="absolute top-6 right-6 p-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-colors z-20"
          >
            <Info className="w-5 h-5 text-white/40" />
          </button>

          {/* Wheel Header */}
          <div className="text-center mb-8">
            <div className="inline-block px-4 py-1 bg-gradient-to-r from-primary/20 to-transparent rounded-full border-l-2 border-primary mb-3">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">الفرصة الذهبية</span>
            </div>
            <h2 className="text-2xl font-black text-white">عجلة الحظ الكبرى</h2>
          </div>

          {/* The Wheel */}
          <div className="relative w-60 h-60 sm:w-72 sm:h-72 mx-auto mb-8">
            {/* Outer ring glow - subtle */}
            <div 
              className="absolute -inset-1 rounded-full opacity-40 pointer-events-none"
              style={{ 
                boxShadow: winFlash 
                  ? '0 0 40px 8px hsla(45, 63%, 53%, 0.6)' 
                  : '0 0 20px 2px hsla(45, 63%, 53%, 0.15)',
                transition: 'box-shadow 0.3s ease'
              }} 
            />
            
            {/* Pointer - minimal gold triangle */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30">
              <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-primary drop-shadow-lg" />
            </div>
            
            {/* Wheel disc - CSS transform rotation */}
            <div
              className="w-full h-full rounded-full border-4 border-primary/30 relative z-10 overflow-hidden"
              style={{ 
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning 
                  ? `transform ${SPIN_DURATION}ms cubic-bezier(0.15, 0, 0.05, 1)` 
                  : 'none',
                willChange: isSpinning ? 'transform' : 'auto',
              }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                <defs>
                  <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#D4AF37" />
                    <stop offset="100%" stopColor="#F5E0A3" />
                  </linearGradient>
                  <linearGradient id="darkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1a1a20" />
                    <stop offset="100%" stopColor="#222228" />
                  </linearGradient>
                  <linearGradient id="specialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="100%" stopColor="#FFF8DC" />
                  </linearGradient>
                </defs>
                {REWARDS.map((reward, i) => {
                  const startAngle = i * segmentAngle;
                  const endAngle = (i + 1) * segmentAngle;
                  const x1 = 50 + 49 * Math.cos((Math.PI * startAngle) / 180);
                  const y1 = 50 + 49 * Math.sin((Math.PI * startAngle) / 180);
                  const x2 = 50 + 49 * Math.cos((Math.PI * endAngle) / 180);
                  const y2 = 50 + 49 * Math.sin((Math.PI * endAngle) / 180);
                  const fillId = reward.special ? 'url(#specialGrad)' : reward.color === '#D4AF37' ? 'url(#goldGrad)' : 'url(#darkGrad)';
                  
                  return (
                    <g key={i}>
                      <path
                        d={`M 50 50 L ${x1} ${y1} A 49 49 0 0 1 ${x2} ${y2} Z`}
                        fill={fillId}
                        stroke="hsla(45, 63%, 53%, 0.3)"
                        strokeWidth="0.3"
                      />
                      <text
                        x="74"
                        y="50"
                        fill={reward.color === '#1a1a20' ? '#D4AF37' : '#111'}
                        fontSize="5.5"
                        fontWeight="900"
                        textAnchor="middle"
                        dominantBaseline="central"
                        transform={`rotate(${startAngle + segmentAngle / 2}, 50, 50)`}
                      >
                        {reward.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
              
              {/* Center Cap */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 bg-[#141419] rounded-full z-20 flex items-center justify-center border-2 border-primary/40">
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-gold rounded-full flex items-center justify-center">
                  <RotateCw className={`w-5 h-5 text-black/80 ${isSpinning ? 'animate-spin' : ''}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            {/* Spins counter */}
            <div className="flex items-center justify-between px-5 py-3 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-xs text-white/60 font-bold">الدورات المتاحة</span>
              </div>
              <span className="text-lg font-black text-primary">{availableSpins}</span>
            </div>
            
            {/* Main spin button */}
            {availableSpins > 0 ? (
              <GoldButton 
                variant="primary" 
                className="w-full h-14 rounded-2xl shadow-[0_8px_24px_-4px_hsla(45,63%,53%,0.35)] group"
                onClick={() => handleSpin(false)}
                disabled={isSpinning}
              >
                <span className="flex items-center justify-center gap-3 text-base font-black relative z-10">
                  {isSpinning ? (
                    <>
                      <RotateCw className="w-5 h-5 animate-spin" />
                      جاري الدوران...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      جرب حظك الآن
                    </>
                  )}
                </span>
              </GoldButton>
            ) : (
              <div className="w-full py-4 px-5 rounded-2xl bg-white/5 border border-white/10 text-center">
                <p className="text-xs text-white/40 font-bold">اشحن أو ادعُ أصدقاء للحصول على دورات إضافية</p>
              </div>
            )}

            <button 
              className="w-full py-3 text-[10px] font-bold text-white/20 hover:text-primary/60 transition-colors uppercase tracking-widest"
              onClick={() => handleSpin(true)}
              disabled={isSpinning}
            >
              وضع التجربة (Demo)
            </button>
          </div>
        </div>
      </section>

      {/* Referral Structure Section */}
      <section className="px-4 mb-10">
        <div className="bg-[#141419] border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Users className="w-32 h-32 text-gold" />
          </div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-gold/10 rounded-2xl border border-gold/20">
              <TrendingUp className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">نظام العمولات</h3>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">اربح من 3 مستويات مختلفة</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { level: '1', rate: '8%', label: 'مباشر', color: 'from-gold to-yellow-600' },
              { level: '2', rate: '3%', label: 'فريق', color: 'from-gray-400 to-gray-600' },
              { level: '3', rate: '1%', label: 'شبكة', color: 'from-orange-800 to-orange-950' },
            ].map((item) => (
              <div key={item.level} className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`} />
                <div className="bg-black/40 border border-white/5 rounded-2xl p-5 text-center relative z-10">
                  <p className="text-[8px] text-white/30 mb-1 font-black uppercase tracking-tighter">مستوى {item.level}</p>
                  <p className="text-3xl font-black text-white mb-1">{item.rate}</p>
                  <p className="text-[8px] text-gold font-bold">{item.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gold/5 border border-gold/10 rounded-2xl p-5 flex gap-4 items-start">
            <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center shrink-0">
              <Info className="w-5 h-5 text-gold" />
            </div>
            <div className="text-[11px] text-white/60 leading-relaxed">
              <p className="font-black text-white mb-2">قواعد النخبة:</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-gold rounded-full" />
                  <span>العمولات تحتسب من **الإيداعات المكتملة** فقط.</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-gold rounded-full" />
                  <span>لا توجد عمولات على الأرباح أو السحوبات.</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-gold rounded-full" />
                  <span>تحصل على دورة حقيقية عند ترقية إحالة لـ VIP2.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Referral Link Card */}
      <section className="px-4 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1a1a20] to-[#141419] border border-gold/20 rounded-[2.5rem] p-8 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <Link className="w-6 h-6 text-gold" />
            <h3 className="text-lg font-black text-white">رابط الدعوة الخاص بك</h3>
          </div>
          
          <div className="bg-black/40 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4 border border-white/5">
            <p className="text-xs text-white/40 truncate flex-1 font-mono" dir="ltr">
              {referralLink}
            </p>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={copyToClipboard}
              className="p-3 bg-gold/10 rounded-xl text-gold border border-gold/20 hover:bg-gold/20 transition-colors"
            >
              {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </motion.button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
              <p className="text-[10px] text-white/30 mb-1 font-bold uppercase">كود الدعوة</p>
              <p className="text-xl font-black text-gold font-mono tracking-widest">{profile.referral_code}</p>
            </div>
            <GoldButton variant="primary" className="rounded-2xl font-black" onClick={copyToClipboard}>
              <Share2 className="w-5 h-5 mr-2" />
              مشاركة
            </GoldButton>
          </div>
        </motion.div>
      </section>

      {/* Stats Grid */}
      <section className="px-4 mb-10">
        <div className="grid grid-cols-2 gap-4 mb-4">
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
        
        {/* Level Breakdown */}
        <div className="bg-[#141419] border border-white/5 rounded-2xl p-5 space-y-3">
          <p className="text-xs font-black text-white/40 uppercase tracking-wider mb-2">تفاصيل العمولات حسب المستوى</p>
          {[
            { level: 1, rate: '8%', label: 'مباشر', color: 'text-gold' },
            { level: 2, rate: '3%', label: 'فريق', color: 'text-gray-300' },
            { level: 3, rate: '1%', label: 'شبكة', color: 'text-orange-400' },
          ].map(item => (
            <div key={item.level} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <span className={`text-lg font-black ${item.color}`}>{item.rate}</span>
                <div>
                  <p className="text-xs font-bold text-white">مستوى {item.level} ({item.label})</p>
                  <p className="text-[10px] text-white/30">{levelStats[item.level]?.count || 0} عمولة</p>
                </div>
              </div>
              <span className="text-sm font-black text-gold">${(levelStats[item.level]?.totalCommission || 0).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Result Modal - Clean & Premium */}
      <AnimatePresence>
        {showResult && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm p-6"
            onClick={() => setShowResult(false)}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-[#1a1a20] border border-primary/30 p-8 rounded-3xl max-w-xs w-full text-center shadow-[0_0_60px_-10px_hsla(45,63%,53%,0.25)] relative"
              onClick={e => e.stopPropagation()}
            >
              {/* Trophy icon */}
              <div className="w-20 h-20 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-5 border border-primary/20">
                <Trophy className="w-10 h-10 text-primary" />
              </div>
              
              <h3 className="text-xl font-black text-white mb-1">
                {isDemo ? 'نتيجة تجريبية' : '🔥 مبروك!'}
              </h3>
              <p className="text-xs text-white/40 mb-6">{isDemo ? 'هذه نتيجة تجريبية فقط' : 'لقد ربحت جائزة نقدية'}</p>
              
              {/* Prize amount with scale animation */}
              <motion.div 
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="text-5xl font-black text-gradient-gold mb-8 tracking-tight"
              >
                ${wonAmount}
              </motion.div>
              
              <GoldButton 
                variant="primary" 
                size="lg" 
                className="w-full h-14 rounded-2xl font-black text-base"
                onClick={() => {
                  setShowResult(false);
                  if (!isDemo) {
                    toast({ title: 'مبروك! 🎉', description: `تم إضافة $${wonAmount} إلى رصيدك.` });
                  }
                }}
              >
                {isDemo ? 'حسناً' : 'استلام الجائزة'}
              </GoldButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
            onClick={() => setShowInfo(false)}
          >
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="bg-[#141419] border border-white/10 p-8 rounded-[2.5rem] max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <Info className="w-6 h-6 text-gold" />
                <h3 className="text-xl font-black text-white">قواعد عجلة الحظ</h3>
              </div>
              <div className="space-y-4 text-sm text-white/60 leading-relaxed">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="font-bold text-white mb-2">كيف أحصل على دورات؟</p>
                  <p>تحصل على دورة واحدة حقيقية في كل مرة يقوم فيها صديق قمت بدعوته (مستوى 1) بترقية حسابه إلى VIP2.</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="font-bold text-white mb-2">هل الجوائز حقيقية؟</p>
                  <p>نعم، في الوضع الحقيقي تضاف الجوائز مباشرة إلى رصيدك القابل للسحب أو الاستخدام في المنصة.</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="font-bold text-white mb-2">ما هو وضع التجربة؟</p>
                  <p>يسمح لك باختبار العجلة ورؤية الجوائز دون استهلاك دوراتك الحقيقية أو ربح مبالغ فعلية.</p>
                </div>
              </div>
              <GoldButton className="w-full mt-8 rounded-2xl font-black" onClick={() => setShowInfo(false)}>فهمت ذلك</GoldButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Support Section */}
      <section className="px-4 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#141419] border border-white/5 rounded-[2.5rem] p-8 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
          <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-gold/10">
            <MessageCircle className="w-10 h-10 text-gold" />
          </div>
          <h3 className="text-xl font-black text-white mb-3">مركز الدعم</h3>
          <p className="text-xs text-white/40 mb-8 leading-relaxed">
            فريقنا متواجد على مدار الساعة لمساعدتك في بناء فريقك وتحقيق أقصى استفادة
          </p>
          
          <div className="grid grid-cols-1 gap-4">
            <a 
              href="https://t.me/c7r_support" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-gold/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gold/10 rounded-xl group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5 text-gold" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-white/30 font-bold uppercase">الدعم المباشر</p>
                  <p className="text-sm font-black text-white">t.me/c7r_support</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-white/20" />
            </a>

            <a 
              href="https://t.me/cr7rsafcd" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-gold/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gold/10 rounded-xl group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5 text-gold" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-white/30 font-bold uppercase">مجتمع النخبة</p>
                  <p className="text-sm font-black text-white">t.me/cr7rsafcd</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-white/20" />
            </a>
          </div>
        </motion.div>
      </section>
    </PageLayout>
  );
};

export default Team;
