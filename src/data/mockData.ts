// Mock data for CR7 Elite Platform

export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  vipLevel: number;
  invitationCode: string;
  totalEarned: number;
  avatar?: string;
  dailyChallengesCompleted: number;
  dailyChallengesLimit: number;
}

export interface Challenge {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl: string;
  minVipLevel: number;
  dailyLimit: number;
  isActive: boolean;
  category: string;
}

export interface VIPLevel {
  level: number;
  name: string;
  nameAr: string;
  price: number;
  dailyChallengeLimit: number;
  rewardMultiplier: number;
  description: string;
  descriptionAr: string;
  benefits: string[];
  benefitsAr: string[];
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'challenge' | 'commission' | 'vip_upgrade';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface Referral {
  id: string;
  username: string;
  level: number;
  totalCommission: number;
  joinedAt: string;
  isActive: boolean;
}

export const mockUser: User = {
  id: '1',
  username: 'CR7_Champion',
  email: 'champion@cr7elite.com',
  balance: 2547.50,
  vipLevel: 3,
  invitationCode: 'CR7ELITE2024',
  totalEarned: 12450.00,
  dailyChallengesCompleted: 3,
  dailyChallengesLimit: 10,
};

export const mockChallenges: Challenge[] = [
  {
    id: '1',
    title: 'Social Media Share',
    titleAr: 'مشاركة على السوشيال ميديا',
    description: 'Share our platform on your social media',
    descriptionAr: 'شارك منصتنا على وسائل التواصل الاجتماعي',
    reward: 15,
    difficulty: 'easy',
    imageUrl: '/placeholder.svg',
    minVipLevel: 0,
    dailyLimit: 3,
    isActive: true,
    category: 'social',
  },
  {
    id: '2',
    title: 'Video Review',
    titleAr: 'مراجعة بالفيديو',
    description: 'Create a short video review about CR7 Elite',
    descriptionAr: 'أنشئ فيديو قصير عن منصة CR7 Elite',
    reward: 45,
    difficulty: 'medium',
    imageUrl: '/placeholder.svg',
    minVipLevel: 1,
    dailyLimit: 2,
    isActive: true,
    category: 'content',
  },
  {
    id: '3',
    title: 'Premium Content',
    titleAr: 'محتوى متميز',
    description: 'Create high-quality promotional content',
    descriptionAr: 'أنشئ محتوى ترويجي عالي الجودة',
    reward: 100,
    difficulty: 'hard',
    imageUrl: '/placeholder.svg',
    minVipLevel: 3,
    dailyLimit: 1,
    isActive: true,
    category: 'premium',
  },
  {
    id: '4',
    title: 'Daily Login',
    titleAr: 'تسجيل الدخول اليومي',
    description: 'Login daily to earn bonus points',
    descriptionAr: 'سجل دخولك يومياً للحصول على نقاط إضافية',
    reward: 5,
    difficulty: 'easy',
    imageUrl: '/placeholder.svg',
    minVipLevel: 0,
    dailyLimit: 1,
    isActive: true,
    category: 'daily',
  },
  {
    id: '5',
    title: 'Invite Friends',
    titleAr: 'دعوة الأصدقاء',
    description: 'Invite new members to join CR7 Elite',
    descriptionAr: 'ادعُ أعضاء جدد للانضمام إلى CR7 Elite',
    reward: 25,
    difficulty: 'medium',
    imageUrl: '/placeholder.svg',
    minVipLevel: 0,
    dailyLimit: 5,
    isActive: true,
    category: 'referral',
  },
  {
    id: '6',
    title: 'Elite Challenge',
    titleAr: 'تحدي النخبة',
    description: 'Complete exclusive VIP-only challenges',
    descriptionAr: 'أكمل تحديات حصرية لأعضاء VIP فقط',
    reward: 200,
    difficulty: 'hard',
    imageUrl: '/placeholder.svg',
    minVipLevel: 5,
    dailyLimit: 1,
    isActive: true,
    category: 'elite',
  },
];

export const vipLevels: VIPLevel[] = [
  {
    level: 0,
    name: 'Rookie',
    nameAr: 'مبتدئ',
    price: 0,
    dailyChallengeLimit: 3,
    rewardMultiplier: 1,
    description: 'Start your journey',
    descriptionAr: 'ابدأ رحلتك',
    benefits: ['3 daily challenges', 'Basic support'],
    benefitsAr: ['3 تحديات يومية', 'دعم أساسي'],
  },
  {
    level: 1,
    name: 'Bronze',
    nameAr: 'برونزي',
    price: 50,
    dailyChallengeLimit: 5,
    rewardMultiplier: 1.1,
    description: 'Begin your ascent',
    descriptionAr: 'ابدأ صعودك',
    benefits: ['5 daily challenges', '10% bonus rewards', 'Priority support'],
    benefitsAr: ['5 تحديات يومية', '10% مكافآت إضافية', 'دعم أولوي'],
  },
  {
    level: 2,
    name: 'Silver',
    nameAr: 'فضي',
    price: 150,
    dailyChallengeLimit: 8,
    rewardMultiplier: 1.25,
    description: 'Rise above the rest',
    descriptionAr: 'ارتقِ فوق الجميع',
    benefits: ['8 daily challenges', '25% bonus rewards', 'Exclusive challenges'],
    benefitsAr: ['8 تحديات يومية', '25% مكافآت إضافية', 'تحديات حصرية'],
  },
  {
    level: 3,
    name: 'Gold',
    nameAr: 'ذهبي',
    price: 350,
    dailyChallengeLimit: 12,
    rewardMultiplier: 1.5,
    description: 'Shine like a champion',
    descriptionAr: 'تألق كالبطل',
    benefits: ['12 daily challenges', '50% bonus rewards', 'VIP support', 'Weekly bonuses'],
    benefitsAr: ['12 تحدي يومي', '50% مكافآت إضافية', 'دعم VIP', 'مكافآت أسبوعية'],
  },
  {
    level: 4,
    name: 'Platinum',
    nameAr: 'بلاتيني',
    price: 750,
    dailyChallengeLimit: 18,
    rewardMultiplier: 1.75,
    description: 'Elite performance',
    descriptionAr: 'أداء النخبة',
    benefits: ['18 daily challenges', '75% bonus rewards', '24/7 VIP support', 'Exclusive events'],
    benefitsAr: ['18 تحدي يومي', '75% مكافآت إضافية', 'دعم VIP على مدار الساعة', 'فعاليات حصرية'],
  },
  {
    level: 5,
    name: 'Diamond',
    nameAr: 'ماسي',
    price: 1500,
    dailyChallengeLimit: 25,
    rewardMultiplier: 2,
    description: 'Unbreakable excellence',
    descriptionAr: 'تميز لا يُكسر',
    benefits: ['25 daily challenges', '100% bonus rewards', 'Personal manager', 'Elite challenges'],
    benefitsAr: ['25 تحدي يومي', '100% مكافآت إضافية', 'مدير شخصي', 'تحديات النخبة'],
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'challenge',
    amount: 45,
    description: 'Video Review Challenge',
    status: 'completed',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    type: 'commission',
    amount: 25,
    description: 'Referral Commission - Level 1',
    status: 'completed',
    createdAt: '2024-01-14T15:45:00Z',
  },
  {
    id: '3',
    type: 'withdrawal',
    amount: -200,
    description: 'Withdrawal to USDT Wallet',
    status: 'pending',
    createdAt: '2024-01-13T09:00:00Z',
  },
  {
    id: '4',
    type: 'vip_upgrade',
    amount: -350,
    description: 'VIP Level 3 Upgrade',
    status: 'completed',
    createdAt: '2024-01-10T12:00:00Z',
  },
  {
    id: '5',
    type: 'deposit',
    amount: 500,
    description: 'USDT Deposit',
    status: 'completed',
    createdAt: '2024-01-08T18:30:00Z',
  },
];

export const mockReferrals: Referral[] = [
  {
    id: '1',
    username: 'Alex_CR7Fan',
    level: 1,
    totalCommission: 125.50,
    joinedAt: '2024-01-10T10:00:00Z',
    isActive: true,
  },
  {
    id: '2',
    username: 'Maria_Elite',
    level: 1,
    totalCommission: 89.25,
    joinedAt: '2024-01-08T14:30:00Z',
    isActive: true,
  },
  {
    id: '3',
    username: 'John_Winner',
    level: 2,
    totalCommission: 45.00,
    joinedAt: '2024-01-05T09:15:00Z',
    isActive: false,
  },
  {
    id: '4',
    username: 'Sara_Champion',
    level: 1,
    totalCommission: 210.75,
    joinedAt: '2024-01-03T16:45:00Z',
    isActive: true,
  },
];

export const stats = {
  totalUsers: 15420,
  totalPaid: 2547890,
  activeChallenges: 24,
  topEarner: 45670,
};
