import React from 'react';
import { TouchableOpacity, StyleSheet, Animated, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@react-navigation/native';

interface FloatingActionButtonProps {
  icon: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  size?: 'small' | 'normal' | 'large';
  position?: 'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft';
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onPress,
  style,
  disabled = false,
  size = 'normal',
  position = 'bottomRight',
}) => {
  const theme = useTheme();
  const buttonScale = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          width: 40,
          height: 40,
          iconSize: 20,
        };
      case 'large':
        return {
          width: 64,
          height: 64,
          iconSize: 32,
        };
      default:
        return {
          width: 56,
          height: 56,
          iconSize: 24,
        };
    }
  };

  const getPositionStyle = () => {
    switch (position) {
      case 'bottomLeft':
        return { bottom: 16, left: 16 };
      case 'topRight':
        return { top: 16, right: 16 };
      case 'topLeft':
        return { top: 16, left: 16 };
      default:
        return { bottom: 16, right: 16 };
    }
  };

  const sizeStyles = getSizeStyles();
  const positionStyle = getPositionStyle();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: buttonScale }],
          ...positionStyle,
        },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.button,
          {
            backgroundColor: disabled
              ? theme.colors.disabled
              : theme.colors.primary,
            width: sizeStyles.width,
            height: sizeStyles.height,
          },
        ]}
      >
        <Icon
          name={icon}
          size={sizeStyles.iconSize}
          color={theme.colors.background}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  button: {
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
