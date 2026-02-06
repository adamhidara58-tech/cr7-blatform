import { motion } from 'framer-motion';
import { Crown, TrendingUp, Target, ChevronLeft } from 'lucide-react';
import { vipLevels } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Import New VIP Images from processed folder
import vip1 from '@/assets/vip-processed/vip1.png';
import vip2 from '@/assets/vip-processed/vip2.png';
import vip3 from '@/assets/vip-processed/vip3.png';
import vip4 from '@/assets/vip-processed/vip4.png';
import vip5 from '@/assets/vip-processed/vip5.png';

const ronaldoImages: Record<number, string> = {
  1: vip1,
  2: vip2,
  3: vip3,
  4: vip4,
  5: vip5,
};

// Original Stadium backgrounds restored
const stadiumBackgrounds: Record<number, string> = {
  1: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh4mOmSgoCoctyIOJyLKCbocZpRqFB29IhBd4Q9fbAyKP_c7XasCLMGfeSX6sKXNbEkfh7nLyYGF1yPV42ja1jzEohg432ABmQIkRFdCsd3Pv_r32EMJ81R-REcV_go9r-sQYSp9shEIuHgxEgEY-SoZ33udIoVxr3q-ac-jbDkfibNaXvftpNCjsLMGoY/s1600/IMG_2560.png',
  2: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjo0TFuiXxehVTorQw5zImbrMGPa6kaKZF2YxvaHiVqMaJIoIHcxfW95PX-juwZ3rKDJokReHPA3eLmTeWSryfyDTsfdmLv_KrtGsn1koOB1rvpp4nCUGDcZnzotZSDGWJeOA6K1nqh4MZ3L9MW1c2cOIcYTZEnuUVThMTfAstcHjL1KORXgBMfMfDZtns/s1600/IMG_2562.jpeg',
  3: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh_cd6NYjdWfvpHXCplBWhkZndYiF1_w73CqlsyzWfPH5-9m488YEUE_YWmVu9rZ2pNphLxo-aEMKGRvaX7ESSctmWvuudxkPoXk7Q95WUvzlV2FWQUg_c4PHFKqfB37_BIJxxCC9JBs-_XqYK5EDuX9PeAbAy2tFFtCiyvd3PyyE-3oIywAUMebKIuf08/s1600/IMG_2558.png',
  4: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgSgxijf0Qsz757uduMUR9pjq6F1ILmbdTImLqNs62EXOFjVMLzNUaldV5_gWrjOAMdPjUNDquu6OZSQaw1yZl0eQU314cLrcls67H7V53yt7Dj2Z6cUdeLvumaOTOnwcAztNVxMgoGY5TjEk0QPY0jnar28qxN-YHwQIobRbsXW5KYbB0VSWr3yQIbxN4/s1600/IMG_2559.png',
  5: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhmsHqltpEzmafR80EfvGx5Jcicbx3cRB7dgnFFKfNIsvQ9CdAPmU38ANrD8X8w6waTEjVS_orRm88-qGMJ03pjPCSTwtS8_9t_mudx8ui2zalEEB7isMEx4b3Dkk4ijloeZKSy_xC_uZaGnpuhgfdVPc14ZMxz5VmmwIU3ccP8nBVI3ljaWSupAE0V6TA/s1600/IMG_2557.png',
};

const levelStyles: Record<number, { border: string, overlay: string, bgGradient: string }> = {
  1: { border: 'border-blue-500/20', overlay: 'bg-blue-950/40', bgGradient: 'from-blue-950 via-blue-900/20 to-transparent' },
  2: { border: 'border-slate-400/20', overlay: 'bg-slate-900/40', bgGradient: 'from-slate-900 via-slate-800/20 to-transparent' },
  3: { border: 'border-purple-500/20', overlay: 'bg-purple-950/40', bgGradient: 'from-purple-950 via-purple-900/20 to-transparent' },
  4: { border: 'border-red-500/20', overlay: 'bg-red-950/40', bgGradient: 'from-red-950 via-yellow-900/20 to-transparent' },
  5: { border: 'border-yellow-500/30', overlay: 'bg-yellow-950/20', bgGradient: 'from-yellow-950 via-yellow-900/40 to-transparent' },
};

export const VIPCardsSection = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const currentLevel = profile?.vip_level || 0;

  // Only show VIP 1-5 (exclude 0)
  const mainVipLevels = vipLevels.filter(v => v.level >= 1 && v.level <= 5);

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

      <div className="grid grid-cols-1 gap-4">
        {mainVipLevels.map((level, index) => {
          const isUnlocked = level.level <= currentLevel;
          const isCurrentLevel = level.level === currentLevel;
          const style = levelStyles[level.level] || levelStyles[1];

          return (
            <motion.div
              key={level.level}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate('/vip')}
              className={`relative h-44 rounded-[2rem] overflow-hidden border ${style.border} cursor-pointer group transition-all duration-500 shadow-2xl bg-black`}
            >
              {/* Stadium Background */}
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                style={{ backgroundImage: `url(${stadiumBackgrounds[level.level]})` }} 
              />
              
              {/* Overlay */}
              <div className={`absolute inset-0 z-[1] ${style.overlay} backdrop-blur-[1px]`} />
              <div className={`absolute inset-0 z-[1] bg-gradient-to-l ${style.bgGradient}`} />

              {/* Ronaldo Image */}
              <div className="absolute left-[-5%] bottom-0 h-full w-[45%] flex items-end justify-center z-[2] pointer-events-none overflow-visible">
                <img 
                  src={ronaldoImages[level.level]} 
                  alt={`VIP ${level.level}`}
                  className="h-[110%] w-auto object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] group-hover:scale-110 transition-transform duration-700 ease-out origin-bottom"
                  style={{
                    scale: level.level === 2 ? 1.2 : 1 // Adjusted VIP 2 scale
                  }}
                />
              </div>

              {/* Content */}
              <div className="relative h-full p-5 ml-auto w-[60%] flex flex-col justify-between z-[3] text-right">
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[10px] text-yellow-500 font-black uppercase tracking-widest">{level.nameAr}</p>
                    <Crown className={`w-4 h-4 ${level.level >= 5 ? 'text-yellow-400' : 'text-zinc-400'}`} />
                  </div>
                  <h4 className="font-display text-3xl font-bold text-white leading-none italic">
                    VIP {level.level}
                  </h4>
                </div>

                <div className="flex items-end justify-between">
                  <div className="flex flex-col items-end gap-1">
                    {isCurrentLevel ? (
                      <span className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-black rounded-lg border border-primary/30 uppercase">
                        ACTIVE
                      </span>
                    ) : isUnlocked ? (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 text-[10px] font-black rounded-lg border border-green-500/30 uppercase">
                        UNLOCKED
                      </span>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-zinc-500 line-through decoration-red-500/50">${formatNumber(level.price)}</span>
                        <span className="text-xl font-display font-bold text-white">${formatNumber(level.referralPrice)}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-[10px] text-zinc-300 font-bold">${formatNumber(level.dailyProfit)}</span>
                      <TrendingUp className="w-3 h-3 text-green-400" />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-[10px] text-zinc-300 font-bold">{level.dailyChallengeLimit} Tasks</span>
                      <Target className="w-3 h-3 text-yellow-500" />
                    </div>
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
