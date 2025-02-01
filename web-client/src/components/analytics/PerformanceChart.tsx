import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { PerformanceMetrics } from '../../types/analytics';
import './PerformanceChart.css';

Chart.register(...registerables);

interface PerformanceChartProps {
  data: PerformanceMetrics;
  historicalData: Array<PerformanceMetrics & { timestamp: number }>;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  historicalData,
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Préparer les données pour le graphique
    const timestamps = historicalData.map(d => new Date(d.timestamp).toLocaleTimeString());
    const cpuData = historicalData.map(d => d.cpu);
    const memoryData = historicalData.map(d => d.memory);
    const latencyData = historicalData.map(d => d.latency);
    const errorRateData = historicalData.map(d => d.errorRate);

    // Détruire le graphique existant s'il y en a un
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Créer un nouveau graphique
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: timestamps,
        datasets: [
          {
            label: 'CPU (%)',
            data: cpuData,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Mémoire (%)',
            data: memoryData,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Latence (ms)',
            data: latencyData,
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Taux d\'erreur (%)',
            data: errorRateData,
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(17, 24, 39, 0.8)',
            padding: 12,
            titleColor: '#F3F4F6',
            bodyColor: '#F3F4F6',
            borderColor: '#4B5563',
            borderWidth: 1,
            displayColors: true,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                const label = context.dataset.label || '';
                return `${label}: ${value.toFixed(2)}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 8,
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(107, 114, 128, 0.1)',
            },
            ticks: {
              callback: (value) => `${value}`,
            },
          },
        },
        animations: {
          tension: {
            duration: 1000,
            easing: 'linear',
          },
        },
      },
    });

    // Mettre à jour le graphique avec les nouvelles données
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [historicalData]);

  // Ajouter des indicateurs de performance
  const getPerformanceIndicator = (value: number, threshold: number) => {
    return value > threshold ? 'high' : value > threshold / 2 ? 'medium' : 'low';
  };

  return (
    <div className="performance-chart-container">
      <div className="chart-header">
        <h3>Performance du Système</h3>
        <div className="performance-indicators">
          <div className={`indicator ${getPerformanceIndicator(data.cpu, 80)}`}>
            <span className="indicator-label">CPU</span>
            <span className="indicator-value">{data.cpu.toFixed(1)}%</span>
          </div>
          <div className={`indicator ${getPerformanceIndicator(data.memory, 90)}`}>
            <span className="indicator-label">Mémoire</span>
            <span className="indicator-value">{data.memory.toFixed(1)}%</span>
          </div>
          <div className={`indicator ${getPerformanceIndicator(data.latency, 1000)}`}>
            <span className="indicator-label">Latence</span>
            <span className="indicator-value">{data.latency.toFixed(0)}ms</span>
          </div>
          <div className={`indicator ${getPerformanceIndicator(data.errorRate, 5)}`}>
            <span className="indicator-label">Erreurs</span>
            <span className="indicator-value">{data.errorRate.toFixed(2)}%</span>
          </div>
        </div>
      </div>
      <div className="chart-container">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default PerformanceChart;
