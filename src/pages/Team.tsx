import { motion, AnimatePresence } from 'framer-motion';
import { Users, Link, Copy, TrendingUp, UserPlus, Gift, CheckCircle, Share2, Trophy, Info, Star } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { StatCard } from '@/components/cards/StatCard';
import { GoldButton } from '@/components/ui/GoldButton';
import { useAuth } from '@/hooks/useAuth';
import { useReferrals } from '@/hooks/useReferrals';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// --- Constants ---
const REWARDS = [
  { value: 10, color: '#D4AF37', label: '$10' },
  { value: 20, color: '#1a1a20', label: '$20' },
  { value: 0.5, color: '#D4AF37', label: '$0.5' },
  { value: 1, color: '#1a1a20', label: '$1' },
  { value: 100, color: '#D4AF37', label: '$100' },
  { value: 500, color: '#1a1a20', label: '$500' },
  { value: 1000, color: '#FFD700', label: '$1000' },
  { value: 0.2, color: '#1a1a20', label: '$0.2' },
  { value: 0.9, color: '#D4AF37', label: '$0.9' },
];

const WINNERS_MOCK = [
  { name: 'أحمد س.', prize: 100, time: 'منذ دقيقتين' },
  { name: 'ياسين م.', prize: 20, time: 'منذ 5 دقائق' },
  { name: 'سارة ك.', prize: 500, time: 'منذ 12 دقيقة' },
  { name: 'محمد ع.', prize: 1000, time: 'منذ ساعة' },
];

const Team = () => {
  const { profile } = useAuth();
  const { referrals, totalCommission } = useReferrals();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [wonAmount, setWonAmount] = useState<number | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  const segmentAngle = 360 / REWARDS.length;

  const referralLink = useMemo(() => 
    profile ? `${window.location.origin}/auth?ref=${profile.referral_code}` : '', 
  [profile]);

  const copyToClipboard = () => {
    if (!referralLink) return;
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
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const handleSpin = (demo = false) => {
    if (isSpinning) return;
    setIsDemo(demo);
    setIsSpinning(true);
    setShowResult(false);

    const extraSpins = 5 + Math.floor(Math.random() * 5);
    const randomSegment = Math.floor(Math.random() * REWARDS.length);
    const targetRotation = rotation + (extraSpins * 360) + (360 - (randomSegment * segmentAngle));
    
    setRotation(targetRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setWonAmount(REWARDS[randomSegment].value);
      setShowResult(true);
    }, 4000);
  };

  if (!profile) return <PageLayout><div className="p-20 text-center text-white">جاري التحميل...</div></PageLayout>;

  return (
    <PageLayout>
      {/* Winners Ticker */}
      <div className="bg-gold/10 border-y border-gold/20 py-2 overflow-hidden whitespace-nowrap relative z-10">
        <div className="flex gap-8 items-center animate-marquee">
          {[...WINNERS_MOCK, ...WINNERS_MOCK].map((w, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-gold/80">
              <Star className="w-3 h-3 fill-gold" />
              <span>{w.name} ربح ${w.prize}</span>
            </div>
          ))}
        </div>
      </div>

      <section className="px-4 pt-8 pb-4 text-center">
        <Trophy className="w-12 h-12 text-gold mx-auto mb-4" />
        <h1 className="font-black text-3xl text-gradient-gold mb-2">نادي النخبة</h1>
        <p className="text-sm text-white/40">نظام مكافآت وعمولات متطور</p>
      </section>

      <section className="px-4 mb-10">
        <div className="bg-[#141419] border border-white/5 rounded-[2rem] p-6 text-center relative overflow-hidden">
          <button onClick={() => setShowInfo(true)} className="absolute top-4 right-4 text-white/20"><Info className="w-5 h-5" /></button>
          <h2 className="text-xl font-black text-white mb-6">عجلة الحظ</h2>
          
          <div className="relative w-64 h-64 mx-auto mb-8">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-white" />
            <div 
              className="w-full h-full rounded-full border-8 border-[#1a1a20] transition-transform duration-[4000ms] ease-out"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {REWARDS.map((reward, i) => {
                  const startAngle = i * segmentAngle;
                  const endAngle = (i + 1) * segmentAngle;
                  const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                  const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                  const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                  const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
                  return (
                    <g key={i}>
                      <path d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`} fill={reward.color} stroke="#000" strokeWidth="0.1" />
                      <text x="70" y="50" fill={reward.color === '#1a1a20' ? '#D4AF37' : '#000'} fontSize="4" fontWeight="bold" textAnchor="middle" transform={`rotate(${startAngle + segmentAngle / 2}, 50, 50)`}>{reward.label}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="flex gap-3">
            <GoldButton className="flex-1" onClick={() => handleSpin(false)} disabled={isSpinning}>دوران حقيقي</GoldButton>
            <button className="flex-1 bg-white/5 text-white/60 rounded-xl text-sm font-bold" onClick={() => handleSpin(true)} disabled={isSpinning}>تجربة</button>
          </div>
        </div>
      </section>

      <section className="px-4 mb-10">
        <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-4"><Link className="w-5 h-5 text-gold" /><h3 className="font-bold text-white">رابط الدعوة</h3></div>
          <div className="bg-black/40 p-3 rounded-xl mb-4 text-xs text-white/40 truncate font-mono">{referralLink}</div>
          <div className="flex gap-3">
            <button onClick={copyToClipboard} className="flex-1 bg-gold/10 text-gold py-3 rounded-xl font-bold border border-gold/20">{copied ? 'تم النسخ' : 'نسخ الرابط'}</button>
            <button onClick={shareLink} className="p-3 bg-white/5 rounded-xl text-white/60"><Share2 className="w-5 h-5" /></button>
          </div>
        </div>
      </section>

      <section className="px-4 mb-10 grid grid-cols-2 gap-4">
        <StatCard icon={Users} label="الإحالات" value={referrals.length} index={0} />
        <StatCard icon={TrendingUp} label="العمولات" value={`$${totalCommission.toFixed(2)}`} index={1} variant="gold" />
      </section>

      <AnimatePresence>
        {showResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="bg-[#1a1a20] border border-gold/30 rounded-[2.5rem] p-8 text-center max-w-xs w-full">
              <Gift className="w-16 h-16 text-gold mx-auto mb-4" />
              <h2 className="text-2xl font-black text-white mb-2">{isDemo ? 'نتيجة التجربة' : 'مبروك الفوز!'}</h2>
              <p className="text-4xl font-black text-gold mb-6">${wonAmount}</p>
              <GoldButton className="w-full" onClick={() => setShowResult(false)}>إغلاق</GoldButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showInfo && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90">
          <div className="bg-[#141419] border border-white/10 rounded-3xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-white mb-4">قواعد النظام</h3>
            <ul className="text-sm text-white/60 space-y-3 text-right" dir="rtl">
              <li>• المستوى 1: عمولة 8% من الإيداع.</li>
              <li>• المستوى 2: عمولة 3% من الإيداع.</li>
              <li>• المستوى 3: عمولة 1% من الإيداع.</li>
              <li>• تحصل على دورة مجانية عند ترقية صديق لـ VIP2.</li>
            </ul>
            <button className="w-full mt-6 py-3 bg-white/5 text-white font-bold rounded-xl" onClick={() => setShowInfo(false)}>فهمت</button>
          </div>
        </div>
      </AnimatePresence>
    </PageLayout>
  );
};

export default Team;
