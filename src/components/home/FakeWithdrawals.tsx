import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownRight, Wallet, ChevronLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FakeWithdrawal {
  id: string;
  username: string;
  amount: number;
  timeAgo: string;
}

const generateRandomWithdrawals = (): FakeWithdrawal[] => {
  const names = [
    'أحمد***', 'محمد***', 'سارة***', 'فاطمة***', 'علي***',
    'خالد***', 'نور***', 'ريم***', 'يوسف***', 'هند***',
    'عمر***', 'ليلى***', 'حسن***', 'مريم***', 'كريم***',
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
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <button className="flex items-center gap-1 text-[10px] text-white/30 font-bold hover:text-gold transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" />
          عرض الكل
        </button>
        <h3 className="text-lg font-bold text-white/80 flex items-center gap-2">
          <Wallet className="w-4.5 h-4.5 text-gold" />
          آخر السحوبات
        </h3>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="glass-card border border-white/5 rounded-3xl p-5 overflow-hidden"
      >
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {withdrawals.map((withdrawal) => (
              <motion.div
                key={withdrawal.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex items-center justify-between py-3 px-4 bg-white/[0.02] border border-white/[0.03] rounded-2xl group hover:bg-white/[0.05] transition-colors will-change-transform"
              >
                <span className="text-[10px] font-medium text-white/30">{withdrawal.timeAgo}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.2)]">
                    +${withdrawal.amount.toFixed(2)}
                  </span>
                  <span className="text-sm font-bold text-white/80">{withdrawal.username}</span>
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/10">
                    <ArrowDownRight className="w-3.5 h-3.5 text-green-400" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
