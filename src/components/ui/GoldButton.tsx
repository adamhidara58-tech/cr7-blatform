import { forwardRef, ReactNode, ButtonHTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GoldButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export const GoldButton = forwardRef<HTMLButtonElement, GoldButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, onClick, ...props }, ref) => {
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

    const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

    return (
      <motion.button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], disabledStyles, className)}
        whileHover={disabled ? {} : { scale: 1.02 }}
        whileTap={disabled ? {} : { scale: 0.98 }}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        {...props}
      >
        {variant === 'primary' && !disabled && (
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
        )}
        <span className="relative z-10">{children}</span>
      </motion.button>
    );
  }
);

GoldButton.displayName = 'GoldButton';
