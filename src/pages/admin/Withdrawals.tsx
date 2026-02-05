import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Search,
  MoreVertical,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const Withdrawals = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ['admin-withdrawals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crypto_withdrawals')
        .select('*, profiles(username, email)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const processWithdrawalMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string, action: 'approve' | 'reject' }) => {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('nowpayments-withdrawal', {
        body: { withdrawalId: id, action },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;
      if (data && data.success === false) {
        throw new Error(data.error || 'حدث خطأ أثناء معالجة العملية');
      }
      return data;
    },
    onSuccess: (data) => {
      toast.success('تمت العملية بنجاح');
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
    },
    onError: (error: any) => {
      console.error('Process error:', error);
      toast.error(error.message || 'حدث خطأ أثناء معالجة الطلب');
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
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
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'completed': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'rejected': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'error': return 'text-rose-600 bg-rose-600/10 border-rose-600/20';
      default: return 'text-muted-foreground bg-muted/10 border-muted/20';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gradient-gold mb-2">طلبات السحب</h2>
          <p className="text-muted-foreground">إدارة ومعالجة طلبات سحب الأموال عبر Edge Function</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="بحث عن مستخدم أو محفظة..." 
              className="pl-10 w-full md:w-[300px] glass-card border-border/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="glass-card border-border/50 rounded-md px-3 py-2 text-sm bg-background"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">الكل</option>
            <option value="pending">معلق</option>
            <option value="completed">مكتمل</option>
            <option value="rejected">مرفوض</option>
            <option value="error">خطأ</option>
          </select>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-border/50 bg-white/5">
                <th className="px-6 py-4 text-sm font-semibold">المستخدم</th>
                <th className="px-6 py-4 text-sm font-semibold">المبلغ</th>
                <th className="px-6 py-4 text-sm font-semibold">العملة / الشبكة</th>
                <th className="px-6 py-4 text-sm font-semibold">عنوان المحفظة</th>
                <th className="px-6 py-4 text-sm font-semibold">الحالة</th>
                <th className="px-6 py-4 text-sm font-semibold">التاريخ</th>
                <th className="px-6 py-4 text-sm font-semibold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-4 h-16 bg-white/5" />
                  </tr>
                ))
              ) : filteredWithdrawals?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
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
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{w.profiles?.username}</span>
                        <span className="text-xs text-muted-foreground">{w.profiles?.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-primary">${w.amount_usd}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/20 text-primary">
                          {w.currency}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase">{w.network || 'TRC20'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 group cursor-pointer" onClick={() => {
                        navigator.clipboard.writeText(w.wallet_address);
                        toast.info('تم نسخ العنوان');
                      }}>
                        <span className="text-xs font-mono text-muted-foreground max-w-[120px] truncate">
                          {w.wallet_address}
                        </span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[10px] px-2 py-1 rounded-full border w-fit ${getStatusColor(w.status)}`}>
                          {w.status === 'pending' ? 'معلق' : w.status === 'completed' ? 'مكتمل' : w.status === 'rejected' ? 'مرفوض' : w.status === 'error' ? 'خطأ' : w.status}
                        </span>
                        {w.status === 'error' && w.withdrawal_id?.startsWith('ERROR:') && (
                          <div className="flex items-center gap-1 text-[9px] text-rose-400 max-w-[150px]">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span className="truncate" title={w.withdrawal_id.replace('ERROR: ', '')}>
                              {w.withdrawal_id.replace('ERROR: ', '')}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(w.created_at).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {w.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 w-8 p-0 border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10"
                              onClick={() => processWithdrawalMutation.mutate({ id: w.id, action: 'approve' })}
                              disabled={processWithdrawalMutation.isPending}
                              title="موافقة وإرسال الدفع"
                            >
                              {processWithdrawalMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 w-8 p-0 border-rose-500/50 text-rose-500 hover:bg-rose-500/10"
                              onClick={() => processWithdrawalMutation.mutate({ id: w.id, action: 'reject' })}
                              disabled={processWithdrawalMutation.isPending}
                              title="رفض واسترداد الرصيد"
                            >
                              {processWithdrawalMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
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
