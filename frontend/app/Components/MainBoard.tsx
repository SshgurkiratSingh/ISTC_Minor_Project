"use client";
import React, { useState, useEffect } from "react";
import API_BASE_URL from "@/APIconfig";

import ClientOnly from "./clientOnly";

import HeadingCard from "./Cards/HeadCard";
import MainBoardCard from "./Cards/MainBoardCard";
export interface IoTData {
  topic: string;
  value: string;
  lastUpdate: Date; // You might want to use a Date type here if you plan to work with dates.
}

export type IoTDataArray = IoTData[];
const MainBoard = () => {
  const [ServerData, setServerData] = useState<IoTDataArray | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/frontend/logs`);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setServerData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 2000);

    return () => clearInterval(intervalId);
  }, []);
  return (
    <div className=" px-6 py-6 justify-center   flex-1 border-white">
      <div
        className="flex flex-col items-center justify-center  py-2 flex-1 border-white border-1 rounded-lg"
        style={{ backdropFilter: "blur(15px)", minHeight: "80vh" }}
      >
        <HeadingCard />
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4  m-4 
"
        >
          <ClientOnly>
            <MainBoardCard
              roomName="Room 1"
              roomId={1}
              roomTag="room1"
              data={ServerData}
              noOfFans={1}
              noOfLights={2}
              noOfSwitchBoards={1}
              noOfBrightness={1}
              tempAndHum
            />
            <MainBoardCard
              roomName="Room 2"
              roomId={2}
              roomTag="room2"
              data={ServerData}
              noOfFans={1}
              noOfLights={2}
              noOfSwitchBoards={1}
              noOfBrightness={1}
              tempAndHum
            />
            <MainBoardCard
              roomName="Kitchen"
              roomId={2}
              roomTag="kitchen"
              data={ServerData}
              noOfFans={1}
              noOfLights={2}
              noOfSwitchBoards={1}
              noOfBrightness={1}
              tempAndHum
              airQuality
            />
            <MainBoardCard
              roomName="Hall"
              roomId={3}
              roomTag="hall"
              data={ServerData}
              noOfFans={2}
              noOfLights={3}
              noOfSwitchBoards={1}
              noOfAmbient={1}
              noOfBrightness={0}
              isTvPresent
              tempAndHum
            />
            <MainBoardCard
              tempAndHum
              airQuality
              roomName="Lawn"
              roomId={5}
              data={ServerData}
              roomTag={"lawn"}
              noOfLights={4}
              isCustomPresent
              customData={[
                {
                  topic: "IoT/lawn/pump1",
                  subTitle: "Lawn Pump 1",
                  identity: "Lawn Pump 1",
                },
                {
                  topic: "IoT/lawn/pump2",
                  subTitle: "Lawn Pump 2",
                  identity: "Lawn Pump 2",
                },
                {
                  topic: "IoT/lawn/autonomousLighting",
                  subTitle: "Autonomous Lighting",
                  identity: "Lawn Autonomous Lighting",
                },
                {
                  topic: "IoT/lawn/autonomousMode",
                  subTitle: "Autonomous Watering",
                  identity: "Lawn Autonomous Mode",
                },
                {
                  topic: "IoT/lawn/disengageIndruderDetector",
                  subTitle: "Disengage InDet",
                  identity: "Lawn Disengage InDet",
                },
              ]}
            />

            <MainBoardCard
              roomName="Garage Washroom Store"
              roomTag="garage"
              roomId={6}
              noOfBrightness={1}
              data={ServerData}
              isCustomPresent
              customData={[
                {
                  topic: "IoT/garage/light1",
                  subTitle: "Garage Light 1",
                  identity: "Garage Light 1",
                },
                {
                  topic: "IoT/garage/light2",
                  subTitle: "Garage Light 2",
                  identity: "Garage Light 2",
                },
                {
                  topic: "IoT/store/light1",
                  subTitle: "Store Light 1",
                  identity: "Store Light 1",
                },
                {
                  topic: "IoT/store/light2",
                  subTitle: "Store Light 2",
                  identity: "Store Light 2",
                },
                {
                  topic: "IoT/washroom/light1",
                  subTitle: "Washroom Light 1",
                  identity: "Washroom Light 1",
                },
                {
                  topic: "IoT/washroom/gyser",
                  subTitle: "Washroom Gyser",
                  identity: "Washroom Gyser",
                },
              ]}
            />
          </ClientOnly>
        </div>
      </div>
    </div>
  );
};

export default MainBoard;
