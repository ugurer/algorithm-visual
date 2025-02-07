"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PerformanceData {
  name: string;
  data: number[];
  color: string;
}

interface PerformanceChartProps {
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  labels: string[];
  datasets: PerformanceData[];
  className?: string;
}

export function PerformanceChart({
  title,
  xAxisLabel,
  yAxisLabel,
  labels,
  datasets,
  className
}: PerformanceChartProps) {
  const chartData: ChartData<"line"> = {
    labels,
    datasets: datasets.map((dataset) => ({
      label: dataset.name,
      data: dataset.data,
      borderColor: dataset.color,
      backgroundColor: dataset.color,
      tension: 0.1,
    })),
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: xAxisLabel,
        },
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: yAxisLabel,
        },
        beginAtZero: true,
      },
    },
    animation: {
      duration: 1000,
    },
  };

  return (
    <div className={className}>
      <Line data={chartData} options={options} />
    </div>
  );
} 