import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AccessibleText } from '../../../components/accessible';
import { DeliveryStatus } from '../types/delivery.types';
import { CustomTheme } from '../../../theme/types';

interface QuickSuggestionsProps {
  status: DeliveryStatus;
  onSuggestionPress: (suggestion: string) => void;
}

export const QuickSuggestions: React.FC<QuickSuggestionsProps> = ({
  status,
  onSuggestionPress,
}) => {
  const { t } = useTranslation();
  const theme = useTheme() as CustomTheme;

  // Suggestions basées sur le statut de la livraison
  const getSuggestions = () => {
    const commonSuggestions = [
      {
        text: t('chat.suggestions.contact'),
        icon: 'phone',
        message: 'Comment puis-je contacter le service client ?',
      },
      {
        text: t('chat.suggestions.help'),
        icon: 'help-circle',
        message: 'J\'ai besoin d\'aide avec ma livraison',
      },
    ];

    const statusSuggestions = {
      pending: [
        {
          text: t('chat.suggestions.eta'),
          icon: 'clock',
          message: 'Quand ma livraison va-t-elle commencer ?',
        },
        {
          text: t('chat.suggestions.cancel'),
          icon: 'close-circle',
          message: 'Comment puis-je annuler ma livraison ?',
        },
      ],
      accepted: [
        {
          text: t('chat.suggestions.pickup'),
          icon: 'package-variant',
          message: 'Quand le colis sera-t-il récupéré ?',
        },
      ],
      picked_up: [
        {
          text: t('chat.suggestions.location'),
          icon: 'map-marker',
          message: 'Où est mon colis actuellement ?',
        },
        {
          text: t('chat.suggestions.eta'),
          icon: 'clock',
          message: 'Dans combien de temps sera livré mon colis ?',
        },
      ],
      in_transit: [
        {
          text: t('chat.suggestions.location'),
          icon: 'map-marker',
          message: 'Où est mon colis actuellement ?',
        },
        {
          text: t('chat.suggestions.eta'),
          icon: 'clock',
          message: 'Dans combien de temps sera livré mon colis ?',
        },
        {
          text: t('chat.suggestions.instructions'),
          icon: 'note-text',
          message: 'Je voudrais ajouter des instructions de livraison',
        },
      ],
      delivered: [
        {
          text: t('chat.suggestions.feedback'),
          icon: 'star',
          message: 'Je voudrais donner mon avis sur la livraison',
        },
        {
          text: t('chat.suggestions.issue'),
          icon: 'alert-circle',
          message: 'J\'ai un problème avec ma livraison',
        },
      ],
      cancelled: [
        {
          text: t('chat.suggestions.reason'),
          icon: 'help-circle',
          message: 'Pourquoi ma livraison a-t-elle été annulée ?',
        },
        {
          text: t('chat.suggestions.refund'),
          icon: 'cash-refund',
          message: 'Quand serai-je remboursé ?',
        },
      ],
    };

    return [...(statusSuggestions[status] || []), ...commonSuggestions];
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {getSuggestions().map((suggestion, index) => (
        <Pressable
          key={index}
          style={[
            styles.suggestion,
            { backgroundColor: theme.colors.card },
          ]}
          onPress={() => onSuggestionPress(suggestion.message)}
          accessible={true}
          accessibilityLabel={suggestion.text}
          accessibilityHint={t('chat.suggestions.pressHint')}
        >
          <MaterialCommunityIcons
            name={suggestion.icon}
            size={20}
            color={theme.colors.primary}
            style={styles.icon}
          />
          <AccessibleText
            style={[styles.text, { color: theme.colors.text }]}
            numberOfLines={2}
          >
            {suggestion.text}
          </AccessibleText>
        </Pressable>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    gap: 8,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
    marginRight: 8,
    maxWidth: 200,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 14,
    flex: 1,
  },
});
