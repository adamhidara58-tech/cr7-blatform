import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Search,
  Loader2,
  AlertCircle,
  RefreshCw,
  Send,
  CheckSquare,
  Square,
  Zap,
  User,
  Wallet as WalletIcon,
  Calendar
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
  amount_crypto: number | null;
  currency: string;
  network: string | null;
  wallet_address: string;
  status: string;
  payout_type: string;
  withdrawal_id: string | null;
  tx_hash: string | null;
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

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-withdrawals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crypto_withdrawals',
        },
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

  const processWithdrawalMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'approve' | 'reject' }) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('لم يتم العثور على جلسة نشطة. يرجى تسجيل الدخول مجدداً.');
      }

      if (action === 'approve') {
        // Manual approval - just update status
        const { error } = await supabase
          .from('crypto_withdrawals')
          .update({ 
            status: 'completed', 
            processed_at: new Date().toISOString(),
            payout_type: 'manual'
          })
          .eq('id', id);
        
        if (error) throw error;
        
        // Log activity
        await supabase.from('activity_logs').insert({
          admin_id: session.user.id,
          action: 'WITHDRAWAL_APPROVED_MANUAL',
          target_id: id,
          details: { method: 'admin_dashboard_ui' }
        });
        
        return { success: true, message: 'تم قبول الطلب بنجاح' };
      } else {
        // Reject - refund balance and update status
        const { data: w } = await supabase
          .from('crypto_withdrawals')
          .select('*')
          .eq('id', id)
          .single();

        if (!w) throw new Error('الطلب غير موجود');

        // Refund balance
        const { data: profile } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', w.user_id)
          .single();

        await supabase
          .from('profiles')
          .update({ 
            balance: (profile?.balance || 0) + w.amount_usd 
          })
          .eq('id', w.user_id);
        
        const { error } = await supabase
          .from('crypto_withdrawals')
          .update({ 
            status: 'rejected', 
            processed_at: new Date().toISOString() 
          })
          .eq('id', id);
        
        if (error) throw error;

        // Log activity
        await supabase.from('activity_logs').insert({
          admin_id: session.user.id,
          action: 'WITHDRAWAL_REJECTED',
          target_id: id,
          details: { refund: true }
        });

        return { success: true, message: 'تم رفض الطلب وإعادة الرصيد للمستخدم' };
      }
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
    mutationFn: async ({ ids, action }: { ids: string[]; action: 'approve' | 'reject' }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Session missing');

      for (const id of ids) {
        if (action === 'approve') {
          await supabase
            .from('crypto_withdrawals')
            .update({ 
              status: 'completed', 
              processed_at: new Date().toISOString(),
              payout_type: 'manual'
            })
            .eq('id', id)
            .eq('status', 'pending');
        } else {
          const { data: w } = await supabase
            .from('crypto_withdrawals')
            .select('*')
            .eq('id', id)
            .eq('status', 'pending')
            .single();

          if (w) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('balance')
              .eq('id', w.user_id)
              .single();

            await supabase
              .from('profiles')
              .update({ balance: (profile?.balance || 0) + w.amount_usd })
              .eq('id', w.user_id);

            await supabase
              .from('crypto_withdrawals')
              .update({ status: 'rejected', processed_at: new Date().toISOString() })
              .eq('id', id);
          }
        }
      }

      await supabase.from('activity_logs').insert({
        admin_id: session.user.id,
        action: action === 'approve' ? 'MASS_APPROVE' : 'MASS_REJECT',
        details: { count: ids.length }
      });

      return { success: true, message: `تمت معالجة ${ids.length} طلب بنجاح` };
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const filteredWithdrawals = withdrawals?.filter(w => {
    const searchStr = `${w.profiles?.username} ${w.profiles?.email} ${w.wallet_address} ${w.id}`.toLowerCase();
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
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'rejected': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد المراجعة';
      case 'completed': return 'تم السحب';
      case 'rejected': return 'مرفوض';
      default: return status;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-gold tracking-tight mb-1">إدارة طلبات السحب</h1>
          <p className="text-muted-foreground text-sm">عرض ومعالجة طلبات سحب الأرباح للمستخدمين</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            className="rounded-xl border-border/50 hover:bg-secondary"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            تحديث البيانات
          </Button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الطلبات', value: withdrawals?.length || 0, color: 'text-white' },
          { label: 'قيد المراجعة', value: withdrawals?.filter(w => w.status === 'pending').length || 0, color: 'text-amber-500' },
          { label: 'تم قبولها', value: withdrawals?.filter(w => w.status === 'completed').length || 0, color: 'text-emerald-500' },
          { label: 'تم رفضها', value: withdrawals?.filter(w => w.status === 'rejected').length || 0, color: 'text-rose-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-card p-4 rounded-2xl border border-border text-center">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border">
        <div className="flex flex-1 w-full gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="بحث باسم المستخدم، البريد، أو المحفظة..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl bg-secondary/30 border-border/50 focus:ring-gold/20"
            />
          </div>
          <select 
            className="bg-secondary/30 border border-border/50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 h-10"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">قيد المراجعة</option>
            <option value="completed">تم السحب</option>
            <option value="rejected">مرفوض</option>
          </select>
        </div>

        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-2 w-full lg:w-auto"
            >
              <span className="text-sm font-bold text-gold ml-2 whitespace-nowrap">{selectedIds.length} طلب محدد</span>
              <Button 
                size="sm" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex-1 lg:flex-none"
                onClick={() => massActionMutation.mutate({ ids: selectedIds, action: 'approve' })}
                disabled={massActionMutation.isPending}
              >
                قبول الكل
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                className="rounded-xl flex-1 lg:flex-none"
                onClick={() => massActionMutation.mutate({ ids: selectedIds, action: 'reject' })}
                disabled={massActionMutation.isPending}
              >
                رفض الكل
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-secondary/30 border-b border-border">
                <th className="p-4 w-10 text-center">
                  <button onClick={handleSelectAll} className="hover:text-gold transition-colors">
                    {selectedIds.length === pendingWithdrawals.length && pendingWithdrawals.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-gold" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
                <th className="p-4 text-sm font-bold text-muted-foreground">المستخدم</th>
                <th className="p-4 text-sm font-bold text-muted-foreground">المبلغ</th>
                <th className="p-4 text-sm font-bold text-muted-foreground">العملة والشبكة</th>
                <th className="p-4 text-sm font-bold text-muted-foreground">عنوان المحفظة</th>
                <th className="p-4 text-sm font-bold text-muted-foreground">التاريخ</th>
                <th className="p-4 text-sm font-bold text-muted-foreground">الحالة</th>
                <th className="p-4 text-sm font-bold text-muted-foreground text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={8} className="p-8 bg-secondary/10"></td>
                  </tr>
                ))
              ) : filteredWithdrawals?.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-muted-foreground font-medium">
                    لا توجد طلبات سحب حالياً
                  </td>
                </tr>
              ) : (
                filteredWithdrawals?.map((w) => (
                  <tr key={w.id} className="hover:bg-secondary/20 transition-colors group">
                    <td className="p-4 text-center">
                      {w.status === 'pending' && (
                        <Checkbox 
                          checked={selectedIds.includes(w.id)} 
                          onCheckedChange={() => handleSelect(w.id)}
                          className="border-border data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                        />
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{w.profiles?.username || 'مستخدم'}</span>
                          <span className="text-[10px] text-muted-foreground">{w.profiles?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-black text-gold text-lg">
                      ${w.amount_usd.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="bg-secondary px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter">
                          {w.currency}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase">
                          {w.network || 'TRC20'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 group/wallet">
                        <WalletIcon className="w-3 h-3 text-muted-foreground" />
                        <code 
                          className="text-[11px] font-mono bg-secondary/50 px-2 py-1 rounded cursor-pointer hover:bg-gold/10 hover:text-gold transition-colors"
                          onClick={() => {
                            navigator.clipboard.writeText(w.wallet_address);
                            toast.success('تم نسخ العنوان');
                          }}
                        >
                          {w.wallet_address.substring(0, 8)}...{w.wallet_address.substring(w.wallet_address.length - 8)}
                        </code>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover/wallet:opacity-100 transition-opacity cursor-pointer text-muted-foreground" />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(w.created_at).toLocaleDateString('ar-EG', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyles(w.status)}`}>
                        {getStatusLabel(w.status)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {w.status === 'pending' ? (
                          <>
                            <Button 
                              size="sm" 
                              className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3"
                              onClick={() => processWithdrawalMutation.mutate({ id: w.id, action: 'approve' })}
                              disabled={processWithdrawalMutation.isPending}
                            >
                              <CheckCircle2 className="w-4 h-4 ml-1" />
                              قبول
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              className="h-8 rounded-lg px-3"
                              onClick={() => processWithdrawalMutation.mutate({ id: w.id, action: 'reject' })}
                              disabled={processWithdrawalMutation.isPending}
                            >
                              <XCircle className="w-4 h-4 ml-1" />
                              رفض
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">لا توجد إجراءات</span>
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
