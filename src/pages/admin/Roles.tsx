import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Plus, Trash2, Shield, ShieldCheck, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const roleIcons: Record<string, React.ElementType> = { super_admin: ShieldCheck, admin: Shield, staff: User };
const roleLabels: Record<string, string> = { super_admin: 'مدير أعلى', admin: 'مدير', staff: 'موظف' };
const roleBadges: Record<string, string> = {
  super_admin: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  admin: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  staff: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const Roles = () => {
  const { user, isSuperAdmin } = useAdminAuth();
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [newRole, setNewRole] = useState<string>('staff');

  const { data: roles, isLoading } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*, profiles(username, email)')
        .in('role', ['super_admin', 'admin', 'staff'])
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isSuperAdmin,
  });

  const addRoleMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      const { data: profile, error: pErr } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle();
      if (pErr || !profile) throw new Error('المستخدم غير موجود');
      if (profile.id === user?.id) throw new Error('لا يمكنك تغيير دورك');
      const { error } = await supabase.from('user_roles').insert({ user_id: profile.id, role: role as any });
      if (error) throw error;
      await supabase.from('activity_logs').insert({ admin_id: user?.id, action: 'ROLE_ASSIGNED', target_id: profile.id, details: { role, email } });
    },
    onSuccess: () => { toast.success('تم إضافة الدور'); queryClient.invalidateQueries({ queryKey: ['admin-roles'] }); setAddOpen(false); setEmail(''); },
    onError: (e: any) => toast.error(e.message),
  });

  const removeRoleMutation = useMutation({
    mutationFn: async (roleId: string) => { const { error } = await supabase.from('user_roles').delete().eq('id', roleId); if (error) throw error; },
    onSuccess: () => { toast.success('تم إزالة الدور'); queryClient.invalidateQueries({ queryKey: ['admin-roles'] }); },
  });

  if (!isSuperAdmin) return <div className="text-center text-zinc-500 py-20">ليس لديك صلاحية الوصول</div>;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">إدارة الأدوار</h2>
          <p className="text-xs sm:text-sm text-zinc-500">تعيين وإزالة صلاحيات الفريق</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="bg-primary text-primary-foreground gap-2 self-start" size="sm">
          <Plus className="w-4 h-4" /> إضافة دور
        </Button>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block rounded-xl border border-white/[0.06] bg-[#0d0d12] overflow-hidden">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-5 py-3 text-xs text-zinc-500 font-medium">المستخدم</th>
              <th className="px-5 py-3 text-xs text-zinc-500 font-medium">الدور</th>
              <th className="px-5 py-3 text-xs text-zinc-500 font-medium text-center">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {isLoading ? (
              [1,2,3].map(i => <tr key={i}><td colSpan={3} className="px-5 py-4 h-14 bg-white/[0.02]" /></tr>)
            ) : roles?.map((r: any) => {
              const RoleIcon = roleIcons[r.role] || User;
              const isSelf = r.user_id === user?.id;
              return (
                <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-white">{r.profiles?.username || 'غير معروف'}</p>
                    <p className="text-xs text-zinc-500">{r.profiles?.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border ${roleBadges[r.role]}`}>
                      <RoleIcon className="w-3 h-3" /> {roleLabels[r.role] || r.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    {!isSelf && (
                      <Button size="sm" variant="ghost" className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-8 w-8 p-0" onClick={() => { if (confirm('إزالة هذا الدور؟')) removeRoleMutation.mutate(r.id); }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-2.5">
        {isLoading ? (
          [1,2,3].map(i => <div key={i} className="h-16 bg-white/[0.03] rounded-xl animate-pulse" />)
        ) : roles?.map((r: any, i: number) => {
          const RoleIcon = roleIcons[r.role] || User;
          const isSelf = r.user_id === user?.id;
          return (
            <motion.div key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="bg-[#0d0d12] border border-white/[0.06] rounded-xl p-3.5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-lg ${roleBadges[r.role].split(' ')[0]}`}>
                  <RoleIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{r.profiles?.username || 'غير معروف'}</p>
                  <p className="text-[10px] text-zinc-500 truncate">{r.profiles?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${roleBadges[r.role]}`}>{roleLabels[r.role]}</span>
                {!isSelf && (
                  <Button size="sm" variant="ghost" className="text-rose-400 h-7 w-7 p-0" onClick={() => { if (confirm('إزالة؟')) removeRoleMutation.mutate(r.id); }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-[#0d0d12] border-white/[0.08] sm:max-w-md mx-4">
          <DialogHeader><DialogTitle className="text-white">إضافة دور جديد</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <Input placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} className="bg-white/[0.04] border-white/[0.08]" dir="ltr" />
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger className="bg-white/[0.04] border-white/[0.08]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">موظف</SelectItem>
                <SelectItem value="admin">مدير</SelectItem>
                <SelectItem value="super_admin">مدير أعلى</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="ghost" onClick={() => setAddOpen(false)}>إلغاء</Button>
            <Button className="bg-primary text-primary-foreground" onClick={() => addRoleMutation.mutate({ email, role: newRole })} disabled={!email || addRoleMutation.isPending}>تعيين الدور</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Roles;
