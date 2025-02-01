import { useTranslation as useI18nTranslation } from 'react-i18next';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNLocalize from 'react-native-localize';

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  const changeLanguage = async (language: string) => {
    try {
      // Mettre à jour la langue
      await i18n.changeLanguage(language);
      
      // Gérer le RTL pour l'arabe
      const isRTL = language === 'ar';
      if (I18nManager.isRTL !== isRTL) {
        I18nManager.forceRTL(isRTL);
        // Redémarrage nécessaire pour appliquer les changements RTL
        // Vous devrez implémenter la logique de redémarrage ici
      }

      // Sauvegarder la langue
      await AsyncStorage.setItem('user-language', language);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const getCurrentLanguage = () => i18n.language;

  const getAvailableLanguages = () => [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'العربية' },
  ];

  const getLanguageDirection = () => {
    return getCurrentLanguage() === 'ar' ? 'rtl' : 'ltr';
  };

  return {
    t,
    i18n,
    changeLanguage,
    getCurrentLanguage,
    getAvailableLanguages,
    getLanguageDirection,
  };
};
