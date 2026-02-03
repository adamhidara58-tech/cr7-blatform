import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Currency {
  currency: string;
  name: string;
  network: string;
  minAmount: number;
  isPopular: boolean;
}

interface DepositInfo {
  orderId: string;
  invoiceId: string;
  invoiceUrl: string;
  payAddress: string;
  payAmount: number;
  payCurrency: string;
  network: string;
  expiresAt: string;
  qrCode: string;
}

interface CryptoDeposit {
  id: string;
  order_id: string;
  amount_usd: number;
  amount_crypto: number;
  currency: string;
  network: string;
  wallet_address: string;
  payment_status: string;
  tx_hash: string;
  created_at: string;
  confirmed_at: string;
}

interface CryptoWithdrawal {
  id: string;
  amount_usd: number;
  amount_crypto: number;
  currency: string;
  wallet_address: string;
  status: string;
  tx_hash: string;
  created_at: string;
  processed_at: string;
}

export const useCryptoPayments = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [deposits, setDeposits] = useState<CryptoDeposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<CryptoWithdrawal[]>([]);
  const [loading, setLoading] = useState(false);
  const [canWithdraw, setCanWithdraw] = useState(true);
  const [nextWithdrawalAt, setNextWithdrawalAt] = useState<string | null>(null);
  const [minimumDepositUsd] = useState(0);

  const fetchCurrencies = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('nowpayments-currencies');
      
      if (error) throw error;
      
      if (data.success) {
        setCurrencies(data.currencies);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error fetching currencies:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل العملات المدعومة',
        variant: 'destructive',
      });
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('nowpayments-status');
      
      if (error) throw error;
      
      if (data.success) {
        setDeposits(data.deposits);
        setWithdrawals(data.withdrawals);
        setCanWithdraw(data.canWithdraw);
        setNextWithdrawalAt(data.nextWithdrawalAt);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  }, []);

  const createDeposit = async (amount: number, currency: string): Promise<DepositInfo | null> => {
    setLoading(true);
    try {
      if (amount < minimumDepositUsd) {
        toast({
          title: 'خطأ',
          description: `الحد الأدنى للإيداع هو $${minimumDepositUsd}`,
          variant: 'destructive',
        });
        return null;
      }

      const { data, error } = await supabase.functions.invoke('nowpayments-deposit', {
        body: { amount, currency },
      });
      
      if (error) throw error;
      
      if (data.success) {
        toast({
          title: 'تم إنشاء الإيداع',
          description: data.message,
        });
        await fetchStatus();
        return data.deposit;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error creating deposit:', error);
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'فشل في إنشاء الإيداع',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createWithdrawal = async (amount: number, currency: string, walletAddress: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('nowpayments-withdrawal', {
        body: { amount, currency, walletAddress },
      });
      
      if (error) throw error;
      
      if (data.success) {
        toast({
          title: 'تم إرسال طلب السحب',
          description: data.message,
        });
        await fetchStatus();
        return data.withdrawal;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error creating withdrawal:', error);
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'فشل في إنشاء طلب السحب',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrencies();
    fetchStatus();
  }, [fetchCurrencies, fetchStatus]);

  // Subscribe to deposit status changes
  useEffect(() => {
    const channel = supabase
      .channel('crypto-deposits')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'crypto_deposits',
        },
        (payload) => {
          console.log('Deposit updated:', payload);
          if (payload.new.payment_status === 'finished' || payload.new.payment_status === 'confirmed') {
            toast({
              title: 'تم تأكيد الإيداع! 🎉',
              description: `تم إضافة $${payload.new.amount_usd} إلى رصيدك`,
            });
          }
          fetchStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStatus]);

  return {
    currencies,
    deposits,
    withdrawals,
    loading,
    canWithdraw,
    nextWithdrawalAt,
    minimumDepositUsd,
    createDeposit,
    createWithdrawal,
    refreshStatus: fetchStatus,
  };
};
