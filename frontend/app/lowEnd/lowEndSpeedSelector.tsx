"use client";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import API_BASE_URL from "@/APIconfig";
import { debounce } from "lodash";

interface LowEndFanSpeedProps {
  topic: string;
  value: number;
  lastUpdate?: Date;
  subTitle?: string;
}

const LowEndFanSpeedSelector = ({
  topic,
  value,
  lastUpdate,
  subTitle,
}: LowEndFanSpeedProps) => {
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
    <div className="flex flex-col max-w-[300px] p-2 border border-gray-300 rounded">
      <div className="flex justify-between">
        <span>{subTitle}</span>
        <span>{fanSpeed}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={fanSpeed}
        className="w-full"
        step="10"
        onChange={handleRangeChange}
      />
      
    </div>
  );
};

export default React.memo(LowEndFanSpeedSelector);
