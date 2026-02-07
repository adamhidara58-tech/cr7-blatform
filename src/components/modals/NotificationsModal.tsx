import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Bell, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface NotificationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mockNotifications = [
  {
    id: '1',
    type: 'success',
    title: 'مكافأة يومية',
    message: 'تم إضافة $1.00 إلى رصيدك',
    time: 'منذ 5 دقائق',
    read: false,
  },
  {
    id: '2',
    type: 'info',
    title: 'ترقية VIP متاحة',
    message: 'قم بالترقية إلى VIP 2 للحصول على مزايا أكثر',
    time: 'منذ ساعة',
    read: false,
  },
  {
    id: '3',
    type: 'success',
    title: 'إحالة جديدة',
    message: 'انضم صديق جديد عبر رابط الإحالة الخاص بك',
    time: 'منذ 3 ساعات',
    read: true,
  },
  {
    id: '4',
    type: 'warning',
    title: 'تذكير',
    message: 'لم تستلم مكافأتك اليومية بعد!',
    time: 'منذ يوم',
    read: true,
  },
];

export const NotificationsModal = ({ open, onOpenChange }: NotificationsModalProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Info className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-modal max-w-md border-border/50 max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-display text-gradient-gold">
            <Bell className="w-5 h-5 text-primary" />
            الإشعارات
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {mockNotifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl glass-card border border-border/30 ${
                !notification.read ? 'bg-primary/5' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getIcon(notification.type)}</div>
                <div className="flex-1 text-right">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                    <h4 className="font-semibold text-foreground">{notification.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
