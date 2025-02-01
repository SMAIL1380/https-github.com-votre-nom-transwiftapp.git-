import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { useLocale } from '../../hooks/useLocale';
import { SupportedLanguages } from '../../i18n/config';

interface LanguageSelectorProps {
  onLanguageChange?: (language: SupportedLanguages) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  onLanguageChange,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const {
    currentLanguage,
    loading,
    changeLanguage,
    supportedLanguages,
    getLanguageName,
  } = useLocale({
    onLanguageChange,
  });

  const handleLanguageChange = async (language: SupportedLanguages) => {
    if (language !== currentLanguage && !loading) {
      await changeLanguage(language);
    }
  };

  return (
    <View style={styles.container}>
      <Text
        style={[styles.title, { color: theme.colors.text }]}
      >
        {t('settings.general.language')}
      </Text>

      {supportedLanguages.map((language) => (
        <TouchableOpacity
          key={language}
          style={[
            styles.languageButton,
            {
              backgroundColor:
                language === currentLanguage
                  ? theme.colors.primary
                  : theme.colors.card,
            },
          ]}
          onPress={() => handleLanguageChange(language)}
          disabled={loading}
        >
          <Text
            style={[
              styles.languageText,
              {
                color:
                  language === currentLanguage
                    ? theme.colors.background
                    : theme.colors.text,
              },
            ]}
          >
            {getLanguageName(language)}
          </Text>

          {language === currentLanguage && (
            <View style={styles.iconContainer}>
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.background}
                />
              ) : (
                <Icon
                  name="check"
                  size={20}
                  color={theme.colors.background}
                />
              )}
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  languageText: {
    fontSize: 16,
    fontWeight: '500',
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
