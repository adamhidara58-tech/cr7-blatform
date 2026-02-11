import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  User,
  Wallet,
  DollarSign,
  Calendar,
  ShieldAlert,
  Clock,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

type WithdrawalStatus = 'pending' | 'completed' | 'rejected';
type FilterStatus = 'all' | WithdrawalStatus;

interface WithdrawalItem {
  id: string;
  user_id: string;
  amount_usd: number;
  currency: string;
  network: string | null;
  wallet_address: string;
  status: string;
  created_at: string;
  processed_at: string | null;
  profiles: { username: string; email: string } | null;
}

const SecureWithdrawAdmin = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('all');

  const fetchAllWithdrawals = useCallback(async () => {
    setLoading(true);
    try {
      const { data: withdrawalsData, error: wError } = await supabase
        .from('crypto_withdrawals')
        .select('*')
        .order('created_at', { ascending: false });

      if (wError) throw wError;

      if (withdrawalsData && withdrawalsData.length > 0) {
        const userIds = [...new Set(withdrawalsData.map(w => w.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username, email')
          .in('id', userIds);

        const combinedData = withdrawalsData.map(w => ({
          ...w,
          profiles: profilesData?.find(p => p.id === w.user_id) || null,
        }));

        setWithdrawals(combinedData);
      } else {
        setWithdrawals([]);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Fetch error:', error);
      toast.error('Error fetching data: ' + msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + realtime subscription
  useEffect(() => {
    fetchAllWithdrawals();

    const channel = supabase
      .channel('secure-withdraw-admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'crypto_withdrawals' },
        () => {
          fetchAllWithdrawals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAllWithdrawals]);

  const handleStatusUpdate = async (id: string, userId: string, amount: number, newStatus: 'completed' | 'rejected') => {
    if (actionLoading) return; // prevent duplicate actions
    setActionLoading(id);
    try {
      // 1. Update withdrawal status
      const { error: updateError } = await supabase
        .from('crypto_withdrawals')
        .update({
          status: newStatus,
          processed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('status', 'pending'); // only update if still pending (prevent duplicates)

      if (updateError) throw updateError;

      // 2. If rejected, refund balance
      if (newStatus === 'rejected') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', userId)
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({ balance: Number(profile.balance) + Number(amount) })
            .eq('id', userId);
        }
      }

      // 3. Create transaction record for user visibility
      const description = newStatus === 'completed' ? 'Withdrawal Successful' : 'Withdrawal Rejected';
      await supabase.from('transactions').insert({
        user_id: userId,
        type: 'withdrawal',
        amount: amount,
        description,
        status: newStatus,
      });

      // 4. Log activity
      const { data: { session } } = await supabase.auth.getSession();
      await supabase.from('activity_logs').insert({
        admin_id: session?.user?.id || null,
        action: `withdrawal_${newStatus}`,
        target_id: userId,
        details: { withdrawal_id: id, amount, status: newStatus },
      });

      toast.success(newStatus === 'completed' ? '✅ Withdrawal approved' : '❌ Withdrawal rejected & refunded');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Update failed: ' + msg);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = filter === 'all' ? withdrawals : withdrawals.filter(w => w.status === filter);

  const counts = {
    all: withdrawals.length,
    pending: withdrawals.filter(w => w.status === 'pending').length,
    completed: withdrawals.filter(w => w.status === 'completed').length,
    rejected: withdrawals.filter(w => w.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-[#060606] text-white p-4 md:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#111] p-6 rounded-2xl border border-white/5">
          <div>
            <h1 className="text-2xl md:text-3xl font-black flex items-center gap-3">
              <ShieldAlert className="w-7 h-7 text-amber-500" />
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Secure Withdrawal Panel
              </span>
            </h1>
            <p className="text-sm text-white/40 mt-1">Private admin panel — Full database access</p>
          </div>
          <Button
            onClick={fetchAllWithdrawals}
            disabled={loading}
            className="bg-amber-500 text-black hover:bg-amber-400 font-bold rounded-xl px-6"
          >
            <RefreshCw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {([
            { key: 'all' as FilterStatus, label: 'All', color: 'bg-white/5 border-white/10', textColor: 'text-white' },
            { key: 'pending' as FilterStatus, label: 'Pending', color: 'bg-yellow-500/10 border-yellow-500/20', textColor: 'text-yellow-500' },
            { key: 'completed' as FilterStatus, label: 'Completed', color: 'bg-emerald-500/10 border-emerald-500/20', textColor: 'text-emerald-500' },
            { key: 'rejected' as FilterStatus, label: 'Rejected', color: 'bg-red-500/10 border-red-500/20', textColor: 'text-red-500' },
          ]).map(s => (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className={`p-4 rounded-xl border transition-all ${s.color} ${filter === s.key ? 'ring-2 ring-amber-500/50' : ''}`}
            >
              <p className={`text-2xl font-black ${s.textColor}`}>{counts[s.key]}</p>
              <p className="text-xs text-white/40">{s.label}</p>
            </button>
          ))}
        </div>

        {/* Withdrawals List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <RefreshCw className="w-10 h-10 animate-spin text-amber-500" />
              <p className="text-amber-500 font-medium">Loading from database...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-[#111] rounded-2xl border border-dashed border-white/10">
              <p className="text-white/30">No withdrawal requests found</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filtered.map((w) => (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  layout
                  className="bg-[#111] p-5 rounded-xl border border-white/5 hover:border-amber-500/20 transition-all"
                >
                  <div className="flex flex-col lg:flex-row justify-between gap-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 flex-1">
                      {/* User */}
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500/10">
                          <User className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-white/30 uppercase tracking-wider">User</p>
                          <p className="font-bold text-sm truncate">{w.profiles?.username || 'Unknown'}</p>
                          <p className="text-[10px] text-white/40 truncate">{w.profiles?.email || '—'}</p>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-500/10">
                          <DollarSign className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-[10px] text-white/30 uppercase tracking-wider">Amount</p>
                          <p className="font-black text-emerald-400 text-lg">${w.amount_usd}</p>
                          <p className="text-[10px] text-white/30 uppercase">{w.currency} ({w.network || 'TRC20'})</p>
                        </div>
                      </div>

                      {/* Wallet */}
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-500/10">
                          <Wallet className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-white/30 uppercase tracking-wider">Wallet</p>
                          <p className="font-mono text-[10px] text-blue-400 truncate" title={w.wallet_address}>
                            {w.wallet_address}
                          </p>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-purple-500/10">
                          <Calendar className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-[10px] text-white/30 uppercase tracking-wider">Date</p>
                          <p className="text-xs font-medium">{new Date(w.created_at).toLocaleString('en-US')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 shrink-0 border-t lg:border-t-0 lg:border-r border-white/5 pt-4 lg:pt-0 lg:pr-5">
                      {w.status === 'pending' ? (
                        <div className="flex gap-2 w-full lg:w-auto">
                          <Button
                            onClick={() => handleStatusUpdate(w.id, w.user_id, w.amount_usd, 'completed')}
                            disabled={!!actionLoading}
                            className="flex-1 lg:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl gap-2"
                          >
                            {actionLoading === w.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                            Accept
                          </Button>
                          <Button
                            onClick={() => handleStatusUpdate(w.id, w.user_id, w.amount_usd, 'rejected')}
                            disabled={!!actionLoading}
                            variant="destructive"
                            className="flex-1 lg:flex-none font-bold rounded-xl gap-2"
                          >
                            {actionLoading === w.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <Badge
                          className={`px-4 py-2 text-xs font-black rounded-xl ${
                            w.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}
                        >
                          {w.status === 'completed' ? '✅ Completed' : '❌ Rejected'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecureWithdrawAdmin;
