import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, Wallet, Loader2 } from 'lucide-react';
import { GoldButton } from '@/components/ui/GoldButton';
import { Input } from '@/components/ui/input';
import { useCryptoPayments } from '@/hooks/useCryptoPayments';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
      }
    } catch (e) {
      console.error('Error fetching limits:', e);
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-transparent shadow-none">
        <div className="bg-[#0A0A0C] border border-white/10 rounded-[32px] w-full flex flex-col overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)]">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-center text-xl font-bold text-gradient-gold">سحب الأرباح</DialogTitle>
          </DialogHeader>

          <div className="p-6 pt-2 overflow-y-auto custom-scrollbar max-h-[75vh]">
            {!isWithinWithdrawalWindow && (
              <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 mb-6 flex items-center gap-4">
                <Clock className="w-8 h-8 text-red-500 shrink-0" />
                <div>
                  <p className="font-bold text-red-500 text-sm">السحب مغلق حالياً</p>
                  <p className="text-[10px] text-white/40 leading-tight">
                    السحب متاح يومياً من 12:00 إلى 13:00 بتوقيت UTC
                  </p>
                </div>
              </div>
            )}

            {isWithinWithdrawalWindow && !canWithdraw && (
              <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-2xl p-4 mb-6 flex items-center gap-4">
                <Clock className="w-8 h-8 text-yellow-500 shrink-0" />
                <div>
                  <p className="font-bold text-yellow-500 text-sm">يجب الانتظار</p>
                  <p className="text-[10px] text-white/40 leading-tight">
                    يمكنك السحب مرة واحدة كل 24 ساعة. المتبقي: {getRemainingTime()}
                  </p>
                </div>
              </div>
            )}

            {fetchingLimits ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-gold" />
                <p className="text-sm text-white/40">جاري تحميل حدود السحب...</p>
              </div>
            ) : (
              <>
                {step === 'amount' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="text-center">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">الأرباح القابلة للسحب</p>
                        <p className="text-4xl font-black text-gold">${withdrawableBalance.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center justify-center gap-3 text-[10px] font-bold text-white/30">
                        <span>الحد الأدنى: <span className="text-white/60">2 USDT</span></span>
                        <div className="w-1 h-1 rounded-full bg-white/10" />
                        <span>الحد الأقصى: <span className="text-white/60">${limits.max}</span></span>
                      </div>
                    </div>

                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="text-center text-3xl font-black h-20 bg-white/5 border-white/10 rounded-2xl"
                        disabled={!isWithinWithdrawalWindow}
                      />
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 font-bold">USD</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {[25, 50, 75, 100].map((percent) => (
                        <button
                          key={percent}
                          onClick={() => setAmount((withdrawableBalance * percent / 100).toFixed(2))}
                          className="py-3 rounded-xl bg-white/5 border border-white/5 hover:border-gold/30 text-[10px] font-bold text-white/40 hover:text-gold transition-all"
                        >
                          {percent}%
                        </button>
                      ))}
                    </div>

                    <GoldButton
                      onClick={handleSubmitAmount}
                      className="w-full py-7 rounded-2xl text-lg font-black shadow-gold"
                      disabled={!amount || parseFloat(amount) < 2 || parseFloat(amount) > withdrawableBalance || !isWithinWithdrawalWindow}
                    >
                      متابعة السحب
                    </GoldButton>
                  </motion.div>
                )}

                {step === 'details' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest px-1">اختر عملة السحب</label>
                      <div className="grid grid-cols-2 gap-3">
                        {currencies.map((currency) => (
                          <button
                            key={currency.currency}
                            onClick={() => setSelectedCurrency(currency.currency)}
                            className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-1 ${
                              selectedCurrency === currency.currency 
                                ? 'bg-gold/10 border-gold shadow-gold' 
                                : 'bg-white/5 border-white/10 hover:border-white/20'
                            }`}
                          >
                            <span className={`font-black text-lg ${selectedCurrency === currency.currency ? 'text-gold' : 'text-white'}`}>
                              {currency.currency.toUpperCase().replace('TRC20', '').replace('BSC', '')}
                            </span>
                            <span className="text-[8px] font-bold text-white/30 uppercase">{currency.network}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest px-1">عنوان المحفظة (Wallet Address)</label>
                      <Input
                        placeholder="أدخل عنوان محفظتك هنا..."
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        className="bg-white/5 border-white/10 h-14 rounded-xl text-xs font-mono"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => setStep('amount')} className="flex-1 py-4 text-sm font-bold text-white/30">رجوع</button>
                      <GoldButton onClick={handleSubmitDetails} className="flex-[2] py-4 rounded-xl font-bold">تأكيد البيانات</GoldButton>
                    </div>
                  </motion.div>
                )}

                {step === 'confirm' && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-white/40 text-xs">مبلغ السحب</span>
                        <span className="text-white font-black">${parseFloat(amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-white/40 text-xs">العملة المختارة</span>
                        <span className="text-gold font-black">{selectedCurrency.toUpperCase()}</span>
                      </div>
                      <div className="space-y-2 py-2">
                        <span className="text-white/40 text-xs block">عنوان المحفظة</span>
                        <span className="text-white/80 font-mono text-[10px] break-all leading-relaxed">{walletAddress}</span>
                      </div>
                    </div>

                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-400 shrink-0" />
                      <p className="text-[10px] text-white/50 leading-relaxed">
                        تتم مراجعة طلبات السحب يدوياً من قبل الإدارة لضمان الأمان. قد يستغرق وصول المبلغ من ساعة إلى 24 ساعة.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => setStep('details')} className="flex-1 py-4 text-sm font-bold text-white/30">تعديل</button>
                      <GoldButton onClick={handleConfirmWithdrawal} className="flex-[2] py-4 rounded-xl font-bold" disabled={loading}>
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'إرسال طلب السحب'}
                      </GoldButton>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
