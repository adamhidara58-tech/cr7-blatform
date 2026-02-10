import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle2, 
  XCircle, 
  Search,
  Loader2,
  RefreshCw,
  User,
  Wallet,
  DollarSign,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface Withdrawal {
  id: string;
  user_id: string;
  amount_usd: number;
  currency: string;
  network: string | null;
  wallet_address: string;
  status: string;
  created_at: string;
  profiles: {
    username: string;
    email: string;
  } | null;
}

const SimpleWithdrawals = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: withdrawals, isLoading, refetch } = useQuery({
    queryKey: ['simple-withdrawals'],
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
    mutationFn: async ({ id, status }: { id: string; status: 'completed' | 'rejected' }) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) throw new Error('جلسة العمل منتهية');

      // 1. تحديث حالة السحب
      const { error: withdrawalError } = await supabase
        .from('crypto_withdrawals')
        .update({ 
          status: status,
          processed_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (withdrawalError) throw withdrawalError;

      // 2. إذا تم الرفض، يجب إعادة المبلغ لرصيد المستخدم
      if (status === 'rejected') {
        const { data: withdrawal } = await supabase
          .from('crypto_withdrawals')
          .select('user_id, amount_usd')
          .eq('id', id)
          .single();

        if (withdrawal) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('balance')
            .eq('id', withdrawal.user_id)
            .single();

          if (profile) {
            await supabase
              .from('profiles')
              .update({ balance: Number(profile.balance) + Number(withdrawal.amount_usd) })
              .eq('id', withdrawal.user_id);
          }
        }
      }

      // 3. تسجيل النشاط
      await supabase.from('activity_logs').insert({
        admin_id: session.user.id,
        action: status === 'completed' ? 'WITHDRAWAL_APPROVED' : 'WITHDRAWAL_REJECTED',
        target_id: id,
        details: { status }
      });

      return { success: true };
    },
    onSuccess: () => {
      toast.success('تم تحديث حالة الطلب بنجاح');
      queryClient.invalidateQueries({ queryKey: ['simple-withdrawals'] });
    },
    onError: (error: any) => {
      toast.error('خطأ: ' + error.message);
    }
  });

  const filteredWithdrawals = withdrawals?.filter(w => 
    w.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.wallet_address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen text-foreground">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">إدارة طلبات السحب</h1>
          <p className="text-muted-foreground">عرض ومعالجة طلبات سحب المستخدمين</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="gap-2">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          تحديث البيانات
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input 
          placeholder="بحث باسم المستخدم، البريد، أو المحفظة..." 
          className="pl-10 h-12 glass-card border-primary/20 focus:border-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : filteredWithdrawals?.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-2xl border border-dashed border-primary/20">
            <p className="text-muted-foreground">لا توجد طلبات سحب حالياً</p>
          </div>
        ) : (
          filteredWithdrawals?.map((w) => (
            <motion.div 
              key={w.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-5 rounded-2xl border border-primary/10 hover:border-primary/30 transition-all"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">المستخدم</p>
                      <p className="font-bold">{w.profiles?.username || 'مستخدم غير معروف'}</p>
                      <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">{w.profiles?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">المبلغ</p>
                      <p className="font-bold text-emerald-500">${w.amount_usd}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{w.currency} ({w.network || 'TRC20'})</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs text-muted-foreground">المحفظة</p>
                      <p className="font-mono text-xs truncate" title={w.wallet_address}>{w.wallet_address}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-amber-500/10 text-amber-500">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">التاريخ</p>
                      <p className="text-sm">{new Date(w.created_at).toLocaleString('en-US')}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {w.status === 'pending' ? (
                    <>
                      <Button 
                        onClick={() => {
                          if(window.confirm('هل أنت متأكد من قبول هذا الطلب؟')) {
                            updateStatusMutation.mutate({ id: w.id, status: 'completed' });
                          }
                        }}
                        disabled={updateStatusMutation.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-6"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        قبول
                      </Button>
                      <Button 
                        onClick={() => {
                          if(window.confirm('هل أنت متأكد من رفض هذا الطلب؟')) {
                            updateStatusMutation.mutate({ id: w.id, status: 'rejected' });
                          }
                        }}
                        disabled={updateStatusMutation.isPending}
                        variant="destructive"
                        className="gap-2 px-6"
                      >
                        <XCircle className="w-4 h-4" />
                        رفض
                      </Button>
                    </>
                  ) : (
                    <div className={`px-4 py-2 rounded-full text-sm font-bold border ${
                      w.status === 'completed' 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    }`}>
                      {w.status === 'completed' ? 'تم القبول' : 'تم الرفض'}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default SimpleWithdrawals;
