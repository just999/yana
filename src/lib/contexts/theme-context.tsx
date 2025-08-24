'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import { useAtom } from 'jotai';

import {
  isInitializedAtom,
  resolvedThemeAtom,
  themeAtom,
} from '../jotai/theme-atom';
import { Theme } from '../types';

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
};

type ThemeContextProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => {},
  resolvedTheme: 'dark',
});

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
}: ThemeContextProps) {
  const [theme, setTheme] = useAtom(themeAtom);
  const [resolvedTheme] = useAtom(resolvedThemeAtom);
  const [isInitialized, setIsInitialized] = useAtom(isInitializedAtom);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (!isInitialized) {
      const storedTheme = localStorage.getItem('theme') as Theme;
      const initialTheme = storedTheme || defaultTheme;

      if (initialTheme !== theme) {
        setTheme(initialTheme);
      }

      setIsInitialized(true);
    }
  }, [defaultTheme, isInitialized, setIsInitialized, setTheme, theme]);

  // Apply theme to document
  useEffect(() => {
    if (!mounted || !isInitialized) return;

    const root = document.documentElement;
    root.className = resolvedTheme;
    root.style.colorScheme = resolvedTheme;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const newResolvedTheme = mediaQuery.matches ? 'dark' : 'light';
        root.className = newResolvedTheme;
        root.style.colorScheme = newResolvedTheme;
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mounted, isInitialized, resolvedTheme, theme]);

  const handleSetTheme = (newTheme: Theme) => {
    if (theme !== newTheme) {
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
    }
  };

  // Prevent flash by not rendering until mounted and initialized
  if (!mounted || !isInitialized) {
    return null; // Or a loading placeholder
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: handleSetTheme,
        resolvedTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
