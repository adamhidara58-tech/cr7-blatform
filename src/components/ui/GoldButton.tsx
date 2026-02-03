import { forwardRef, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GoldButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const GoldButton = forwardRef<HTMLButtonElement, GoldButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = "relative font-semibold rounded-xl transition-all duration-300 overflow-hidden";
    
    const variants = {
      primary: "bg-gradient-gold text-primary-foreground shadow-gold hover:shadow-lg",
      secondary: "bg-secondary text-foreground border border-primary/30 hover:border-primary",
      outline: "bg-transparent text-primary border-2 border-primary hover:bg-primary/10",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    return (
      <motion.button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {variant === 'primary' && (
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
        )}
        <span className="relative z-10">{children}</span>
      </motion.button>
    );
  }
);

GoldButton.displayName = 'GoldButton';
