import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subValue?: string;
  index: number;
  variant?: 'default' | 'gold' | 'accent';
}

export const StatCard = ({ icon: Icon, label, value, subValue, index, variant = 'default' }: StatCardProps) => {
  const variants = {
    default: 'bg-gradient-card border-border',
    gold: 'bg-gradient-card border-primary/30',
    accent: 'bg-gradient-card border-accent/30',
  };

  const iconVariants = {
    default: 'bg-secondary text-foreground',
    gold: 'bg-primary/20 text-primary',
    accent: 'bg-accent/20 text-accent',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`${variants[variant]} border rounded-2xl p-4`}
    >
      <div className="flex items-start justify-between">
        <div className="text-right flex-1">
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          <p className={`text-xl font-bold ${variant === 'gold' ? 'text-primary' : 'text-foreground'}`}>
            {value}
          </p>
          {subValue && (
            <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
          )}
        </div>
        <div className={`${iconVariants[variant]} p-2.5 rounded-xl`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
};
