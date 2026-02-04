import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shield, Lock, Smartphone, KeyRound, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { GoldButton } from '@/components/ui/GoldButton';
import { useToast } from '@/hooks/use-toast';

interface SecurityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const securityItems = [
  {
    id: 'password',
    icon: Lock,
    title: 'كلمة المرور',
    description: 'تغيير كلمة المرور الخاصة بك',
    status: 'active',
    action: 'تغيير',
  },
  {
    id: '2fa',
    icon: Smartphone,
    title: 'التحقق بخطوتين',
    description: 'أضف طبقة حماية إضافية',
    status: 'inactive',
    action: 'تفعيل',
  },
  {
    id: 'pin',
    icon: KeyRound,
    title: 'رمز PIN',
    description: 'إنشاء رمز PIN للسحب',
    status: 'inactive',
    action: 'إنشاء',
  },
];

export const SecurityModal = ({ open, onOpenChange }: SecurityModalProps) => {
  const { toast } = useToast();

  const handleAction = (itemId: string) => {
    toast({
      title: 'قريباً!',
      description: 'هذه الميزة قيد التطوير',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-modal max-w-md border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-display text-gradient-gold">
            <Shield className="w-5 h-5 text-primary" />
            الأمان
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {securityItems.map((item, index) => {
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
                  <GoldButton 
                    variant={item.status === 'active' ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => handleAction(item.id)}
                  >
                    {item.action}
                  </GoldButton>
                  
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <div className="flex items-center justify-end gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{item.title}</h4>
                        {item.status === 'active' && (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                      </div>
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

        <div className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
          <div className="flex items-center gap-3 text-right">
            <div className="flex-1">
              <p className="text-sm text-green-400 font-medium">حسابك محمي</p>
              <p className="text-xs text-muted-foreground">آخر تسجيل دخول: منذ 5 دقائق</p>
            </div>
            <Shield className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
