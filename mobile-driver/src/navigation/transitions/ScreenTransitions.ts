import { TransitionPresets } from '@react-navigation/stack';
import { Easing, Platform } from 'react-native';

// Transition fluide pour les écrans standards
export const defaultTransition = {
  ...TransitionPresets.SlideFromRightIOS,
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: 300,
        easing: Easing.bezier(0.2, 0.0, 0.2, 1),
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 300,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      },
    },
  },
};

// Transition pour les modals
export const modalTransition = {
  ...TransitionPresets.ModalSlideFromBottomIOS,
  transitionSpec: {
    open: {
      animation: 'spring',
      config: {
        stiffness: 1000,
        damping: 500,
        mass: 3,
        overshootClamping: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 250,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      },
    },
  },
};

// Transition pour les écrans plein écran
export const fullScreenTransition = {
  ...TransitionPresets.ModalSlideFromBottomIOS,
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: 400,
        easing: Easing.bezier(0.0, 0.0, 0.2, 1),
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 400,
        easing: Easing.bezier(0.4, 0.0, 1, 1),
      },
    },
  },
};

// Transition optimisée pour les performances sur les appareils à batterie faible
export const lowBatteryTransition = {
  ...TransitionPresets.DefaultTransition,
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: 200,
        easing: Easing.linear,
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 200,
        easing: Easing.linear,
      },
    },
  },
};

// Gestionnaire de transitions basé sur la plateforme et l'état de la batterie
export const getTransition = (
  type: 'default' | 'modal' | 'fullScreen',
  isLowBattery: boolean
) => {
  if (isLowBattery) {
    return lowBatteryTransition;
  }

  switch (type) {
    case 'modal':
      return modalTransition;
    case 'fullScreen':
      return fullScreenTransition;
    default:
      return Platform.select({
        ios: defaultTransition,
        android: {
          ...defaultTransition,
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 250,
                easing: Easing.out(Easing.poly(4)),
              },
            },
            close: {
              animation: 'timing',
              config: {
                duration: 200,
                easing: Easing.in(Easing.poly(4)),
              },
            },
          },
        },
      });
  }
};
