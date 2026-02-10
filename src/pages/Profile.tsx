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
import { AvatarSelectionModal } from '@/components/modals/AvatarSelectionModal';
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
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (location.state && (location.state as any).openDeposit) {
      setIsDepositOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

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
            </div>
            <button 
              onClick={() => setIsAvatarModalOpen(true)}
              className="absolute bottom-0 right-0 w-8 h-8 bg-gold rounded-full flex items-center justify-center cursor-pointer border-2 border-[#141419] hover:scale-110 transition-transform"
            >
              <Camera className="w-4 h-4 text-black" />
            </button>
            <div className="absolute -top-1 -left-1 w-8 h-8 bg-background border-2 border-gold rounded-full flex items-center justify-center shadow-lg">
              <span className="text-[10px] font-bold text-gold">V{profile.vip_level}</span>
            </div>
          </div>
          <h2 className="font-display text-xl text-foreground mt-4">{profile.username}</h2>
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

      {/* Recent Transactions */}
      <section className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg text-foreground">آخر العمليات</h3>
          <button className="text-xs text-primary hover:underline">عرض الكل</button>
        </div>
        
        <div className="space-y-3">
          {isTransactionsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-secondary/20 rounded-xl animate-pulse" />
            ))
          ) : transactions.length > 0 ? (
            transactions.map((tx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 bg-secondary/10 border border-white/5 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{tx.description}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${
                    ['deposit', 'challenge', 'commission'].includes(tx.type) ? 'text-green-500' : 'text-accent'
                  }`}>
                    {['deposit', 'challenge', 'commission'].includes(tx.type) ? '+' : '-'}${tx.amount}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {tx.status === 'completed' ? 'مكتمل' : tx.status === 'pending' ? 'قيد الانتظار' : 'فشل'}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 bg-secondary/5 rounded-xl border border-dashed border-white/10">
              <History className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-20" />
              <p className="text-sm text-muted-foreground">لا توجد عمليات سابقة</p>
            </div>
          )}
        </div>
      </section>

      {/* Menu Items */}
      <section className="px-4 mb-20">
        <div className="bg-secondary/10 border border-white/5 rounded-2xl overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className={`w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-white/5' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </div>
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
          
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 p-4 hover:bg-red-500/10 transition-colors text-red-500"
          >
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">تسجيل الخروج</span>
          </button>
        </div>
      </section>

      {/* Modals */}
      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} />
      <WithdrawalModal isOpen={isWithdrawalOpen} onClose={() => setIsWithdrawalOpen(false)} />
      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
      <AvatarSelectionModal isOpen={isAvatarModalOpen} onClose={() => setIsAvatarModalOpen(false)} />
    </PageLayout>
  );
};

export default Profile;
