import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users as UsersIcon, 
  Search, 
  Edit2, 
  Plus, 
  Minus,
  Trophy,
  Activity,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id);
      
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
      // Note: In Supabase, deleting from auth.users requires admin privileges via Edge Function
      // For now, we'll just mark as inactive or provide a warning
      // If the user really wants to delete, we should implement an Edge Function
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
      
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

    updateProfileMutation.mutate({
      id: selectedUser.id,
      updates: { balance: newBalance }
    });

    // Create a transaction for history
    supabase.from('transactions').insert({
      user_id: selectedUser.id,
      type: type === 'add' ? 'deposit' : 'withdrawal',
      amount: finalAmount,
      description: `تعديل رصيد من قبل الإدارة: ${type === 'add' ? 'إضافة' : 'خصم'}`,
      status: 'completed'
    }).then();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gradient-gold mb-2">إدارة المستخدمين</h2>
          <p className="text-muted-foreground">تعديل الأرصدة، مستويات VIP، وحالات المهام</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="بحث عن مستخدم..." 
            className="pl-10 w-full md:w-[300px] glass-card border-border/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border/50 bg-white/5">
                <th className="px-6 py-4 text-sm font-semibold">المستخدم</th>
                <th className="px-6 py-4 text-sm font-semibold">الرصيد</th>
                <th className="px-6 py-4 text-sm font-semibold">VIP</th>
                <th className="px-6 py-4 text-sm font-semibold">المهام</th>
                <th className="px-6 py-4 text-sm font-semibold">تاريخ التسجيل</th>
                <th className="px-6 py-4 text-sm font-semibold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4 h-16 bg-white/5" />
                  </tr>
                ))
              ) : (
                filteredUsers?.map((u) => (
                  <motion.tr 
                    key={u.id}
                    layout
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{u.username}</span>
                        <span className="text-xs text-muted-foreground">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-primary">
                      ${Number(u.balance).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-0.5 rounded bg-gradient-gold text-primary-foreground font-bold">
                        VIP {u.vip_level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xs">
                        <Activity className="w-3 h-3 text-emerald-500" />
                        <span>{u.daily_challenges_completed}/{u.daily_challenges_limit}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10"
                          onClick={() => {
                            setSelectedUser(u);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-rose-500 hover:text-rose-500 hover:bg-rose-500/10"
                          onClick={() => {
                            if (window.confirm(`هل أنت متأكد من حذف المستخدم ${u.username}؟ لا يمكن التراجع عن هذا الإجراء.`)) {
                              deleteUserMutation.mutate(u.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="glass-card border-border/50 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-gradient-gold">تعديل بيانات المستخدم</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6 py-4">
              {/* Balance Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">إدارة الرصيد (الحالي: ${selectedUser.balance})</label>
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    placeholder="المبلغ..." 
                    value={balanceChange}
                    onChange={(e) => setBalanceChange(e.target.value)}
                    className="glass-card"
                  />
                  <Button variant="outline" className="border-emerald-500/50 text-emerald-500" onClick={() => handleUpdateBalance('add')}>
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" className="border-rose-500/50 text-rose-500" onClick={() => handleUpdateBalance('subtract')}>
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* VIP Level Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">مستوى VIP</label>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((level) => (
                    <Button
                      key={level}
                      variant={selectedUser.vip_level === level ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateProfileMutation.mutate({ id: selectedUser.id, updates: { vip_level: level } })}
                      className={selectedUser.vip_level === level ? 'bg-primary text-primary-foreground' : ''}
                    >
                      {level}
                    </Button>
                  ))}
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
