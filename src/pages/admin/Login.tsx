import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Lock, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .in('role', ['super_admin', 'admin', 'staff'])
            .maybeSingle();
          if (data) {
            navigate('/admin');
            return;
          }
        }
      } catch {} finally {
        setCheckingAuth(false);
      }
    };
    check();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error('فشل تسجيل الدخول');

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .in('role', ['super_admin', 'admin', 'staff'])
        .maybeSingle();

      if (!roleData) {
        await supabase.auth.signOut();
        throw new Error('ليس لديك صلاحيات الوصول');
      }

      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/admin');
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#060608] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060608] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(212,175,55,0.04),transparent_60%)] pointer-events-none" />
      
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4">
            <ShieldCheck className="w-7 h-7 text-black" />
          </div>
          <h1 className="text-xl font-bold text-white">لوحة التحكم</h1>
          <p className="text-sm text-zinc-500 mt-1">أدخل بياناتك للوصول</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
            <Input
              type="email"
              placeholder="البريد الإلكتروني"
              className="pl-10 bg-white/[0.04] border-white/[0.08] h-11 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              dir="ltr"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
            <Input
              type="password"
              placeholder="كلمة المرور"
              className="pl-10 bg-white/[0.04] border-white/[0.08] h-11 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              dir="ltr"
            />
          </div>
          <Button 
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold h-11 hover:opacity-90"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'دخول'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
