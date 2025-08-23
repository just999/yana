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
  email: 'user_sembilan@gmail.com',
  password: '111111',
  remember: false,
  code: '',
};
export const registerDefaultValues = {
  name: 'user sembilan',
  email: 'user_sembilan@gmail.com',
  password: '111111',
  confirmPassword: '111111',
  anonymous: false,
  avatar: '',
  phone: '0821-6888-9060',
  school: 'Universitas Sumatera Utara ',
  city: 'Medan',
  address:
    'Jalan Dr. T. Mansur No.9, Padang Bulan, Kec. Medan Baru, Kota Medan, Sumatera Utara 20222',
  major: 'S1 - Kesehatan ',
  terms: false,
};

export const blogDefaultValue = {
  title: '',
  slug: '',
  category: '',
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

export const PAGE_SIZE = 5;
