import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Label,
} from "recharts";
import { toast } from "react-toastify";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

interface HistoryPageCardProps {
  heading?: string;
  data: number[]; // Array of sensor readings
  endMark?: string;
  LongHeading?: string;
}
type ChartData = {
  index: number;
  value: number;
};

const AnalysisHistoryCard: React.FC<HistoryPageCardProps> = ({
  heading = "",
  data,
  endMark = "",
  LongHeading = "",
}) => {
  const formattedData: ChartData[] = data.map((value, index) => ({
    index: index + 1, // Assuming index starts at 1
    value,
  }));

  return (
    <div className="text-black">
      <h2 className="text-white hover:text-red-300 transition text-center">
        {LongHeading}
      </h2>
      <LineChart
        width={600} // Adjust these as per your layout
        height={400}
        data={formattedData}
        margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="index"
          label={{
            value: "",
            position: "insideBottomRight",
            offset: 0,
          }}
        />
        <YAxis label={{ value: heading, angle: -90, position: "insideLeft" }} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </div>
  );
};

export default AnalysisHistoryCard;
