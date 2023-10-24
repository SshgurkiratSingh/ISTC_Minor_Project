"use client";
import API_BASE_URL from "@/APIconfig";
import React, { use, useEffect, useState } from "react";
import ClientOnly from "../clientOnly";
import { toast } from "react-toastify";
import { debounce } from "lodash";
interface ToggleButtonProps {
  topic: string;
  value: boolean;
  lastUpdate?: Date;
  subTitle?: string;
  style?: number;
  ambientVariant?: boolean;
  plantVersion?: boolean;
  slideVersion?: boolean;
}

const ToggleButton = ({
  topic,
  value,
  subTitle = "Light",
  ambientVariant,
  plantVersion,
  slideVersion,
}: ToggleButtonProps) => {
  const [isToggled, setIsToggled] = useState(value);
  useEffect(() => {
    // Update the checkbox state when the 'value' prop changes
    setIsToggled(value);
  }, [value]);

  const handleCheckboxChangeActual = async () => {
    const invertedValue = !isToggled;
    setIsToggled(invertedValue);

    const encodedTopic = encodeURIComponent(topic);
    try {
      const response = await fetch(
        `/api/frontend/publish?value=${invertedValue}&topic=${encodedTopic}`,
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
        toast.success(`Switch toggled: ${responseData.message}`);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  // Debounce the actual function
  const handleCheckboxChange = debounce(handleCheckboxChangeActual, 200);

  if (plantVersion) {
    return (
      <ClientOnly>
        <div
          className="flex flex-col items-center justify-center ml-5"
          id={topic}
        >
          <div className="fx-block">
            <div className="toggle">
              <div>
                <input
                  type="checkbox"
                  id="toggles"
                  checked={isToggled}
                  onChange={handleCheckboxChange}
                />
                <div data-unchecked="On" data-checked="Off"></div>
              </div>
            </div>
          </div>

          <div className="text-sm font-bold text-gray-300">{subTitle}</div>
        </div>
      </ClientOnly>
    );
  }  else {
    return (
      <ClientOnly>
        <div className="flex flex-col items-center justify-center" id={topic}>
          <label className="switch-button" htmlFor={`switch-${topic}`}>
            <div className="switch-outer">
              <input
                id={`switch-${topic}`}
                type="checkbox"
                checked={isToggled}
                onChange={handleCheckboxChange}
              />
              <div className="button">
                <span className="button-toggle"></span>
                <span className="button-indicator"></span>
              </div>
            </div>
          </label>
          <div className="text-sm font-bold text-gray-300">{subTitle}</div>
        </div>
      </ClientOnly>
    );
  }
};

export default React.memo(ToggleButton);
