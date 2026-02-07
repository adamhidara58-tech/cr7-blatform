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
    gold: 'glass-card border-gold/20 shadow-[0_4px_12px_-6px_rgba(212,175,55,0.15)]',
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
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`${variants[variant]} rounded-2xl p-4 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300`}
    >
      {/* Glow Effect - Optimized */}
      <div className={`absolute -bottom-12 -left-12 w-20 h-20 blur-2xl rounded-full opacity-15 transition-opacity duration-300 group-hover:opacity-25 ${variant === 'gold' ? 'bg-gold' : 'bg-white'}`} />
      
      <div className="flex flex-col items-end relative z-10">
        <div className={`${iconVariants[variant]} p-2.5 rounded-xl mb-3 border border-white/5 transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        
        <div className="text-right w-full">
          <p className="text-[10px] font-bold text-white/30 mb-1 uppercase tracking-wider">{label}</p>
          <p className={`text-lg sm:text-xl font-black tracking-tight ${variant === 'gold' ? 'text-gradient-gold' : 'text-white'}`}>
            {value}
          </p>
          {subValue && (
            <p className="text-[9px] font-bold text-white/20 mt-1">{subValue}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};
