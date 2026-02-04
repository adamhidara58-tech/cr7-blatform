import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownRight, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FakeWithdrawal {
  id: string;
  username: string;
  amount: number;
  timeAgo: string;
}

const generateRandomWithdrawals = (): FakeWithdrawal[] => {
  const names = [
    'أحمد***',
    'محمد***',
    'سارة***',
    'فاطمة***',
    'علي***',
    'خالد***',
    'نور***',
    'ريم***',
    'يوسف***',
    'هند***',
    'عمر***',
    'ليلى***',
    'حسن***',
    'مريم***',
    'كريم***',
  ];
  
  const amounts = [15.50, 45.00, 100.00, 250.00, 89.90, 178.00, 320.50, 55.00, 420.00, 65.75];
  const times = ['الآن', 'منذ دقيقة', 'منذ 2 دقيقة', 'منذ 3 دقائق', 'منذ 5 دقائق'];
  
  return Array.from({ length: 5 }, (_, i) => ({
    id: `withdrawal-${Date.now()}-${i}`,
    username: names[Math.floor(Math.random() * names.length)],
    amount: amounts[Math.floor(Math.random() * amounts.length)],
    timeAgo: times[i],
  }));
};

export const FakeWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<FakeWithdrawal[]>(generateRandomWithdrawals());

  useEffect(() => {
    const interval = setInterval(() => {
      setWithdrawals(prev => {
        const newWithdrawal: FakeWithdrawal = {
          id: `withdrawal-${Date.now()}`,
          username: ['أحمد***', 'محمد***', 'سارة***', 'فاطمة***', 'علي***'][Math.floor(Math.random() * 5)],
          amount: [15.50, 45.00, 100.00, 250.00, 89.90][Math.floor(Math.random() * 5)],
          timeAgo: 'الآن',
        };
        return [newWithdrawal, ...prev.slice(0, 4)];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card border border-border/30 rounded-2xl p-4 overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
            <ArrowDownRight className="w-4 h-4 text-green-400" />
          </div>
        </div>
        <h3 className="font-display text-base text-foreground flex items-center gap-2">
          <Wallet className="w-4 h-4 text-primary" />
          آخر السحوبات
        </h3>
      </div>

      <div className="space-y-2 max-h-[180px] overflow-hidden">
        <AnimatePresence mode="popLayout">
          {withdrawals.map((withdrawal) => (
            <motion.div
              key={withdrawal.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between py-2 px-3 glass-section rounded-xl"
            >
              <span className="text-xs text-muted-foreground">{withdrawal.timeAgo}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-green-400">
                  +${withdrawal.amount.toFixed(2)}
                </span>
                <span className="text-sm text-foreground">{withdrawal.username}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
