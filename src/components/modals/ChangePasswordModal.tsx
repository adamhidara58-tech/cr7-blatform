import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Lock, Loader2 } from 'lucide-react';
import { GoldButton } from '@/components/ui/GoldButton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChangePasswordModal = ({ open, onOpenChange }: ChangePasswordModalProps) => {
  const [loading, setLoading] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { toast } = useToast();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'كلمات المرور غير متطابقة',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: 'تم بنجاح',
        description: 'تم تغيير كلمة المرور بنجاح',
      });
      onOpenChange(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء تغيير كلمة المرور',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-transparent shadow-none">
        <div className="bg-[#0A0A0C] border border-white/10 rounded-[32px] w-full flex flex-col overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)]">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-center text-xl font-bold text-gradient-gold flex items-center justify-center gap-2">
              <Lock className="w-5 h-5 text-gold" />
              تغيير كلمة المرور
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleUpdatePassword} className="p-6 pt-2 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest px-1">كلمة المرور القديمة</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white focus:border-gold/50 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest px-1">كلمة المرور الجديدة</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white focus:border-gold/50 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest px-1">تأكيد كلمة المرور الجديدة</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white focus:border-gold/50 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <GoldButton 
              type="submit"
              className="w-full py-7 rounded-2xl text-lg font-black shadow-gold mt-4"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              ) : (
                'تحديث كلمة المرور'
              )}
            </GoldButton>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
