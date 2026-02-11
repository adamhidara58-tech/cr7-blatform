import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { GoldButton } from '@/components/ui/GoldButton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AvatarSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATARS = Array.from({ length: 10 }, (_, i) => `/avatars/avatar${i + 1}.webp`);

export const AvatarSelectionModal = ({ isOpen, onClose }: AvatarSelectionModalProps) => {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(profile?.avatar_url || null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    if (!selectedAvatar || !profile) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: selectedAvatar })
        .eq('id', profile.id);

      if (error) throw error;

      await refreshProfile();
      toast({ title: 'تم بنجاح', description: 'تم تحديث الصورة الشخصية بنجاح' });
      onClose();
    } catch (error: any) {
      console.error('Error updating avatar:', error);
      toast({ 
        variant: 'destructive', 
        title: 'خطأ', 
        description: 'فشل تحديث الصورة الشخصية' 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-transparent shadow-none">
        <div className="bg-[#0A0A0C] border border-white/10 rounded-[32px] w-full flex flex-col overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)]">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-center text-xl font-bold text-gradient-gold">اختر صورتك الشخصية</DialogTitle>
          </DialogHeader>

          <div className="p-6 pt-2 overflow-y-auto custom-scrollbar max-h-[60vh]">
            <div className="grid grid-cols-3 gap-4">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                    selectedAvatar === avatar 
                      ? 'border-gold scale-95 shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                      : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <img 
                    src={avatar} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                  {selectedAvatar === avatar && (
                    <div className="absolute inset-0 bg-gold/20 flex items-center justify-center">
                      <div className="bg-gold rounded-full p-1.5 shadow-lg">
                        <Check className="w-4 h-4 text-black" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 border-t border-white/5">
            <GoldButton
              className="w-full py-7 rounded-2xl text-lg font-black shadow-gold"
              onClick={handleSave}
              disabled={isUpdating || !selectedAvatar}
            >
              {isUpdating ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              ) : (
                'حفظ التغييرات'
              )}
            </GoldButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
