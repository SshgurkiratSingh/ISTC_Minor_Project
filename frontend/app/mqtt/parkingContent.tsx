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
import mqtt from "mqtt";
import StatusChip from "../Components/StatusChip";

type MqttMessage = {
  topic: string;
  message: string;
  timestamp: string;
};

const MQTT_SERVERS = [
  { label: "Test Mosquitto", url: "ws://test.mosquitto.org:8080" },
  { label: "EMQX", url: "ws://broker.emqx.io:8083/mqtt" },
  { label: "HiveMQ", url: "ws://broker.hivemq.com:8000/mqtt" },
  { label: "Custom", url: "" },
];

const MQTTPANEL = () => {
  const [mqttClient, setMqttClient] = useState<mqtt.MqttClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [topicsInput, setTopicsInput] = useState(() => {
    const savedTopic = localStorage.getItem("currentTopics");
    return savedTopic || "";
  });
  const [subscribedTopics, setSubscribedTopics] = useState<string[]>(() => {
    const savedTopics = localStorage.getItem("subscribedTopics");
    return savedTopics ? JSON.parse(savedTopics) : [];
  });
  const [mqttServer, setMqttServer] = useState(() => {
    const savedServer = localStorage.getItem("mqttServer");
    return savedServer || MQTT_SERVERS[0].url;
  });
  const [selectedServer, setSelectedServer] = useState(() => {
    // If the saved mqttServer URL matches one of the predefined servers, select that option
    const found = MQTT_SERVERS.find((srv) => srv.url === mqttServer);
    return found ? found.label : "Custom";
  });
  const [messages, setMessages] = useState<MqttMessage[]>(() => {
    const savedMessages = localStorage.getItem("mqttMessages");
    return savedMessages ? JSON.parse(savedMessages) : [];
  });

  const [publishMessage, setPublishMessage] = useState("");
  const [publishTopic, setPublishTopic] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [retentionMinutes, setRetentionMinutes] = useState(60);

  useEffect(() => {
    localStorage.setItem("currentTopics", topicsInput);
  }, [topicsInput]);

  useEffect(() => {
    localStorage.setItem("subscribedTopics", JSON.stringify(subscribedTopics));
  }, [subscribedTopics]);

  useEffect(() => {
    localStorage.setItem("mqttServer", mqttServer);
  }, [mqttServer]);

  useEffect(() => {
    localStorage.setItem("mqttMessages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    return () => {
      if (mqttClient) {
        mqttClient.end();
      }
    };
  }, [mqttClient]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => {
          const messageTime = new Date(msg.timestamp).getTime();
          const now = Date.now();
          return now - messageTime < retentionMinutes * 60 * 1000;
        })
      );
    }, 60000);

    return () => clearInterval(intervalId);
  }, [retentionMinutes]);

  const addLog = (message: string) => {
    setLogs((prevLogs) => [
      new Date().toLocaleTimeString() + " - " + message,
      ...prevLogs,
    ]);
  };

  const handleConnect = () => {
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
    }

    const topicsArray = topicsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (topicsArray.length === 0) {
      toast.error("No valid topics provided");
      return;
    }

    const client = mqtt.connect(mqttServer);

    client.on("connect", () => {
      setIsConnected(true);
      addLog("Connected to MQTT broker");
      topicsArray.forEach((topic) => {
        client.subscribe(topic, (err) => {
          if (err) {
            addLog("Failed to subscribe to " + topic);
            toast.error("Failed to subscribe to " + topic);
          } else {
            addLog("Subscribed to " + topic);
          }
        });
      });
      toast.success(`Connected and subscribed to topics`);
      setSubscribedTopics(topicsArray);
      setPublishTopic(topicsArray[0]);
    });

    client.on("message", (topic, message) => {
      const newMessage: MqttMessage = {
        topic,
        message: message.toString(),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [newMessage, ...prev]);
    });

    client.on("error", (err) => {
      addLog("Connection error: " + err.message);
      toast.error("Connection error");
      setIsConnected(false);
    });

    setMqttClient(client);
  };

  const handleDisconnect = () => {
    if (mqttClient) {
      mqttClient.end(() => {
        setIsConnected(false);
        setSubscribedTopics([]);
        setPublishTopic("");
        toast.success("Disconnected");
        addLog("Disconnected from MQTT broker");
      });
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem("mqttMessages");
    toast.info("Message history cleared");
  };

  const handlePublish = () => {
    if (!publishMessage.trim()) {
      toast.error("Please enter a message to publish");
      return;
    }
    if (!isConnected || !mqttClient) {
      toast.error("Not connected to any broker");
      return;
    }
    if (!publishTopic.trim()) {
      toast.error("Please select a topic to publish to");
      return;
    }
    mqttClient.publish(publishTopic, publishMessage, {}, (err) => {
      if (err) {
        toast.error("Failed to publish message");
        addLog("Failed to publish message: " + err.message);
      } else {
        toast.success("Message published successfully");
        addLog("Message published to " + publishTopic + ": " + publishMessage);
        setPublishMessage("");
      }
    });
  };

  // Handle changes from the server dropdown
  const handleServerSelect = (label: string) => {
    setSelectedServer(label);
    const selected = MQTT_SERVERS.find((srv) => srv.label === label);
    if (selected) {
      // If Custom is selected, let the user edit the input. Otherwise, update the server URL immediately.
      if (selected.label !== "Custom") {
        setMqttServer(selected.url);
      } else {
        setMqttServer("");
      }
    }
  };

  return (
    <div className="m-2">
      <Card className="flex flex-1 justify-center items-center dark">
        <CardHeader>
          <h3 className="font-bold text-large">DHT11 Monitor</h3>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="flex flex-col gap-2 mb-4">
            <Select className="dark "
              label="Select MQTT Server"
              value={selectedServer}
              onChange={(e) => handleServerSelect(e.target.value)}
            >
              {MQTT_SERVERS.map((server) => (
                <SelectItem key={server.label} value={server.label} className="bg-black">
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
                className="w-full"
              />
            )}
            {selectedServer !== "Custom" && (
              <Input
                type="text"
                label="MQTT Server URL"
                value={mqttServer}
                className="w-full"
                isDisabled
              />
            )}
            <Input
              type="text"
              label="MQTT Topics (comma separated)"
              value={topicsInput}
              onChange={(e) => setTopicsInput(e.target.value)}
              className="w-full"
              isDisabled={isConnected}
            />
            <div className="flex gap-2">
              <Button
                color={isConnected ? "danger" : "primary"}
                onClick={isConnected ? handleDisconnect : handleConnect}
              >
                {isConnected ? "Disconnect" : "Connect"}
              </Button>
              <Button color="warning" onClick={clearHistory}>
                Clear History
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <Input
              type="text"
              label="Message to Publish"
              value={publishMessage}
              onChange={(e) => setPublishMessage(e.target.value)}
              className="w-full"
              isDisabled={!isConnected}
            />
            {isConnected && subscribedTopics.length > 0 && (
              <Select
                label="Select Publish Topic"
                value={publishTopic}
                onChange={(e) => setPublishTopic(e.target.value)}
              >
                {subscribedTopics.map((topic) => (
                  <SelectItem key={topic} value={topic}>
                    {topic}
                  </SelectItem>
                ))}
              </Select>
            )}
            <Button
              color="primary"
              onClick={handlePublish}
              isDisabled={!isConnected}
            >
              Publish
            </Button>
          </div>

          <Input
            type="text"
            label="Search Messages"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full mb-4"
          />

          <Input
            type="number"
            label="Retention Period (minutes)"
            value={retentionMinutes.toString()}
            onChange={(e) => setRetentionMinutes(Number(e.target.value))}
            className="w-full mb-4"
          />

          <Table aria-label="MQTT Messages" className="mt-4">
            <TableHeader>
              <TableColumn>TOPIC</TableColumn>
              <TableColumn>MESSAGE</TableColumn>
              <TableColumn>TIMESTAMP</TableColumn>
              <TableColumn>STATUS</TableColumn>
            </TableHeader>
            <TableBody>
              {messages
                .filter((msg) => {
                  const matchesTopic =
                    subscribedTopics.length === 0 ||
                    subscribedTopics.includes(msg.topic);
                  const matchesSearch =
                    !searchTerm ||
                    msg.message
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    msg.topic.toLowerCase().includes(searchTerm.toLowerCase());
                  return matchesTopic && matchesSearch;
                })
                .map((msg, index) => (
                  <TableRow key={index}>
                    <TableCell>{msg.topic}</TableCell>
                    <TableCell>
                      {(() => {
                        try {
                          const parsed = JSON.parse(msg.message);
                          return (
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(parsed, null, 2)}
                            </pre>
                          );
                        } catch (e) {
                          return msg.message;
                        }
                      })()}
                    </TableCell>
                    <TableCell>
                      {new Date(msg.timestamp).toLocaleString()}
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

          <div className="mt-4 p-2 bg-gray-100 rounded h-40 overflow-y-auto">
            <h4 className="font-bold mb-2">Connection Logs</h4>
            {logs.map((log, idx) => (
              <div key={idx} className="text-sm text-gray-700">
                {log}
              </div>
            ))}
          </div>
        </CardBody>
        <Divider />
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-500">
            {subscribedTopics.length === 0
              ? "Showing all stored messages"
              : `Showing messages for topics: ${subscribedTopics.join(", ")}`}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MQTTPANEL;
