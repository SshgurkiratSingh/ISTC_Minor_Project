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
  Button,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Client, Message } from "paho-mqtt";
import StatusChip from "../Components/StatusChip";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  TimeScale,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";

// Register ChartJS components
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend
);

type MqttMessage = {
  topic: string;
  message: string;
  timestamp: string;
};

type TopicDataPoint = {
  timestamp: Date;
  value: number;
};

type TopicData = {
  [topic: string]: TopicDataPoint[];
};

const MQTT_SERVERS = [
  { label: "Test Mosquitto", url: "wss://test.mosquitto.org:8081" },
  { label: "EMQX", url: "wss://broker.emqx.io:8084/mqtt" },
  { label: "HiveMQ", url: "wss://broker.hivemq.com:8884/mqtt" },
  { label: "Custom", url: "" },
];

const MQTTPANEL = () => {
  const [mqttClient, setMqttClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [topicsInput, setTopicsInput] = useState("");
  const [subscribedTopics, setSubscribedTopics] = useState<string[]>([]);
  const [mqttServer, setMqttServer] = useState(MQTT_SERVERS[0].url);
  const [selectedServer, setSelectedServer] = useState(MQTT_SERVERS[0].label);
  const [messages, setMessages] = useState<MqttMessage[]>([]);
  const [publishMessage, setPublishMessage] = useState("");
  const [publishTopic, setPublishTopic] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [retentionMinutes, setRetentionMinutes] = useState(10000);
  const [topicData, setTopicData] = useState<TopicData>({});
  const [selectedPlotTopic, setSelectedPlotTopic] = useState("");
  const [showPlot, setShowPlot] = useState(false);

  // Load saved data from localStorage
  useEffect(() => {
    const loadSavedData = () => {
      const savedTopics = localStorage.getItem("currentTopics");
      const savedSubscriptions = localStorage.getItem("subscribedTopics");
      const savedServer = localStorage.getItem("mqttServer");
      const savedMessages = localStorage.getItem("mqttMessages");
      const savedTopicData = localStorage.getItem("topicData");

      if (savedTopics) setTopicsInput(savedTopics);
      if (savedSubscriptions)
        setSubscribedTopics(JSON.parse(savedSubscriptions));
      if (savedServer) {
        setMqttServer(savedServer);
        const found = MQTT_SERVERS.find((srv) => srv.url === savedServer);
        setSelectedServer(found ? found.label : "Custom");
      }
      if (savedMessages) setMessages(JSON.parse(savedMessages));
      if (savedTopicData) {
        const parsedData = JSON.parse(savedTopicData);
        // Convert string timestamps back to Date objects
        const convertedData: TopicData = {};
        Object.keys(parsedData).forEach((topic) => {
          convertedData[topic] = parsedData[topic].map((point: any) => ({
            timestamp: new Date(point.timestamp),
            value: point.value,
          }));
        });
        setTopicData(convertedData);
      }
    };

    loadSavedData();
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem("currentTopics", topicsInput);
    localStorage.setItem("subscribedTopics", JSON.stringify(subscribedTopics));
    localStorage.setItem("mqttServer", mqttServer);
    localStorage.setItem("mqttMessages", JSON.stringify(messages));
    localStorage.setItem("topicData", JSON.stringify(topicData));
  }, [topicsInput, subscribedTopics, mqttServer, messages, topicData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mqttClient?.isConnected()) {
        mqttClient.disconnect();
      }
    };
  }, [mqttClient]);

  // Message retention cleanup
  useEffect(() => {
    const interval = setInterval(() => {
      const retentionMs = retentionMinutes * 60 * 1000;

      setMessages((prev) =>
        prev.filter(
          (msg) => Date.now() - new Date(msg.timestamp).getTime() < retentionMs
        )
      );

      setTopicData((prev) => {
        const updated: TopicData = {};
        Object.keys(prev).forEach((topic) => {
          updated[topic] = prev[topic].filter(
            (point) => Date.now() - point.timestamp.getTime() < retentionMs
          );
        });
        return updated;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [retentionMinutes]);

  const addLog = (message: string) => {
    setLogs((prev) =>
      [`${new Date().toLocaleTimeString()} - ${message}`, ...prev].slice(0, 100)
    );
  };

  const parseBrokerUrl = (url: string) => {
    try {
      const protocol = url.startsWith("wss") ? "wss" : "ws";
      const noProtocol = url.replace(/^wss?:\/\//, "");
      const [hostPort, ...pathParts] = noProtocol.split("/");
      const [host, port] = hostPort.split(":");
      const path = pathParts.join("/");

      return {
        host,
        port: port ? parseInt(port) : protocol === "wss" ? 443 : 80,
        path: path ? `/${path}` : "",
        protocol,
      };
    } catch (error) {
      throw new Error("Invalid MQTT server URL");
    }
  };

  const handleConnect = async () => {
    if (!topicsInput.trim()) {
      toast.error("Please enter at least one topic");
      return;
    }

    if (!mqttServer.trim()) {
      toast.error("Please enter an MQTT server URL");
      return;
    }

    if (isConnected) {
      handleDisconnect();
      return;
    }

    setIsConnecting(true);
    addLog("Attempting to connect...");

    try {
      const { host, port, path } = parseBrokerUrl(mqttServer);
      const clientId = `web-client-${Math.random().toString(16).substr(2, 8)}`;
      const client = new Client(host, port, path, clientId);

      client.onConnectionLost = (response: {
        errorCode: number;
        errorMessage: string;
      }) => {
        if (response.errorCode !== 0) {
          addLog(`Connection lost: ${response.errorMessage}`);
          toast.error("Connection lost");
        }
        setIsConnected(false);
      };

      client.onMessageArrived = (message: Message) => {
        const topic = message.destinationName || "";
        const rawValue = message.payloadString || "";
        const timestamp = new Date();

        // Try to parse numeric values for plotting
        const numericValue = parseFloat(rawValue);
        if (!isNaN(numericValue)) {
          setTopicData((prev) => ({
            ...prev,
            [topic]: [
              ...(prev[topic] || []),
              { timestamp, value: numericValue },
            ],
          }));
        }

        // Original message handling
        const newMessage: MqttMessage = {
          topic,
          message: rawValue,
          timestamp: timestamp.toISOString(),
        };
        setMessages((prev: MqttMessage[]) => [newMessage, ...prev]);
      };

      interface ConnectOptions {
        onSuccess: () => void;
        onFailure: (err: { errorMessage: string }) => void;
        useSSL: boolean;
        reconnect: boolean;
        keepAliveInterval: number;
        cleanSession: boolean;
      }

      const connectOptions: ConnectOptions = {
        onSuccess: () => {
          setIsConnected(true);
          setIsConnecting(false);
          addLog("Connected successfully");
          toast.success("Connected to broker");

          const topics = topicsInput
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
          topics.forEach((topic) => {
            client.subscribe(topic, {
              onSuccess: () => addLog(`Subscribed to ${topic}`),
              onFailure: (err: { errorMessage: string }) => {
                addLog(`Failed to subscribe to ${topic}: ${err.errorMessage}`);
                toast.error(`Subscribe failed for ${topic}`);
              },
            });
          });
          setSubscribedTopics(topics);
          setPublishTopic(topics[0]);
        },
        onFailure: (err: { errorMessage: string }) => {
          setIsConnecting(false);
          addLog(`Connection failed: ${err.errorMessage}`);
          toast.error("Connection failed");
        },
        useSSL: mqttServer.startsWith("wss"),
        reconnect: true,
        keepAliveInterval: 30,
        cleanSession: true,
      };

      client.connect(connectOptions);
      setMqttClient(client);
    } catch (error) {
      setIsConnecting(false);
      addLog(
        `Connection error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      toast.error("Invalid connection parameters");
    }
  };

  const handleDisconnect = () => {
    if (mqttClient?.isConnected()) {
      mqttClient.disconnect();
      setIsConnected(false);
      setSubscribedTopics([]);
      addLog("Disconnected from broker");
      toast.success("Disconnected");
    }
  };

  const handlePublish = () => {
    if (!publishMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (!publishTopic.trim()) {
      toast.error("Please select a topic");
      return;
    }

    if (!mqttClient?.isConnected()) {
      toast.error("Not connected to broker");
      return;
    }

    try {
      const message = new Message(publishMessage);
      message.destinationName = publishTopic;
      message.qos = 1;
      message.retained = false;

      mqttClient.send(message);
      addLog(`Published to ${publishTopic}: ${publishMessage}`);
      toast.success("Message published");
      setPublishMessage("");
    } catch (error) {
      addLog(
        `Publish failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      toast.error("Publish failed");
    }
  };

  const clearHistory = () => {
    setMessages([]);
    setTopicData({});
    addLog("Cleared message history");
    toast.info("Message history cleared");
  };

  const handleServerSelect = (label: string) => {
    setSelectedServer(label);
    const selected = MQTT_SERVERS.find((srv) => srv.label === label);
    if (selected) {
      setMqttServer(selected.url);
    }
  };

  // Chart configuration
  const getChartConfig = (topic: string) => {
    const dataPoints = topicData[topic] || [];
    return {
      data: {
        datasets: [
          {
            label: topic,
            data: dataPoints.map((point) => ({
              x: point.timestamp,
              y: point.value,
            })),
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            tension: 0.1,
            pointRadius: 3,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: "time",
            time: {
              tooltipFormat: "PPpp",
              displayFormats: {
                minute: "HH:mm",
                hour: "HH:mm",
                day: "MMM d",
              },
            },
            title: {
              display: true,
              text: "Time",
            },
          },
          y: {
            title: {
              display: true,
              text: "Value",
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const label = context.dataset.label || "";
                const value = context.parsed.y;
                return `${label}: ${value}`;
              },
            },
          },
        },
      },
    };
  };

  const filteredMessages = messages.filter((msg) => {
    const matchesTopic =
      subscribedTopics.length === 0 || subscribedTopics.includes(msg.topic);
    const matchesSearch =
      !searchTerm ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.topic.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTopic && matchesSearch;
  });

  return (
    <div className="m-2">
      <Card className="flex flex-1 justify-center items-center dark">
        <CardHeader>
          <h3 className="font-bold text-large">MQTT Panel</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Select
              label="Select MQTT Server"
              selectedKeys={[selectedServer]}
              onChange={(e) => handleServerSelect(e.target.value)}
              className="dark"
            >
              {MQTT_SERVERS.map((server) => (
                <SelectItem
                  key={server.label}
                  value={server.label}
                  className="bg-black"
                >
                  {server.label}
                </SelectItem>
              ))}
            </Select>

            {selectedServer === "Custom" && (
              <Input
                type="text"
                label="MQTT Server URL"
                value={mqttServer}
                onChange={(e) => setMqttServer(e.target.value)}
                placeholder="wss://broker.example.com:8884/mqtt"
              />
            )}

            <Input
              type="text"
              label="Topics (comma separated)"
              value={topicsInput}
              onChange={(e) => setTopicsInput(e.target.value)}
              placeholder="topic1,topic2,topic3"
              isDisabled={isConnected}
            />

            <div className="flex gap-2">
              <Button
                color={isConnected ? "danger" : "primary"}
                onClick={isConnected ? handleDisconnect : handleConnect}
                isLoading={isConnecting}
              >
                {isConnected
                  ? "Disconnect"
                  : isConnecting
                  ? "Connecting..."
                  : "Connect"}
              </Button>
              <Button color="warning" onClick={clearHistory}>
                Clear History
              </Button>
            </div>
          </div>

          <Divider />

          <div className="grid grid-cols-1 gap-4">
            <Input
              type="text"
              label="Message to Publish"
              value={publishMessage}
              onChange={(e) => setPublishMessage(e.target.value)}
              isDisabled={!isConnected}
            />

            {isConnected && subscribedTopics.length > 0 && (
              <Select
                label="Publish Topic"
                selectedKeys={publishTopic ? [publishTopic] : []}
                onChange={(e) => setPublishTopic(e.target.value)}
              >
                {subscribedTopics.map((topic) => (
                  <SelectItem key={topic} value={topic} className="bg-black">
                    {topic}
                  </SelectItem>
                ))}
              </Select>
            )}

            <Button
              color="secondary"
              onClick={handlePublish}
              isDisabled={!isConnected || !publishTopic}
            >
              Publish
            </Button>
          </div>

          <Divider />

          <div className="grid grid-cols-1 gap-4">
            <Input
              type="text"
              label="Search Messages"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Input
              type="number"
              label="Retention Period (minutes)"
              value={retentionMinutes.toString()}
              onChange={(e) => setRetentionMinutes(Number(e.target.value))}
              min="1"
            />
          </div>

          <Divider />

          {/* Plot Section */}
          <div className="space-y-4">
            <div className="flex gap-2 items-center">
              <Button color="primary" onClick={() => setShowPlot(!showPlot)}>
                {showPlot ? "Hide Plot" : "Show Plot"}
              </Button>

              {showPlot && (
                <Select
                  label="Select Topic to Plot"
                  className="max-w-xs"
                  selectedKeys={selectedPlotTopic ? [selectedPlotTopic] : []}
                  onChange={(e) => setSelectedPlotTopic(e.target.value)}
                >
                  {Object.keys(topicData)
                    .filter((topic) => topicData[topic].length > 0)
                    .map((topic) => (
                      <SelectItem
                        key={topic}
                        value={topic}
                        className="bg-black"
                      >
                        {topic}
                      </SelectItem>
                    ))}
                </Select>
              )}
            </div>

            {showPlot && selectedPlotTopic && (
              <Card>
                <CardBody>
                  <div className="h-64">
                    <Line {...getChartConfig(selectedPlotTopic)} />
                  </div>
                </CardBody>
                <CardFooter>
                  <span className="text-sm text-gray-500">
                    Showing {topicData[selectedPlotTopic]?.length} data points
                  </span>
                </CardFooter>
              </Card>
            )}
          </div>

          <Divider />

          <div className="max-h-96 overflow-y-auto">
            <Table aria-label="MQTT Messages" removeWrapper>
              <TableHeader>
                <TableColumn>TOPIC</TableColumn>
                <TableColumn>MESSAGE</TableColumn>
                <TableColumn>TIME</TableColumn>
                <TableColumn>STATUS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No messages received">
                {filteredMessages.map((msg, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-xs">
                      {msg.topic}
                    </TableCell>
                    <TableCell className="font-mono text-xs max-w-xs truncate">
                      {msg.message.length > 50
                        ? `${msg.message.substring(0, 50)}...`
                        : msg.message}
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      <StatusChip
                        status={true}
                        label="Active"
                        falseText="Inactive"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Divider />

          <div className="max-h-40 overflow-y-auto p-2 bg-gray-900 rounded">
            <h4 className="font-bold mb-2">Connection Logs</h4>
            {logs.map((log, idx) => (
              <div key={idx} className="text-xs font-mono">
                {log}
              </div>
            ))}
          </div>
        </CardBody>
        <CardFooter className="justify-between text-xs text-gray-500">
          <div>
            {isConnected ? "Connected" : "Disconnected"} | Messages:{" "}
            {messages.length} | Retention: {retentionMinutes} min
          </div>
          <div>
            {subscribedTopics.length > 0 &&
              `Subscribed to: ${subscribedTopics.join(", ")}`}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MQTTPANEL;
