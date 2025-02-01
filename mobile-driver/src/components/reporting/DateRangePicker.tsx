import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

interface DateRangePickerProps {
  startDate: number;
  endDate: number;
  onChange: (startDate: number, endDate: number) => void;
  style?: any;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  style,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      const timestamp = selectedDate.getTime();
      if (timestamp <= endDate) {
        onChange(timestamp, endDate);
      }
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      const timestamp = selectedDate.getTime();
      if (timestamp >= startDate) {
        onChange(startDate, timestamp);
      }
    }
  };

  const renderDateButton = (
    date: number,
    label: string,
    onPress: () => void
  ) => (
    <TouchableOpacity
      style={[
        styles.dateButton,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.dateLabel, { color: theme.colors.text }]}>
        {label}
      </Text>
      <View style={styles.dateContent}>
        <Text style={[styles.dateText, { color: theme.colors.text }]}>
          {format(date, 'PP')}
        </Text>
        <Icon name="event" size={20} color={theme.colors.primary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      {renderDateButton(
        startDate,
        t('datePicker.startDate'),
        () => setShowStartPicker(true)
      )}

      <View
        style={[styles.separator, { backgroundColor: theme.colors.border }]}
      />

      {renderDateButton(
        endDate,
        t('datePicker.endDate'),
        () => setShowEndPicker(true)
      )}

      {showStartPicker && (
        <DateTimePicker
          value={new Date(startDate)}
          mode="date"
          onChange={handleStartDateChange}
          maximumDate={new Date(endDate)}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={new Date(endDate)}
          mode="date"
          onChange={handleEndDateChange}
          minimumDate={new Date(startDate)}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.7,
  },
  dateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  separator: {
    width: 16,
    height: 1,
    marginHorizontal: 8,
  },
});
