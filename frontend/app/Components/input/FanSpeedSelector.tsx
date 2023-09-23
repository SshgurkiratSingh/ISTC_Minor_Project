import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BsFan } from "react-icons/bs";
import { Card, CardHeader, CardBody, Divider } from "@nextui-org/react";
import API_BASE_URL from "@/APIconfig";

interface FanSpeedProps {
  topic: string;
  value: number;
  lastUpdate?: Date;
  subTitle?: string;
  style?: number;
  customHeading?: string;
}

const FanSpeedSelector = ({
  topic,
  value,
  lastUpdate,
  subTitle,
  style,
  customHeading = "Fan Speed",
}: FanSpeedProps) => {
  const [fanSpeed, setFanSpeed] = useState<number>(value);

  const handleRangeChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const newFanSpeed = parseInt(event.target.value);
    setFanSpeed(newFanSpeed);

    const encodedTopic = encodeURIComponent(topic);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/frontend/publish?value=${newFanSpeed}&topic=${encodedTopic}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        // Handle the error or failed response
        console.error("HTTP GET request failed");
      } else {
        console.log("HTTP GET request succeeded");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  useEffect(() => {
    // Update the slider state when the 'value' prop changes
    setFanSpeed(value);
  }, [value]);

  return (
    <Card className="max-w-[400px] dark ">
      <CardHeader className="flex gap-3 dark">
        <BsFan size={30} />
        <div className="flex flex-col">
          <p className="text-md">{customHeading}</p>
          <p className="text-small text-default-500">{subTitle}</p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        <div className="flex flex-col items-center justify-center">
          <div className="dda">
            <input
              type="range"
              min="0"
              max="100"
              value={fanSpeed}
              className="range"
              step="10"
              onChange={handleRangeChange}
            />
            <div className="w-full flex justify-between text-xs px-2">
              <span>0</span>
              <span>20</span>
              <span>40</span>
              <span>60</span>
              <span>80</span>
              <span>100</span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default FanSpeedSelector;
