"use client";
import React, { useState, useEffect } from "react";
import API_BASE_URL from "@/APIconfig";
import RoomDashBoard from "./Cards/RoomCard";
import HallCardDashBoard from "./Cards/HallCard";
import KitchenCard from "./Cards/KitchenCard";
import LawnDashboard from "./Cards/lawn";
export interface IoTData {
  topic: string;
  value: string;
  lastUpdate: Date; // You might want to use a Date type here if you plan to work with dates.
}

export type IoTDataArray = IoTData[];
const Dashboard = () => {
  return (
    <div className=" px-6 py-6 justify-center   flex-1 border-white">
      <div
        className="flex flex-col items-center justify-center  py-2 flex-1 border-white border-1 rounded-lg"
        style={{ backdropFilter: "blur(15px)", minHeight: "80vh" }}
      >
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4  m-4 
"
        >
          <RoomDashBoard
            roomName="Room 1"
            roomId={1}
            tempAndHum={true}
            noOfLights={2}
            noOfFans={1}
          />
          <RoomDashBoard
            roomName="Room 2"
            roomId={2}
            tempAndHum={true}
            noOfLights={2}
            noOfFans={1}
          />
          <KitchenCard
            roomName="Kitchen"
            roomId={4}
            tempAndHum={true}
            noOfLights={2}
            noOfFans={1}
            airQuality={true}
          />
          <HallCardDashBoard
            roomName="Hall"
            roomId={3}
            tempAndHum={true}
            noOfLights={3}
            noOfFans={2}
            noOfAmbient={1}
          />
          <LawnDashboard
            roomName="Lawn"
            roomId={5}
            noOfLights={3}
            noOfFans={0}
            airQuality={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
