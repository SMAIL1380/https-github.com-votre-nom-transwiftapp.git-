import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Drawer,
  Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  MoreVert as MoreVertIcon,
  EmojiEmotions as EmojiIcon,
  PushPin as PinIcon,
  Reply as ReplyIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Image as ImageIcon,
  Mic as MicIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Socket } from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react';

interface Message {
  id: string;
  content: string;
  sender: any;
  createdAt: Date;
  type: string;
  status: string;
  metadata?: any;
  reactions?: string[];
  isPinned?: boolean;
}

interface ChatProps {
  conversationId: string;
  currentUser: any;
  socket: Socket;
}

export const Chat: React.FC<ChatProps> = ({
  conversationId,
  currentUser,
  socket,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState<any[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMessages();
    fetchParticipants();
    scrollToBottom();

    socket.on('newMessage', handleNewMessage);
    socket.on('messageUpdated', handleMessageUpdate);
    socket.on('messageDeleted', handleMessageDelete);

    return () => {
      socket.off('newMessage');
      socket.off('messageUpdated');
      socket.off('messageDeleted');
    };
  }, [conversationId]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
    }
  };

  const fetchParticipants = async () => {
    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/participants`,
      );
      const data = await response.json();
      setParticipants(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des participants:', error);
    }
  };

  const handleNewMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
    scrollToBottom();
  };

  const handleMessageUpdate = (updatedMessage: Message) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === updatedMessage.id ? updatedMessage : msg,
      ),
    );
  };

  const handleMessageDelete = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          replyToId: replyTo?.id,
        }),
      });

      if (response.ok) {
        setNewMessage('');
        setReplyTo(null);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/conversations/${conversationId}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload du fichier:', error);
    }
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    // Implémenter la logique d'enregistrement vocal
  };

  const handleLocationShare = async () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          await fetch(`/api/conversations/${conversationId}/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'LOCATION',
              metadata: {
                location: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                },
              },
            }),
          });
        } catch (error) {
          console.error('Erreur lors du partage de la position:', error);
        }
      });
    }
  };

  const renderMessage = (message: Message) => (
    <ListItem
      key={message.id}
      sx={{
        flexDirection:
          message.sender.id === currentUser.id ? 'row-reverse' : 'row',
      }}
    >
      <ListItemAvatar>
        <Avatar src={message.sender.avatar} />
      </ListItemAvatar>
      <Paper
        sx={{
          p: 2,
          maxWidth: '70%',
          bgcolor:
            message.sender.id === currentUser.id ? 'primary.light' : 'grey.100',
        }}
      >
        {replyTo && message.id === replyTo.id && (
          <Box sx={{ mb: 1, pl: 1, borderLeft: '3px solid grey' }}>
            <Typography variant="caption" color="textSecondary">
              En réponse à {message.sender.name}
            </Typography>
            <Typography variant="body2">{message.content}</Typography>
          </Box>
        )}
        <Typography
          variant="body1"
          color={
            message.sender.id === currentUser.id ? 'common.white' : 'text.primary'
          }
        >
          {message.content}
        </Typography>
        {message.metadata?.location && (
          <Box mt={1}>
            <LocationIcon />
            <Typography variant="caption">
              Position partagée
            </Typography>
          </Box>
        )}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            mt: 1,
          }}
        >
          {message.reactions?.length > 0 && (
            <Box mr={1}>
              {message.reactions.map((reaction, index) => (
                <Chip
                  key={index}
                  label={reaction}
                  size="small"
                  sx={{ mr: 0.5 }}
                />
              ))}
            </Box>
          )}
          <Typography variant="caption" color="textSecondary">
            {format(new Date(message.createdAt), 'Pp', { locale: fr })}
          </Typography>
        </Box>
      </Paper>
      <IconButton
        size="small"
        onClick={(event) => {
          setSelectedMessage(message);
          setAnchorEl(event.currentTarget);
        }}
      >
        <MoreVertIcon />
      </IconButton>
    </ListItem>
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Chat</Typography>
          <Box>
            <IconButton onClick={() => setShowParticipants(true)}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 2 }}>
        <List>
          {messages.map(renderMessage)}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      {replyTo && (
        <Paper sx={{ p: 1, mx: 2, mb: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2">
              Répondre à {replyTo.sender.name}
            </Typography>
            <IconButton size="small" onClick={() => setReplyTo(null)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Paper>
      )}

      <Paper sx={{ p: 2, mt: 'auto' }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item>
            <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
              <EmojiIcon />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton onClick={() => fileInputRef.current?.click()}>
              <AttachFileIcon />
            </IconButton>
            <input
              type="file"
              ref={fileInputRef}
              hidden
              onChange={handleFileUpload}
            />
          </Grid>
          <Grid item xs>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Votre message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              size="small"
            />
          </Grid>
          <Grid item>
            <IconButton onClick={handleVoiceRecord}>
              <MicIcon color={isRecording ? 'error' : 'inherit'} />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton onClick={handleLocationShare}>
              <LocationIcon />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={!newMessage.trim()}
            >
              <SendIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setReplyTo(selectedMessage)}>
          <ReplyIcon sx={{ mr: 1 }} /> Répondre
        </MenuItem>
        <MenuItem>
          <EditIcon sx={{ mr: 1 }} /> Modifier
        </MenuItem>
        <MenuItem>
          <PinIcon sx={{ mr: 1 }} /> Épingler
        </MenuItem>
        <MenuItem>
          <DeleteIcon sx={{ mr: 1 }} /> Supprimer
        </MenuItem>
      </Menu>

      <Drawer
        anchor="right"
        open={showParticipants}
        onClose={() => setShowParticipants(false)}
      >
        <Box sx={{ width: 250, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Participants
          </Typography>
          <Divider />
          <List>
            {participants.map((participant) => (
              <ListItem key={participant.id}>
                <ListItemAvatar>
                  <Avatar src={participant.avatar} />
                </ListItemAvatar>
                <ListItemText
                  primary={participant.name}
                  secondary={participant.status}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {showEmojiPicker && (
        <Box sx={{ position: 'absolute', bottom: '100px', right: '20px' }}>
          <EmojiPicker
            onEmojiClick={(emoji) =>
              setNewMessage((prev) => prev + emoji.emoji)
            }
          />
        </Box>
      )}
    </Box>
  );
};
