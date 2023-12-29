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
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import StatusChip from "../Components/StatusChip";
type ApiResponse = {
  uid: string;
  timestamp: string; // Use 'Date' if the timestamp is a Date object
};

const ParkingContent = () => {
  const [slotAvailable, setSlotAvailable] = React.useState(
    Math.floor(Math.random() * 6)
  );
  // Fetch data from /api/user/entry
  const [data, setData] = useState<ApiResponse[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/userCustom/get-uid");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        setData(result.uidLogs);
        console.log(result); // Debug: log fetched data

        toast.success("Data refreshed successfully");
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      }
    };

    // Fetch data immediately and then set an interval to fetch every 10 seconds
    fetchData();
    const intervalId = setInterval(fetchData, 15000); // 10000 milliseconds = 10 seconds

    // Clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

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
          <Table aria-label="Example table with data">
            <TableHeader>
              <TableColumn>UID</TableColumn>
              <TableColumn>TimeStamp</TableColumn>
              <TableColumn>STATUS</TableColumn>
            </TableHeader>
            <TableBody>
              {data && data.length > 0 ? (
                data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.uid}</TableCell>
                    <TableCell>
                      {new Date(item.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <StatusChip
                        status={true}
                        label="Approved"
                        falseText=" "
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  {/* Make this TableCell span all 3 columns */}
                  <TableCell>No rows to display.</TableCell>
                  <TableCell>No rows to display.</TableCell>
                  <TableCell>No rows to display.</TableCell>
                </TableRow>
              )}
            </TableBody>
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
