import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, Wallet, Clock, TrendingUp, ArrowUpRight, ArrowDownRight,
  DollarSign, Activity, Star
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const StatCard = ({ title, value, icon: Icon, subtitle, color, delay }: {
  title: string; value: string | number; icon: React.ElementType;
  subtitle?: string; color: string; delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#0d0d12] p-3 sm:p-5"
  >
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-[10px] sm:text-xs font-medium text-zinc-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-lg sm:text-2xl font-bold text-white">{value}</h3>
        {subtitle && <p className="text-[10px] text-zinc-500 hidden sm:block">{subtitle}</p>}
      </div>
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className={`absolute bottom-0 left-0 right-0 h-[2px] ${color.replace('bg-', 'bg-').replace('/10', '/30')}`} />
  </motion.div>
);

const Dashboard = () => {
  const { role } = useAdminAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const [
        { count: totalUsers },
        { data: balanceData },
        { count: pendingWithdrawals },
        { data: allWithdrawals },
        { data: recentDeposits },
        { data: vipData }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('balance, total_earned, vip_level'),
        supabase.from('crypto_withdrawals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('crypto_withdrawals').select('amount_usd, status, created_at').order('created_at', { ascending: false }),
        supabase.from('crypto_deposits').select('amount_usd, payment_status, created_at').order('created_at', { ascending: false }),
        supabase.from('profiles').select('vip_level'),
      ]);

      const totalBalance = balanceData?.reduce((acc, c) => acc + Number(c.balance), 0) || 0;
      const totalEarned = balanceData?.reduce((acc, c) => acc + Number(c.total_earned), 0) || 0;
      const totalPaid = allWithdrawals?.filter(w => w.status === 'completed').reduce((acc, c) => acc + Number(c.amount_usd), 0) || 0;
      const totalDeposited = recentDeposits?.filter(d => d.payment_status === 'confirmed' || d.payment_status === 'finished').reduce((acc, c) => acc + Number(c.amount_usd), 0) || 0;

      // VIP distribution
      const vipDist = [0, 1, 2, 3, 4, 5].map(level => ({
        name: `VIP ${level}`,
        value: vipData?.filter(v => Number(v.vip_level) === level).length || 0,
      }));

      // Daily withdrawals (last 7 days)
      const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const key = d.toISOString().split('T')[0];
        const dayWithdrawals = allWithdrawals?.filter(w => w.created_at.startsWith(key)) || [];
        return {
          name: d.toLocaleDateString('ar-SA', { weekday: 'short' }),
          withdrawals: dayWithdrawals.reduce((acc, w) => acc + Number(w.amount_usd), 0),
          deposits: recentDeposits?.filter(dep => dep.created_at.startsWith(key)).reduce((acc, dep) => acc + Number(dep.amount_usd), 0) || 0,
        };
      });

      return {
        totalUsers: totalUsers || 0,
        totalBalance,
        totalEarned,
        totalPaid,
        totalDeposited,
        pendingWithdrawals: pendingWithdrawals || 0,
        vipDistribution: vipDist,
        dailyChart: last7,
      };
    },
    refetchInterval: 30000,
  });

  const VIP_COLORS = ['#6b7280', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 rounded-xl bg-white/[0.03]" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-80 rounded-xl bg-white/[0.03]" />
          <div className="h-80 rounded-xl bg-white/[0.03]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6" dir="rtl">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="المستخدمين" value={stats?.totalUsers.toLocaleString() || '0'} icon={Users} color="bg-blue-500/10 text-blue-400" delay={0} />
        <StatCard title="الإيداعات" value={`$${(stats?.totalDeposited || 0).toLocaleString()}`} icon={TrendingUp} color="bg-emerald-500/10 text-emerald-400" delay={0.05} />
        <StatCard title="المدفوعات" value={`$${(stats?.totalPaid || 0).toLocaleString()}`} icon={DollarSign} color="bg-amber-500/10 text-amber-400" delay={0.1} />
        <StatCard title="سحب معلق" value={stats?.pendingWithdrawals || 0} icon={Clock} color="bg-rose-500/10 text-rose-400" delay={0.15} subtitle="بحاجة لمراجعة" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 rounded-xl border border-white/[0.06] bg-[#0d0d12] p-4 sm:p-5">
          <h3 className="text-xs sm:text-sm font-medium text-zinc-400 mb-3 sm:mb-4">الإيداعات والسحوبات (7 أيام)</h3>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.dailyChart} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff15', borderRadius: '8px', fontSize: '11px' }} itemStyle={{ color: '#fff' }} />
                <Bar dataKey="deposits" name="إيداعات" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="withdrawals" name="سحوبات" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-xl border border-white/[0.06] bg-[#0d0d12] p-4 sm:p-5">
          <h3 className="text-xs sm:text-sm font-medium text-zinc-400 mb-3 sm:mb-4">توزيع VIP</h3>
          <div className="h-40 sm:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats?.vipDistribution} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" stroke="none">
                  {stats?.vipDistribution.map((_, i) => (<Cell key={i} fill={VIP_COLORS[i]} />))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff15', borderRadius: '8px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {stats?.vipDistribution.map((v, i) => (
              <span key={i} className="text-[10px] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: VIP_COLORS[i] }} />
                {v.name}: {v.value}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border border-white/[0.06] bg-[#0d0d12] p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-zinc-500 mb-1">الأرصدة</p>
          <p className="text-sm sm:text-lg font-bold text-white">${(stats?.totalBalance || 0).toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-[#0d0d12] p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-zinc-500 mb-1">الأرباح</p>
          <p className="text-sm sm:text-lg font-bold text-white">${(stats?.totalEarned || 0).toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-[#0d0d12] p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-zinc-500 mb-1">صافي المنصة</p>
          <p className="text-sm sm:text-lg font-bold text-emerald-400">${((stats?.totalDeposited || 0) - (stats?.totalPaid || 0)).toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-[#0d0d12] p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-zinc-500 mb-1">الدور</p>
          <p className="text-sm sm:text-lg font-bold text-amber-400">{role === 'super_admin' ? 'مدير أعلى' : role === 'admin' ? 'مدير' : 'موظف'}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
