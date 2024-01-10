#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <NewPing.h>
#include <DHTesp.h>
// Ultrasonic Configuration and led config
// Define LED pins
int led_pin[4] = {21, 19, 18, 5}; // Changed to pins that are general-purpose IO

// Define ultrasonic sensors
// North Ultrasonic Sensor
NewPing northUltrasonic(23, 22); // Pins 23 and 22 are general-purpose IO

// South Ultrasonic Sensor
NewPing southUltrasonic(25, 26); // Pins 25 and 26 are general-purpose IO

// East Ultrasonic Sensor
NewPing eastUltrasonic(17, 16); // Pins 17 and 16 are general-purpose IO

// West Ultrasonic Sensor
NewPing westUltrasonic(13, 14); // Pins 13 and 14 are general-purpose IO
int maxSize = 40;
#define CHECKNORTH (northUltrasonic.ping_cm() >= maxSize)
#define CHECKSOUTH (southUltrasonic.ping_cm() >= maxSize)
#define CHECKEAST (eastUltrasonic.ping_cm() >= maxSize)
#define CHECKWEST (westUltrasonic.ping_cm() >= maxSize)
#define DHTPIN 27 // Assigning GPIO 27 for DHT22
DHTesp dht;
//-------------------------- MQTT CONFIG---------------------------------
#define MAX_TOPIC 7
const String Topic_TO_Subscribe[MAX_TOPIC] = {
    "IoT/lawn/light1",
    "IoT/lawn/light2",
    "IoT/lawn/light3",
    "IoT/lawn/light4",
    "IoT/lawn/brightness1",
    "IoT/lawn/brightness2",
    "IoT/lawn/autonomousLighting",
};
int ValueOfSubScribedTopic[MAX_TOPIC] = {0, 0, 0, 0, 0, 0, 0};
#define NORTHVALUE ValueOfSubScribedTopic[0]
#define SOUTHVALUE ValueOfSubScribedTopic[1]
#define EASTVALUE ValueOfSubScribedTopic[2]
#define WESTVALUE ValueOfSubScribedTopic[3]
#define BRIGHTNESS1 ValueOfSubScribedTopic[4]
#define BRIGHTNESS2 ValueOfSubScribedTopic[5]
#define AUTONOMOUSLIGHTING ValueOfSubScribedTopic[6]

const String Topic_TO_Publish[2] = {
    "IoT/lawn/temperature",
    "IoT/lawn/humidity",
};
const char *mqtt_server = "ec2-35-170-242-83.compute-1.amazonaws.com";
//----------------------------Wifi Config --------------------------------
char SSID[15] = "Node ";
char PASSWORD[15] = "whyitellyou";
// --------------------------Instances ------------------------------------
WiFiClient wifi;
PubSubClient client(wifi);
#define DEBUG_MODE 1
/**
 * A callback function that handles incoming messages from a subscribed topic.
 *
 * @param topic The topic of the incoming message.
 * @param payload The payload of the incoming message.
 * @param length The length of the payload.
 *
 * @throws None
 */
void callback(char *topic, byte *payload, unsigned int length)
{

  String message;

  for (int i = 0; i < length; i++)
  {
    message += (char)payload[i];
  }
#if DEBUG_MODE
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  Serial.println(message);
#endif
  for (int i = 0; i < MAX_TOPIC; i++)
  {
    if (String(Topic_TO_Subscribe[i]) == String(topic))
    {

      // For topics that can have other values
      ValueOfSubScribedTopic[i] = message.toInt();
      break;
    }
  }
}
int temp = 0;
int hum = 0;
void updateTempHum()
{
  float t = dht.getTemperature();
  float h = dht.getHumidity();

  if (isnan(t) || isnan(h) || t == 0 || h == 0)
  {
    return;
  }
  else
  {

    if ((temp != t) || (hum != h))
    {
      temp = t;
      hum = h;
      Serial.println("updatte detected");

      client.publish(Topic_TO_Publish[0].c_str(), String(temp).c_str(), true);
      client.publish(Topic_TO_Publish[1].c_str(), String(hum).c_str(), true);
    }
  }
}

void setup()
{
  dht.setup(DHTPIN, DHTesp::DHT22);
  // put your setup code here, to run once:
  Serial.begin(115200);
  WiFi.begin(SSID, PASSWORD);
  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.println("Connecting to WiFi..");
    delay(1000);
  }
  Serial.println("Connected to the WiFi network");
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
  if (client.connect("lawnNode"))
  {

#if DEBUG_MODE
    Serial.println("connected");
#endif
    for (int i = 0; i < MAX_TOPIC; i++)
    {
#if DEBUG_MODE
      Serial.print("Subscribing to: ");
      Serial.println(Topic_TO_Subscribe[i]);
#endif
      client.subscribe((Topic_TO_Subscribe[i]).c_str());
    }
  }
  // declare led pins as outputs
  for (int i = 0; i < 4; i++)
  {
    pinMode(led_pin[i], OUTPUT);
  }
}
#define LOWVALUE 20
void debugLEDS()
{
  for (int i = 0; i < 4; i++)
  {
    Serial.println(digitalRead(led_pin[i]));
  }
}
void loop()
{
  client.loop();
  if (AUTONOMOUSLIGHTING)
  {
    if (CHECKNORTH)
    {
      analogWrite(led_pin[0], LOWVALUE);
    }
    else
    {
      analogWrite(led_pin[0], BRIGHTNESS1 * 2.55 * NORTHVALUE);
    }

    if (CHECKSOUTH)
    {
      analogWrite(led_pin[1], LOWVALUE);
    }
    else
    {
      analogWrite(led_pin[1], BRIGHTNESS1 * 2.55 * SOUTHVALUE);
    }
    if (CHECKEAST)
    {
      analogWrite(led_pin[2], LOWVALUE);
    }
    else
    {
      analogWrite(led_pin[2], BRIGHTNESS2 * 2.55 * EASTVALUE);
    }
    if (CHECKWEST)
    {
      analogWrite(led_pin[3], LOWVALUE);
    }
    else
    {
      analogWrite(led_pin[3], BRIGHTNESS2 * 2.55 * WESTVALUE);
    }
    delay(500);
  }
  else
  {
    analogWrite(led_pin[0], BRIGHTNESS1 * 2.55 * NORTHVALUE);
    analogWrite(led_pin[1], BRIGHTNESS1 * 2.55 * SOUTHVALUE);
    analogWrite(led_pin[2], BRIGHTNESS2 * 2.55 * EASTVALUE);
    analogWrite(led_pin[3], BRIGHTNESS2 * 2.55 * WESTVALUE);
    delay(500);
  }
  debugLEDS();
  updateTempHum();
}
