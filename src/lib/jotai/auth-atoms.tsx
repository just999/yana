import { atom } from 'jotai';

interface ValidationErrors {
  message?: string;
  fieldErrors?: Record<string, string | null>;
  type?: 'validation' | 'server' | 'general';
}

export const fileAvatarAtom = atom<File[]>([]);

// export const signInErrorAtom = atom<Record<string, string>>({});

export const signInErrorAtom = atom<ValidationErrors | null>(null);
