import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import { Theme } from '../types';

// Atom to store the selected theme (persisted in cookies)
export const themeAtom = atomWithStorage<Theme>('theme', 'system', {
  getItem: (key) => {
    const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
    return match ? (decodeURIComponent(match[2]) as Theme) : 'system';
  },
  setItem: (key, value) => {
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    document.cookie = `${key}=${value}; path=/; expires=${expirationDate.toUTCString()}; SameSite=Lax`;
  },
  removeItem: (key) => {
    document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  },
});

// Atom to track initialization state
export const isInitializedAtom = atom<boolean>(false);

// Derived atom for resolvedTheme (computed based on theme and system preference)
export const resolvedThemeAtom = atom((get) => {
  const theme = get(themeAtom);
  const isInitialized = get(isInitializedAtom);

  if (!isInitialized) return 'dark'; // Default until initialized

  const mediaQuery = window.matchMedia('(prefers-color-scheme:dark)');
  return theme === 'system'
    ? mediaQuery.matches
      ? 'dark'
      : 'light'
    : theme === 'dark'
      ? 'dark'
      : 'light';
});

export const bgClassAtom = atom<string>('');

if (process.env.NODE_ENV !== 'production') {
  themeAtom.debugLabel = 'theme';
  isInitializedAtom.debugLabel = 'isInitialized';
  resolvedThemeAtom.debugLabel = 'resolvedTheme';
  bgClassAtom.debugLabel = 'bgClass';
}
