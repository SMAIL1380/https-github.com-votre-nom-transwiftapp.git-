import React from 'react';
import { Animated } from 'react-native';

interface ListItemTransitionProps {
  children: React.ReactNode;
  index: number;
  style?: any;
}

export const ListItemTransition: React.FC<ListItemTransitionProps> = ({
  children,
  index,
  style,
}) => {
  const translateY = React.useRef(new Animated.Value(50)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const delay = index * 150;
    
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          transform: [{ translateY }],
          opacity,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};
