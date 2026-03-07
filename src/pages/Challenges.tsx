import { motion } from 'framer-motion';
import { Trophy, Calendar, Users, Lock, Crown, Check, Star, Gift, Clock, RotateCw } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/hooks/useAuth';
import { useDailyClaim } from '@/hooks/useDailyClaim';
import { vipLevels } from '@/data/mockData';
import { GoldButton } from '@/components/ui/GoldButton';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { memo, useMemo, useCallback, useState, useEffect } from 'react';

interface DailyChallenge {
  id: string;
  type: 'daily_login' | 'invite_friend';
  vipLevel: number;
  reward: number;
  titleAr: string;
  descriptionAr: string;
  isCompleted: boolean;
  requiresVipUpgrade?: boolean;
}

// Memoized Challenge Card for performance
const ChallengeCard = memo(({
  challenge,
  index,
  userVipLevel,
  claiming,
  onClaim,
  nextClaimAt







}: {challenge: DailyChallenge;index: number;userVipLevel: number;claiming: boolean;onClaim: (challenge: DailyChallenge) => void;nextClaimAt: Date | null;}) => {
  const isLocked = challenge.requiresVipUpgrade;
  const isCurrentUserChallenge = challenge.type === 'daily_login' && challenge.vipLevel === userVipLevel;
  const isLowerLevel = challenge.type === 'daily_login' && challenge.vipLevel < userVipLevel && challenge.vipLevel !== 0;

  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!isCurrentUserChallenge || !nextClaimAt) return;

    const updateTimer = () => {
      const now = new Date();
      if (now >= nextClaimAt) {
        setTimeLeft('');
        return;
      }
      const diff = nextClaimAt.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor(diff % (1000 * 60 * 60) / (1000 * 60));
      const seconds = Math.floor(diff % (1000 * 60) / 1000);
      setTimeLeft(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isCurrentUserChallenge, nextClaimAt]);

  const getLevelColor = (level: number) => {
    const colors: Record<number, string> = {
      0: 'from-gray-500 to-gray-600',
      0.5: 'from-purple-500 to-purple-600',
      1: 'from-amber-700 to-amber-800',
      2: 'from-gray-300 to-gray-400',
      3: 'from-yellow-500 to-yellow-600',
      4: 'from-slate-300 to-slate-400',
      5: 'from-cyan-300 to-cyan-500'
    };
    return colors[level] || 'from-primary to-gold-light';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
      className={`relative bg-gradient-card rounded-2xl overflow-hidden border will-change-transform ${
      isLocked ? 'opacity-60 border-border' :
      isCurrentUserChallenge ? 'border-primary shadow-gold' : 'border-border hover:border-primary/50'}`
      }
      style={{ transform: 'translateZ(0)' }}>
      
      {isCurrentUserChallenge &&
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-gold" />
      }

      {isLocked &&
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center">
            <Lock className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">VIP {challenge.vipLevel}+</p>
          </div>
        </div>
      }

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
          challenge.type === 'invite_friend' ?
          'from-green-500 to-green-600' :
          getLevelColor(challenge.vipLevel)} flex items-center justify-center shadow-lg flex-shrink-0`
          }>
            {challenge.type === 'invite_friend' ?
            <Users className="w-6 h-6 text-white" /> :

            <Calendar className="w-6 h-6 text-white" />
            }
          </div>

          <div className="flex-1 text-left">
            <div className="flex items-center justify-start gap-2 mb-1">
              <h3 className="font-semibold text-foreground text-base">
                {challenge.titleAr}
              </h3>
              {challenge.type === 'daily_login' && challenge.vipLevel > 0 &&
              <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${getLevelColor(challenge.vipLevel)} text-white`}>
                  VIP {challenge.vipLevel}
                </span>
              }
              {isCurrentUserChallenge &&
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                  مستواك
                </span>
              }
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {challenge.descriptionAr}
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            {challenge.type === 'invite_friend' ?
            <div className="flex items-center gap-1">
                <RotateCw className="w-4 h-4 text-primary" />
                <span className="font-bold text-primary text-sm">لفة VIP</span>
              </div> :

            <>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                  <span className="font-bold text-primary text-lg">
                    ${challenge.reward.toFixed(2)}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">USDT</p>
              </>
            }
          </div>
        </div>

        {!isLocked &&
        <div className="mt-3 pt-3 border-t border-border/50">
            {challenge.type === 'invite_friend' ?
          <GoldButton
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => onClaim(challenge)}>
            
                <span className="flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  دعوة صديق
                </span>
              </GoldButton> :
          challenge.vipLevel === 0 ?
          <GoldButton
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => onClaim(challenge)}>
            
                <span className="flex items-center justify-center gap-2">
                  <Crown className="w-4 h-4" />
                  ترقية للحصول على ربح
                </span>
              </GoldButton> :
          isCurrentUserChallenge ?
          <GoldButton
            variant="primary"
            size="sm"
            className="w-full"
            disabled={challenge.isCompleted || claiming}
            onClick={() => onClaim(challenge)}>
            
                {claiming ?
            <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    جاري الاستلام...
                  </span> :
            challenge.isCompleted ?
            <span className="flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4" />
                    متاح بعد {timeLeft}
                  </span> :

            <span className="flex items-center justify-center gap-2">
                    <Gift className="w-4 h-4" />
                    استلام المكافأة
                  </span>
            }
              </GoldButton> :
          isLowerLevel ?
          <GoldButton
            variant="secondary"
            size="sm"
            className="w-full opacity-50"
            disabled>
            
                <span className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  مستوى أدنى
                </span>
              </GoldButton> :
          null}
          </div>
        }
      </div>
    </motion.div>);

});

ChallengeCard.displayName = 'ChallengeCard';

const Challenges = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { hasClaimed, claiming, claimDailyReward, nextClaimAt } = useDailyClaim();
  const [isLoaded, setIsLoaded] = useState(false);

  const userVipLevel = profile?.vip_level ?? 0;

  // Prevent flickering by waiting for profile
  useEffect(() => {
    if (profile) {
      const timer = setTimeout(() => setIsLoaded(true), 100);
      return () => clearTimeout(timer);
    }
  }, [profile]);

  // Memoize challenges to prevent re-calculation on every render
  const { availableChallenges, lockedChallenges } = useMemo(() => {
    const dailyLoginChallenges: DailyChallenge[] = vipLevels.map((level) => ({
      id: `daily-login-vip-${level.level}`,
      type: 'daily_login',
      vipLevel: level.level,
      reward: level.dailyProfit,
      titleAr: level.level === 0 ? 'تسجيل يومي - مجاني' : `تسجيل يومي - VIP ${level.level}`,
      descriptionAr: level.level === 0 ?
      'سجل دخولك يومياً (لا يوجد ربح بدون عضوية)' :
      `سجل دخولك يومياً واحصل على ${level.dailyProfit.toFixed(2)} USDT`,
      isCompleted: level.level === userVipLevel && hasClaimed,
      requiresVipUpgrade: level.level > userVipLevel
    }));

    const inviteFriendChallenge: DailyChallenge = {
      id: 'invite-friend',
      type: 'invite_friend',
      vipLevel: 0,
      reward: 0,
      titleAr: 'دعوة صديق',
      descriptionAr: 'قم بدعوة صديق (مستوى1) وترقية حسابه إلى VIP2 للحصول على لفة حقيقية في عجلة الحظ',
      isCompleted: false,
      requiresVipUpgrade: false
    };

    const all = [...dailyLoginChallenges, inviteFriendChallenge];
    return {
      availableChallenges: all.filter((c) => !c.requiresVipUpgrade),
      lockedChallenges: all.filter((c) => c.requiresVipUpgrade)
    };
  }, [userVipLevel, hasClaimed]);

  const handleClaimReward = useCallback(async (challenge: DailyChallenge) => {
    if (challenge.type === 'invite_friend') {
      if (profile?.referral_code) {
        const link = `${window.location.origin}/auth?ref=${profile.referral_code}`;
        try {
          await navigator.clipboard.writeText(link);
          toast({
            title: 'تم النسخ! ✓',
            description: 'رابط الإحالة تم نسخه، شاركه مع أصدقائك'
          });
        } catch (err) {
          console.error('Failed to copy:', err);
        }
      }
    } else if (challenge.type === 'daily_login') {
      if (challenge.vipLevel === 0) {
        toast({
          title: 'ترقية مطلوبة',
          description: 'قم بالترقية إلى VIP1 للحصول على أرباح يومية',
          variant: 'destructive'
        });
        navigate('/vip');
      } else if (challenge.vipLevel === userVipLevel) {
        await claimDailyReward();
      } else if (challenge.vipLevel < userVipLevel) {
        toast({
          title: 'مهمة مستوى أدنى',
          description: 'استلم مكافأة مستواك الحالي'
        });
      }
    }
  }, [profile?.referral_code, userVipLevel, claimDailyReward, navigate, toast]);

  if (!profile || !isLoaded) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PageLayout>);

  }

  const currentVipData = vipLevels.find((v) => v.level === userVipLevel);

  return (
    <PageLayout>
      <section className="px-4 pt-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6">
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="w-6 h-6 text-primary" />
            <h1 className="font-display text-2xl text-foreground">التحديات اليومية</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            أكمل التحديات واربح مكافآت فورية
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-gold rounded-2xl p-4 mb-6 shadow-gold will-change-transform"
          style={{ transform: 'translateZ(0)' }}>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-primary-foreground" />
              <div>
                <p className="text-primary-foreground font-bold">
                  VIP {userVipLevel === 0.5 ? 'تجريبي' : userVipLevel}
                </p>
                <p className="text-primary-foreground/80 text-xs">
                  {currentVipData?.nameAr || 'مبتدئ'}
                </p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-primary-foreground text-xl font-bold">
                ${currentVipData?.dailyProfit.toFixed(2) || '0.00'}
              </p>
              <p className="text-primary-foreground/80 text-xs">ربحك اليومي</p>
            </div>
          </div>

          {userVipLevel > 0 &&
          <div className="mt-3 pt-3 border-t border-primary-foreground/20">
              {hasClaimed ?
            <p className="text-center text-primary-foreground/80 text-sm flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  المكافأة القادمة بعد مرور 24 ساعة
                </p> :

            <p className="text-center text-primary-foreground text-sm">
                  مكافأتك اليومية جاهزة للاستلام! 🎁
                </p>
            }
            </div>
          }
        </motion.div>
      </section>

      <section className="px-4 pb-4">
        <h2 className="font-display text-lg text-foreground mb-3 text-right flex items-center justify-end gap-2">
          <span>المهام المتاحة</span>
          <Check className="w-5 h-5 text-green-400" />
        </h2>
        <div className="space-y-3">
          {availableChallenges.map((challenge, index) =>
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            index={index}
            userVipLevel={userVipLevel}
            claiming={claiming}
            onClaim={handleClaimReward}
            nextClaimAt={nextClaimAt} />

          )}
        </div>
      </section>

      {lockedChallenges.length > 0 &&
      <section className="px-4 pb-6">
          <h2 className="font-display text-lg text-foreground mb-3 text-right flex items-center justify-end gap-2">
            <span>مهام مستويات أعلى</span>
            <Lock className="w-5 h-5 text-muted-foreground" />
          </h2>
          <div className="space-y-3">
            {lockedChallenges.map((challenge, index) =>
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            index={index + availableChallenges.length}
            userVipLevel={userVipLevel}
            claiming={claiming}
            onClaim={handleClaimReward}
            nextClaimAt={nextClaimAt} />

          )}
          </div>
        </section>
      }
    </PageLayout>);

};

export default Challenges;