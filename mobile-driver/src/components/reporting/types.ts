import { ViewStyle } from 'react-native';

export interface MetricsCardProps {
  title: string;
  value: number | string;
  icon: string;
  trend?: number;
  unit?: string;
  style?: ViewStyle;
}

export interface ReportListProps {
  reports: Report[];
  onReportPress?: (report: Report) => void;
  loading?: boolean;
  onRefresh?: () => void;
  ListEmptyComponent?: React.ReactElement;
  style?: ViewStyle;
}

export interface Report {
  id: string;
  type: 'success' | 'failure' | 'incident';
  timestamp: number;
  deliveryId: string;
  batteryLevel: number;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  details: {
    notes?: string;
    photos?: string[];
    reason?: string;
  };
  syncStatus: 'synced' | 'pending' | 'failed';
}

export interface DateRangePickerProps {
  startDate: number;
  endDate: number;
  onChange: (startDate: number, endDate: number) => void;
  style?: ViewStyle;
}
