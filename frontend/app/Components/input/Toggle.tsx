"use client";
import API_BASE_URL from "@/APIconfig";
import { use, useEffect, useState } from "react";
import ClientOnly from "../clientOnly";
import { toast } from "react-toastify";

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

  const handleCheckboxChange = async () => {
    // Invert the value
    const invertedValue = !isToggled;

    // Update the component state
    setIsToggled(invertedValue);

    const encodedTopic = encodeURIComponent(topic);

    try {
      // Make the HTTP GET request to your server with the inverted value and topic as query parameters
      const response = await fetch(
        `${API_BASE_URL}/api/frontend/publish?value=${invertedValue}&topic=${encodedTopic}`,
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

        toast.success(`Switch toggled: ${responseData.message}`);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  if (ambientVariant) {
    return (
      <ClientOnly>
        <div className="flex flex-col items-center justify-center" id={topic}>
          <input
            type="checkbox"
            id="checkbox"
            onChange={handleCheckboxChange}
            checked={isToggled}
          />
          <label htmlFor="checkbox" className="switch">
            <div className="powersign"></div>
          </label>
          <div className="text-sm font-bold text-gray-300">{subTitle}</div>
        </div>{" "}
      </ClientOnly>
    );
  } else if (plantVersion) {
    return (
      <ClientOnly>
        <div
          className="flex flex-col items-center justify-center ml-5"
          id={topic}
        >
          <div className="sw">
            <input
              className="switch-check"
              id={`switchBoard1-${subTitle.split(" ").join("")}`}
              type="checkbox"
              checked={isToggled}
              onChange={handleCheckboxChange}
            />
            <label
              className="switch-lb"
              htmlFor={`switchBoard1-${subTitle.split(" ").join("")}`}
            >
              Check
              <span></span>
            </label>
          </div>
          <div className="text-sm font-bold text-gray-300">{subTitle}</div>
        </div>
      </ClientOnly>
    );
  } else if (slideVersion) {
    return (
      <ClientOnly>
        <div
          className="flex flex-col items-center justify-center ml-5"
          id={topic}
        >
          <input
            className="togglesw"
            type="checkbox"
            checked={isToggled}
            onChange={handleCheckboxChange}
          />

          <div className="text-sm font-bold text-gray-300">{subTitle}</div>
        </div>
      </ClientOnly>
    );
  } else {
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

export default ToggleButton;
