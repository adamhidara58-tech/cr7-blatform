import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Clock, Wallet, Loader2 } from 'lucide-react';
import { GoldButton } from '@/components/ui/GoldButton';
import { Input } from '@/components/ui/input';
import { useCryptoPayments } from '@/hooks/useCryptoPayments';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WithdrawalModal = ({ isOpen, onClose }: WithdrawalModalProps) => {
  const { currencies, createWithdrawal, loading, canWithdraw, nextWithdrawalAt } = useCryptoPayments();
  const { profile } = useAuth();
  const [step, setStep] = useState<'amount' | 'details' | 'confirm'>('amount');
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [limits, setLimits] = useState({ min: 10, max: 1000 });
  const [fetchingLimits, setFetchingLimits] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchLimits();
    }
  }, [isOpen]);

  const fetchLimits = async () => {
    try {
      setFetchingLimits(true);
      const { data, error } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'withdrawal_limits')
        .maybeSingle();
      
      if (data && !error) {
        const val = data.value as { min?: number; max?: number };
        setLimits({
          min: Number(val?.min || 10),
          max: Number(val?.max || 1000)
        });
      }
    } catch (e) {
      console.error('Error fetching limits:', e);
    } finally {
      setFetchingLimits(false);
    }
  };

  const balance = Number(profile?.balance || 0);

  const handleSubmitAmount = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < limits.min) {
      toast({
        title: 'خطأ',
        description: `الحد الأدنى للسحب هو $${limits.min}`,
        variant: 'destructive',
      });
      return;
    }
    if (numAmount > limits.max) {
      toast({
        title: 'خطأ',
        description: `الحد الأقصى للسحب هو $${limits.max}`,
        variant: 'destructive',
      });
      return;
    }
    if (numAmount > balance) {
      toast({
        title: 'خطأ',
        description: 'رصيدك غير كافٍ',
        variant: 'destructive',
      });
      return;
    }
    setStep('details');
  };

  const handleSubmitDetails = () => {
    if (!selectedCurrency) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار العملة',
        variant: 'destructive',
      });
      return;
    }
    if (!walletAddress || walletAddress.length < 20) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال عنوان محفظة صحيح',
        variant: 'destructive',
      });
      return;
    }
    setStep('confirm');
  };

  const handleConfirmWithdrawal = async () => {
    const result = await createWithdrawal(parseFloat(amount), selectedCurrency, walletAddress);
    if (result) {
      handleClose();
    }
  };

  const handleClose = () => {
    setStep('amount');
    setAmount('');
    setSelectedCurrency('');
    setWalletAddress('');
    onClose();
  };

  const getRemainingTime = () => {
    if (!nextWithdrawalAt) return null;
    const diff = new Date(nextWithdrawalAt).getTime() - Date.now();
    if (diff <= 0) return null;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} ساعة و ${minutes} دقيقة`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <button onClick={handleClose} className="p-2 hover:bg-secondary rounded-lg">
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-display text-lg">سحب</h2>
            <div className="w-9" />
          </div>

          <div className="p-4">
            {!canWithdraw && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="font-semibold text-yellow-500">يجب الانتظار</p>
                    <p className="text-sm text-muted-foreground">
                      يمكنك السحب مرة واحدة كل 24 ساعة
                    </p>
                    <p className="text-sm font-medium mt-1">
                      الوقت المتبقي: {getRemainingTime()}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {fetchingLimits ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {step === 'amount' && canWithdraw && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="text-center mb-6">
                      <Wallet className="w-12 h-12 mx-auto text-primary mb-3" />
                      <h3 className="text-lg font-semibold">أدخل مبلغ السحب</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        الرصيد المتاح: <span className="text-primary font-bold">${balance.toFixed(2)}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        الحدود: ${limits.min} - ${limits.max}
                      </p>
                    </div>

                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="text-center text-2xl font-bold h-16 pr-12"
                        min={limits.min}
                        max={Math.min(balance, limits.max)}
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        USD
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {[25, 50, 75, 100].map((percent) => (
                        <button
                          key={percent}
                          onClick={() => setAmount((balance * percent / 100).toFixed(2))}
                          className="flex-1 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium"
                        >
                          {percent}%
                        </button>
                      ))}
                    </div>

                    <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 flex gap-3">
                      <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        سيتم خصم رسوم الشبكة من المبلغ المرسل
                      </p>
                    </div>

                    <GoldButton
                      onClick={handleSubmitAmount}
                      className="w-full"
                      disabled={!amount || parseFloat(amount) < limits.min || parseFloat(amount) > balance}
                    >
                      متابعة
                    </GoldButton>
                  </motion.div>
                )}

                {step === 'details' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold">تفاصيل السحب</h3>
                      <p className="text-sm text-muted-foreground">سحب ${amount}</p>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">اختر العملة</label>
                      <div className="grid grid-cols-2 gap-2">
                        {currencies.map((currency) => (
                          <button
                            key={currency.currency}
                            onClick={() => setSelectedCurrency(currency.currency)}
                            className={`p-3 rounded-xl border transition-all text-right ${
                              selectedCurrency === currency.currency
                                ? 'bg-primary/20 border-primary'
                                : 'bg-secondary border-border hover:border-primary/50'
                            }`}
                          >
                            <p className="font-semibold">{currency.currency.toUpperCase()}</p>
                            <p className="text-xs text-muted-foreground">{currency.network}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">عنوان المحفظة</label>
                      <Input
                        type="text"
                        placeholder="أدخل عنوان محفظتك"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        className="font-mono text-sm"
                        dir="ltr"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setStep('amount')}
                        className="flex-1 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-sm font-medium"
                      >
                        رجوع
                      </button>
                      <GoldButton
                        onClick={handleSubmitDetails}
                        className="flex-1"
                        disabled={!selectedCurrency || !walletAddress}
                      >
                        متابعة
                      </GoldButton>
                    </div>
                  </motion.div>
                )}

                {step === 'confirm' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold">تأكيد السحب</h3>
                    </div>

                    <div className="bg-secondary rounded-xl p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-primary font-bold">${amount}</span>
                        <span className="text-muted-foreground">المبلغ</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">{selectedCurrency.toUpperCase()}</span>
                        <span className="text-muted-foreground">العملة</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-xs break-all max-w-[200px]" dir="ltr">
                          {walletAddress}
                        </span>
                        <span className="text-muted-foreground text-sm">المحفظة</span>
                      </div>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-yellow-500">تأكد من صحة البيانات</p>
                        <p className="text-muted-foreground">
                          لا يمكن استرجاع الأموال بعد إرسالها لعنوان خاطئ
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setStep('details')}
                        className="flex-1 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-sm font-medium"
                      >
                        رجوع
                      </button>
                      <GoldButton
                        onClick={handleConfirmWithdrawal}
                        className="flex-1"
                        disabled={loading}
                      >
                        {loading ? 'جاري المعالجة...' : 'تأكيد السحب'}
                      </GoldButton>
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                      ⏱️ سيتم معالجة السحب خلال 24-48 ساعة
                    </p>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
