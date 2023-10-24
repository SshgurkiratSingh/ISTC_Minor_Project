"use client";
import { useEffect, useState } from "react";
import { IoTData, IoTDataArray } from "../Components/MainBoard";
import { toast } from "react-toastify";
import ClientOnly from "../Components/clientOnly";
import mainPageConfig from "@/MainPageConfig";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
} from "@nextui-org/react";
import LowEndToggle from "./lowEndToggle";
import FanSpeedSelector from "../Components/input/FanSpeedSelector";
function arraysAreEqual(arrayA: IoTDataArray, arrayB: IoTDataArray): boolean {
  if (arrayA.length !== arrayB.length) return false;

  for (let i = 0; i < arrayA.length; i++) {
    const itemA = arrayA[i];
    const itemB = arrayB[i];

    if (itemA.topic !== itemB.topic || itemA.value !== itemB.value)
      return false;
  }

  return true;
}
const sendRequest = async (topic: string, value: boolean) => {
  const invertedValue = !value;
  const encodedTopic = encodeURIComponent(topic);

  try {
    const response = await fetch(
      `/api/frontend/publish?value=${invertedValue}&topic=${encodedTopic}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const responseData = await response.json();
    if (!response.ok) {
      console.error("HTTP GET request failed");
    } else {
      toast.success(`Switch toggled: ${responseData.message}`);
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

const LoweEndHome = () => {
  const [ServerData, setServerData] = useState<IoTDataArray | null>(null);
  const fetchData = async () => {
    try {
      const response = await fetch(`/api/frontend/logs`);
      if (!response.ok) {
        toast.error("Error fetching data");
      }
      const data = await response.json();

      // Only setServerData if data is different
      if (!ServerData || !arraysAreEqual(data, ServerData)) {
        setServerData(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();

    const intervalId = setInterval(fetchData, 6000);

    return () => clearInterval(intervalId);
  }, [ServerData]);

  return (
    <ClientOnly>
      <div className="flex flex-col gap-2 p-4">
        <ClientOnly>
          {mainPageConfig.map((room) => (
            <Card
              className="dark"
              style={{
                background: "url(./back2.webp)",
              }}
            >
              <CardHeader className="flex items-center justify-center">
                <p className="text-md">{room.roomName}</p>
              </CardHeader>
              <Divider />
              <CardBody className="gap-2">
                <div className="grid grid-cols-2 xl:grid-cols-5 gap-2">
                  {Array.from({ length: room.noOfLights }).map((_, index) => (
                    <LowEndToggle
                      key={index}
                      topic={`IoT/${room.roomTag}/light${index + 1}`}
                      subTitle={`Light ${index + 1}`}
                      value={
                        ServerData?.find(
                          (item) =>
                            item.topic ===
                            `IoT/${room.roomTag}/light${index + 1}`
                        )?.value === "1"
                      }
                      onToggle={sendRequest}
                    />
                  ))}{" "}
                  {Array.from({ length: room.noOfSwitchBoards }).map(
                    (_, index) => (
                      <LowEndToggle
                        key={index}
                        topic={`IoT/${room.roomTag}/switchBoard${index + 1}`}
                        subTitle={`Switch Board `}
                        value={
                          ServerData?.find(
                            (item) =>
                              item.topic ===
                              `IoT/${room.roomTag}/switchBoard${index + 1}`
                          )?.value === "1"
                        }
                        onToggle={sendRequest}
                      />
                    )
                  )}
                  {room.isCustomPresent &&
                    room.customData &&
                    room.customData.map((item, index) => (
                      <LowEndToggle
                        value={
                          ServerData?.find((i) => item.topic === i.topic)
                            ?.value === "1"
                        }
                        onToggle={sendRequest}
                        key={index}
                        {...item}
                      />
                    ))}
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-4">
                  {Array.from({ length: room.noOfFans }).map((_, index) => (
                    <FanSpeedSelector
                      key={index}
                      topic={`IoT/${room.roomTag}/fan${index + 1}`}
                      subTitle={`Fan ${index + 1}`}
                      value={Number(
                        ServerData?.find(
                          (item) =>
                            item.topic === `IoT/${room.roomTag}/fan${index + 1}`
                        )?.value
                      )}
                      customHeading="Fan Speed"
                    />
                  ))}
                  {Array.from({ length: room.noOfBrightness }).map(
                    (_, index) => (
                      <FanSpeedSelector
                        key={index}
                        topic={`IoT/${room.roomTag}/brightness${index + 1}`}
                        subTitle={`Light Brightness ${index + 1}`}
                        value={Number(
                          ServerData?.find(
                            (item) =>
                              item.topic ===
                              `IoT/${room.roomTag}/brightness${index + 1}`
                          )?.value
                        )}
                        customHeading="Brightness"
                      />
                    )
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </ClientOnly>
      </div>
    </ClientOnly>
  );
};
export default LoweEndHome;
