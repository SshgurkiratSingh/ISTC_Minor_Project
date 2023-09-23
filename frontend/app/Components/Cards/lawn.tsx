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

const LawnDashboard = ({
  roomName,
  roomId,
  tempAndHum,
  airQuality,
  noOfLights = 0, // Default to 0 if noOfLights prop is not provided
  noOfFans = 0,
}: RoomCardProps) => {
  const [ServerData, setServerData] = useState<IoTDataArray | null>(null);
  const [temperature, setTemperature] = useState<string | undefined>(undefined);
  const [humidity, setHumidity] = useState<string | undefined>(undefined);
  const [lastUpdated, setLastUpdated] = useState<string | undefined>(undefined);
  const [airQualityD, setAirQuality] = useState<string | undefined>(undefined);
  console.log(airQualityD);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/frontend//getSpecificData/lawn`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setServerData(data);

        // Extract temperature, humidity, and lastUpdated from data
        const temperatureData = data.find(
          (item: IoTData) => item.topic === `IoT/lawn/temperature`
        );
        const humidityData = data.find(
          (item: IoTData) => item.topic === `IoT/lawn/humidity`
        );
        const airQualityData = data.find(
          (item: IoTData) => item.topic === `IoT/lawn/airQuality`
        );
        const rainStatus = data.find(
          (item: IoTData) => item.topic === `IoT/lawn/rainStatus`)
        if (airQualityData) {
          setAirQuality(airQualityData.value);
          setLastUpdated(airQualityData.lastUpdate);
        }
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
          <div className="flex xl:flex-row flex-col m-2 p-2 mb-8">
            {Array.from({ length: noOfLights }).map((_, index) => (
              <ToggleButton
                key={index}
                topic={`IoT/lawn/light${index + 1}`}
                subTitle={`Light ${index + 1}`}
                value={
                  ServerData?.find(
                    (item) => item.topic === `IoT/lawn/light${index + 1}`
                  )?.value === "1"
                }
              />
            ))}
          </div>
          <div className="flex xl:flex-row flex-col m-2 p-2 mb-8">
            <ToggleButton
              key={4}
              topic="IoT/lawn/light4"
              subTitle="Light 4"
              value={
                ServerData?.find((item) => item.topic === `IoT/lawn/light4`)
                  ?.value === "1"
              }
            />
            <ToggleButton
              key={5}
              topic="IoT/lawn/pump1"
              subTitle="Pump 1"
              value={
                ServerData?.find((item) => item.topic === `IoT/lawn/pump1`)
                  ?.value === "1"
              }
            />
            <ToggleButton
              key={6}
              topic="IoT/lawn/pump2"
              subTitle="Pump 2"
              value={
                ServerData?.find((item) => item.topic === `IoT/lawn/pump2`)
                  ?.value === "1"
              }
            />
          </div>
          <div className="flex xl:flex-row flex-col m-2 p-2 mb-8">
            <ToggleButton
              key={7}
              topic="IoT/lawn/autonomousMode"
              subTitle="Autonomous Watering"
              value={
                ServerData?.find(
                  (item) => item.topic === `IoT/lawn/autonomousMode`
                )?.value === "1"
              }
            />
            <ToggleButton
              key={8}
              topic="IoT/lawn/autonomousLighting"
              subTitle="Autonomous Light COntrol"
              value={
                ServerData?.find(
                  (item) => item.topic === `IoT/lawn/autonomousLighting`
                )?.value === "1"
              }
            />
            <ToggleButton
              key={9}
              topic="IoT/lawn/disengageIndruderDetector"
              subTitle="Disengage IndruderDetector"
              value={
                ServerData?.find(
                  (item) => item.topic === `IoT/lawn/disengageIndruderDetector`
                )?.value === "1"
              }
            />
          </div>
          <div className="mb-14">
            <FanSpeedSelector
              key={2}
              topic={`IoT/lawn/brightness`}
              subTitle={`Light Brightness `}
              value={Number(
                ServerData?.find((item) => item.topic === `IoT/lawn/brightness`)
                  ?.value
              )}
              customHeading="Brightness"
            />
            {Array.from({ length: noOfFans }).map((_, index) => (
              <FanSpeedSelector
                key={index}
                topic={`IoT/lawn/fan${index + 1}`}
                subTitle={`Fan ${index + 1}`}
                value={Number(
                  ServerData?.find(
                    (item) => item.topic === `IoT/lawn/fan${index + 1}`
                  )?.value
                )}
              />
            ))}
          </div>
        </div>

        <CardFooter className=" justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%-_8px)] shadow-small ml-1 z-10">
          {airQualityD ? (
            <div>
              <p className="text-tiny text-white/80">
                Air Quality: <span className="font-bold">{airQualityD}</span>
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

export default LawnDashboard;
