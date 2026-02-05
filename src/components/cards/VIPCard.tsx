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

  const levelIntensity: Record<number, { glow: string, border: string, overlay: string }> = {
    0: { glow: 'shadow-[0_0_15px_rgba(255,255,255,0.1)]', border: 'border-white/10', overlay: 'bg-black/40' },
    1: { glow: 'shadow-[0_0_25px_rgba(59,130,246,0.2)]', border: 'border-blue-500/20', overlay: 'bg-blue-950/30' },
    2: { glow: 'shadow-[0_0_30px_rgba(255,255,255,0.25)]', border: 'border-slate-200/20', overlay: 'bg-slate-900/30' },
    3: { glow: 'shadow-[0_0_40px_rgba(168,85,247,0.3)]', border: 'border-purple-500/30', overlay: 'bg-purple-950/30' },
    4: { glow: 'shadow-[0_0_50px_rgba(234,179,8,0.35)]', border: 'border-yellow-500/30', overlay: 'bg-yellow-950/30' },
    5: { glow: 'shadow-[0_0_80px_rgba(255,215,0,0.6),0_0_40px_rgba(59,130,246,0.4)]', border: 'border-yellow-400/60', overlay: 'bg-yellow-950/10' },
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
      className={`relative h-[360px] w-full rounded-[2.5rem] overflow-hidden cursor-pointer border ${intensity.border} ${intensity.glow} transition-all duration-500 group`}
    >
      <div 
        className="absolute inset-0 z-0 pointer-events-none bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
        style={{ backgroundImage: `url(${stadiumBackgrounds[vipLevel.level] || stadiumBackgrounds[0]})` }} 
      />
      
      <div className={`absolute inset-0 z-[1] ${intensity.overlay} backdrop-blur-[1px] transition-opacity duration-500 group-hover:opacity-60`} />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black via-black/30 to-transparent" />

      <div className="absolute left-0 bottom-0 z-[2] h-full w-[50%] flex items-end justify-center pointer-events-none overflow-visible">
        <motion.img 
          animate={controls}
          src={ronaldoImages[vipLevel.level]} 
          alt="Cristiano Ronaldo"
          className="h-[110%] w-full object-contain object-bottom drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] group-hover:scale-110 transition-transform duration-700 ease-out origin-bottom"
          style={{
            filter: vipLevel.level === 5 ? `drop-shadow(0 0 45px rgba(255,215,0,0.8)) drop-shadow(0 0 20px rgba(59,130,246,0.6))` : 
                    vipLevel.level === 4 ? `drop-shadow(0 0 35px rgba(234,179,8,0.7))` :
                    vipLevel.level === 3 ? `drop-shadow(0 0 30px rgba(168,85,247,0.6))` :
                    vipLevel.level === 2 ? `drop-shadow(0 0 20px rgba(255,255,255,0.4))` :
                    vipLevel.level === 1 ? `drop-shadow(0 0 15px rgba(59,130,246,0.3))` :
                    `drop-shadow(0 0 10px rgba(255,255,255,0.2))`
          }}
        />
      </div>

      <div className="relative z-[3] p-6 ml-auto w-[60%] h-full flex flex-col justify-between text-right">
        <div className="flex flex-col items-end gap-1">
          <div className={`w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl group-hover:border-primary/40 transition-all duration-500`}>
            <Crown className={`w-6 h-6 ${vipLevel.level >= 5 ? 'text-yellow-400' : 'text-zinc-200'} group-hover:scale-110 transition-transform`} />
          </div>
          <h3 className="font-display text-3xl font-bold text-white tracking-tight leading-none mt-2">
            VIP {vipLevel.level}
          </h3>
          <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">
            {vipLevel.nameAr}
          </p>

          <div className="space-y-2 mt-4 w-full">
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-3 border border-white/5 flex items-center justify-end gap-3">
              <span className="text-[10px] text-zinc-400 font-bold uppercase">المهام</span>
              <p className="text-lg font-display font-bold text-white">{vipLevel.dailyChallengeLimit}</p>
              <Target className="w-4 h-4 text-primary" />
            </div>

            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-3 border border-white/5 flex items-center justify-end gap-3">
              <span className="text-[10px] text-zinc-400 font-bold uppercase">الربح</span>
              <p className="text-lg font-display font-bold text-green-400">+{formatNumber(vipLevel.dailyProfit)}</p>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
          </div>
        </div>

        <div className="w-full pt-4">
          {!isUnlocked && (
            <GoldButton
              variant="primary"
              className="w-full h-14 rounded-2xl shadow-[0_10px_30px_-10px_rgba(234,179,8,0.5)] group-hover:shadow-[0_15px_40px_-10px_rgba(234,179,8,0.6)] group-hover:scale-[1.02] transition-all duration-300 relative overflow-hidden px-2"
              onClick={(e) => {
                e.stopPropagation();
                handleAction();
              }}
            >
              <div className="flex items-center justify-center gap-1 w-full overflow-hidden">
                <span className="text-[13px] font-black tracking-tighter whitespace-nowrap">فتح الآن — {formatNumber(discountedPrice)} USDT</span>
              </div>
              <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-shimmer" />
            </GoldButton>
          )}
          
          {isUnlocked && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-2xl h-14 flex items-center justify-center gap-3 backdrop-blur-md w-full">
              <span className="text-green-400 font-black tracking-widest text-sm">تم التفعيل</span>
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-4 h-4 text-black stroke-[3px]" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`absolute inset-0 pointer-events-none z-[4] overflow-hidden ${vipLevel.level === 5 ? 'opacity-70' : 'opacity-40'}`}>
        {[...Array(vipLevel.level === 5 ? 30 : vipLevel.level === 4 ? 20 : vipLevel.level === 3 ? 15 : vipLevel.level * 5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 150 }}
            animate={{ 
              opacity: [0, 1, 0], 
              y: -250,
              x: (Math.random() - 0.5) * 400,
              scale: [0.5, 1.2, 0.3],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: (vipLevel.level === 5 ? 1.2 : 2.0) + Math.random() * 2, 
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: "linear"
            }}
            className={`absolute bottom-[-20px] left-1/2 w-1 h-1 rounded-full ${
              vipLevel.level === 5 ? 'bg-yellow-200 shadow-[0_0_12px_rgba(255,215,0,1)]' : 
              vipLevel.level === 4 ? 'bg-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.8)]' : 
              vipLevel.level === 3 ? 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]' :
              vipLevel.level === 2 ? 'bg-slate-200' : 
              vipLevel.level === 1 ? 'bg-blue-400' : 'bg-white/40'
            }`}
          />
        ))}
        {vipLevel.level === 5 && (
          <>
            <motion.div 
              animate={{ 
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-t from-yellow-500/30 via-transparent to-transparent mix-blend-screen"
            />
            <motion.div 
              animate={{ 
                boxShadow: ['0 0 20px rgba(255,215,0,0.2)', '0 0 60px rgba(255,215,0,0.5)', '0 0 20px rgba(255,215,0,0.2)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-[2.5rem]"
            />
          </>
        )}
      </div>
    </motion.div>
  );
};
