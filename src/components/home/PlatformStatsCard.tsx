import { motion } from 'framer-motion';
import { Users, DollarSign, TrendingUp, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

const AnimatedCounter = ({ end, duration = 2, prefix = '', suffix = '', decimals = 0 }: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const startValue = 0;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (end - startValue) * easeOutQuart;
      
      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  const formatNumber = (num: number) => {
    if (decimals > 0) {
      return num.toFixed(decimals);
    }
    return Math.floor(num).toLocaleString();
  };

  return (
    <span>
      {prefix}{formatNumber(count)}{suffix}
    </span>
  );
};

export const PlatformStatsCard = () => {
  // Fake dynamic stats that increment periodically
  const [stats, setStats] = useState({
    totalUsers: 28547,
    totalPaid: 4850000,
    todayPayouts: 127890,
    onlineNow: 1247,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 3),
        totalPaid: prev.totalPaid + Math.floor(Math.random() * 500),
        todayPayouts: prev.todayPayouts + Math.floor(Math.random() * 100),
        onlineNow: Math.max(1000, prev.onlineNow + Math.floor(Math.random() * 20) - 10),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const statItems = [
    {
      icon: Users,
      label: 'عضو مسجل',
      value: stats.totalUsers,
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
    },
    {
      icon: DollarSign,
      label: 'إجمالي المدفوعات',
      value: stats.totalPaid,
      prefix: '$',
      format: 'currency',
      color: 'from-green-500 to-green-600',
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-400',
    },
    {
      icon: TrendingUp,
      label: 'مدفوعات اليوم',
      value: stats.todayPayouts,
      prefix: '$',
      color: 'from-primary to-gold-light',
      iconBg: 'bg-primary/20',
      iconColor: 'text-primary',
    },
    {
      icon: Zap,
      label: 'متصل الآن',
      value: stats.onlineNow,
      color: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400',
      live: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="grid grid-cols-2 gap-3"
    >
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
            className="glass-card border border-border/30 rounded-2xl p-4 relative overflow-hidden"
          >
            {/* Background gradient accent */}
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${item.color} opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2`} />
            
            <div className="relative">
              <div className="flex items-center justify-end gap-2 mb-2">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <div className={`w-8 h-8 rounded-lg ${item.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${item.iconColor}`} />
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-xl font-bold text-foreground flex items-center justify-end gap-1">
                  {item.live && (
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  )}
                  <AnimatedCounter
                    end={item.value}
                    prefix={item.prefix}
                    duration={1.5}
                    decimals={0}
                  />
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
