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
import API_BASE_URL from "@/APIconfig";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

type SensorData = {
  topic: string;
  value: number;
  date: string;
};

interface HistoryPageCardProps {
  heading?: string;
  topic?: string;
  icon?: React.ReactNode;
  shortName?: string;
  endMark?: string;
  LongHeading?: string;
}

const HistoryCard: React.FC<HistoryPageCardProps> = ({
  heading,
  topic = "",
  icon,
  endMark = "",
  shortName = "",
  LongHeading = "",
}) => {
  const [data, setData] = useState<SensorData[]>([]);
  const [windowWidth, setWindowWidth] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);
  useEffect(() => {
    // Initialize window dimensions only on the client side
    setWindowWidth(window.innerWidth);
    setWindowHeight(window.innerHeight);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const chartWidth = Math.min(windowWidth - 50, 600); // 600 is max width
  const chartHeight = Math.min(windowHeight - 50, 400); // 400 is max height

  useEffect(() => {
    const fetchData = async () => {
      try {
        const encodedTopic = encodeURIComponent(topic);
        const response = await fetch(
          `/api/frontend/getSensorHistory?topic=${encodedTopic}`
        );

        if (response.ok) {
          const fetchedData = await response.json();

          // Transform the data
          const transformedData = fetchedData.map((item: any) => ({
            ...item,
            value: parseFloat(item.value),
            date: `${formatDistanceToNow(new Date(item.lastUpdate))} ago`, // Using date-fns for relative time
          }));

          setData(transformedData);
        } else {
          throw new Error("Invalid server response");
        }
      } catch (error) {
        toast.error("Error fetching history");
        console.error("An error occurred:", error);
      }
    };

    fetchData();
  }, [topic]);

  return (
    <div>
      <h2>{LongHeading}</h2>
      <LineChart
        width={chartWidth}
        height={chartHeight}
        data={data}
        margin={{
          top: 50,
          right: 30,
          left: 20,
          bottom: 10,
        }}
      >
        <CartesianGrid strokeDasharray="3 4" stroke="#ccc" />

        <XAxis dataKey="date">
          <Label value="Time Ago" position="bottom" offset={-5} />
        </XAxis>

        <YAxis label={{ value: heading, angle: -90, position: "insideLeft" }} />

        <Tooltip
          formatter={(value, name) => [`${value}${endMark}`, heading]}
          labelFormatter={(label) => `Time: ${label}`}
        />

        <Legend verticalAlign="top" height={36} />

        <Line
          type="monotone"
          dataKey="value"
          stroke="#0075FF"
          dot={false}
          activeDot={{ r: 5 }}
        />

        {/* <ReferenceLine
          y={25}
          label="Avg Temp"
          stroke="red"
          strokeDasharray="3 3"
        /> */}
      </LineChart>
    </div>
  );
};

export default HistoryCard;
