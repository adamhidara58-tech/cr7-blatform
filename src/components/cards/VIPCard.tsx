import { motion, useAnimation } from 'framer-motion';
import { Check, Crown, Target, TrendingUp, Wallet, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VIPLevel } from '@/data/mockData';
import { GoldButton } from '../ui/GoldButton';

// Import New VIP Images from processed folder
import vip0 from '@/assets/vip-processed/vip0.png';
import vip1 from '@/assets/vip-processed/vip1.png';
import vip2 from '@/assets/vip-processed/vip2.png';
import vip3 from '@/assets/vip-processed/vip3.png';
import vip4 from '@/assets/vip-processed/vip4.png';
import vip5 from '@/assets/vip-processed/vip5.png';

interface VIPCardProps {
  vipLevel: VIPLevel;
  currentLevel: number;
  index: number;
  referralDiscount?: number;
}

const ronaldoImages: Record<number, string> = {
  0: vip0,
  1: vip1,
  2: vip2,
  3: vip3,
  4: vip4,
  5: vip5,
};

// Original Stadium backgrounds restored
const stadiumBackgrounds: Record<number, string> = {
  0: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgWO2aWvgj9iecV4Vy1q2hH_s4j4iQXTvFmlpIPZWB7oWinie5k28keUV3RIfX45mPEgfzRYLUC8r9SOB6R5v_8JJDRHKLgkDSLvndphI7BYB6GTDomQauLURv3ay6bemePNU4oaVZbm2fPLL2Jv3PQ5c4CbE2Guw0PYdjD3citekYQDSwRJOSjPOca5lI/s1600/IMG_2561.png',
  1: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh4mOmSgoCoctyIOJyLKCbocZpRqFB29IhBd4Q9fbAyKP_c7XasCLMGfeSX6sKXNbEkfh7nLyYGF1yPV42ja1jzEohg432ABmQIkRFdCsd3Pv_r32EMJ81R-REcV_go9r-sQYSp9shEIuHgxEgEY-SoZ33udIoVxr3q-ac-jbDkfibNaXvftpNCjsLMGoY/s1600/IMG_2560.png',
  2: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjo0TFuiXxehVTorQw5zImbrMGPa6kaKZF2YxvaHiVqMaJIoIHcxfW95PX-juwZ3rKDJokReHPA3eLmTeWSryfyDTsfdmLv_KrtGsn1koOB1rvpp4nCUGDcZnzotZSDGWJeOA6K1nqh4MZ3L9MW1c2cOIcYTZEnuUVThMTfAstcHjL1KORXgBMfMfDZtns/s1600/IMG_2562.jpeg',
  3: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh_cd6NYjdWfvpHXCplBWhkZndYiF1_w73CqlsyzWfPH5-9m488YEUE_YWmVu9rZ2pNphLxo-aEMKGRvaX7ESSctmWvuudxkPoXk7Q95WUvzlV2FWQUg_c4PHFKqfB37_BIJxxCC9JBs-_XqYK5EDuX9PeAbAy2tFFtCiyvd3PyyE-3oIywAUMebKIuf08/s1600/IMG_2558.png',
  4: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgSgxijf0Qsz757uduMUR9pjq6F1ILmbdTImLqNs62EXOFjVMLzNUaldV5_gWrjOAMdPjUNDquu6OZSQaw1yZl0eQU314cLrcls67H7V53yt7Dj2Z6cUdeLvumaOTOnwcAztNVxMgoGY5TjEk0QPY0jnar28qxN-YHwQIobRbsXW5KYbB0VSWr3yQIbxN4/s1600/IMG_2559.png',
  5: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhmsHqltpEzmafR80EfvGx5Jcicbx3cRB7dgnFFKfNIsvQ9CdAPmU38ANrD8X8w6waTEjVS_orRm88-qGMJ03pjPCSTwtS8_9t_mudx8ui2zalEEB7isMEx4b3Dkk4ijloeZKSy_xC_uZaGnpuhgfdVPc14ZMxz5VmmwIU3ccP8nBVI3ljaWSupAE0V6TA/s1600/IMG_2557.png',
};

const levelStyles: Record<number, { 
  glow: string, 
  border: string, 
  overlay: string, 
  bgGradient: string,
  particleColor: string 
}> = {
  0: { glow: 'shadow-[0_0_20px_rgba(30,58,138,0.3)]', border: 'border-blue-900/30', overlay: 'bg-blue-950/40', bgGradient: 'from-blue-950 via-blue-900/20 to-transparent', particleColor: 'bg-blue-400' },
  1: { glow: 'shadow-[0_0_25px_rgba(59,130,246,0.4)]', border: 'border-blue-500/30', overlay: 'bg-blue-900/40', bgGradient: 'from-blue-900 via-blue-800/20 to-transparent', particleColor: 'bg-blue-300' },
  2: { glow: 'shadow-[0_0_30px_rgba(255,255,255,0.3)]', border: 'border-slate-200/30', overlay: 'bg-slate-900/50', bgGradient: 'from-slate-900 via-slate-800/20 to-transparent', particleColor: 'bg-white' },
  3: { glow: 'shadow-[0_0_40px_rgba(168,85,247,0.4)]', border: 'border-purple-500/40', overlay: 'bg-purple-950/50', bgGradient: 'from-purple-950 via-purple-900/20 to-transparent', particleColor: 'bg-purple-400' },
  4: { glow: 'shadow-[0_0_50px_rgba(239,68,68,0.5)]', border: 'border-red-500/50', overlay: 'bg-red-950/40', bgGradient: 'from-red-950 via-yellow-900/20 to-transparent', particleColor: 'bg-yellow-500' },
  5: { glow: 'shadow-[0_0_100px_rgba(255,215,0,0.8)]', border: 'border-yellow-400/80', overlay: 'bg-yellow-950/10', bgGradient: 'from-yellow-950 via-yellow-900/60 to-transparent', particleColor: 'bg-yellow-200' },
};

export const VIPCard = ({ vipLevel, currentLevel, index }: VIPCardProps) => {
  const navigate = useNavigate();
  const controls = useAnimation();
  const isUnlocked = vipLevel.level <= currentLevel;
  const style = levelStyles[vipLevel.level] || levelStyles[0];

  const handleAction = async () => {
    await controls.start({
      scale: [1, 1.02, 1],
      transition: { duration: 0.3 }
    });
    navigate('/profile', { state: { openDeposit: true } });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -10, transition: { duration: 0.4, ease: "easeOut" } }}
      onClick={handleAction}
      className={`relative h-[440px] w-full rounded-[2.5rem] overflow-hidden cursor-pointer border ${style.border} ${style.glow} transition-all duration-500 group bg-black`}
    >
      {/* Background Stadium Effect */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
        style={{ backgroundImage: `url(${stadiumBackgrounds[vipLevel.level] || stadiumBackgrounds[0]})` }} 
      />
      <div className={`absolute inset-0 z-[1] ${style.overlay} backdrop-blur-[1px]`} />
      <div className={`absolute inset-0 z-[1] bg-gradient-to-t ${style.bgGradient}`} />

      {/* Ronaldo Image */}
      <div className={`absolute ${vipLevel.level === 5 ? 'left-0' : 'left-[-5%]'} bottom-0 z-[2] h-full w-[65%] flex items-end justify-center pointer-events-none`}>
        <motion.img 
          animate={controls}
          src={ronaldoImages[vipLevel.level]} 
          alt={vipLevel.name}
          className={`${vipLevel.level === 5 ? 'h-[100%] w-full' : 'h-[100%] w-auto'} object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-700 ease-out origin-bottom`}
          style={{
            filter: vipLevel.level === 5 ? `drop-shadow(0 0 30px rgba(255,215,0,0.6))` : 'none',
            scale: vipLevel.level === 2 ? 1.2 : 1 // Adjusted VIP 2 scale
          }}
        />
      </div>

      {/* Content Area */}
      <div className="relative z-[3] p-6 ml-auto w-[55%] h-full flex flex-col justify-between text-right">
        <div className="flex flex-col items-end">
          {/* VIP Badge */}
          <div className={`w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-xl border ${style.border} flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
            <Crown className={`w-8 h-8 ${vipLevel.level === 5 ? 'text-yellow-400' : 'text-white'}`} />
          </div>
          
          <h3 className="font-display text-4xl font-black text-white mt-4 tracking-tighter italic">
            VIP {vipLevel.level}
          </h3>
          <p className="text-sm font-bold text-yellow-500 uppercase tracking-widest mt-1">
            {vipLevel.nameAr}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-2 mt-6 w-full">
            <div className="bg-black/60 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center justify-end gap-3 group-hover:border-yellow-500/30 transition-colors">
              <div className="text-right">
                <p className="text-[10px] text-zinc-400 font-bold uppercase leading-none">المهام اليومية</p>
                <p className="text-lg font-display font-bold text-white">{vipLevel.dailyChallengeLimit}</p>
              </div>
              <Target className="w-5 h-5 text-yellow-500" />
            </div>

            <div className="bg-black/60 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center justify-end gap-3 group-hover:border-green-500/30 transition-colors">
              <div className="text-right">
                <p className="text-[10px] text-zinc-400 font-bold uppercase leading-none">الربح اليومي</p>
                <p className="text-lg font-display font-bold text-green-400">+{formatNumber(vipLevel.dailyProfit)}</p>
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            
            <div className="bg-black/60 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center justify-end gap-3 group-hover:border-blue-500/30 transition-colors">
              <div className="text-right">
                <p className="text-[10px] text-zinc-400 font-bold uppercase leading-none">إجمالي الربح</p>
                <p className="text-lg font-display font-bold text-blue-400">{formatNumber(vipLevel.totalProfit)}</p>
              </div>
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full pt-4">
          {!isUnlocked ? (
            <div className="space-y-3">
              {/* Pricing Display */}
              <div className="flex flex-col items-end gap-0">
                <span className="text-xs text-zinc-500 line-through decoration-red-500/70">
                  {formatNumber(vipLevel.price)} USDT
                </span>
                <span className="text-2xl font-black text-white">
                  {formatNumber(vipLevel.referralPrice)} <span className="text-sm text-yellow-500">USDT</span>
                </span>
              </div>

              <GoldButton
                variant="primary"
                className="w-full h-14 rounded-2xl relative overflow-hidden group/btn border border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction();
                }}
              >
                <div className="flex items-center justify-center gap-2 w-full relative z-10">
                  <span className="text-lg font-black uppercase tracking-tighter">فتح الآن — ${formatNumber(vipLevel.referralPrice)}</span>
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </div>
                
                {/* Animation Effects */}
                <motion.div 
                  animate={{ 
                    x: ['-100%', '200%'],
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    repeatDelay: 0.5
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                />
              </GoldButton>
            </div>
          ) : (
            <div className="bg-green-500/20 border border-green-500/50 rounded-2xl h-14 flex items-center justify-center gap-3 backdrop-blur-md w-full">
              <span className="text-green-400 font-black tracking-widest text-sm uppercase">تم التفعيل</span>
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.6)]">
                <Check className="w-4 h-4 text-black stroke-[3px]" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Special Effects for VIP 5 */}
      {vipLevel.level === 5 && (
        <div className="absolute inset-0 pointer-events-none z-[4]">
          <motion.div 
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 to-transparent mix-blend-overlay"
          />
        </div>
      )}

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none z-[4] overflow-hidden opacity-50">
        {[...Array(vipLevel.level === 5 ? 30 : 15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 400 }}
            animate={{ 
              opacity: [0, 1, 0], 
              y: -100,
              x: (Math.random() - 0.5) * 400 + 200,
              scale: [0.5, 1, 0.5],
            }}
            transition={{ 
              duration: 2 + Math.random() * 3, 
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
            className={`absolute bottom-0 w-1 h-1 rounded-full ${style.particleColor}`}
          />
        ))}
      </div>
    </motion.div>
  );
};
