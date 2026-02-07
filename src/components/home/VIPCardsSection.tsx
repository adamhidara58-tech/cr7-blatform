import { motion } from 'framer-motion';
import { Crown, TrendingUp, Calendar, DollarSign, Coins, ChevronLeft } from 'lucide-react';
import { vipLevels } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Import Optimized Large Player Images
import player0 from '@/assets/vip-final/players/vip0_large.png';
import player1 from '@/assets/vip-final/players/vip1_large.png';
import player2 from '@/assets/vip-final/players/vip2_large.png';
import player3 from '@/assets/vip-final/players/vip3_large.png';
import player4 from '@/assets/vip-final/players/vip4_large.png';
import player5 from '@/assets/vip-final/players/vip5_large.png';
import stadiumBg from '@/assets/vip-final/stadium-bg.jpg';

const players: Record<number, string> = {
  0: player0,
  1: player1,
  2: player2,
  3: player3,
  4: player4,
  5: player5,
};

const levelStyles: Record<number, { color: string, intensity: string, glow: string, crownColor: string }> = {
  0: { color: 'rgba(255, 255, 255, 0.1)', intensity: 'opacity-20', glow: 'shadow-[0_0_15px_rgba(255,255,255,0.1)]', crownColor: '#A1A1AA' },
  1: { color: 'rgba(255, 255, 255, 0.2)', intensity: 'opacity-30', glow: 'shadow-[0_0_20px_rgba(255,255,255,0.2)]', crownColor: '#D4AF37' },
  2: { color: 'rgba(255, 215, 0, 0.3)', intensity: 'opacity-40', glow: 'shadow-[0_0_25px_rgba(212,175,55,0.3)]', crownColor: '#FFD700' },
  3: { color: 'rgba(212, 175, 55, 0.4)', intensity: 'opacity-50', glow: 'shadow-[0_0_30px_rgba(184,134,11,0.4)]', crownColor: '#DAA520' },
  4: { color: 'rgba(163, 33, 255, 0.4)', intensity: 'opacity-50', glow: 'shadow-[0_0_35px_rgba(163,33,255,0.4)]', crownColor: '#A855F7' },
  5: { color: 'rgba(0, 150, 255, 0.5)', intensity: 'opacity-60', glow: 'shadow-[0_0_50px_rgba(0,150,255,0.5)]', crownColor: '#3B82F6' },
};

const Particles = ({ color }: { color: string }) => {
  return (
    <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            backgroundColor: color,
            width: Math.random() * 3 + 1 + 'px',
            height: Math.random() * 3 + 1 + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            opacity: 0.3,
          }}
          animate={{
            y: [0, -60],
            opacity: [0, 0.5, 0],
            scale: [0, 1.2, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

export const VIPCardsSection = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const currentLevel = profile?.vip_level || 0;

  const mainVipLevels = vipLevels.filter(v => v.level >= 0 && v.level <= 5);

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <section className="px-4 mb-8">
      <div className="flex items-center justify-between mb-5">
        <button 
          onClick={() => navigate('/vip')} 
          className="flex items-center gap-1 text-xs text-zinc-500 font-bold hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          عرض الكل
        </button>
        <h3 className="font-display text-2xl text-foreground flex items-center gap-3">
          <Crown className="w-6 h-6 text-primary" />
          مستويات VIP
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {mainVipLevels.map((level, index) => {
          const style = levelStyles[level.level] || levelStyles[0];

          return (
            <motion.div
              key={level.level}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate('/vip')}
              className={`relative h-48 rounded-[2.5rem] overflow-hidden border border-white/10 cursor-pointer group transition-all duration-500 shadow-2xl bg-black ${style.glow}`}
            >
              {/* Background */}
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                style={{ backgroundImage: `url(${stadiumBg})` }} 
              />
              <div className="absolute inset-0 z-1 bg-black/50" />
              <div 
                className={`absolute inset-0 z-2 ${style.intensity} pointer-events-none`} 
                style={{ background: `radial-gradient(circle at 50% 40%, ${style.color}, transparent 70%)` }} 
              />

              {/* Particles for VIP3-VIP5 */}
              {level.level >= 3 && <Particles color={style.crownColor} />}

              {/* Player Image */}
              <div className="absolute left-[-2%] bottom-0 h-full w-[45%] flex items-end justify-center z-[6] pointer-events-none overflow-visible">
                <img 
                  src={players[level.level]} 
                  alt={`VIP ${level.level}`}
                  className={`w-auto object-contain object-bottom drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)] transition-all duration-700 ease-out origin-bottom ${
                    level.level === 5 ? 'h-[130%] scale-110' : 'h-[115%] scale-100'
                  }`}
                />
              </div>

              {/* Content */}
              <div className="relative h-full p-5 ml-auto w-[55%] flex flex-col justify-between z-[10] text-right">
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: style.crownColor }}>{level.nameAr}</p>
                    <Crown className="w-4 h-4" style={{ color: style.crownColor }} />
                  </div>
                  <h4 className="font-display text-3xl font-bold text-white leading-none italic">
                    VIP {level.level}
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-2" dir="rtl">
                  <div className="bg-zinc-900/60 backdrop-blur-md rounded-xl p-1.5 border border-white/5 flex flex-col items-center">
                    <TrendingUp className="w-3 h-3 text-emerald-400 mb-0.5" />
                    <span className="text-xs font-black text-white leading-none">%{level.simpleInterest}</span>
                    <span className="text-[7px] text-zinc-400 font-bold uppercase">العائد</span>
                  </div>
                  <div className="bg-zinc-900/60 backdrop-blur-md rounded-xl p-1.5 border border-white/5 flex flex-col items-center">
                    <Calendar className="w-3 h-3 text-orange-400 mb-0.5" />
                    <span className="text-xs font-black text-white leading-none">{level.dailyChallengeLimit}</span>
                    <span className="text-[7px] text-zinc-400 font-bold uppercase">المهام</span>
                  </div>
                  <div className="bg-zinc-900/60 backdrop-blur-md rounded-xl p-1.5 border border-white/5 flex flex-col items-center">
                    <DollarSign className="w-3 h-3 text-yellow-500 mb-0.5" />
                    <span className="text-[9px] font-black text-white leading-none">{formatNumber(level.dailyProfit)}</span>
                    <span className="text-[7px] text-zinc-400 font-bold uppercase">يومي</span>
                  </div>
                  <div className="bg-zinc-900/60 backdrop-blur-md rounded-xl p-1.5 border border-white/5 flex flex-col items-center">
                    <Coins className="w-3 h-3 text-yellow-600 mb-0.5" />
                    <span className="text-[9px] font-black text-white leading-none">{formatNumber(level.totalProfit).split('.')[0]}</span>
                    <span className="text-[7px] text-zinc-400 font-bold uppercase">إجمالي</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
