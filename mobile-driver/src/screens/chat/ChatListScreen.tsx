import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { List, Avatar, Searchbar, Badge, FAB } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChats } from '../../store/slices/chatSlice';

const ChatListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState([]);
  
  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const result = await dispatch(fetchChats()).unwrap();
      setChats(result);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const renderChatItem = ({ item }) => (
    <List.Item
      title={item.name}
      description={item.lastMessage}
      left={props => (
        <View>
          <Avatar.Image
            {...props}
            size={50}
            source={item.avatar ? { uri: item.avatar } : require('../../assets/default-avatar.png')}
          />
          {item.online && <Badge style={styles.onlineBadge} />}
        </View>
      )}
      right={props => (
        <View style={styles.rightContent}>
          <Text style={styles.time}>{item.lastMessageTime}</Text>
          {item.unreadCount > 0 && (
            <Badge style={styles.unreadBadge}>{item.unreadCount}</Badge>
          )}
        </View>
      )}
      onPress={() => navigation.navigate('ChatRoom', { chatId: item.id, name: item.name })}
      style={styles.chatItem}
    />
  );

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Rechercher une conversation"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <FlatList
        data={filteredChats}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatList}
      />

      <FAB
        icon="message-plus"
        style={styles.fab}
        onPress={() => navigation.navigate('Support')}
        label="Support"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  chatList: {
    paddingBottom: 80,
  },
  chatItem: {
    paddingVertical: 8,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: '#2196F3',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    size: 12,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});

export default ChatListScreen;
