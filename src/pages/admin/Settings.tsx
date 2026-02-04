import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Settings as SettingsIcon, 
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

const Settings = () => {
  const queryClient = useQueryClient();
  const [apiKey, setApiKey] = useState('');
  const [minWithdrawal, setMinWithdrawal] = useState('');
  const [maxWithdrawal, setMaxWithdrawal] = useState('');

  const { data: settings, isLoading, error: queryError } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('admin_settings').select('*');
        if (error) {
          console.warn('Table admin_settings might not exist yet:', error);
          return {};
        }
        
        const settingsObj: any = {};
        data.forEach(s => {
          settingsObj[s.key] = s.value;
        });
        return settingsObj;
      } catch (e) {
        console.error('Error fetching settings:', e);
        return {};
      }
    }
  });

  useEffect(() => {
    if (settings) {
      setApiKey(settings.nowpayments_api_key?.value || '');
      setMinWithdrawal(settings.withdrawal_limits?.min || '10');
      setMaxWithdrawal(settings.withdrawal_limits?.max || '1000');
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string, value: any }) => {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('تم حفظ الإعدادات بنجاح');
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    },
    onError: (error: any) => {
      toast.error('حدث خطأ أثناء الحفظ: ' + error.message);
    }
  });

  if (isLoading) return <div className="animate-pulse space-y-8"><div className="h-64 bg-white/5 rounded-2xl" /></div>;

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
            <Button 
              className="w-full"
              onClick={() => updateSettingsMutation.mutate({ 
                key: 'withdrawal_limits', 
                value: { min: minWithdrawal, max: maxWithdrawal } 
              })}
              disabled={updateSettingsMutation.isPending}
            >
              {updateSettingsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
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
                  placeholder="أدخل مفتاح الـ API..." 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="glass-card"
                />
                <Button 
                  onClick={() => updateSettingsMutation.mutate({ key: 'nowpayments_api_key', value: { value: apiKey } })}
                  disabled={updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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
                <span className="text-sm font-medium">تفعيل IP Whitelist</span>
                <p className="text-[10px] text-muted-foreground">السماح بالدخول من عناوين IP محددة فقط</p>
              </div>
              <Switch 
                checked={settings?.security_settings?.ip_whitelist_enabled}
                onCheckedChange={(val) => updateSettingsMutation.mutate({ 
                  key: 'security_settings', 
                  value: { ...settings.security_settings, ip_whitelist_enabled: val } 
                })}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-border/30">
              <div className="space-y-0.5">
                <span className="text-sm font-medium">تفعيل 2FA للمدراء</span>
                <p className="text-[10px] text-muted-foreground">فرض المصادقة الثنائية لجميع حسابات الإدارة</p>
              </div>
              <Switch 
                checked={settings?.security_settings?.two_factor_enabled}
                onCheckedChange={(val) => updateSettingsMutation.mutate({ 
                  key: 'security_settings', 
                  value: { ...settings.security_settings, two_factor_enabled: val } 
                })}
              />
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
              <Switch 
                checked={settings?.system_notifications?.email_notifications}
                onCheckedChange={(val) => updateSettingsMutation.mutate({ 
                  key: 'system_notifications', 
                  value: { ...settings.system_notifications, email_notifications: val } 
                })}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
