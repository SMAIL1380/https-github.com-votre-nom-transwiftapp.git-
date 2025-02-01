import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ReportItem } from '../../../../components/reporting/ReportItem';
import { ThemeProvider } from '@react-navigation/native';
import { defaultTheme } from '../../../../theme/defaultTheme';

const mockTheme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FFC107',
  },
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider value={mockTheme}>{children}</ThemeProvider>
);

describe('ReportItem', () => {
  const mockReport = {
    id: '1',
    deliveryId: 'delivery_1',
    type: 'success' as const,
    timestamp: Date.now(),
    batteryLevel: 0.8,
    location: {
      latitude: 48.8566,
      longitude: 2.3522,
      accuracy: 10,
    },
    details: {
      notes: 'Test report',
      photos: ['photo1.jpg', 'photo2.jpg'],
    },
    syncStatus: 'synced' as const,
  };

  it('renders correctly with all props', () => {
    const { getByText } = render(<ReportItem report={mockReport} />, {
      wrapper,
    });

    expect(getByText('reports.types.success')).toBeTruthy();
    expect(getByText('Test report')).toBeTruthy();
    expect(getByText('80%')).toBeTruthy();
    expect(getByText('2')).toBeTruthy(); // nombre de photos
  });

  it('handles press event', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ReportItem report={mockReport} onPress={onPress} />,
      { wrapper }
    );

    fireEvent.press(getByText('reports.types.success'));
    expect(onPress).toHaveBeenCalled();
  });

  it('displays different icons based on report type', () => {
    const types = ['success', 'failure', 'incident'] as const;
    const iconNames = ['check-circle', 'error', 'warning'];

    types.forEach((type, index) => {
      const report = { ...mockReport, type };
      const { getByTestId } = render(<ReportItem report={report} />, {
        wrapper,
      });

      expect(getByTestId(`type-icon-${iconNames[index]}`)).toBeTruthy();
    });
  });

  it('shows sync status correctly', () => {
    const statuses = ['synced', 'pending', 'failed'] as const;
    const iconNames = ['cloud-done', 'cloud-queue', 'cloud-off'];

    statuses.forEach((syncStatus, index) => {
      const report = { ...mockReport, syncStatus };
      const { getByTestId } = render(<ReportItem report={report} />, {
        wrapper,
      });

      expect(getByTestId(`sync-icon-${iconNames[index]}`)).toBeTruthy();
    });
  });

  it('truncates long reason text', () => {
    const longReason = 'a'.repeat(100);
    const report = {
      ...mockReport,
      details: {
        ...mockReport.details,
        reason: longReason,
      },
    };

    const { getByText } = render(<ReportItem report={report} />, {
      wrapper,
    });

    const reasonElement = getByText(longReason);
    expect(reasonElement.props.numberOfLines).toBe(2);
  });

  it('applies custom styles when provided', () => {
    const customStyle = { marginTop: 20 };
    const { container } = render(
      <ReportItem report={mockReport} style={customStyle} />,
      { wrapper }
    );

    expect(container.props.style).toMatchObject(customStyle);
  });

  it('formats timestamp correctly', () => {
    const timestamp = new Date('2025-01-08T12:00:00').getTime();
    const report = { ...mockReport, timestamp };

    const { getByText } = render(<ReportItem report={report} />, {
      wrapper,
    });

    // Le format exact dépendra de vos paramètres i18n
    expect(getByText(expect.stringContaining('2025'))).toBeTruthy();
  });
});
