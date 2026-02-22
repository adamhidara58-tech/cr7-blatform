import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Wallet, AlertCircle } from 'lucide-react';
import { GoldButton } from '@/components/ui/GoldButton';
import { Input } from '@/components/ui/input';
import { useCryptoPayments } from '@/hooks/useCryptoPayments';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DepositModal = ({ isOpen, onClose }: DepositModalProps) => {
  const { currencies, createDeposit, loading, minimumDepositUsd } = useCryptoPayments();
  const [step, setStep] = useState<'amount' | 'currency' | 'payment'>('amount');
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [depositInfo, setDepositInfo] = useState<{
    payAddress: string;
    payAmount: number;
    payCurrency: string;
    qrCode: string;
    invoiceUrl: string;
    expiresAt: string;
  } | null>(null);
  const [copied, setCopied] = useState<'address' | 'amount' | null>(null);

  const handleCopy = async (text: string, type: 'address' | 'amount') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    toast({ title: 'تم النسخ!' });
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSubmitAmount = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < minimumDepositUsd) {
      toast({
        title: 'خطأ',
        description: `الحد الأدنى للإيداع هو $${minimumDepositUsd}`,
        variant: 'destructive',
      });
      return;
    }
    setStep('currency');
  };

  const handleSelectCurrency = async (currency: string) => {
    setSelectedCurrency(currency);
    const result = await createDeposit(parseFloat(amount), currency);
    if (result) {
      setDepositInfo({
        payAddress: result.payAddress,
        payAmount: result.payAmount,
        payCurrency: result.payCurrency,
        qrCode: result.qrCode,
        invoiceUrl: result.invoiceUrl,
        expiresAt: result.expiresAt,
      });
      setStep('payment');
    }
  };

  const handleClose = () => {
    setStep('amount');
    setAmount('');
    setSelectedCurrency('');
    setDepositInfo(null);
    onClose();
  };

  const popularCurrencies = currencies;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-transparent shadow-none">
        <div className="bg-[#0A0A0C] border border-white/10 rounded-[32px] w-full flex flex-col overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)]">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-center text-xl font-bold text-gradient-gold">إيداع الأموال</DialogTitle>
          </DialogHeader>

          <div className="p-6 pt-2 overflow-y-auto custom-scrollbar max-h-[70vh]">
            {/* Step 1: Amount */}
            {step === 'amount' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-gold/10 rounded-2xl flex items-center justify-center mb-4 border border-gold/20 shadow-gold">
                    <Wallet className="w-8 h-8 text-gold" />
                  </div>
                  <h3 className="text-lg font-bold text-white">أدخل مبلغ الإيداع</h3>
                  <p className="text-sm text-white/40 mt-1">
                    الحد الأدنى للإيداع هو <span className="text-gold font-bold">${minimumDepositUsd}</span>
                  </p>
                </div>

                <div className="relative group">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-center text-3xl font-black h-20 bg-white/5 border-white/10 rounded-2xl focus:border-gold/50 focus:ring-gold/20 transition-all"
                    min={minimumDepositUsd}
                  />
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 font-bold text-lg">
                    USD
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[10, 50, 100, 500].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAmount(preset.toFixed(2))}
                      className="py-3 rounded-xl bg-white/5 border border-white/5 hover:border-gold/30 hover:bg-gold/5 transition-all text-sm font-bold text-white/70 hover:text-gold"
                    >
                      ${preset}
                    </button>
                  ))}
                </div>

                <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-white/50 leading-relaxed">
                    يرجى إرسال المبلغ المطلوب <strong className="text-white">بالإضافة</strong> إلى رسوم الشبكة لضمان وصول المبلغ كاملاً.
                  </p>
                </div>

                <GoldButton
                  onClick={handleSubmitAmount}
                  className="w-full py-7 rounded-2xl text-lg font-black shadow-gold hover:scale-[1.02] active:scale-[0.98] transition-all"
                  disabled={!amount || parseFloat(amount) < minimumDepositUsd}
                >
                  متابعة للدفع
                </GoldButton>
              </motion.div>
            )}

            {/* Step 2: Select Currency */}
            {step === 'currency' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-white">اختر العملة</h3>
                  <p className="text-sm text-white/40">المبلغ المطلوب: <span className="text-gold font-bold">${parseFloat(amount).toFixed(2)}</span></p>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-white/40 font-medium">جاري تجهيز بوابة الدفع...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {popularCurrencies.map((currency) => (
                      <button
                        key={currency.currency}
                        onClick={() => handleSelectCurrency(currency.currency)}
                        className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-gold/50 hover:bg-gold/5 transition-all flex flex-col items-center gap-2 group"
                      >
                        <p className="font-black text-xl text-white group-hover:text-gold transition-colors">
                          {currency.currency.toUpperCase().replace('TRC20', '').replace('BSC', '')}
                        </p>
                        <div className="h-px w-8 bg-white/10 group-hover:bg-gold/30" />
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                          {currency.network}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setStep('amount')}
                  className="w-full py-4 text-sm font-bold text-white/30 hover:text-white transition-colors"
                >
                  ← رجوع لتعديل المبلغ
                </button>
              </motion.div>
            )}

            {/* Step 3: Payment Details */}
            {step === 'payment' && depositInfo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white">إرسال الدفعة</h3>
                  <p className="text-sm text-white/40">
                    أرسل <span className="text-gold font-black">{depositInfo.payAmount.toFixed(6)}</span> {depositInfo.payCurrency.toUpperCase()}
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 space-y-6">
                  {depositInfo.qrCode && (
                    <div className="flex flex-col items-center gap-3">
                      <div className="bg-white p-3 rounded-2xl">
                        <img
                          src={depositInfo.qrCode}
                          alt="QR Code"
                          className="w-40 h-40"
                        />
                      </div>
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">امسح الكود للدفع الفوري</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">عنوان المحفظة</label>
                      {copied === 'address' && <span className="text-[10px] font-bold text-gold animate-pulse">تم النسخ!</span>}
                    </div>
                    <div 
                      onClick={() => handleCopy(depositInfo.payAddress, 'address')}
                      className="group flex items-center gap-3 bg-black/40 border border-white/5 hover:border-gold/30 rounded-xl p-4 transition-all cursor-pointer"
                    >
                      <div className="flex-1 font-mono text-[10px] break-all text-white/60 leading-relaxed">
                        {depositInfo.payAddress}
                      </div>
                      <div className="p-2 rounded-lg bg-gold/10 text-gold group-hover:bg-gold group-hover:text-black transition-all">
                        <Copy className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl">
                   <p className="text-[10px] text-yellow-500/70 font-bold leading-relaxed">
                    سيتم تحديث رصيدك تلقائياً فور تأكيد الشبكة للمعاملة. قد يستغرق ذلك من 5 إلى 15 دقيقة.
                   </p>
                </div>

                <GoldButton
                  onClick={handleClose}
                  className="w-full py-5 rounded-2xl font-bold"
                >
                  تم الإرسال، أغلق النافذة
                </GoldButton>
              </motion.div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
