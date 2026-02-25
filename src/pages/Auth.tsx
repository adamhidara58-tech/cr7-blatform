import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, LogIn, Eye, EyeOff, Users, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

// ── Validation Schemas ──
const signUpSchema = z.object({
  username: z.string().trim().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل').max(50, 'الاسم طويل جداً'),
  email: z.string().trim().email('البريد الإلكتروني غير صالح').max(255, 'البريد الإلكتروني طويل جداً'),
  password: z.string().min(6, 'كلمة السر يجب أن تكون 6 أحرف على الأقل').max(100, 'كلمة السر طويلة جداً'),
  referralCode: z.string().trim().min(1, 'رمز الإحالة مطلوب').max(20, 'رمز الإحالة غير صالح'),
});
const signInSchema = z.object({
  email: z.string().trim().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(1, 'كلمة السر مطلوبة'),
});

// ── Floating Gold Particles (lightweight CSS-only) ──
const GoldParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 12 }).map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full opacity-20"
        style={{
          width: `${2 + Math.random() * 3}px`,
          height: `${2 + Math.random() * 3}px`,
          background: 'hsl(var(--gold))',
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `float ${4 + Math.random() * 4}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 4}s`,
        }}
      />
    ))}
  </div>
);

// ── Premium Input Field ──
const PremiumInput = ({
  icon: Icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  required,
  minLength,
  maxLength,
  endIcon,
}: {
  icon: React.ElementType;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  endIcon?: React.ReactNode;
}) => (
  <div className="relative group">
    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground/50 group-focus-within:text-primary transition-colors duration-300" />
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      minLength={minLength}
      maxLength={maxLength}
      dir="ltr"
      className="w-full h-14 pl-12 pr-12 bg-background/60 border border-border/30 rounded-[20px] text-foreground text-sm placeholder:text-muted-foreground/40 outline-none transition-all duration-300 focus:border-primary/40 focus:shadow-[0_0_20px_-8px_hsl(var(--gold)/0.25)] focus:bg-background/80"
    />
    {endIcon && (
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        {endIcon}
      </div>
    )}
  </div>
);

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState(searchParams.get('ref') || '');

  const { signUp, signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && user) navigate('/', { replace: true });
  }, [user, loading, navigate]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isSignUp) {
        const v = signUpSchema.safeParse({ username, email, password, referralCode });
        if (!v.success) {
          toast({ title: 'خطأ في البيانات', description: v.error.errors[0].message, variant: 'destructive' });
          setIsLoading(false);
          return;
        }
        const { error } = await signUp(email.trim(), password, username.trim(), referralCode.trim() || undefined);
        if (error) {
          let msg = 'حدث خطأ أثناء إنشاء الحساب';
          if (error.message?.includes('already registered')) msg = 'البريد الإلكتروني مسجل مسبقاً';
          else if (error.message?.includes('Invalid email')) msg = 'البريد الإلكتروني غير صالح';
          else if (error.message?.includes('Password')) msg = 'كلمة السر ضعيفة جداً';
          toast({ title: 'خطأ', description: msg, variant: 'destructive' });
        } else {
          toast({ title: 'تم إنشاء الحساب بنجاح! 🎉', description: 'مرحباً بك في منصة CR7 ELITE!' });
        }
      } else {
        const v = signInSchema.safeParse({ email, password });
        if (!v.success) {
          toast({ title: 'خطأ في البيانات', description: v.error.errors[0].message, variant: 'destructive' });
          setIsLoading(false);
          return;
        }
        const { error } = await signIn(email.trim(), password);
        if (error) {
          let msg = 'حدث خطأ أثناء تسجيل الدخول';
          if (error.message?.includes('Invalid login')) msg = 'البريد الإلكتروني أو كلمة السر غير صحيحة';
          else if (error.message?.includes('Email not confirmed')) msg = 'يرجى تأكيد بريدك الإلكتروني أولاً';
          toast({ title: 'خطأ', description: msg, variant: 'destructive' });
        }
      }
    } catch {
      toast({ title: 'خطأ', description: 'حدث خطأ غير متوقع', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [isSignUp, username, email, password, referralCode, signUp, signIn, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden selection:bg-primary/30 px-4 py-8">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsla(45,63%,53%,0.06),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsla(45,63%,53%,0.03),transparent_50%)] pointer-events-none" />
      <GoldParticles />

      {/* Logo & Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-5 mb-8"
      >
        {/* Logo Circle with Halo */}
        <div className="relative">
          <div className="absolute inset-[-12px] rounded-full bg-primary/10 blur-xl animate-pulse" />
          <div className="relative w-28 h-28 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center shadow-[0_0_40px_-10px_hsl(var(--gold)/0.3)]">
            <span className="text-foreground font-black text-[38px] leading-none tracking-[2px] select-none">
              CR7
            </span>
          </div>
        </div>

        <div className="text-center">
          <h1 className="font-bold text-4xl sm:text-5xl text-gradient-gold tracking-tight">
            CR7 ELITE
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-muted-foreground text-sm mt-2 font-medium"
          >
            منصة النخبة للاستثمار الذكي
          </motion.p>
        </div>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] relative"
      >
        {/* Card glow */}
        <div className="absolute -inset-1 rounded-[32px] bg-primary/5 blur-2xl pointer-events-none" />

        <div className="relative glass-card border border-border/20 rounded-[28px] p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] gold-glow">
          {/* Gold top line */}
          <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          {/* Tabs */}
          <div className="flex p-1 bg-background/60 rounded-[20px] mb-7 border border-border/20">
            {[
              { key: false, label: 'تسجيل الدخول', icon: LogIn },
              { key: true, label: 'حساب جديد', icon: UserPlus },
            ].map((tab) => (
              <button
                key={String(tab.key)}
                onClick={() => setIsSignUp(tab.key)}
                className={`flex-1 py-3 rounded-[16px] font-bold text-sm transition-all duration-400 flex items-center justify-center gap-2 ${
                  isSignUp === tab.key
                    ? 'bg-gradient-gold text-primary-foreground shadow-[0_4px_20px_-6px_hsl(var(--gold)/0.4)]'
                    : 'text-muted-foreground hover:text-foreground/70'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  key="username"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <PremiumInput
                    icon={User}
                    placeholder="اسم المستخدم"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={3}
                    maxLength={50}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <PremiumInput
              icon={Mail}
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <PremiumInput
              icon={Lock}
              type={showPassword ? 'text' : 'password'}
              placeholder="كلمة السر"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              endIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground/40 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              }
            />

            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  key="referral"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <PremiumInput
                    icon={Users}
                    placeholder="رمز الإحالة (إجباري)"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    required
                    maxLength={20}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={isLoading ? {} : { scale: 1.015 }}
              whileTap={isLoading ? {} : { scale: 0.97 }}
              className="relative w-full h-14 mt-2 rounded-[20px] font-bold text-base bg-gradient-gold text-primary-foreground shadow-[0_8px_30px_-8px_hsl(var(--gold)/0.4)] overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isLoading && (
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
              )}
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : isSignUp ? (
                  <>
                    <UserPlus className="w-5 h-5" />
                    إنشاء حساب جديد
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    تسجيل الدخول
                  </>
                )}
              </span>
            </motion.button>
          </form>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 mt-5 text-muted-foreground/40 text-xs">
            <Shield className="w-3.5 h-3.5" />
            <span>بياناتك محمية بتشفير متقدم</span>
          </div>

          {/* Motivational Text */}
          <p className="text-center text-xs text-muted-foreground/30 mt-4 leading-relaxed font-medium">
            {isSignUp
              ? 'انضم إلى مجتمع النخبة وابدأ رحلتك نحو الحرية المالية'
              : 'مرحباً بك مجدداً في نادي النخبة'}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
