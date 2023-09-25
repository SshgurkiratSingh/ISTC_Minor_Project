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
import { useState } from "react";
import { FcCancel } from "react-icons/fc";
import { TiTickOutline } from "react-icons/ti";
import AddUserModal from "./AddUser";
import EngageDisengage from "./EnDisenIntr";
const SecuritySystemPage = () => {
  const [intrusionSystem, setIntrusionSystem] = useState(false);
  const [entranceDoor, setEntranceDoor] = useState(true);
  const [garageDoor, setGarageDoor] = useState(true);
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
            <EngageDisengage />
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
