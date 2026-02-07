import { motion } from 'framer-motion';
import { Crown, TrendingUp, Target, ChevronLeft, Calendar, DollarSign } from 'lucide-react';
import { vipLevels } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import React, { useMemo } from 'react';

// Import New VIP Images
import vip0 from '@/assets/vip-final/players/vip0.png';
import vip1 from '@/assets/vip-final/players/vip1.png';
import vip2 from '@/assets/vip-final/players/vip2.png';
import vip3 from '@/assets/vip-final/players/vip3.png';
import vip4 from '@/assets/vip-final/players/vip4.png';
import vip5 from '@/assets/vip-final/players/vip5.png';
import stadiumBg from '@/assets/vip-final/stadium-bg.jpg';

const ronaldoImages: Record<number, string> = {
  0: vip0,
  1: vip1,
  2: vip2,
  3: vip3,
  4: vip4,
  5: vip5,
};

// Consistent colors with VIP page
const vipColors: Record<number, { main: string, text: string, glow: string, border: string, bg: string, particle: string }> = {
  0: { 
    main: 'from-zinc-400 to-zinc-600', 
    text: 'text-zinc-300', 
    glow: 'rgba(200, 200, 200, 0.2)',
    border: 'border-zinc-500/30',
    bg: 'from-zinc-950/80 via-zinc-900/40 to-transparent',
    particle: 'bg-zinc-400/20'
  },
  1: { 
    main: 'from-yellow-600 to-yellow-800', 
    text: 'text-yellow-600', 
    glow: 'rgba(202, 138, 4, 0.2)',
    border: 'border-yellow-600/30',
    bg: 'from-yellow-950/80 via-yellow-900/40 to-transparent',
    particle: 'bg-yellow-600/20'
  },
  2: { 
    main: 'from-[#D4AF37] to-[#FBF5B7]', 
    text: 'text-[#D4AF37]', 
    glow: 'rgba(212, 175, 55, 0.3)',
    border: 'border-[#D4AF37]/40',
    bg: 'from-zinc-950/80 via-zinc-900/40 to-transparent',
    particle: 'bg-[#D4AF37]/30'
  },
  3: { 
    main: 'from-purple-500 to-purple-800', 
    text: 'text-purple-400', 
    glow: 'rgba(168, 85, 247, 0.4)',
    border: 'border-purple-500/40',
    bg: 'from-purple-950/80 via-purple-900/40 to-transparent',
    particle: 'bg-purple-400/40'
  },
  4: { 
    main: 'from-blue-500 to-indigo-800', 
    text: 'text-blue-400', 
    glow: 'rgba(59, 130, 246, 0.5)',
    border: 'border-blue-500/50',
    bg: 'from-blue-950/80 via-blue-900/40 to-transparent',
    particle: 'bg-blue-400/40'
  },
  5: { 
    main: 'from-cyan-400 to-blue-600', 
    text: 'text-cyan-400', 
    glow: 'rgba(34, 211, 238, 0.6)',
    border: 'border-cyan-400/60',
    bg: 'from-cyan-950/80 via-cyan-900/40 to-transparent',
    particle: 'bg-cyan-400/50'
  },
};

const Particle = ({ color }: { color: string }) => {
  const randomX = useMemo(() => Math.random() * 100, []);
  const randomDelay = useMemo(() => Math.random() * 5, []);
  const randomDuration = useMemo(() => 2 + Math.random() * 3, []);

  return (
    <motion.div
      className={`absolute w-1 h-1 rounded-full ${color} blur-[0.5px]`}
      initial={{ x: `${randomX}%`, y: "110%", opacity: 0 }}
      animate={{ 
        y: ["110%", "-10%"], 
        opacity: [0, 0.6, 0],
        scale: [0, 1, 0]
      }}
      transition={{ 
        duration: randomDuration, 
        repeat: Infinity, 
        delay: randomDelay,
        ease: "linear"
      }}
    />
  );
};

export const VIPCardsSection = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const currentLevel = profile?.vip_level || 0;

  // Show VIP 0-5
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
          const isUnlocked = level.level <= currentLevel;
          const isCurrentLevel = level.level === currentLevel;
          const colors = vipColors[level.level] || vipColors[0];

          return (
            <motion.div
              key={level.level}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate('/vip')}
              className={`relative h-48 rounded-[2.5rem] overflow-hidden border ${colors.border} cursor-pointer group transition-all duration-500 shadow-2xl bg-black ${level.level >= 3 ? 'hover:scale-[1.02]' : ''}`}
            >
              {/* Stadium Background */}
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" 
                style={{ backgroundImage: `url(${stadiumBg})` }} 
              />
              
              {/* Overlays */}
              <div className="absolute inset-0 z-[1] bg-black/60 backdrop-blur-[0.5px]" />
              <div className={`absolute inset-0 z-[1] bg-gradient-to-l ${colors.bg}`} />
              <div 
                className="absolute inset-0 z-[1] opacity-40" 
                style={{ background: `radial-gradient(circle at 30% 50%, ${colors.glow}, transparent 70%)` }} 
              />

              {/* Advanced Particles for VIP3-5 */}
              {level.level >= 3 && (
                <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
                  {[...Array(8)].map((_, i) => (
                    <Particle key={i} color={colors.particle} />
                  ))}
                </div>
              )}

              {/* Ronaldo Image */}
              <div className="absolute left-[-5%] bottom-0 h-full w-[45%] flex items-end justify-center z-[2] pointer-events-none overflow-visible">
                <img 
                  src={ronaldoImages[level.level]} 
                  alt={`VIP ${level.level}`}
                  className="h-[115%] w-auto object-contain object-bottom drop-shadow-[0_15px_30px_rgba(0,0,0,0.95)] group-hover:scale-110 transition-transform duration-700 ease-out origin-bottom"
                />
                {level.level >= 4 && (
                  <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[100%] h-[20%] ${colors.particle} blur-3xl rounded-full -z-10 opacity-50`} />
                )}
              </div>

              {/* Content Area */}
              <div className="relative h-full p-6 ml-auto w-[60%] flex flex-col justify-between z-[3] text-right">
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-[10px] ${colors.text} font-black uppercase tracking-widest`}>{level.nameAr}</p>
                    <Crown className={`w-4 h-4 ${colors.text}`} />
                  </div>
                  <h4 className="font-display text-3xl font-bold text-white leading-none italic">
                    VIP {level.level}
                  </h4>
                </div>

                <div className="flex items-end justify-between">
                  {/* Action Status */}
                  <div className="flex flex-col items-end gap-1">
                    {isCurrentLevel ? (
                      <span className={`px-3 py-1 bg-gradient-to-r ${colors.main} text-white text-[10px] font-black rounded-lg border border-white/20 uppercase shadow-lg`}>
                        ACTIVE
                      </span>
                    ) : isUnlocked ? (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 text-[10px] font-black rounded-lg border border-green-500/30 uppercase">
                        UNLOCKED
                      </span>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-zinc-500 line-through decoration-red-500/50">${formatNumber(level.price)}</span>
                        <span className={`text-xl font-display font-bold ${colors.text} drop-shadow-sm`}>${formatNumber(level.referralPrice)}</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-[10px] text-zinc-300 font-bold">${formatNumber(level.dailyProfit)}</span>
                      <DollarSign className="w-3 h-3 text-yellow-500" />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-[10px] text-zinc-300 font-bold">{level.dailyChallengeLimit} Tasks</span>
                      <Calendar className={`w-3 h-3 ${colors.text}`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Animated Glow for VIP3-5 */}
              {level.level >= 3 && (
                <motion.div 
                  className="absolute inset-0 z-[1] pointer-events-none"
                  animate={{ 
                    boxShadow: [
                      `inset 0 0 15px ${colors.glow}`, 
                      `inset 0 0 30px ${colors.glow}`, 
                      `inset 0 0 15px ${colors.glow}`
                    ] 
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
