import { motion, useAnimation } from 'framer-motion';
import { Check, Crown, Zap, Calendar, TrendingUp, DollarSign, Target, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VIPLevel } from '@/data/mockData';
import { GoldButton } from '../ui/GoldButton';

// Import New VIP Images
import vip0 from '@/assets/vip/vip-0.png';
import vip1 from '@/assets/vip/vip-1.png';
import vip2 from '@/assets/vip/vip-2.png';
import vip3 from '@/assets/vip/vip-3.png';
import vip4 from '@/assets/vip/vip-4.png';
import vip5 from '@/assets/vip/vip-5.png';

interface VIPCardProps {
  vipLevel: VIPLevel;
  currentLevel: number;
  index: number;
  referralDiscount?: number;
}

const ronaldoImages: Record<number, string> = {
  0: vip0,
  0.5: vip0,
  1: vip1,
  2: vip2,
  3: vip3,
  4: vip4,
  5: vip5,
};

// Stadium backgrounds from user provided link
const stadiumBackgrounds: Record<number, string> = {
  0: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgWO2aWvgj9iecV4Vy1q2hH_s4j4iQXTvFmlpIPZWB7oWinie5k28keUV3RIfX45mPEgfzRYLUC8r9SOB6R5v_8JJDRHKLgkDSLvndphI7BYB6GTDomQauLURv3ay6bemePNU4oaVZbm2fPLL2Jv3PQ5c4CbE2Guw0PYdjD3citekYQDSwRJOSjPOca5lI/s1600/IMG_2561.png',
  1: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh4mOmSgoCoctyIOJyLKCbocZpRqFB29IhBd4Q9fbAyKP_c7XasCLMGfeSX6sKXNbEkfh7nLyYGF1yPV42ja1jzEohg432ABmQIkRFdCsd3Pv_r32EMJ81R-REcV_go9r-sQYSp9shEIuHgxEgEY-SoZ33udIoVxr3q-ac-jbDkfibNaXvftpNCjsLMGoY/s1600/IMG_2560.png',
  2: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjo0TFuiXxehVTorQw5zImbrMGPa6kaKZF2YxvaHiVqMaJIoIHcxfW95PX-juwZ3rKDJokReHPA3eLmTeWSryfyDTsfdmLv_KrtGsn1koOB1rvpp4nCUGDcZnzotZSDGWJeOA6K1nqh4MZ3L9MW1c2cOIcYTZEnuUVThMTfAstcHjL1KORXgBMfMfDZtns/s1600/IMG_2562.jpeg',
  3: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh_cd6NYjdWfvpHXCplBWhkZndYiF1_w73CqlsyzWfPH5-9m488YEUE_YWmVu9rZ2pNphLxo-aEMKGRvaX7ESSctmWvuudxkPoXk7Q95WUvzlV2FWQUg_c4PHFKqfB37_BIJxxCC9JBs-_XqYK5EDuX9PeAbAy2tFFtCiyvd3PyyE-3oIywAUMebKIuf08/s1600/IMG_2558.png',
  4: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgSgxijf0Qsz757uduMUR9pjq6F1ILmbdTImLqNs62EXOFjVMLzNUaldV5_gWrjOAMdPjUNDquu6OZSQaw1yZl0eQU314cLrcls67H7V53yt7Dj2Z6cUdeLvumaOTOnwcAztNVxMgoGY5TjEk0QPY0jnar28qxN-YHwQIobRbsXW5KYbB0VSWr3yQIbxN4/s1600/IMG_2559.png',
  5: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhmsHqltpEzmafR80EfvGx5Jcicbx3cRB7dgnFFKfNIsvQ9CdAPmU38ANrD8X8w6waTEjVS_orRm88-qGMJ03pjPCSTwtS8_9t_mudx8ui2zalEEB7isMEx4b3Dkk4ijloeZKSy_xC_uZaGnpuhgfdVPc14ZMxz5VmmwIU3ccP8nBVI3ljaWSupAE0V6TA/s1600/IMG_2557.png',
};

export const VIPCard = ({ vipLevel, currentLevel, index, referralDiscount = 0 }: VIPCardProps) => {
  const navigate = useNavigate();
  const controls = useAnimation();
  const isCurrentLevel = vipLevel.level === currentLevel;
  const isUnlocked = vipLevel.level <= currentLevel;

  const originalPrice = vipLevel.price;
  const effectiveDiscount = referralDiscount > 0 ? referralDiscount : 20;
  const discountedPrice = Math.max(0, originalPrice - effectiveDiscount);

  // Intensity levels for glow/lights based on VIP level
  const levelIntensity: Record<number, { glow: string, border: string, overlay: string }> = {
    0: { glow: 'shadow-[0_0_20px_rgba(255,255,255,0.05)]', border: 'border-white/10', overlay: 'bg-black/40' },
    1: { glow: 'shadow-[0_0_30px_rgba(59,130,246,0.1)]', border: 'border-blue-500/20', overlay: 'bg-blue-950/30' },
    2: { glow: 'shadow-[0_0_30px_rgba(148,163,184,0.15)]', border: 'border-slate-400/20', overlay: 'bg-slate-900/30' },
    3: { glow: 'shadow-[0_0_40px_rgba(168,85,247,0.2)]', border: 'border-purple-500/30', overlay: 'bg-purple-950/30' },
    4: { glow: 'shadow-[0_0_40px_rgba(239,68,68,0.2)]', border: 'border-red-500/30', overlay: 'bg-red-950/30' },
    5: { glow: 'shadow-[0_0_60px_rgba(255,215,0,0.3)]', border: 'border-yellow-500/40', overlay: 'bg-yellow-950/20' },
  };

  const intensity = levelIntensity[vipLevel.level] || levelIntensity[0];

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
      whileHover={{ y: -8, transition: { duration: 0.4, ease: "easeOut" } }}
      onClick={handleAction}
      className={`relative h-[320px] w-full rounded-[2.5rem] overflow-hidden cursor-pointer border ${intensity.border} ${intensity.glow} transition-all duration-500 group`}
    >
      {/* Stadium Background Layer */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
        style={{ backgroundImage: `url(${stadiumBackgrounds[vipLevel.level] || stadiumBackgrounds[0]})` }} 
      />
      
      {/* Dark Overlay for Contrast */}
      <div className={`absolute inset-0 z-[1] ${intensity.overlay} backdrop-blur-[1px] transition-opacity duration-500 group-hover:opacity-60`} />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black via-black/20 to-transparent" />

      {/* Ronaldo Image - DOMINANT */}
      <div className="absolute left-0 bottom-0 z-[2] h-full w-[55%] flex items-end justify-center pointer-events-none overflow-visible">
        <motion.img 
          animate={controls}
          src={ronaldoImages[vipLevel.level]} 
          alt="Cristiano Ronaldo"
          className="h-[110%] w-full object-contain object-bottom drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] group-hover:scale-110 transition-transform duration-700 ease-out origin-bottom"
          style={{
            filter: vipLevel.level === 5 ? `drop-shadow(0 0 25px rgba(255,215,0,0.5))` : 
                    vipLevel.level === 4 ? `drop-shadow(0 0 20px rgba(239,68,68,0.4))` :
                    vipLevel.level === 3 ? `drop-shadow(0 0 20px rgba(168,85,247,0.4))` : 'none'
          }}
        />
      </div>

      {/* Content Side */}
      <div className="relative z-[3] p-7 ml-auto w-[55%] h-full flex flex-col justify-between text-right">
        <div>
          <div className="flex flex-col items-end gap-1 mb-4">
            <div className={`w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl group-hover:border-primary/40 transition-all duration-500`}>
              <Crown className={`w-6 h-6 ${vipLevel.level >= 5 ? 'text-yellow-400' : 'text-zinc-200'} group-hover:scale-110 transition-transform`} />
            </div>
            <h3 className="font-display text-4xl font-bold text-white tracking-tight leading-none mt-2">
              VIP {vipLevel.level}
            </h3>
            <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">
              {vipLevel.nameAr}
            </p>
          </div>

          {/* Stats Box */}
          <div className="space-y-2 mb-4">
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-3 border border-white/5 flex items-center justify-end gap-3">
              <span className="text-[10px] text-zinc-400 font-bold uppercase">المهام</span>
              <p className="text-lg font-display font-bold text-white">{vipLevel.dailyChallengeLimit}</p>
              <Target className="w-4 h-4 text-primary" />
            </div>

            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-3 border border-white/5 flex items-center justify-end gap-3">
              <span className="text-[10px] text-zinc-400 font-bold uppercase">الربح اليومي</span>
              <p className="text-lg font-display font-bold text-green-400">+{formatNumber(vipLevel.dailyProfit)}</p>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
          </div>
        </div>

        {/* Premium Action Button */}
        <div className="mt-auto">
          {!isUnlocked && (
            <GoldButton
              variant="primary"
              className="w-full h-14 rounded-2xl shadow-[0_10px_30px_-10px_rgba(234,179,8,0.5)] group-hover:shadow-[0_15px_40px_-10px_rgba(234,179,8,0.6)] group-hover:scale-[1.02] transition-all duration-300 relative overflow-hidden"
              onClick={(e) => {
                e.stopPropagation();
                handleAction();
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-black tracking-widest">فتح الآن — {formatNumber(discountedPrice)} USDT</span>
              </div>
              <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-shimmer" />
            </GoldButton>
          )}
          
          {isUnlocked && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-2xl h-14 flex items-center justify-center gap-3 backdrop-blur-md">
              <span className="text-green-400 font-black tracking-widest text-sm">تم التفعيل</span>
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-4 h-4 text-black stroke-[3px]" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Special Effects for High Levels */}
      {vipLevel.level >= 3 && (
        <div className="absolute inset-0 pointer-events-none z-[4] overflow-hidden opacity-30">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 100 }}
              animate={{ 
                opacity: [0, 1, 0], 
                y: -150,
                x: Math.random() * 200 - 100
              }}
              transition={{ 
                duration: 3 + Math.random() * 2, 
                repeat: Infinity,
                delay: Math.random() * 5
              }}
              className={`absolute bottom-0 left-1/2 w-1 h-1 rounded-full ${
                vipLevel.level === 5 ? 'bg-yellow-400' : 
                vipLevel.level === 4 ? 'bg-red-400' : 'bg-purple-400'
              }`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};
