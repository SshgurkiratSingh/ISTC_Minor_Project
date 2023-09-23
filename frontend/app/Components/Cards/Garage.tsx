import { IoTData, IoTDataArray } from "../Dashboard";
import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardFooter, Button } from "@nextui-org/react";
import ToggleButton from "../input/Toggle";
import API_BASE_URL from "@/APIconfig";
import FanSpeedSelector from "../input/FanSpeedSelector";

interface RoomCardProps {
  roomName: string;
  roomId: number;
  tempAndHum?: boolean;
  noOfLights?: number;
  noOfFans?: number;
  airQuality?: boolean;
}

const GarageWashroomAndStore = ({
  roomName,
  roomId,
  tempAndHum,
  noOfLights = 0, // Default to 0 if noOfLights prop is not provided
  noOfFans = 0,
  airQuality,
}: RoomCardProps) => {
  const [garageData, setgarageData] = useState<IoTDataArray | null>(null);
  const [storeData, setstoreData] = useState<IoTDataArray | null>(null);
  const [washroomData, setwashroomData] = useState<IoTDataArray | null>(null);
  const [temperature, setTemperature] = useState<string | undefined>(undefined);
  const [humidity, setHumidity] = useState<string | undefined>(undefined);
  const [lastUpdated, setLastUpdated] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/frontend//getSpecificData/garage`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setgarageData(data);
        const response1 = await fetch(
          `${API_BASE_URL}/api/frontend//getSpecificData/store`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data1 = await response1.json();
        setstoreData(data);
        const response2 = await fetch(
          `${API_BASE_URL}/api/frontend//getSpecificData/washroom`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data2 = await response1.json();
        setwashroomData(data);
        // Extract temperature, humidity, and lastUpdated from data
        const temperatureData = data.find(
          (item: IoTData) => item.topic === `IoT/room${roomId}/temperature`
        );
        const humidityData = data.find(
          (item: IoTData) => item.topic === `IoT/room${roomId}/humidity`
        );

        if (temperatureData) {
          setTemperature(temperatureData.value);
          setLastUpdated(temperatureData.lastUpdate);
        }

        if (humidityData) {
          setHumidity(humidityData.value);
          setLastUpdated(humidityData.lastUpdate);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    // Fetch data initially
    fetchData();

    // Set up an interval to fetch data every 5 seconds
    const intervalId = setInterval(fetchData, 2000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [roomId]);

  const lastUpdatedText = (lastUpdate: string | undefined) => {
    if (lastUpdate) {
      return formatDistanceToNow(new Date(lastUpdate), { addSuffix: true });
    }
    return "";
  };

  return (
    <div>
      <Card
        shadow="md"
        isFooterBlurred
        radius="lg"
        className="border-none bg-black"
        style={{ minHeight: "200px", minWidth: "290px" }}
      >
        <div className="flex flex-col p-2">
          <div className=" grid grid-cols-1 lg:grid-cols-3 p-4 m-1 place-content-between">
            <ToggleButton
              key={3}
              topic={`IoT/garage/light1`}
              subTitle={`Garage Light 1`}
              value={
                garageData?.find((item) => item.topic === `IoT/garage/light1`)
                  ?.value === "1"
              }
            />
            <ToggleButton
              key={3}
              topic={`IoT/garage/light2`}
              subTitle={`Garage Light 2`}
              value={
                garageData?.find((item) => item.topic === `IoT/garage/light2`)
                  ?.value === "1"
              }
            />
            <ToggleButton
              key={9}
              topic={`IoT/garage/door`}
              subTitle={`Garage Door`}
              value={
                garageData?.find((item) => item.topic === `IoT/garage/door`)
                  ?.value === "1"
              }
            />
            <ToggleButton
              key={4}
              topic={`IoT/store/light1`}
              subTitle={`Store Light 1`}
              value={
                storeData?.find((item) => item.topic === `IoT/store/light1`)
                  ?.value === "1"
              }
            />
            <ToggleButton
              key={36}
              topic={`IoT/washroom/light1`}
              subTitle={`Washroom Light 1`}
              value={
                washroomData?.find(
                  (item) => item.topic === `IoT/washroom/light1`
                )?.value === "1"
              }
            />
            {/* {washroomData?.find((item) => item.topic === `IoT/washroom/light1`)
              ?.value ? (
              <div>fs</div>
            ) : (
              <div>swsrf</div>
            )} */}
            <ToggleButton
              key={22}
              topic={`IoT/washroom/gyser`}
              subTitle={`Washroom Gyser`}
              value={
                washroomData?.find(
                  (item) => item.topic === `IoT/washroom/gyser`
                )?.value === "1"
              }
            />
          </div>
          <div className="mb-14 grid gap-5 grid-cols-1 lg:grid-cols-2 p-4 m-2 place-content-between">
            <FanSpeedSelector
              key={2}
              topic={`IoT/room${roomId}/brightness`}
              subTitle={`Light Brightness `}
              value={Number(
                garageData?.find(
                  (item) => item.topic === `IoT/room${roomId}/brightness`
                )?.value
              )}
              customHeading="Brightness"
            />
          </div>
        </div>

        <CardFooter className=" justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%-_8px)] shadow-small ml-1 z-10">
          {tempAndHum ? (
            <div>
              <p className="text-tiny text-white/80">
                Temperature: <span className="font-bold">{temperature}°C</span>{" "}
                Humidity: <span className="font-bold">{humidity}%</span>
                <br /> Last Updated{" "}
                <span className="font-bold">
                  {lastUpdatedText(lastUpdated)}
                </span>
              </p>
            </div>
          ) : (
            <></>
          )}

          <Button
            className="text-tiny text-white bg-black/20"
            variant="flat"
            color="default"
            radius="lg"
            size="sm"
          >
            {roomName}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GarageWashroomAndStore;
