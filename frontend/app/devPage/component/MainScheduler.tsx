"use client";
import { MdSchedule } from "react-icons/md";
import { FaInfo } from "react-icons/fa";
import { FcRefresh } from "react-icons/fc";
import React from "react";
import { Button } from "@nextui-org/react";
import { IoMdAddCircleOutline } from "react-icons/io";
import ScheduleCard from "./Scheduleard";
import AddTask from "./AddTask";
const { v4: uuidv4 } = require("uuid");

const MainScheduler = () => {
  return (
    <div className="flex justify-center gap-2 mt-5">
      <div
        className="xl:neon-glass-effect min-h-50 flex flex-col justify-center items-center"
        style={{ minWidth: "30%", minHeight: "100vh" }}
      >
        <div
          className="flex justify-center items-center m-auto flex-col"
          style={{
            textAlign: "center",
            minHeight: "20vh",
            minWidth: "40%",
            maxWidth: "80%",
          }}
        >
          <div className="flex flex-row text-center hover:transform hover:scale-105 transition-all duration-300">
            <h1 className="text-3xl font-bold text-yellow-500 relative">
              Task itinerary
              <span className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-70 filter blur-xl mix-blend-lighten"></span>
            </h1>
            <MdSchedule size={35} className="text-yellow-500" />
          </div>
          <div className=" rounded-lg">
            <div className="flex gap-2">
              <Button
                isIconOnly
                color="warning"
                variant="faded"
                aria-label="Refresh"
              >
                <FcRefresh size={35} />
              </Button>
              <AddTask />
              {/* Button For add new  */}
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-2">
            <ScheduleCard UID={uuidv4()} Status="Awaiting Location Response" />
            <ScheduleCard UID={uuidv4()} Status="Awaiting Slot" />
            <ScheduleCard
              UID={uuidv4()}
              Status="Searching for Nearby Devices"
            />
            <ScheduleCard UID={uuidv4()} Status="Partially Completed" />
            <ScheduleCard Time={"2024-01-10"} Status="Completed with PIN8546" />
            <ScheduleCard UID={uuidv4()} Status="Cancelled By the other User" />
          </div>
        </div>
      </div>
    </div>
  );
};
export default MainScheduler;
