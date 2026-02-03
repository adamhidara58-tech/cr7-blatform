import { useState, useEffect } from 'react';
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
  ChevronLeft
} from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { GoldButton } from '@/components/ui/GoldButton';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DepositModal } from '@/components/wallet/DepositModal';
import { WithdrawalModal } from '@/components/wallet/WithdrawalModal';
import { TransactionsHistory } from '@/components/wallet/TransactionsHistory';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  created_at: string;
}

const Profile = () => {
  const { profile, signOut } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!profile) return;

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) {
        console.error('Error fetching transactions:', error);
      } else {
        setTransactions(data || []);
      }
      setLoading(false);
    };

    fetchTransactions();
  }, [profile]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownCircle className="w-5 h-5 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpCircle className="w-5 h-5 text-accent" />;
      case 'challenge':
        return <ArrowDownCircle className="w-5 h-5 text-primary" />;
      case 'commission':
        return <ArrowDownCircle className="w-5 h-5 text-green-500" />;
      case 'vip_upgrade':
        return <ArrowUpCircle className="w-5 h-5 text-primary" />;
      default:
        return <History className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const menuItems = [
    { icon: Shield, label: 'الأمان والخصوصية', href: '#' },
    { icon: HelpCircle, label: 'المساعدة والدعم', href: '#' },
    { icon: Settings, label: 'الإعدادات', href: '#' },
  ];

  if (!profile) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Profile Header */}
      <section className="px-4 pt-6 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-6"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-gold flex items-center justify-center mb-3 shadow-gold">
            <User className="w-10 h-10 text-primary-foreground" />
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
          className="bg-gradient-card border border-primary/30 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <Wallet className="w-6 h-6 text-primary" />
            <h3 className="font-semibold text-foreground">المحفظة</h3>
          </div>
          
          <div className="text-center mb-6">
            <p className="text-xs text-muted-foreground mb-1">الرصيد المتاح</p>
            <p className="text-3xl font-bold text-gradient-gold">
              ${Number(profile.balance).toLocaleString()}
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد معاملات حتى الآن
            </div>
          ) : (
            transactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-secondary/30 rounded-xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {getTransactionIcon(transaction.type)}
                  <span className={`font-semibold ${Number(transaction.amount) >= 0 ? 'text-green-500' : 'text-accent'}`}>
                    {Number(transaction.amount) >= 0 ? '+' : ''}${Math.abs(Number(transaction.amount)).toFixed(2)}
                  </span>
                </div>
                
                <div className="text-right flex-1 mx-3">
                  <p className="text-sm font-medium text-foreground">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(transaction.created_at).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                
                <span className={`text-xs px-2 py-1 rounded-full ${
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
        <div className="bg-gradient-card border border-border rounded-2xl overflow-hidden">
          {menuItems.map((item, index) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={`w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors ${
                index < menuItems.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              <div className="flex items-center gap-3">
                <span className="text-foreground">{item.label}</span>
                <item.icon className="w-5 h-5 text-muted-foreground" />
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
          className="w-full flex items-center justify-center gap-2 py-3 text-accent hover:bg-accent/10 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">تسجيل الخروج</span>
        </motion.button>
      </section>

      {/* Modals */}
      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} />
      <WithdrawalModal isOpen={isWithdrawalOpen} onClose={() => setIsWithdrawalOpen(false)} />
    </PageLayout>
  );
};

export default Profile;
