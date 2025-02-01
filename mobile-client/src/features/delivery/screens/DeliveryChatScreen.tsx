import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Pressable,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ChatMessageBubble } from '../components/ChatMessageBubble';
import { chatService } from '../services/chat.service';
import { ChatMessage, ChatParticipant } from '../types/chat.types';
import { CustomTheme } from '../../../theme/types';
import { useAuth } from '../../auth/hooks/useAuth';
import { AccessibleText } from '../../../components/accessible';
import { DeliveryService } from '../services/delivery.service';
import { QuickSuggestions } from '../components/QuickSuggestions';
import { ResponseFeedback } from '../components/ResponseFeedback';
import { QuickResponseSelector } from '../components/QuickResponseSelector';
import { supportService } from '../services/support.service';
import { SupportTicket, PriorityLevel } from '../types/support.types';

interface DeliveryChatScreenProps {
  deliveryId: string;
}

export const DeliveryChatScreen: React.FC<DeliveryChatScreenProps> = ({
  deliveryId,
}) => {
  const { t } = useTranslation();
  const theme = useTheme() as CustomTheme;
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [deliveryData, setDeliveryData] = useState<any>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showQuickResponses, setShowQuickResponses] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<SupportTicket | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const loadDeliveryData = async () => {
      try {
        const data = await DeliveryService.getDeliveryDetails(deliveryId);
        setDeliveryData(data);
        
        // Créer un ticket de support
        const ticket = await supportService.createTicket(
          deliveryId,
          user?.id!,
          'general',
          'Nouvelle conversation'
        );
        setCurrentTicket(ticket);
        
        // Message de bienvenue automatique
        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          deliveryId,
          senderId: 'system',
          senderType: 'support',
          content: t('chat.welcomeMessage', {
            defaultValue: `Bienvenue ! Le service client Transwift est là pour vous aider avec votre livraison #${data.trackingNumber}. Notre équipe surveille votre livraison et coordonne avec nos chauffeurs partenaires pour assurer un service optimal.

Utilisez les suggestions rapides ci-dessous ou posez directement vos questions.`
          }),
          timestamp: new Date().toISOString(),
          status: 'delivered',
          isAutomated: true,
        };
        
        setMessages([welcomeMessage]);
        loadMessages();
        return data;
      } catch (error) {
        console.error('Error loading delivery data:', error);
        return null;
      }
    };

    loadDeliveryData().then(data => {
      if (data) {
        const cleanup = chatService.connect(deliveryId, handleNewMessage, data);
        return () => cleanup();
      }
    });
  }, [deliveryId]);

  const loadMessages = async (pageToLoad = 1) => {
    try {
      setLoading(true);
      const response = await chatService.getMessages(deliveryId, pageToLoad);
      if (pageToLoad === 1) {
        setMessages((prev) => [...prev, ...response.messages]);
      } else {
        setMessages((prev) => [...response.messages, ...prev]);
      }
      setParticipants(response.participants);
      setHasMore(response.hasMore);
      setPage(pageToLoad);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message: ChatMessage) => {
    setMessages((prev) => [message, ...prev]);
    if (message.senderId !== user?.id) {
      chatService.markMessagesAsRead(deliveryId, [message.id]);
    }
  };

  const handleSend = async () => {
    if (!messageText.trim() && !sending) return;

    try {
      setSending(true);
      const message = await chatService.sendMessage({
        deliveryId,
        content: messageText.trim(),
      });
      setMessageText('');
      handleNewMessage(message);

      // Simuler l'indicateur de frappe du service client
      setTimeout(() => {
        chatService.setTypingStatus(true);
        setTimeout(() => {
          chatService.setTypingStatus(false);
        }, 2000);
      }, 500);

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled) {
        setSending(true);
        const imageUrl = await chatService.uploadAttachment(result.assets[0] as any);
        const message = await chatService.sendMessage({
          deliveryId,
          content: '',
          attachmentUrl: imageUrl,
          attachmentType: 'image',
        });
        handleNewMessage(message);
      }
    } catch (error) {
      console.error('Error picking/uploading image:', error);
    } finally {
      setSending(false);
    }
  };

  const handleLocationShare = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    try {
      setSending(true);
      const location = await Location.getCurrentPositionAsync({});
      const message = await chatService.shareLocation(
        deliveryId,
        location.coords.latitude,
        location.coords.longitude
      );
      handleNewMessage(message);
    } catch (error) {
      console.error('Error sharing location:', error);
    } finally {
      setSending(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadMessages(page + 1);
    }
  };

  const handleTextChange = (text: string) => {
    setMessageText(text);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    chatService.setTypingStatus(true);
    typingTimeoutRef.current = setTimeout(() => {
      chatService.setTypingStatus(false);
    }, 1500);
  };

  const handleFeedback = async (messageId: string, helpful: boolean, reason?: string) => {
    try {
      await chatService.submitFeedback(messageId, helpful, reason);
      if (!helpful && reason) {
        // Escalader le ticket si le feedback est négatif
        if (currentTicket) {
          await supportService.escalateTicket(
            currentTicket.id,
            reason,
            'high'
          );
        }
        
        // Envoyer un message d'escalade
        const message = await chatService.sendMessage({
          deliveryId,
          content: t('chat.feedback.escalating'),
          isEscalated: true,
        });
        handleNewMessage(message);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setMessageText(suggestion);
    setShowSuggestions(false);
  };

  const handleQuickResponseSelect = (content: string) => {
    setMessageText(content);
    setShowQuickResponses(false);
  };

  const renderMessage = ({ item: message }: { item: ChatMessage }) => (
    <View>
      <ChatMessageBubble
        message={message}
        isOwnMessage={message.senderId === user?.id}
        showAvatar={message.senderType === 'support'}
      />
      {message.isAutomated && !message.feedbackSubmitted && (
        <ResponseFeedback
          messageId={message.id}
          onFeedback={handleFeedback}
        />
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <AccessibleText style={styles.headerTitle}>
            Service Client Transwift
          </AccessibleText>
          {currentTicket && (
            <View style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(currentTicket.priority) }
            ]}>
              <AccessibleText style={styles.priorityText}>
                {t(`support.priority.${currentTicket.priority}`)}
              </AccessibleText>
            </View>
          )}
        </View>
        <AccessibleText style={styles.headerSubtitle}>
          {t('chat.supportAvailable')}
        </AccessibleText>
        <AccessibleText style={styles.deliveryInfo}>
          {deliveryData?.trackingNumber && 
            t('delivery.trackingLabel', { number: deliveryData.trackingNumber })}
        </AccessibleText>
      </View>

      {showSuggestions && deliveryData && (
        <QuickSuggestions
          status={deliveryData.status}
          onSuggestionPress={handleSuggestionPress}
        />
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        inverted
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator style={styles.loading} color={theme.colors.primary} />
          ) : null
        }
        contentContainerStyle={styles.messageList}
      />

      <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
        {!showSuggestions && (
          <Pressable
            onPress={() => setShowSuggestions(true)}
            style={styles.inputButton}
            accessible={true}
            accessibilityLabel={t('chat.showSuggestions')}
          >
            <MaterialCommunityIcons
              name="lightbulb-outline"
              size={24}
              color={theme.colors.primary}
            />
          </Pressable>
        )}

        {user?.role === 'agent' && (
          <Pressable
            onPress={() => setShowQuickResponses(true)}
            style={styles.inputButton}
            accessible={true}
            accessibilityLabel={t('support.showQuickResponses')}
          >
            <MaterialCommunityIcons
              name="reply-outline"
              size={24}
              color={theme.colors.primary}
            />
          </Pressable>
        )}

        <Pressable
          onPress={handleImagePick}
          style={styles.attachButton}
          accessible={true}
          accessibilityLabel={t('chat.attachImage')}
        >
          <MaterialCommunityIcons
            name="image-plus"
            size={24}
            color={theme.colors.primary}
          />
        </Pressable>

        <Pressable
          onPress={handleLocationShare}
          style={styles.attachButton}
          accessible={true}
          accessibilityLabel={t('chat.shareLocation')}
        >
          <MaterialCommunityIcons
            name="map-marker"
            size={24}
            color={theme.colors.primary}
          />
        </Pressable>

        <TextInput
          style={[
            styles.input,
            { color: theme.colors.text, backgroundColor: theme.colors.background },
          ]}
          value={messageText}
          onChangeText={handleTextChange}
          placeholder={t('chat.messagePlaceholder')}
          placeholderTextColor={theme.colors.text}
          multiline
          maxLength={1000}
          accessible={true}
          accessibilityLabel={t('chat.messageInput')}
        />

        <Pressable
          onPress={handleSend}
          disabled={!messageText.trim() && !sending}
          style={[
            styles.sendButton,
            {
              opacity: !messageText.trim() && !sending ? 0.5 : 1,
            },
          ]}
          accessible={true}
          accessibilityLabel={t('chat.send')}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MaterialCommunityIcons name="send" size={24} color="#fff" />
          )}
        </Pressable>
      </View>

      <Modal
        visible={showQuickResponses}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowQuickResponses(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <AccessibleText style={[styles.modalTitle, { color: theme.colors.text }]}>
                {t('support.quickResponses')}
              </AccessibleText>
              <Pressable
                onPress={() => setShowQuickResponses(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={theme.colors.text}
                />
              </Pressable>
            </View>
            
            <QuickResponseSelector
              onSelect={handleQuickResponseSelect}
              deliveryData={deliveryData}
              category={currentTicket?.category}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const getPriorityColor = (priority: PriorityLevel): string => {
  const colors = {
    low: '#4CAF50',
    medium: '#FFC107',
    high: '#FF9800',
    urgent: '#F44336',
  };
  return colors[priority];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageList: {
    paddingVertical: 16,
  },
  loading: {
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  deliveryInfo: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  inputButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    height: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
});
