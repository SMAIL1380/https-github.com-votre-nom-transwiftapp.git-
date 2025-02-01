import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AccessibleText } from '../../../components/accessible';
import { AgentNote } from '../types/agent.types';
import { agentService } from '../services/agent.service';
import { CustomTheme } from '../../../theme/types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AgentNotesProps {
  ticketId: string;
  onClose: () => void;
}

export const AgentNotes: React.FC<AgentNotesProps> = ({
  ticketId,
  onClose,
}) => {
  const { t } = useTranslation();
  const theme = useTheme() as CustomTheme;
  const [notes, setNotes] = useState<AgentNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [visibility, setVisibility] = useState<AgentNote['visibility']>('team');
  const [type, setType] = useState<AgentNote['type']>('internal');
  const [showMentions, setShowMentions] = useState(false);
  const [mentions, setMentions] = useState<string[]>([]);

  useEffect(() => {
    loadNotes();
  }, [ticketId]);

  const loadNotes = async () => {
    try {
      const data = await agentService.getNotes(ticketId);
      setNotes(data);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const note = await agentService.addNote(
        ticketId,
        newNote,
        type,
        visibility,
        mentions
      );
      setNotes([...notes, note]);
      setNewNote('');
      setMentions([]);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const renderNoteIcon = (noteType: AgentNote['type']) => {
    const icons = {
      internal: 'note-text',
      transfer: 'transfer',
      escalation: 'alert-circle',
      resolution: 'check-circle',
    };
    return (
      <MaterialCommunityIcons
        name={icons[noteType]}
        size={20}
        color={theme.colors.primary}
      />
    );
  };

  const renderVisibilityBadge = (noteVisibility: AgentNote['visibility']) => {
    const badges = {
      private: { color: theme.colors.error, icon: 'eye-off' },
      team: { color: theme.colors.primary, icon: 'account-group' },
      all: { color: theme.colors.success, icon: 'eye' },
    };

    return (
      <View
        style={[
          styles.visibilityBadge,
          { backgroundColor: badges[noteVisibility].color },
        ]}
      >
        <MaterialCommunityIcons
          name={badges[noteVisibility].icon}
          size={12}
          color="#FFFFFF"
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <AccessibleText style={[styles.title, { color: theme.colors.text }]}>
          {t('support.notes.title')}
        </AccessibleText>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <MaterialCommunityIcons
            name="close"
            size={24}
            color={theme.colors.text}
          />
        </Pressable>
      </View>

      <ScrollView style={styles.notesList}>
        {notes.map((note) => (
          <View
            key={note.id}
            style={[styles.noteItem, { backgroundColor: theme.colors.card }]}
          >
            <View style={styles.noteHeader}>
              {renderNoteIcon(note.type)}
              <AccessibleText
                style={[styles.noteTimestamp, { color: theme.colors.text }]}
              >
                {formatDistanceToNow(new Date(note.createdAt), {
                  addSuffix: true,
                  locale: fr,
                })}
              </AccessibleText>
              {renderVisibilityBadge(note.visibility)}
            </View>
            <AccessibleText style={[styles.noteContent, { color: theme.colors.text }]}>
              {note.content}
            </AccessibleText>
            {note.mentions?.length > 0 && (
              <View style={styles.mentionsContainer}>
                {note.mentions.map((mention) => (
                  <View
                    key={mention}
                    style={[
                      styles.mentionBadge,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  >
                    <AccessibleText style={styles.mentionText}>
                      @{mention}
                    </AccessibleText>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
        <View style={styles.inputControls}>
          <Pressable
            onPress={() => setShowMentions(true)}
            style={styles.inputButton}
          >
            <MaterialCommunityIcons
              name="at"
              size={24}
              color={theme.colors.primary}
            />
          </Pressable>
          <Pressable
            onPress={() => {
              setType(type === 'internal' ? 'resolution' : 'internal');
            }}
            style={styles.inputButton}
          >
            <MaterialCommunityIcons
              name={type === 'internal' ? 'note-text' : 'check-circle'}
              size={24}
              color={theme.colors.primary}
            />
          </Pressable>
          <Pressable
            onPress={() => {
              setVisibility(
                visibility === 'private'
                  ? 'team'
                  : visibility === 'team'
                  ? 'all'
                  : 'private'
              );
            }}
            style={styles.inputButton}
          >
            <MaterialCommunityIcons
              name={
                visibility === 'private'
                  ? 'eye-off'
                  : visibility === 'team'
                  ? 'account-group'
                  : 'eye'
              }
              size={24}
              color={theme.colors.primary}
            />
          </Pressable>
        </View>

        <TextInput
          style={[styles.input, { color: theme.colors.text }]}
          placeholder={t('support.notes.placeholder')}
          placeholderTextColor={theme.colors.text}
          value={newNote}
          onChangeText={setNewNote}
          multiline
        />

        <Pressable
          onPress={handleAddNote}
          style={[
            styles.sendButton,
            {
              backgroundColor: newNote.trim()
                ? theme.colors.primary
                : theme.colors.border,
            },
          ]}
          disabled={!newNote.trim()}
        >
          <MaterialCommunityIcons name="send" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      <Modal
        visible={showMentions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMentions(false)}
      >
        <View style={styles.mentionsModal}>
          <View
            style={[
              styles.mentionsContent,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <View style={styles.mentionsHeader}>
              <AccessibleText
                style={[styles.mentionsTitle, { color: theme.colors.text }]}
              >
                {t('support.notes.mentionAgent')}
              </AccessibleText>
              <Pressable
                onPress={() => setShowMentions(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={theme.colors.text}
                />
              </Pressable>
            </View>
            {/* Liste des agents à mentionner */}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  notesList: {
    flex: 1,
    padding: 16,
  },
  noteItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTimestamp: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  noteContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  visibilityBadge: {
    padding: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  mentionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 4,
  },
  mentionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mentionText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  inputContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  inputControls: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  inputButton: {
    padding: 8,
    marginRight: 8,
  },
  input: {
    maxHeight: 100,
    padding: 8,
    fontSize: 14,
  },
  sendButton: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    padding: 8,
    borderRadius: 20,
  },
  mentionsModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  mentionsContent: {
    height: '50%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  mentionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mentionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
