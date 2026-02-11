import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { vipLevels } from '@/data/mockData';

interface DailyClaim {
  id: string;
  user_id: string;
  vip_level: number;
  amount: number;
  claimed_at: string;
  created_at: string;
}

export const useDailyClaim = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [lastClaim, setLastClaim] = useState<DailyClaim | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [nextClaimAt, setNextClaimAt] = useState<Date | null>(null);

  const checkLastClaim = useCallback(async () => {
    if (!user) {
      setLastClaim(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('daily_claims')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error checking last claim:', error);
    } else if (data) {
      const claimData = data as DailyClaim;
      setLastClaim(claimData);
      
      // Calculate next claim time (24 hours after last claim)
      const lastClaimDate = new Date(claimData.created_at);
      const nextDate = new Date(lastClaimDate.getTime() + 24 * 60 * 60 * 1000);
      setNextClaimAt(nextDate);
    } else {
      setLastClaim(null);
      setNextClaimAt(null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    checkLastClaim();
  }, [checkLastClaim]);

  const claimDailyReward = async () => {
    if (!user || !profile) {
      toast({
        title: 'خطأ',
        description: 'يجب تسجيل الدخول أولاً',
        variant: 'destructive',
      });
      return false;
    }

    // VIP level 0 has no daily profit
    if (profile.vip_level === 0) {
      toast({
        title: 'ترقية مطلوبة',
        description: 'قم بالترقية للحصول على أرباح يومية',
        variant: 'destructive',
      });
      return false;
    }

    // Check 24h cooldown
    if (nextClaimAt && new Date() < nextClaimAt) {
      const diff = nextClaimAt.getTime() - new Date().getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      toast({
        title: 'فترة الانتظار',
        description: `يمكنك استلام المكافأة بعد ${hours} ساعة و ${minutes} دقيقة`,
        variant: 'destructive',
      });
      return false;
    }

    setClaiming(true);
    const vipLevel = vipLevels.find(v => v.level === profile.vip_level);
    const rewardAmount = vipLevel?.dailyProfit || 0;

    try {
      const now = new Date().toISOString();
      const today = now.split('T')[0];

      // 1. Atomic check in DB for the 24h window
      if (lastClaim) {
        const lastDate = new Date(lastClaim.created_at);
        if (new Date().getTime() - lastDate.getTime() < 24 * 60 * 60 * 1000) {
          toast({
            title: 'فترة الانتظار',
            description: 'يمكنك استلام المكافأة بعد مرور 24 ساعة من آخر استلام',
            variant: 'destructive',
          });
          setClaiming(false);
          return false;
        }
      }

      // 2. Insert daily claim record
      const { data: newClaimData, error: claimError } = await supabase
        .from('daily_claims')
        .insert({
          user_id: user.id,
          vip_level: profile.vip_level,
          amount: rewardAmount,
          claimed_at: today, // Keep for legacy but created_at is the source of truth now
        })
        .select()
        .single();

      if (claimError) {
        console.error('Claim error:', claimError);
        toast({
          title: 'خطأ',
          description: 'حدث خطأ أثناء استلام المكافأة',
          variant: 'destructive',
        });
        setClaiming(false);
        return false;
      }

      // 3. Update user's balance
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('balance, total_earned, daily_challenges_completed')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          balance: (currentProfile?.balance || 0) + rewardAmount,
          total_earned: (currentProfile?.total_earned || 0) + rewardAmount,
          daily_challenges_completed: (currentProfile?.daily_challenges_completed || 0) + 1,
        })
        .eq('id', user.id);
      
      if (updateError) {
        const { error: rpcError } = await supabase.rpc('increment_balance', {
          user_id: user.id,
          amount: rewardAmount
        });
        if (rpcError) throw rpcError;
      }

      // 4. Create transaction record
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'daily_reward',
          amount: rewardAmount,
          description: `مكافأة يومية VIP ${profile.vip_level}`,
          status: 'completed',
        });

      // 5. Update platform stats (silent)
      try {
        const { data: stats } = await supabase.from('platform_stats').select('total_paid').single();
        if (stats) {
          await supabase
            .from('platform_stats')
            .update({
              total_paid: (stats.total_paid || 0) + rewardAmount,
            })
            .eq('id', 1);
        }
      } catch (e) {
        console.error('Error updating platform stats:', e);
      }

      // 6. Finalize
      const finalClaim = newClaimData as DailyClaim;
      setLastClaim(finalClaim);
      setNextClaimAt(new Date(new Date(finalClaim.created_at).getTime() + 24 * 60 * 60 * 1000));

      await refreshProfile();

      toast({
        title: 'تم استلام المكافأة! 🎉',
        description: `تم إضافة ${rewardAmount.toFixed(2)} USDT إلى رصيدك`,
      });

      return true;
    } catch (error: any) {
      console.error('Error claiming daily reward:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء استلام المكافأة',
        variant: 'destructive',
      });
      return false;
    } finally {
      setClaiming(false);
    }
  };

  return {
    lastClaim,
    loading,
    claiming,
    nextClaimAt,
    hasClaimed: nextClaimAt ? new Date() < nextClaimAt : false,
    claimDailyReward,
    refreshClaimStatus: checkLastClaim
  };
};
