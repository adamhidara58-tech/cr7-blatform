import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Bell, CheckCircle, Info, ArrowDownCircle, ArrowUpCircle, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface NotificationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  created_at: string;
}

export const NotificationsModal = ({ open, onOpenChange }: NotificationsModalProps) => {
  const { profile } = useAuth();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['notifications-transactions', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!profile?.id && open,
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownCircle className="w-5 h-5 text-green-400" />;
      case 'withdrawal':
        return <ArrowUpCircle className="w-5 h-5 text-red-400" />;
      case 'challenge':
        return <CheckCircle className="w-5 h-5 text-gold" />;
      default:
        return <Info className="w-5 h-5 text-gold" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ar-EG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-transparent shadow-none">
        <div className="bg-[#0A0A0C] border border-white/10 rounded-[32px] w-full flex flex-col overflow-hidden shadow-[0_32px_64px_-12_rgba(0,0,0,0.8)]">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-center text-xl font-bold text-gradient-gold flex items-center justify-center gap-2">
              <Bell className="w-5 h-5 text-gold" />
              الإشعارات
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-6 pt-2 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-gold border-t-transparent"></div>
                <p className="text-sm text-white/40">جاري تحميل الإشعارات...</p>
              </div>
            ) : transactions.length > 0 ? (
              transactions.map((tx, index) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                      {getIcon(tx.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-white text-sm">
                          {tx.type === 'deposit' ? 'إيداع ناجح' : tx.type === 'withdrawal' ? 'طلب سحب' : tx.description}
                        </h4>
                        <span className="text-[10px] font-medium text-white/20">{formatTime(tx.created_at)}</span>
                      </div>
                      <p className={`text-sm font-black ${tx.type === 'deposit' || tx.type === 'challenge' ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.type === 'deposit' || tx.type === 'challenge' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <History className="w-8 h-8 text-white/10" />
                </div>
                <p className="text-white/30 font-medium">لا توجد إشعارات حالياً</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
