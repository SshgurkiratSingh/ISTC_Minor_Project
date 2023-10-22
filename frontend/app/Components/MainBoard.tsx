"use client";
import React, { useState, useEffect } from "react";
import API_BASE_URL from "@/APIconfig";

import ClientOnly from "./clientOnly";

import HeadingCard from "./Cards/HeadCard";
import MainBoardCard from "./Cards/MainBoardCard";
import mainPageConfig from "@/MainPageConfig";
import { toast } from "react-toastify";
export interface IoTData {
  topic: string;
  value: string;
  lastUpdate: Date;
}

export type IoTDataArray = IoTData[];

function arraysAreEqual(arrayA: IoTDataArray, arrayB: IoTDataArray): boolean {
  if (arrayA.length !== arrayB.length) return false;

  for (let i = 0; i < arrayA.length; i++) {
    const itemA = arrayA[i];
    const itemB = arrayB[i];

    if (itemA.topic !== itemB.topic || itemA.value !== itemB.value)
      return false;
  }

  return true;
}

const MainBoard = () => {
  const [ServerData, setServerData] = useState<IoTDataArray | null>(null);
  const [totalConsumption, setTotalConsumption] = useState(0);

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/frontend/logs`);
      if (!response.ok) {
        toast.error("Error fetching data");
      }
      const data = await response.json();

      // Only setServerData if data is different
      if (!ServerData || !arraysAreEqual(data, ServerData)) {
        setServerData(data);
        let powerConsumption = 0;
        if (data) {
          data.forEach((item: IoTData) => {
            if (item.topic.includes("light")) {
              if (item.value == "1") {
                powerConsumption += 0.025;
              }
            }
            if (item.topic.includes("fan")) {
              powerConsumption += (0.89 * Number(item.value)) / 100;
            }
            if (item.topic.includes("pump")) {
              powerConsumption += Number(item.value) * 1.3;
            }
            if (item.topic.includes("switchBoard")) {
              powerConsumption += Number(item.value) * 0.5;
            }
            if (item.topic.includes("TV")) {
              powerConsumption += Number(item.value) * 0.5;
            }
          });
        }
        setTotalConsumption(powerConsumption);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();

    const intervalId = setInterval(fetchData, 2000);

    return () => clearInterval(intervalId);
  }, [ServerData, totalConsumption]);

  const getDataValue = (topic: string) => {
    return ServerData?.find((item) => item.topic === topic)?.value || "0";
  };
  return (
    <div className=" px-6 py-6 justify-center   flex-1 border-white">
      <div
        className="flex flex-col items-center justify-center  py-2 flex-1 border-white border-1 rounded-lg"
        style={{ backdropFilter: "blur(15px)", minHeight: "80vh" }}
      >
        <HeadingCard
          tankLevel={Number(
            ServerData?.find((i) => i.topic == "IoT/auxiliary/tankLevel")?.value
          )}
          areaCleaned={Number(
            ServerData?.find((i) => i.topic == "IoT/robot/areaCovered")?.value
          )}
          sunlightIntensity={Number(
            ServerData?.find((i) => i.topic == "IoT/entrance/lightIntensity")
              ?.value
          )}
          powerConsumption={totalConsumption}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2  m-3 gap-6">
          <ClientOnly>
            {mainPageConfig.map((room) => (
              <MainBoardCard {...room} data={ServerData} />
            ))}
          </ClientOnly>
        </div>
      </div>
    </div>
  );
};

export default MainBoard;
