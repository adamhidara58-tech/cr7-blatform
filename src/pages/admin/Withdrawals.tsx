import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle2, XCircle, ExternalLink, Search, Loader2, RefreshCw,
  CheckSquare, Square, User, Wallet as WalletIcon, Calendar, Clock, Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const Withdrawals = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const channel = supabase
      .channel('admin-withdrawals-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'crypto_withdrawals' }, () => {
        queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const { data: withdrawals, isLoading, refetch } = useQuery({
    queryKey: ['admin-withdrawals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crypto_withdrawals')
        .select(`*, profiles!crypto_withdrawals_user_id_fkey (username, email)`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    refetchInterval: 5000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: 'completed' | 'rejected' | 'pending' }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('يجب تسجيل الدخول أولاً');

      const { data: withdrawal } = await supabase
        .from('crypto_withdrawals')
        .select('*, profiles(username, email)')
        .eq('id', id)
        .single();
      if (!withdrawal) throw new Error('الطلب غير موجود');

      if (newStatus === 'rejected' && withdrawal.status === 'pending') {
        const { data: profile } = await supabase.from('profiles').select('balance').eq('id', withdrawal.user_id).single();
        await supabase.from('profiles').update({ balance: (profile?.balance || 0) + withdrawal.amount_usd }).eq('id', withdrawal.user_id);
      }

      const { error } = await supabase
        .from('crypto_withdrawals')
        .update({ status: newStatus, processed_at: newStatus !== 'pending' ? new Date().toISOString() : null })
        .eq('id', id);
      if (error) throw error;

      await supabase.from('activity_logs').insert({
        admin_id: session.user.id,
        action: `WITHDRAWAL_${newStatus.toUpperCase()}`,
        target_id: id,
        details: { oldStatus: withdrawal.status, newStatus }
      });

      try {
        const botToken = "8328507661:AAH7PJMpCDLbf7TsnjkhjU0jCWoE3ksSVwU";
        const chatId = "8508057441";
        const statusEmoji = newStatus === 'completed' ? '✅' : newStatus === 'rejected' ? '❌' : '⏳';
        const statusText = newStatus === 'completed' ? 'تم القبول والدفع' : newStatus === 'rejected' ? 'تم الرفض' : 'تمت الإعادة للمراجعة';
        const message = `${statusEmoji} *تحديث حالة طلب سحب*\n\n👤 المستخدم: ${withdrawal.profiles?.username || 'غير معروف'}\n💰 المبلغ: $${withdrawal.amount_usd}\n📊 الحالة الجديدة: *${statusText}*\n🆔 معرف الطلب: \`${id.substring(0, 8)}\``;
        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' }),
        }).catch(() => {});
      } catch (e) {}

      return { success: true, message: `تم تغيير حالة الطلب إلى ${newStatus === 'completed' ? 'مقبول' : newStatus === 'rejected' ? 'مرفوض' : 'معلق'}` };
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const massActionMutation = useMutation({
    mutationFn: async ({ ids, action }: { ids: string[]; action: 'completed' | 'rejected' }) => {
      for (const id of ids) await updateStatusMutation.mutateAsync({ id, newStatus: action });
      return { success: true, message: `تمت معالجة ${ids.length} طلب بنجاح` };
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
    }
  });

  const filteredWithdrawals = withdrawals?.filter(w => {
    const searchStr = `${w.profiles?.username} ${w.profiles?.email} ${w.wallet_address}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || w.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingWithdrawals = filteredWithdrawals?.filter(w => w.status === 'pending') || [];

  const handleSelectAll = () => {
    if (selectedIds.length === pendingWithdrawals.length && pendingWithdrawals.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingWithdrawals.map(w => w.id));
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending': return { text: 'قيد المراجعة', bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
      case 'completed': return { text: 'تم السحب', bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
      case 'rejected': return { text: 'مرفوض', bg: 'bg-rose-500/10 text-rose-500 border-rose-500/20' };
      default: return { text: status, bg: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20' };
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">إدارة طلبات السحب</h1>
          <p className="text-xs sm:text-sm text-zinc-500">تحكم كامل في حالات طلبات السحب</p>
        </div>
        <Button onClick={() => { refetch(); toast.success('تم التحديث'); }} variant="outline" size="sm" className="border-white/[0.08] gap-2 self-start">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'معلق', count: withdrawals?.filter(w => w.status === 'pending').length || 0, color: 'text-amber-400' },
          { label: 'مقبول', count: withdrawals?.filter(w => w.status === 'completed').length || 0, color: 'text-emerald-400' },
          { label: 'مرفوض', count: withdrawals?.filter(w => w.status === 'rejected').length || 0, color: 'text-rose-400' },
          { label: 'الإجمالي', count: withdrawals?.length || 0, color: 'text-white' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#0d0d12] border border-white/[0.06] rounded-xl p-3 sm:p-4">
            <p className="text-[10px] text-zinc-500 mb-1">{stat.label}</p>
            <p className={`text-lg sm:text-2xl font-bold ${stat.color}`}>{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input placeholder="بحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-10 bg-white/[0.04] border-white/[0.08] rounded-xl text-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select className="bg-[#0d0d12] border border-white/[0.08] rounded-xl px-3 py-2 text-sm h-10 min-w-[120px]" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">الكل</option>
            <option value="pending">معلق</option>
            <option value="completed">مقبول</option>
            <option value="rejected">مرفوض</option>
          </select>
          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-2">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs" onClick={() => massActionMutation.mutate({ ids: selectedIds, action: 'completed' })}>
                  قبول ({selectedIds.length})
                </Button>
                <Button size="sm" variant="destructive" className="rounded-xl text-xs" onClick={() => massActionMutation.mutate({ ids: selectedIds, action: 'rejected' })}>
                  رفض ({selectedIds.length})
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block rounded-xl border border-white/[0.06] bg-[#0d0d12] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="p-3 w-10 text-center">
                  <button onClick={handleSelectAll}>
                    {selectedIds.length === pendingWithdrawals.length && pendingWithdrawals.length > 0 ? <CheckSquare className="w-4 h-4 text-amber-400" /> : <Square className="w-4 h-4 text-zinc-500" />}
                  </button>
                </th>
                <th className="p-3 text-xs text-zinc-500 font-medium">المستخدم</th>
                <th className="p-3 text-xs text-zinc-500 font-medium">المبلغ</th>
                <th className="p-3 text-xs text-zinc-500 font-medium">العملة</th>
                <th className="p-3 text-xs text-zinc-500 font-medium">المحفظة</th>
                <th className="p-3 text-xs text-zinc-500 font-medium">التاريخ</th>
                <th className="p-3 text-xs text-zinc-500 font-medium">الحالة</th>
                <th className="p-3 text-xs text-zinc-500 font-medium text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {isLoading ? (
                [1,2,3].map(i => <tr key={i}><td colSpan={8} className="p-8 bg-white/[0.02]" /></tr>)
              ) : filteredWithdrawals?.length === 0 ? (
                <tr><td colSpan={8} className="p-12 text-center text-zinc-500">لا توجد طلبات</td></tr>
              ) : filteredWithdrawals?.map((w) => {
                const status = getStatusInfo(w.status);
                return (
                  <tr key={w.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 text-center">
                      {w.status === 'pending' && <Checkbox checked={selectedIds.includes(w.id)} onCheckedChange={() => handleSelect(w.id)} />}
                    </td>
                    <td className="p-3">
                      <p className="text-sm font-medium text-white">{w.profiles?.username || 'مستخدم'}</p>
                      <p className="text-[10px] text-zinc-500">{w.profiles?.email}</p>
                    </td>
                    <td className="p-3 font-bold text-amber-400">${w.amount_usd.toFixed(2)}</td>
                    <td className="p-3"><span className="text-[10px] bg-white/[0.04] px-2 py-0.5 rounded font-mono">{w.currency}/{w.network || 'TRC20'}</span></td>
                    <td className="p-3">
                      <button onClick={() => { navigator.clipboard.writeText(w.wallet_address); toast.success('تم النسخ'); }} className="text-[10px] font-mono text-zinc-500 hover:text-amber-400 transition-colors">
                        {w.wallet_address.substring(0, 6)}...{w.wallet_address.slice(-6)}
                      </button>
                    </td>
                    <td className="p-3 text-[10px] text-zinc-500">{new Date(w.created_at).toLocaleDateString('en-US')}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${status.bg}`}>{status.text}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1">
                        {w.status === 'pending' ? (
                          <>
                            <Button size="sm" className="h-7 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-2 rounded-lg" onClick={() => updateStatusMutation.mutate({ id: w.id, newStatus: 'completed' })} disabled={updateStatusMutation.isPending}>
                              <CheckCircle2 className="w-3 h-3 ml-1" /> قبول
                            </Button>
                            <Button size="sm" variant="destructive" className="h-7 text-[10px] px-2 rounded-lg" onClick={() => updateStatusMutation.mutate({ id: w.id, newStatus: 'rejected' })} disabled={updateStatusMutation.isPending}>
                              <XCircle className="w-3 h-3 ml-1" /> رفض
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="ghost" className="h-7 text-[9px] text-zinc-500 hover:text-amber-400" onClick={() => updateStatusMutation.mutate({ id: w.id, newStatus: 'pending' })}>
                            إعادة للمراجعة
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {isLoading ? (
          [1,2,3].map(i => <div key={i} className="h-32 bg-white/[0.03] rounded-xl animate-pulse" />)
        ) : filteredWithdrawals?.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-sm">لا توجد طلبات</div>
        ) : filteredWithdrawals?.map((w, i) => {
          const status = getStatusInfo(w.status);
          return (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-[#0d0d12] border border-white/[0.06] rounded-xl p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {w.status === 'pending' && <Checkbox checked={selectedIds.includes(w.id)} onCheckedChange={() => handleSelect(w.id)} className="mt-0.5" />}
                  <div>
                    <p className="text-sm font-semibold text-white">{w.profiles?.username || 'مستخدم'}</p>
                    <p className="text-[10px] text-zinc-500">{w.profiles?.email}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${status.bg}`}>{status.text}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <div>
                    <p className="text-[10px] text-zinc-500">المبلغ</p>
                    <p className="text-sm font-bold text-amber-400">${w.amount_usd.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500">العملة</p>
                    <p className="text-xs text-zinc-300">{w.currency}/{w.network || 'TRC20'}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-zinc-500">التاريخ</p>
                  <p className="text-xs text-zinc-400">{new Date(w.created_at).toLocaleDateString('en-US')}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                <button onClick={() => { navigator.clipboard.writeText(w.wallet_address); toast.success('تم النسخ'); }} className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-amber-400">
                  <Copy className="w-3 h-3" />
                  {w.wallet_address.substring(0, 8)}...{w.wallet_address.slice(-4)}
                </button>
                <div className="flex gap-1.5">
                  {w.status === 'pending' ? (
                    <>
                      <Button size="sm" className="h-7 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-3 rounded-lg" onClick={() => updateStatusMutation.mutate({ id: w.id, newStatus: 'completed' })} disabled={updateStatusMutation.isPending}>قبول</Button>
                      <Button size="sm" variant="destructive" className="h-7 text-[10px] px-3 rounded-lg" onClick={() => updateStatusMutation.mutate({ id: w.id, newStatus: 'rejected' })} disabled={updateStatusMutation.isPending}>رفض</Button>
                    </>
                  ) : (
                    <Button size="sm" variant="ghost" className="h-7 text-[9px] text-zinc-500" onClick={() => updateStatusMutation.mutate({ id: w.id, newStatus: 'pending' })}>إعادة للمراجعة</Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Withdrawals;
