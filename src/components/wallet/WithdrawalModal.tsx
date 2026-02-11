import { useState, useEffect, useMemo } from 'react';
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
  const [limits, setLimits] = useState({ min: 2, max: 1000 });
  const [fetchingLimits, setFetchingLimits] = useState(false);
  const [currentTimeUtc, setCurrentTimeUtc] = useState(new Date());

  // Update UTC time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeUtc(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const isWithinWithdrawalWindow = useMemo(() => {
    const utcHour = currentTimeUtc.getUTCHours();
    return utcHour >= 12 && utcHour < 13;
  }, [currentTimeUtc]);

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
          min: Math.max(2, Number(val?.min || 2)),
          max: Number(val?.max || 1000)
        });
      } else {
        setLimits({ min: 2, max: 1000 });
      }
    } catch (e) {
      console.error('Error fetching limits:', e);
      setLimits({ min: 2, max: 1000 });
    } finally {
      setFetchingLimits(false);
    }
  };

  const balance = Number(profile?.balance || 0);
  const withdrawableBalance = Number(profile?.total_earned || 0);

  const handleSubmitAmount = () => {
    if (!isWithinWithdrawalWindow) {
      toast({
        title: 'خارج وقت السحب',
        description: 'السحب متاح فقط بين 12:00 و 13:00 بتوقيت UTC',
        variant: 'destructive',
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 2) {
      toast({
        title: 'خطأ',
        description: `الحد الأدنى للسحب هو 2 USDT`,
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
    if (numAmount > withdrawableBalance) {
      toast({
        title: 'خطأ',
        description: 'لا يمكنك سحب مبلغ الإيداع، يمكنك سحب الأرباح فقط',
        variant: 'destructive',
      });
      return;
    }
    if (numAmount > balance) {
      toast({
        title: 'خطأ',
        description: 'رصيدك الإجمالي غير كافٍ',
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

  const isAmountInvalid = !amount || parseFloat(amount) < 2 || parseFloat(amount) > withdrawableBalance || !isWithinWithdrawalWindow;

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
          className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[95vh] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <button onClick={handleClose} className="p-2 hover:bg-secondary rounded-lg">
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-display text-lg">سحب</h2>
            <div className="w-9" />
          </div>

          <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
            {!isWithinWithdrawalWindow && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="font-semibold text-red-500">السحب مغلق حالياً</p>
                    <p className="text-sm text-muted-foreground">
                      السحب متاح يومياً من 12:00 إلى 13:00 بتوقيت UTC
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {isWithinWithdrawalWindow && !canWithdraw && (
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
                {step === 'amount' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="text-center mb-6">
                      <Wallet className="w-12 h-12 mx-auto text-primary mb-3" />
                      <h3 className="text-lg font-semibold">أدخل مبلغ السحب</h3>
                      <div className="glass-card rounded-2xl p-4 border border-white/5 mb-4">
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">الأرباح القابلة للسحب</p>
                        <p className="text-3xl font-black text-gold tracking-tight">${withdrawableBalance.toFixed(2)}</p>
                        <p className="text-[9px] text-white/40 mt-1">لا يمكن سحب مبالغ الإيداع</p>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-1">
                        <div className="flex items-center justify-center gap-4 text-[11px] font-bold">
                          <span className="text-white/40 uppercase tracking-wider">الحد الأدنى: <span className="text-primary">2 USDT</span></span>
                          <div className="w-1 h-1 rounded-full bg-white/10" />
                          <span className="text-white/40 uppercase tracking-wider">الحد الأقصى: <span className="text-white/80">${limits.max}</span></span>
                        </div>
                        {amount && parseFloat(amount) < 2 && (
                          <p className="text-[10px] text-red-500 font-bold mt-1">الحد الأدنى للسحب هو 2 USDT</p>
                        )}
                      </div>
                    </div>

                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className={`text-center text-2xl font-bold h-16 pr-12 ${amount && parseFloat(amount) < 2 ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        min={2}
                        max={Math.min(balance, limits.max)}
                        disabled={!isWithinWithdrawalWindow}
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        USD
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {[25, 50, 75, 100].map((percent) => (
                        <button
                          key={percent}
                          onClick={() => setAmount((withdrawableBalance * percent / 100).toFixed(2))}
                          className="flex-1 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium"
                          disabled={!isWithinWithdrawalWindow}
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
                      disabled={isAmountInvalid || !canWithdraw}
                    >
                      {!isWithinWithdrawalWindow ? 'السحب مغلق حالياً' : 'متابعة'}
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
                        {[...currencies, { currency: 'usdtaptos', network: 'APTOS', name: 'Tether' }].map((currency) => (
                          <button
                            key={currency.currency}
                            onClick={() => setSelectedCurrency(currency.currency)}
                            className={`p-4 rounded-xl border transition-all text-center flex flex-col items-center justify-center gap-1 group relative overflow-hidden ${
                              selectedCurrency === currency.currency
                                ? 'bg-gold/10 border-gold shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                                : 'bg-secondary/50 border-white/5 hover:border-gold/50'
                            }`}
                          >
                            <span className="font-bold text-sm uppercase">{currency.currency}</span>
                            <span className="text-[10px] text-muted-foreground uppercase">{currency.network}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">عنوان المحفظة</label>
                      <Input
                        placeholder="أدخل عنوان المحفظة هنا..."
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        className="bg-secondary/50"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <GoldButton
                        variant="secondary"
                        onClick={() => setStep('amount')}
                        className="flex-1"
                      >
                        رجوع
                      </GoldButton>
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
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">تأكيد السحب</h3>
                      <p className="text-muted-foreground">يرجى مراجعة تفاصيل السحب بعناية</p>
                    </div>

                    <div className="bg-secondary/50 rounded-2xl p-4 space-y-3 border border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">المبلغ</span>
                        <span className="font-bold text-lg">${amount} USDT</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">العملة</span>
                        <span className="font-bold uppercase">{selectedCurrency}</span>
                      </div>
                      <div className="pt-3 border-t border-white/5">
                        <span className="text-muted-foreground text-xs block mb-1">عنوان المحفظة</span>
                        <span className="font-mono text-[10px] break-all bg-black/30 p-2 rounded-lg block">
                          {walletAddress}
                        </span>
                      </div>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                      <p className="text-[11px] text-red-400 text-center leading-relaxed">
                        تأكد من صحة عنوان المحفظة والشبكة المختارة. إرسال الأموال إلى عنوان خاطئ سيؤدي إلى فقدانها بشكل دائم.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <GoldButton
                        variant="secondary"
                        onClick={() => setStep('details')}
                        className="flex-1"
                        disabled={loading}
                      >
                        رجوع
                      </GoldButton>
                      <GoldButton
                        onClick={handleConfirmWithdrawal}
                        className="flex-1"
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        ) : (
                          'تأكيد السحب'
                        )}
                      </GoldButton>
                    </div>
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
