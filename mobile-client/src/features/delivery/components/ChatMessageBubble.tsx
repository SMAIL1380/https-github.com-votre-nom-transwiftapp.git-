import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Pressable,
  Modal,
  Dimensions,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AccessibleText } from '../../../components/accessible';
import { ChatMessage } from '../types/chat.types';
import { CustomTheme } from '../../../theme/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  showAvatar?: boolean;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  isOwnMessage,
  showAvatar,
}) => {
  const theme = useTheme() as CustomTheme;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const renderAttachment = (attachment: ChatMessage['attachments'][0]) => {
    if (attachment.type.startsWith('image/')) {
      return (
        <Pressable
          onPress={() => setSelectedImage(attachment.url)}
          style={styles.imageContainer}
        >
          <Image
            source={{ uri: attachment.url }}
            style={styles.attachmentImage}
            resizeMode="cover"
          />
        </Pressable>
      );
    }
    return null;
  };

  return (
    <View
      style={[
        styles.container,
        isOwnMessage ? styles.ownMessage : styles.otherMessage,
      ]}
    >
      {showAvatar && !isOwnMessage && (
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: message.isAutomated
                ? theme.colors.notification
                : theme.colors.primary,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={message.isAutomated ? 'robot' : 'account'}
            size={20}
            color="#FFFFFF"
          />
        </View>
      )}

      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isOwnMessage
              ? theme.colors.primary
              : theme.colors.card,
          },
        ]}
      >
        {message.content && (
          <AccessibleText
            style={[
              styles.text,
              { color: isOwnMessage ? '#FFFFFF' : theme.colors.text },
            ]}
          >
            {message.content}
          </AccessibleText>
        )}

        {message.attachments?.map((attachment, index) => (
          <View key={index} style={styles.attachmentContainer}>
            {renderAttachment(attachment)}
          </View>
        ))}

        <AccessibleText
          style={[
            styles.timestamp,
            { color: isOwnMessage ? '#FFFFFF' : theme.colors.text },
          ]}
        >
          {format(new Date(message.timestamp), 'HH:mm', { locale: fr })}
        </AccessibleText>

        {message.status !== 'sent' && isOwnMessage && (
          <MaterialCommunityIcons
            name={message.status === 'delivered' ? 'check' : 'check-all'}
            size={16}
            color="#FFFFFF"
            style={styles.status}
          />
        )}
      </View>

      <Modal
        visible={!!selectedImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalContainer}>
          <Pressable
            style={styles.closeButton}
            onPress={() => setSelectedImage(null)}
          >
            <MaterialCommunityIcons
              name="close"
              size={24}
              color="#FFFFFF"
            />
          </Pressable>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    marginHorizontal: 8,
    maxWidth: '80%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '100%',
  },
  text: {
    fontSize: 16,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
    textAlign: 'right',
  },
  status: {
    position: 'absolute',
    right: 4,
    bottom: 4,
  },
  imageContainer: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  attachmentImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  attachmentContainer: {
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 8,
  },
});
