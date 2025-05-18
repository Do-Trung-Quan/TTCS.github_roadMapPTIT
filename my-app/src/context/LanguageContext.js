// src/context/LanguageContext.js
import React, { createContext, useState, useContext } from 'react';
import translations from '../translations.json';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('vi');
  const [currentTranslations, setCurrentTranslations] = useState(translations['vi']);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    setCurrentTranslations(translations[lang]);
  };

  return (
    <LanguageContext.Provider value={{ language, currentTranslations, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);