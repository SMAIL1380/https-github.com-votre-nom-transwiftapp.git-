import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { ReportList } from '../../../../components/reporting/ReportList';
import { reportingService } from '../../../../features/reporting/services/ReportingService';
import { ThemeProvider } from '@react-navigation/native';
import { defaultTheme } from '../../../../theme/defaultTheme';

jest.mock('../../../../features/reporting/services/ReportingService');

const mockTheme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    border: '#E0E0E0',
  },
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider value={mockTheme}>{children}</ThemeProvider>
);

describe('ReportList', () => {
  const mockReports = [
    {
      id: '1',
      deliveryId: 'delivery_1',
      type: 'success',
      timestamp: Date.now() - 3600000,
      batteryLevel: 0.8,
      location: {
        latitude: 48.8566,
        longitude: 2.3522,
        accuracy: 10,
      },
      details: {
        notes: 'Test report 1',
      },
      syncStatus: 'synced',
    },
    {
      id: '2',
      deliveryId: 'delivery_2',
      type: 'failure',
      timestamp: Date.now(),
      batteryLevel: 0.7,
      location: {
        latitude: 48.8566,
        longitude: 2.3522,
        accuracy: 10,
      },
      details: {
        notes: 'Test report 2',
        reason: 'Customer not available',
      },
      syncStatus: 'pending',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (reportingService.getReportsByDelivery as jest.Mock).mockResolvedValue(mockReports);
  });

  it('shows loading state initially', () => {
    const { getByText } = render(
      <ReportList startDate={Date.now() - 86400000} endDate={Date.now()} />,
      { wrapper }
    );

    expect(getByText('reports.loading.title')).toBeTruthy();
  });

  it('renders reports after loading', async () => {
    const { getByText } = render(
      <ReportList startDate={Date.now() - 86400000} endDate={Date.now()} />,
      { wrapper }
    );

    await waitFor(() => {
      expect(getByText('Test report 1')).toBeTruthy();
      expect(getByText('Test report 2')).toBeTruthy();
    });
  });

  it('shows empty state when no reports', async () => {
    (reportingService.getReportsByDelivery as jest.Mock).mockResolvedValue([]);

    const { getByText } = render(
      <ReportList startDate={Date.now() - 86400000} endDate={Date.now()} />,
      { wrapper }
    );

    await waitFor(() => {
      expect(getByText('reports.empty.title')).toBeTruthy();
    });
  });

  it('filters reports by date range', async () => {
    const startDate = Date.now() - 1800000; // 30 minutes ago
    const endDate = Date.now();

    const { queryByText } = render(
      <ReportList startDate={startDate} endDate={endDate} />,
      { wrapper }
    );

    await waitFor(() => {
      expect(queryByText('Test report 1')).toBeNull(); // This report is from 1 hour ago
      expect(queryByText('Test report 2')).toBeTruthy(); // This report is current
    });
  });

  it('applies custom styles when provided', () => {
    const customStyle = { marginTop: 20 };
    const { container } = render(
      <ReportList
        startDate={Date.now() - 86400000}
        endDate={Date.now()}
        style={customStyle}
      />,
      { wrapper }
    );

    expect(container.props.style).toMatchObject(customStyle);
  });
});
