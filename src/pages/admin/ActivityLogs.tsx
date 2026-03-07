import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  History, User, Settings, ArrowDownCircle, Zap, XCircle, CheckCircle, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ActivityLog {
  id: string;
  admin_id: string | null;
  action: string;
  target_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
  profiles?: { username: string } | null;
}

const ActivityLogs = () => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['admin-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*, profiles(username)')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as ActivityLog[];
    }
  });

  const getActionIcon = (action: string) => {
    if (action.includes('USER')) return <User className="w-4 h-4 text-blue-400" />;
    if (action.includes('APPROVED') || action.includes('SUCCESS') || action.includes('COMPLETED')) return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    if (action.includes('REJECTED') || action.includes('FAILED') || action.includes('ERROR')) return <XCircle className="w-4 h-4 text-rose-400" />;
    if (action.includes('RETRY')) return <RefreshCw className="w-4 h-4 text-amber-400" />;
    if (action.includes('AUTO')) return <Zap className="w-4 h-4 text-blue-400" />;
    if (action.includes('WITHDRAWAL') || action.includes('PAYOUT')) return <ArrowDownCircle className="w-4 h-4 text-amber-400" />;
    if (action.includes('SETTINGS') || action.includes('ROLE')) return <Settings className="w-4 h-4 text-zinc-400" />;
    return <History className="w-4 h-4 text-zinc-500" />;
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'USER_UPDATE': 'تحديث مستخدم',
      'WITHDRAWAL_APPROVED': 'موافقة سحب',
      'WITHDRAWAL_REJECTED': 'رفض سحب',
      'WITHDRAWAL_COMPLETED': 'قبول سحب',
      'WITHDRAWAL_PENDING': 'إعادة للمراجعة',
      'ROLE_ASSIGNED': 'تعيين دور',
      'MASS_PAYOUT': 'دفع جماعي',
    };
    return labels[action] || action;
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">سجل النشاطات</h2>
        <p className="text-xs sm:text-sm text-zinc-500">تتبع جميع العمليات على النظام</p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl border border-white/[0.06] bg-[#0d0d12] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="px-5 py-3 text-xs text-zinc-500 font-medium">المسؤول</th>
                <th className="px-5 py-3 text-xs text-zinc-500 font-medium">العملية</th>
                <th className="px-5 py-3 text-xs text-zinc-500 font-medium">التفاصيل</th>
                <th className="px-5 py-3 text-xs text-zinc-500 font-medium">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {isLoading ? (
                [1,2,3,4,5].map(i => <tr key={i}><td colSpan={4} className="px-5 py-4 h-14 bg-white/[0.02]" /></tr>)
              ) : logs?.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-12 text-center text-zinc-500">لا توجد سجلات</td></tr>
              ) : logs?.map((log) => (
                <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-sm text-white">{log.profiles?.username || 'نظام'}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action)}
                      <span className="text-xs font-medium text-zinc-300">{getActionLabel(log.action)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <pre className="text-[10px] text-zinc-500 bg-white/[0.02] p-1.5 rounded max-w-[280px] truncate">{JSON.stringify(log.details)}</pre>
                  </td>
                  <td className="px-5 py-3 text-xs text-zinc-500">{new Date(log.created_at).toLocaleString("en-US")}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-2.5">
        {isLoading ? (
          [1,2,3,4].map(i => <div key={i} className="h-20 bg-white/[0.03] rounded-xl animate-pulse" />)
        ) : logs?.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-sm">لا توجد سجلات</div>
        ) : logs?.map((log, i) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            className="bg-[#0d0d12] border border-white/[0.06] rounded-xl p-3.5 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getActionIcon(log.action)}
                <span className="text-xs font-medium text-zinc-300">{getActionLabel(log.action)}</span>
              </div>
              <span className="text-[10px] text-zinc-500">{new Date(log.created_at).toLocaleDateString('en-US')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">{log.profiles?.username || 'نظام'}</span>
              <span className="text-[10px] text-zinc-600">{new Date(log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            {log.details && Object.keys(log.details).length > 0 && (
              <pre className="text-[9px] text-zinc-600 bg-white/[0.02] p-1.5 rounded overflow-x-auto">{JSON.stringify(log.details, null, 1)}</pre>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ActivityLogs;
