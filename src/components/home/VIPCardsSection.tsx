import { motion } from 'framer-motion';
import { Crown, Calendar, DollarSign, ChevronLeft } from 'lucide-react';
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

const vipColors: Record<number, { main: string, text: string, glow: string, border: string, bg: string, particle: string }> = {
  0: { main: 'from-zinc-400 to-zinc-600', text: 'text-zinc-300', glow: 'rgba(200, 200, 200, 0.2)', border: 'border-zinc-500/30', bg: 'from-zinc-950/90 via-zinc-900/60 to-transparent', particle: 'bg-zinc-400/20' },
  1: { main: 'from-yellow-600 to-yellow-800', text: 'text-yellow-600', glow: 'rgba(202, 138, 4, 0.2)', border: 'border-yellow-600/30', bg: 'from-yellow-950/90 via-yellow-900/60 to-transparent', particle: 'bg-yellow-600/20' },
  2: { main: 'from-[#D4AF37] to-[#FBF5B7]', text: 'text-[#D4AF37]', glow: 'rgba(212, 175, 55, 0.3)', border: 'border-[#D4AF37]/40', bg: 'from-zinc-950/90 via-zinc-900/60 to-transparent', particle: 'bg-[#D4AF37]/30' },
  3: { main: 'from-purple-500 to-purple-800', text: 'text-purple-400', glow: 'rgba(168, 85, 247, 0.4)', border: 'border-purple-500/40', bg: 'from-purple-950/90 via-purple-900/60 to-transparent', particle: 'bg-purple-400/40' },
  4: { main: 'from-blue-500 to-indigo-800', text: 'text-blue-400', glow: 'rgba(59, 130, 246, 0.5)', border: 'border-blue-500/50', bg: 'from-blue-950/90 via-blue-900/60 to-transparent', particle: 'bg-blue-400/40' },
  5: { main: 'from-cyan-400 to-blue-600', text: 'text-cyan-400', glow: 'rgba(34, 211, 238, 0.6)', border: 'border-cyan-400/60', bg: 'from-cyan-950/90 via-cyan-900/60 to-transparent', particle: 'bg-cyan-400/50' },
};

const Particle = ({ color }: { color: string }) => {
  const randomX = useMemo(() => Math.random() * 100, []);
  const randomDelay = useMemo(() => Math.random() * 5, []);
  const randomDuration = useMemo(() => 2 + Math.random() * 3, []);

  return (
    <motion.div
      className={`absolute w-1 h-1 rounded-full ${color} blur-[0.5px]`}
      initial={{ x: `${randomX}%`, y: "110%", opacity: 0 }}
      animate={{ y: ["110%", "-10%"], opacity: [0, 0.6, 0], scale: [0, 1, 0] }}
      transition={{ duration: randomDuration, repeat: Infinity, delay: randomDelay, ease: "linear" }}
    />
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
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/vip')} className="flex items-center gap-1.5 text-xs text-white/40 font-bold hover:text-gold transition-all">
          <ChevronLeft className="w-4 h-4" />
          عرض الكل
        </button>
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Crown className="w-5 h-5 text-gold" />
          مستويات VIP
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {mainVipLevels.map((level, index) => {
          const isUnlocked = level.level <= currentLevel;
          const isCurrentLevel = level.level === currentLevel;
          const colors = vipColors[level.level] || vipColors[0];

          return (
            <motion.div
              key={level.level}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate('/vip')}
              className={`relative h-48 rounded-3xl overflow-hidden border border-white/5 cursor-pointer group transition-all duration-500 shadow-2xl bg-[#0A0A0C]`}
            >
              {/* Background Layer */}
              <div className="absolute inset-0 z-0 bg-cover bg-center opacity-30 transition-transform duration-1000 group-hover:scale-110" style={{ backgroundImage: `url(${stadiumBg})` }} />
              <div className={`absolute inset-0 z-[1] bg-gradient-to-l ${colors.bg}`} />
              
              {/* Particles for High Levels */}
              {level.level >= 3 && (
                <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
                  {[...Array(8)].map((_, i) => <Particle key={i} color={colors.particle} />)}
                </div>
              )}

              {/* Player Image */}
              <div className="absolute left-[-5%] bottom-0 h-[110%] w-[45%] flex items-end justify-center z-[10] pointer-events-none overflow-visible">
                <img 
                  src={ronaldoImages[level.level]} 
                  alt={`VIP ${level.level}`}
                  className="h-full w-auto object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,1)] group-hover:scale-105 transition-transform duration-700 ease-out origin-bottom"
                />
              </div>

              {/* Content Area */}
              <div className="relative h-full p-6 ml-auto w-[65%] flex flex-col justify-between z-[20] text-right">
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 mb-1.5">
                    <p className={`text-[10px] ${colors.text} font-bold uppercase tracking-widest opacity-80`}>{level.nameAr}</p>
                    <div className={`w-1.5 h-1.5 rounded-full ${colors.particle} animate-pulse`} />
                  </div>
                  <h4 className="text-3xl font-black text-white italic tracking-tighter">VIP {level.level}</h4>
                </div>

                <div className="flex items-end justify-between gap-3">
                  <div className="flex flex-col items-end gap-1.5">
                    {isCurrentLevel ? (
                      <span className={`px-4 py-1.5 bg-gradient-gold text-black text-[10px] font-black rounded-full shadow-[0_5px_15px_rgba(212,175,55,0.3)]`}>نشط حالياً</span>
                    ) : isUnlocked ? (
                      <span className="px-4 py-1.5 bg-white/10 text-white text-[10px] font-black rounded-full border border-white/10">مفتوح</span>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-white/20 line-through decoration-red-500/50">${formatNumber(level.price)}</span>
                        <span className={`text-xl font-black ${colors.text} drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]`}>${formatNumber(level.referralPrice)}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 shrink-0">
                    <div className="flex items-center justify-end gap-2 bg-black/40 px-3 py-1 rounded-lg border border-white/5">
                      <span className="text-xs text-white font-bold">${formatNumber(level.dailyProfit)}</span>
                      <DollarSign className="w-3.5 h-3.5 text-gold" />
                    </div>
                    <div className="flex items-center justify-end gap-2 bg-black/40 px-3 py-1 rounded-lg border border-white/5">
                      <span className="text-xs text-white/70 font-bold">{level.dailyChallengeLimit} مهام</span>
                      <Calendar className={`w-3.5 h-3.5 ${colors.text}`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Glow Effect for High Levels */}
              {level.level >= 3 && (
                <motion.div 
                  className="absolute inset-0 z-[5] pointer-events-none"
                  animate={{ boxShadow: [`inset 0 0 20px ${colors.glow}`, `inset 0 0 40px ${colors.glow}`, `inset 0 0 20px ${colors.glow}`] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
