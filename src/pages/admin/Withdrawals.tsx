import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Search,
  Loader2,
  RefreshCw,
  CheckSquare,
  Square,
  User,
  Wallet as WalletIcon,
  Calendar,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Withdrawal {
  id: string;
  user_id: string;
  amount_usd: number;
  currency: string;
  network: string | null;
  wallet_address: string;
  status: string;
  payout_type: string;
  created_at: string;
  processed_at: string | null;
  profiles: {
    username: string;
    email: string;
  } | null;
}

const Withdrawals = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Real-time subscription to see new requests immediately
  useEffect(() => {
    const channel = supabase
      .channel('admin-withdrawals-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'crypto_withdrawals' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: withdrawals, isLoading, refetch } = useQuery({
    queryKey: ['admin-withdrawals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crypto_withdrawals')
        .select('*, profiles(username, email)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Withdrawal[];
    }
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

      // If rejecting from pending, refund balance
      if (newStatus === 'rejected' && withdrawal.status === 'pending') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', withdrawal.user_id)
          .single();

        await supabase
          .from('profiles')
          .update({ balance: (profile?.balance || 0) + withdrawal.amount_usd })
          .eq('id', withdrawal.user_id);
      }

      // If moving from rejected/completed back to pending, we might need to deduct balance again
      // but for simplicity and security, we only allow manual refund on rejection.

      const { error } = await supabase
        .from('crypto_withdrawals')
        .update({ 
          status: newStatus, 
          processed_at: newStatus !== 'pending' ? new Date().toISOString() : null 
        })
        .eq('id', id);
      
      if (error) throw error;

      // Log the admin action
      await supabase.from('activity_logs').insert({
        admin_id: session.user.id,
        action: `WITHDRAWAL_${newStatus.toUpperCase()}`,
        target_id: id,
        details: { oldStatus: withdrawal.status, newStatus }
      });

      // Notify via Telegram about the status change
      try {
        const botToken = "8328507661:AAH7PJMpCDLbf7TsnjkhjU0jCWoE3ksSVwU";
        const chatId = "8508057441";
        const statusEmoji = newStatus === 'completed' ? '✅' : newStatus === 'rejected' ? '❌' : '⏳';
        const statusText = newStatus === 'completed' ? 'تم القبول والدفع' : newStatus === 'rejected' ? 'تم الرفض' : 'تمت الإعادة للمراجعة';
        
        const message = `${statusEmoji} *تحديث حالة طلب سحب*\n\n` +
          `👤 المستخدم: ${withdrawal.profiles?.username || 'غير معروف'}\n` +
          `💰 المبلغ: $${withdrawal.amount_usd}\n` +
          `📊 الحالة الجديدة: *${statusText}*\n` +
          `🆔 معرف الطلب: \`${id.substring(0, 8)}\``;

        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' }),
        }).catch(e => console.error('Telegram error:', e));
      } catch (e) {}

      return { success: true, message: `تم تغيير حالة الطلب إلى ${newStatus === 'completed' ? 'مقبول' : newStatus === 'rejected' ? 'مرفوض' : 'معلق'}` };
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const massActionMutation = useMutation({
    mutationFn: async ({ ids, action }: { ids: string[]; action: 'completed' | 'rejected' }) => {
      for (const id of ids) {
        await updateStatusMutation.mutateAsync({ id, newStatus: action });
      }
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

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'rejected': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gold tracking-tight mb-1">إدارة طلبات السحب</h1>
          <p className="text-muted-foreground text-sm">تحكم كامل في حالات طلبات السحب والموافقة اليدوية</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="rounded-xl border-border/50">
          <RefreshCw className={`w-4 h-4 ml-2 ${isLoading ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'بانتظار المراجعة', count: withdrawals?.filter(w => w.status === 'pending').length || 0, color: 'text-amber-500', icon: Clock },
          { label: 'تم القبول', count: withdrawals?.filter(w => w.status === 'completed').length || 0, color: 'text-emerald-500', icon: CheckCircle2 },
          { label: 'تم الرفض', count: withdrawals?.filter(w => w.status === 'rejected').length || 0, color: 'text-rose-500', icon: XCircle },
          { label: 'إجمالي الطلبات', count: withdrawals?.length || 0, color: 'text-white', icon: User },
        ].map((stat, i) => (
          <div key={i} className="bg-card p-4 rounded-2xl border border-border flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.count}</p>
            </div>
            <stat.icon className={`w-8 h-8 ${stat.color} opacity-20`} />
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 bg-card p-4 rounded-2xl border border-border">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="بحث باسم المستخدم أو المحفظة..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 rounded-xl bg-secondary/30 border-border/50"
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="bg-secondary/30 border border-border/50 rounded-xl px-4 py-2 text-sm focus:outline-none h-10 min-w-[140px]"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">كل الحالات</option>
            <option value="pending">قيد المراجعة</option>
            <option value="completed">مقبول</option>
            <option value="rejected">مرفوض</option>
          </select>
          
          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-2">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl" onClick={() => massActionMutation.mutate({ ids: selectedIds, action: 'completed' })}>
                  قبول ({selectedIds.length})
                </Button>
                <Button size="sm" variant="destructive" className="rounded-xl" onClick={() => massActionMutation.mutate({ ids: selectedIds, action: 'rejected' })}>
                  رفض ({selectedIds.length})
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-secondary/30 border-b border-border">
                <th className="p-4 w-12 text-center">
                  <button onClick={handleSelectAll}>
                    {selectedIds.length === pendingWithdrawals.length && pendingWithdrawals.length > 0 ? <CheckSquare className="w-5 h-5 text-gold" /> : <Square className="w-5 h-5" />}
                  </button>
                </th>
                <th className="p-4 text-xs font-bold text-muted-foreground">المستخدم</th>
                <th className="p-4 text-xs font-bold text-muted-foreground">المبلغ</th>
                <th className="p-4 text-xs font-bold text-muted-foreground">العملة والشبكة</th>
                <th className="p-4 text-xs font-bold text-muted-foreground">المحفظة</th>
                <th className="p-4 text-xs font-bold text-muted-foreground">التاريخ</th>
                <th className="p-4 text-xs font-bold text-muted-foreground">الحالة</th>
                <th className="p-4 text-xs font-bold text-muted-foreground text-center">تغيير الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                [...Array(3)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={8} className="p-10 bg-secondary/5"></td></tr>)
              ) : filteredWithdrawals?.length === 0 ? (
                <tr><td colSpan={8} className="p-12 text-center text-muted-foreground">لا توجد طلبات سحب حالياً</td></tr>
              ) : (
                filteredWithdrawals?.map((w) => (
                  <tr key={w.id} className="hover:bg-secondary/10 transition-colors">
                    <td className="p-4 text-center">
                      {w.status === 'pending' && <Checkbox checked={selectedIds.includes(w.id)} onCheckedChange={() => handleSelect(w.id)} className="border-border" />}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gold/10 flex items-center justify-center text-gold text-xs font-bold">
                          {w.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-xs">{w.profiles?.username || 'مستخدم'}</span>
                          <span className="text-[9px] text-muted-foreground">{w.profiles?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-black text-gold">${w.amount_usd.toFixed(2)}</td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold bg-secondary px-2 py-0.5 rounded uppercase">{w.currency} / {w.network || 'TRC20'}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 group cursor-pointer" onClick={() => { navigator.clipboard.writeText(w.wallet_address); toast.success('تم نسخ العنوان'); }}>
                        <code className="text-[10px] font-mono text-muted-foreground group-hover:text-gold">{w.wallet_address.substring(0, 6)}...{w.wallet_address.slice(-6)}</code>
                        <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                      </div>
                    </td>
                    <td className="p-4 text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(w.created_at).toLocaleDateString('ar-EG')}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStatusStyles(w.status)}`}>
                        {w.status === 'pending' ? 'قيد المراجعة' : w.status === 'completed' ? 'تم السحب' : 'مرفوض'}
                      </span>
                    </td>
                    <td className="p-4">
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
                          <Button size="sm" variant="ghost" className="h-7 text-[9px] text-muted-foreground hover:text-gold" onClick={() => updateStatusMutation.mutate({ id: w.id, newStatus: 'pending' })} disabled={updateStatusMutation.isPending}>
                            إعادة للمراجعة
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Withdrawals;
