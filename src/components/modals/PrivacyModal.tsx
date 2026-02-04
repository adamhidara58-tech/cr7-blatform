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
      <DialogContent className="glass-modal max-w-md border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-display text-gradient-gold">
            <Eye className="w-5 h-5 text-primary" />
            الخصوصية
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {privacyItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl glass-card border border-border/30"
              >
                <div className="flex items-center justify-between">
                  <Switch 
                    checked={item.enabled}
                    onCheckedChange={() => toggleSetting(item.id as keyof typeof settings)}
                  />
                  
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-4 p-4 rounded-xl bg-secondary/50 border border-border/30">
          <p className="text-xs text-muted-foreground text-right leading-relaxed">
            نحن نحترم خصوصيتك. جميع بياناتك مشفرة ومحمية وفقاً لأعلى معايير الأمان.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
