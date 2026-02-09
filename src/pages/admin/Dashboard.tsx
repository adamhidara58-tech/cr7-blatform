import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Wallet, 
  Clock, 
  TrendingUp, 
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card p-6 rounded-2xl border border-border/50 relative overflow-hidden group"
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-muted-foreground text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-foreground">{value}</h3>
      </div>
      <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
        <Icon className="w-6 h-6" />
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center gap-2">
        <span className={`flex items-center text-xs font-medium ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3 ml-1" /> : <ArrowDownRight className="w-3 h-3 ml-1" />}
          {trendValue}%
        </span>
        <span className="text-muted-foreground text-[10px]">مقارنة بالشهر الماضي</span>
      </div>
    )}
    <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
  </motion.div>
);

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [
        { count: totalUsers },
        { data: balanceData },
        { count: pendingWithdrawals },
        { data: recentWithdrawals }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('balance'),
        supabase.from('crypto_withdrawals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('crypto_withdrawals').select('amount_usd, created_at').order('created_at', { ascending: false }).limit(30)
      ]);

      const totalBalance = balanceData?.reduce((acc, curr) => acc + Number(curr.balance), 0) || 0;

      return {
        totalUsers: totalUsers || 0,
        totalBalance,
        pendingWithdrawals: pendingWithdrawals || 0,
        recentWithdrawals: recentWithdrawals || []
      };
    }
  });

  // Sample data for charts
  const chartData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 2000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 },
    { name: 'Jul', value: 3490 },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl" />)}
        </div>
        <div className="h-[400px] bg-white/5 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gradient-gold mb-2">نظرة عامة</h2>
        <p className="text-muted-foreground">مرحباً بك في لوحة تحكم النظام</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="إجمالي المستخدمين" 
          value={stats?.totalUsers.toLocaleString()} 
          icon={Users} 
          trend="up" 
          trendValue="12"
          delay={0.1}
        />
        <StatCard 
          title="الرصيد الإجمالي" 
          value={`$${stats?.totalBalance.toLocaleString()}`} 
          icon={Wallet} 
          trend="up" 
          trendValue="8"
          delay={0.2}
        />
        <StatCard 
          title="طلبات السحب المعلقة" 
          value={stats?.pendingWithdrawals} 
          icon={Clock} 
          trend={stats?.pendingWithdrawals && stats.pendingWithdrawals > 5 ? 'up' : 'down'} 
          trendValue="5"
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6 rounded-2xl border border-border/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              أرصدة المستخدمين (تقديري)
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20', borderRadius: '8px' }}
                  itemStyle={{ color: '#D4AF37' }}
                />
                <Area type="monotone" dataKey="value" stroke="#D4AF37" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6 rounded-2xl border border-border/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2">
              <ArrowDownRight className="w-5 h-5 text-rose-500" />
              طلبات السحب اليومية
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20', borderRadius: '8px' }}
                  cursor={{ fill: '#ffffff05' }}
                />
                <Bar dataKey="value" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
