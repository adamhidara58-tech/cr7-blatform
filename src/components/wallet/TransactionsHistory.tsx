import { motion } from 'framer-motion';
import { ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { useCryptoPayments } from '@/hooks/useCryptoPayments';

export const TransactionsHistory = () => {
  const { deposits, withdrawals } = useCryptoPayments();

  // Combine and sort transactions
  const allTransactions = [
    ...deposits.map(d => ({
      id: d.id,
      type: 'deposit' as const,
      amount: d.amount_usd,
      currency: d.currency,
      status: d.payment_status,
      txHash: d.tx_hash,
      createdAt: new Date(d.created_at),
      walletAddress: d.wallet_address,
    })),
    ...withdrawals.map(w => ({
      id: w.id,
      type: 'withdrawal' as const,
      amount: w.amount_usd,
      currency: w.currency,
      status: w.status,
      txHash: w.tx_hash,
      createdAt: new Date(w.created_at),
      walletAddress: w.wallet_address,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'finished':
      case 'confirmed':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'waiting':
      case 'pending':
      case 'confirming':
        return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case 'failed':
      case 'expired':
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'finished':
      case 'confirmed':
      case 'completed':
        return 'مكتمل';
      case 'waiting':
        return 'في الانتظار';
      case 'pending':
        return 'قيد المعالجة';
      case 'confirming':
        return 'جاري التأكيد';
      case 'failed':
        return 'فشل';
      case 'rejected':
        return 'مرفوض';
      case 'expired':
        return 'منتهي الصلاحية';
      default:
        return status;
    }
  };

  if (allTransactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>لا توجد معاملات بعد</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {allTransactions.map((tx, index) => (
        <motion.div
          key={tx.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-secondary/50 rounded-xl p-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            {tx.type === 'deposit' ? (
              <div className="p-2 rounded-full bg-green-500/20">
                <ArrowDownCircle className="w-4 h-4 text-green-500" />
              </div>
            ) : (
              <div className="p-2 rounded-full bg-primary/20">
                <ArrowUpCircle className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className="flex items-center gap-2">
              {getStatusIcon(tx.status)}
              <span className="text-xs text-muted-foreground">
                {getStatusText(tx.status)}
              </span>
            </div>
          </div>

          <div className="text-left flex-1 mx-3">
            <p className="font-medium">
              {tx.type === 'deposit' ? 'إيداع' : 'سحب'} {tx.currency}
            </p>
            <p className="text-xs text-muted-foreground">
              {tx.createdAt.toLocaleDateString('ar-SA')} - {tx.createdAt.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="text-right">
            <p className={`font-bold ${tx.type === 'deposit' ? 'text-green-500' : 'text-primary'}`}>
              {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
            </p>
            {tx.txHash && (
              <a
                href={`https://blockhain.com/tx/${tx.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary flex items-center gap-1 hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                TX
              </a>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
