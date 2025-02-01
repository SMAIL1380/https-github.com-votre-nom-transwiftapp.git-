import React from 'react';
import { Image, ImageProps, StyleSheet } from 'react-native';
import { getImageAccessibilityProps } from '../../utils/accessibility/accessibilityUtils';

interface AccessibleImageProps extends Omit<ImageProps, 'accessibilityLabel'> {
  description: string;
  isDecorative?: boolean;
}

export const AccessibleImage: React.FC<AccessibleImageProps> = ({
  description,
  isDecorative,
  style,
  ...props
}) => {
  const accessibilityProps = getImageAccessibilityProps(description, isDecorative);

  return (
    <Image
      {...props}
      {...accessibilityProps}
      style={[styles.image, style]}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    resizeMode: 'contain',
  },
});
