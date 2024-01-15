#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <NewPing.h>
// ----------------------------- Configurations -------------------------------------//
#define WIFI_SSID "ConForNode1"
#define WIFI_PASSWORD "12345678"
#define MQTT_SERVER "ec2-35-170-242-83.compute-1.amazonaws.com"
#define MQTT_PORT 1883
WiFiClient espClient;
int maxSize = 40;
int led_pin[3] = {D6, D7, D8};
PubSubClient client(espClient);
// Ultrasonic Config
NewPing northUltrasonic(D2, D3,300); 
// South Ultrasonic Sensor
NewPing southUltrasonic(D4, D5,500);
// ----------------------------- Tank Config -------------------------------------//
NewPing TankSensor(D0, D1,200);
#define TANKSIZE 15
int waterLevel = 0;
unsigned long lastTime = 0;
unsigned long timerDelay = 8000;
void updateWaterLevel() {
  int distanceToWater = TankSensor.ping_cm();
  int waterDepth = TANKSIZE - distanceToWater;
  waterLevel = (waterDepth * 100) / TANKSIZE;
  Serial.print("Water Level: ");
    Serial.println(waterLevel);
    // publish every 5 seconds
if (millis() - lastTime >= timerDelay) {
    lastTime = millis();
    client.publish("IoT/auxiliary/tankLevel", String(waterLevel).c_str(), true);
  }
   
}
#define MAX_TOPIC 7

// ----------------------------- Other Config -------------------------------------//
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
#define LIGHT4 ValueOfSubScribedTopic[3]
#define BRIGHTNESS1 ValueOfSubScribedTopic[4]
#define LOWVALUE ValueOfSubScribedTopic[5]
#define AUTONOMOUSLIGHTING ValueOfSubScribedTopic[6]
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
#define DEBUG_MODE 1
void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("WiFi connected");

client.setServer(MQTT_SERVER, MQTT_PORT);
  client.setCallback(callback);

 for (int i = 0; i < 3; i++)
  {
    pinMode(led_pin[i], OUTPUT);
  }
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
}
#define CHECKNORTH (northUltrasonic.ping_cm() >= maxSize)
#define CHECKSOUTH (southUltrasonic.ping_cm() >= maxSize)
void loop() {
 client.loop();
 updateWaterLevel();
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
      analogWrite(led_pin[2], BRIGHTNESS1 * 2.55 * EASTVALUE);
    delay(500);
  }
  else
  {
    analogWrite(led_pin[0], BRIGHTNESS1 * 2.55 * NORTHVALUE);
    analogWrite(led_pin[1], BRIGHTNESS1 * 2.55 * SOUTHVALUE);
    analogWrite(led_pin[2], BRIGHTNESS1 * 2.55 * EASTVALUE);
    
    delay(500);
  }
}
