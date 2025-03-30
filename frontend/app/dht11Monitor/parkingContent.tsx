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

const ParkingContent = () => {
  const [slotAvailable, setSlotAvailable] = useState(
    Math.floor(Math.random() * 6)
  );
  const [mqttClient, setMqttClient] = useState<mqtt.MqttClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentTopic, setCurrentTopic] = useState(() => {
    const savedTopic = localStorage.getItem("currentTopic");
    return savedTopic || "";
  });
  const [mqttServer, setMqttServer] = useState(() => {
    const savedServer = localStorage.getItem("mqttServer");
    return savedServer || "ws://test.mosquitto.org:8080";
  });
  const [messages, setMessages] = useState<MqttMessage[]>(() => {
    const savedMessages = localStorage.getItem("mqttMessages");
    return savedMessages ? JSON.parse(savedMessages) : [];
  });

  // Save current topic and server to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("currentTopic", currentTopic);
  }, [currentTopic]);

  useEffect(() => {
    localStorage.setItem("mqttServer", mqttServer);
  }, [mqttServer]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("mqttMessages", JSON.stringify(messages));
  }, [messages]);

  // Cleanup MQTT connection on component unmount
  useEffect(() => {
    return () => {
      if (mqttClient) {
        mqttClient.end();
      }
    };
  }, [mqttClient]);

  const handleConnect = () => {
    if (!currentTopic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    if (!mqttServer.trim()) {
      toast.error("Please enter an MQTT server URL");
      return;
    }

    if (isConnected) {
      handleDisconnect();
    }

    const client = mqtt.connect(mqttServer);

    client.on("connect", () => {
      setIsConnected(true);
      client.subscribe(currentTopic, (err) => {
        if (err) {
          toast.error("Failed to subscribe");
          client.end();
          setIsConnected(false);
        } else {
          toast.success(`Connected to ${currentTopic}`);
        }
      });
    });

    client.on("message", (topic, message) => {
      const newMessage: MqttMessage = {
        topic,
        message: message.toString(),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [newMessage, ...prev]);
    });

    client.on("error", () => {
      toast.error("Connection error");
      setIsConnected(false);
    });

    setMqttClient(client);
  };

  const handleDisconnect = () => {
    if (mqttClient) {
      mqttClient.end(() => {
        setIsConnected(false);
        setCurrentTopic("");
        toast.success("Disconnected");
      });
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem("mqttMessages");
    toast.info("Message history cleared");
  };

  return (
    <div className="m-2">
      <Card className="flex flex-1 justify-center items-center dark">
        <CardHeader>
          <h3 className="font-bold text-large">Smart City Parking</h3>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="flex flex-col gap-2 mb-4">
            <Input
              type="text"
              label="MQTT Server URL"
              value={mqttServer}
              onChange={(e) => setMqttServer(e.target.value)}
              className="w-full"
              isDisabled={isConnected}
            />
            <Input
              type="text"
              label="MQTT Topic"
              value={currentTopic}
              onChange={(e) => setCurrentTopic(e.target.value)}
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

          <Table aria-label="MQTT Messages" className="mt-4">
            <TableHeader>
              <TableColumn>TOPIC</TableColumn>
              <TableColumn>MESSAGE</TableColumn>
              <TableColumn>TIMESTAMP</TableColumn>
              <TableColumn>STATUS</TableColumn>
            </TableHeader>
            <TableBody>
              {messages
                .filter((msg) => !currentTopic || msg.topic === currentTopic)
                .map((msg, index) => (
                  <TableRow key={index}>
                    <TableCell>{msg.topic}</TableCell>
                    <TableCell>{msg.message}</TableCell>
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
        </CardBody>
        <Divider />
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-500">
            {!currentTopic
              ? "Showing all stored messages"
              : `Showing messages for topic: ${currentTopic}`}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ParkingContent;
// This code is a React component that connects to an MQTT broker, subscribes to a topic, and displays messages in a table format. It also allows the user to connect/disconnect from the broker, clear message history, and manage MQTT server and topic settings.