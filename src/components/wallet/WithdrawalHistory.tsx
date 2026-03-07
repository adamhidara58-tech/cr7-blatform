import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { ArrowUpCircle, Clock, CheckCircle, XCircle, Wallet } from 'lucide-react';
import { useEffect } from 'react';

interface WithdrawalRecord {
  id: string;
  amount_usd: number;
  currency: string;
  network: string | null;
  wallet_address: string;
  status: string;
  created_at: string;
  processed_at: string | null;
}

export const WithdrawalHistory = () => {
  const { profile } = useAuth();

  const { data: withdrawals = [], isLoading, refetch } = useQuery({
    queryKey: ['user-withdrawals', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from('crypto_withdrawals')
        .select('id, amount_usd, currency, network, wallet_address, status, created_at, processed_at')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WithdrawalRecord[];
    },
    enabled: !!profile?.id,
  });

  // Realtime subscription for status updates
  useEffect(() => {
    if (!profile?.id) return;
    const channel = supabase
      .channel('user-withdrawal-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'crypto_withdrawals',
          filter: `user_id=eq.${profile.id}`,
        },
        () => refetch()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile?.id, refetch]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { icon: <CheckCircle className="w-4 h-4 text-emerald-500" />, text: 'تم السحب', bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' };
      case 'rejected':
        return { icon: <XCircle className="w-4 h-4 text-red-500" />, text: 'مرفوض', bg: 'bg-red-500/10 border-red-500/20 text-red-500' };
      case 'pending':
      default:
        return { icon: <Clock className="w-4 h-4 text-amber-500 animate-pulse" />, text: 'قيد المراجعة', bg: 'bg-amber-500/10 border-amber-500/20 text-amber-500' };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-secondary/30 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (withdrawals.length === 0) {
    return (
      <div className="text-center py-8">
        <Wallet className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">لا توجد عمليات سحب بعد</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {withdrawals.map((w, index) => {
        const statusInfo = getStatusInfo(w.status);
        return (
          <motion.div
            key={w.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="bg-secondary/20 border border-white/5 rounded-xl p-3.5 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="p-2 rounded-full bg-primary/15 shrink-0">
                <ArrowUpCircle className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-foreground">سحب {w.currency}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${statusInfo.bg}`}>
                    {statusInfo.text}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground truncate">
                  {w.wallet_address.substring(0, 10)}...{w.wallet_address.slice(-6)} • {w.network || 'TRC20'}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(w.created_at).toLocaleDateString('ar-SA')} - {new Date(w.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <div className="text-left shrink-0">
              <p className="font-bold text-primary text-sm">-${w.amount_usd.toFixed(2)}</p>
              {statusInfo.icon}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
