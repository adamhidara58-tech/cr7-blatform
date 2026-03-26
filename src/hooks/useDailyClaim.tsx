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

    if (profile.vip_level === 0 || profile.vip_level < 1) {
      toast({
        title: 'ترقية مطلوبة',
        description: 'قم بالترقية إلى VIP1 على الأقل للحصول على أرباح يومية',
        variant: 'destructive',
      });
      return false;
    }

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
      // Use the atomic database function instead of client-side updates
      const { data, error } = await supabase.rpc('claim_daily_reward', {
        p_user_id: user.id,
        p_vip_level: Math.floor(profile.vip_level),
        p_amount: rewardAmount,
      });

      if (error) {
        console.error('Claim RPC error:', error);
        toast({
          title: 'خطأ',
          description: 'حدث خطأ أثناء استلام المكافأة',
          variant: 'destructive',
        });
        return false;
      }

      const result = data as { success: boolean; error?: string; claim_id?: string; amount?: number };

      if (!result.success) {
        if (result.error === 'already_claimed') {
          toast({
            title: 'فترة الانتظار',
            description: 'يمكنك استلام المكافأة بعد مرور 24 ساعة من آخر استلام',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'خطأ',
            description: result.error || 'حدث خطأ غير متوقع',
            variant: 'destructive',
          });
        }
        return false;
      }

      // Refresh claim status and profile
      await checkLastClaim();
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
