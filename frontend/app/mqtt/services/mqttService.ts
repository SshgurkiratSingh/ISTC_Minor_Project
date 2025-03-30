// services/mqttService.ts
import { Client, Message } from "paho-mqtt";

export type MqttMessage = {
  topic: string;
  message: string;
  timestamp: string;
};

export type TopicDataPoint = {
  timestamp: Date;
  value: number;
};

export type TopicData = {
  [topic: string]: TopicDataPoint[];
};

export const parseBrokerUrl = (url: string) => {
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

export const createMqttClient = (
  mqttServer: string,
  onConnectionLost: (response: { errorCode: number; errorMessage: string }) => void,
  onMessageArrived: (message: Message) => void
) => {
  const { host, port, path } = parseBrokerUrl(mqttServer);
  const clientId = `web-client-${Math.random().toString(16).substr(2, 8)}`;
  const client = new Client(host, port, path, clientId);

  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;
  return client;
};

export const publishMessage = (
  client: Client,
  topic: string,
  payload: string
) => {
  const message = new Message(payload);
  message.destinationName = topic;
  message.qos = 1;
  message.retained = false;
  client.send(message);
};
