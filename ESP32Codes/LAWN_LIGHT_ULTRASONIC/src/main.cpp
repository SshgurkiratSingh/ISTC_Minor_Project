#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <NewPing.h>
#include <DHTesp.h>
// Ultrasonic Configuration and led config
// Define LED pins
int led_pin[4] = {21, 19, 18,5}; // Changed to pins that are general-purpose IO

// Define ultrasonic sensors
// North Ultrasonic Sensor
NewPing northUltrasonic(23, 22,500); // Pins 23 and 22 are general-purpose IO

// South Ultrasonic Sensor
NewPing southUltrasonic(25, 26,500); // Pins 25 and 26 are general-purpose IO

NewPing TankSensor(32, 33,200);
#define TANKSIZE 15
#define LDR 4
int maxSize = 40;
#define CHECKNORTH (northUltrasonic.ping_cm() >= maxSize)
#define CHECKSOUTH (southUltrasonic.ping_cm() >= maxSize)

#define AIRQUALITY_PIN 34

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
int ValueOfSubScribedTopic[MAX_TOPIC] = {1, 1, 1, 1, 100, 50, 1};
#define NORTHVALUE ValueOfSubScribedTopic[0]
#define SOUTHVALUE ValueOfSubScribedTopic[1]
#define EASTVALUE ValueOfSubScribedTopic[2]
#define LIGHT4 ValueOfSubScribedTopic[3]
#define BRIGHTNESS1 ValueOfSubScribedTopic[4]
#define LOWVALUE ValueOfSubScribedTopic[5]
#define AUTONOMOUSLIGHTING ValueOfSubScribedTopic[6]

const String Topic_TO_Publish[2] = {
    "IoT/lawn/temperature",
    "IoT/lawn/humidity",
};
const char *mqtt_server = "ec2-35-170-242-83.compute-1.amazonaws.com";
//----------------------------Wifi Config --------------------------------
char SSID[15] = "ConForNode1";
char PASSWORD[15] = "12345678";
// --------------------------Instances ------------------------------------
WiFiClient wifi;
PubSubClient client(wifi);
#define DEBUG_MODE 1
int waterLevel = 0;
/**
 * Updates the water level based on the distance to the water.
 *
 * @throws None
 */
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
/**
 * Updates the temperature and humidity values.
 *
 * @return void
 */
unsigned long previousMillis = 0;
const long interval = 15000;  // 15 seconds

void updateTempHum()
{
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= interval)
  {
    previousMillis = currentMillis;

    float t = dht.getTemperature();
    float h = dht.getHumidity();

    if (!(isnan(t) || isnan(h) || t == 0 || h == 0))
    {
      if ((temp != t) || (hum != h))
      {
        temp = t;
        hum = h;
        Serial.println("Update detected");

        client.publish(Topic_TO_Publish[0].c_str(), String(temp).c_str(), true);
        client.publish(Topic_TO_Publish[1].c_str(), String(hum).c_str(), true);
        client.publish("IoT/lawn/airQuality", String(analogRead(AIRQUALITY_PIN)).c_str(), true);
        client.publish("IoT/entrance/lightIntensity", String(analogRead(LDR)/4).c_str(), true);
        
      }
    }
  }
}


/**
 * Initializes the setup for the program.
 *
 * @return void
 *
 * @throws None
 */
void setup()
{
  pinMode(LDR, INPUT);
  dht.setup(DHTPIN, DHTesp::DHT22);
  pinMode(AIRQUALITY_PIN, INPUT);
  // put your setup code here, to run once:
  Serial.begin(115200);
  WiFi.begin(SSID, PASSWORD);
 uint8_t i = 0;
    while (WiFi.status() != WL_CONNECTED)
    {

#if DEBUG_MODE
        Serial.println("Connecting to WiFi..");
#endif
     
        delay(1000);
        i++;
        if (i > 12)
        {
            break;
        }
    }

  // Serial.println("Connected to the WiFi network");
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
  for (int i = 0; i < 3; i++)
  {
    pinMode(led_pin[i], OUTPUT);
  }
}


/**
 * The `loop` function is responsible for executing the main logic of the program in a continuous loop.
 *
 * @return void
 */
void loop()
{
  Serial.print("distance by ultrasonic 1: ");
  Serial.println(northUltrasonic.ping_cm());
   Serial.print("distance by ultrasonic 2: ");
   Serial.println(southUltrasonic.ping_cm());
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
  analogWrite(led_pin[3], BRIGHTNESS1 * 2.55 * LIGHT4);
  updateTempHum();
  updateWaterLevel();
}
