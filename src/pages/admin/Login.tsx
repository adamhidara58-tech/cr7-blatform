import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulation of server-side validation with environment variables
      // In a real production app, this would be an API call to a backend
      const adminEmail = `${username}@admin.com`; // Helper to use email for Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: password,
      });

      if (error) {
        // Fallback for demo/development if user doesn't exist in Supabase yet
        const adminUser = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
        const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || 'Nador@2009';
        
        if (username === adminUser && password === adminPass) {
          localStorage.setItem('admin_session', 'true');
          toast.success('تم تسجيل الدخول بنجاح (وضع التطوير)');
          navigate('/admin');
          return;
        }
        throw error;
      }

      if (data.user) {
        localStorage.setItem('admin_session', 'true');
        toast.success('تم تسجيل الدخول بنجاح');
        navigate('/admin');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05),transparent_70%)] pointer-events-none" />
      
      <Card className="w-full max-w-md bg-card/50 backdrop-blur-xl border-border/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-gold" />
        
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold mb-2">
            <ShieldCheck className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-display text-gradient-gold">دخول المسؤول</CardTitle>
          <CardDescription>يرجى إدخال بيانات الاعتماد للوصول إلى لوحة التحكم</CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="اسم المستخدم"
                  className="pl-10 bg-white/5 border-border/50"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="كلمة المرور"
                  className="pl-10 bg-white/5 border-border/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90 transition-opacity font-bold py-6"
              disabled={loading}
            >
              {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
