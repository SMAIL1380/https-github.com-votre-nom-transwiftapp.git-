import { useEffect, useState } from 'react';
import { AccessibilityInfo, EmitterSubscription } from 'react-native';

export const useAccessibility = () => {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(false);
  const [fontScale, setFontScale] = useState(1);

  useEffect(() => {
    let screenReaderListener: EmitterSubscription;
    let reduceMotionListener: EmitterSubscription;

    const setupAccessibility = async () => {
      // Vérifier l'état initial
      const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      const reduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      const preferredFontScale = await AccessibilityInfo.getRecommendedFontScale();

      setIsScreenReaderEnabled(screenReaderEnabled);
      setIsReduceMotionEnabled(reduceMotionEnabled);
      setFontScale(preferredFontScale);

      // Configurer les listeners
      screenReaderListener = AccessibilityInfo.addEventListener(
        'screenReaderChanged',
        setIsScreenReaderEnabled
      );

      reduceMotionListener = AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        setIsReduceMotionEnabled
      );
    };

    setupAccessibility();

    return () => {
      screenReaderListener?.remove();
      reduceMotionListener?.remove();
    };
  }, []);

  const announce = (message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
  };

  return {
    isScreenReaderEnabled,
    isReduceMotionEnabled,
    fontScale,
    announce,
  };
};
