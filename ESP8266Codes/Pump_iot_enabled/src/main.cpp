#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <NewPing.h>
// ---------------------------Pin Config----------------------------------------//
#define TRIGGER_PIN D5
#define ECHO_PIN D4
const uint8_t statusLedPin[4] = {D0, D1, D2, D3};
NewPing sensor(TRIGGER_PIN, ECHO_PIN, 300);
const int RelayPin = D6;
int buttonPin = D7;

// Tank Setup
#define TANK_HEIGHT 300
int levelToFill = TANK_HEIGHT - 30;
int currentLevel = 0;
bool pumpOn = false;

// -----------------------------Wifi Config-------------------------------------//
#define WIFI_SSID "ConForNode1"
#define WIFI_PASSWORD "12345678"
WiFiClient esp;

// -----------------------------MQTT Config-------------------------------------//
#define MQTT_SERVER "ec2-3-88-49-62.compute-1.amazonaws.com"
#define MQTT_PORT 1883
PubSubClient client(esp);
/**
 * Displays the tank level by turning on LEDs according to the current level.
 *
 * @param None
 *
 * @return None
 *
 * @throws None
 */
void displayTankLevel()
{
  // turn led on according to tank level
  for (int i = 0; i < 4; i++)
  {
    if (currentLevel > i * 25)
    {
      digitalWrite(statusLedPin[i], HIGH);
    }
    else
    {
      digitalWrite(statusLedPin[i], LOW);
    }
  }
}
void callback(char *topic, byte *payload, unsigned int length)
{
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++)
  {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}
void setup()
{
  Serial.begin(9600);
  pinMode(RelayPin, OUTPUT);
  pinMode(statusLedPin[0], OUTPUT);
  pinMode(statusLedPin[1], OUTPUT);
  pinMode(statusLedPin[2], OUTPUT);
  pinMode(statusLedPin[3], OUTPUT);
  pinMode(buttonPin, INPUT);
  digitalWrite(RelayPin, LOW);
  digitalWrite(statusLedPin[0], LOW);
  digitalWrite(statusLedPin[1], LOW);
  digitalWrite(statusLedPin[2], LOW);
  digitalWrite(statusLedPin[3], LOW);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}

void loop()
{
  if (digitalRead(buttonPin) == LOW)
  {
    pumpOn = !pumpOn;
    delay(300);
  }
  currentLevel = sensor.ping_cm();
  displayTankLevel();
  if (pumpOn)
  {
    digitalWrite(RelayPin, HIGH);
  }
  else
  {
    digitalWrite(RelayPin, LOW);
  }
  client.loop();
}
