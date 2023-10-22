"use client";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BsBrightnessAltLow, BsFan } from "react-icons/bs";
import { Card, CardHeader, CardBody, Divider } from "@nextui-org/react";
import API_BASE_URL from "@/APIconfig";
import { debounce } from "lodash";
interface FanSpeedProps {
  topic: string;
  value: number;
  lastUpdate?: Date;
  subTitle?: string;
  style?: number;
  customHeading?: string;
  customIcon?: Boolean;
}

const FanSpeedSelector = ({
  topic,
  value,
  lastUpdate,
  subTitle,
  style,
  customHeading = "Fan Speed",
  customIcon = false,
}: FanSpeedProps) => {
  const [fanSpeed, setFanSpeed] = useState<number>(value);

  const debouncedHandleRangeChange = useCallback(
    debounce(async (newFanSpeed: number) => {
      const encodedTopic = encodeURIComponent(topic);

      try {
        const response = await fetch(
          `/api/frontend/publish?value=${newFanSpeed}&topic=${encodedTopic}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const responseData = await response.json();

        if (!response.ok) {
          console.error("HTTP GET request failed");
        } else {
          console.log("HTTP GET request succeeded");
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    }, 500), // 300ms delay
    [topic]
  );

  const handleRangeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newFanSpeed = parseInt(event.target.value);
    setFanSpeed(newFanSpeed);
    debouncedHandleRangeChange(newFanSpeed);
  };

  useEffect(() => {
    // Update the slider state when the 'value' prop changes
    setFanSpeed(value);
  }, [value]);

  return (
    <Card className="max-w-[400px] dark ">
      <CardHeader className="flex gap-3 dark">
        {customIcon ? <BsFan size={30} /> : <BsBrightnessAltLow size={30} />}

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
