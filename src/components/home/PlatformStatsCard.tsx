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

    let frameId: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (end - startValue) * easeOutQuart;
      
      // Only update state if value changed significantly to save CPU
      setCount(prev => {
        if (Math.abs(prev - currentValue) < 0.1 && progress < 1) return prev;
        return currentValue;
      });

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
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
      color: 'from-blue-500/20 to-blue-600/20',
      iconColor: 'text-blue-400',
    },
    {
      icon: DollarSign,
      label: 'إجمالي المدفوعات',
      value: stats.totalPaid,
      prefix: '$',
      color: 'from-green-500/20 to-green-600/20',
      iconColor: 'text-green-400',
    },
    {
      icon: TrendingUp,
      label: 'مدفوعات اليوم',
      value: stats.todayPayouts,
      prefix: '$',
      color: 'from-gold/20 to-gold/5',
      iconColor: 'text-gold',
    },
    {
      icon: Zap,
      label: 'متصل الآن',
      value: stats.onlineNow,
      color: 'from-purple-500/20 to-purple-600/20',
      iconColor: 'text-purple-400',
      live: true,
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white/80 px-1 text-right">إحصائيات المنصة</h3>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-2 gap-4"
      >
        {statItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="glass-card border border-white/5 rounded-2xl p-4 relative overflow-hidden group"
            >
              <div className={`absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br ${item.color} blur-3xl group-hover:opacity-100 transition-opacity opacity-50`} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-end gap-2.5 mb-3">
                  <span className="text-[11px] font-bold text-white/40">{item.label}</span>
                  <div className={`w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-4 h-4 ${item.iconColor}`} />
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xl font-black text-white flex items-center justify-end gap-1.5">
                    {item.live && (
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_#4ade80]" />
                    )}
                    <AnimatedCounter
                      end={item.value}
                      prefix={item.prefix}
                      duration={1.5}
                    />
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
