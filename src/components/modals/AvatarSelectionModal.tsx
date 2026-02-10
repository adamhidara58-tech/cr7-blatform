import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2 } from 'lucide-react';
import { GoldButton } from '@/components/ui/GoldButton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AvatarSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATARS = Array.from({ length: 10 }, (_, i) => `/avatars/avatar${i + 1}.png`);

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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-[#1A1A20] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h3 className="text-xl font-display text-foreground">اختر صورتك الشخصية</h3>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>

            {/* Avatar Grid */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-4">
                {AVATARS.map((avatar) => (
                  <button
                    key={avatar}
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                      selectedAvatar === avatar 
                        ? 'border-gold scale-95 shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                        : 'border-transparent hover:border-white/20'
                    }`}
                  >
                    <img 
                      src={avatar} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                    {selectedAvatar === avatar && (
                      <div className="absolute inset-0 bg-gold/20 flex items-center justify-center">
                        <div className="bg-gold rounded-full p-1">
                          <Check className="w-4 h-4 text-black" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5">
              <GoldButton
                variant="primary"
                className="w-full py-4"
                onClick={handleSave}
                disabled={isUpdating || !selectedAvatar}
              >
                {isUpdating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'حفظ التغييرات'
                )}
              </GoldButton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
