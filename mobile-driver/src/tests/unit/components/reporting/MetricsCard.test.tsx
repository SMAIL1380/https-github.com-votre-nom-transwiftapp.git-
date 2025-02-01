import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MetricsCard } from '../../../../components/reporting/MetricsCard';
import { ThemeProvider } from '@react-navigation/native';
import { defaultTheme } from '../../../../theme/defaultTheme';

const mockTheme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    primary: '#007AFF',
    success: '#4CAF50',
    error: '#F44336',
  },
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider value={mockTheme}>{children}</ThemeProvider>
);

describe('MetricsCard', () => {
  const defaultProps = {
    title: 'Test Metric',
    value: 42,
    icon: 'trending-up',
  };

  it('renders correctly with basic props', () => {
    const { getByText } = render(<MetricsCard {...defaultProps} />, {
      wrapper,
    });

    expect(getByText('Test Metric')).toBeTruthy();
    expect(getByText('42')).toBeTruthy();
  });

  it('displays unit when provided', () => {
    const { getByText } = render(
      <MetricsCard {...defaultProps} unit="%" />,
      { wrapper }
    );

    expect(getByText('42')).toBeTruthy();
    expect(getByText('%')).toBeTruthy();
  });

  it('shows positive trend correctly', () => {
    const { getByText } = render(
      <MetricsCard
        {...defaultProps}
        trend={{
          value: 5.5,
          label: 'Increase',
        }}
      />,
      { wrapper }
    );

    expect(getByText('5.5%')).toBeTruthy();
    expect(getByText('Increase')).toBeTruthy();
  });

  it('shows negative trend correctly', () => {
    const { getByText } = render(
      <MetricsCard
        {...defaultProps}
        trend={{
          value: -3.2,
          label: 'Decrease',
        }}
      />,
      { wrapper }
    );

    expect(getByText('3.2%')).toBeTruthy();
    expect(getByText('Decrease')).toBeTruthy();
  });

  it('applies custom styles when provided', () => {
    const customStyle = { marginTop: 20 };
    const { container } = render(
      <MetricsCard {...defaultProps} style={customStyle} />,
      { wrapper }
    );

    expect(container.props.style).toMatchObject(customStyle);
  });
});
