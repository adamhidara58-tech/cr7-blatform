import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  History, 
  Settings, 
  LogOut,
  Shield,
  HelpCircle,
  ChevronLeft,
  Camera,
  Lock,
  Loader2
} from 'lucide-react';
import { ChangePasswordModal } from '@/components/modals/ChangePasswordModal';
import { useToast } from '@/hooks/use-toast';
import { PageLayout } from '@/components/layout/PageLayout';
import { GoldButton } from '@/components/ui/GoldButton';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DepositModal } from '@/components/wallet/DepositModal';
import { WithdrawalModal } from '@/components/wallet/WithdrawalModal';
import { useQuery } from '@tanstack/react-query';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  created_at: string;
}

const ProfileSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex flex-col items-center mb-6 pt-6">
      <div className="w-20 h-20 rounded-full bg-secondary/50 mb-3" />
      <div className="h-6 w-32 bg-secondary/50 rounded mb-2" />
      <div className="h-4 w-48 bg-secondary/50 rounded" />
    </div>
    <div className="px-4 mb-6">
      <div className="h-48 bg-secondary/30 rounded-2xl border border-white/5" />
    </div>
    <div className="px-4 space-y-3">
      <div className="h-12 bg-secondary/30 rounded-xl" />
      <div className="h-12 bg-secondary/30 rounded-xl" />
      <div className="h-12 bg-secondary/30 rounded-xl" />
    </div>
  </div>
);

const Profile = () => {
  const { profile, isProfileLoading, signOut } = useAuth();
  const location = useLocation();
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { refreshProfile } = useAuth();

  useEffect(() => {
    if (location.state && (location.state as any).openDeposit) {
      setIsDepositOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'يرجى اختيار ملف صورة' });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${profile.id}/${Math.random()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        if (uploadError.message.includes('Bucket not found')) {
          throw new Error('لم يتم العثور على مساحة التخزين "avatars". يرجى التأكد من إنشائها في Supabase Storage.');
        }
        throw uploadError;
      }

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update Profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      await refreshProfile();
      toast({ title: 'تم بنجاح', description: 'تم تحديث الصورة الشخصية' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'خطأ', description: error.message });
    } finally {
      setIsUploading(false);
    }
  };

  const { data: transactions = [], isLoading: isTransactionsLoading } = useQuery({
    queryKey: ['transactions', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!profile?.id,
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownCircle className="w-5 h-5 text-green-500" />;
      case 'withdrawal': return <ArrowUpCircle className="w-5 h-5 text-accent" />;
      case 'challenge': return <ArrowDownCircle className="w-5 h-5 text-primary" />;
      case 'commission': return <ArrowDownCircle className="w-5 h-5 text-green-500" />;
      case 'vip_upgrade': return <ArrowUpCircle className="w-5 h-5 text-primary" />;
      default: return <History className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const menuItems = [
    { icon: Lock, label: 'تغيير كلمة المرور', onClick: () => setIsPasswordModalOpen(true) },
    { icon: HelpCircle, label: 'المساعدة والدعم', href: '/team' },
  ];

  if (isProfileLoading && !profile) {
    return (
      <PageLayout>
        <ProfileSkeleton />
      </PageLayout>
    );
  }

  if (!profile) return null;

  return (
    <PageLayout>
      {/* Profile Header */}
      <section className="px-4 pt-6 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-6"
        >
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-gradient-gold p-1 shadow-gold relative overflow-hidden">
              <div className="w-full h-full rounded-full bg-[#141419] flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.username} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-gold/50" />
                )}
              </div>
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full">
                  <Loader2 className="w-6 h-6 text-gold animate-spin" />
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-gold rounded-full flex items-center justify-center cursor-pointer border-2 border-[#141419] hover:scale-110 transition-transform">
              <Camera className="w-4 h-4 text-black" />
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploading} />
            </label>
            <div className="absolute -top-1 -left-1 w-8 h-8 bg-background border-2 border-gold rounded-full flex items-center justify-center shadow-lg">
              <span className="text-[10px] font-bold text-gold">V{profile.vip_level}</span>
            </div>
          </div>
          <h2 className="font-display text-xl text-foreground">{profile.username}</h2>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          <div className="mt-2 px-3 py-1 bg-primary/20 rounded-full">
            <span className="text-sm font-medium text-primary">
              {profile.vip_level === 0.5 ? 'VIP تجريبي' : `VIP ${profile.vip_level}`}
            </span>
          </div>
        </motion.div>
      </section>

      {/* Wallet Section */}
      <section className="px-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-card border border-primary/30 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        >
          <div className="flex items-center justify-between mb-4">
            <Wallet className="w-6 h-6 text-primary" />
            <h3 className="font-semibold text-foreground">المحفظة</h3>
          </div>
          
          <div className="text-center mb-6">
            <p className="text-xs text-muted-foreground mb-1">الرصيد المتاح</p>
            <p className="text-3xl font-bold text-gradient-gold">
              ${Number(profile.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">USDT</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <GoldButton 
              variant="primary" 
              size="md" 
              className="w-full"
              onClick={() => setIsDepositOpen(true)}
            >
              <span className="flex items-center justify-center gap-2">
                <ArrowDownCircle className="w-4 h-4" />
                إيداع
              </span>
            </GoldButton>
            <GoldButton 
              variant="secondary" 
              size="md" 
              className="w-full"
              onClick={() => setIsWithdrawalOpen(true)}
            >
              <span className="flex items-center justify-center gap-2">
                <ArrowUpCircle className="w-4 h-4" />
                سحب
              </span>
            </GoldButton>
          </div>
        </motion.div>
      </section>

      {/* Transactions */}
      <section className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button className="text-sm text-primary flex items-center gap-1">
            عرض الكل
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h3 className="font-display text-lg text-foreground flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            آخر المعاملات
          </h3>
        </div>

        <div className="space-y-2">
          {isTransactionsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-secondary/20 rounded-xl animate-pulse" />)}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-secondary/10 rounded-xl border border-dashed border-white/5">
              لا توجد معاملات حتى الآن
            </div>
          ) : (
            transactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-secondary/30 border border-white/5 rounded-xl p-3 flex items-center justify-between hover:bg-secondary/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {getTransactionIcon(transaction.type)}
                  <span className={`font-bold ${Number(transaction.amount) >= 0 ? 'text-green-500' : 'text-accent'}`}>
                    {Number(transaction.amount) >= 0 ? '+' : ''}${Math.abs(Number(transaction.amount)).toFixed(2)}
                  </span>
                </div>
                
                <div className="text-right flex-1 mx-3">
                  <p className="text-sm font-medium text-foreground">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(transaction.created_at).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                
                <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                  transaction.status === 'completed' 
                    ? 'bg-green-500/20 text-green-500' 
                    : transaction.status === 'pending'
                    ? 'bg-yellow-500/20 text-yellow-500'
                    : 'bg-accent/20 text-accent'
                }`}>
                  {transaction.status === 'completed' ? 'مكتمل' : transaction.status === 'pending' ? 'قيد الانتظار' : 'فشل'}
                </span>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Menu Items */}
      <section className="px-4 mb-6">
        <div className="bg-gradient-card border border-white/5 rounded-2xl overflow-hidden">
          {menuItems.map((item, index) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              onClick={item.onClick}
              className={`w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors ${
                index < menuItems.length - 1 ? 'border-b border-white/5' : ''
              }`}
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              <div className="flex items-center gap-3">
                <span className="text-foreground font-medium">{item.label}</span>
                <item.icon className="w-5 h-5 text-primary" />
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Logout */}
      <section className="px-4 pb-6">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 py-4 text-accent hover:bg-accent/10 rounded-2xl transition-all border border-accent/20"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-bold">تسجيل الخروج</span>
        </motion.button>
      </section>

      {/* Modals */}
      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} />
      <WithdrawalModal isOpen={isWithdrawalOpen} onClose={() => setIsWithdrawalOpen(false)} />
      <ChangePasswordModal open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen} />
    </PageLayout>
  );
};

export default Profile;
