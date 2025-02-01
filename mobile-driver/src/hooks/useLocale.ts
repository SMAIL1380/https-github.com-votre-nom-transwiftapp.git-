import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { i18nManager, SupportedLanguages } from '../i18n/config';
import { errorService } from '../services/error/ErrorService';

interface UseLocaleOptions {
  onLanguageChange?: (language: SupportedLanguages) => void;
}

export function useLocale(options: UseLocaleOptions = {}) {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguages>(
    i18nManager.getCurrentLanguage()
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const language = i18nManager.getCurrentLanguage();
    setCurrentLanguage(language);
  }, []);

  const changeLanguage = useCallback(
    async (language: SupportedLanguages) => {
      setLoading(true);
      try {
        await i18nManager.changeLanguage(language);
        setCurrentLanguage(language);
        
        if (options.onLanguageChange) {
          options.onLanguageChange(language);
        }
      } catch (error) {
        errorService.handleError(error as Error, {
          type: 'warning',
          metadata: { language },
        });
      } finally {
        setLoading(false);
      }
    },
    [options.onLanguageChange]
  );

  const formatDate = useCallback(
    (date: Date | number) => {
      return i18nManager.formatDate(date);
    },
    []
  );

  const formatTime = useCallback(
    (date: Date | number) => {
      return i18nManager.formatTime(date);
    },
    []
  );

  const formatNumber = useCallback(
    (number: number) => {
      return i18nManager.formatNumber(number);
    },
    []
  );

  const formatCurrency = useCallback(
    (amount: number) => {
      return i18nManager.formatCurrency(amount);
    },
    []
  );

  return {
    currentLanguage,
    loading,
    changeLanguage,
    supportedLanguages: i18nManager.getSupportedLanguages(),
    getLanguageName: i18nManager.getLanguageName,
    formatDate,
    formatTime,
    formatNumber,
    formatCurrency,
  };
}
