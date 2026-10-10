import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { Language, Direction } from '@/types';

export function useLanguage() {
  const { i18n } = useTranslation();

  const language = (i18n.language || 'en') as Language;
  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr';
  const isRTL = language === 'ar';

  const setLanguage = useCallback(
    (lang: Language) => {
      void i18n.changeLanguage(lang);
      localStorage.setItem('language', lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    },
    [i18n]
  );

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  }, [language, setLanguage]);

  return { language, direction, isRTL, setLanguage, toggleLanguage };
}
