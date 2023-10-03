"use client";
import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
} from "@nextui-org/react";
import HistoryCard from "./historycard";
import sensorTopics from "@/HistoryConfig";
import BackGroundCard from "../Cards/BackgroundCard";

const HistoryPageCard = () => {
  const [selectedTopic, setSelectedTopic] = useState(sensorTopics[0].topic);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTopic(e.target.value);
  };

  const selectedProps =
    sensorTopics.find((item) => item.topic === selectedTopic) || {};

  return (
    <div className="flex flex-1 justify-center items-center gap-4 self-center place-items-center min-h-[600px]">
      <BackGroundCard
        darkMode
        footerChildren={
          <select onChange={handleChange}>
            {sensorTopics.map((item, index) => (
              <option key={index} value={item.topic}>
                {item.LongHeading}
              </option>
            ))}
          </select>
        }
        bodyChildren={
          <div className="flex flex-col gap-2">
            {selectedProps && <HistoryCard {...selectedProps} />}
          </div>
        }
        headChildren={
          <div className="flex flex-col">
            <p className="text-md">Sensor History</p>
            <p className="text-small text-default-500">History of sensors</p>
          </div>
        }
      />
    </div>
  );
};

export default HistoryPageCard;
