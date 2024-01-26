"use client";
import React, { useEffect, useState } from "react";
import BackGroundCard from "../Components/Cards/BackgroundCard";
import {
  Accordion,
  AccordionItem,
  Button,
  Code,
  User,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
} from "@nextui-org/react";
import { toast } from "react-toastify";
import AnalysisHistoryCard from "./historycard";
import OnOffCard from "./OnOffCard";

type DeviceDuration = {
  lastChanged: string;
  onDuration: number;
  offDuration: number;
  lastState: boolean;
};
type IoTLog = {
  topic: string;
  value: string | number;
  lastUpdate: string; // Assuming lastUpdate is always in ISO 8601 format
};

type IoTLogs = IoTLog[];
type CostData = {
  hourly: number;
  daily: number;
  weekly: number;
};

type ApiData = {
  deviceDurations: { [key: string]: DeviceDuration };
  temperatures: number[];
  humidities: number[];
  automationTriggersCount: number;
  logs: IoTLogs;
};
const MainAnalysis = () => {
  const [data, setData] = useState<ApiData>();
  const [lastTimeLoggingTriggered, setLastTimeLoggingTriggered] =
    useState<Date>();
  const [unitPrice, setUnitPrice] = useState<Number>(10);
  const calculateStatistics = (values: number[]) => {
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    return { average, min, max };
  };
  const columns = [
    { key: "topic", label: "Topic" },
    { key: "value", label: "Value" },
    { key: "lastUpdate", label: "Last Update" },
  ];

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
      const response = await fetch(`/api/userCustom/startLoggin`);
      const result = await response.json();
      setLastTimeLoggingTriggered(new Date());
      toast.success(result.msg);
    } catch (error) {
      console.error("Error starting logging:", error);
      toast.error("Error starting logging");
    }
  };
  const fanLogs = data?.logs.filter((log) => log.topic.includes("fan")) || [];
  const lightLogs =
    data?.logs.filter((log) => log.topic.includes("light")) || [];
  const [costs, setCosts] = useState<CostData>({
    hourly: 0,
    daily: 0,
    weekly: 0,
  });

  // ... other existing code

  const calculateCost = () => {
    const fanPower = 0.89; // in watts
    const lightPower = 0.25; // in watts
    let totalEnergyConsumption = 0; // in watt-hours

    Object.entries(data?.deviceDurations || {}).forEach(([key, value]) => {
      const hoursOn = value.onDuration / 3600; // convert seconds to hours
      const power = key.includes("fan") ? fanPower : lightPower;
      totalEnergyConsumption += hoursOn * power;
    });

    const energyKWh = totalEnergyConsumption / 1000; // convert watt-hours to kilowatt-hours
    const costPerHour = energyKWh * Number(unitPrice);
    const costPerDay = costPerHour * 24;
    const costPerWeek = costPerDay * 7;

    setCosts({ hourly: costPerHour, daily: costPerDay, weekly: costPerWeek });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-w-[360px] ">
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
                    ).average.toFixed(2)}°C, Max: ${
                      calculateStatistics(data.temperatures).max
                    }°C, Min: ${calculateStatistics(data.temperatures).min}°C`}
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
            )}{" "}
            {data && (
              <div className=" m-2">
                <Accordion variant="bordered">
                  <AccordionItem
                    key="1"
                    aria-label="Accordion 1"
                    title="Fan History"
                  >
                    <Table aria-label={`Table for Fan History`}>
                      <TableHeader>
                        {columns.map((column) => (
                          <TableColumn key={column.key}>
                            {column.label}
                          </TableColumn>
                        ))}
                      </TableHeader>
                      <TableBody>
                        {fanLogs.map((log) => (
                          <TableRow key={log.lastUpdate}>
                            <TableCell>{log.topic}</TableCell>
                            <TableCell>{log.value}</TableCell>
                            <TableCell>
                              {" "}
                              {new Date(log.lastUpdate).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionItem>
                  <AccordionItem
                    key="2"
                    aria-label="Light History"
                    title="Light History"
                  >
                    <Table aria-label={`Table for Light History`}>
                      <TableHeader>
                        {columns.map((column) => (
                          <TableColumn key={column.key}>
                            {column.label}
                          </TableColumn>
                        ))}
                      </TableHeader>
                      <TableBody>
                        {lightLogs.map((log) => (
                          <TableRow key={log.lastUpdate}>
                            <TableCell>{log.topic}</TableCell>
                            <TableCell>
                              {log.value == 1 ? "On" : "Off"}
                            </TableCell>
                            <TableCell>
                              {new Date(log.lastUpdate).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
            {data && (
              <div className="flex flex-col lg:flex-row items-center justify-center w-full gap-3 m-2">
                <Input
                  isRequired
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  label="Unit Price"
                  defaultValue="10"
                  className="max-w-xs"
                  value={String(unitPrice)}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                />
                <div>
                  <Button
                    color="primary"
                    onClick={calculateCost}
                    className="w-full"
                  >
                    Calculate Cost
                  </Button>
                  <div className="mt-2">
                    <p>Cost for 1 Hour: ₹{costs.hourly.toFixed(2)}</p>
                    <p>Cost for 1 Day: ₹{costs.daily.toFixed(2)}</p>
                    <p>Cost for 1 Week: ₹{costs.weekly.toFixed(2)}</p>
                  </div>
                </div>
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
