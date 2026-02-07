import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, LogIn, Eye, EyeOff, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { GoldButton } from '@/components/ui/GoldButton';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import logoNew from '@/assets/logo-new.png';

const signUpSchema = z.object({
  username: z.string().trim().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل').max(50, 'الاسم طويل جداً'),
  email: z.string().trim().email('البريد الإلكتروني غير صالح').max(255, 'البريد الإلكتروني طويل جداً'),
  password: z.string().min(6, 'كلمة السر يجب أن تكون 6 أحرف على الأقل').max(100, 'كلمة السر طويلة جداً'),
  referralCode: z.string().max(20, 'رمز الإحالة غير صالح').optional().or(z.literal('')),
});

const signInSchema = z.object({
  email: z.string().trim().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(1, 'كلمة السر مطلوبة'),
});

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  
  // Form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState(searchParams.get('ref') || '');
  
  const { signUp, signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Validate signup data
        const validation = signUpSchema.safeParse({ username, email, password, referralCode });
        if (!validation.success) {
          toast({
            title: 'خطأ في البيانات',
            description: validation.error.errors[0].message,
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(email.trim(), password, username.trim(), referralCode.trim() || undefined);
        
        if (error) {
          let message = 'حدث خطأ أثناء إنشاء الحساب';
          if (error.message?.includes('already registered')) {
            message = 'البريد الإلكتروني مسجل مسبقاً';
          } else if (error.message?.includes('Invalid email')) {
            message = 'البريد الإلكتروني غير صالح';
          } else if (error.message?.includes('Password')) {
            message = 'كلمة السر ضعيفة جداً';
          }
          toast({
            title: 'خطأ',
            description: message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'تم إنشاء الحساب بنجاح! 🎉',
            description: 'تم إرسال رابط التأكيد إلى بريدك الإلكتروني',
          });
        }
      } else {
        // Validate signin data
        const validation = signInSchema.safeParse({ email, password });
        if (!validation.success) {
          toast({
            title: 'خطأ في البيانات',
            description: validation.error.errors[0].message,
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        const { error } = await signIn(email.trim(), password);
        
        if (error) {
          let message = 'حدث خطأ أثناء تسجيل الدخول';
          if (error.message?.includes('Invalid login')) {
            message = 'البريد الإلكتروني أو كلمة السر غير صحيحة';
          } else if (error.message?.includes('Email not confirmed')) {
            message = 'يرجى تأكيد بريدك الإلكتروني أولاً';
          }
          toast({
            title: 'خطأ',
            description: message,
            variant: 'destructive',
          });
        }
      }
    } catch (err) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ غير متوقع',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-gold/30">
      {/* Header */}
      <div className="pt-12 pb-8 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-24 h-24 rounded-full bg-[#141419] border border-gold/20 flex items-center justify-center shadow-[0_0_30px_-5px_hsla(45,63%,53%,0.3)] overflow-hidden">
            <img src={logoNew} alt="CR7 Logo" className="w-full h-full object-cover scale-110" />
          </div>
          <div>
            <h1 className="font-bold text-4xl text-gradient-gold tracking-tight">CR7 ELITE</h1>
            <p className="text-white/40 text-sm mt-2 font-medium">منصة النخبة للربح</p>
          </div>
        </motion.div>
      </div>

      {/* Form Card */}
      <div className="flex-1 px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="glass-card border border-white/5 rounded-[2.5rem] p-7 max-w-md mx-auto"
        >
          {/* Tabs */}
          <div className="flex p-1.5 bg-black/40 rounded-2xl mb-8 border border-white/5">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-3 rounded-xl font-bold transition-all duration-500 flex items-center justify-center gap-2 ${
                !isSignUp 
                  ? 'bg-gradient-gold text-primary-foreground shadow-gold scale-[1.02]' 
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <LogIn className="w-4 h-4" />
              تسجيل الدخول
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-3 rounded-xl font-bold transition-all duration-500 flex items-center justify-center gap-2 ${
                isSignUp 
                  ? 'bg-gradient-gold text-primary-foreground shadow-gold scale-[1.02]' 
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              حساب جديد
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="relative group">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-gold transition-colors" />
                <Input
                  type="text"
                  placeholder="اسم المستخدم"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pr-12 text-right bg-black/20 border-white/5 h-14 rounded-2xl focus:border-gold/30 focus:ring-gold/20 transition-all"
                  dir="rtl"
                  required
                  minLength={3}
                  maxLength={50}
                />
              </div>
            )}

            <div className="relative group">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-gold transition-colors" />
              <Input
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pr-12 text-right bg-black/20 border-white/5 h-14 rounded-2xl focus:border-gold/30 focus:ring-gold/20 transition-all"
                dir="rtl"
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-gold transition-colors" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="كلمة السر"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-12 pl-12 text-right bg-black/20 border-white/5 h-14 rounded-2xl focus:border-gold/30 focus:ring-gold/20 transition-all"
                dir="rtl"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-gold transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {isSignUp && (
              <div className="relative group">
                <Users className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-gold transition-colors" />
                <Input
                  type="text"
                  placeholder="رمز الإحالة (اختياري)"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className="pr-12 text-right bg-black/20 border-white/5 h-14 rounded-2xl focus:border-gold/30 focus:ring-gold/20 transition-all"
                  dir="rtl"
                  maxLength={20}
                />
              </div>
            )}

            <GoldButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full h-14 mt-4 rounded-2xl font-bold text-lg shadow-[0_10px_20px_-5px_rgba(212,175,55,0.3)]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : isSignUp ? (
                <span className="flex items-center justify-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  إنشاء حساب جديد
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn className="w-5 h-5" />
                  تسجيل الدخول
                </span>
              )}
            </GoldButton>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-white/30 mt-8 font-medium">
            {isSignUp ? (
              <>بإنشاء حساب، أنت توافق على شروط الاستخدام وسياسة الخصوصية</>
            ) : (
              <>مرحباً بك مجدداً في منصة النخبة</>
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
