import React, { useState, useEffect } from 'react';
import { 
  Key, 
  ShieldCheck, 
  Bell, 
  Save,
  ArrowDownCircle,
  Loader2,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [minWithdrawal, setMinWithdrawal] = useState('10');
  const [maxWithdrawal, setMaxWithdrawal] = useState('1000');
  const [autoPayoutThreshold, setAutoPayoutThreshold] = useState('10');
  const [autoWithdrawal, setAutoWithdrawal] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      fetchSettings();
    };
    getSession();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*');
      
      if (error) throw error;

      if (data) {
        const limits = data.find(s => s.key === 'withdrawal_limits')?.value as { min?: string; max?: string } | undefined;
        const threshold = data.find(s => s.key === 'auto_payout_threshold')?.value as { amount?: string } | undefined;

        if (limits) {
          setMinWithdrawal(String(limits.min || '10'));
          setMaxWithdrawal(String(limits.max || '1000'));
        }
        if (threshold) {
          setAutoPayoutThreshold(String(threshold.amount || '10'));
        }
        const security = data.find(s => s.key === 'security_settings')?.value as { auto_withdrawal?: boolean } | undefined;
        if (security) {
          setAutoWithdrawal(security.auto_withdrawal || false);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('فشل تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (key: string, value: any) => {
    try {
      setSaving(true);
      
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      if (!currentSession?.access_token) {
        throw new Error('لم يتم العثور على جلسة نشطة. يرجى تسجيل الدخول مجدداً.');
      }

      const { data, error } = await supabase.functions.invoke('update-admin-settings', {
        body: { key, value },
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`
        }
      });

      if (error) throw error;
      if (data?.success) {
        toast.success('تم الحفظ بنجاح');
      } else {
        throw new Error(data?.error || 'خطأ في الحفظ');
      }
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLimits = () => saveSetting('withdrawal_limits', { min: minWithdrawal, max: maxWithdrawal });
  const handleSaveAutoThreshold = () => saveSetting('auto_payout_threshold', { amount: autoPayoutThreshold });
  const handleToggleAutoWithdrawal = (checked: boolean) => {
    setAutoWithdrawal(checked);
    saveSetting('security_settings', { auto_withdrawal: checked });
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gradient-gold mb-2">الإعدادات العامة</h2>
        <p className="text-muted-foreground">إدارة حدود السحب وإعدادات الدفع التلقائي</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Withdrawal Limits */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-2xl border border-border/50 space-y-6"
        >
          <div className="flex items-center gap-3 border-b border-border/50 pb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold">حدود السحب</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">الحد الأدنى ($)</label>
                <Input 
                  type="number" 
                  value={minWithdrawal}
                  onChange={(e) => setMinWithdrawal(e.target.value)}
                  className="glass-card"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">الحد الأقصى ($)</label>
                <Input 
                  type="number" 
                  value={maxWithdrawal}
                  onChange={(e) => setMaxWithdrawal(e.target.value)}
                  className="glass-card"
                />
              </div>
            </div>
            <Button className="w-full" onClick={handleSaveLimits} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              حفظ حدود السحب
            </Button>
          </div>
        </motion.div>

        {/* Auto Payout Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-2xl border border-border/50 space-y-6"
        >
          <div className="flex items-center gap-3 border-b border-border/50 pb-4">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold">الدفع التلقائي</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">حد الدفع التلقائي ($)</label>
              <Input 
                type="number" 
                value={autoPayoutThreshold}
                onChange={(e) => setAutoPayoutThreshold(e.target.value)}
                className="glass-card"
              />
              <p className="text-[10px] text-muted-foreground">
                طلبات السحب التي تساوي أو أقل من هذا المبلغ ستتم معالجتها تلقائياً
              </p>
            </div>
            
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-blue-400">
                💡 السحب ≤ ${autoPayoutThreshold} → تلقائي
                <br />
                💼 السحب &gt; ${autoPayoutThreshold} → يتطلب موافقة يدوية
              </p>
            </div>

            <Button className="w-full" onClick={handleSaveAutoThreshold} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              حفظ إعدادات الدفع التلقائي
            </Button>
          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 rounded-2xl border border-border/50 space-y-6"
        >
          <div className="flex items-center gap-3 border-b border-border/50 pb-4">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold">إعدادات الأمان</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-border/30">
              <div className="space-y-0.5">
                <span className="text-sm font-medium">تفعيل السحب التلقائي</span>
                <p className="text-[10px] text-muted-foreground">تنفيذ عمليات السحب فور طلبها دون مراجعة يدوية</p>
              </div>
              <Switch 
                checked={autoWithdrawal} 
                onCheckedChange={handleToggleAutoWithdrawal}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-border/30">
              <div className="space-y-0.5">
                <span className="text-sm font-medium">تفعيل IP Whitelist</span>
                <p className="text-[10px] text-muted-foreground">السماح بالدخول من عناوين IP محددة فقط</p>
              </div>
              <Switch checked={false} disabled />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-border/30">
              <div className="space-y-0.5">
                <span className="text-sm font-medium">تفعيل 2FA للمدراء</span>
                <p className="text-[10px] text-muted-foreground">فرض المصادقة الثنائية لجميع حسابات الإدارة</p>
              </div>
              <Switch checked={false} disabled />
            </div>
          </div>
        </motion.div>

        {/* System Notifications */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 rounded-2xl border border-border/50 space-y-6"
        >
          <div className="flex items-center gap-3 border-b border-border/50 pb-4">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="font-bold">إشعارات النظام</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-border/30">
              <div className="space-y-0.5">
                <span className="text-sm font-medium">إشعارات البريد</span>
                <p className="text-[10px] text-muted-foreground">إرسال بريد عند وصول طلب سحب جديد</p>
              </div>
              <Switch checked={true} disabled />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
