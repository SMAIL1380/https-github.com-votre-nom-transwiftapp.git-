import React from 'react';
import { Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface PageTransitionProps {
  children: React.ReactNode;
  isVisible: boolean;
  duration?: number;
  style?: any;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  isVisible,
  duration = 300,
  style,
}) => {
  const translateX = React.useRef(new Animated.Value(width)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: width,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  return (
    <Animated.View
      style={[
        {
          transform: [{ translateX }],
          opacity,
          position: 'absolute',
          width: '100%',
          height: '100%',
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};
