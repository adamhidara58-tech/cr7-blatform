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
  club: string;
  clubAr: string;
  year: string;
  price: number;
  referralPrice: number;
  dailyChallengeLimit: number;
  simpleInterest: number;
  dailyProfit: number;
  totalProfit: number;
  description: string;
  descriptionAr: string;
  color: string;
  image: string;
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
    name: 'VIP 0',
    nameAr: 'Sporting CP – 2002',
    club: 'Sporting Lisbon',
    clubAr: 'سبورتينغ لشبونة',
    year: '2002',
    price: 0,
    referralPrice: 0,
    dailyChallengeLimit: 1,
    simpleInterest: 0,
    dailyProfit: 0.00,
    totalProfit: 0.00,
    description: 'Start your journey',
    descriptionAr: 'بداية الرحلة في لشبونة',
    color: '#1E3A8A',
    image: 'vip0.png'
  },
  {
    level: 1,
    name: 'VIP 1',
    nameAr: 'Manchester United – 2007',
    club: 'Manchester United',
    clubAr: 'مانشستر يونايتد',
    year: '2007',
    price: 30,
    referralPrice: 10,
    dailyChallengeLimit: 1,
    simpleInterest: 2,
    dailyProfit: 2.50,
    totalProfit: 912.00,
    description: 'Begin your ascent',
    descriptionAr: 'الرحلة مع الشياطين الحمر',
    color: '#3B82F6',
    image: 'vip1.png'
  },
  {
    level: 2,
    name: 'VIP 2',
    nameAr: 'Real Madrid – 2012',
    club: 'Real Madrid',
    clubAr: 'ريال مدريد',
    year: '2012',
    price: 58,
    referralPrice: 38,
    dailyChallengeLimit: 1,
    simpleInterest: 5,
    dailyProfit: 9.50,
    totalProfit: 3467.00,
    description: 'Rise above the rest',
    descriptionAr: 'تحقيق الأرقام القياسية مع الملكي',
    color: '#F8FAFC',
    image: 'vip2.png'
  },
  {
    level: 3,
    name: 'VIP 3',
    nameAr: 'Juventus – 2019',
    club: 'Juventus',
    clubAr: 'يوفنتوس',
    year: '2019',
    price: 120,
    referralPrice: 100,
    dailyChallengeLimit: 1,
    simpleInterest: 7,
    dailyProfit: 18.75,
    totalProfit: 6750.00,
    description: 'Shine like a champion',
    descriptionAr: 'الخبرة والقيادة في الدوري الإيطالي',
    color: '#A855F7',
    image: 'vip3.png'
  },
  {
    level: 4,
    name: 'VIP 4',
    nameAr: 'Portugal Legend – 2021',
    club: 'Portugal',
    clubAr: 'البرتغال',
    year: '2021',
    price: 358,
    referralPrice: 338,
    dailyChallengeLimit: 1,
    simpleInterest: 8,
    dailyProfit: 93.75,
    totalProfit: 34218.00,
    description: 'Elite performance',
    descriptionAr: 'الأسطورة مع المنتخب الوطني',
    color: '#EF4444',
    image: 'vip4.png'
  },
  {
    level: 5,
    name: 'VIP 5',
    nameAr: 'GOAT CR7 – Legacy',
    club: 'Legendary Career',
    clubAr: 'المسيرة الأسطورية',
    year: 'PRIME',
    price: 555,
    referralPrice: 535,
    dailyChallengeLimit: 1,
    simpleInterest: 10,
    dailyProfit: 168.75,
    totalProfit: 61593.00,
    description: 'Unbreakable excellence',
    descriptionAr: 'الوصول إلى القمة الأسطورية الخالدة',
    color: '#FFD700',
    image: 'vip5.png'
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
