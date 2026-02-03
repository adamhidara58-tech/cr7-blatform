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

    if (profile.vip_level === 0) {
      toast({
        title: 'ترقية مطلوبة',
        description: 'قم بالترقية إلى VIP1 للحصول على أرباح يومية',
        variant: 'destructive',
      });
      return false;
    }

    if (todayClaim) {
      toast({
        title: 'تم الاستلام مسبقاً',
        description: 'لقد استلمت مكافأتك اليومية بالفعل',
        variant: 'destructive',
      });
      return false;
    }

    setClaiming(true);
    const vipLevel = vipLevels.find(v => v.level === profile.vip_level);
    const rewardAmount = vipLevel?.dailyProfit || 0;

    try {
      const today = new Date().toISOString().split('T')[0];

      // Insert daily claim record
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
            description: 'لقد استلمت مكافأتك اليومية بالفعل',
            variant: 'destructive',
          });
        } else {
          throw claimError;
        }
        return false;
      }

      // Update user's balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({
          balance: profile.balance + rewardAmount,
          total_earned: profile.total_earned + rewardAmount,
          daily_challenges_completed: profile.daily_challenges_completed + 1,
        })
        .eq('id', user.id);

      if (balanceError) throw balanceError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'daily_reward',
          amount: rewardAmount,
          description: `مكافأة يومية VIP ${profile.vip_level}`,
          status: 'completed',
        });

      if (transactionError) throw transactionError;

      // Update platform stats
      await supabase
        .from('platform_stats')
        .update({
          total_paid: (await supabase.from('platform_stats').select('total_paid').single()).data?.total_paid + rewardAmount || rewardAmount,
        });

      // Refresh profile and set today's claim
      await refreshProfile();
      setTodayClaim({
        id: '',
        user_id: user.id,
        vip_level: profile.vip_level,
        amount: rewardAmount,
        claimed_at: today,
        created_at: new Date().toISOString(),
      });

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
