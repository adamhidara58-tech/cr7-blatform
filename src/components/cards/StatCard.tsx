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
    default: 'glass-card border-white/5',
    gold: 'glass-card border-gold/20 shadow-[0_10px_30px_-10px_rgba(212,175,55,0.2)]',
    accent: 'glass-card border-accent/20',
  };

  const iconVariants = {
    default: 'bg-white/5 text-white/70',
    gold: 'bg-gold/10 text-gold',
    accent: 'bg-accent/10 text-accent',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`${variants[variant]} rounded-3xl p-5 relative overflow-hidden group hover:scale-[1.02] transition-all`}
    >
      {/* Glow Effect */}
      <div className={`absolute -bottom-12 -left-12 w-24 h-24 blur-3xl rounded-full opacity-20 transition-opacity group-hover:opacity-40 ${variant === 'gold' ? 'bg-gold' : 'bg-white'}`} />
      
      <div className="flex flex-col items-end relative z-10">
        <div className={`${iconVariants[variant]} p-3 rounded-2xl mb-4 border border-white/5 transition-transform group-hover:scale-110`}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="text-right w-full">
          <p className="text-[11px] font-bold text-white/30 mb-1 uppercase tracking-wider">{label}</p>
          <p className={`text-xl font-black tracking-tight ${variant === 'gold' ? 'text-gradient-gold' : 'text-white'}`}>
            {value}
          </p>
          {subValue && (
            <p className="text-[10px] font-bold text-white/20 mt-1">{subValue}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};
