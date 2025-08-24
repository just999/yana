// import { atom } from 'jotai';
// import { atomWithStorage } from 'jotai/utils';

// import { Theme } from '../types';

// // Atom to store the selected theme (persisted in cookies)
// export const themeAtom = atomWithStorage<Theme>('theme', 'system', {
//   getItem: (key) => {
//     const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
//     return match ? (decodeURIComponent(match[2]) as Theme) : 'system';
//   },
//   setItem: (key, value) => {
//     const expirationDate = new Date();
//     expirationDate.setFullYear(expirationDate.getFullYear() + 1);
//     document.cookie = `${key}=${value}; path=/; expires=${expirationDate.toUTCString()}; SameSite=Lax`;
//   },
//   removeItem: (key) => {
//     document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
//   },
// });

// // Atom to track initialization state
// export const isInitializedAtom = atom<boolean>(false);

// // Derived atom for resolvedTheme (computed based on theme and system preference)
// export const resolvedThemeAtom = atom((get) => {
//   const theme = get(themeAtom);
//   const isInitialized = get(isInitializedAtom);

//   if (!isInitialized) return 'dark'; // Default until initialized

//   const mediaQuery = window.matchMedia('(prefers-color-scheme:dark)');
//   return theme === 'system'
//     ? mediaQuery.matches
//       ? 'dark'
//       : 'light'
//     : theme === 'dark'
//       ? 'dark'
//       : 'light';
// });

// export const bgClassAtom = atom<string>('');

// if (process.env.NODE_ENV !== 'production') {
//   themeAtom.debugLabel = 'theme';
//   isInitializedAtom.debugLabel = 'isInitialized';
//   resolvedThemeAtom.debugLabel = 'resolvedTheme';
//   bgClassAtom.debugLabel = 'bgClass';
// }
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import { Theme } from '../types';

// Safe cookie storage that doesn't cause hydration issues
const cookieStorage = {
  getItem: (key: string): Theme => {
    // Always return a consistent default during SSR
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return 'dark';
    }

    try {
      const match = document.cookie.match(
        new RegExp('(^| )' + key + '=([^;]+)')
      );
      return match ? (decodeURIComponent(match[2]) as Theme) : 'dark';
    } catch (error) {
      console.warn('Failed to read theme from cookies:', error);
      return 'dark';
    }
  },
  setItem: (key: string, value: Theme) => {
    if (typeof window === 'undefined' || typeof document === 'undefined')
      return;

    try {
      const expirationDate = new Date();
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
      document.cookie = `${key}=${value}; path=/; expires=${expirationDate.toUTCString()}; SameSite=Lax`;
    } catch (error) {
      console.warn('Failed to save theme to cookies:', error);
    }
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined' || typeof document === 'undefined')
      return;

    try {
      document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    } catch (error) {
      console.warn('Failed to remove theme from cookies:', error);
    }
  },
};

// Create a base atom that starts with a consistent value
const baseThemeAtom = atom<Theme>('dark');

// Atom to store the selected theme (persisted in cookies)
export const themeAtom = atom(
  (get) => get(baseThemeAtom),
  (get, set, newValue: Theme) => {
    set(baseThemeAtom, newValue);
    // Only save to cookies on client side
    if (typeof window !== 'undefined') {
      cookieStorage.setItem('theme', newValue);
    }
  }
);

// Atom to track initialization state
export const isInitializedAtom = atom<boolean>(false);

// Derived atom for resolvedTheme (computed based on theme and system preference)
export const resolvedThemeAtom = atom((get) => {
  const theme = get(themeAtom);
  const isInitialized = get(isInitializedAtom);

  // Always return 'dark' during SSR or before initialization
  if (!isInitialized || typeof window === 'undefined') {
    return 'dark' as const;
  }

  if (theme === 'system') {
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      return mediaQuery.matches ? ('dark' as const) : ('light' as const);
    } catch (error) {
      console.warn('Failed to check system theme preference:', error);
      return 'dark' as const;
    }
  }

  return theme === 'dark' ? ('dark' as const) : ('light' as const);
});

export const bgClassAtom = atom<string>('');

if (process.env.NODE_ENV !== 'production') {
  themeAtom.debugLabel = 'theme';
  isInitializedAtom.debugLabel = 'isInitialized';
  resolvedThemeAtom.debugLabel = 'resolvedTheme';
  bgClassAtom.debugLabel = 'bgClass';
}
