import Logo from '@/components/shared/logo';
import { UserDataSchema } from '@/lib/schemas/auth-schemas';

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Yana';

export const SITE_CONFIG = {
  name: 'yana',
  description:
    'A supportive community for those who have experienced harassment or bullying in college.',
  url: 'https://safespace.blog',
  ogImage: 'https://example.com/og-image.jpg',
  logo: Logo,
};

export const loginDefaultValues = {
  email: 'random@gmail.com',
  password: '111111',
  remember: false,
  code: '',
};
export const registerDefaultValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  anonymous: false,
  avatar: '',
  phone: '',
  school: '',
  city: '',
  address: '',
  major: '',
  terms: false,
};

export const blogDefaultValue = {
  title: '',
  slug: '',
  category: '',
  excerpt: '',
  content: '',
  authorId: '',
  author: null,
  anonymous: false,
  images: [],
};
export const userInitVal = {
  name: '',
  role: '',
  email: '',
};
export const blogInitValue = {
  id: '',
  title: '',
  slug: '',
  category: '',
  content: '',
  anonymous: false,
  images: [],
  authorId: '',
  author: null,
  comments: [],
};

export const localAvatar = '/avatars/user.svg';

export const registerInitialValues: UserDataSchema = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  anonymous: false,
  avatar: '',
  avatarFile: undefined,
  phone: '',
  school: '',
  city: '',
  address: '',
  major: '',
};

export const maxAvatarImages = 1;
export const maxBlogImages = 3;

const ha = {
  name: 'badak',
  email: 'badak@gmail.com',
  password: '111111',
  confirmPassword: '111111',
  anonymous: false,
  isTwoFactorEnabled: false,
  avatar: '',
  phone: '08112345678',
  school: 'STKIP Kristen Wamena',
  city: 'Wamena',
  address: '123 merdeka road Wamena',
  major: 'Sastra inggris',
  terms: false,
};

export const PAGE_SIZE = 8;

export const PAGE_WIDTH = 816;
export const MIN_SPACE = 100;

export const tranTypes = ['INCOME', 'EXPENSE', 'SAVING', 'INVESTMENT'] as const;
export const typeTr = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
  SAVING: 'SAVING',
  INVESTMENT: 'INVESTMENT',
};

export type TranTypes = (typeof tranTypes)[number];
export const tranCat = [
  'Food',
  'Transport',
  'Entertainment',
  'Health',
  'Utilities',
  'Education',
  'Others',
];
export type TranCat = (typeof tranCat)[number];
