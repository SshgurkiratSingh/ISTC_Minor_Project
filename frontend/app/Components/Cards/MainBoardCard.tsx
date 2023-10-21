import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardFooter,
  Button,
  Progress,
  Image,
  CardHeader,
} from "@nextui-org/react";
import ToggleButton from "../input/Toggle";
import API_BASE_URL from "@/APIconfig";
import FanSpeedSelector from "../input/FanSpeedSelector";
import { IoTData, IoTDataArray } from "../MainBoard";
export interface ElementInfo {
  topic: string;
  subTitle: string;
  identity: string;
}
interface RoomCardProps {
  roomName: string;
  roomId: number;
  roomTag: String;
  data: IoTDataArray | null;
  tempAndHum?: boolean;
  noOfLights?: number;
  noOfFans?: number;
  airQuality?: boolean;
  noOfSwitchBoards?: number;
  noOfBrightness?: number;
  isTvPresent?: boolean;
  isAirConditionerPresent?: boolean;
  isCustomPresent?: boolean;
  customData?: ElementInfo[];
  customSelector?: boolean;
  SelectorData?: ElementInfo[];
  customNotes?: String;
  backImg?: string;
}

const MainBoardCard = ({
  roomName,
  roomId,
  roomTag,
  data,
  tempAndHum,
  noOfLights = 0, // Default to 0 if noOfLights prop is not provided
  noOfFans = 0,
  airQuality,
  noOfSwitchBoards = 0,
  noOfBrightness = 0,
  customSelector = false,
  SelectorData,
  isTvPresent,
  isAirConditionerPresent,
  customData,
  isCustomPresent = false,
  customNotes = "",
  backImg = "/background2.jpg",
}: RoomCardProps) => {
  const [ServerData, setServerData] = useState<IoTDataArray | null>(null);
  const [temperature, setTemperature] = useState<string | undefined>(undefined);
  const [humidity, setHumidity] = useState<string | undefined>(undefined);
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>(undefined);
  const [airQualityD, setAirQuality] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (data) {
      setServerData(data);
    }
    if (airQuality && ServerData) {
      const airQualityData = ServerData.find(
        (item: IoTData) => item.topic === `IoT/kitchen/airQuality`
      );
      if (airQualityData) {
        setAirQuality(airQualityData.value);
        setLastUpdated(airQualityData.lastUpdate);
      }
    }
    if (tempAndHum) {
      const temperatureData = data?.find(
        (item: IoTData) => item.topic === `IoT/${roomTag}/temperature`
      );
      const humidityData = data?.find(
        (item: IoTData) => item.topic === `IoT/${roomTag}/humidity`
      );
      if (temperatureData) {
        setTemperature(temperatureData.value);
        setLastUpdated(temperatureData.lastUpdate);
      }
      if (humidityData) {
        setHumidity(humidityData.value);
        setLastUpdated(humidityData.lastUpdate);
      }
    }
  }, [data, tempAndHum, roomTag, humidity, temperature]);

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
        style={{
          minHeight: "200px",
          minWidth: "290px",
          backdropFilter: "blur(15px)",
        }}
      >
        <div
          className="flex flex-col p-2"
          style={{
            backgroundImage: `url(${backImg})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className=" grid grid-cols-1 lg:grid-cols-3 p-4 m-2 place-content-between">
            {Array.from({ length: noOfLights }).map((_, index) => (
              <ToggleButton
                key={index}
                topic={`IoT/${roomTag}/light${index + 1}`}
                subTitle={`Light ${index + 1}`}
                value={
                  ServerData?.find(
                    (item) => item.topic === `IoT/${roomTag}/light${index + 1}`
                  )?.value === "1"
                }
              />
            ))}{" "}
            {Array.from({ length: noOfSwitchBoards }).map((_, index) => (
              <ToggleButton
                key={index}
                topic={`IoT/${roomTag}/switchBoard${index + 1}`}
                subTitle={`Switch Board ${index + 1}`}
                value={
                  ServerData?.find(
                    (item) =>
                      item.topic === `IoT/${roomTag}/switchBoard${index + 1}`
                  )?.value === "1"
                }
                plantVersion={true}
              />
            ))}
            {isTvPresent && (
              <ToggleButton
                topic={`IoT/${roomTag}/TV`}
                subTitle={`TV`}
                value={
                  ServerData?.find((item) => item.topic === `IoT/${roomTag}/TV`)
                    ?.value === "1"
                }
                slideVersion
              />
            )}
            {isCustomPresent &&
              customData &&
              customData.map((item, index) => (
                <ToggleButton
                  key={index}
                  value={
                    ServerData?.find((i) => i.topic === item.topic)?.value ===
                    "1"
                  }
                  {...item}
                />
              ))}
          </div>
          <div className="mb-14 grid gap-5 grid-cols-1 lg:grid-cols-2 p-4 m-2 place-content-between">
            {Array.from({ length: noOfFans }).map((_, index) => (
              <FanSpeedSelector
                key={index}
                topic={`IoT/${roomTag}/fan${index + 1}`}
                subTitle={`Fan ${index + 1}`}
                value={Number(
                  ServerData?.find(
                    (item) => item.topic === `IoT/${roomTag}/fan${index + 1}`
                  )?.value
                )}
                customIcon={true}
              />
            ))}
            {Array.from({ length: noOfBrightness }).map((_, index) => (
              <FanSpeedSelector
                key={index}
                topic={`IoT/${roomTag}/brightness${index + 1}`}
                subTitle={`Light Brightness ${index + 1}`}
                value={Number(
                  ServerData?.find(
                    (item) =>
                      item.topic === `IoT/${roomTag}/brightness${index + 1}`
                  )?.value
                )}
                customHeading="Brightness"
              />
            ))}
            {customSelector &&
              SelectorData &&
              SelectorData.map((item, index) => (
                <FanSpeedSelector
                  key={index}
                  {...item}
                  value={Number(
                    ServerData?.find((i) => i.topic === item.topic)?.value
                  )}
                />
              ))}
          </div>
        </div>
        <CardFooter className=" justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%-_8px)] shadow-small ml-1 z-10">
          {tempAndHum ? (
            <div>
              <p className="text-tiny text-white/80">
                {tempAndHum && (
                  <div>
                    Temperature:{" "}
                    <span className="font-bold">{temperature}°C</span> Humidity:{" "}
                    <span className="font-bold">{humidity}%</span>
                    <br />
                  </div>
                )}
                {airQuality && (
                  <div>
                    {" "}
                    Air Quality:{" "}
                    <span className="font-bold">{airQualityD}</span>
                    <br />
                  </div>
                )}
                {lastUpdated && (
                  <div>
                    Last Updated{" "}
                    <span className="font-bold">
                      {formatDistanceToNow(new Date(lastUpdated), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                )}
              </p>
              <p className="font-bold text-white  transition ">
                {" "}
                {customNotes}
              </p>
            </div>
          ) : (
            <></>
          )}
          <p className="font-bold text-white  transition "> {customNotes}</p>
          <Button
            className="text-tiny text-white bg-black/20 hover:animate-pulse transition"
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

export default MainBoardCard;
