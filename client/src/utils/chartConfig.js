export const getDefaultChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      font: {
        size: 16,
        weight: "bold",
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
    x: {
      ticks: {
        maxRotation: 45,
        minRotation: 45,
      },
    },
  },
});

export const chartColors = {
  primary: {
    background: "rgba(54, 162, 235, 0.5)",
    border: "rgba(54, 162, 235, 1)",
  },
  secondary: {
    background: "rgba(255, 206, 86, 0.5)",
    border: "rgba(255, 206, 86, 1)",
  },
  tertiary: {
    background: "rgba(75, 192, 192, 0.5)",
    border: "rgba(75, 192, 192, 1)",
  },
  quaternary: {
    background: "rgba(153, 102, 255, 0.5)",
    border: "rgba(153, 102, 255, 1)",
  },
  quinary: {
    background: "rgba(255, 159, 64, 0.5)",
    border: "rgba(255, 159, 64, 1)",
  },
};
