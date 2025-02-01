import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, IconButton, Avatar, Text, useTheme } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { sendMessage, fetchMessages } from '../../store/slices/chatSlice';

const ChatRoomScreen = ({ route }) => {
  const { chatId, name } = route.params;
  const dispatch = useDispatch();
  const theme = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000); // Poll for new messages
    return () => clearInterval(interval);
  }, [chatId]);

  const loadMessages = async () => {
    try {
      const result = await dispatch(fetchMessages(chatId)).unwrap();
      setMessages(result);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      await dispatch(sendMessage({
        chatId,
        content: message,
        type: 'text'
      })).unwrap();
      setMessage('');
      loadMessages();
      flatListRef.current?.scrollToEnd();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const renderMessage = ({ item }) => {
    const isOwnMessage = item.senderId === 'currentUser'; // Replace with actual user ID check

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        {!isOwnMessage && (
          <Avatar.Image
            size={32}
            source={item.avatar ? { uri: item.avatar } : require('../../assets/default-avatar.png')}
            style={styles.avatar}
          />
        )}
        <View style={[
          styles.messageBubble,
          {
            backgroundColor: isOwnMessage ? theme.colors.primary : theme.colors.surface,
          }
        ]}>
          <Text style={[
            styles.messageText,
            { color: isOwnMessage ? 'white' : theme.colors.onSurface }
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTime,
            { color: isOwnMessage ? 'rgba(255,255,255,0.7)' : '#666' }
          ]}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Écrivez votre message..."
          style={styles.input}
          multiline
          right={
            <TextInput.Icon
              icon="camera"
              onPress={() => {/* Handle image upload */}}
            />
          }
        />
        <IconButton
          icon="send"
          size={24}
          onPress={handleSend}
          disabled={!message.trim()}
          style={styles.sendButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messageList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  avatar: {
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 8,
  },
});

export default ChatRoomScreen;
