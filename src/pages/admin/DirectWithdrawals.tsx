import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  User, 
  Wallet, 
  DollarSign, 
  Calendar,
  ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const DirectWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAllWithdrawals = async () => {
    setLoading(true);
    try {
      // 1. جلب جميع السحوبات أولاً بشكل مستقل
      const { data: withdrawalsData, error: wError } = await supabase
        .from('crypto_withdrawals')
        .select('*')
        .order('created_at', { ascending: false });

      if (wError) throw wError;

      if (withdrawalsData && withdrawalsData.length > 0) {
        // 2. جلب البروفايلات المرتبطة بها في استعلام منفصل لتجنب مشاكل الـ Join مع RLS
        const userIds = [...new Set(withdrawalsData.map(w => w.user_id))];
        const { data: profilesData, error: pError } = await supabase
          .from('profiles')
          .select('id, username, email')
          .in('id', userIds);

        // 3. دمج البيانات يدوياً
        const combinedData = withdrawalsData.map(w => ({
          ...w,
          profiles: profilesData?.find(p => p.id === w.user_id) || null
        }));

        setWithdrawals(combinedData);
      } else {
        setWithdrawals([]);
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error('خطأ في جلب البيانات: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllWithdrawals();
  }, []);

  const handleStatusUpdate = async (id: string, userId: string, amount: number, newStatus: 'completed' | 'rejected') => {
    setActionLoading(id);
    try {
      // 1. تحديث حالة السحب
      const { error: updateError } = await supabase
        .from('crypto_withdrawals')
        .update({ 
          status: newStatus,
          processed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // 2. إذا تم الرفض، إعادة المبلغ للمستخدم
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

      toast.success(newStatus === 'completed' ? 'تم قبول السحب بنجاح' : 'تم رفض السحب وإعادة المبلغ');
      fetchAllWithdrawals();
    } catch (error: any) {
      toast.error('فشل التحديث: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/50 p-6 rounded-3xl border border-gold/20 backdrop-blur-xl">
          <div>
            <h1 className="text-3xl font-black text-gradient-gold flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-gold" />
              الإدارة المباشرة للسحوبات
            </h1>
            <p className="text-muted-foreground mt-1">هذه الصفحة تعرض جميع الطلبات من قاعدة البيانات مباشرة</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={fetchAllWithdrawals} 
              disabled={loading}
              className="bg-gold text-black hover:bg-gold/80 rounded-xl px-6 font-bold"
            >
              <RefreshCw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
              تحديث البيانات
            </Button>
          </div>
        </div>

        {/* Manual Fix Instructions */}
        <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl">
          <h2 className="text-amber-500 font-bold flex items-center gap-2 mb-2">
            <ShieldAlert className="w-5 h-5" />
            حل مشكلة عدم ظهور البيانات (هام جداً)
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            إذا كانت الطلبات لا تظهر هنا رغم وجودها في قاعدة البيانات، فهذا بسبب قيود الأمان (RLS) في Supabase. لحلها نهائياً، يرجى اتباع هذه الخطوات البسيطة:
          </p>
          <ol className="text-xs space-y-2 text-muted-foreground list-decimal list-inside">
            <li>افتح لوحة تحكم <span className="text-white font-bold">Supabase</span> الخاصة بمشروعك.</li>
            <li>انتقل إلى قسم <span className="text-white font-bold">Authentication</span> ثم <span className="text-white font-bold">Policies</span>.</li>
            <li>ابحث عن جدول <span className="text-white font-bold">crypto_withdrawals</span>.</li>
            <li>قم بتعطيل <span className="text-amber-500 font-bold">RLS</span> لهذا الجدول مؤقتاً، أو أضف سياسة جديدة (Policy) تسمح بـ <span className="text-white font-bold">SELECT</span> للجميع.</li>
          </ol>
        </div>

        <div className="grid gap-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <RefreshCw className="w-12 h-12 animate-spin text-gold" />
              <p className="text-gold font-bold">جاري جلب البيانات من السيرفر...</p>
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-20 bg-card/30 rounded-3xl border border-dashed border-white/10">
              <p className="text-muted-foreground">لا توجد أي طلبات سحب مسجلة حالياً</p>
            </div>
          ) : (
            withdrawals.map((w) => (
              <motion.div 
                key={w.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card/40 p-6 rounded-2xl border border-white/5 hover:border-gold/30 transition-all"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-gold/10 text-gold">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">المستخدم</p>
                        <p className="font-bold text-sm">{w.profiles?.username || 'مستخدم جديد'}</p>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">{w.profiles?.email || 'بدون بريد'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                        <DollarSign className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">المبلغ المطلوب</p>
                        <p className="font-black text-emerald-500 text-lg">${w.amount_usd}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{w.currency} ({w.network || 'TRC20'})</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                        <Wallet className="w-6 h-6" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs text-muted-foreground">عنوان المحفظة</p>
                        <p className="font-mono text-[10px] truncate text-blue-400" title={w.wallet_address}>{w.wallet_address}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">تاريخ الطلب</p>
                        <p className="text-xs font-medium">{new Date(w.created_at).toLocaleString('en-US')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 border-t lg:border-t-0 lg:border-r border-white/10 pt-4 lg:pt-0 lg:pr-6">
                    {w.status === 'pending' ? (
                      <div className="flex gap-2 w-full lg:w-auto">
                        <Button 
                          onClick={() => handleStatusUpdate(w.id, w.user_id, w.amount_usd, 'completed')}
                          disabled={actionLoading === w.id}
                          className="flex-1 lg:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl gap-2"
                        >
                          {actionLoading === w.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                          قبول
                        </Button>
                        <Button 
                          onClick={() => handleStatusUpdate(w.id, w.user_id, w.amount_usd, 'rejected')}
                          disabled={actionLoading === w.id}
                          variant="destructive"
                          className="flex-1 lg:flex-none font-bold rounded-xl gap-2"
                        >
                          {actionLoading === w.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                          رفض
                        </Button>
                      </div>
                    ) : (
                      <div className={`w-full lg:w-auto text-center px-6 py-2 rounded-xl text-xs font-black border ${
                        w.status === 'completed' 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                      }`}>
                        {w.status === 'completed' ? 'تم السحب بنجاح' : 'تم الرفض'}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectWithdrawals;
