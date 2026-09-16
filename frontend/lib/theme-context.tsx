'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'morning' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const bgPreset = localStorage.getItem('finsentinel_bg');
    let activeTheme: Theme = 'dark';

    if (bgPreset === 'ahem') {
      const saved = localStorage.getItem('finsentinel_theme') as Theme | null;
      if (saved === 'morning' || saved === 'dark') {
        activeTheme = saved;
      }
    } else {
      // First load with night trader background: default to dark
      localStorage.setItem('finsentinel_bg', 'night_trader');
      localStorage.setItem('finsentinel_theme', 'dark');
      activeTheme = 'dark';
    }

    setThemeState(activeTheme);
    document.documentElement.classList.remove('dark', 'morning');
    document.documentElement.classList.add(activeTheme);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('finsentinel_theme', newTheme);
    document.documentElement.classList.remove('dark', 'morning');
    document.documentElement.classList.add(newTheme);
  };

  const toggleTheme = () => {
    const next = theme === 'morning' ? 'dark' : 'morning';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'dark' as Theme,
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return context;
}
