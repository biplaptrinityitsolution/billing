// src/context/LanguageContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved language on app start
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('app_language');
      if (savedLanguage && translations[savedLanguage]) {
        setCurrentLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (languageCode) => {
    try {
      if (translations[languageCode]) {
        setCurrentLanguage(languageCode);
        await AsyncStorage.setItem('app_language', languageCode);
      }
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  // Get translation function
  const t = (key, params = {}) => {
    const keys = key.split('.');
    let translation = translations[currentLanguage];
    
    for (const k of keys) {
      if (translation && typeof translation === 'object') {
        translation = translation[k];
      } else {
        // Fallback to English if translation not found
        translation = translations.en;
        for (const fallbackKey of keys) {
          if (translation && typeof translation === 'object') {
            translation = translation[fallbackKey];
          } else {
            translation = key; // Return key if no translation found
            break;
          }
        }
        break;
      }
    }

    // Handle parameterized strings
    if (typeof translation === 'string' && Object.keys(params).length > 0) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{{${param}}}`, params[param]);
      });
    }

    return typeof translation === 'string' ? translation : key;
  };

  const getAvailableLanguages = () => [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' }
  ];

  const getCurrentLanguageInfo = () => {
    return getAvailableLanguages().find(lang => lang.code === currentLanguage) || getAvailableLanguages()[0];
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    getAvailableLanguages,
    getCurrentLanguageInfo,
    isLoading
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};


