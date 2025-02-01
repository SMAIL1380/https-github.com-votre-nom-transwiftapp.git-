import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AccessibleText } from '../../../components/accessible';
import { CustomTheme } from '../../../theme/types';

interface ResponseFeedbackProps {
  messageId: string;
  onFeedback: (messageId: string, helpful: boolean, reason?: string) => void;
}

export const ResponseFeedback: React.FC<ResponseFeedbackProps> = ({
  messageId,
  onFeedback,
}) => {
  const { t } = useTranslation();
  const theme = useTheme() as CustomTheme;
  const [showReasons, setShowReasons] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  const handleFeedback = (helpful: boolean) => {
    if (helpful) {
      onFeedback(messageId, true);
      animateOut();
    } else {
      setShowReasons(true);
    }
  };

  const handleReasonSelect = (reason: string) => {
    onFeedback(messageId, false, reason);
    animateOut();
  };

  const animateOut = () => {
    setSubmitted(true);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  if (submitted) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <AccessibleText style={[styles.thankYou, { color: theme.colors.text }]}>
          {t('chat.feedback.thankYou')}
        </AccessibleText>
      </Animated.View>
    );
  }

  if (showReasons) {
    return (
      <View style={styles.container}>
        <AccessibleText style={[styles.title, { color: theme.colors.text }]}>
          {t('chat.feedback.whyNotHelpful')}
        </AccessibleText>
        <View style={styles.reasonsContainer}>
          {[
            'notRelevant',
            'notClear',
            'incomplete',
            'other',
          ].map((reason) => (
            <Pressable
              key={reason}
              style={[styles.reasonButton, { backgroundColor: theme.colors.card }]}
              onPress={() => handleReasonSelect(reason)}
              accessible={true}
              accessibilityLabel={t(`chat.feedback.reasons.${reason}`)}
            >
              <AccessibleText
                style={[styles.reasonText, { color: theme.colors.text }]}
              >
                {t(`chat.feedback.reasons.${reason}`)}
              </AccessibleText>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AccessibleText style={[styles.title, { color: theme.colors.text }]}>
        {t('chat.feedback.wasHelpful')}
      </AccessibleText>
      <View style={styles.buttonsContainer}>
        <Pressable
          style={styles.button}
          onPress={() => handleFeedback(true)}
          accessible={true}
          accessibilityLabel={t('chat.feedback.helpful')}
        >
          <MaterialCommunityIcons
            name="thumb-up"
            size={24}
            color={theme.colors.primary}
          />
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => handleFeedback(false)}
          accessible={true}
          accessibilityLabel={t('chat.feedback.notHelpful')}
        >
          <MaterialCommunityIcons
            name="thumb-down"
            size={24}
            color={theme.colors.error}
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  button: {
    padding: 8,
  },
  reasonsContainer: {
    width: '100%',
    gap: 8,
  },
  reasonButton: {
    padding: 12,
    borderRadius: 8,
  },
  reasonText: {
    fontSize: 14,
    textAlign: 'center',
  },
  thankYou: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});
