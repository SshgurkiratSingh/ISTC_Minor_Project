"use client";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Link,
  Image,
  Spacer,
} from "@nextui-org/react";
import { Chip } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { FcCancel } from "react-icons/fc";
import { TiTickOutline } from "react-icons/ti";
import AddUserModal from "./AddUser";
import EngageDisengage from "./EnDisenIntr";
import API_BASE_URL from "@/APIconfig";
import EntryLogTable, { EntryLogItem } from "./LastLog";
import { set } from "date-fns";
const SecuritySystemPage = () => {
  const [intrusionSystem, setIntrusionSystem] = useState(false);
  const [entranceDoor, setEntranceDoor] = useState(false);
  const [garageDoor, setGarageDoor] = useState(false);
  const [historyData, setHistoryData] = useState<EntryLogItem[]>([]);
  const fetchData = () => {
    fetch(`${API_BASE_URL}/api/frontend/getSecurityData`)
      .then((response) => response.json())
      .then((data) => {
        // Convert the "value" field to a boolean

        setIntrusionSystem(!data["intrusionDetection"]);
        setEntranceDoor(data["entranceStatus"]);
        setGarageDoor(data["garageStatus"]);
        setHistoryData(data["entryLog"]);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  useEffect(() => {
    fetchData(); // Initial fetch
    const intervalId = setInterval(fetchData, 5000); // Fetch data every 5 seconds

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-1 justify-center items-center gap-4  self-center place-items-center min-h-[600px]">
      {" "}
      <Card className="min-w-[200px] min-h-[400px] dark">
        <CardHeader className="flex gap-3">
          <div className="flex flex-col">
            <p className="text-md">Security System</p>
            <p className="text-small text-default-500">
              Manage the Home Security
            </p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="flex flex-row gap-2">
            <AddUserModal />
            <EngageDisengage
              current={intrusionSystem}
              topic="IoT/lawn/disengageIndruderDetector"
              onClick={fetchData}
            />
            <Divider orientation="vertical" />
            <EntryLogTable data={historyData} />
          </div>
        </CardBody>
        <Divider />
        <CardFooter className="gap-2 flex flex-col xl:flex-row justify-between items-center">
          <Chip
            startContent={
              intrusionSystem ? (
                <TiTickOutline size={20} />
              ) : (
                <FcCancel size={20} />
              )
            }
            variant="faded"
            color={intrusionSystem ? "success" : "danger"}
          >
            Intrusion Detection {intrusionSystem ? "Engaged" : "Disengaged"}
          </Chip>
          <Chip
            startContent={
              entranceDoor ? (
                <TiTickOutline size={20} />
              ) : (
                <FcCancel size={20} />
              )
            }
            variant="faded"
            color={entranceDoor ? "success" : "danger"}
          >
            Front Door {entranceDoor ? "Closed" : "Opened"}
          </Chip>
          <Chip
            startContent={
              garageDoor ? <TiTickOutline size={20} /> : <FcCancel size={20} />
            }
            variant="faded"
            color={garageDoor ? "success" : "danger"}
          >
            Garage Door {garageDoor ? "Closed" : "Opened"}
          </Chip>
        </CardFooter>
      </Card>
    </div>
  );
};
export default SecuritySystemPage;
