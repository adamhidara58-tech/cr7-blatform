import { useState, useEffect } from 'react';
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
  const [todayClaim, setTodayClaim] = useState<DailyClaim | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  // Check if user has already claimed today
  useEffect(() => {
    const checkTodayClaim = async () => {
      if (!user) {
        setTodayClaim(null);
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_claims')
        .select('*')
        .eq('user_id', user.id)
        .eq('claimed_at', today)
        .maybeSingle();

      if (error) {
        console.error('Error checking daily claim:', error);
      } else {
        setTodayClaim(data as DailyClaim | null);
      }
      setLoading(false);
    };

    checkTodayClaim();
  }, [user]);

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

    // Double check locally before proceeding
    if (todayClaim) {
      toast({
        title: 'تم الاستلام مسبقاً',
        description: 'تم استلام المكافأة مسبقاً',
        variant: 'destructive',
      });
      return false;
    }

    setClaiming(true);
    const vipLevel = vipLevels.find(v => v.level === profile.vip_level);
    const rewardAmount = vipLevel?.dailyProfit || 0;

    try {
      const today = new Date().toISOString().split('T')[0];

      // 1. Check if already claimed in DB (Atomic check)
      const { data: existingClaim } = await supabase
        .from('daily_claims')
        .select('id')
        .eq('user_id', user.id)
        .eq('claimed_at', today)
        .maybeSingle();

      if (existingClaim) {
        setTodayClaim({
          id: existingClaim.id,
          user_id: user.id,
          vip_level: profile.vip_level,
          amount: rewardAmount,
          claimed_at: today,
          created_at: new Date().toISOString(),
        });
        toast({
          title: 'تم الاستلام مسبقاً',
          description: 'تم استلام المكافأة مسبقاً',
          variant: 'destructive',
        });
        setClaiming(false);
        return false;
      }

      // 2. Insert daily claim record
      const { error: claimError } = await supabase
        .from('daily_claims')
        .insert({
          user_id: user.id,
          vip_level: profile.vip_level,
          amount: rewardAmount,
          claimed_at: today,
        });

      if (claimError) {
        if (claimError.code === '23505') {
          toast({
            title: 'تم الاستلام مسبقاً',
            description: 'تم استلام المكافأة مسبقاً',
            variant: 'destructive',
          });
          // Update local state to reflect it's claimed
          setTodayClaim({
            id: 'already-claimed',
            user_id: user.id,
            vip_level: profile.vip_level,
            amount: rewardAmount,
            claimed_at: today,
            created_at: new Date().toISOString(),
          });
        } else {
          console.error('Claim error:', claimError);
          toast({
            title: 'خطأ',
            description: 'حدث خطأ أثناء استلام المكافأة',
            variant: 'destructive',
          });
        }
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
        console.error('Manual update failed, trying RPC:', updateError);
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
      setTodayClaim({
        id: 'new-claim',
        user_id: user.id,
        vip_level: profile.vip_level,
        amount: rewardAmount,
        claimed_at: today,
        created_at: new Date().toISOString(),
      });

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
    todayClaim,
    loading,
    claiming,
    hasClaimed: !!todayClaim,
    claimDailyReward,
  };
};
