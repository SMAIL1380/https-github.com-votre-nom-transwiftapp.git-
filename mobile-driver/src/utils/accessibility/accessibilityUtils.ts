import { AccessibilityInfo, Platform } from 'react-native';

// Vérifier si un lecteur d'écran est activé
export const isScreenReaderEnabled = async (): Promise<boolean> => {
  return await AccessibilityInfo.isScreenReaderEnabled();
};

// Annoncer un message via le lecteur d'écran
export const announce = (message: string, priority: 'default' | 'high' = 'default') => {
  if (Platform.OS === 'ios') {
    AccessibilityInfo.announceForAccessibility(message);
  } else {
    // Sur Android, on peut utiliser différentes priorités
    AccessibilityInfo.announceForAccessibility(message);
  }
};

// Générer un label d'accessibilité pour un bouton avec état
export const getButtonAccessibilityLabel = (
  label: string,
  isDisabled?: boolean,
  isLoading?: boolean,
  isSelected?: boolean
): string => {
  let accessibilityLabel = label;

  if (isLoading) {
    accessibilityLabel += ', chargement en cours';
  }
  if (isDisabled) {
    accessibilityLabel += ', bouton désactivé';
  }
  if (isSelected) {
    accessibilityLabel += ', sélectionné';
  }

  return accessibilityLabel;
};

// Générer un label d'accessibilité pour un champ de formulaire avec erreur
export const getInputAccessibilityLabel = (
  label: string,
  error?: string,
  required?: boolean
): string => {
  let accessibilityLabel = label;

  if (required) {
    accessibilityLabel += ', champ obligatoire';
  }
  if (error) {
    accessibilityLabel += `, erreur: ${error}`;
  }

  return accessibilityLabel;
};

// Obtenir les propriétés d'accessibilité pour un élément cliquable
export const getTouchableAccessibilityProps = (
  label: string,
  hint?: string,
  disabled?: boolean
) => {
  return {
    accessible: true,
    accessibilityRole: 'button',
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityState: {
      disabled: !!disabled,
    },
  };
};

// Obtenir les propriétés d'accessibilité pour une image
export const getImageAccessibilityProps = (
  description: string,
  isDecorative?: boolean
) => {
  if (isDecorative) {
    return {
      accessible: false,
      accessibilityRole: 'image',
    };
  }

  return {
    accessible: true,
    accessibilityRole: 'image',
    accessibilityLabel: description,
  };
};

// Vérifier si le mode de réduction de mouvement est activé
export const isReduceMotionEnabled = async (): Promise<boolean> => {
  return await AccessibilityInfo.isReduceMotionEnabled();
};

// Obtenir la taille de police du système
export const getPreferredFontScale = async (): Promise<number> => {
  return await AccessibilityInfo.getRecommendedFontScale();
};
