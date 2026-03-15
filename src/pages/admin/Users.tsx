import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users as UsersIcon, Search, Edit2, Plus, Minus,
  Trophy, Activity, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

const Users = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [balanceChange, setBalanceChange] = useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: any }) => {
      const { error } = await supabase.from('profiles').update(updates).eq('id', id);
      if (error) throw error;
      const { data: { session } } = await supabase.auth.getSession();
      await supabase.from('activity_logs').insert({
        admin_id: session?.user?.id || null,
        action: 'USER_UPDATE',
        target_id: id,
        details: updates
      });
    },
    onSuccess: () => {
      toast.success('تم تحديث بيانات المستخدم بنجاح');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditDialogOpen(false);
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('تم حذف المستخدم بنجاح');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });

  const filteredUsers = users?.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateBalance = (type: 'add' | 'subtract') => {
    if (!balanceChange || isNaN(Number(balanceChange))) {
      toast.error('يرجى إدخال مبلغ صحيح');
      return;
    }
    const amount = Number(balanceChange);
    const finalAmount = type === 'add' ? amount : -amount;
    const newBalance = Number(selectedUser.balance) + finalAmount;
    updateProfileMutation.mutate({ id: selectedUser.id, updates: { balance: newBalance } });
    supabase.from('transactions').insert({
      user_id: selectedUser.id,
      type: type === 'add' ? 'deposit' : 'withdrawal',
      amount: finalAmount,
      description: `تعديل رصيد من قبل الإدارة: ${type === 'add' ? 'إضافة' : 'خصم'}`,
      status: 'completed'
    }).then();
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">إدارة المستخدمين</h2>
          <p className="text-xs sm:text-sm text-zinc-500">تعديل الأرصدة، مستويات VIP، وحالات المهام</p>
        </div>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            placeholder="بحث عن مستخدم..." 
            className="pr-10 w-full sm:w-[260px] bg-white/[0.04] border-white/[0.08] rounded-xl text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl border border-white/[0.06] bg-[#0d0d12] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="px-5 py-3 text-xs text-zinc-500 font-medium">المستخدم</th>
                <th className="px-5 py-3 text-xs text-zinc-500 font-medium">الرصيد</th>
                <th className="px-5 py-3 text-xs text-zinc-500 font-medium">VIP</th>
                <th className="px-5 py-3 text-xs text-zinc-500 font-medium">المهام</th>
                <th className="px-5 py-3 text-xs text-zinc-500 font-medium">التسجيل</th>
                <th className="px-5 py-3 text-xs text-zinc-500 font-medium text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {isLoading ? (
                [1,2,3,4,5].map(i => <tr key={i}><td colSpan={6} className="px-5 py-4 h-14 bg-white/[0.02]" /></tr>)
              ) : filteredUsers?.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-white">{u.username}</p>
                    <p className="text-[11px] text-zinc-500">{u.email}</p>
                  </td>
                  <td className="px-5 py-3 font-bold text-amber-400">${Number(u.balance).toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">VIP {u.vip_level}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs text-zinc-400">{u.daily_challenges_completed}/{u.daily_challenges_limit}</span>
                  </td>
                  <td className="px-5 py-3 text-xs text-zinc-500">{new Date(u.created_at).toLocaleDateString('en-US')}</td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-amber-400" onClick={() => { setSelectedUser(u); setEditDialogOpen(true); }}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-rose-400" onClick={() => { if (window.confirm(`حذف ${u.username}؟`)) deleteUserMutation.mutate(u.id); }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          [1,2,3].map(i => <div key={i} className="h-24 bg-white/[0.03] rounded-xl animate-pulse" />)
        ) : filteredUsers?.map((u, i) => (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-[#0d0d12] border border-white/[0.06] rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{u.username}</p>
                <p className="text-[11px] text-zinc-500">{u.email}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">VIP {u.vip_level}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-[10px] text-zinc-500">الرصيد</p>
                  <p className="text-sm font-bold text-amber-400">${Number(u.balance).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500">المهام</p>
                  <p className="text-sm text-zinc-300">{u.daily_challenges_completed}/{u.daily_challenges_limit}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-zinc-400" onClick={() => { setSelectedUser(u); setEditDialogOpen(true); }}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-rose-400" onClick={() => { if (window.confirm(`حذف ${u.username}؟`)) deleteUserMutation.mutate(u.id); }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-[#0d0d12] border-white/[0.08] sm:max-w-[400px] mx-4">
          <DialogHeader>
            <DialogTitle className="text-white">تعديل بيانات المستخدم</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-5 py-2">
              <div className="space-y-2">
                <label className="text-xs text-zinc-500">إدارة الرصيد (الحالي: ${selectedUser.balance})</label>
                <div className="flex gap-2">
                  <Input type="number" placeholder="المبلغ..." value={balanceChange} onChange={(e) => setBalanceChange(e.target.value)} className="bg-white/[0.04] border-white/[0.08]" />
                  <Button variant="outline" className="border-emerald-500/30 text-emerald-400 shrink-0" onClick={() => handleUpdateBalance('add')}><Plus className="w-4 h-4" /></Button>
                  <Button variant="outline" className="border-rose-500/30 text-rose-400 shrink-0" onClick={() => handleUpdateBalance('subtract')}><Minus className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-500">مستوى VIP</label>
                <div className="grid grid-cols-4 gap-2">
                  {[0,1,2,3,4,5,6,7].map((level) => (
                    <Button key={level} variant={selectedUser.vip_level === level ? 'default' : 'outline'} size="sm"
                      onClick={() => {
                        updateProfileMutation.mutate({ id: selectedUser.id, updates: { vip_level: level } });
                        setSelectedUser({ ...selectedUser, vip_level: level });
                      }}
                      className={selectedUser.vip_level === level ? 'bg-amber-500 text-black' : 'border-white/[0.08]'}
                    >{level}</Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-500">لفات عجلة الحظ (الحالي: {selectedUser.available_spins})</label>
                <div className="flex gap-2">
                  <Input type="number" placeholder="عدد اللفات..." value={spinsChange} onChange={(e) => setSpinsChange(e.target.value)} className="bg-white/[0.04] border-white/[0.08]" />
                  <Button variant="outline" className="border-emerald-500/30 text-emerald-400 shrink-0" onClick={() => handleUpdateSpins('add')}><Plus className="w-4 h-4" /></Button>
                  <Button variant="outline" className="border-rose-500/30 text-rose-400 shrink-0" onClick={() => handleUpdateSpins('subtract')}><Minus className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
