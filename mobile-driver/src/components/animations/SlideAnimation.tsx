import React from 'react';
import { Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface SlideAnimationProps {
  children: React.ReactNode;
  duration?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  style?: any;
}

export const SlideAnimation: React.FC<SlideAnimationProps> = ({
  children,
  duration = 300,
  direction = 'right',
  style,
}) => {
  const translateValue = React.useRef(
    new Animated.Value(
      direction === 'left' || direction === 'right' ? width : 100
    )
  ).current;

  React.useEffect(() => {
    Animated.timing(translateValue, {
      toValue: 0,
      duration: duration,
      useNativeDriver: true,
    }).start();
  }, []);

  const getTransform = () => {
    switch (direction) {
      case 'left':
        return [{ translateX: translateValue }];
      case 'right':
        return [{ translateX: Animated.multiply(translateValue, -1) }];
      case 'up':
        return [{ translateY: translateValue }];
      case 'down':
        return [{ translateY: Animated.multiply(translateValue, -1) }];
      default:
        return [{ translateX: translateValue }];
    }
  };

  return (
    <Animated.View style={[{ transform: getTransform() }, style]}>
      {children}
    </Animated.View>
  );
};
