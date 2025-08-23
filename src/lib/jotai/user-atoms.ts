import { atom } from 'jotai';

export type UserProps = {
  name: string;
  email: string;
  anonymous?: boolean;
  isTwoFactorEnabled?: boolean;
  role: 'USER' | 'ADMIN';
  avatar?: string;
  school?: string;
  major?: string;
  phone?: string;
  address?: string;
  city?: string;
};

export const userAtom = atom<UserProps | null>(null);

export type ProviderProps = {
  providers: 'google' | 'github';
};

export const userProviderAtom = atom<string | null>(null);
