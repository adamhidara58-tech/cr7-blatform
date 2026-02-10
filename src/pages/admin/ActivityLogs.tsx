import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  History, 
  User, 
  Settings, 
  ArrowDownCircle,
  Zap,
  XCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ActivityLog {
  id: string;
  admin_id: string | null;
  action: string;
  target_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
  profiles?: {
    username: string;
  } | null;
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
    if (action.includes('USER')) return <User className="w-4 h-4 text-blue-500" />;
    if (action.includes('APPROVED') || action.includes('SUCCESS')) return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    if (action.includes('REJECTED') || action.includes('FAILED') || action.includes('ERROR')) return <XCircle className="w-4 h-4 text-rose-500" />;
    if (action.includes('RETRY')) return <RefreshCw className="w-4 h-4 text-amber-500" />;
    if (action.includes('AUTO')) return <Zap className="w-4 h-4 text-blue-500" />;
    if (action.includes('WITHDRAWAL') || action.includes('PAYOUT')) return <ArrowDownCircle className="w-4 h-4 text-amber-500" />;
    if (action.includes('SETTINGS')) return <Settings className="w-4 h-4 text-primary" />;
    return <History className="w-4 h-4 text-muted-foreground" />;
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'USER_UPDATE': 'تحديث مستخدم',
      'WITHDRAWAL_APPROVED': 'موافقة على سحب',
      'WITHDRAWAL_REJECTED': 'رفض سحب',
      'WITHDRAWAL_ERROR': 'خطأ في السحب',
      'WITHDRAWAL_RETRY_SUCCESS': 'نجاح إعادة المحاولة',
      'WITHDRAWAL_RETRY_FAILED': 'فشل إعادة المحاولة',
      'MASS_PAYOUT': 'دفع جماعي',
      'AUTO_PAYOUT_SUCCESS': 'دفع تلقائي ناجح',
      'AUTO_PAYOUT_FAILED': 'فشل دفع تلقائي'
    };
    return labels[action] || action;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gradient-gold mb-2">سجل النشاطات</h2>
        <p className="text-muted-foreground">تتبع جميع العمليات التي تمت على النظام</p>
      </div>

      <div className="glass-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border/50 bg-white/5">
                <th className="px-6 py-4 text-sm font-semibold">المسؤول</th>
                <th className="px-6 py-4 text-sm font-semibold">العملية</th>
                <th className="px-6 py-4 text-sm font-semibold">التفاصيل</th>
                <th className="px-6 py-4 text-sm font-semibold">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-6 py-4 h-16 bg-white/5" />
                  </tr>
                ))
              ) : logs?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    لا توجد سجلات حالياً
                  </td>
                </tr>
              ) : (
                logs?.map((log) => (
                  <motion.tr 
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium">{log.profiles?.username || 'نظام'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className="text-xs font-bold">{getActionLabel(log.action)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <pre className="text-[10px] text-muted-foreground bg-black/20 p-2 rounded overflow-hidden max-w-[300px] truncate">
                        {JSON.stringify(log.details)}
                      </pre>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString("en-US")}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;
