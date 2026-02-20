import { motion, AnimatePresence } from 'framer-motion';
import { Users, Link, Copy, TrendingUp, UserPlus, Gift, CheckCircle, Share2, MessageCircle, ExternalLink, Trophy, RotateCw, Play, Info, Zap, Timer, Star, Bell } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { StatCard } from '@/components/cards/StatCard';
import { GoldButton } from '@/components/ui/GoldButton';
import { useAuth } from '@/hooks/useAuth';
import { useReferrals } from '@/hooks/useReferrals';
import { useState, useRef, useEffect, useMemo } from 'react';
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
  const [demoSpins, setDemoSpins] = useState(3);
  const [showInfo, setShowInfo] = useState(false);
  
  const wheelRef = useRef<HTMLDivElement>(null);
  const spinAudioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);
  const segmentAngle = 360 / REWARDS.length;

  // Initialize Audio
  useEffect(() => {
    spinAudioRef.current = new Audio('/sounds/wheel-spin.mp3');
    winAudioRef.current = new Audio('/sounds/wheel-win.mp3');
    
    if (spinAudioRef.current) {
      spinAudioRef.current.loop = true;
    }

    // Initialize Demo Spins from LocalStorage
    const lastReset = localStorage.getItem('demo_spins_reset');
    const today = new Date().toDateString();
    
    if (lastReset !== today) {
      localStorage.setItem('demo_spins_reset', today);
      localStorage.setItem('demo_spins_count', '3');
      setDemoSpins(3);
    } else {
      const savedCount = localStorage.getItem('demo_spins_count');
      setDemoSpins(savedCount ? parseInt(savedCount) : 3);
    }
  }, []);

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

  const handleSpin = async (demo = false) => {
    if (isSpinning) return;
    
    if (demo) {
      if (demoSpins <= 0) {
        toast({
          title: 'انتهت محاولات التجربة',
          description: 'لقد استهلكت 3 محاولات تجريبية لهذا اليوم. حاول غداً أو استخدم دوراتك الحقيقية.',
          variant: 'destructive'
        });
        return;
      }
    } else if (availableSpins <= 0) {
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

    // Start Sound
    if (spinAudioRef.current) {
      spinAudioRef.current.currentTime = 0;
      spinAudioRef.current.playbackRate = 1.5; // Fast at start
      spinAudioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }

    // Calculate rotation
    const extraSpins = 8 + Math.floor(Math.random() * 5);
    const randomSegment = Math.floor(Math.random() * REWARDS.length);
    const targetRotation = rotation + (extraSpins * 360) + (360 - (randomSegment * segmentAngle));
    
    setRotation(targetRotation);

    // Slow down sound effect
    const slowDownInterval = setInterval(() => {
      if (spinAudioRef.current && spinAudioRef.current.playbackRate > 0.5) {
        spinAudioRef.current.playbackRate -= 0.1;
      }
    }, 500);

    if ('vibrate' in navigator) navigator.vibrate(50);

    setTimeout(async () => {
      clearInterval(slowDownInterval);
      if (spinAudioRef.current) {
        spinAudioRef.current.pause();
      }
      if (winAudioRef.current) {
        winAudioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }

      setIsSpinning(false);
      const win = REWARDS[randomSegment].value;
      setWonAmount(win);
      setShowResult(true);

      if (demo) {
        const newCount = demoSpins - 1;
        setDemoSpins(newCount);
        localStorage.setItem('demo_spins_count', newCount.toString());
      } else if (profile?.id) {
        const { error } = await supabase
          .from('profiles')
          .update({ balance: Number(profile.balance) + win })
          .eq('id', profile.id);
          
        if (!error) {
          await supabase
            .from('profiles')
            .update({ available_spins: Math.max(0, availableSpins - 1) })
            .eq('id', profile.id);
          toast({ title: 'مبروك! 🎉', description: `تم إضافة $${win} إلى رصيدك.` });
          setAvailableSpins(prev => Math.max(0, prev - 1));
        }
      }
    }, 5000);
  };

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
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-[#141419] border border-white/5 rounded-[3rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold/10 rounded-full blur-[80px]" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gold/5 rounded-full blur-[80px]" />
          
          <button 
            onClick={() => setShowInfo(true)}
            className="absolute top-6 right-6 p-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-colors z-20"
          >
            <Info className="w-5 h-5 text-white/40" />
          </button>

          <div className="text-center mb-10">
            <div className="inline-block px-4 py-1 bg-gradient-to-r from-gold/20 to-transparent rounded-full border-l-2 border-gold mb-3">
              <span className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">الفرصة الذهبية</span>
            </div>
            <h2 className="text-2xl font-black text-white">عجلة الحظ الكبرى</h2>
          </div>

          <div className="relative w-56 h-56 sm:w-72 sm:h-72 mx-auto mb-10">
            <div className="absolute inset-0 rounded-full shadow-[0_0_60px_-10px_rgba(212,175,55,0.4)] animate-pulse" />
            
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 drop-shadow-2xl">
              <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[24px] border-t-gold relative">
                <div className="absolute -top-[26px] left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full" />
              </div>
            </div>
            
            <motion.div
              className="w-full h-full rounded-full border-[12px] border-[#1a1a20] relative z-10 shadow-2xl"
              animate={{ rotate: rotation }}
              transition={{ duration: 5, ease: [0.12, 0, 0.39, 0] }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {REWARDS.map((reward, i) => {
                  const startAngle = i * segmentAngle;
                  const endAngle = (i + 1) * segmentAngle;
                  const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                  const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                  const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                  const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
                  
                  return (
                    <g key={i}>
                      <path
                        d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                        fill={reward.color}
                        stroke="#000"
                        strokeWidth="0.5"
                      />
                      <text
                        x="75"
                        y="50"
                        fill={reward.color === '#1a1a20' ? '#D4AF37' : '#000'}
                        fontSize="4"
                        fontWeight="900"
                        transform={`rotate(${startAngle + segmentAngle / 2}, 50, 50)`}
                        textAnchor="middle"
                        className="select-none"
                      >
                        {reward.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-[#1a1a20] rounded-full border-4 border-gold shadow-2xl flex items-center justify-center">
                  <div className="w-2 h-2 bg-gold rounded-full animate-ping" />
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between px-6 py-4 bg-black/40 rounded-2xl border border-white/5 mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gold/10 rounded-lg">
                  <RotateCw className={`w-4 h-4 text-gold ${isSpinning ? 'animate-spin' : ''}`} />
                </div>
                <span className="text-xs font-bold text-white/60">الدورات المتاحة</span>
              </div>
              <span className="text-xl font-black text-gold">{availableSpins}</span>
            </div>

            <GoldButton 
              variant="primary" 
              size="lg" 
              className="w-full h-16 rounded-2xl font-black text-lg shadow-gold group"
              onClick={() => handleSpin(false)}
              disabled={isSpinning || availableSpins <= 0}
            >
              <Play className="w-5 h-5 mr-2 fill-current group-hover:scale-110 transition-transform" />
              جرب حظك الآن
            </GoldButton>

            <button 
              className="w-full py-4 text-xs font-bold text-white/30 hover:text-gold transition-colors flex items-center justify-center gap-2"
              onClick={() => handleSpin(true)}
              disabled={isSpinning}
            >
              <Zap className="w-3 h-3" />
              وضع التجربة ({demoSpins} محاولات متبقية اليوم)
            </button>
          </div>
        </motion.div>
      </section>

      {/* Referral Section */}
      <section className="px-4 mb-10">
        <div className="bg-[#141419] border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-gold/10 rounded-2xl border border-gold/20">
              <UserPlus className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">برنامج الإحالة</h3>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">شارك واربح مع أصدقائك</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-6 bg-black/40 rounded-3xl border border-white/5">
              <p className="text-[10px] font-black text-white/30 uppercase mb-3 tracking-widest">رابط الإحالة الخاص بك</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/5 p-4 rounded-xl border border-white/5 text-xs font-mono text-gold truncate">
                  {referralLink}
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="p-4 bg-gold text-black rounded-xl hover:scale-95 transition-transform active:scale-90"
                >
                  {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              onClick={shareLink}
              className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-sm font-black text-white hover:bg-white/10 transition-all flex items-center justify-center gap-3"
            >
              <Share2 className="w-5 h-5 text-gold" />
              مشاركة الرابط مع الأصدقاء
            </button>
          </div>
        </div>
      </section>

      {/* Result Modal */}
      <AnimatePresence>
        {showResult && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#141419] border border-gold/30 p-10 rounded-[3rem] max-w-sm w-full text-center relative shadow-[0_0_100px_rgba(212,175,55,0.2)]"
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-gold rounded-full flex items-center justify-center shadow-gold animate-bounce">
                <Gift className="w-12 h-12 text-black" />
              </div>
              
              <h3 className="text-3xl font-black text-white mt-8 mb-2">تهانينا!</h3>
              <p className="text-sm text-white/40 mb-8">لقد ربحت جائزة نقدية بقيمة</p>
              <div className="text-6xl font-black text-gradient-gold mb-10 tracking-tighter">${wonAmount}</div>
              
              <GoldButton 
                variant="primary" 
                size="lg" 
                className="w-full h-16 rounded-2xl font-black text-lg"
                onClick={() => setShowResult(false)}
              >
                استلام الجائزة
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
                  <p>يسمح لك باختبار العجلة ورؤية الجوائز دون استهلاك دوراتك الحقيقية أو ربح مبالغ فعلية. لديك 3 محاولات تجريبية يومياً.</p>
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
