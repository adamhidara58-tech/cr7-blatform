import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, ExternalLink, QrCode, Wallet, AlertCircle } from 'lucide-react';
import { GoldButton } from '@/components/ui/GoldButton';
import { Input } from '@/components/ui/input';
import { useCryptoPayments } from '@/hooks/useCryptoPayments';
import { toast } from '@/hooks/use-toast';

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

  // All currencies are now supported (only 5 configured)
  const popularCurrencies = currencies;
  const otherCurrencies: typeof currencies = [];

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
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <button onClick={handleClose} className="p-2 hover:bg-secondary rounded-lg">
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-display text-lg">إيداع</h2>
            <div className="w-9" />
          </div>

          <div className="p-4">
            {/* Step 1: Amount */}
            {step === 'amount' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <Wallet className="w-12 h-12 mx-auto text-primary mb-3" />
                  <h3 className="text-lg font-semibold">أدخل مبلغ الإيداع</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    الحد الأدنى: ${minimumDepositUsd}
                  </p>
                </div>

                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-center text-2xl font-bold h-16 pr-12"
                    min={minimumDepositUsd}
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    USD
                  </span>
                </div>

                <div className="flex gap-2">
                  {[10, 50, 100, 500].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAmount(preset.toString())}
                      className="flex-1 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium"
                    >
                      ${preset}
                    </button>
                  ))}
                </div>

                <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    يرجى إرسال المبلغ المطلوب <strong>بالإضافة</strong> إلى رسوم الشبكة لإتمام المعاملة
                  </p>
                </div>

                <GoldButton
                  onClick={handleSubmitAmount}
                  className="w-full"
                  disabled={!amount || parseFloat(amount) < minimumDepositUsd}
                >
                  متابعة
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
                  <h3 className="text-lg font-semibold">اختر العملة</h3>
                  <p className="text-sm text-muted-foreground">إيداع ${amount}</p>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    {popularCurrencies.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">العملات الشائعة</p>
                        <div className="grid grid-cols-2 gap-2">
                          {popularCurrencies.slice(0, 6).map((currency) => (
                            <button
                              key={currency.currency}
                              onClick={() => handleSelectCurrency(currency.currency)}
                              className="p-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border hover:border-primary transition-all text-left"
                            >
                              <p className="font-semibold">{currency.currency.toUpperCase()}</p>
                              <p className="text-xs text-muted-foreground">{currency.network}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {otherCurrencies.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">عملات أخرى</p>
                        <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                          {otherCurrencies.map((currency) => (
                            <button
                              key={currency.currency}
                              onClick={() => handleSelectCurrency(currency.currency)}
                              className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary text-xs font-medium"
                            >
                              {currency.currency.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                <button
                  onClick={() => setStep('amount')}
                  className="w-full py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  رجوع
                </button>
              </motion.div>
            )}

            {/* Step 3: Payment Details */}
            {step === 'payment' && depositInfo && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <h3 className="text-lg font-semibold">إرسال الدفعة</h3>
                  <p className="text-sm text-muted-foreground">
                    أرسل {depositInfo.payAmount} {depositInfo.payCurrency}
                  </p>
                </div>

                {/* QR Code */}
                {depositInfo.qrCode && (
                  <div className="flex justify-center">
                    <div className="bg-white p-3 rounded-xl">
                      <img
                        src={depositInfo.qrCode}
                        alt="QR Code"
                        className="w-40 h-40"
                      />
                    </div>
                  </div>
                )}

                {/* Wallet Address */}
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">عنوان المحفظة</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-secondary rounded-lg p-3 text-sm font-mono break-all">
                      {depositInfo.payAddress}
                    </div>
                    <button
                      onClick={() => handleCopy(depositInfo.payAddress, 'address')}
                      className="p-3 bg-primary text-primary-foreground rounded-lg"
                    >
                      {copied === 'address' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">المبلغ</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-secondary rounded-lg p-3 text-lg font-bold">
                      {depositInfo.payAmount} {depositInfo.payCurrency}
                    </div>
                    <button
                      onClick={() => handleCopy(depositInfo.payAmount.toString(), 'amount')}
                      className="p-3 bg-primary text-primary-foreground rounded-lg"
                    >
                      {copied === 'amount' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Warning */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-500">مهم!</p>
                    <p className="text-muted-foreground">
                      أرسل المبلغ المحدد فقط. سيتم تحديث رصيدك تلقائياً بعد تأكيد الشبكة.
                    </p>
                  </div>
                </div>

                {/* Estimated time */}
                <p className="text-xs text-center text-muted-foreground">
                  ⏱️ الوقت المقدر للتأكيد: 10-30 دقيقة
                </p>

                {depositInfo.invoiceUrl && (
                  <a
                    href={depositInfo.invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    فتح صفحة الدفع
                  </a>
                )}

                <GoldButton onClick={handleClose} variant="secondary" className="w-full">
                  تم
                </GoldButton>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
