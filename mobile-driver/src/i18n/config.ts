import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { storage } from '../utils/storage';
import { batteryOptimizer } from '../services/battery/BatteryOptimizer';

// Importation des traductions
import fr from './locales/fr.json';
import en from './locales/en.json';

const LANGUAGES = {
  fr,
  en,
};

export type SupportedLanguages = keyof typeof LANGUAGES;

const LANGUAGE_STORAGE_KEY = '@app_language';

class I18nManager {
  private currentLanguage: SupportedLanguages = 'fr';

  async init() {
    try {
      // Récupérer la langue sauvegardée
      const savedLanguage = await storage.get(LANGUAGE_STORAGE_KEY);
      const deviceLanguage = Localization.locale.split('-')[0] as SupportedLanguages;
      
      // Utiliser la langue sauvegardée ou la langue du device si supportée
      const initialLanguage = savedLanguage || 
        (Object.keys(LANGUAGES).includes(deviceLanguage) ? deviceLanguage : 'fr');

      await i18n
        .use(initReactI18next)
        .init({
          resources: LANGUAGES,
          lng: initialLanguage,
          fallbackLng: 'fr',
          interpolation: {
            escapeValue: false,
          },
          react: {
            useSuspense: false,
          },
        });

      this.currentLanguage = initialLanguage;
    } catch (error) {
      console.error('Error initializing i18n:', error);
      // Fallback à la configuration par défaut
      await i18n
        .use(initReactI18next)
        .init({
          resources: LANGUAGES,
          lng: 'fr',
          fallbackLng: 'fr',
          interpolation: {
            escapeValue: false,
          },
          react: {
            useSuspense: false,
          },
        });
    }
  }

  async changeLanguage(language: SupportedLanguages) {
    try {
      // Vérifier l'état de la batterie avant de changer la langue
      const batteryInfo = batteryOptimizer.getCurrentBatteryInfo();
      const shouldChangeLanguage = batteryOptimizer.shouldExecuteBackgroundTask({
        priority: 'low',
      });

      if (!shouldChangeLanguage && batteryInfo.level < 0.1) {
        throw new Error('Battery too low to change language');
      }

      await i18n.changeLanguage(language);
      await storage.set(LANGUAGE_STORAGE_KEY, language);
      this.currentLanguage = language;
    } catch (error) {
      console.error('Error changing language:', error);
      throw error;
    }
  }

  getCurrentLanguage(): SupportedLanguages {
    return this.currentLanguage;
  }

  getSupportedLanguages(): SupportedLanguages[] {
    return Object.keys(LANGUAGES) as SupportedLanguages[];
  }

  getLanguageName(code: SupportedLanguages): string {
    const names = {
      fr: 'Français',
      en: 'English',
    };
    return names[code];
  }

  formatDate(date: Date | number): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date(date).toLocaleDateString(i18n.language, options);
  }

  formatTime(date: Date | number): string {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(date).toLocaleTimeString(i18n.language, options);
  }

  formatNumber(number: number): string {
    return new Intl.NumberFormat(i18n.language).format(number);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: i18n.language === 'fr' ? 'EUR' : 'USD',
    }).format(amount);
  }
}

export const i18nManager = new I18nManager();
export default i18n;
