import React from 'react';
import { Animated } from 'react-native';

interface FadeAnimationProps {
  children: React.ReactNode;
  duration?: number;
  style?: any;
}

export const FadeAnimation: React.FC<FadeAnimationProps> = ({
  children,
  duration = 300,
  style,
}) => {
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: duration,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[{ opacity }, style]}>
      {children}
    </Animated.View>
  );
};
