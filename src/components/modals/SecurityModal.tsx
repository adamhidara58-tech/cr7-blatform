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
      <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-transparent shadow-none">
        <div className="bg-[#0A0A0C] border border-white/10 rounded-[32px] w-full flex flex-col overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)]">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-center text-xl font-bold text-gradient-gold flex items-center justify-center gap-2">
              <Shield className="w-5 h-5 text-gold" />
              الأمان والخصوصية
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-6 pt-2 space-y-4">
            {securityItems.map((item, index) => {
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
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="font-bold text-white text-sm">{item.title}</h4>
                          {item.status === 'active' && (
                            <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                          )}
                        </div>
                        <p className="text-[10px] text-white/40 font-medium">{item.description}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleAction(item.id)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        item.status === 'active' 
                          ? 'bg-white/5 text-white/40 hover:bg-white/10' 
                          : 'bg-gold text-black hover:scale-105 active:scale-95'
                      }`}
                    >
                      {item.action}
                    </button>
                  </div>
                </motion.div>
              );
            })}

            <div className="mt-4 p-5 rounded-2xl bg-green-500/5 border border-green-500/10 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-green-400 font-bold">حسابك محمي بنسبة 100%</p>
                <p className="text-[10px] text-white/30 font-medium mt-0.5">يتم تشفير جميع بياناتك ومعاملاتك بشكل كامل.</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
