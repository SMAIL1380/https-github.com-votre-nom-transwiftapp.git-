import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LoadingAnimation } from '../animations/LoadingAnimation';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  refreshControl?: React.ReactElement;
  loading?: boolean;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  refreshControl,
  loading = false,
  action,
}) => {
  const theme = useTheme();

  const content = (
    <View style={styles.container}>
      {loading ? (
        <LoadingAnimation type="pulse" color={theme.colors.primary} size={50} />
      ) : (
        <>
          <Icon
            name={icon}
            size={64}
            color={theme.colors.text}
            style={styles.icon}
          />
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {title}
          </Text>
          <Text
            style={[styles.description, { color: theme.colors.text }]}
          >
            {description}
          </Text>
          {action && (
            <Text
              style={[styles.action, { color: theme.colors.primary }]}
              onPress={action.onPress}
            >
              {action.label}
            </Text>
          )}
        </>
      )}
    </View>
  );

  if (refreshControl) {
    return (
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={refreshControl}
      >
        {content}
      </ScrollView>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: {
    marginBottom: 16,
    opacity: 0.8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 16,
  },
  action: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
});
