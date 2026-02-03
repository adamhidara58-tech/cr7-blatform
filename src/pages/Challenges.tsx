import { motion } from 'framer-motion';
import { Trophy, Calendar, Users, Lock, Crown, Check, Star } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/hooks/useAuth';
import { vipLevels } from '@/data/mockData';
import { GoldButton } from '@/components/ui/GoldButton';

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
    isCompleted: false,
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

  if (!profile) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PageLayout>
    );
  }

  const ChallengeCard = ({ challenge, index }: { challenge: DailyChallenge; index: number }) => {
    const isLocked = challenge.requiresVipUpgrade;
    const vipInfo = vipLevels.find(v => v.level === challenge.vipLevel);

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

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className={`relative bg-gradient-card rounded-2xl overflow-hidden border border-border ${
          isLocked ? 'opacity-60' : 'hover:border-primary/50'
        }`}
      >
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
          {!isLocked && challenge.reward > 0 && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <GoldButton
                variant="primary"
                size="sm"
                className="w-full"
                disabled={challenge.isCompleted}
              >
                {challenge.isCompleted ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    تم الإنجاز
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {challenge.type === 'invite_friend' ? 'دعوة صديق' : 'استلام المكافأة'}
                  </span>
                )}
              </GoldButton>
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
