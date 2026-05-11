import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as RestyleThemeProvider } from '@shopify/restyle';
import { lightTheme, darkTheme, ThemeType } from '../theme/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextType {
  themeType: ThemeType;
  toggleTheme: () => void;
  setThemeType: (type: ThemeType) => void;
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
  const [themeType, setThemeType] = useState<ThemeType>('light');

  // Charger le thème depuis AsyncStorage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@theme');
        if (savedTheme === 'dark' || savedTheme === 'light') {
          setThemeType(savedTheme);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    loadTheme();
  }, []);

  // Sauvegarder les changements de thème
  useEffect(() => {
    const saveTheme = async () => {
      try {
        await AsyncStorage.setItem('@theme', themeType);
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    };
    saveTheme();
  }, [themeType]);

  // Fonction pour basculer Light/Dark
  const toggleTheme = () => {
    setThemeType(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const theme = themeType === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider
      value={{
        themeType,
        toggleTheme,
        setThemeType,
        isDark: themeType === 'dark'
      }}
    >
      <RestyleThemeProvider theme={theme}>
        {children}
      </RestyleThemeProvider>
    </ThemeContext.Provider>
  );
};
