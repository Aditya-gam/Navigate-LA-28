import type { ChartOptions } from 'chart.js';

export const chartColors = {
  primary: {
    background: 'rgba(26, 115, 232, 0.2)',
    border: 'rgba(26, 115, 232, 1)',
  },
  secondary: {
    background: 'rgba(52, 168, 83, 0.2)',
    border: 'rgba(52, 168, 83, 1)',
  },
  tertiary: {
    background: 'rgba(251, 188, 5, 0.2)',
    border: 'rgba(251, 188, 5, 1)',
  },
  quaternary: {
    background: 'rgba(234, 67, 53, 0.2)',
    border: 'rgba(234, 67, 53, 1)',
  },
  quinary: {
    background: 'rgba(138, 43, 226, 0.2)',
    border: 'rgba(138, 43, 226, 1)',
  },
};

export const getDefaultChartOptions = (): ChartOptions<'line' | 'bar' | 'doughnut'> => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        color: '#333',
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#333',
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
      ticks: {
        color: '#333',
      },
    },
    y: {
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
      ticks: {
        color: '#333',
      },
    },
  },
}); 