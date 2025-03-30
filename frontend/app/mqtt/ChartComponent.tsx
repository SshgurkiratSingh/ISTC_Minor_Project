// components/ChartComponent.tsx
"use client";
import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { TopicData } from "../services/mqttService";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend
);

interface ChartComponentProps {
  topic: string;
  dataPoints: TopicData[string];
}

const ChartComponent: React.FC<ChartComponentProps> = ({ topic, dataPoints }) => {
  const chartConfig = {
    data: {
      datasets: [
        {
          label: topic,
          data: dataPoints.map((point) => ({
            x: point.timestamp,
            y: point.value,
          })),
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.1,
          pointRadius: 3,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "time" as const,
          time: {
            tooltipFormat: "PPpp",
            displayFormats: {
              minute: "HH:mm",
              hour: "HH:mm",
              day: "MMM d",
            },
          },
          title: {
            display: true,
            text: "Time",
          },
        },
        y: {
          title: {
            display: true,
            text: "Value",
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.dataset.label || "";
              const value = context.parsed.y;
              return `${label}: ${value}`;
            },
          },
        },
      },
    },
  };

  return (
    <div className="h-64">
      <Line {...chartConfig} />
    </div>
  );
};

export default ChartComponent;
