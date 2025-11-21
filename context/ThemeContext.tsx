import { themes } from '@/theme/themes';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { ThemeName } from '@/theme/colors';
import { themeStorageManager } from '../utils/storage';

type ThemeContextType = {
  themeName: ThemeName;
  theme: typeof themes[ThemeName]; // 当前主题对象
  setTheme: (name: ThemeName) => void;
  isDarkMode: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>('default');

  // 从存储中加载主题设置
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await themeStorageManager.getString('SELECTED_THEME_NAME');
        if (savedTheme && ['default', 'blue', 'purple', 'orange'].includes(savedTheme)) {
          setThemeName(savedTheme as ThemeName);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      }
    };
    
    loadTheme();
  }, []);

  const theme = useMemo(() => themes[themeName], [themeName]);
  
  // 判断是否为深色模式（基于主题的 dark 属性）
  const isDarkMode = useMemo(() => {
    return theme.dark || false;
  }, [theme]);

  const setTheme = async (name: ThemeName) => {
    try {
      setThemeName(name);
      await themeStorageManager.set('SELECTED_THEME_NAME', name);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ themeName, theme, setTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};