import { motion } from 'framer-motion';
import { Star, Lock, ChevronLeft } from 'lucide-react';
import { Challenge } from '@/data/mockData';

interface ChallengeCardProps {
  challenge: Challenge;
  userVipLevel: number;
  index: number;
}

export const ChallengeCard = ({ challenge, userVipLevel, index }: ChallengeCardProps) => {
  const isLocked = challenge.minVipLevel > userVipLevel;
  
  const difficultyConfig = {
    easy: { color: 'text-green-400', bgColor: 'bg-green-400/20', label: 'سهل' },
    medium: { color: 'text-yellow-400', bgColor: 'bg-yellow-400/20', label: 'متوسط' },
    hard: { color: 'text-accent', bgColor: 'bg-accent/20', label: 'صعب' },
  };

  const difficulty = difficultyConfig[challenge.difficulty];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: isLocked ? 1 : 1.02 }}
      whileTap={{ scale: isLocked ? 1 : 0.98 }}
      className={`relative bg-gradient-card rounded-2xl overflow-hidden border border-border ${
        isLocked ? 'opacity-60' : 'cursor-pointer hover:border-primary/50'
      }`}
    >
      {/* Locked Overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center">
            <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">VIP {challenge.minVipLevel}+</p>
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className={`${difficulty.bgColor} ${difficulty.color} px-2 py-1 rounded-full text-xs font-medium mr-3`}>
            {difficulty.label}
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-semibold text-foreground text-base mb-1">
              {challenge.titleAr}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {challenge.descriptionAr}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-1">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {challenge.dailyLimit} يومياً
            </span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-primary text-lg">
              ${challenge.reward}
            </span>
            <Star className="w-4 h-4 text-primary fill-primary" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
