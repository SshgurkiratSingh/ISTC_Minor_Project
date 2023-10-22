"use client";

import { useEffect, useState } from "react";
import { Switch } from "@nextui-org/react";

interface LowEndToggleProps {
  topic: string;
  value: boolean;
  onToggle: (topic: string, value: boolean) => void;
  subTitle: string;
}

const LowEndToggle: React.FC<LowEndToggleProps> = ({
  topic,
  value,
  onToggle,
  subTitle,
}) => {
  const [currentValue, setCurrentValue] = useState(value);
  useEffect(() => {
    // Update the checkbox state when the 'value' prop changes
    setCurrentValue(value);
  }, [value]);

  const handleValueChange = (isSelected: boolean) => {
    setCurrentValue(isSelected);
    onToggle(topic, currentValue);
  };

  return (
    <div className="inline-flex  w-full max-w-md bg-content1  items-center justify-between cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent border-primary">
      <Switch isSelected={currentValue} onValueChange={handleValueChange}>
        {subTitle}
      </Switch>
    </div>
  );
};

export default LowEndToggle;
