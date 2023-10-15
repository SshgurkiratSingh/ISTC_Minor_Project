/*
Author: Gurkirat Singh <gurkirat7092@yahoo.com>
Date: Oct 15, 2023
Description:
This code monitor the water tank level,light intensity using ldr,lawn temperature humidity,air quality using dht22 and publish it to MQTT
*/
#include <Arduino.h>
#include <PubSubClient.h>
#include <DHTesp.h>
#include <NewPingESP8266.h>
#include <ESP8266WiFi.h>

// -----------------------------Pin Config-------------------------------------//
#define Trigger D0
#define Echo D1
#define DHT_PIN D2
#define AIR_QUALITY A0
#define TANK_PUMP D3
#define LAWN_PUMP D4
#define ENTRANCE_LIGHT D5

// -----------------------------Wifi Config-------------------------------------//
#define WIFI_SSID "ConForNode1"
#define WIFI_PASSWORD "12345678"
WiFiClient esp;

// -----------------------------MQTT Config-------------------------------------//
#define MQTT_SERVER "ec2-3-88-49-62.compute-1.amazonaws.com"
#define MQTT_PORT 1883
PubSubClient client(esp);
// -----------------------------Other Config-------------------------------------//
#define DEBUG_MODE 1
String topicToSubscribe[3] = {
    "IoT/entrance/light1",
    "IoT/lawn/pump1",
    "IoT/auxiliary/pump1",
};
bool topicStatus[3] = {0, 0, 0};
// -----------------------------Global Variables--------------------------------//
NewPingESP8266 tankMonitor(Trigger, Echo, 100);
DHTesp dht;

int waterLevel = 0;
#define WaterTankSize 20
int humidity = 0;
int temperature = 0;
int air_quality = 0;

// -----------------------------Callback Declarations---------------------------//
void callback(char *topic, byte *payload, unsigned int length)
{
  String receivedTopic = String(topic);
#ifdef DEBUG_MODE
  Serial.print("Message arrived [");
  Serial.print(receivedTopic);
  Serial.print("] ");
#endif
  String msg;
  String payloadString = String((char *)payload);
  int value = payloadString.toInt();
  for (int i = 0; i < 3; i++)
  {
    if (topicToSubscribe[i] == receivedTopic)
    {
      topicStatus[i] = value;
    }
  }
}
void reconnectMQTT()
{
  // Loop until
  while (!client.connected())
  {
#if DEBUG_MODE
    Serial.print("Attempting MQTT connection...");
#endif
    // Attempt to connect
    if (client.connect("esp82661"))
    {
#if DEBUG_MODE
      Serial.println("connected");
#endif
      for (u_int8_t i = 0; i < 3; i++)
      {
        client.subscribe(topicToSubscribe[i].c_str());
      }
    }
    else
    {
#if DEBUG_MODE
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
#endif
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void setup()
{
#ifdef DEBUG_MODE
  Serial.begin(115200);
#endif
  pinMode(ENTRANCE_LIGHT, OUTPUT);
  pinMode(TANK_PUMP, OUTPUT);
  pinMode(LAWN_PUMP, OUTPUT);
  pinMode(AIR_QUALITY, INPUT);

  digitalWrite(ENTRANCE_LIGHT, LOW);
  digitalWrite(TANK_PUMP, LOW);
  digitalWrite(LAWN_PUMP, LOW);
  dht.setup(DHT_PIN, DHTesp::DHT22);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
#ifdef DEBUG_MODE
    Serial.println("Connecting to WiFi..");
#endif
  }
  client.setServer(MQTT_SERVER, MQTT_PORT);
  client.setCallback(callback);
  reconnectMQTT();
  for (u_int8_t i = 0; i < 3; i++)
  {
    client.subscribe(topicToSubscribe[i].c_str());
  }
}
void updateOutput()
{
  digitalWrite(ENTRANCE_LIGHT, topicStatus[0]);
  digitalWrite(LAWN_PUMP, topicStatus[1]);
  digitalWrite(TANK_PUMP, topicStatus[2]);
}
void checkAndUpdate()
{
  int tempTank = tankMonitor.ping_cm();
  if (tempTank != waterLevel)
  {
    client.publish("IoT/auxiliary/tankLevel", String((tempTank / WaterTankSize) * 100).c_str());
    waterLevel = tempTank;
  }
  int tempHumidity = dht.getHumidity();
  if (tempHumidity != humidity)
  {
    client.publish("IoT/lawn/humidity", String(tempHumidity).c_str());
    humidity = tempHumidity;
  }
  int tempTemperature = dht.getTemperature();
  if (tempTemperature != temperature)
  {
    client.publish("IoT/lawn/temperature", String(tempTemperature).c_str());
    temperature = tempTemperature;
  }
  int tempAirQuality = analogRead(AIR_QUALITY);
  if (tempAirQuality != air_quality)
  {
    client.publish("IoT/lawn/airQuality", String(tempAirQuality).c_str());
    air_quality = tempAirQuality;
  }
}
void loop()
{
  client.loop();
  if (!client.connected())
  {
    reconnectMQTT();
  }
  updateOutput();
  checkAndUpdate();
}
