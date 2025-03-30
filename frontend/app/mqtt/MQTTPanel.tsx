// components/MQTTPanel.tsx
"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  CardFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { toast } from "react-toastify";
import { Client, Message } from "paho-mqtt";
import {
  MqttMessage,
  TopicData,
  createMqttClient,
  publishMessage,
} from "./services/mqttService";
import ChartComponent from "./ChartComponent";
import MessageTable from "./MessageTable";
import ConnectionLogs from "./ConnectionLogs";

const MQTT_SERVERS = [
  { label: "Test Mosquitto", url: "wss://test.mosquitto.org:8081" },
  { label: "EMQX", url: "wss://broker.emqx.io:8084/mqtt" },
  { label: "HiveMQ", url: "wss://broker.hivemq.com:8884/mqtt" },
  { label: "Custom", url: "" },
];

const MQTTPanel = () => {
  const [mqttClient, setMqttClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [topicsInput, setTopicsInput] = useState("");
  const [subscribedTopics, setSubscribedTopics] = useState<string[]>([]);
  const [mqttServer, setMqttServer] = useState(MQTT_SERVERS[0].url);
  const [selectedServer, setSelectedServer] = useState(MQTT_SERVERS[0].label);
  const [messages, setMessages] = useState<MqttMessage[]>([]);
  const [publishMessageText, setPublishMessageText] = useState("");
  const [publishTopic, setPublishTopic] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [retentionMinutes, setRetentionMinutes] = useState(10000);
  const [topicData, setTopicData] = useState<TopicData>({});
  const [selectedPlotTopic, setSelectedPlotTopic] = useState("");
  const [showPlot, setShowPlot] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  // New state for history topic – defaulting to "mqtt/history"
  const [historyTopic, setHistoryTopic] = useState("mqtt/history");

  // Load saved data from localStorage
  useEffect(() => {
    const loadSavedData = () => {
      try {
        const savedTopics = localStorage.getItem("currentTopics");
        if (savedTopics) setTopicsInput(savedTopics);

        const savedSubscriptions = localStorage.getItem("subscribedTopics");
        if (savedSubscriptions) {
          setSubscribedTopics(JSON.parse(savedSubscriptions));
        }

        const savedServer = localStorage.getItem("mqttServer");
        if (savedServer) {
          setMqttServer(savedServer);
          const found = MQTT_SERVERS.find((srv) => srv.url === savedServer);
          setSelectedServer(found ? found.label : "Custom");
        }

        const savedMessages = localStorage.getItem("mqttMessages");
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages));
        }

        const savedTopicData = localStorage.getItem("topicData");
        if (savedTopicData) {
          const parsedData = JSON.parse(savedTopicData);
          const convertedData: TopicData = {};
          Object.keys(parsedData).forEach((topic) => {
            convertedData[topic] = parsedData[topic].map((point: any) => ({
              timestamp: new Date(point.timestamp),
              value: point.value,
            }));
          });
          setTopicData(convertedData);
        }
      } catch (error) {
        console.error("Error loading saved data:", error);
        toast.error("Error loading saved data.");
      } finally {
        setHasLoaded(true);
      }
    };

    loadSavedData();
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (!hasLoaded) return;
    try {
      localStorage.setItem("currentTopics", topicsInput);
      localStorage.setItem(
        "subscribedTopics",
        JSON.stringify(subscribedTopics)
      );
      localStorage.setItem("mqttServer", mqttServer);
      localStorage.setItem("mqttMessages", JSON.stringify(messages));
      localStorage.setItem("topicData", JSON.stringify(topicData));
    } catch (error) {
      console.error("Failed to save data:", error);
      toast.error("Failed to save data.");
    }
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

  const handleServerSelect = (label: string) => {
    setSelectedServer(label);
    const selected = MQTT_SERVERS.find((srv) => srv.label === label);
    if (selected) {
      setMqttServer(selected.url);
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
      // Create the client with an onMessageArrived callback that checks for the history topic.
      const client = createMqttClient(
        mqttServer,
        (response) => {
          if (response.errorCode !== 0) {
            addLog(`Connection lost: ${response.errorMessage}`);
            toast.error("Connection lost");
          }
          setIsConnected(false);
        },
        (message: Message) => {
          const topic = message.destinationName || "";
          const rawValue = message.payloadString || "";

          // Only process history messages when user explicitly retrieves history.
          if (topic === historyTopic) {
            try {
              const parsedHistory = JSON.parse(rawValue) as MqttMessage[];
              setMessages(parsedHistory);
              addLog("History retrieved from broker");
              toast.success("History retrieved");
            } catch (err) {
              console.error("Error parsing history", err);
              addLog("Failed to parse history data");
              toast.error("Failed to parse history data");
            }
            // Unsubscribe immediately so further history updates are not received automatically.
            client.unsubscribe(historyTopic, {
              onSuccess: () =>
                addLog(`Unsubscribed from history topic (${historyTopic})`),
              onFailure: (err: { errorMessage: string }) =>
                addLog(
                  `Failed to unsubscribe from history topic: ${err.errorMessage}`
                ),
            });
            return;
          }

          // Regular message handling
          const timestamp = new Date();
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
          const newMessage = {
            topic,
            message: rawValue,
            timestamp: timestamp.toISOString(),
          };
          setMessages((prev) => [newMessage, ...prev]);
        }
      );
      const connectOptions = {
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
              onFailure: (err: { errorMessage: string }) =>
                addLog(`Failed to subscribe to ${topic}: ${err.errorMessage}`),
            });
          });
          setSubscribedTopics(topics);
          setPublishTopic(topics[0]);
          // Note: We do not subscribe to the history topic here.
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
    if (!publishMessageText.trim()) {
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
      publishMessage(mqttClient, publishTopic, publishMessageText);
      addLog(`Published to ${publishTopic}: ${publishMessageText}`);
      toast.success("Message published");
      setPublishMessageText("");
    } catch (error) {
      addLog(
        `Publish failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      toast.error("Publish failed");
    }
  };

  // Save the current message history to the designated history topic as a retained message
  const handleSaveHistory = () => {
    if (!mqttClient?.isConnected()) {
      toast.error("Not connected to broker");
      return;
    }
    try {
      const historyPayload = JSON.stringify(messages);
      const historyMsg = new Message(historyPayload);
      historyMsg.destinationName = historyTopic;
      historyMsg.qos = 1;
      historyMsg.retained = true; // Retained so new subscribers receive the history
      mqttClient.send(historyMsg);
      addLog(`History saved to topic ${historyTopic}`);
      toast.success("History saved");
    } catch (error) {
      addLog(
        `Save history failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      toast.error("Failed to save history");
    }
  };

  // Retrieve history by subscribing to the history topic. Once a retained message is delivered,
  // the onMessageArrived callback will process it and then unsubscribe.
  const handleRetrieveHistory = () => {
    if (!mqttClient?.isConnected()) {
      toast.error("Not connected to broker");
      return;
    }
    try {
      mqttClient.subscribe(historyTopic, {
        onSuccess: () => {
          addLog(`Subscribed to history topic (${historyTopic}) for retrieval`);
          toast.success("History requested");
        },
        onFailure: (err: { errorMessage: string }) => {
          addLog(`Failed to retrieve history: ${err.errorMessage}`);
          toast.error("Failed to retrieve history");
        },
      });
    } catch (error) {
      addLog(
        `Retrieve history failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      toast.error("Failed to retrieve history");
    }
  };

  // Handler to delete a specific MQTT message by index
  const handleDeleteMessage = (index: number) => {
    setMessages((prev) => prev.filter((_, i) => i !== index));
  };

  const clearHistory = () => {
    setMessages([]);
    setTopicData({});
    addLog("Cleared message history");
    toast.info("Message history cleared");
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
          {/* Server and Topics Selection */}
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

          {/* Publish Section */}
          <div className="grid grid-cols-1 gap-4">
            <Input
              type="text"
              label="Message to Publish"
              value={publishMessageText}
              onChange={(e) => setPublishMessageText(e.target.value)}
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

          {/* Retention, Search, and History Options */}
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
            {/* History Topic Input */}
            <Input
              type="text"
              label="History Topic"
              value={historyTopic}
              onChange={(e) => setHistoryTopic(e.target.value)}
              placeholder="mqtt/history"
            />
            <div className="flex gap-2">
              <Button
                color="primary"
                onClick={handleSaveHistory}
                isDisabled={!isConnected}
              >
                Save History
              </Button>
              <Button
                color="secondary"
                onClick={handleRetrieveHistory}
                isDisabled={!isConnected}
              >
                Retrieve History
              </Button>
            </div>
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
                  <ChartComponent
                    topic={selectedPlotTopic}
                    dataPoints={topicData[selectedPlotTopic]}
                  />
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

          {/* Message Table with Delete Option */}
          <MessageTable
            messages={filteredMessages}
            onDeleteMessage={handleDeleteMessage}
          />

          <Divider />

          {/* Connection Logs with Delete Option */}
          <ConnectionLogs
            logs={logs}
            onDeleteLog={(index) =>
              setLogs((prev) => prev.filter((_, i) => i !== index))
            }
          />
        </CardBody>
        <CardFooter className="justify-between text-xs text-gray-500">
          <div>
            {isConnected ? "Connected" : "Disconnected"} | Messages:{" "}
            {messages.length} | Retention: {retentionMinutes} min
          </div>
          <div>
            {messages.length}
            {subscribedTopics.length > 0 &&
              `Subscribed to: ${subscribedTopics.join(", ")}`}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MQTTPanel;
