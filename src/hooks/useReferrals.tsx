import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Referral {
  id: string;
  referred_id: string;
  commission_rate: number;
  total_commission: number;
  created_at: string;
  referred_profile?: {
    username: string;
    vip_level: number;
  };
}

interface LevelStats {
  count: number;
  totalCommission: number;
}

export const useReferrals = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCommission, setTotalCommission] = useState(0);
  const [levelStats, setLevelStats] = useState<Record<number, LevelStats>>({
    1: { count: 0, totalCommission: 0 },
    2: { count: 0, totalCommission: 0 },
    3: { count: 0, totalCommission: 0 },
  });

  useEffect(() => {
    const fetchReferrals = async () => {
      if (!user) {
        setReferrals([]);
        setLoading(false);
        return;
      }

      // Fetch direct referrals
      const { data, error } = await supabase
        .from('referrals')
        .select('id, referred_id, commission_rate, total_commission, created_at')
        .eq('referrer_id', user.id);

      if (error) {
        console.error('Error fetching referrals:', error);
      } else if (data) {
        setReferrals(data);
      }

      // Fetch commission stats by level from referral_commissions
      const { data: commissions, error: commError } = await supabase
        .from('referral_commissions')
        .select('level, commission_amount')
        .eq('referrer_id', user.id);

      if (commError) {
        console.error('Error fetching commission stats:', commError);
      } else if (commissions) {
        const stats: Record<number, LevelStats> = {
          1: { count: 0, totalCommission: 0 },
          2: { count: 0, totalCommission: 0 },
          3: { count: 0, totalCommission: 0 },
        };
        let total = 0;

        // Count unique deposits per level
        commissions.forEach((c: any) => {
          if (stats[c.level]) {
            stats[c.level].count += 1;
            stats[c.level].totalCommission += Number(c.commission_amount);
            total += Number(c.commission_amount);
          }
        });

        setLevelStats(stats);
        setTotalCommission(total);
      }

      setLoading(false);
    };

    fetchReferrals();
  }, [user]);

  return { referrals, totalCommission, levelStats, loading, count: referrals.length };
};
