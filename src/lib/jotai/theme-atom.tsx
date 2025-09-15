import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

import { Theme } from '../types';

// const cookieStorage = {
//   getItem: (key: string): Theme => {
//     if (typeof window === 'undefined' || typeof document === 'undefined') {
//       return 'dark';
//     }

//     try {
//       const match = document.cookie.match(
//         new RegExp('(^| )' + key + '=([^;]+)')
//       );
//       return match ? (decodeURIComponent(match[2]) as Theme) : 'dark';
//     } catch (error) {
//       console.warn('Failed to read theme from cookies:', error);
//       return 'dark';
//     }
//   },
//   setItem: (key: string, value: Theme) => {
//     if (typeof window === 'undefined' || typeof document === 'undefined')
//       return;

//     try {
//       const expirationDate = new Date();
//       expirationDate.setFullYear(expirationDate.getFullYear() + 1);
//       document.cookie = `${key}=${value}; path=/; expires=${expirationDate.toUTCString()}; SameSite=Lax`;
//     } catch (error) {
//       console.warn('Failed to save theme to cookies:', error);
//     }
//   },
//   removeItem: (key: string) => {
//     if (typeof window === 'undefined' || typeof document === 'undefined')
//       return;

//     try {
//       document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
//     } catch (error) {
//       console.warn('Failed to remove theme from cookies:', error);
//     }
//   },
// };

const cookieStorage = createJSONStorage<Theme>(() => ({
  getItem: (key: string) => {
    if (typeof document === 'undefined') return null;

    const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  },
  setItem: (key: string, value: string) => {
    if (typeof document === 'undefined') return;

    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    document.cookie = `${key}=${value}; path=/; expires=${expirationDate.toUTCString()}; SameSite=Lax`;
  },
  removeItem: (key: string) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  },
}));

const baseThemeAtom = atom<Theme>('dark');

export const themeAtom = atomWithStorage<Theme>('theme', 'dark', cookieStorage);

// export const themeAtom = atom(
//   (get) => get(baseThemeAtom),
//   (get, set, newValue: Theme) => {
//     set(baseThemeAtom, newValue);

//     if (typeof window !== 'undefined') {
//       cookieStorage.setItem('theme', newValue);
//     }
//   }
// );

export const isInitializedAtom = atom<boolean>(false);

// export const resolvedThemeAtom = atom((get) => {
//   const theme = get(themeAtom);
//   const isInitialized = get(isInitializedAtom);

//   if (!isInitialized || typeof window === 'undefined') {
//     return 'dark' as const;
//   }

//   if (theme === 'system') {
//     try {
//       const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
//       return mediaQuery.matches ? ('dark' as const) : ('light' as const);
//     } catch (error) {
//       console.warn('Failed to check system theme preference:', error);
//       return 'dark' as const;
//     }
//   }

//   return theme === 'dark' ? ('dark' as const) : ('light' as const);
// });

export const resolvedThemeAtom = atom((get) => {
  const theme = get(themeAtom);

  if (theme === 'system' && typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  return theme === 'dark' ? 'dark' : 'light';
});

export const bgClassAtom = atom<string>('');

if (process.env.NODE_ENV !== 'production') {
  themeAtom.debugLabel = 'theme';
  isInitializedAtom.debugLabel = 'isInitialized';
  resolvedThemeAtom.debugLabel = 'resolvedTheme';
  bgClassAtom.debugLabel = 'bgClass';
}
