"use client";
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  CardFooter,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
} from "@nextui-org/react";
import React from "react";

const ParkingContent = () => {
  const [slotAvailable, setSlotAvailable] = React.useState(
    Math.floor(Math.random() * 6)
  );
  return (
    <div className="m-2 ">
      {" "}
      <Card className="flex flex-1 justify-center items-center dark">
        <CardHeader>
          <h3 className="font-bold text-large">Smart City Parking</h3>
        </CardHeader>
        <Divider />
        <CardBody>
          {" "}
          <Table aria-label="Example empty table">
            <TableHeader>
              <TableColumn>UID</TableColumn>
              <TableColumn>TimeStamp</TableColumn>
              <TableColumn>STATUS</TableColumn>
            </TableHeader>
            <TableBody emptyContent={"No rows to display."}>{[]}</TableBody>
          </Table>
        </CardBody>
        <CardBody></CardBody>
        <Divider />
        <CardFooter>
          <Popover placement="top" className="dark">
            <PopoverTrigger>
              <Button className="ml-2 ghost" variant="ghost" color="secondary">
                Check Slot Availibility
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="px-1 py-2">
                <div className="text-small font-bold">Slot Left </div>
                <div className="text-tiny">{slotAvailable}</div>
              </div>
            </PopoverContent>
          </Popover>
          <Popover placement="top" className="dark">
            <PopoverTrigger>
              <Button className="ml-2 ghost" variant="ghost" color="primary">
                Book a Slot
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="px-1 py-2">
                <div className="text-small font-bold">Book a custom Slot</div>
                <div className="text-tiny">
                  <input
                    type="number"
                    placeholder="Enter Slot Number"
                    className="w-full rounded-md border-2 border-gray-300 p-2"
                    max={6}
                    min={1}
                  />
                  <button
                    className="bg-blue-500 text-white rounded-md p-2 mt-2"
                    onClick={() => setSlotAvailable((slotAvailable - 1) % 6)}
                  >
                    Book Slot
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </CardFooter>
      </Card>
    </div>
  );
};
export default ParkingContent;
