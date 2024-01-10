"use client";
import { MdSchedule } from "react-icons/md";
import { FaInfo } from "react-icons/fa";
import { FcRefresh } from "react-icons/fc";
import React from "react";
import { Button } from "@nextui-org/react";
import { IoMdAddCircleOutline } from "react-icons/io";
import ScheduleCard from "./Scheduleard";

const MainScheduler = () => {
  return (
    <div className="flex justify-center gap-2 mt-5">
      <div
        className="neon-glass-effect min-h-50 flex flex-col justify-center items-center"
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
            <h1 className="text-3xl font-bold text-yellow-500">
              Scheduler Portal
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
              {/* Button For add new  */}
              <Button isIconOnly color="success" variant="faded">
                <IoMdAddCircleOutline size={35} />
              </Button>
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-2">
            <ScheduleCard />
            <ScheduleCard />
            <ScheduleCard />
            <ScheduleCard />
            <ScheduleCard />
            <ScheduleCard />
          </div>
        </div>
      </div>
    </div>
  );
};
export default MainScheduler;
