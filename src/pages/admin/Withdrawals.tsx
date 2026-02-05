import React, { useState } from 'react';
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
  Filter,
  CheckSquare,
  Square
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

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
  const [filterType, setFilterType] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
    mutationFn: async ({ id, action }: { id: string; action: 'approve' | 'reject' | 'retry' }) => {
      const { data, error } = await supabase.functions.invoke('nowpayments-withdrawal', {
        body: { withdrawalId: id, action }
      });

      if (error) throw error;
      if (data && data.success === false) {
        throw new Error(data.error || 'حدث خطأ أثناء معالجة العملية');
      }
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'تمت العملية بنجاح');
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
    },
    onError: (error: Error) => {
      console.error('Process error:', error);
      toast.error(error.message || 'حدث خطأ أثناء معالجة الطلب');
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
    }
  });

  const massPayoutMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { data, error } = await supabase.functions.invoke('nowpayments-withdrawal', {
        body: { action: 'mass_payout', withdrawalIds: ids }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'تمت معالجة الطلبات');
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
    },
    onError: (error: Error) => {
      console.error('Mass payout error:', error);
      toast.error(error.message || 'حدث خطأ أثناء المعالجة الجماعية');
    }
  });

  const filteredWithdrawals = withdrawals?.filter(w => {
    const username = w.profiles?.username || '';
    const email = w.profiles?.email || '';
    const wallet = w.wallet_address || '';
    
    const matchesSearch = username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          wallet.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || w.status === filterStatus;
    const matchesType = filterType === 'all' || w.payout_type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingWithdrawals = filteredWithdrawals?.filter(w => w.status === 'pending') || [];

  const handleSelectAll = () => {
    if (selectedIds.length === pendingWithdrawals.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingWithdrawals.map(w => w.id));
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : [...prev, id]
    );
  };

  const handleMassPayout = () => {
    if (selectedIds.length === 0) {
      toast.error('يرجى تحديد طلبات السحب أولاً');
      return;
    }
    massPayoutMutation.mutate(selectedIds);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'completed': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'rejected': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'error': return 'text-rose-600 bg-rose-600/10 border-rose-600/20';
      default: return 'text-muted-foreground bg-muted/10 border-muted/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'معلق';
      case 'completed': return 'مكتمل';
      case 'rejected': return 'مرفوض';
      case 'error': return 'خطأ';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    return type === 'auto' ? 'تلقائي' : 'يدوي';
  };

  // Stats
  const stats = {
    total: withdrawals?.length || 0,
    pending: withdrawals?.filter(w => w.status === 'pending').length || 0,
    completed: withdrawals?.filter(w => w.status === 'completed').length || 0,
    rejected: withdrawals?.filter(w => w.status === 'rejected').length || 0,
    error: withdrawals?.filter(w => w.status === 'error').length || 0,
    auto: withdrawals?.filter(w => w.payout_type === 'auto').length || 0,
    manual: withdrawals?.filter(w => w.payout_type === 'manual').length || 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gradient-gold mb-2">طلبات السحب</h2>
          <p className="text-muted-foreground">إدارة ومعالجة طلبات السحب - تلقائي (≤$10) ويدوي (&gt;$10)</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          تحديث
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="glass-card p-3 rounded-xl border border-border/50 text-center">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">الإجمالي</p>
        </div>
        <div className="glass-card p-3 rounded-xl border border-amber-500/30 text-center">
          <p className="text-2xl font-bold text-amber-500">{stats.pending}</p>
          <p className="text-xs text-muted-foreground">معلق</p>
        </div>
        <div className="glass-card p-3 rounded-xl border border-emerald-500/30 text-center">
          <p className="text-2xl font-bold text-emerald-500">{stats.completed}</p>
          <p className="text-xs text-muted-foreground">مكتمل</p>
        </div>
        <div className="glass-card p-3 rounded-xl border border-rose-500/30 text-center">
          <p className="text-2xl font-bold text-rose-500">{stats.rejected}</p>
          <p className="text-xs text-muted-foreground">مرفوض</p>
        </div>
        <div className="glass-card p-3 rounded-xl border border-rose-600/30 text-center">
          <p className="text-2xl font-bold text-rose-600">{stats.error}</p>
          <p className="text-xs text-muted-foreground">خطأ</p>
        </div>
        <div className="glass-card p-3 rounded-xl border border-blue-500/30 text-center">
          <p className="text-2xl font-bold text-blue-500">{stats.auto}</p>
          <p className="text-xs text-muted-foreground">تلقائي</p>
        </div>
        <div className="glass-card p-3 rounded-xl border border-purple-500/30 text-center">
          <p className="text-2xl font-bold text-purple-500">{stats.manual}</p>
          <p className="text-xs text-muted-foreground">يدوي</p>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="بحث عن مستخدم أو محفظة..." 
            className="pl-10 glass-card border-border/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          className="glass-card border border-border/50 rounded-md px-3 py-2 text-sm bg-background"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">كل الحالات</option>
          <option value="pending">معلق</option>
          <option value="completed">مكتمل</option>
          <option value="rejected">مرفوض</option>
          <option value="error">خطأ</option>
        </select>

        <select 
          className="glass-card border border-border/50 rounded-md px-3 py-2 text-sm bg-background"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">كل الأنواع</option>
          <option value="auto">تلقائي</option>
          <option value="manual">يدوي</option>
        </select>

        {selectedIds.length > 0 && (
          <Button 
            onClick={handleMassPayout}
            disabled={massPayoutMutation.isPending}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            {massPayoutMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            إرسال {selectedIds.length} دفعة
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-border/50 bg-white/5">
                <th className="px-4 py-4 text-sm font-semibold">
                  <button 
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    {selectedIds.length === pendingWithdrawals.length && pendingWithdrawals.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-primary" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-4 text-sm font-semibold">المستخدم</th>
                <th className="px-4 py-4 text-sm font-semibold">المبلغ</th>
                <th className="px-4 py-4 text-sm font-semibold">العملة / الشبكة</th>
                <th className="px-4 py-4 text-sm font-semibold">المحفظة</th>
                <th className="px-4 py-4 text-sm font-semibold">النوع</th>
                <th className="px-4 py-4 text-sm font-semibold">الحالة</th>
                <th className="px-4 py-4 text-sm font-semibold">التاريخ</th>
                <th className="px-4 py-4 text-sm font-semibold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={9} className="px-6 py-4 h-16 bg-white/5" />
                  </tr>
                ))
              ) : filteredWithdrawals?.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                    لا توجد طلبات سحب مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filteredWithdrawals?.map((w) => (
                  <motion.tr 
                    key={w.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-4">
                      {w.status === 'pending' && (
                        <Checkbox
                          checked={selectedIds.includes(w.id)}
                          onCheckedChange={() => handleSelect(w.id)}
                        />
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{w.profiles?.username || 'غير معروف'}</span>
                        <span className="text-xs text-muted-foreground">{w.profiles?.email || ''}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-primary">${w.amount_usd}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/20 text-primary">
                          {w.currency}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase">{w.network || 'TRC20'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <button 
                        className="flex items-center gap-1 group cursor-pointer hover:text-primary transition-colors" 
                        onClick={() => {
                          navigator.clipboard.writeText(w.wallet_address);
                          toast.info('تم نسخ العنوان');
                        }}
                      >
                        <span className="text-xs font-mono text-muted-foreground max-w-[100px] truncate group-hover:text-primary">
                          {w.wallet_address}
                        </span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] px-2 py-1 rounded-full border ${
                        w.payout_type === 'auto' 
                          ? 'text-blue-500 bg-blue-500/10 border-blue-500/20' 
                          : 'text-purple-500 bg-purple-500/10 border-purple-500/20'
                      }`}>
                        {getTypeLabel(w.payout_type)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[10px] px-2 py-1 rounded-full border w-fit ${getStatusColor(w.status)}`}>
                          {getStatusLabel(w.status)}
                        </span>
                        {w.status === 'error' && w.withdrawal_id && (
                          <div className="flex items-center gap-1 text-[9px] text-rose-400 max-w-[120px]">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span className="truncate" title={w.withdrawal_id}>
                              {w.withdrawal_id.replace('ERROR: ', '').replace('AUTO_FAILED: ', '').replace('AUTO_ERROR: ', '')}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-muted-foreground">
                      {new Date(w.created_at).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1">
                        {w.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-7 w-7 p-0 border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10"
                              onClick={() => processWithdrawalMutation.mutate({ id: w.id, action: 'approve' })}
                              disabled={processWithdrawalMutation.isPending}
                              title="موافقة وإرسال"
                            >
                              {processWithdrawalMutation.isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3" />
                              )}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-7 w-7 p-0 border-rose-500/50 text-rose-500 hover:bg-rose-500/10"
                              onClick={() => processWithdrawalMutation.mutate({ id: w.id, action: 'reject' })}
                              disabled={processWithdrawalMutation.isPending}
                              title="رفض واسترداد"
                            >
                              {processWithdrawalMutation.isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                            </Button>
                          </>
                        )}
                        {w.status === 'error' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 w-7 p-0 border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
                            onClick={() => processWithdrawalMutation.mutate({ id: w.id, action: 'retry' })}
                            disabled={processWithdrawalMutation.isPending}
                            title="إعادة المحاولة"
                          >
                            {processWithdrawalMutation.isPending ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <RefreshCw className="w-3 h-3" />
                            )}
                          </Button>
                        )}
                        {w.tx_hash && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                            onClick={() => window.open(`https://tronscan.org/#/transaction/${w.tx_hash}`, '_blank')}
                            title="عرض المعاملة"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
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
