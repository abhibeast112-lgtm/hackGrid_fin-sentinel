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
  const [theme, setThemeState] = useState<Theme>('morning');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('finsentinel_theme') as Theme | null;
    if (saved === 'morning' || saved === 'dark') {
      setThemeState(saved);
      document.documentElement.classList.remove('dark', 'morning');
      document.documentElement.classList.add(saved);
    } else {
      // Default to morning mode as requested
      setThemeState('morning');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('morning');
    }
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
      theme: 'morning' as Theme,
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return context;
}
