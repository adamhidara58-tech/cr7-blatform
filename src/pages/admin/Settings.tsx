import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Bell, 
  Save,
  ArrowDownCircle,
  Loader2,
  Zap,
  DollarSign,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface AdminSetting {
  key: string;
  value: number | boolean | string;
}

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  
  // Settings state
  const [minWithdrawal, setMinWithdrawal] = useState('5');
  const [maxWithdrawal, setMaxWithdrawal] = useState('1000');
  const [autoPayoutThreshold, setAutoPayoutThreshold] = useState('10');
  const [withdrawalsEnabled, setWithdrawalsEnabled] = useState(true);
  const [cooldownHours, setCooldownHours] = useState('24');
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_settings')
        .select('key, value');
      
      if (error) throw error;

      if (data) {
        data.forEach((setting: AdminSetting) => {
          switch (setting.key) {
            case 'min_withdrawal':
              setMinWithdrawal(String(setting.value));
              break;
            case 'max_withdrawal':
              setMaxWithdrawal(String(setting.value));
              break;
            case 'auto_payout_threshold':
              setAutoPayoutThreshold(String(setting.value));
              break;
            case 'withdrawals_enabled':
              setWithdrawalsEnabled(setting.value === true || setting.value === 'true');
              break;
            case 'withdrawal_cooldown_hours':
              setCooldownHours(String(setting.value));
              break;
            case 'telegram_bot_token':
              setTelegramBotToken(String(setting.value));
              break;
            case 'telegram_chat_id':
              setTelegramChatId(String(setting.value));
              break;
          }
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('فشل تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (key: string, value: string | number | boolean) => {
    try {
      setSaving(key);
      
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast.error('يرجى تسجيل الدخول مجدداً');
        return;
      }

      const { data, error } = await supabase.functions.invoke('update-admin-settings', {
        body: { key, value },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        toast.success('تم حفظ الإعداد بنجاح');
      } else {
        throw new Error(data?.error || 'خطأ في الحفظ');
      }
    } catch (error: unknown) {
      console.error('Save error:', error);
      const errorMessage = error instanceof Error ? error.message : 'فشل الحفظ';
      toast.error(errorMessage);
    } finally {
      setSaving(null);
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
        <h2 className="text-3xl font-bold text-gradient-gold mb-2">إعدادات النظام</h2>
        <p className="text-muted-foreground">إدارة حدود السحب وإعدادات الدفع</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Minimum Withdrawal */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-2xl border border-border/50"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-bold">الحد الأدنى للسحب</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Input 
                type="number" 
                value={minWithdrawal}
                onChange={(e) => setMinWithdrawal(e.target.value)}
                className="glass-card flex-1"
                min="0"
              />
              <span className="text-muted-foreground">$</span>
            </div>
            <Button 
              className="w-full" 
              onClick={() => saveSetting('min_withdrawal', Number(minWithdrawal))} 
              disabled={saving === 'min_withdrawal'}
            >
              {saving === 'min_withdrawal' ? (
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
              ) : (
                <Save className="w-4 h-4 ml-2" />
              )}
              حفظ
            </Button>
          </div>
        </motion.div>

        {/* Maximum Withdrawal */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-2xl border border-border/50"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold">الحد الأقصى للسحب</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Input 
                type="number" 
                value={maxWithdrawal}
                onChange={(e) => setMaxWithdrawal(e.target.value)}
                className="glass-card flex-1"
                min="0"
              />
              <span className="text-muted-foreground">$</span>
            </div>
            <Button 
              className="w-full" 
              onClick={() => saveSetting('max_withdrawal', Number(maxWithdrawal))} 
              disabled={saving === 'max_withdrawal'}
            >
              {saving === 'max_withdrawal' ? (
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
              ) : (
                <Save className="w-4 h-4 ml-2" />
              )}
              حفظ
            </Button>
          </div>
        </motion.div>

        {/* Auto Payout Threshold */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 rounded-2xl border border-border/50"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold">حد الدفع التلقائي</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Input 
                type="number" 
                value={autoPayoutThreshold}
                onChange={(e) => setAutoPayoutThreshold(e.target.value)}
                className="glass-card flex-1"
                min="0"
              />
              <span className="text-muted-foreground">$</span>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-blue-400">
                💡 السحب ≤ ${autoPayoutThreshold} → تلقائي
                <br />
                💼 السحب &gt; ${autoPayoutThreshold} → يتطلب موافقة
              </p>
            </div>
            <Button 
              className="w-full" 
              onClick={() => saveSetting('auto_payout_threshold', Number(autoPayoutThreshold))} 
              disabled={saving === 'auto_payout_threshold'}
            >
              {saving === 'auto_payout_threshold' ? (
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
              ) : (
                <Save className="w-4 h-4 ml-2" />
              )}
              حفظ
            </Button>
          </div>
        </motion.div>

        {/* Cooldown Hours */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 rounded-2xl border border-border/50"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold">فترة الانتظار بين السحوبات</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Input 
                type="number" 
                value={cooldownHours}
                onChange={(e) => setCooldownHours(e.target.value)}
                className="glass-card flex-1"
                min="0"
              />
              <span className="text-muted-foreground">ساعة</span>
            </div>
            <Button 
              className="w-full" 
              onClick={() => saveSetting('withdrawal_cooldown_hours', Number(cooldownHours))} 
              disabled={saving === 'withdrawal_cooldown_hours'}
            >
              {saving === 'withdrawal_cooldown_hours' ? (
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
              ) : (
                <Save className="w-4 h-4 ml-2" />
              )}
              حفظ
            </Button>
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-6 rounded-2xl border border-border/50"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold">حالة النظام</h3>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-border/50">
              <div>
                <p className="font-medium">عمليات السحب</p>
                <p className="text-xs text-muted-foreground">تفعيل أو تعطيل السحب لجميع المستخدمين</p>
              </div>
              <Switch 
                checked={withdrawalsEnabled} 
                onCheckedChange={(checked) => {
                  setWithdrawalsEnabled(checked);
                  saveSetting('withdrawals_enabled', checked);
                }}
                disabled={saving === 'withdrawals_enabled'}
              />
            </div>
            
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs text-amber-400">
                ⚠️ تنبيه: عند تعطيل السحب، لن يتمكن أي مستخدم من إنشاء طلب سحب جديد، وستظهر لهم رسالة تفيد بأن السحب معطل حالياً.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Telegram Notifications */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 rounded-2xl border border-border/50 lg:col-span-2"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="font-bold">إشعارات تيليجرام</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Telegram Bot Token</label>
                <Input 
                  type="password" 
                  value={telegramBotToken}
                  onChange={(e) => setTelegramBotToken(e.target.value)}
                  placeholder="7853634354:AAH_..."
                  className="glass-card"
                />
              </div>
              <Button 
                className="w-full" 
                onClick={() => saveSetting('telegram_bot_token', telegramBotToken)} 
                disabled={saving === 'telegram_bot_token'}
              >
                {saving === 'telegram_bot_token' ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
                حفظ التوكن
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Telegram Chat ID</label>
                <Input 
                  type="text" 
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  placeholder="123456789"
                  className="glass-card"
                />
              </div>
              <Button 
                className="w-full" 
                onClick={() => saveSetting('telegram_chat_id', telegramChatId)} 
                disabled={saving === 'telegram_chat_id'}
              >
                {saving === 'telegram_chat_id' ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
                حفظ معرف الدردشة
              </Button>
            </div>
          </div>
          
          <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-blue-400">
              💡 للحصول على Chat ID، أرسل رسالة للبوت الخاص بك ثم قم بزيارة: 
              <br />
              <code className="text-xs break-all">https://api.telegram.org/bot[YOUR_TOKEN]/getUpdates</code>
            </p>
          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 rounded-2xl border border-border/50 lg:col-span-2"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold">إعدادات الأمان</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-border/30">
              <div className="space-y-1">
                <span className="text-sm font-medium">تفعيل السحب</span>
                <p className="text-xs text-muted-foreground">السماح للمستخدمين بإنشاء طلبات سحب جديدة</p>
              </div>
              <Switch 
                checked={withdrawalsEnabled} 
                onCheckedChange={(checked) => {
                  setWithdrawalsEnabled(checked);
                  saveSetting('withdrawals_enabled', checked);
                }}
                disabled={saving === 'withdrawals_enabled'}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;