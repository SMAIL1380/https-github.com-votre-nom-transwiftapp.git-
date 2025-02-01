import React from 'react';
import { Animated, Easing, View } from 'react-native';
import styled from 'styled-components/native';

const Container = styled.View`
  align-items: center;
  justify-content: center;
`;

const AnimatedDot = styled(Animated.View)`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  margin: 3px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

interface LoadingAnimationProps {
  size?: number;
  color?: string;
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  size = 10,
  color,
}) => {
  const animation1 = React.useRef(new Animated.Value(0)).current;
  const animation2 = React.useRef(new Animated.Value(0)).current;
  const animation3 = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(animation1, {
          toValue: 1,
          duration: 400,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(animation2, {
          toValue: 1,
          duration: 400,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(animation3, {
          toValue: 1,
          duration: 400,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start(() => {
        animation1.setValue(0);
        animation2.setValue(0);
        animation3.setValue(0);
        animate();
      });
    };

    animate();
  }, []);

  return (
    <Container>
      <View style={{ flexDirection: 'row' }}>
        <AnimatedDot
          style={{
            transform: [
              {
                translateY: animation1.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, -10, 0],
                }),
              },
            ],
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          }}
        />
        <AnimatedDot
          style={{
            transform: [
              {
                translateY: animation2.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, -10, 0],
                }),
              },
            ],
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          }}
        />
        <AnimatedDot
          style={{
            transform: [
              {
                translateY: animation3.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, -10, 0],
                }),
              },
            ],
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          }}
        />
      </View>
    </Container>
  );
};
