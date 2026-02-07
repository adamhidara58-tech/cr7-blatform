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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState(searchParams.get('ref') || '');
  
  const { signUp, signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log('Auth Page: Mounted, User:', user?.id, 'Loading:', loading);
    if (!loading && user) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isSignUp) {
        const validation = signUpSchema.safeParse({ username, email, password, referralCode });
        if (!validation.success) {
          toast({ title: 'خطأ', description: validation.error.errors[0].message, variant: 'destructive' });
          setIsSubmitting(false);
          return;
        }
        const { error } = await signUp(email.trim(), password, username.trim(), referralCode.trim() || undefined);
        if (error) {
          toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'نجاح', description: 'تم إنشاء الحساب بنجاح' });
        }
      } else {
        const validation = signInSchema.safeParse({ email, password });
        if (!validation.success) {
          toast({ title: 'خطأ', description: validation.error.errors[0].message, variant: 'destructive' });
          setIsSubmitting(false);
          return;
        }
        const { error } = await signIn(email.trim(), password);
        if (error) {
          toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
        }
      }
    } catch (err) {
      toast({ title: 'خطأ', description: 'حدث خطأ غير متوقع', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // We remove the loading check here to force the UI to render
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col selection:bg-gold/30">
      <div className="pt-12 pb-8 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-[#141419] border border-gold/20 flex items-center justify-center shadow-gold overflow-hidden">
            <img src={logoNew} alt="CR7 Logo" className="w-full h-full object-cover scale-110" />
          </div>
          <h1 className="font-bold text-4xl text-gradient-gold tracking-tight">CR7 ELITE</h1>
        </motion.div>
      </div>

      <div className="flex-1 px-4 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card border border-white/5 rounded-[2.5rem] p-7 max-w-md mx-auto">
          <div className="flex p-1.5 bg-black/40 rounded-2xl mb-8 border border-white/5">
            <button onClick={() => setIsSignUp(false)} className={`flex-1 py-3 rounded-xl font-bold ${!isSignUp ? 'bg-gradient-gold text-black' : 'text-white/40'}`}>تسجيل الدخول</button>
            <button onClick={() => setIsSignUp(true)} className={`flex-1 py-3 rounded-xl font-bold ${isSignUp ? 'bg-gradient-gold text-black' : 'text-white/40'}`}>حساب جديد</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <Input placeholder="اسم المستخدم" value={username} onChange={(e) => setUsername(e.target.value)} className="bg-black/20 border-white/5 h-14 rounded-2xl" required />
            )}
            <Input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-black/20 border-white/5 h-14 rounded-2xl" required />
            <Input type={showPassword ? 'text' : 'password'} placeholder="كلمة السر" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-black/20 border-white/5 h-14 rounded-2xl" required />
            
            <GoldButton type="submit" variant="primary" size="lg" className="w-full h-14 mt-4 rounded-2xl font-bold" disabled={isSubmitting}>
              {isSubmitting ? "جاري..." : isSignUp ? "إنشاء حساب" : "تسجيل الدخول"}
            </GoldButton>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
