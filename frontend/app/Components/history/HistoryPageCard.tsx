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

const HistoryPageCard = () => {
  const [selectedTopic, setSelectedTopic] = useState(sensorTopics[0].topic);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTopic(e.target.value);
  };

  const selectedProps =
    sensorTopics.find((item) => item.topic === selectedTopic) || {};

  return (
    <div className="flex flex-1 justify-center items-center gap-4 self-center place-items-center min-h-[600px]">
      <Card className="min-w-[200px] min-h-[400px]">
        <CardHeader className="flex gap-3">
          <div className="flex flex-col">
            <p className="text-md">Sensor History</p>
            <p className="text-small text-default-500">History of sensors</p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="flex flex-col gap-2">
            {selectedProps && <HistoryCard {...selectedProps} />}
          </div>
        </CardBody>
        <Divider />
        <CardFooter className="gap-2 flex flex-col xl:flex-row justify-between items-center">
          <select onChange={handleChange}>
            {sensorTopics.map((item, index) => (
              <option key={index} value={item.topic}>
                {item.LongHeading}
              </option>
            ))}
          </select>
        </CardFooter>
      </Card>
    </div>
  );
};

export default HistoryPageCard;
