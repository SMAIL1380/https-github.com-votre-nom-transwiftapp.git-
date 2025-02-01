import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DateRangePicker } from '../../../../components/reporting/DateRangePicker';
import { ThemeProvider } from '@react-navigation/native';
import { defaultTheme } from '../../../../theme/defaultTheme';
import DateTimePicker from '@react-native-community/datetimepicker';

jest.mock('@react-native-community/datetimepicker', () => {
  const mockComponent = jest.fn(({ value, onChange }) => {
    return null;
  });
  return mockComponent;
});

const mockTheme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    primary: '#007AFF',
    border: '#E0E0E0',
  },
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider value={mockTheme}>{children}</ThemeProvider>
);

describe('DateRangePicker', () => {
  const defaultProps = {
    startDate: new Date('2025-01-01').getTime(),
    endDate: new Date('2025-01-08').getTime(),
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders start and end date buttons', () => {
    const { getByText } = render(<DateRangePicker {...defaultProps} />, {
      wrapper,
    });

    expect(getByText('datePicker.startDate')).toBeTruthy();
    expect(getByText('datePicker.endDate')).toBeTruthy();
  });

  it('shows date picker when start date button is pressed', () => {
    const { getByText } = render(<DateRangePicker {...defaultProps} />, {
      wrapper,
    });

    fireEvent.press(getByText('datePicker.startDate'));
    expect(DateTimePicker).toHaveBeenCalledWith(
      expect.objectContaining({
        value: new Date(defaultProps.startDate),
        mode: 'date',
        maximumDate: new Date(defaultProps.endDate),
      }),
      expect.any(Object)
    );
  });

  it('shows date picker when end date button is pressed', () => {
    const { getByText } = render(<DateRangePicker {...defaultProps} />, {
      wrapper,
    });

    fireEvent.press(getByText('datePicker.endDate'));
    expect(DateTimePicker).toHaveBeenCalledWith(
      expect.objectContaining({
        value: new Date(defaultProps.endDate),
        mode: 'date',
        minimumDate: new Date(defaultProps.startDate),
      }),
      expect.any(Object)
    );
  });

  it('calls onChange with new dates when start date is changed', () => {
    const { getByText } = render(<DateRangePicker {...defaultProps} />, {
      wrapper,
    });

    fireEvent.press(getByText('datePicker.startDate'));
    const newDate = new Date('2025-01-02');
    const mockEvent = {
      type: 'set',
      nativeEvent: {
        timestamp: newDate.getTime(),
      },
    };

    // Simuler le changement de date
    const datePickerProps = (DateTimePicker as jest.Mock).mock.calls[0][0];
    datePickerProps.onChange(mockEvent, newDate);

    expect(defaultProps.onChange).toHaveBeenCalledWith(
      newDate.getTime(),
      defaultProps.endDate
    );
  });

  it('calls onChange with new dates when end date is changed', () => {
    const { getByText } = render(<DateRangePicker {...defaultProps} />, {
      wrapper,
    });

    fireEvent.press(getByText('datePicker.endDate'));
    const newDate = new Date('2025-01-07');
    const mockEvent = {
      type: 'set',
      nativeEvent: {
        timestamp: newDate.getTime(),
      },
    };

    // Simuler le changement de date
    const datePickerProps = (DateTimePicker as jest.Mock).mock.calls[0][0];
    datePickerProps.onChange(mockEvent, newDate);

    expect(defaultProps.onChange).toHaveBeenCalledWith(
      defaultProps.startDate,
      newDate.getTime()
    );
  });

  it('prevents selecting end date before start date', () => {
    const { getByText } = render(<DateRangePicker {...defaultProps} />, {
      wrapper,
    });

    fireEvent.press(getByText('datePicker.endDate'));
    const invalidDate = new Date('2024-12-31');
    const mockEvent = {
      type: 'set',
      nativeEvent: {
        timestamp: invalidDate.getTime(),
      },
    };

    // Simuler le changement de date
    const datePickerProps = (DateTimePicker as jest.Mock).mock.calls[0][0];
    datePickerProps.onChange(mockEvent, invalidDate);

    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it('prevents selecting start date after end date', () => {
    const { getByText } = render(<DateRangePicker {...defaultProps} />, {
      wrapper,
    });

    fireEvent.press(getByText('datePicker.startDate'));
    const invalidDate = new Date('2025-01-09');
    const mockEvent = {
      type: 'set',
      nativeEvent: {
        timestamp: invalidDate.getTime(),
      },
    };

    // Simuler le changement de date
    const datePickerProps = (DateTimePicker as jest.Mock).mock.calls[0][0];
    datePickerProps.onChange(mockEvent, invalidDate);

    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it('applies custom styles when provided', () => {
    const customStyle = { marginTop: 20 };
    const { container } = render(
      <DateRangePicker {...defaultProps} style={customStyle} />,
      { wrapper }
    );

    expect(container.props.style).toMatchObject(customStyle);
  });
});
