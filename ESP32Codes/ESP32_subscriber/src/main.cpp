/*
Author: Gurkirat Singh <gurkirat7092@yahoo.com>
Date: Oct 2, 2023
Description:
This code establishes a connection between an ESP32 module and an MQTT broker to control lights,
 a switchboard, and a fan via MQTT messages.
 It utilizes the PubSubClient library for MQTT communication and the LEDC library for PWM control,
 subscribing to specific MQTT topics to receive control commands.
  On receiving a message, it processes the payload to toggle states or adjust PWM values, controlling the connected hardware.
  DEBUG_MODE is a toggle to enable/disable debug messages.
  */

#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
WiFiClient wifi;
PubSubClient client(wifi);
#define SSID "Node "
#define PASSWORD "whyitellyou"
#define MQTT_SERVER "ec2-3-88-49-62.compute-1.amazonaws.com"
#define MQTT_PORT 1883
/*                      Debug Configurations                             */
#define DEBUG_MODE 1
/*                      Toggle Configurations                             */
#define totalTogglesTopics 2
String toggleTopics[totalTogglesTopics] = {"IoT/room1/light1", "IoT/room1/switchBoard1"};
bool toggleStates[totalTogglesTopics] = {0, 0};
uint8_t togglePins[totalTogglesTopics] = {23, 22};

/*                       PWM control Configurations                              */
#define totalPWMControlTopics 1
String PWMControlTopics[totalPWMControlTopics] = {"IoT/room1/fan1"};
uint8_t PWMControlStates[totalPWMControlTopics] = {0};
uint8_t PWMControlPins[totalPWMControlTopics] = {19};
/*                       Light brightness control Configurations                              */
#define totalLightControlTopics 1
String LightControlTopics[totalLightControlTopics] = {"IoT/room1/light2"};
bool LightControlStates[totalLightControlTopics] = {0};
uint8_t LightControlPins[totalLightControlTopics] = {18};
String LightBrightnessTopic[totalLightControlTopics] = {"IoT/room1/brightness1"};
uint8_t LightBrightnessStates[totalLightControlTopics] = {0};
/**
 * Callback function for handling MQTT messages.
 *
 * @param topic The topic of the message.
 * @param payload The payload of the message.
 * @param length The length of the payload.
 */
void callback(char *topic, byte *payload, unsigned int length)
{
  // Convert topic to string
  String receivedTopic = String(topic);

  // Null-terminate the payload
  payload[length] = '\0';

  // Parse payload to integer value
  String payloadString = String((char *)payload);
  int value = payloadString.toInt();

#if DEBUG_MODE
  // Print topic and payload for debugging
  Serial.println(topic);
  Serial.println(payloadString);
#endif

  // Handle toggle topics
  for (int i = 0; i < totalTogglesTopics; i++)
  {
    if (receivedTopic == toggleTopics[i])
    {
      // Update toggle state
      toggleStates[i] = value;

      // Set digital output pin
      digitalWrite(togglePins[i], toggleStates[i]);
      return;
    }
  }

  // Handle PWM control topics
  for (int i = 0; i < totalPWMControlTopics; i++)
  {
    if (receivedTopic == PWMControlTopics[i])
    {
      // Update PWM control state
      PWMControlStates[i] = value;

      // Set LEDC output
      ledcWrite(i + totalLightControlTopics, PWMControlStates[i]);
      return;
    }
  }

  // Handle light control topics
  for (int i = 0; i < totalLightControlTopics; i++)
  {
    if (receivedTopic == LightControlTopics[i])
    {
      // Update light control state
      LightControlStates[i] = value;

      // Set LEDC output with brightness
      ledcWrite(i, LightControlStates[i] * LightBrightnessStates[i]);
      return;
    }
  }

  // Handle light brightness topics
  for (int i = 0; i < totalLightControlTopics; i++)
  {
    if (receivedTopic == LightBrightnessTopic[i])
    {
      // Update light brightness state
      LightBrightnessStates[i] = value;

      // Set LEDC output with brightness
      ledcWrite(i, LightControlStates[i] * LightBrightnessStates[i]);
      return;
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
    if (client.connect("ESP32Client1"))
    {
#if DEBUG_MODE
      Serial.println("connected");
#endif
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
#if DEBUG_MODE
  Serial.begin(115200);
#endif

  WiFi.begin(SSID, PASSWORD);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(1000);
#if DEBUG_MODE
    Serial.println("Connecting to WiFi..");
#endif
  }

  client.setServer(MQTT_SERVER, MQTT_PORT);
  client.setCallback(callback);

  // Ensure MQTT is connected before subscribing
  reconnectMQTT();

  for (int i = 0; i < totalTogglesTopics; i++)
  {
    client.subscribe(toggleTopics[i].c_str());
    pinMode(togglePins[i], OUTPUT);
    digitalWrite(togglePins[i], toggleStates[i]);
  }

  for (int i = 0; i < totalLightControlTopics; i++)
  {
    client.subscribe(LightBrightnessTopic[i].c_str());
    ledcSetup(i, 2000, 8);
    ledcAttachPin(LightControlPins[i], i);
    client.subscribe(LightControlTopics[i].c_str());
    ledcWrite(i, LightControlStates[i] * LightBrightnessStates[i] * 2.5);
  }

  for (int i = 0; i < totalPWMControlTopics; i++)
  {
    client.subscribe(PWMControlTopics[i].c_str());
    ledcSetup(i + totalLightControlTopics, 5000, 8);
    ledcAttachPin(PWMControlPins[i], i + totalLightControlTopics);
    ledcWrite(i + totalLightControlTopics, PWMControlStates[i]);
  }
}

void loop()
{
  if (!client.connected())
  {
    reconnectMQTT();
  }
  client.loop();
}
