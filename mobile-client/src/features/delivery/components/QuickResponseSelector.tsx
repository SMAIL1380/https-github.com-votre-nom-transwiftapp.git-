import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AccessibleText } from '../../../components/accessible';
import { QuickResponse } from '../types/support.types';
import { supportService } from '../services/support.service';
import { CustomTheme } from '../../../theme/types';

interface QuickResponseSelectorProps {
  onSelect: (content: string) => void;
  deliveryData: any;
  category?: string;
}

export const QuickResponseSelector: React.FC<QuickResponseSelectorProps> = ({
  onSelect,
  deliveryData,
  category,
}) => {
  const { t } = useTranslation();
  const theme = useTheme() as CustomTheme;
  const [responses, setResponses] = useState<QuickResponse[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<QuickResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    loadResponses();
  }, [category]);

  const loadResponses = async () => {
    try {
      const data = await supportService.getQuickResponses(category);
      setResponses(data);
      setFilteredResponses(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading quick responses:', error);
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterResponses(query, selectedTags);
  };

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    filterResponses(searchQuery, newTags);
  };

  const filterResponses = (query: string, tags: string[]) => {
    let filtered = responses;

    if (query) {
      filtered = filtered.filter(
        response =>
          response.title.toLowerCase().includes(query.toLowerCase()) ||
          response.content.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (tags.length > 0) {
      filtered = filtered.filter(response =>
        tags.every(tag => response.tags.includes(tag))
      );
    }

    setFilteredResponses(filtered);
  };

  const handleResponseSelect = async (response: QuickResponse) => {
    try {
      const variables = {
        trackingNumber: deliveryData.trackingNumber,
        eta: deliveryData.estimatedDeliveryTime,
        customerName: deliveryData.customerName,
        status: t(`delivery.status.${deliveryData.status}`),
      };

      const content = await supportService.useQuickResponse(
        response.id,
        variables
      );
      onSelect(content);
    } catch (error) {
      console.error('Error using quick response:', error);
    }
  };

  const getAllTags = () => {
    const tags = new Set<string>();
    responses.forEach(response => {
      response.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color={theme.colors.text}
        />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder={t('support.searchResponses')}
          placeholderTextColor={theme.colors.text}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tagsContainer}
      >
        {getAllTags().map(tag => (
          <Pressable
            key={tag}
            style={[
              styles.tagButton,
              {
                backgroundColor: selectedTags.includes(tag)
                  ? theme.colors.primary
                  : theme.colors.card,
              },
            ]}
            onPress={() => toggleTag(tag)}
          >
            <AccessibleText
              style={[
                styles.tagText,
                {
                  color: selectedTags.includes(tag)
                    ? theme.colors.card
                    : theme.colors.text,
                },
              ]}
            >
              {tag}
            </AccessibleText>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView style={styles.responsesList}>
        {filteredResponses.map(response => (
          <Pressable
            key={response.id}
            style={[styles.responseItem, { backgroundColor: theme.colors.card }]}
            onPress={() => handleResponseSelect(response)}
          >
            <AccessibleText
              style={[styles.responseTitle, { color: theme.colors.text }]}
            >
              {response.title}
            </AccessibleText>
            <AccessibleText
              style={[styles.responsePreview, { color: theme.colors.text }]}
              numberOfLines={2}
            >
              {response.content}
            </AccessibleText>
            <View style={styles.responseMeta}>
              <AccessibleText
                style={[styles.responseUsage, { color: theme.colors.text }]}
              >
                {t('support.usedCount', { count: response.usageCount })}
              </AccessibleText>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  tagsContainer: {
    marginBottom: 16,
  },
  tagButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  tagText: {
    fontSize: 14,
  },
  responsesList: {
    flex: 1,
  },
  responseItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  responseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  responsePreview: {
    fontSize: 14,
    marginBottom: 8,
  },
  responseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  responseUsage: {
    fontSize: 12,
    opacity: 0.7,
  },
});
