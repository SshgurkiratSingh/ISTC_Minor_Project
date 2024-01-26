"use client";
import React, { useEffect, useState } from "react";
import BackGroundCard from "../Components/Cards/BackgroundCard";
import { Button, Code, User } from "@nextui-org/react";
import { toast } from "react-toastify";
import AnalysisHistoryCard from "./historycard";
import OnOffCard from "./OnOffCard";

type DeviceDuration = {
  lastChanged: string;
  onDuration: number;
  offDuration: number;
  lastState: boolean;
};

type ApiData = {
  deviceDurations: { [key: string]: DeviceDuration };
  temperatures: number[];
  humidities: number[];
  automationTriggersCount: number;
};
const MainAnalysis = () => {
  const [data, setData] = useState<ApiData>();
  const [lastTimeLoggingTriggered, setLastTimeLoggingTriggered] =
    useState<Date>();
  const calculateStatistics = (values: number[]) => {
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    return { average, min, max };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/userCustom/getReport");
        const result = await response.json();
        setData(result);
        toast.success("Data refreshed successfully");
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const startLogging = async () => {
    try {
      const response = await fetch(`/api/userCustom/startLogging`);
      const result = await response.json();
      setLastTimeLoggingTriggered(new Date());
      toast.success(result.msg);
    } catch (error) {
      console.error("Error starting logging:", error);
      toast.error("Error starting logging");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-w-[360px]">
      <BackGroundCard
        darkMode
        headChildren={
          <div className="flex flex-col items-center justify-center w-full">
            <p className="text-md">Analysis </p>
            <p className="text-small text-default-500">
              View and analyze data of Hall
            </p>
            <div className="gap-2 m-2 p-1">
              <Button
                onClick={startLogging}
                className="mt-4 bordered m-2"
                variant="bordered"
              >
                Start Logging
              </Button>

              {/* <Button
                onClick={startLogging}
                className="mt-4 bordered "
                variant="bordered"
              >
                Start Logging
              </Button> */}
            </div>{" "}
            {lastTimeLoggingTriggered && (
              <Code>
                {lastTimeLoggingTriggered &&
                  `Last time logging triggered: ${lastTimeLoggingTriggered.toLocaleString()}`}
              </Code>
            )}
          </div>
        }
        bodyChildren={
          <div className="gap-2 m-2 overflow-hidden max-w-[90%]">
            {data && (
              <div className="flex flex-col xl:flex-row items-center justify-center w-full gap-3">
                {/* Calculate and display humidity stats */}
                {data.humidities && data.humidities.length > 0 && (
                  <User
                    name="Humidity"
                    avatarProps={{
                      src: "https://cdn5.vectorstock.com/i/1000x1000/53/09/humidity-icon-vector-22865309.jpg",
                    }}
                    description={`Average: ${calculateStatistics(
                      data.humidities
                    ).average.toFixed(2)}%, Max: ${
                      calculateStatistics(data.humidities).max
                    }%, Min: ${calculateStatistics(data.humidities).min}%`}
                  />
                )}
                {/* Calculate and display temperature stats */}
                {data.temperatures && data.temperatures.length > 0 && (
                  <User
                    name="Temperature"
                    avatarProps={{
                      src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkNHDXutNFj8kx47rxc0k6dImTRtWPR2OHZm36DykFHw&s",
                    }}
                    description={`Average: ${calculateStatistics(
                      data.temperatures
                    ).average.toFixed(2)}%, Max: ${
                      calculateStatistics(data.temperatures).max
                    }%, Min: ${calculateStatistics(data.temperatures).min}%`}
                  />
                )}
              </div>
            )}{" "}
            {data && (
              <div className="flex flex-col lg:flex-row items-center justify-center w-full gap-3 m-2">
                <AnalysisHistoryCard
                  heading="Temperature"
                  data={data.temperatures}
                  LongHeading="Temperature Over Time"
                />

                <AnalysisHistoryCard
                  heading="Humidity"
                  data={data.humidities}
                  LongHeading="Humidity Over Time"
                />
              </div>
            )}
            <div className="flex flex-col lg:flex-row items-center justify-center w-full gap-3 m-2">
              {data?.deviceDurations &&
                Object.entries(data.deviceDurations).map(([key, value]) => {
                  const totalTime = value.onDuration + value.offDuration;
                  const onPercentage =
                    totalTime > 0
                      ? ((value.onDuration / totalTime) * 100).toFixed(2)
                      : 0;

                  return (
                    <OnOffCard
                      key={key}
                      Heading={`${key.split("/")[2]} On Time (%)`}
                      Value={Number(onPercentage)}
                    />
                  );
                })}
            </div>
            {data && (
              <div className="flex items-center justify-center w-full">
                <Code color="success">
                  Automation Triggered Count: {data.automationTriggersCount}
                </Code>
              </div>
            )}
          </div>
        }
        footerChildren={
          <div>
            <Button variant="ghost">Refresh Data</Button>
          </div>
        }
      />
    </div>
  );
};
export default MainAnalysis;
