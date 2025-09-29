import {
  BadgeDollarSign,
  Banknote,
  BanknoteArrowDownIcon,
  Bitcoin,
  Car,
  ChartCandlestick,
  CircleDollarSign,
  CircleEllipsis,
  Coins,
  Flag,
  Ham,
  HandCoins,
  HeartPulse,
  History,
  Landmark,
  LandPlot,
  LayoutDashboard,
  LayoutDashboardIcon,
  NewspaperIcon,
  Receipt,
  School,
  Search,
  Settings,
  SquareUserRound,
  TrendingDown,
  TrendingUp,
  UserRoundCog,
  UserRoundPen,
} from 'lucide-react';
import { MdLockReset, MdSyncLock } from 'react-icons/md';

import type { TranTypes } from './constants';

export const getProfileLinks = (role?: string) => {
  return [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboardIcon,
    },
    {
      title: 'My Account',
      href: '/my-account',
      icon: SquareUserRound,
    },
    {
      title: 'Profile',
      href: '/dashboard/profile',
      icon: MdLockReset,
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: UserRoundPen,
    },
    {
      title: 'Change Password',
      href: '/change-password',
      icon: MdSyncLock,
    },
  ];
};

export const SidebarItems = [
  {
    title: 'Search',
    url: '/search',
    icon: Search,
  },
  {
    title: 'Blogs',
    url: '/dashboard/blogs',
    icon: NewspaperIcon,
  },
  {
    title: 'New Blog',
    url: '/dashboard/blogs/new-blog',
    icon: NewspaperIcon,
  },
  {
    title: 'Expense',
    url: '/dashboard/expense',
    icon: BanknoteArrowDownIcon,
  },
  {
    title: 'Profile',
    url: '/dashboard/profile',
    icon: UserRoundCog,
  },
  {
    title: 'Settings',
    url: '/dashboard/settings',
    icon: Settings,
  },
];

export const categories = [
  {
    name: 'Verbal Harassment',
    description:
      'Includes inappropriate comments, sexual jokes, or unwelcome advances that create a hostile environment.',
    img: '/img/verbal_harassment.jpg',
  },
  {
    name: 'Physical Harassment',
    description:
      'Unwanted touching, assault, or any form of physical intimidation with a sexual element.',
    img: '/img/physical_harassment.jpg',
  },
  {
    name: 'Cyber Harassment',
    description:
      'Online harassment, including explicit messages, revenge porn, or stalking through digital platforms',
    img: '/img/cyber_harassment.jpeg',
  },
  {
    name: 'Power-Based Harassment',
    description:
      'When a professor, supervisor, or senior figure coerces someone into unwanted sexual interactions by abusing their position of authority.',
    img: '/img/power-harassment.jpg',
  },
  {
    name: 'Peer Harassment',
    description:
      'Often seen in social circles, dorms, or student organizations, where students may be pressured or ridiculed into uncomfortable situations',
    img: '/img/peer_harassment.jpg',
  },
  {
    name: 'Retaliatory Harassment',
    description:
      'Occurs when a victim is threatened, punished, or ostracized for reporting an incident.',
    img: '/img/retaliatory_harassment.png',
  },
  {
    name: 'Street Harassment',
    description:
      'Though not unique to campuses, catcalling, inappropriate gestures, or unwanted advances in college spaces can be prevalent.',
    img: '/img/street_harassment.png',
  },
  {
    name: 'Hostile Environment',
    description:
      'When an overall culture of sexism or harassment prevents students from feeling safe and respected.',
    img: '/img/hostile_environment.jpg',
  },
  {
    name: 'Bullying Prevention',
    description:
      'Bullying prevention promotes safe, respectful environments through education, empathy, clear policies, and community support',
    img: '/img/bullying_prevention.jpg',
  },
  {
    name: 'Mental Health',
    description:
      'School bullying can severely impact students" mental health, leading to anxiety, depression, and long-term emotional distress. Early intervention and supportive environments are essential to protect well-being and foster resilience.',
    img: '/img/mental_health.png',
  },
  {
    name: 'School Safety',
    description:
      'School safety ensures a secure, inclusive environment by addressing physical security, mental health, and emergency preparedness',
    img: '/img/school_safety.jpg',
  },
  {
    name: 'Be Smart',
    description: 'All fun stuff, educations, science, socials',
    img: '/img/Mental.svg',
  },
  {
    name: 'anythings',
    description: 'learn something new',
    img: '/img/learn.png',
  },
  {
    name: 'html5',
    description: 'basic html5',
    img: '/img/html5.png',
  },
  {
    name: 'html advanced',
    description: 'advanced html',
    img: '/img/html-advance.jpg',
  },
];

export const menuItems = [
  { href: '/dashboard/blogs/new-blog', label: 'new-blog' },
  { href: '/blogs', label: 'blogs' },
  { href: '/playground', label: 'Playground' },
  { href: '/dashboard/expense', label: 'Expense' },
  { href: '/dashboard/trading', label: 'Trading' },
  { href: '/dashboard', label: 'Dashboard' },
  // { href: '/sign-in', label: 'sign-in-test' },
];

export const orderFilter = [
  { title: 'relevance', href: '/search?sort=relevance' },
  { title: 'newest', href: '/search?sort=desc' },
  { title: 'oldest', href: '/search?sort=esc' },
];

export const overviewCard = (
  trending: 'up' | 'down',
  trendPercentage: string,
  trendDescription: string,
  desc: string
) => {
  return [
    {
      name: 'post',
      title: 'Total Post',
      trending: trending === 'up' ? TrendingUp : TrendingDown,
      trendPercentage: trendPercentage,
      trendDescription: trendDescription,
      description: desc,
    },
    {
      name: 'user',
      title: 'Total User',
      trending: trending === 'up' ? TrendingUp : TrendingDown,
      trendPercentage: trendPercentage,
      trendDescription: trendDescription,
      description: desc,
    },
    {
      name: 'active user',
      title: 'Active User',
      trending: trending === 'up' ? TrendingUp : TrendingDown,
      trendPercentage: trendPercentage,
      trendDescription: trendDescription,
      description: desc,
    },
    {
      name: 'growth',
      title: 'Growth Rate',
      trending: trending === 'up' ? TrendingUp : TrendingDown,
      trendPercentage: trendPercentage,
      trendDescription: trendDescription,
      description: desc,
    },
  ];
};

export const reportComments = [
  {
    title: 'Sexual content',
  },
  {
    title: 'Violent or repulsive content',
  },
  {
    title: 'Hateful or abusive content',
  },
  {
    title: 'Harassment or bullying',
  },
  {
    title: 'Harmful or dangerous acts',
  },
  {
    title: 'Suicide, self-harm, or eating disorders',
  },
  {
    title: 'Misinformation',
  },
  {
    title: 'Child abuse',
  },
  {
    title: 'Promotes terrorism',
  },
  {
    title: 'Spam or misleading',
  },
];

export const transactionType = [
  { title: 'INCOME' },
  { title: 'EXPENSE' },
  { title: 'SAVING' },
  { title: 'INVESTMENT' },
];
export const expenseCat = [
  { title: 'Transport', icon: Car },
  { title: 'Health', icon: HeartPulse },
  { title: 'Food', icon: Ham },
  { title: 'Education', icon: School },
  { title: 'Others', icon: CircleEllipsis },
];
export const investmentCat = [
  { title: 'Stocks', icon: ChartCandlestick },
  { title: 'Bonds', icon: BadgeDollarSign },
  { title: 'RealEstate/Gold', icon: LandPlot },
  { title: 'BitCoin', icon: Bitcoin },
  { title: 'Others', icon: CircleEllipsis },
];
export const savingCat = [
  { title: 'Time Deposit', icon: ChartCandlestick },
  { title: 'Saving', icon: Banknote },
  { title: 'Government saving bonds', icon: BadgeDollarSign },
  { title: 'Money market account', icon: Landmark },
  { title: 'Others', icon: CircleEllipsis },
];
export const incomeCat = [
  { title: 'Salary', icon: HandCoins },
  { title: 'Bonus', icon: Coins },
  { title: 'Passive income', icon: CircleDollarSign },
  { title: 'Investment', icon: Receipt },
  { title: 'Others', icon: CircleEllipsis },
];

export enum Trans {
  INCOME = 'Income',
  EXPENSE = 'Expense',
  SAVING = 'Saving',
  INVESTMENT = 'Investment',
}
// Combined approaches
export const allCategories = [
  ...expenseCat,
  ...investmentCat,
  ...savingCat,
  ...incomeCat,
];
export const categoriesByType = {
  EXPENSE: expenseCat,
  INVESTMENT: investmentCat,
  SAVING: savingCat,
  INCOME: incomeCat,
} as const;

// For performance-critical operations
export const categoryMap = new Map(
  allCategories.map((cat) => [cat.title, cat])
);

// Utility functions
export const getCategoriesByType = (type: TranTypes) => {
  return categoriesByType[type] || [];
};

export const findCategoryByTitle = (title: string | null | undefined) => {
  if (!title) return null;
  return categoryMap.get(title) || null;
};

export const findCategoryIcon = (title: string | null | undefined) => {
  return findCategoryByTitle(title)?.icon || null;
};

// Type definitions
export type Category = {
  title: string;
  icon: any;
};

export type CategoryWithType = Category & {
  type: TranTypes;
};
