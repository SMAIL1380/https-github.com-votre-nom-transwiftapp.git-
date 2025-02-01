import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

import fr from './translations/fr.json';
import en from './translations/en.json';
import ar from './translations/ar.json';

const LANGUAGES = {
  fr,
  en,
  ar,
};

const LANG_CODES = Object.keys(LANGUAGES);

const LANGUAGE_DETECTOR = {
  type: 'languageDetector',
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // Récupérer la langue sauvegardée
      const savedLanguage = await AsyncStorage.getItem('user-language');
      if (savedLanguage) {
        return callback(savedLanguage);
      }

      // Obtenir la meilleure langue correspondante
      const bestLanguage = RNLocalize.findBestAvailableLanguage(LANG_CODES);
      callback(bestLanguage?.languageTag || 'fr');
    } catch (error) {
      console.error('Error reading language:', error);
      callback('fr');
    }
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem('user-language', language);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  },
};

i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    resources: LANGUAGES,
    fallbackLng: 'fr',
    react: {
      useSuspense: false,
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
