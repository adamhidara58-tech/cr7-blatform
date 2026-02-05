import React, { useState, useEffect } from 'react';
import { 
  Key, 
  ShieldCheck, 
  Bell, 
  Save,
  ArrowDownCircle,
  Loader2
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
  const [apiKey, setApiKey] = useState('');
  const [minWithdrawal, setMinWithdrawal] = useState('10');
  const [maxWithdrawal, setMaxWithdrawal] = useState('1000');
  const [autoWithdrawal, setAutoWithdrawal] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*');
      
      if (error) throw error;

      if (data) {
        const limits = data.find(s => s.key === 'withdrawal_limits')?.value as any;
        const api = data.find(s => s.key === 'nowpayments_api_key')?.value as any;
        const security = data.find(s => s.key === 'security_settings')?.value as any;

        if (limits) {
          setMinWithdrawal(limits.min || '10');
          setMaxWithdrawal(limits.max || '1000');
        }
        if (api) {
          setApiKey(api.value || '');
        }
        if (security) {
          setAutoWithdrawal(security.auto_withdrawal || false);
        }
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast.error('فشل تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLimits = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          key: 'withdrawal_limits',
          value: { min: minWithdrawal, max: maxWithdrawal },
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

      if (error) throw error;
      toast.success('تم حفظ حدود السحب بنجاح');
    } catch (error: any) {
      toast.error('فشل حفظ حدود السحب');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveApiKey = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          key: 'nowpayments_api_key',
          value: { value: apiKey },
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

      if (error) throw error;
      toast.success('تم حفظ مفتاح API بنجاح');
    } catch (error: any) {
      toast.error('فشل حفظ مفتاح API');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAutoWithdrawal = async (checked: boolean) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          key: 'security_settings',
          value: { auto_withdrawal: checked },
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

      if (error) throw error;
      setAutoWithdrawal(checked);
      toast.success(`تم ${checked ? 'تفعيل' : 'تعطيل'} السحب التلقائي`);
    } catch (error: any) {
      toast.error('فشل تحديث إعدادات السحب التلقائي');
    } finally {
      setSaving(false);
    }
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
        <p className="text-muted-foreground">إدارة مفاتيح API وإعدادات الأمان والنظام</p>
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

        {/* API Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-2xl border border-border/50 space-y-6"
        >
          <div className="flex items-center gap-3 border-b border-border/50 pb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="font-bold">إعدادات NOWPayments</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">API Key</label>
              <div className="flex gap-2">
                <Input 
                  type="password" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="glass-card"
                />
                <Button onClick={handleSaveApiKey} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">يستخدم هذا المفتاح لمعالجة عمليات السحب التلقائية</p>
            </div>
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
