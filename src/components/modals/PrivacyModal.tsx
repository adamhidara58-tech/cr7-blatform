import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, EyeOff, Users, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

interface PrivacyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PrivacyModal = ({ open, onOpenChange }: PrivacyModalProps) => {
  const [settings, setSettings] = useState({
    hideBalance: false,
    hideProfile: false,
    hideActivity: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const privacyItems = [
    {
      id: 'hideBalance',
      icon: settings.hideBalance ? EyeOff : Eye,
      title: 'إخفاء الرصيد',
      description: 'إخفاء رصيدك من الآخرين',
      enabled: settings.hideBalance,
    },
    {
      id: 'hideProfile',
      icon: Users,
      title: 'الملف الشخصي خاص',
      description: 'جعل ملفك الشخصي خاص',
      enabled: settings.hideProfile,
    },
    {
      id: 'hideActivity',
      icon: Activity,
      title: 'إخفاء النشاط',
      description: 'إخفاء نشاطك من المستخدمين',
      enabled: settings.hideActivity,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-transparent shadow-none">
        <div className="bg-[#0A0A0C] border border-white/10 rounded-[32px] w-full flex flex-col overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)]">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-center text-xl font-bold text-gradient-gold flex items-center justify-center gap-2">
              <Eye className="w-5 h-5 text-gold" />
              إعدادات الخصوصية
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-6 pt-2 space-y-4">
            {privacyItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-gold" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm mb-0.5">{item.title}</h4>
                        <p className="text-[10px] text-white/40 font-medium">{item.description}</p>
                      </div>
                    </div>

                    <Switch 
                      checked={item.enabled}
                      onCheckedChange={() => toggleSetting(item.id as keyof typeof settings)}
                    />
                  </div>
                </motion.div>
              );
            })}

            <div className="mt-4 p-5 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-[10px] text-white/30 text-center font-medium leading-relaxed">
                نحن نحترم خصوصيتك. جميع بياناتك مشفرة ومحمية وفقاً لأعلى معايير الأمان العالمية. لن يتم مشاركة بياناتك مع أي طرف ثالث.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
