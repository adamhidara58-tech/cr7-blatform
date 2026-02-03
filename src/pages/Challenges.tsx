import { motion } from 'framer-motion';
import { Trophy, Filter, Search } from 'lucide-react';
import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { ChallengeCard } from '@/components/cards/ChallengeCard';
import { mockChallenges, mockUser } from '@/data/mockData';

type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';

const Challenges = () => {
  const [filter, setFilter] = useState<DifficultyFilter>('all');

  const filteredChallenges = filter === 'all' 
    ? mockChallenges 
    : mockChallenges.filter(c => c.difficulty === filter);

  const filters: { key: DifficultyFilter; label: string }[] = [
    { key: 'all', label: 'الكل' },
    { key: 'easy', label: 'سهل' },
    { key: 'medium', label: 'متوسط' },
    { key: 'hard', label: 'صعب' },
  ];

  return (
    <PageLayout>
      {/* Header */}
      <section className="px-4 pt-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="w-6 h-6 text-primary" />
            <h1 className="font-display text-2xl text-foreground">التحديات اليومية</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            أكمل التحديات واربح مكافآت فورية
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-4"
        >
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="ابحث عن تحدي..."
            className="w-full bg-secondary/50 border border-border rounded-xl py-3 pr-10 pl-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            dir="rtl"
          />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        >
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === f.key
                  ? 'bg-gradient-gold text-primary-foreground shadow-gold'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="px-4 mb-4">
        <div className="bg-secondary/30 rounded-xl p-3 flex items-center justify-around">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{mockUser.dailyChallengesCompleted}</p>
            <p className="text-xs text-muted-foreground">مكتمل</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{mockUser.dailyChallengesLimit - mockUser.dailyChallengesCompleted}</p>
            <p className="text-xs text-muted-foreground">متبقي</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{filteredChallenges.length}</p>
            <p className="text-xs text-muted-foreground">متاح</p>
          </div>
        </div>
      </section>

      {/* Challenges Grid */}
      <section className="px-4 pb-6">
        <div className="space-y-3">
          {filteredChallenges.map((challenge, index) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              userVipLevel={mockUser.vipLevel}
              index={index}
            />
          ))}
        </div>
      </section>
    </PageLayout>
  );
};

export default Challenges;
