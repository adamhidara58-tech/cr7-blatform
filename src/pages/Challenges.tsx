import { motion } from 'framer-motion';
import { Trophy, Calendar, Users, Lock, Crown, Check, Star, Gift } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/hooks/useAuth';
import { useDailyClaim } from '@/hooks/useDailyClaim';
import { vipLevels } from '@/data/mockData';
import { GoldButton } from '@/components/ui/GoldButton';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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

const Challenges = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { hasClaimed, claiming, claimDailyReward } = useDailyClaim();
  const userVipLevel = profile?.vip_level ?? 0;

  // Generate daily login challenges for each VIP level
  const dailyLoginChallenges: DailyChallenge[] = vipLevels.map((level) => ({
    id: `daily-login-vip-${level.level}`,
    type: 'daily_login',
    vipLevel: level.level,
    reward: level.dailyProfit,
    titleAr: level.level === 0 ? 'تسجيل يومي - مجاني' : `تسجيل يومي - VIP ${level.level}`,
    descriptionAr: level.level === 0 
      ? 'سجل دخولك يومياً (لا يوجد ربح بدون عضوية)'
      : `سجل دخولك يومياً واحصل على ${level.dailyProfit.toFixed(2)} USDT`,
    isCompleted: level.level === userVipLevel && hasClaimed,
    requiresVipUpgrade: level.level > userVipLevel,
  }));

  // Invite friend challenge
  const inviteFriendChallenge: DailyChallenge = {
    id: 'invite-friend',
    type: 'invite_friend',
    vipLevel: 0,
    reward: 1,
    titleAr: 'دعوة صديق',
    descriptionAr: 'ادعُ صديقاً واربح 1$ عند ترقيته لـ VIP1',
    isCompleted: false,
    requiresVipUpgrade: false,
  };

  const allChallenges = [...dailyLoginChallenges, inviteFriendChallenge];

  // Separate available and locked challenges
  const availableChallenges = allChallenges.filter(c => !c.requiresVipUpgrade);
  const lockedChallenges = allChallenges.filter(c => c.requiresVipUpgrade);

  const handleClaimReward = async (challenge: DailyChallenge) => {
    if (challenge.type === 'invite_friend') {
      // Navigate to team page or copy referral link
      if (profile?.referral_code) {
        const link = `${window.location.origin}/auth?ref=${profile.referral_code}`;
        navigator.clipboard.writeText(link);
        toast({
          title: 'تم النسخ! ✓',
          description: 'رابط الإحالة تم نسخه، شاركه مع أصدقائك',
        });
      }
    } else if (challenge.type === 'daily_login') {
      if (challenge.vipLevel === 0) {
        toast({
          title: 'ترقية مطلوبة',
          description: 'قم بالترقية إلى VIP1 للحصول على أرباح يومية',
          variant: 'destructive',
        });
        navigate('/vip');
      } else if (challenge.vipLevel === userVipLevel) {
        // Actually claim the reward
        await claimDailyReward();
      } else if (challenge.vipLevel < userVipLevel) {
        toast({
          title: 'مهمة مستوى أدنى',
          description: 'استلم مكافأة مستواك الحالي',
        });
      }
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

  const getLevelColor = (level: number) => {
    const colors: Record<number, string> = {
      0: 'from-gray-500 to-gray-600',
      1: 'from-amber-700 to-amber-800',
      2: 'from-gray-300 to-gray-400',
      3: 'from-yellow-500 to-yellow-600',
      4: 'from-slate-300 to-slate-400',
      5: 'from-cyan-300 to-cyan-500',
    };
    return colors[level] || 'from-primary to-gold-light';
  };

  const ChallengeCard = ({ challenge, index }: { challenge: DailyChallenge; index: number }) => {
    const isLocked = challenge.requiresVipUpgrade;
    const isCurrentUserChallenge = challenge.type === 'daily_login' && challenge.vipLevel === userVipLevel;
    const isLowerLevel = challenge.type === 'daily_login' && challenge.vipLevel < userVipLevel && challenge.vipLevel !== 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className={`relative bg-gradient-card rounded-2xl overflow-hidden border ${
          isLocked ? 'opacity-60 border-border' : 
          isCurrentUserChallenge ? 'border-primary shadow-gold' : 'border-border hover:border-primary/50'
        }`}
      >
        {/* Current Level Highlight */}
        {isCurrentUserChallenge && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-gold" />
        )}

        {/* Locked Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center">
              <Lock className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">VIP {challenge.vipLevel}+</p>
            </div>
          </div>
        )}

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            {/* Left: Icon */}
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
              challenge.type === 'invite_friend' 
                ? 'from-green-500 to-green-600' 
                : getLevelColor(challenge.vipLevel)
            } flex items-center justify-center shadow-lg flex-shrink-0`}>
              {challenge.type === 'invite_friend' ? (
                <Users className="w-6 h-6 text-white" />
              ) : (
                <Calendar className="w-6 h-6 text-white" />
              )}
            </div>

            {/* Middle: Content */}
            <div className="flex-1 text-right">
              <div className="flex items-center justify-end gap-2 mb-1">
                {challenge.type === 'daily_login' && challenge.vipLevel > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${getLevelColor(challenge.vipLevel)} text-white`}>
                    VIP {challenge.vipLevel}
                  </span>
                )}
                {isCurrentUserChallenge && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                    مستواك
                  </span>
                )}
                <h3 className="font-semibold text-foreground text-base">
                  {challenge.titleAr}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {challenge.descriptionAr}
              </p>
            </div>

            {/* Right: Reward */}
            <div className="text-left flex-shrink-0">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <span className="font-bold text-primary text-lg">
                  ${challenge.reward.toFixed(2)}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">USDT</p>
            </div>
          </div>

          {/* Action Button - Only for available challenges */}
          {!isLocked && (
            <div className="mt-3 pt-3 border-t border-border/50">
              {challenge.type === 'invite_friend' ? (
                <GoldButton
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => handleClaimReward(challenge)}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Users className="w-4 h-4" />
                    دعوة صديق
                  </span>
                </GoldButton>
              ) : challenge.vipLevel === 0 ? (
                <GoldButton
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate('/vip')}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Crown className="w-4 h-4" />
                    ترقية للحصول على ربح
                  </span>
                </GoldButton>
              ) : isCurrentUserChallenge ? (
                <GoldButton
                  variant="primary"
                  size="sm"
                  className="w-full"
                  disabled={challenge.isCompleted || claiming}
                  onClick={() => handleClaimReward(challenge)}
                >
                  {claiming ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      جاري الاستلام...
                    </span>
                  ) : challenge.isCompleted ? (
                    <span className="flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" />
                      تم الاستلام اليوم ✓
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Gift className="w-4 h-4" />
                      استلام المكافأة
                    </span>
                  )}
                </GoldButton>
              ) : isLowerLevel ? (
                <GoldButton
                  variant="secondary"
                  size="sm"
                  className="w-full opacity-50"
                  disabled
                >
                  <span className="flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    مستوى أدنى
                  </span>
                </GoldButton>
              ) : null}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

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
            <Trophy className="w-6 h-6 text-primary" />
            <h1 className="font-display text-2xl text-foreground">التحديات اليومية</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            أكمل التحديات واربح مكافآت فورية
          </p>
        </motion.div>

        {/* Current VIP Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-gold rounded-2xl p-4 mb-6 shadow-gold"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-primary-foreground" />
              <div>
                <p className="text-primary-foreground font-bold">
                  VIP {userVipLevel}
                </p>
                <p className="text-primary-foreground/80 text-xs">
                  {vipLevels[userVipLevel]?.nameAr}
                </p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-primary-foreground text-xl font-bold">
                ${vipLevels[userVipLevel]?.dailyProfit.toFixed(2) || '0.00'}
              </p>
              <p className="text-primary-foreground/80 text-xs">ربحك اليومي</p>
            </div>
          </div>

          {/* Claim Status */}
          {userVipLevel > 0 && (
            <div className="mt-3 pt-3 border-t border-primary-foreground/20">
              {hasClaimed ? (
                <p className="text-center text-primary-foreground/80 text-sm flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  تم استلام مكافأة اليوم ✓
                </p>
              ) : (
                <p className="text-center text-primary-foreground text-sm">
                  مكافأتك اليومية جاهزة للاستلام! 🎁
                </p>
              )}
            </div>
          )}
        </motion.div>
      </section>

      {/* Available Challenges */}
      <section className="px-4 pb-4">
        <h2 className="font-display text-lg text-foreground mb-3 text-right flex items-center justify-end gap-2">
          <span>المهام المتاحة</span>
          <Check className="w-5 h-5 text-green-400" />
        </h2>
        <div className="space-y-3">
          {availableChallenges.map((challenge, index) => (
            <ChallengeCard key={challenge.id} challenge={challenge} index={index} />
          ))}
        </div>
      </section>

      {/* Locked Challenges */}
      {lockedChallenges.length > 0 && (
        <section className="px-4 pb-6">
          <h2 className="font-display text-lg text-foreground mb-3 text-right flex items-center justify-end gap-2">
            <span>مهام مستويات أعلى</span>
            <Lock className="w-5 h-5 text-muted-foreground" />
          </h2>
          <div className="space-y-3">
            {lockedChallenges.map((challenge, index) => (
              <ChallengeCard key={challenge.id} challenge={challenge} index={index + availableChallenges.length} />
            ))}
          </div>
        </section>
      )}
    </PageLayout>
  );
};

export default Challenges;
