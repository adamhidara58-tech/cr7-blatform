import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Bell, CheckCircle, Info, AlertCircle, ArrowDownCircle, ArrowUpCircle, History } from 'lucide-react';
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
        return <ArrowUpCircle className="w-5 h-5 text-accent" />;
      case 'challenge':
        return <CheckCircle className="w-5 h-5 text-primary" />;
      default:
        return <Info className="w-5 h-5 text-primary" />;
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
      <DialogContent className="glass-modal max-w-md border-border/50 max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-display text-gradient-gold">
            <Bell className="w-5 h-5 text-primary" />
            الإشعارات
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : transactions.length > 0 ? (
            transactions.map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl glass-card border border-border/30 bg-primary/5"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getIcon(tx.type)}</div>
                  <div className="flex-1 text-right">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted-foreground">{formatTime(tx.created_at)}</span>
                      <h4 className="font-semibold text-foreground text-sm">
                        {tx.type === 'deposit' ? 'تم إيداع مبلغ' : tx.type === 'withdrawal' ? 'تم سحب مبلغ' : tx.description}
                      </h4>
                    </div>
                    <p className="text-sm font-bold text-primary">
                      {tx.type === 'deposit' ? '+' : '-'}${Math.abs(tx.amount)}
                    </p>

                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground">لا توجد إشعارات حالياً</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
