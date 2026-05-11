import React, { createContext, useContext, useState } from 'react';
import { ThemeProvider as RestyleThemeProvider } from '@shopify/restyle';
import { lightTheme, ThemeType } from '../theme/theme';

interface ThemeContextType {
  themeType: ThemeType;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeType] = useState<ThemeType>('light');

  return (
    <ThemeContext.Provider
      value={{
        themeType,
        isDark: false
      }}
    >
      <RestyleThemeProvider theme={lightTheme}>
        {children}
      </RestyleThemeProvider>
    </ThemeContext.Provider>
  );
};
