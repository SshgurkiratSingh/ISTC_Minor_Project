"use client";
import { Divider } from "@nextui-org/react";

import { useEffect, useState } from "react";

import AddUserModal from "./AddUser";
import EngageDisengage from "./EnDisenIntr";
import API_BASE_URL from "@/APIconfig";
import EntryLogTable, { EntryLogItem } from "./LastLog";
import CloseOpenDoor from "./closeDoor";
import BackGroundCard from "../Cards/BackgroundCard";
import StatusChip from "../StatusChip";
import ViewUsers from "./viewUsers";

const SecuritySystemPage = () => {
  const [systemData, setSystemData] = useState({
    intrusionSystem: false,
    entranceDoor: false,
    garageDoor: false,
    historyData: [],
  });

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/frontend/getSecurityData`);
      const { intrusionDetection, entranceStatus, garageStatus, entryLog } =
        await response.json();

      setSystemData({
        intrusionSystem: !intrusionDetection,
        entranceDoor: entranceStatus,
        garageDoor: garageStatus,
        historyData: entryLog,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const { intrusionSystem, entranceDoor, garageDoor, historyData } = systemData;

  return (
    <div className="flex flex-1 justify-center items-center gap-4  self-center place-items-center min-h-[600px]">
      <BackGroundCard
        darkMode
        headChildren={
          <div className="flex flex-col">
            <p className="text-md">Security System</p>
            <p className="text-small text-default-500">
              Manage the Home Security
            </p>
          </div>
        }
        bodyChildren={
          <div className="flex flex-col gap-2">
            <div className="flex flex-col xl:flex-row gap-2 flex-1 align-middle justify-center items-center">
              <AddUserModal />
              <EngageDisengage
                current={intrusionSystem}
                topic="IoT/lawn/disengageIndruderDetector"
                onClick={fetchData}
              />
              <ViewUsers />
              <CloseOpenDoor
                current={garageDoor}
                onClick={fetchData}
                topic="IoT/garage/door"
                location="Garage Door"
              />
            </div>
            <Divider orientation="vertical" />
            <EntryLogTable data={historyData} />
          </div>
        }
        footerChildren={
          <div className="gap-2 flex flex-col xl:flex-row justify-between items-center">
            <StatusChip
              status={intrusionSystem}
              label="Intrusion Detection"
              trueText="Disengaged"
              falseText="Engaged"
            />
            <StatusChip status={entranceDoor} label="Front Door" />
            <StatusChip status={garageDoor} label="Garage Door" />
          </div>
        }
      />
    </div>
  );
};
export default SecuritySystemPage;
