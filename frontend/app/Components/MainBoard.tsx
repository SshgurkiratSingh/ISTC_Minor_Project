"use client";
import React, { useState, useEffect } from "react";
import API_BASE_URL from "@/APIconfig";

import ClientOnly from "./clientOnly";

import HeadingCard from "./Cards/HeadCard";
import MainBoardCard from "./Cards/MainBoardCard";
import mainPageConfig from "@/MainPageConfig";
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

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/frontend/logs`);
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();

      // Only setServerData if data is different
      if (!ServerData || !arraysAreEqual(data, ServerData)) {
        setServerData(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();

    const intervalId = setInterval(fetchData, 2000);

    return () => clearInterval(intervalId);
  }, [ServerData]); // Pass ServerData to the dependency array

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
          powerConsumption={Number(
            ServerData?.find((i) => i.topic == "IoT/auxiliary/powerConsumption")
              ?.value
          )}
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
