// 'use client';

// import { createContext, useContext, useEffect, useState } from 'react';

// import { useAtom } from 'jotai';

// import {
//   isInitializedAtom,
//   resolvedThemeAtom,
//   themeAtom,
// } from '../jotai/theme-atom';
// import { Theme } from '../types';

// type ThemeContextType = {
//   theme: Theme;
//   setTheme: (theme: Theme) => void;
//   resolvedTheme: 'light' | 'dark';
// };

// type ThemeContextProps = {
//   children: React.ReactNode;
//   defaultTheme?: Theme;
// };

// const ThemeContext = createContext<ThemeContextType>({
//   theme: 'system',
//   setTheme: () => {},
//   resolvedTheme: 'dark',
// });

// export function ThemeProvider({
//   children,
//   defaultTheme = 'dark',
// }: ThemeContextProps) {
//   const [theme, setTheme] = useAtom(themeAtom);
//   const [resolvedTheme] = useAtom(resolvedThemeAtom);
//   const [isInitialized, setIsInitialized] = useAtom(isInitializedAtom);
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);

//     if (!isInitialized) {
//       const storedTheme = localStorage.getItem('theme') as Theme;
//       const initialTheme = storedTheme || defaultTheme;

//       if (initialTheme !== theme) {
//         setTheme(initialTheme);
//       }

//       setIsInitialized(true);
//     }
//   }, [defaultTheme, isInitialized, setIsInitialized, setTheme, theme]);

//   // Apply theme to document
//   useEffect(() => {
//     if (!mounted || !isInitialized) return;

//     const root = document.documentElement;
//     root.className = resolvedTheme;
//     root.style.colorScheme = resolvedTheme;

//     const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
//     const handleChange = () => {
//       if (theme === 'system') {
//         const newResolvedTheme = mediaQuery.matches ? 'dark' : 'light';
//         root.className = newResolvedTheme;
//         root.style.colorScheme = newResolvedTheme;
//       }
//     };

//     mediaQuery.addEventListener('change', handleChange);
//     return () => mediaQuery.removeEventListener('change', handleChange);
//   }, [mounted, isInitialized, resolvedTheme, theme]);

//   const handleSetTheme = (newTheme: Theme) => {
//     if (theme !== newTheme) {
//       setTheme(newTheme);
//       localStorage.setItem('theme', newTheme);
//     }
//   };

//   // Prevent flash by not rendering until mounted and initialized
//   if (!mounted || !isInitialized) {
//     return null; // Or a loading placeholder
//   }

//   return (
//     <ThemeContext.Provider
//       value={{
//         theme,
//         setTheme: handleSetTheme,
//         resolvedTheme,
//       }}
//     >
//       {children}
//     </ThemeContext.Provider>
//   );
// }

// export const useTheme = () => useContext(ThemeContext);
// 'use client';

// import { createContext, useContext, useEffect, useState } from 'react';

// import { useAtom } from 'jotai';

// import {
//   isInitializedAtom,
//   resolvedThemeAtom,
//   themeAtom,
// } from '../jotai/theme-atom';
// import { Theme } from '../types';

// type ThemeContextType = {
//   theme: Theme;
//   setTheme: (theme: Theme) => void;
//   resolvedTheme: 'light' | 'dark';
//   isLoaded: boolean;
// };

// type ThemeContextProps = {
//   children: React.ReactNode;
//   defaultTheme?: Theme;
// };

// const ThemeContext = createContext<ThemeContextType>({
//   theme: 'dark',
//   setTheme: () => {},
//   resolvedTheme: 'dark',
//   isLoaded: false,
// });

// export function ThemeProvider({
//   children,
//   defaultTheme = 'dark',
// }: ThemeContextProps) {
//   const [theme, setTheme] = useAtom(themeAtom);
//   const [resolvedTheme] = useAtom(resolvedThemeAtom);
//   const [isInitialized, setIsInitialized] = useAtom(isInitializedAtom);
//   const [mounted, setMounted] = useState(false);

//   // Initialize theme only on client side
//   useEffect(() => {
//     if (!mounted) {
//       setMounted(true);
//     }

//     if (mounted && !isInitialized) {
//       // Read theme from cookies
//       let storedTheme: Theme = defaultTheme;

//       try {
//         const cookieMatch = document.cookie.match(/(^| )theme=([^;]+)/);
//         if (cookieMatch) {
//           storedTheme = decodeURIComponent(cookieMatch[2]) as Theme;
//         }
//       } catch (error) {
//         console.warn('Failed to read theme from cookies:', error);
//       }

//       // Only update if different from current theme
//       if (storedTheme !== theme) {
//         setTheme(storedTheme);
//       }

//       setIsInitialized(true);
//     }
//   }, [mounted, isInitialized, setIsInitialized, setTheme, theme, defaultTheme]);

//   // Apply theme to document
//   useEffect(() => {
//     if (!mounted || !isInitialized) return;

//     const root = document.documentElement;

//     // Apply theme
//     root.classList.remove('light', 'dark');
//     root.classList.add(resolvedTheme);
//     root.style.colorScheme = resolvedTheme;

//     // Handle system theme changes
//     if (theme === 'system') {
//       const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
//       const handleChange = () => {
//         const newResolvedTheme = mediaQuery.matches ? 'dark' : 'light';
//         root.classList.remove('light', 'dark');
//         root.classList.add(newResolvedTheme);
//         root.style.colorScheme = newResolvedTheme;
//       };

//       mediaQuery.addEventListener('change', handleChange);
//       return () => mediaQuery.removeEventListener('change', handleChange);
//     }
//   }, [mounted, isInitialized, resolvedTheme, theme]);

//   const handleSetTheme = (newTheme: Theme) => {
//     if (theme !== newTheme) {
//       setTheme(newTheme);
//     }
//   };

//   // During SSR or before hydration, render with default dark theme
//   // This ensures server and client render the same thing initially
//   const contextValue = {
//     theme: mounted && isInitialized ? theme : 'dark',
//     setTheme: handleSetTheme,
//     resolvedTheme: mounted && isInitialized ? resolvedTheme : ('dark' as const),
//     isLoaded: mounted && isInitialized,
//   };

//   return (
//     <ThemeContext.Provider value={contextValue}>
//       {children}
//     </ThemeContext.Provider>
//   );
// }

// export const useTheme = () => useContext(ThemeContext);

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
  isLoaded: boolean;
};

type ThemeContextProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
  resolvedTheme: 'dark',
  isLoaded: false,
});

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
}: ThemeContextProps) {
  const [theme, setTheme] = useAtom(themeAtom);
  const [resolvedTheme] = useAtom(resolvedThemeAtom);
  const [isInitialized, setIsInitialized] = useAtom(isInitializedAtom);
  const [mounted, setMounted] = useState(false);

  // Initialize theme only on client side
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
    }

    if (mounted && !isInitialized) {
      // Read theme from cookies
      let storedTheme: Theme = defaultTheme;

      try {
        const cookieMatch = document.cookie.match(/(^| )theme=([^;]+)/);
        if (cookieMatch) {
          storedTheme = decodeURIComponent(cookieMatch[2]) as Theme;
        }
      } catch (error) {
        console.warn('Failed to read theme from cookies:', error);
      }

      // Only update if different from current theme
      if (storedTheme !== theme) {
        setTheme(storedTheme);
      }

      setIsInitialized(true);
    }
  }, [mounted, isInitialized, setIsInitialized, setTheme, theme, defaultTheme]);

  // Apply theme to document
  useEffect(() => {
    if (!mounted || !isInitialized) return;

    const root = document.documentElement;

    // Apply theme
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    root.style.colorScheme = resolvedTheme;

    // Handle system theme changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        const newResolvedTheme = mediaQuery.matches ? 'dark' : 'light';
        root.classList.remove('light', 'dark');
        root.classList.add(newResolvedTheme);
        root.style.colorScheme = newResolvedTheme;
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [mounted, isInitialized, resolvedTheme, theme]);

  const handleSetTheme = (newTheme: Theme) => {
    if (theme !== newTheme) {
      setTheme(newTheme);
    }
  };

  // During SSR or before hydration, render with default dark theme
  // This ensures server and client render the same thing initially
  const contextValue: ThemeContextType = {
    theme: mounted && isInitialized ? theme : 'dark',
    setTheme: handleSetTheme,
    resolvedTheme: (mounted && isInitialized ? resolvedTheme : 'dark') as
      | 'light'
      | 'dark', // ✅ Type assertion
    isLoaded: mounted && isInitialized,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
